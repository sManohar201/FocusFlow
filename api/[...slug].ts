import { VercelRequest, VercelResponse } from '@vercel/node';
import app from "./server";

export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};