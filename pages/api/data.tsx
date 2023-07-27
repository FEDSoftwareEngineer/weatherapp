import City from "@/models/worldcities";
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();
  if (req.method === "GET") {
    if (req.query.country && req.query.city) {
      const city = await City.findOne({
        country: req.query.country,
        city: req.query.city,
      });
      if (city) return res.status(200).json(city);
    } else
      return res.status(400).json({ message: "error invalid country or city" });
  }
}
