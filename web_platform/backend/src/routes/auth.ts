import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getUserByUsername, createUser, getUserById } from '../db/user';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });

  const existing = await getUserByUsername(username);
  if (existing) return res.status(409).json({ error: 'Username already exists' });

  const hash = await bcrypt.hash(password, 10);
  const user = await createUser({
    id: uuidv4(),
    username,
    passwordHash: hash,
    createdAt: new Date(),
    tier: 'tier3',
    tierExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week free
    isAdmin: false,
  });
  return res.json({ success: true });
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await getUserByUsername(username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ token });
});

// Get current user
router.get('/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const { userId } = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET) as any;
    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
