import mongoose from 'mongoose';

const historyEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sources: [{
    type: { type: String, enum: ['youtube','blog','pdf'], required: true },
    url: String,
    videoId: String,
    title: String,
    snippet: String
  }],
  summary: { type: String },
  quiz: [{
    question: String,
    options: [String],
    correct: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

export const HistoryEntry = mongoose.model('HistoryEntry', historyEntrySchema);
