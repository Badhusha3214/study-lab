import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { User } from '../models/User.js';

function signAccessToken(user) {
  return jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
}
function signRefreshToken(user) {
  const token = jwt.sign({ sub: user._id, type: 'refresh' }, process.env.REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRES_IN || '7d' });
  return token;
}

export async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email, password, name } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash, name });
  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);
  user.refreshTokens.push({ token: refresh });
  await user.save();
  res.status(201).json({ user: user.toPublic(), accessToken: access, refreshToken: refresh });
}

export async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });
  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);
  user.refreshTokens.push({ token: refresh });
  await user.save();
  res.json({ user: user.toPublic(), accessToken: access, refreshToken: refresh });
}

export async function refresh(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Missing refreshToken' });
  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    const exists = user.refreshTokens.some(rt => rt.token === refreshToken);
    if (!exists) return res.status(401).json({ message: 'Revoked token' });
    const access = signAccessToken(user);
    res.json({ accessToken: access });
  } catch (e) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
}

export async function logout(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Missing refreshToken' });
  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(200).json({ message: 'Logged out' });
    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
    await user.save();
    res.json({ message: 'Logged out' });
  } catch (e) {
    res.json({ message: 'Logged out' });
  }
}
