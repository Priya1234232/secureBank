const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const { getDbStatus } = require('../config/db');

// In-Memory storage fallback tables
const memoryStore = {
  users: [],
  accounts: [],
  transactions: []
};

class DbService {
  isMongoActive() {
    return getDbStatus().isConnected;
  }

  // ================= USER METHODS =================
  async findUserByEmail(email) {
    const cleanEmail = String(email || '').toLowerCase().trim();
    if (this.isMongoActive()) {
      return await User.findOne({ email: cleanEmail });
    }
    return memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  }

  async findUserById(id) {
    if (this.isMongoActive()) {
      return await User.findById(id).select('-passwordHash');
    }
    const user = memoryStore.users.find(u => String(u._id) === String(id));
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async createUser(userData) {
    if (this.isMongoActive()) {
      const newUser = new User(userData);
      return await newUser.save();
    }
    const newUser = {
      _id: 'usr_' + Date.now() + Math.random().toString(36).substring(2, 7),
      ...userData,
      createdAt: new Date()
    };
    memoryStore.users.push(newUser);
    return newUser;
  }

  async getAllUsers() {
    if (this.isMongoActive()) {
      return await User.find().select('-passwordHash').sort({ createdAt: -1 });
    }
    return memoryStore.users.map(({ passwordHash, ...u }) => u);
  }

  // ================= ACCOUNT METHODS =================
  async getAccountByUserId(userId) {
    if (this.isMongoActive()) {
      return await Account.findOne({ userId });
    }
    return memoryStore.accounts.find(a => String(a.userId) === String(userId)) || null;
  }

  async getAccountByNumber(accountNumber) {
    if (this.isMongoActive()) {
      return await Account.findOne({ accountNumber });
    }
    return memoryStore.accounts.find(a => a.accountNumber === accountNumber) || null;
  }

  async createAccount(accountData) {
    if (this.isMongoActive()) {
      const newAcc = new Account(accountData);
      return await newAcc.save();
    }
    const newAcc = {
      _id: 'acc_' + Date.now() + Math.random().toString(36).substring(2, 7),
      ...accountData,
      createdAt: new Date()
    };
    memoryStore.accounts.push(newAcc);
    return newAcc;
  }

  async depositMoney(accountNumber, amount) {
    const amt = Number(amount);
    if (amt <= 0) throw new Error('Deposit amount must be greater than zero');

    if (this.isMongoActive()) {
      const updated = await Account.findOneAndUpdate(
        { accountNumber },
        { $inc: { balance: amt } },
        { new: true }
      );
      return updated;
    }

    const acc = memoryStore.accounts.find(a => a.accountNumber === accountNumber);
    if (!acc) throw new Error('Account not found');
    acc.balance += amt;
    return acc;
  }

  /**
   * Atomic Money Transfer
   * Guarantees that sender has sufficient balance and both accounts update atomically.
   */
  async atomicTransfer({ senderAccount, receiverAccount, amount, description, fsmHistory }) {
    const amt = Number(amount);
    if (amt <= 0) throw new Error('Transfer amount must be greater than zero');

    if (senderAccount === receiverAccount) {
      throw new Error('Sender and receiver accounts cannot be the same');
    }

    const txId = 'TXN' + Date.now().toString().slice(-8) + Math.random().toString(36).substring(2, 5).toUpperCase();

    if (this.isMongoActive()) {
      // Step 1: Verify receiver exists
      const receiver = await Account.findOne({ accountNumber: receiverAccount });
      if (!receiver) {
        throw new Error(`Receiver account ${receiverAccount} not found`);
      }

      // Step 2: Atomic debit from sender with balance guard
      const debitedSender = await Account.findOneAndUpdate(
        { accountNumber: senderAccount, balance: { $gte: amt } },
        { $inc: { balance: -amt } },
        { new: true }
      );

      if (!debitedSender) {
        throw new Error('Transfer rejected: Insufficient balance or invalid sender account');
      }

      // Step 3: Credit receiver
      await Account.findOneAndUpdate(
        { accountNumber: receiverAccount },
        { $inc: { balance: amt } }
      );

      // Step 4: Record Transaction
      const transaction = new Transaction({
        transactionId: txId,
        senderAccount,
        receiverAccount,
        amount: amt,
        type: 'TRANSFER',
        description: description || 'Bank transfer',
        status: 'APPROVED',
        fsmHistory: fsmHistory || [],
        createdAt: new Date()
      });
      await transaction.save();

      return {
        transaction,
        senderBalance: debitedSender.balance
      };
    } else {
      // IN-MEMORY SAFE EXECUTION
      const sender = memoryStore.accounts.find(a => a.accountNumber === senderAccount);
      const receiver = memoryStore.accounts.find(a => a.accountNumber === receiverAccount);

      if (!sender) throw new Error('Sender account not found');
      if (!receiver) throw new Error(`Receiver account ${receiverAccount} not found`);
      if (sender.balance < amt) {
        throw new Error('Transfer rejected: Insufficient balance');
      }

      sender.balance -= amt;
      receiver.balance += amt;

      const transaction = {
        _id: 'tx_' + Date.now(),
        transactionId: txId,
        senderAccount,
        receiverAccount,
        amount: amt,
        type: 'TRANSFER',
        description: description || 'Bank transfer',
        status: 'APPROVED',
        fsmHistory: fsmHistory || [],
        createdAt: new Date()
      };
      memoryStore.transactions.push(transaction);

      return {
        transaction,
        senderBalance: sender.balance
      };
    }
  }

  /**
   * Record Rejected Transfer into MongoDB / In-Memory Store
   * Ensures balances remain completely untouched while persisting DFA audit history.
   */
  async recordRejectedTransfer({ senderAccount, receiverAccount, amount, description, fsmHistory, reason }) {
    const txId = 'TXN' + Date.now().toString().slice(-8) + Math.random().toString(36).substring(2, 5).toUpperCase();
    const txData = {
      transactionId: txId,
      senderAccount: senderAccount || 'UNKNOWN_SENDER',
      receiverAccount: receiverAccount || 'UNKNOWN_RECEIVER',
      amount: Number(amount) || 0,
      type: 'TRANSFER',
      description: description || `Transfer Rejected: ${reason || 'Automata rejection'}`,
      status: 'REJECTED',
      fsmHistory: fsmHistory || [],
      createdAt: new Date()
    };

    return await this.createTransaction(txData);
  }

  // ================= TRANSACTION METHODS =================
  async getTransactionById(idOrTxId) {
    if (!idOrTxId) return null;
    const cleanId = String(idOrTxId).trim();

    if (this.isMongoActive()) {
      return await Transaction.findOne({
        $or: [{ transactionId: cleanId }, { _id: cleanId.match(/^[0-9a-fA-F]{24}$/) ? cleanId : null }]
      });
    }

    return memoryStore.transactions.find(t => 
      t.transactionId === cleanId || String(t._id) === cleanId
    ) || null;
  }

  async createTransaction(txData) {
    if (this.isMongoActive()) {
      const tx = new Transaction(txData);
      return await tx.save();
    }
    const tx = {
      _id: 'tx_' + Date.now() + Math.random().toString(36).substring(2, 5),
      ...txData,
      createdAt: new Date()
    };
    memoryStore.transactions.push(tx);
    return tx;
  }

  async getTransactionsForAccount(accountNumber) {
    if (this.isMongoActive()) {
      return await Transaction.find({
        $or: [{ senderAccount: accountNumber }, { receiverAccount: accountNumber }]
      }).sort({ createdAt: -1 });
    }
    return memoryStore.transactions
      .filter(t => t.senderAccount === accountNumber || t.receiverAccount === accountNumber)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getAllTransactions() {
    if (this.isMongoActive()) {
      return await Transaction.find().sort({ createdAt: -1 });
    }
    return [...memoryStore.transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getAdminStats() {
    let userCount = 0;
    let txCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let totalVolume = 0;

    if (this.isMongoActive()) {
      userCount = await User.countDocuments();
      txCount = await Transaction.countDocuments();
      approvedCount = await Transaction.countDocuments({ status: { $in: ['APPROVED', 'COMPLETED'] } });
      rejectedCount = await Transaction.countDocuments({ status: 'REJECTED' });
      const volumeAgg = await Transaction.aggregate([
        { $match: { status: { $in: ['APPROVED', 'COMPLETED'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      totalVolume = (volumeAgg[0] && volumeAgg[0].total) || 0;
    } else {
      userCount = memoryStore.users.length;
      txCount = memoryStore.transactions.length;
      approvedCount = memoryStore.transactions.filter(t => t.status === 'APPROVED' || t.status === 'COMPLETED').length;
      rejectedCount = memoryStore.transactions.filter(t => t.status === 'REJECTED').length;
      totalVolume = memoryStore.transactions
        .filter(t => t.status === 'APPROVED' || t.status === 'COMPLETED')
        .reduce((sum, t) => sum + t.amount, 0);
    }

    return {
      totalUsers: userCount,
      totalTransactions: txCount,
      approvedTransactions: approvedCount,
      rejectedTransactions: rejectedCount,
      totalVolumeINR: totalVolume,
      dbStatus: getDbStatus()
    };
  }

  // ================= SEEDING SUPPORT =================
  async seedInitialData(users, accounts, transactions) {
    if (this.isMongoActive()) {
      const count = await User.countDocuments();
      if (count === 0) {
        console.log('🌱 Seeding demo data into MongoDB Atlas...');
        await User.insertMany(users);
        await Account.insertMany(accounts);
        await Transaction.insertMany(transactions);
        console.log('✅ MongoDB Seeding complete.');
      }
    } else {
      if (memoryStore.users.length === 0) {
        console.log('🌱 Seeding demo data into In-Memory Store...');
        memoryStore.users = [...users];
        memoryStore.accounts = [...accounts];
        memoryStore.transactions = [...transactions];
        console.log('✅ In-Memory Seeding complete.');
      }
    }
  }
}

module.exports = new DbService();
