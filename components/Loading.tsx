import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const Loading = () => {
  return (
    <div className="flex h-screen justify-center items-center">
      <AiOutlineLoading3Quarters className="animate-spin w-20 h-20" />
    </div>
  );
};

export default Loading;
