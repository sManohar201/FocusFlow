import { VercelRequest, VercelResponse } from '@vercel/node';
import app from "./server";

export default async (req: VercelRequest, res: VercelResponse) => {
  // Debug logging
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  
  try {
    return app(req, res);
  } catch (error) {
    console.error('Error in [...slug].ts:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};