const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
    
  email: { type: String, required: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  resetToken: { type: String },
  resetTokenExpires: { type: Date }
}, {
  timestamps: true
});

const passwordReset = mongoose.model("PasswordReset", passwordResetSchema)

module.exports = passwordReset