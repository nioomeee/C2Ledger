#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 H2Ledger Setup Script');
console.log('========================\n');

// Check if Hardhat is installed
try {
  require.resolve('hardhat');
  console.log('✅ Hardhat is already installed');
} catch (e) {
  console.log('📦 Installing Hardhat...');
  try {
    execSync(
      'npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts',
      { stdio: 'inherit' }
    );
    console.log('✅ Hardhat installed successfully');
  } catch (error) {
    console.error('❌ Failed to install Hardhat:', error.message);
    process.exit(1);
  }
}

// Check if ethers is installed
try {
  require.resolve('ethers');
  console.log('✅ Ethers is already installed');
} catch (e) {
  console.log('📦 Installing Ethers...');
  try {
    execSync('npm install ethers', { stdio: 'inherit' });
    console.log('✅ Ethers installed successfully');
  } catch (error) {
    console.error('❌ Failed to install Ethers:', error.message);
    process.exit(1);
  }
}

console.log('\n📋 Setup Instructions:');
console.log('=====================');
console.log('1. Start Hardhat node in a new terminal:');
console.log('   npx hardhat node');
console.log('');
console.log('2. Deploy the contract in another terminal:');
console.log('   npx hardhat run scripts/deploy.ts --network localhost');
console.log('');
console.log('3. Start the frontend:');
console.log('   npm run dev');
console.log('');
console.log('4. Configure MetaMask:');
console.log('   - Network: Hardhat Local');
console.log('   - RPC URL: http://127.0.0.1:8545');
console.log('   - Chain ID: 31337');
console.log('   - Import a test account using private keys from Hardhat node');
console.log('');
console.log('5. Connect your wallet at http://localhost:3000');
console.log('');
console.log('📚 For detailed instructions, see README.md');
console.log('');
console.log('🎉 Setup complete! Happy coding! 🚀');
