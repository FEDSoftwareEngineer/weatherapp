import { useState, useEffect } from "react";
import moment from "moment-timezone";

interface ClockProps {
  countryCode: string;
}

const Clock = ({ countryCode }: ClockProps) => {
  const [time, setTime] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const [timeZone, setTimeZone] = useState("");

  useEffect(() => {
    const timeZone = moment.tz.zonesForCountry(countryCode)?.[0];
    setTimeZone(timeZone);
    setIsMounted(true);
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [countryCode]);

  if (!isMounted || timeZone === "") return null;

  return (
    <>
      <h1 className="textCenter">
        {time.toLocaleTimeString("en-US", { timeZone })}
      </h1>
    </>
  );
};

export default Clock;
