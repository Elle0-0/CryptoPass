# CryptoPass

> Breaking the chain of paper tickets, one block at a time.

CryptoPass is a decentralized ticketing application built on the **Ethereum Sepolia Testnet**. It tackles common ticketing problems — fraud, double-spending, and unclear ownership — by representing every ticket as an **ERC-20 token** on the blockchain, making them secure, transparent, and impossible to counterfeit.

Tickets are purchased with Sepolia ETH (SETH) and managed entirely through a custom Solidity smart contract. A React frontend provides an accessible interface for attendees, venue staff, and event organizers alike.

**Course:** CS4455 — Ethical Hacking and Security 1: Blockchain Technologies and Applications

---

## Features

| Feature | Description |
|---------|-------------|
| **Wallet Creation** | Generate a new Ethereum wallet with encrypted keystore file download |
| **Ticket Purchase** | Buy up to 2 tickets per transaction using SETH, with MetaMask or keystore file |
| **Ticket Refund** | Return unused tickets and receive an automatic ETH refund from the vendor's balance |
| **Ticket Burning** | Doormen can permanently invalidate used tickets by burning them to the zero address |
| **Balance Dashboard** | Check ETH balance and CryptoPass token count with role-specific views (User / Doorman / Vendor) |
| **Vendor Earnings** | Vendors can withdraw accumulated ticket sale revenue directly from the contract |

---

## Architecture

### Smart Contract — `TicketToken.sol`

The contract is a **custom ERC-20 implementation** written in Solidity, deployed on the Sepolia testnet. It goes beyond standard token functionality to support a full ticketing lifecycle:

- **ERC-20 Compliance** — Implements `transfer`, `transferFrom`, `approve`, `allowance`, mint, and burn
- **SETH-Based Purchases** — Users send ETH directly to the contract via `buyTicket()` to receive tokens; `refundTicket()` reverses the process
- **Role-Based Access Control** — Three roles enforced via modifiers:
  - `onlyOwner` — Contract deployer; can set prices, assign roles, withdraw residual funds
  - `onlyVendor` — Distributes tickets, withdraws ticket sale earnings
  - `onlyDoorman` — Burns tickets at the venue entrance
- **Reentrancy Protection** — A `noReentrancy` modifier guards all ETH transfer functions
- **Configurable Deployment** — Ticket price, vendor address, and token supply are passed as constructor arguments (no hardcoded values)

### Frontend — React + Web3.js

The React app provides four main pages:

```
Home Page
├── Create Wallet ─── Generate wallet + download encrypted keystore (.json)
├── Buy Tickets ───── Purchase tickets via MetaMask or keystore file
├── Check Balance ─── Role-based dashboard (User / Doorman / Vendor tabs)
└── Return Tickets ── Refund tickets for ETH
```

**Wallet connectivity** supports two methods:
1. **MetaMask** — Direct browser wallet connection
2. **Keystore File** — Upload an encrypted `.json` keystore and enter the password

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React |
| Smart Contract | Solidity (ERC-20) |
| Blockchain Interaction | Web3.js |
| Network | Ethereum Sepolia Testnet |
| Testing | Remix IDE + Solidity unit tests (`remix_tests`) |
| Contract Deployment | Remix IDE |

---

## Project Structure

```
CryptoPass/
├── contracts/
│   ├── TicketToken.sol            # Main smart contract (ERC-20 + ticketing logic)
│   ├── ERC20Interface.sol         # ERC-20 interface definition
│   └── artifacts/                 # Compiled ABI and bytecode
├── tests/
│   └── TicketToken_test.sol       # Solidity-based test suite
├── cryptopass-dapp/
│   ├── src/
│   │   ├── abi/                   # Contract ABI for Web3.js
│   │   ├── components/
│   │   │   ├── BuyTicket.js       # Ticket purchasing flow
│   │   │   ├── CreateWallet.js    # Wallet generation + keystore export
│   │   │   ├── DecryptWallet.js   # Keystore file decryption
│   │   │   ├── ReturnTicket.js    # Ticket refund flow
│   │   │   ├── Shows.js           # "What's On" event listing
│   │   │   ├── TicketToken.js     # Web3 contract interaction logic
│   │   │   ├── NavBar.js          # Navigation bar
│   │   │   └── Footer.js          # Page footer
│   │   ├── pages/
│   │   │   ├── HomePage.js        # Landing page with navigation grid
│   │   │   ├── WalletPage.js      # Wallet creation page
│   │   │   └── BalanceChecker.js  # Balance dashboard (User/Doorman/Vendor)
│   │   └── styles/                # CSS for each component
│   ├── public/
│   ├── .env                       # Contract + doorman address config
│   └── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** and **npm**
- **MetaMask** browser extension (optional, for wallet connection)
- Sepolia testnet ETH — available from [Sepolia faucets](https://sepolia-faucet.pk910.de/)

### 1. Clone the Repository

```bash
git clone https://github.com/Elle0-0/CryptoPass.git
cd CryptoPass/cryptopass-dapp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `cryptopass-dapp/` directory:

```env
REACT_APP_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS
REACT_APP_DOORMAN_ADDRESS=YOUR_DOORMAN_ADDRESS
```

### 4. Start the Development Server

```bash
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to use the app.

---

## Testing

The test suite is written in Solidity using the `remix_tests` framework and runs inside Remix IDE. It covers:

- **Initialization** — Token supply correctly assigned to vendor on deployment
- **ERC-20 compliance** — `transfer`, `approve`, `allowance`, `transferFrom` behave correctly
- **Ticket operations** — Buying and refunding tickets updates balances accurately
- **Access control** — Only authorized roles can call admin functions (price changes, vendor assignment)
- **Failure cases** — Insufficient balance transfers, unauthorized admin calls, and invalid refunds revert as expected

---

## Verified On-Chain Transactions (Sepolia)

The contract is live on the Sepolia testnet with verified transactions:

| Action | Etherscan Link |
|--------|---------------|
| **Contract Deployment** | [View Transaction](https://sepolia.etherscan.io/tx/0x05ddea5109abef828b35af3e4b966f6ce770125d87f21b88aaba0d067430b23a#eventlog) |
| **All Contract Transactions** | [View Contract](https://sepolia.etherscan.io/address/0x1854CAB9bdcAac14c95a9a58A41eF5deFd607e33) |
| **Buy Ticket** | [View Transaction](https://sepolia.etherscan.io/tx/0xab59858114bfbbe4215129ec66dc13ec8d9d309a6f867f0510a4e0f47766a6a5) |
| **Refund Ticket** | [View Transaction](https://sepolia.etherscan.io/tx/0x2a618494a6f0817b3be1428ac1f3c087c6080fa8efe6be92860aed38e3a45444) |
| **Burn Ticket** | [View Transaction](https://sepolia.etherscan.io/tx/0xccadb4e4f0cb96436a555d02b5dc39885aff25c3168b7e14409a6b1c6cc8fbb4) |

---

## Security Design

- **Reentrancy Guard** — All ETH-transferring functions use a `noReentrancy` mutex to prevent reentrancy attacks
- **Role-Based Access** — `onlyOwner`, `onlyVendor`, and `onlyDoorman` modifiers restrict sensitive operations
- **Zero-Address Validation** — Role assignments are validated against `address(0)` to prevent misconfiguration
- **Separated Funds** — Vendor earnings are tracked independently from contract balance, enabling clean accounting and safe withdrawals
- **Purchase Limits** — Maximum 2 tickets per transaction to prevent bulk buying

---

## License

This project was developed as part of a Project for CS4455 at The University of Limerick.
