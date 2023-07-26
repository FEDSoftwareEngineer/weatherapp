import City from "@/models/worldcities";
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Joi from "joi";

const schema = Joi.object({
  country: Joi.string().required(),
  city: Joi.string(),
});
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();
  if (req.method === "GET") {
    const { error, value } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    if (value.country && value.city) {
      const city = await City.findOne({
        country: value.country,
        city: value.city,
      });
      if (city) return res.status(200).json(city);
    } else if (value.country) {
      const Cities = await City.distinct("city", {
        country: value.country,
      }).sort();
      if (Cities.length < 1)
        return res.status(400).json({ message: "country not found" });
      return res.status(200).json(Cities);
    } else return res.status(200).json({ message: "error" });
  }
}
