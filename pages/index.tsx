import Head from "next/head";
import Weather from "../components/Weather";
import { NextPage } from "next";

interface weatherProps {
  countryList: string[];
}
export const getServerSideProps = async () => {
  const url =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_URL
      : "http://localhost:3000";

  const response = await fetch(`${url}/api/countries`);
  const countryList: string[] = await response.json();

  return { props: { countryList } };
};

const Home: NextPage<weatherProps> = ({ countryList }) => {
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
        <Weather countryList={countryList} />
      </div>
    </>
  );
};
export default Home;
