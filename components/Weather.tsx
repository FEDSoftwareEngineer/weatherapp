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
  const [isLoading, setIsLoading] = useState(true);
  const [countryList, setCountryList] = useState<string[]>([]);
  const [cityList, setCityList] = useState<string[]>([]);
  const [countryCode, setCountryCode] = useState<string>("");

  //color functionalit
  const getCity = (value: string) => {
    if (data) {
      const city = data.find((item) => item.includes(value));
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
  const userLocation = async (): Promise<void> => {
    try {
      const response = await fetch("/api/userlocation");
      const location = await response.json();
      setCountryName(location.country);
      if (cityList.includes(location.city)) setCityName(location.city);
    } catch (err) {
      console.log("location error:", err);
    }
  };
  const getData = async (): Promise<void> => {
    try {
      const response = await fetch("/worldcities.csv");
      const textData = await response.text();
      const rows = textData.split("\n");
      const data = rows.map((row) =>
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
        const lat = parseFloat(info[2]);
        const lon = parseFloat(info[3]);
        setCountryName(info[4]);
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m`
        );
        const Data = await response.json();
        let time = Data.hourly.time.map((date: string) => date.split("T")[1]);
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
      const city = data.filter((item) => item.includes(countryName));
      if (city) {
        setCityName(city[0][0]);
        const list: string[] = city.map((item) => item[0]);
        setCityList(list.sort());
      }
    }
  };

  //getting the csv data
  useEffect(() => {
    userLocation();
    updateLists();
    getData();
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
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                callback: (value) => value + "°",
              },
            },
          },
        },
      });
    return () => {
      if (myChart) myChart.destroy();
    };
  }, [cityData, info]);

  if (!data || !cityList || !countryList || !cityData || !info)
    return <Loading />;
  return (
    <div>
      <Clock countryCode={countryCode} />
      {countryList ? (
        <select
          className="chartOption"
          name=""
          id=""
          key={countryName}
          value={countryName}
          onChange={(e) => setCountryName(e.currentTarget.value)}
        >
          {countryList.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
      ) : (
        ""
      )}
      {cityList ? (
        <select
          className="chartOption"
          key={cityName}
          name=""
          id=""
          value={cityName}
          onChange={(e) => setCityName(e.currentTarget.value)}
        >
          {cityList.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
      ) : (
        ""
      )}
      {isLoading ? "" : <canvas id="myChart" ref={ctx}></canvas>}
    </div>
  );
}
