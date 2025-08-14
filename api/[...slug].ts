import type { NextApiRequest, NextApiResponse } from 'next';
import { withSession } from '../lib/session';
import { storage } from '../db/storage';
import { insertUserSchema } from '../shared/schema';

async function handleRequest(req: NextApiRequest, res: NextApiResponse) {
  // Debug logging
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);
  
  const urlParts = req.url?.split('?')[0].split('/').filter(Boolean) || [];
  
  if (urlParts[0] === 'api' && urlParts[1] === 'auth') {
    // Auth routes
    if (req.method === 'POST' && urlParts[2] === 'login') {
      try {
        const { email, password } = req.body;
        
        if (!email || !password) {
          return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await storage.getUserByEmail(email);
        
        if (!user || !(await storage.verifyPassword(password, user.passwordHash))) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Set user ID in session
        req.session.userId = user.id;
        await req.session.save();

        const { passwordHash, ...userWithoutPassword } = user;
        return res.status(200).json({ user: userWithoutPassword });
      } catch (error) {
        console.error('Login error:', error);
        return res.status(400).json({ message: 'Login failed' });
      }
    }
    
    if (req.method === 'POST' && urlParts[2] === 'register') {
      try {
        const userData = insertUserSchema.parse(req.body);
        const existingUser = await storage.getUserByEmail(userData.email);

        if (existingUser) {
          return res.status(400).json({ message: 'User already exists' });
        }

        const user = await storage.createUser({
          email: userData.email,
          firstName: userData.firstName || undefined,
          lastName: userData.lastName || undefined,
          password: userData.password,
        });

        // Set user ID in session
        req.session.userId = user.id;
        await req.session.save();

        const { passwordHash, ...userWithoutPassword } = user;
        return res.status(200).json({ user: userWithoutPassword });
      } catch (error) {
        return res.status(400).json({ message: 'Invalid user data' });
      }
    }
    
    if (req.method === 'GET' && urlParts[2] === 'me') {
      try {
        if (!req.session.userId) {
          return res.status(401).json({ message: 'Not authenticated' });
        }

        const user = await storage.getUserById(req.session.userId);
        if (!user) {
          req.session.destroy();
          await req.session.save();
          return res.status(401).json({ message: 'User not found' });
        }

        const { passwordHash, ...userWithoutPassword } = user;
        return res.status(200).json({ user: userWithoutPassword });
      } catch (error) {
        console.error('Auth check error:', error);
        return res.status(500).json({ message: 'Authentication check failed' });
      }
    }

    if (req.method === 'POST' && urlParts[2] === 'logout') {
      req.session.destroy();
      await req.session.save();
      return res.status(200).json({ message: 'Logged out successfully' });
    }
  }

  // Handle other API routes here...
  return res.status(404).json({ message: 'Not found' });
}

export default withSession(handleRequest);