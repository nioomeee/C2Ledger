# H2Ledger Setup Guide 🚀

## 🎯 What We've Built

A complete **Green Hydrogen Credits (GHC) platform** with:

- ✅ **MetaMask Wallet Integration** - Secure blockchain wallet connection
- ✅ **Smart Contract** - ERC-1155 GHC token contract on Hardhat local network
- ✅ **Real-time Dashboard** - Live portfolio and batch management
- ✅ **Blockchain Explorer** - Transaction history and network activity
- ✅ **Modern UI/UX** - Beautiful interface with Tailwind CSS

## 🚀 Quick Start (3 Steps)

### Step 1: Start Hardhat Node

```bash
npm run hardhat:node
```

**Keep this terminal running!** You'll see:

```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Step 2: Deploy Smart Contract

```bash
npm run hardhat:deploy
```

You'll see:

```
GHC Token deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Batch 1 created: 100,000 GHC
Batch 2 created: 50,000 GHC
...
```

### Step 3: Start Frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔧 MetaMask Setup

### 1. Add Hardhat Network

- Open MetaMask
- Click network dropdown → "Add Network" → "Add Network Manually"
- Fill in:
  - **Network Name:** Hardhat Local
  - **New RPC URL:** http://127.0.0.1:8545
  - **Chain ID:** 31337
  - **Currency Symbol:** ETH

### 2. Import Test Account

- In MetaMask: Account icon → "Import Account"
- Copy private key from Hardhat node output
- Paste and import

## 🎮 How to Use

### 1. Connect Wallet

- Visit [http://localhost:3000](http://localhost:3000)
- Click "Connect Wallet"
- Approve MetaMask connection
- You'll be redirected to dashboard

### 2. View Portfolio

- See your total GHC holdings
- View individual batch information
- Check batch status (Active/Partial/Retired)

### 3. Blockchain Operations

- **Mint:** Create new GHC tokens (admin only)
- **Transfer:** Send GHC to other addresses
- **Retire:** Burn GHC tokens permanently

## 🏗️ Project Structure

```
H2Ledger/
├── 📁 app/                    # Next.js pages
│   ├── 🏠 page.tsx           # Homepage with wallet connection
│   ├── 📊 dashboard/          # Portfolio dashboard
│   ├── 🔍 explorer/          # Blockchain explorer
│   └── 📄 layout.tsx         # Root layout with wallet provider
├── 📁 blockchain/             # Smart contracts
│   ├── 📜 contracts/         # Solidity contracts
│   ├── 🚀 scripts/           # Deployment scripts
│   └── ⚙️ hardhat.config.ts  # Hardhat configuration
├── 📁 components/             # React components
│   ├── 🎨 ui/                # UI components (buttons, cards, etc.)
│   ├── 🏠 HomePage.tsx       # Homepage component
│   └── 🧭 Navigation.tsx     # Navigation component
├── 📁 contexts/               # React contexts
│   └── 💰 WalletContext.tsx  # Wallet state management
├── 📁 lib/                    # Utilities
│   ├── 🔗 contractService.ts # Blockchain interaction
│   └── 🛠️ utils.ts           # Helper functions
└── 📚 README.md               # Project documentation
```

## 🔐 Smart Contract Features

### GHC Token Contract (`GHCToken.sol`)

- **ERC-1155 Multi-Token Standard** for batch management
- **Access Control** - Owner-only batch creation
- **Status Tracking** - Active/Partial/Retired states
- **Event Logging** - Complete transaction history

### Key Functions

```solidity
// Admin functions
createBatch(tokenType, quantity)     // Create new GHC batch
mintBatch(batchId, to, quantity)    // Mint tokens to address

// User functions
transferBatch(batchId, from, to, qty) // Transfer between addresses
retireBatch(batchId, quantity)       // Burn/retire tokens

// View functions
getBatch(batchId)                    // Get batch details
getUserBatches(user)                 // Get user's batches
getPortfolioValue(user)              // Calculate total holdings
```

## 🧪 Testing

### Run Contract Tests

```bash
npx hardhat test
```

### Test Coverage

```bash
npx hardhat coverage
```

## 🚨 Troubleshooting

### Common Issues

1. **"MetaMask not installed"**

   - Install MetaMask browser extension
   - Refresh page

2. **"Wrong network"**

   - Ensure MetaMask is on Hardhat Local (Chain ID: 31337)
   - Check Hardhat node is running on port 8545

3. **"Contract not found"**

   - Verify contract address in components
   - Ensure contract was deployed successfully
   - Check Hardhat node is running

4. **"Transaction failed"**
   - Ensure sufficient ETH in test account
   - Check you're contract owner for admin functions

### Reset Everything

```bash
# Stop all processes
# Delete artifacts and cache
rm -rf artifacts cache

# Restart Hardhat node
npm run hardhat:node

# Redeploy contract
npm run hardhat:deploy

# Restart frontend
npm run dev
```

## 🔄 Development Workflow

### 1. Smart Contract Changes

- Modify contracts in `blockchain/contracts/`
- Update deployment scripts in `blockchain/scripts/`
- Redeploy: `npm run hardhat:deploy`

### 2. Frontend Changes

- Update React components in `components/`
- Modify pages in `app/`
- Update contract service in `lib/contractService.ts`

### 3. Testing Changes

- Run tests: `npx hardhat test`
- Check coverage: `npx hardhat coverage`

## 📱 Available Scripts

```bash
npm run dev              # Start frontend development server
npm run build            # Build for production
npm run start            # Start production server
npm run setup            # Run setup script
npm run hardhat:node     # Start local Hardhat network
npm run hardhat:deploy   # Deploy smart contract
npm run hardhat:compile  # Compile smart contracts
```

## 🌐 Network Configuration

### Hardhat Local Network

- **RPC URL:** http://127.0.0.1:8545
- **Chain ID:** 31337
- **Currency:** ETH
- **Block Explorer:** None (local network)

### Test Accounts

- **Account #0:** 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (Owner)
- **Account #1:** 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
- **Account #2:** 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
- **...and more**

## 🎉 What's Next?

### Immediate Features

- [ ] **Issue Credits Page** - Admin interface for creating new batches
- [ ] **Transfer Credits Page** - User interface for sending GHC
- [ ] **Retire Credits Page** - Interface for burning GHC tokens
- [ ] **Transaction History** - Complete activity log

### Future Enhancements

- [ ] **Multi-chain Support** - Ethereum mainnet, Polygon, etc.
- [ ] **Advanced Analytics** - Charts and insights
- [ ] **Mobile App** - React Native version
- [ ] **API Integration** - External data sources
- [ ] **Governance** - DAO voting system

## 📞 Support

### Getting Help

1. Check this setup guide
2. Review the README.md
3. Check console for error messages
4. Verify network configuration
5. Ensure all services are running

### Useful Commands

```bash
# Check if Hardhat is running
curl http://127.0.0.1:8545

# View contract logs
npx hardhat console --network localhost

# Get contract balance
npx hardhat run scripts/getBalance.js --network localhost
```

---

**🎯 You're all set! The H2Ledger platform is now running with full blockchain integration.**

**Happy coding! 🚀**
