const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  senderAccount: {
    type: String,
    required: true
  },
  receiverAccount: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [1, 'Amount must be at least ₹1']
  },
  type: {
    type: String,
    enum: ['TRANSFER', 'DEPOSIT'],
    required: true
  },
  description: {
    type: String,
    default: 'Banking transaction'
  },
  status: {
    type: String,
    enum: ['INITIATED', 'VALIDATING', 'APPROVED', 'COMPLETED', 'REJECTED'],
    default: 'INITIATED'
  },
  fsmHistory: [
    {
      state: String,
      timestamp: String,
      reason: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
