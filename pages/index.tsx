import Head from "next/head";

//components
import Weather from "../components/Weather";

export async function getServerSideProps() {
  const url =
    process.env.NODE_ENV === "production"
      ? "https://webdegan-weatherapp.netlify.app"
      : "http://localhost:3000/api/data";
  console.log("hello");
  const response = await fetch(url);
  const json = await response.json();
  const data = json.data;

  return { props: { data } };
}

export default function Home({ data }: any) {
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
        <Weather data={data} />
      </div>
    </>
  );
}
