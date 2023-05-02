import React from "react";

const About = () => {
  return (
    <div className="container">
      <h1 className="title">About this app</h1>
      <p className="description">
        This weather app uses different APIs to show the temperature and local
        time of 26000 cities around the world. With this app, you can easily
        access up-to-date weather information for cities across the globe. The
        use of multiple APIs ensures accurate and reliable data. The data
        updates every hour, so you can always be sure you're getting the latest
        information
      </p>
      <h1 className="title">Who am I?</h1>
      <p className="description">
        I am a front-end developer with a passion for creating user-friendly and
        visually appealing websites and applications. I have experience working
        with a variety of technologies and am always striving to improve my
        skills and stay up-to-date with the latest trends in web development.
        You can learn more about me and my work on my website:{" "}
        <a href="http://www.webdegan.com">www.webdegan.com</a>
      </p>
      <div className="space"></div>
    </div>
  );
};

export default About;
