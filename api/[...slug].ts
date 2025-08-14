import type { NextApiRequest, NextApiResponse } from 'next';

export default function handleCatchAll(req: NextApiRequest, res: NextApiResponse) {
  return res.status(404).json({ message: 'Not found' });
}