import { useState, useEffect } from "react";
import moment from "moment-timezone";

interface ClockProps {
  countryCode: string;
}

const Clock = ({ countryCode }: ClockProps) => {
  const [time, setTime] = useState<Date>(new Date());
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [timeZone, setTimeZone] = useState<string>("");

  useEffect(() => {
    const timeZone = moment.tz.zonesForCountry(countryCode)?.[0];
    setTimeZone(timeZone);
    setIsMounted(true);
    const interval: NodeJS.Timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [countryCode]);

  if (!isMounted || timeZone === "") return null;

  return (
    <>
      <h1 className="text-center text-3xl">
        {time.toLocaleTimeString("en-US", { timeZone })}
      </h1>
    </>
  );
};

export default Clock;
