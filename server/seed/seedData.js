const bcrypt = require('bcryptjs');
const dbService = require('../services/dbService');
const { connectDB } = require('../config/db');

async function seedData() {
  const salt = await bcrypt.genSalt(10);
  const userPasswordHash = await bcrypt.hash('Demo1234!', salt);
  const adminPasswordHash = await bcrypt.hash('Admin1234!', salt);

  const users = [
    {
      _id: 'usr_rahul_001',
      name: 'Rahul Sharma',
      email: 'rahul@securebank.com',
      phone: '+91 98765 43210',
      passwordHash: userPasswordHash,
      role: 'user',
      createdAt: new Date('2026-01-10T10:00:00Z')
    },
    {
      _id: 'usr_priya_002',
      name: 'Priya Sundaram',
      email: 'priya@securebank.com',
      phone: '+91 91234 56789',
      passwordHash: userPasswordHash,
      role: 'user',
      createdAt: new Date('2026-01-12T11:30:00Z')
    },
    {
      _id: 'usr_vikram_003',
      name: 'Vikram Patel',
      email: 'vikram@securebank.com',
      phone: '+91 94567 89012',
      passwordHash: userPasswordHash,
      role: 'user',
      createdAt: new Date('2026-01-15T09:15:00Z')
    },
    {
      _id: 'usr_admin_004',
      name: 'Bank Administrator',
      email: 'admin@securebank.com',
      phone: '+91 90000 11111',
      passwordHash: adminPasswordHash,
      role: 'admin',
      createdAt: new Date('2026-01-01T08:00:00Z')
    }
  ];

  const accounts = [
    {
      _id: 'acc_rahul_001',
      userId: 'usr_rahul_001',
      accountNumber: 'SB5012349876',
      balance: 150000, // ₹1,50,000
      currency: 'INR',
      createdAt: new Date('2026-01-10T10:05:00Z')
    },
    {
      _id: 'acc_priya_002',
      userId: 'usr_priya_002',
      accountNumber: 'SB7089123456',
      balance: 275000, // ₹2,75,000
      currency: 'INR',
      createdAt: new Date('2026-01-12T11:35:00Z')
    },
    {
      _id: 'acc_vikram_003',
      userId: 'usr_vikram_003',
      accountNumber: 'SB3040506070',
      balance: 85000, // ₹85,000
      currency: 'INR',
      createdAt: new Date('2026-01-15T09:20:00Z')
    },
    {
      _id: 'acc_admin_004',
      userId: 'usr_admin_004',
      accountNumber: 'SB9990001122',
      balance: 1000000, // ₹10,00,000
      currency: 'INR',
      createdAt: new Date('2026-01-01T08:05:00Z')
    }
  ];

  const transactions = [
    {
      transactionId: 'TXN88204910',
      senderAccount: 'CASH_DEPOSIT_COUNTER',
      receiverAccount: 'SB5012349876',
      amount: 100000,
      type: 'DEPOSIT',
      description: 'Initial Salary Account Deposit',
      status: 'COMPLETED',
      fsmHistory: [
        { state: 'INITIATED', timestamp: '2026-01-10T10:10:00Z', reason: 'Deposit initiated' },
        { state: 'VALIDATING', timestamp: '2026-01-10T10:10:01Z', reason: 'Verified cash counter clearance' },
        { state: 'APPROVED', timestamp: '2026-01-10T10:10:02Z', reason: 'Ledger authorization granted' },
        { state: 'COMPLETED', timestamp: '2026-01-10T10:10:03Z', reason: 'Balance updated' }
      ],
      createdAt: new Date('2026-01-10T10:10:03Z')
    },
    {
      transactionId: 'TXN91402319',
      senderAccount: 'SB5012349876',
      receiverAccount: 'SB7089123456',
      amount: 25000,
      type: 'TRANSFER',
      description: 'Consulting fees & office reimbursement',
      status: 'COMPLETED',
      fsmHistory: [
        { state: 'INITIATED', timestamp: '2026-01-20T14:22:00Z', reason: 'Transfer request received' },
        { state: 'VALIDATING', timestamp: '2026-01-20T14:22:01Z', reason: 'Sender balance and recipient verified' },
        { state: 'APPROVED', timestamp: '2026-01-20T14:22:02Z', reason: 'Automata state machine approved transfer' },
        { state: 'COMPLETED', timestamp: '2026-01-20T14:22:03Z', reason: 'Ledger settlement complete' }
      ],
      createdAt: new Date('2026-01-20T14:22:03Z')
    },
    {
      transactionId: 'TXN97120485',
      senderAccount: 'SB7089123456',
      receiverAccount: 'SB3040506070',
      amount: 15000,
      type: 'TRANSFER',
      description: 'Vendor payment for cloud services',
      status: 'COMPLETED',
      fsmHistory: [
        { state: 'INITIATED', timestamp: '2026-02-01T16:45:00Z', reason: 'Transfer initialized' },
        { state: 'VALIDATING', timestamp: '2026-02-01T16:45:01Z', reason: 'FSM validating funds' },
        { state: 'APPROVED', timestamp: '2026-02-01T16:45:02Z', reason: 'Verification checks passed' },
        { state: 'COMPLETED', timestamp: '2026-02-01T16:45:03Z', reason: 'Settlement finalized' }
      ],
      createdAt: new Date('2026-02-01T16:45:03Z')
    },
    {
      transactionId: 'TXN99302194',
      senderAccount: 'CASH_DEPOSIT_COUNTER',
      receiverAccount: 'SB5012349876',
      amount: 75000,
      type: 'DEPOSIT',
      description: 'UPI Direct Deposit from Client',
      status: 'COMPLETED',
      fsmHistory: [
        { state: 'INITIATED', timestamp: '2026-02-05T09:00:00Z', reason: 'UPI inbound' },
        { state: 'VALIDATING', timestamp: '2026-02-05T09:00:01Z', reason: 'Gateway verification' },
        { state: 'APPROVED', timestamp: '2026-02-05T09:00:02Z', reason: 'Approved' },
        { state: 'COMPLETED', timestamp: '2026-02-05T09:00:03Z', reason: 'Credited to account' }
      ],
      createdAt: new Date('2026-02-05T09:00:03Z')
    },
    {
      transactionId: 'TXN99881023',
      senderAccount: 'SB5012349876',
      receiverAccount: 'SB9999999999',
      amount: 500000,
      type: 'TRANSFER',
      description: 'Transfer Attempt: Exceeded available balance limit',
      status: 'REJECTED',
      fsmHistory: [
        { state: 'INITIATED', timestamp: '2026-02-08T11:20:00Z', reason: 'Transfer request dispatched by user' },
        { state: 'REJECTED', timestamp: '2026-02-08T11:20:01Z', reason: 'DFA Transition via INSUFFICIENT_BALANCE: balance check failed' }
      ],
      createdAt: new Date('2026-02-08T11:20:01Z')
    }
  ];

  await dbService.seedInitialData(users, accounts, transactions);
  return { users, accounts, transactions };
}

module.exports = { seedData };
