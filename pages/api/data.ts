import fs from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";
type Data = {
  data: string[][];
};
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const filePath = path.join(process.cwd(), "public", "worldcities.csv");
  const textData = fs.readFileSync(filePath, "utf-8");
  const rows = textData.split("\n");
  const data = rows.map((row) =>
    row.split(",").map((cell) => cell.replace(/^"|"$/g, ""))
  );

  res.status(200).json({ data });
}
