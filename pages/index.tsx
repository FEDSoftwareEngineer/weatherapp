import Head from "next/head";
import Weather from "../components/Weather";

export default function Home() {
  return (
    <>
      <Head>
        <title>Weather App</title>
        <meta
          name="description"
          content="this is a weather app by webdegan.com"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto">
        <Weather />
      </div>
    </>
  );
}
