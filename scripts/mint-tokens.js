const { ethers } = require('hardhat');

async function main() {
  console.log('Minting tokens to test accounts...');

  // Get the deployed contract
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const GHCToken = await ethers.getContractFactory('GHCToken');
  const ghcToken = GHCToken.attach(contractAddress);

  // Test accounts from config
  const governanceAccounts = [
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  ];

  const certifierAccounts = [
    '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
  ];

  const producerAccounts = [
    '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
    '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
  ];

  // Mint tokens to governance accounts (they can mint themselves)
  console.log('Minting tokens to governance accounts...');
  for (let i = 0; i < governanceAccounts.length; i++) {
    const account = governanceAccounts[i];
    const batchId = i + 1; // Use different batches for each account
    
    try {
      const tx = await ghcToken.mintBatch(batchId, account, ethers.parseUnits('10000', 0));
      await tx.wait();
      console.log(`✅ Minted 10,000 GHC from batch ${batchId} to ${account}`);
    } catch (error) {
      console.log(`⚠️  Failed to mint to ${account}: ${error.message}`);
    }
  }

  // Mint tokens to certifier accounts
  console.log('Minting tokens to certifier accounts...');
  for (let i = 0; i < certifierAccounts.length; i++) {
    const account = certifierAccounts[i];
    const batchId = (i % 5) + 1; // Distribute across batches
    
    try {
      const tx = await ghcToken.mintBatch(batchId, account, ethers.parseUnits('5000', 0));
      await tx.wait();
      console.log(`✅ Minted 5,000 GHC from batch ${batchId} to ${account}`);
    } catch (error) {
      console.log(`⚠️  Failed to mint to ${account}: ${error.message}`);
    }
  }

  // Mint tokens to producer accounts
  console.log('Minting tokens to producer accounts...');
  for (let i = 0; i < producerAccounts.length; i++) {
    const account = producerAccounts[i];
    const batchId = (i % 5) + 1; // Distribute across batches
    
    try {
      const tx = await ghcToken.mintBatch(batchId, account, ethers.parseUnits('3000', 0));
      await tx.wait();
      console.log(`✅ Minted 3,000 GHC from batch ${batchId} to ${account}`);
    } catch (error) {
      console.log(`⚠️  Failed to mint to ${account}: ${error.message}`);
    }
  }

  console.log('\n🎉 Token minting completed!');
  console.log('Now test accounts should have data in getUserBatches and getUserRoles');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
