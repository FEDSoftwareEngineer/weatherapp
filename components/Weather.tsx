import { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
//sub component to show time
import Clock from "./Clock";
import Loading from "./Loading";

interface temperature {
  time: string[];
  temperature_2m: number[];
}
interface city {
  _id: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  iso2: string;
  admin_name: string;
}

interface weatherProps {
  countryList: string[];
}

const weather: React.FC<weatherProps> = ({ countryList }) => {
  //initial data

  const [cityData, setCityData] = useState<temperature>();
  const [color, setColor] = useState<string[]>();
  const [cityName, setCityName] = useState<string>("");
  const [countryName, setCountryName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cityList, setCityList] = useState<city[]>([]);
  const [countryCode, setCountryCode] = useState<string>("");
  const [darkmode, setDarkmode] = useState<boolean>(true);
  const [aspect, setAspect] = useState<number>(2.2);

  //color functionality

  const getColor = (value: number): string => {
    if (value >= 50) return "rgb(49, 0, 39)";
    if (value < 50 && value >= 40) return "rgb(121, 0, 26)";
    if (value < 40 && value >= 35) return "red";
    if (value < 35 && value >= 30) return "#ff7205";
    if (value < 30 && value >= 25) return "#ffb800";
    if (value < 25 && value >= 20) return "rgb(168, 197, 0)";
    if (value < 20 && value >= 15) return "green";
    if (value < 15 && value >= 10) return "rgb(0, 133, 185)";
    if (value < 10 && value >= 0) return "rgb(2, 0, 107)";
    if (value < 0 && value >= -20) return "rgb(0, 204, 255)";
    if (value < -20) return "rgb(1, 0, 22)";
    return "";
  };

  //getting data and api
  const initialData = async (): Promise<void> => {
    setCountryCode("IR");
    setCountryName("Iran");
    const response = await fetch(`/api/cities/?country=Iran`);
    const list = await response.json();
    setCityList(list);
    setCityName("Alborz - Kamālshahr");
  };

  const getCityData = async (): Promise<void> => {
    try {
      const currentData = cityList.find((item) => {
        if (item.admin_name)
          return item.admin_name + " - " + item.city === cityName;
        else return item.city === cityName;
      });
      if (currentData) {
        setCountryName(currentData.country);
        const response: Response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${currentData.lat}&longitude=${currentData.lng}&hourly=temperature_2m`
        );
        const Data: any = await response.json();
        let time: string[] = Data.hourly.time.map(
          (date: string) => date.split("T")[1]
        );
        let data: temperature = {
          time: time.slice(0, 24),
          temperature_2m: Data.hourly.temperature_2m.slice(0, 24),
        };
        let backgroundcolor: string[] = data.temperature_2m.map((item) =>
          getColor(item)
        );
        setColor(backgroundcolor);
        setCityData(data);
        setCountryCode(currentData.iso2);
      }
    } catch (err) {
      console.log("this is the tryCatch error:", err);
    }
  };

  //updating city and country list
  const updateLists = async (): Promise<void> => {
    const response = await fetch(`/api/cities/?country=${countryName}`);
    const list: city[] = await response.json();
    if (list.length > 0) {
      const name = list[0].admin_name
        ? list[0].admin_name + " - " + list[0].city
        : list[0].city;
      console.log(list);
      console.log(name);
      setCityName(name);
      setCityList(list);
    }
  };

  useEffect(() => {
    const start = async () => {
      initialData();
      await getCityData();
    };
    start();
  }, []);

  //resize event listener

  useEffect(() => {
    if (window !== undefined) {
      window.innerWidth < window.innerHeight ? setAspect(1.3) : setAspect(2.2);
      window.addEventListener("resize", () => {
        window.innerWidth < window.innerHeight
          ? setAspect(1.3)
          : setAspect(2.2);
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

  useEffect(() => {
    getCityData();
    setIsLoading(false);
  }, [cityName]);

  const ctx = useRef<HTMLCanvasElement>(null);
  let myChart: Chart;

  useEffect(() => {
    updateLists();
    setIsLoading(true);
  }, [countryName]);

  //chart useEffect
  useEffect(() => {
    if (ctx.current)
      myChart = new Chart(ctx.current, {
        type: "bar",
        data: {
          labels: cityData ? cityData.time : [],
          datasets: [
            {
              label: cityName + " / " + countryName,
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
  }, [cityData, darkmode]);

  if (cityList.length < 1 || !countryList || !cityData) return <Loading />;
  return (
    <div className="flex flex-col my-3 lg:w-[66rem] mx-auto">
      <Clock countryCode={countryCode} />
      <div className="flex justify-center lg:justify-between my-6 lg:mb-0">
        <div className="flex flex-col justify-center items-center lg:items-start">
          {countryList ? (
            <select
              className="block mb-1 text-lg font-semibold p-1"
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
              disabled={isLoading}
              onChange={(e) => setCityName(e.currentTarget.value)}
            >
              {cityList.map((item) => (
                <option
                  value={
                    item.admin_name
                      ? item.admin_name + " - " + item.city
                      : item.city
                  }
                  key={item._id}
                >
                  {(item.admin_name ? item.admin_name + " - " : "") + item.city}
                </option>
              ))}
            </select>
          ) : (
            ""
          )}
        </div>
        <div className="text-center hidden lg:block">
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

      <canvas id="myChart" ref={ctx}></canvas>

      <div className="h-32 w-full flex flex-col justify-center items-center lg:hidden">
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
};

export default weather;
