const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Deploying GHC Token contract...');

  const GHCToken = await ethers.getContractFactory('GHCToken');
  const ghcToken = await GHCToken.deploy();

  await ghcToken.waitForDeployment();

  const address = await ghcToken.getAddress();
  console.log('GHC Token deployed to:', address);

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('Deploying from account:', deployer.address);

  // Assign roles to test accounts
  console.log('Assigning roles to test accounts...');

  // Governance accounts
  const governanceAccounts = [
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  ];

  // Certifier accounts
  const certifierAccounts = [
    '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
  ];

  // Producer accounts
  const producerAccounts = [
    '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
    '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
  ];

  // Get role hashes
  const GOVERNANCE_ROLE = await ghcToken.GOVERNANCE_ROLE();
  const CERTIFIER_ROLE = await ghcToken.CERTIFIER_ROLE();
  const PRODUCER_ROLE = await ghcToken.PRODUCER_ROLE();

  console.log('Role hashes:');
  console.log('GOVERNANCE_ROLE:', GOVERNANCE_ROLE);
  console.log('CERTIFIER_ROLE:', CERTIFIER_ROLE);
  console.log('PRODUCER_ROLE:', PRODUCER_ROLE);

  // Assign governance roles
  for (const account of governanceAccounts) {
    try {
      const tx = await ghcToken.grantRole(GOVERNANCE_ROLE, account);
      await tx.wait();
      console.log(`✅ Granted GOVERNANCE_ROLE to ${account}`);
    } catch (error) {
      console.log(
        `⚠️ Failed to grant GOVERNANCE_ROLE to ${account}:`,
        error.message
      );
    }
  }

  // Assign certifier roles
  for (const account of certifierAccounts) {
    try {
      const tx = await ghcToken.grantRole(CERTIFIER_ROLE, account);
      await tx.wait();
      console.log(`✅ Granted CERTIFIER_ROLE to ${account}`);
    } catch (error) {
      console.log(
        `⚠️ Failed to grant CERTIFIER_ROLE to ${account}:`,
        error.message
      );
    }
  }

  // Assign producer roles
  for (const account of producerAccounts) {
    try {
      const tx = await ghcToken.grantRole(PRODUCER_ROLE, account);
      await tx.wait();
      console.log(`✅ Granted PRODUCER_ROLE to ${account}`);
    } catch (error) {
      console.log(
        `⚠️ Failed to grant PRODUCER_ROLE to ${account}:`,
        error.message
      );
    }
  }

  // Create some initial batches for testing
  console.log('Creating initial batches...');

  // Batch 1: 100,000 GHC
  const tx1 = await ghcToken.createBatch(1, ethers.parseUnits('100000', 0));
  await tx1.wait();
  console.log('Batch 1 created: 100,000 GHC');

  // Batch 2: 50,000 GHC
  const tx2 = await ghcToken.createBatch(1, ethers.parseUnits('50000', 0));
  await tx2.wait();
  console.log('Batch 2 created: 50,000 GHC');

  // Batch 3: 75,000 GHC
  const tx3 = await ghcToken.createBatch(1, ethers.parseUnits('75000', 0));
  await tx3.wait();
  console.log('Batch 3 created: 75,000 GHC');

  // Batch 4: 25,000 GHC
  const tx4 = await ghcToken.createBatch(1, ethers.parseUnits('25000', 0));
  await tx4.wait();
  console.log('Batch 4 created: 25,000 GHC');

  // Batch 5: 150,000 GHC
  const tx5 = await ghcToken.createBatch(1, ethers.parseUnits('150000', 0));
  await tx5.wait();
  console.log('Batch 5 created: 150,000 GHC');

  console.log('Deployment completed successfully!');
  console.log('Contract address:', address);
  console.log('Network:', (await ethers.provider.getNetwork()).name);

  // Update the config file with the new contract address
  updateConfigFile(address);
}

function updateConfigFile(contractAddress) {
  const configPath = path.join(__dirname, '..', 'lib', 'config.ts');

  try {
    let configContent = fs.readFileSync(configPath, 'utf8');

    // Replace the contract address in the config file
    configContent = configContent.replace(
      /CONTRACT_ADDRESS: '[^']*'/,
      `CONTRACT_ADDRESS: '${contractAddress}'`
    );

    fs.writeFileSync(configPath, configContent);
    console.log(
      `✅ Updated config file with new contract address: ${contractAddress}`
    );
  } catch (error) {
    console.error('❌ Failed to update config file:', error.message);
    console.log('Please manually update the CONTRACT_ADDRESS in lib/config.ts');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
