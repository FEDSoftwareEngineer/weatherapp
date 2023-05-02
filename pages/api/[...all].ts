import createProxyMiddleware from "next-http-proxy-middleware";
import { NextApiRequest, NextApiResponse } from "next";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const proxy = await createProxyMiddleware(req, res, {
    target: "http://ipwho.is",
    changeOrigin: true,
    pathRewrite: [{ patternStr: "^/api/userlocation", replaceStr: "/" }],
  });
  proxy;
}
