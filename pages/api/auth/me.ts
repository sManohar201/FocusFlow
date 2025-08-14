import type { NextApiRequest, NextApiResponse } from 'next'
import { storage } from '../../../db/storage'
import { withSession } from '../../../lib/session'

export default withSession(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    const user = await storage.getUserById(req.session.userId)
    if (!user) {
      req.session.destroy()
      await req.session.save()
      return res.status(401).json({ message: 'User not found' })
    }

    const { passwordHash, ...userWithoutPassword } = user
    return res.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Auth check error:', error)
    return res.status(500).json({ message: 'Authentication check failed' })
  }
})
