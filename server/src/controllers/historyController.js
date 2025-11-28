import { validationResult } from 'express-validator';
import { HistoryEntry } from '../models/HistoryEntry.js';

export async function createHistory(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { sources, summary, quiz } = req.body;
  const entry = await HistoryEntry.create({ userId: req.user._id, sources, summary, quiz });
  res.status(201).json({ history: entry });
}

export async function listHistory(req, res) {
  const items = await HistoryEntry.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.json({ history: items });
}

export async function getHistory(req, res) {
  const item = await HistoryEntry.findOne({ _id: req.params.id, userId: req.user._id });
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json({ history: item });
}

export async function deleteHistory(req, res) {
  const item = await HistoryEntry.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
}
