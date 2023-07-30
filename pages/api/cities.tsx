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
      const cities = await City.find(
        { country: req.query.country },
        { city: 1, _id: 1, admin_name: 1, lat: 1, lng: 1, iso2: 1, country: 1 }
      ).sort({
        admin_name: 1,
      });
      return res.status(200).json(cities);
    } catch (error) {
      res
        .status(500)
        .json({ message: "an error occurred while fetching data" });
    }
  }
}
