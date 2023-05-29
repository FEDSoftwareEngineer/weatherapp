import { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
//sub component to show time
import Clock from "./Clock";
import Loading from "./Loading";

interface city {
  time: string[];
  temperature_2m: number[];
}

export default function Home() {
  //initial data
  const [data, setData] = useState<string[][]>();
  const [cityData, setCityData] = useState<city>();
  const [color, setColor] = useState<string[]>();
  const [cityName, setCityName] = useState<string>("");
  const [countryName, setCountryName] = useState<string>("");
  const [info, setInfo] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [countryList, setCountryList] = useState<string[]>([]);
  const [cityList, setCityList] = useState<string[]>([]);
  const [countryCode, setCountryCode] = useState<string>("");
  const [darkmode, setDarkmode] = useState<boolean>(true);
  const [aspect, setAspect] = useState<number>(2.2);

  //color functionalit
  const getCity = (value: string) => {
    if (data) {
      const city: string[] | undefined = data.find((item) =>
        item.includes(value)
      );
      if (city) {
        return city;
      }
    }
    return [];
  };
  const getColor = (value: number): string => {
    if (value >= 50) return "rgb(49, 0, 39)";
    if (value < 50 && value >= 40) return "rgb(77, 0, 38)";
    if (value < 40 && value >= 35) return "rgb(121, 0, 26)";
    if (value < 35 && value >= 30) return "red";
    if (value < 30 && value >= 25) return "#ffb800";
    if (value < 25 && value >= 20) return "rgb(168, 197, 0)";
    if (value < 20 && value >= 15) return "green";
    if (value < 15 && value >= 10) return "rgb(0, 171, 184)";
    if (value < 10 && value >= 0) return "rgb(0, 133, 185)";
    if (value < 0 && value >= -20) return "rgb(2, 0, 107)";
    if (value < -20) return "rgb(1, 0, 22)";
    return "";
  };

  //getting data and api
  const initialData = (): void => {
    setCountryCode("IR");
    setCountryName("Iran");
    setCityName("Tehran");
    setInfo(getCity("Tehran"));
  };
  const getData = async (): Promise<void> => {
    try {
      const response: Response = await fetch("/worldcities.csv");
      const textData: string = await response.text();
      const rows: string[] = textData.split("\n");
      const data: string[][] = rows.map((row) =>
        row.split(",").map((cell) => cell.replace(/^"|"$/g, ""))
      );
      setData(data);
      let countries: Set<string> = new Set();
      data.forEach((item) => {
        countries.add(item[4]);
      });
      setCountryList(Array.from(countries).sort());
    } catch (err) {
      console.log(err);
    }
  };
  const getCityData = async (): Promise<void> => {
    try {
      if (info.length !== 0) {
        const lat: number = parseFloat(info[2]);
        const lon: number = parseFloat(info[3]);
        setCountryName(info[4]);
        const response: Response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m`
        );
        const Data: any = await response.json();
        let time: string[] = Data.hourly.time.map(
          (date: string) => date.split("T")[1]
        );
        let data: city = {
          time: time.slice(0, 24),
          temperature_2m: Data.hourly.temperature_2m.slice(0, 24),
        };
        let backgroundcolor: string[] = data.temperature_2m.map((item) =>
          getColor(item)
        );
        setColor(backgroundcolor);
        setCityData(data);
        setIsLoading(false);
        setCountryCode(info[5]);
      }
    } catch (err) {
      console.log("this is the tryCatch error:", err);
    }
  };

  //updating city and country list
  const updateLists = (): void => {
    if (data) {
      const city: string[][] = data.filter((item) =>
        item.includes(countryName)
      );
      if (city) {
        setCityName(city[0][0]);
        const list: string[] = city.map((item) => item[0]);
        setCityList(list.sort());
      }
    }
  };

  //resize event listener

  useEffect(() => {
    if (window !== undefined) {
      window.innerWidth < 600 ? setAspect(1.3) : setAspect(2.2);
      window.addEventListener("resize", () => {
        window.innerWidth < 600 ? setAspect(1.3) : setAspect(2.2);
        console.log(window.innerWidth);
      });
    }
  }, []);
  //dark mode detectors

  useEffect(() => {
    if (window !== undefined) {
      if (darkmode) {
        window.document.documentElement.classList.add("dark");
      } else {
        window.document.documentElement.classList.remove("dark");
      }
    }
  }, [darkmode]);
  //getting the csv data
  useEffect(() => {
    const start = async () => {
      await getData();
      await initialData();
      await updateLists();
      await getCityData();
    };
    start();
  }, []);
  //getting 2d array of cities
  useEffect(() => {
    getCityData();
  }, [info]);

  const ctx = useRef<HTMLCanvasElement>(null);
  let myChart: Chart;

  // getting the info useEffect
  useEffect(() => {
    setInfo(getCity(cityName));
  }, [cityName]); // cityData data deleted

  //useEffect for when the country changes but the city doesnt

  useEffect(() => {
    updateLists();
  }, [countryName]);

  //chart useEffect
  useEffect(() => {
    if (info.length !== 0 && data && cityData && cityName) setIsLoading(false);
    if (ctx.current)
      myChart = new Chart(ctx.current, {
        type: "bar",
        data: {
          labels: cityData ? cityData.time : [],
          datasets: [
            {
              label: cityName + " - " + countryName,
              data: cityData ? cityData.temperature_2m : [],
              backgroundColor: color,
              borderWidth: 1,
            },
          ],
        },
        options: {
          aspectRatio: aspect,
          plugins: {
            legend: {
              labels: {
                color: darkmode ? "rgba(255,255,255,0.8)" : "",
              },
            },
          },
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                callback: (value) => value + "°",
                color: darkmode ? "rgba(255,255,255,0.8)" : "",
                font: {
                  size: 14,
                },
              },
              grid: {
                color: darkmode ? "rgba(255,255,255,0.1)" : "rgba(1,1,1,0.1)",
              },
            },
            x: {
              grid: {
                color: darkmode ? "rgba(255,255,255,0.1)" : "rgba(1,1,1,0.1)",
              },
              ticks: {
                color: darkmode ? "rgba(255,255,255,0.8)" : "",
                font: {
                  size: 14,
                },
              },
            },
          },
        },
      });
    return () => {
      if (myChart) myChart.destroy();
    };
  }, [cityData, info, darkmode, aspect]);

  if (!data || !cityList || !countryList || !cityData || !info)
    return <Loading />;
  return (
    <div className="flex flex-col my-3 md:w-[66rem] mx-auto">
      <Clock countryCode={countryCode} />
      <div className="flex justify-center sm:justify-between my-6 sm:mb-0">
        <div className="flex flex-col justify-center items-center">
          {countryList ? (
            <select
              className="block mb-1 text-md font-semibold p-1"
              name=""
              id=""
              value={countryName}
              onChange={(e) => setCountryName(e.currentTarget.value)}
            >
              {countryList.map((item, index) => (
                <option value={item} key={item + index}>
                  {item}
                </option>
              ))}
            </select>
          ) : (
            ""
          )}
          {cityList ? (
            <select
              className="block p-1"
              name=""
              id=""
              value={cityName}
              onChange={(e) => setCityName(e.currentTarget.value)}
            >
              {cityList.map((item, index) => (
                <option value={item} key={item + index}>
                  {item}
                </option>
              ))}
            </select>
          ) : (
            ""
          )}
        </div>
        <div className="text-center hidden sm:block">
          <h1>Dark Mode</h1>
          <div
            onClick={() => {
              setDarkmode(!darkmode);
            }}
            className="w-32 h-12 dark:border-slate-400 border-slate-600 border-2 rounded-3xl overflow-hidden flex cursor-pointer dark:bg-sky-400 "
          >
            <div className="w-16 h-11 bg-black rounded-full transition duration-300 dark:translate-x-16"></div>
          </div>
        </div>
      </div>

      {isLoading ? "" : <canvas id="myChart" ref={ctx}></canvas>}

      <div className="h-32 w-full flex flex-col justify-center items-center sm:hidden">
        <h1>Dark Mode</h1>
        <div
          onClick={() => {
            setDarkmode(!darkmode);
          }}
          className="w-32 h-12 dark:border-slate-400 border-slate-600 border-2 rounded-3xl overflow-hidden flex cursor-pointer dark:bg-sky-400 "
        >
          <div className="w-16 h-11 bg-black rounded-full transition duration-300 dark:translate-x-16"></div>
        </div>
      </div>
    </div>
  );
}
