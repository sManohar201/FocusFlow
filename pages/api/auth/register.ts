import type { NextApiRequest, NextApiResponse } from 'next'
import { storage } from '../../../db/storage'
import { withSession } from '../../../lib/session'
import { insertUserSchema } from '../../../shared/schema'

export default withSession(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const userData = insertUserSchema.parse(req.body)
    const existingUser = await storage.getUserByEmail(userData.email)

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const user = await storage.createUser({
      email: userData.email,
      firstName: userData.firstName || undefined,
      lastName: userData.lastName || undefined,
      password: userData.password,
    })

    // Set user session
    req.session.userId = user.id
    await req.session.save()

    const { passwordHash, ...userWithoutPassword } = user
    return res.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Register error:', error)
    return res.status(400).json({ message: 'Invalid user data' })
  }
})
