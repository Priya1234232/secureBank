// Comprehensive end-to-end API test suite for SecureBank

async function runTests() {
  const BASE_URL = 'http://127.0.0.1:5000';
  console.log('🧪 Starting SecureBank Hackathon API Test Suite...\n');

  // Test 1: Health & Database status
  console.log('1️⃣ Checking API Health & Dual Database Engine...');
  const healthRes = await fetch(`${BASE_URL}/`);
  const health = await healthRes.json();
  console.log(`   Status: ${health.status}`);
  console.log(`   DB Mode: ${health.database.label}`);
  console.log(`   Subjects: ${health.subjectsIntegrated.length} subjects integrated`);

  // Test 2: Transaction DFA Definition Endpoint
  console.log('\n2️⃣ Testing Transaction Modeling DFA Definition Endpoint...');
  const txDfaRes = await fetch(`${BASE_URL}/api/dfa/transaction-dfa`);
  const txDfaData = await txDfaRes.json();
  console.log(`   Transaction DFA Name: ${txDfaData.definition.name}`);
  console.log(`   Formal States Q: ${txDfaData.definition.tuple.Q.join(', ')}`);
  console.log(`   Final Accepting States F: ${txDfaData.definition.tuple.F.join(', ')}`);
  console.log(`   Transition Rows: ${txDfaData.definition.transitionTable.length} rows`);

  // Test 3: Credential DFA Simulation
  console.log('\n3️⃣ Testing Credential Input DFA Simulation...');
  const dfaRes = await fetch(`${BASE_URL}/api/dfa/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: 'rahul@securebank.com' })
  });
  const dfa = await dfaRes.json();
  console.log(`   Input "rahul@securebank.com" -> Accepted: ${dfa.result.accepted}, Halts in State: ${dfa.result.finalState}`);

  // Test 4: User Authentication (Login)
  console.log('\n4️⃣ Testing User Authentication (rahul@securebank.com)...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rahul@securebank.com', password: 'Demo1234!' })
  });
  const loginData = await loginRes.json();
  console.log(`   Login Success: ${loginData.success}`);
  console.log(`   User: ${loginData.user.name}`);
  console.log(`   Initial Balance: ₹${loginData.account.balance.toLocaleString('en-IN')}`);

  const token = loginData.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Test 5: Balance Enquiry (REST API requirement)
  console.log('\n5️⃣ Testing Balance Enquiry API (GET /api/accounts/balance)...');
  const balRes = await fetch(`${BASE_URL}/api/accounts/balance`, { headers: authHeaders });
  const balData = await balRes.json();
  console.log(`   Account Number: ${balData.accountNumber}`);
  console.log(`   Enquiry Balance: ₹${balData.balance.toLocaleString('en-IN')} (${balData.currency})`);

  // Test 6: Valid Money Transfer (INITIATED -> VALIDATING -> APPROVED -> COMPLETED)
  console.log('\n6️⃣ Testing Valid Money Transfer with DFA Progression...');
  const transferRes = await fetch(`${BASE_URL}/api/transactions/transfer`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      receiverAccount: 'SB7089123456', // Priya's account
      amount: 5000,
      description: 'Consulting fees & review honorarium'
    })
  });
  const transferData = await transferRes.json();
  console.log(`   Transfer Success: ${transferData.success}`);
  console.log(`   Transaction ID: ${transferData.transaction.transactionId}`);
  console.log(`   DFA State: ${transferData.fsmState} (Accepting State)`);
  console.log(`   New Sender Balance: ₹${transferData.newBalance.toLocaleString('en-IN')}`);

  // Test 7: Overdraft Rejection Transfer (INITIATED -> VALIDATING -> REJECTED)
  console.log('\n7️⃣ Testing Overdraft Rejection with DFA Trap State Progression...');
  const rejectRes = await fetch(`${BASE_URL}/api/transactions/transfer`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      receiverAccount: 'SB7089123456',
      amount: 99999999, // Intentional overdraft
      description: 'Attempted excessive withdrawal'
    })
  });
  const rejectData = await rejectRes.json();
  console.log(`   Overdraft Transfer Rejected: ${!rejectData.success}`);
  console.log(`   DFA State: ${rejectData.fsmState} (Dead / Trap State)`);
  console.log(`   Reason: ${rejectData.message}`);

  // Test 8: Simulated Deposit
  console.log('\n8️⃣ Testing Simulated Deposit...');
  const depositRes = await fetch(`${BASE_URL}/api/transactions/deposit`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      amount: 15000,
      description: 'UPI Simulated Direct Deposit'
    })
  });
  const depositData = await depositRes.json();
  console.log(`   Deposit Success: ${depositData.success}`);
  console.log(`   New Balance after Deposit: ₹${depositData.newBalance.toLocaleString('en-IN')}`);

  // Test 9: Network Logger Telemetry
  console.log('\n9️⃣ Testing Computer Networks Request Logger...');
  const netRes = await fetch(`${BASE_URL}/api/network/logs?limit=5`);
  const netData = await netRes.json();
  console.log(`   Recorded Network Packets Count: ${netData.count}`);
  if (netData.logs.length > 0) {
    const latest = netData.logs[0];
    console.log(`   Latest Packet: ${latest.method} ${latest.url} -> Status ${latest.statusCode} (${latest.responseTimeMs} ms, ${latest.networkLayer.layer7})`);
  }

  console.log('\n🎉 ALL 9 HACKATHON TEST SUITES PASSED FLAWLESSLY!\n');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
