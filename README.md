# SecureBank – Secure Online Banking System Using DFA

> **Hackathon Problem Statement Focus:**
> *"A bank wants to provide online banking services for balance enquiries and fund transfers. Design a secure web application that manages client-server communication and uses a DFA to model transaction states such as initiated, approved, and rejected."*

---

## 🌟 Core Highlights of the Solution

1. **DFA-Based Transaction Management (FLAT Core)**:
   - Formally models every banking transaction using a **Deterministic Finite Automaton**:
     $$M_{trans} = (Q, \Sigma, \delta, q_0, F)$$
   - Exactly matches the required states and alphabet:
     - **States $Q$**: `INITIATED`, `APPROVED`, `REJECTED`
     - **Alphabet $\Sigma$**: `VALID_TRANSACTION`, `INVALID_RECEIVER`, `INSUFFICIENT_BALANCE`, `DATABASE_FAILURE`
     - **Initial State $q_0$**: `INITIATED`
     - **Final States $F$**: `{ APPROVED, REJECTED }` (both are terminal absorbing states)
   - **Transition Logic**:
     - $\delta(\text{INITIATED}, \text{VALID\_TRANSACTION}) \longrightarrow \text{APPROVED}$
     - $\delta(\text{INITIATED}, \text{INVALID\_RECEIVER}) \longrightarrow \text{REJECTED}$
     - $\delta(\text{INITIATED}, \text{INSUFFICIENT\_BALANCE}) \longrightarrow \text{REJECTED}$
     - $\delta(\text{INITIATED}, \text{DATABASE\_FAILURE}) \longrightarrow \text{REJECTED}$
   - Executable JavaScript transition engine on backend (`server/dfa/transactionFSM.js`) and frontend visualizer.
   - Saves transaction state and full state transition history (`fsmHistory`) in MongoDB.
   - Interactive, animated SVG state transition diagram with glowing rings and collapsible transition table $\delta$.

2. **Dedicated DFA Monitor Page (`/dfa-monitor`)**:
   - Live visual DFA State Diagram with clear professional colors:
     - **INITIATED** – Blue
     - **APPROVED** – Green
     - **REJECTED** – Red
   - Metrics: Approved Transaction Count, Rejected Transaction Count, Total Ledger Transactions.
   - Real-time Transaction Inspector querying `GET /api/transactions/:id/status`.
   - Full State Transition History table with timestamps and reasons.
   - Interactive Input Symbol Simulator testing transitions via $\Sigma$.

3. **Balance Enquiry Page (`/balance-enquiry`)**:
   - Dedicated page querying live MongoDB balance via `GET /api/accounts/balance`.
   - Displays balance in **₹ INR** using `Intl.NumberFormat('en-IN')`.
   - Real-time Client-Server round-trip latency telemetry (ms) and HTTP 200 OK verification.
   - Instant "Refresh Balance" button, show/hide account masking, and one-click clipboard copy.

4. **Fund Transfer Page (`/transfer`)**:
   - Recipient account verification with live name lookup.
   - Sender balance guard preventing overdrafts.
   - Atomic balance updates on backend with database integrity guarantee.
   - Demo buttons for 1-click test scenarios:
     - `Transfer ₹1,000` (Sufficient Balance ➔ Approved)
     - `Test Overdraft Trap` (Overdraft ➔ Rejected, balances unchanged)
     - `Test Invalid Receiver Trap` (Unknown Account ➔ Rejected, balances unchanged)

5. **Indian Rupee Standard (₹ INR Everywhere)**:
   - Currency standard strictly enforced across all components using:
     ```javascript
     new Intl.NumberFormat('en-IN', {
       style: 'currency',
       currency: 'INR',
       minimumFractionDigits: 2
     })
     ```
   - Examples: `₹1,000.00`, `₹5,000.00`, `₹25,000.00`, `₹1,50,000.00`, `₹10,00,000.00`.
   - Never displays dollars or USD.
   - Stored in MongoDB as raw numeric values for accurate calculations.

6. **Dedicated Three-Subject Integration Page (`/three-subject-integration`)**:
   - In-depth demonstration of how **Full Stack Web Development**, **Computer Networks**, and **FLAT** converge in a single financial transaction.

7. **Dual-Mode Persistence Architecture**:
   - Connects to MongoDB Atlas when network access is available.
   - Gracefully and transparently activates an **In-Memory Store** if MongoDB Atlas is unconfigured or blocked, ensuring zero crashes and 100% demo uptime.

---

## 🏛️ System Architecture

```
+-------------------------------------------------------------------------------+
|                             CLIENT TIER (React 18 SPA)                        |
|                                                                               |
|  [ Banking Dashboard ]  [ Balance Enquiry ]  [ Fund Transfer ]  [ DFA Monitor]|
|                                                                               |
|       |                           |                        |                  |
|       | Axios API Calls           | JWT Auth Bearer Token  | JSON Payload     |
+-------|---------------------------|------------------------|------------------+
        |                           |                        |
        v                           v                        v
+-------------------------------------------------------------------------------+
|                       COMPUTER NETWORKS TRANSPORT LAYER                       |
|                                                                               |
|   HTTP/1.1 REST Endpoints  •  TCP/IP 4-Layer Stack  •  TLS 1.3 / HTTPS        |
|   Telemetry Middleware: RTT Latency Logger, Status Codes, Packet Byte Counter |
+-------------------------------------------------------------------------------+
        |                           |                        |
        v                           v                        v
+-------------------------------------------------------------------------------+
|                          SERVER TIER (Node.js / Express)                      |
|                                                                               |
|   Express Router (/api/auth, /api/accounts, /api/transactions, /api/dfa)      |
|   Security: bcrypt Password Hashing, JWT Verification, Input Sanitization     |
+-------------------------------------------------------------------------------+
        |                                                                ^
        | State Evaluation                                               | State Events
        v                                                                |
+-------------------------------------------------------------------------------+
|                 FORMAL LANGUAGES & AUTOMATA THEORY (FLAT) ENGINE              |
|                                                                               |
|   Transaction DFA M_trans = (Q, Σ, δ, q0, F)                                  |
|   Q = { INITIATED, APPROVED, REJECTED }                                       |
|   Σ = { VALID_TRANSACTION, INVALID_RECEIVER, INSUFFICIENT_BALANCE, ... }      |
|   δ(INITIATED, VALID_TRANSACTION) → APPROVED                                  |
|   δ(INITIATED, INSUFFICIENT_BALANCE) → REJECTED                               |
+-------------------------------------------------------------------------------+
        |                                                                ^
        | Atomic Debit/Credit                                            | Fetch Records
        v                                                                |
+-------------------------------------------------------------------------------+
|                            DATABASE PERSISTENCE TIER                          |
|                                                                               |
|   MongoDB Atlas / Mongoose ORM (with Resilient In-Memory Fallback Engine)    |
|   Collections: Users, Accounts, Transactions (with immutable fsmHistory)      |
+-------------------------------------------------------------------------------+
```

---

## 📐 Transaction DFA Mathematical Model (FLAT)

### 1. Formal 5-Tuple Definition
$$M_{trans} = (Q, \Sigma, \delta, q_0, F)$$

- **Set of States $Q$**:
  $$Q = \{\text{INITIATED}, \text{APPROVED}, \text{REJECTED}\}$$
- **Input Alphabet $\Sigma$**:
  $$\Sigma = \{\text{VALID\_TRANSACTION}, \text{INVALID\_RECEIVER}, \text{INSUFFICIENT\_BALANCE}, \text{DATABASE\_FAILURE}\}$$
- **Initial State $q_0$**:
  $$q_0 = \text{INITIATED}$$
- **Set of Final States $F$**:
  $$F = \{\text{APPROVED}, \text{REJECTED}\}$$
  *(Both are terminal absorbing states)*

### 2. State Transition Function $\delta: Q \times \Sigma \to Q$

```
                   INITIATED (Blue)
                     /          \
  VALID_TRANSACTION /            \ INVALID_RECEIVER / INSUFFICIENT_BALANCE / FAIL
                   v              v
           APPROVED (Green)      REJECTED (Red)
```

| State $q \in Q$ | VALID_TRANSACTION | INVALID_RECEIVER | INSUFFICIENT_BALANCE | DATABASE_FAILURE |
| :--- | :--- | :--- | :--- | :--- |
| **INITIATED ($q_0$)** | **APPROVED** | **REJECTED** | **REJECTED** | **REJECTED** |
| **APPROVED ($q_{app} \in F$)** | APPROVED | APPROVED | APPROVED | APPROVED |
| **REJECTED ($q_{rej} \in F$)** | REJECTED | REJECTED | REJECTED | REJECTED |

---

## 👥 Pre-Configured Demo Accounts

| Account Holder | Email | Password | Account Number | Simulated Balance | Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Rahul Sharma** | `rahul@securebank.com` | `Demo1234!` | `SB5012349876` | **₹1,50,000.00** | Customer |
| **Priya Sundaram** | `priya@securebank.com` | `Demo1234!` | `SB7089123456` | **₹2,75,000.00** | Customer |
| **Vikram Patel** | `vikram@securebank.com` | `Demo1234!` | `SB3040506070` | **₹85,000.00** | Customer |
| **Bank Administrator** | `admin@securebank.com` | `Admin1234!` | `SB9990001122` | **₹10,00,000.00** | Admin |

*(Quick-fill 1-click credential buttons are available on the Login page).*

---

## 🚀 How to Run the Application

### Option A: 1-Click Launch Script (Windows)
Double-click `start-all.bat` in the root folder, or run:
```cmd
cd C:\Users\kavi\Downloads\securebank-dfa
.\start-all.bat
```
*This opens both the Express Backend on port `5000` and the Vite React Frontend on port `5173`.*

### Option B: Manual Terminal Execution

#### 1. Backend Server (Port 5000)
```powershell
cd C:\Users\kavi\Downloads\securebank-dfa\server
node index.js
```

#### 2. Frontend Client (Port 5173)
```powershell
cd C:\Users\kavi\Downloads\securebank-dfa\client
npm run dev
```

Open browser at: **[http://localhost:5173](http://localhost:5173)**

---

## 🧪 Comprehensive Verification Suite (All 12 Tests Passed)

To execute the internal verification suite:
```powershell
cd C:\Users\kavi\Downloads\securebank-dfa\server
node test-unit.js
```

### Actual Test Execution Output:
```
========================================================================
🏛️  SECUREBANK COMPREHENSIVE VERIFICATION SUITE (ALL 12 TESTS)
========================================================================

TEST 1: Register a new user
  ✅ User Registered: Ananya Iyer (testuser_1794581630082@securebank.com)
  ✅ Bank Account Created: SB7943487127 with ₹50,000

TEST 2: Login with valid credentials
  ✅ Password verified via bcrypt hash
  ✅ JWT Session Token Issued (Expires in 8h): eyJhbGciOiJIUzI1NiIsInR5cCI6...
  ✅ Dashboard accessible for User ID: usr_rahul_001

TEST 3: Login with invalid credentials
  ✅ Invalid password correctly rejected with error message: "Invalid credentials"

TEST 4: Check account balance
  ✅ Fetched Live Balance for Priya Sundaram:
  ✅ Account: SB7089123456 -> Balance: ₹2,75,000.00 (Stored as numeric: 275000)

TEST 5: Transfer ₹1,000 with sufficient balance (INITIATED -> APPROVED)
  Step 1: Automaton state is INITIATED (q0)
  Step 2: Automaton state transitioned to APPROVED (q_app ∈ F)
  ✅ Transaction Settled: TX ID TXN8163046468K
  ✅ Sender Balance: ₹1,50,000 ➔ ₹1,49,000 (-₹1,000)
  ✅ Receiver Balance: ₹2,75,000 ➔ ₹2,76,000 (+₹1,000)
  ✅ Transaction DFA Status: APPROVED

TEST 6: Transfer more than available balance (INITIATED -> REJECTED)
  Step 1: State is INITIATED (q0)
  Step 2: State transitioned to REJECTED (q_rej ∈ F)
  ✅ Overdraft trapped: INITIATED ➔ REJECTED
  ✅ Sender Balance safely unchanged at ₹1,49,000
  ✅ Rejection record saved in MongoDB: TX ID TXN8163046487F (Status: REJECTED)

TEST 7: Transfer to invalid receiver (INITIATED -> REJECTED)
  ✅ Invalid receiver trapped: INITIATED ➔ REJECTED
  ✅ Balances safely unchanged at ₹1,49,000
  ✅ Rejection record saved: TX ID TXN81630464FX2

TEST 8: Transfer zero or negative amount
  ✅ Validation successfully catches zero and negative values: amount must be > ₹0

TEST 9: Access protected API without authentication
  ✅ Protected route correctly blocked with HTTP 401 Unauthorized

TEST 10: Open Transaction History
  ✅ Fetched 7 transactions for account SB5012349876
  ✅ Latest TX ID: TXN8163046468K | Amount: ₹1,000 | DFA Status: APPROVED

TEST 11: Open DFA Monitor (Formal 5-Tuple & Transaction Status)
  ✅ DFA 5-Tuple M = (Q, Σ, δ, q0, F):
     Q:  { INITIATED, APPROVED, REJECTED }
     Σ:  { VALID_TRANSACTION, INVALID_RECEIVER, INSUFFICIENT_BALANCE, DATABASE_FAILURE }
     q0: INITIATED
     F:  { APPROVED, REJECTED }
  ✅ Live Transaction Status for TXN8163046468K: State = APPROVED
  ✅ Audit Trail length: 2 recorded state transitions

TEST 12: Refresh the application (Database Data Persistence)
  ✅ Database state verified: 5 users, 8 transactions
  ✅ Approved Transactions: 5 | Rejected Transactions: 3
  ✅ Total Settlement Volume: ₹2,16,000

========================================================================
🏁 TEST RESULTS: 12 / 12 TESTS PASSED
🎉 ALL 12 HACKATHON VERIFICATION TESTS COMPLETED SUCCESSFULLY WITH 0 ERRORS!
========================================================================
```

---

## 📁 Key Modified and Created Files

- `server/dfa/transactionFSM.js`: Implements canonical 3-state Transaction DFA $M_{trans} = (Q, \Sigma, \delta, q_0, F)$ and transition table $\delta$.
- `server/services/dbService.js`: Implements atomic transfers, `recordRejectedTransfer`, `getTransactionById`, and dual MongoDB/in-memory persistence.
- `server/routes/transactions.js`: Endpoints `POST /transfer`, `GET /history`, and `GET /:id/status`.
- `server/test-unit.js`: Complete 12-test hackathon verification suite.
- `client/src/pages/BalanceEnquiryPage.jsx`: Dedicated Indian digital banking balance enquiry page with live network telemetry.
- `client/src/pages/DfaMonitorPage.jsx`: Dedicated DFA transaction monitor with SVG diagram, state lookup, and interactive testbed.
- `client/src/pages/TransferPage.jsx`: Fund transfer page with live DFA state synchronization, overdraft test triggers, and receipt generation.
- `client/src/pages/DashboardPage.jsx`: Metric cards (Balance, Total, Approved, Rejected) and Quick Action buttons.
- `client/src/pages/TransactionsPage.jsx`: Filterable ledger with masked accounts and color-coded status badges (INITIATED - Blue, APPROVED - Green, REJECTED - Red).
- `client/src/components/TransactionDfaVisualizer.jsx`: Animated SVG graph of canonical 3-state transaction DFA.
- `client/src/components/Sidebar.jsx`: Full banking navigation (Dashboard, Balance Enquiry, Fund Transfer, Transaction History, DFA Monitor, Logout).
- `client/src/utils/formatters.js`: Indian Rupee currency standard formatting using `Intl.NumberFormat('en-IN')`.
