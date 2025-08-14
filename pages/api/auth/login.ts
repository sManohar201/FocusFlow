import type { NextApiRequest, NextApiResponse } from 'next'
import { storage } from '../../../db/storage'
import { withSession } from '../../../lib/session'

export default withSession(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await storage.getUserByEmail(email)
    
    if (!user || !(await storage.verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Set user session
    req.session.userId = user.id
    await req.session.save()

    const { passwordHash, ...userWithoutPassword } = user
    return res.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(400).json({ message: 'Login failed' })
  }
})
