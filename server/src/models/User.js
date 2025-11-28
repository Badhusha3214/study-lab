import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  refreshTokens: [{ token: String, createdAt: { type: Date, default: Date.now } }]
});

userSchema.methods.toPublic = function () {
  return { id: this._id, email: this.email, name: this.name, createdAt: this.createdAt };
};

export const User = mongoose.model('User', userSchema);
