import City from "@/models/worldcities";
import dbConnect from "@/utils/dbConnect";
import mongoose from "mongoose";

process.env.MONGO_URI && mongoose.connect(process.env.MONGO_URI);

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();
  await City.collection.createIndex({ country: 1 });
  if (req.method === "GET") {
    try {
      const countries = await City.distinct("country");
      return res.status(200).json(countries);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "an error occurred while fetching data" });
    }
  }
}
