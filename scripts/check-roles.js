const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Checking roles for test accounts...');

  // Read contract address from config file
  const configPath = path.join(__dirname, '..', 'lib', 'config.ts');
  const configContent = fs.readFileSync(configPath, 'utf8');
  const match = configContent.match(/CONTRACT_ADDRESS: '([^']*)'/);
  const contractAddress = match
    ? match[1]
    : '0x0165878A594ca255338adfa4d48449f69242Eb8F';
  const GHCToken = await ethers.getContractFactory('GHCToken');
  const contract = GHCToken.attach(contractAddress);

  // Test accounts
  const testAccounts = [
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  ];

  for (const account of testAccounts) {
    try {
      const roles = await contract.getUserRoles(account);
      console.log(`Account ${account}:`);
      console.log(`  Roles: ${roles.join(', ')}`);

      // Check specific roles
      const hasGovernance = await contract.hasRole(
        await contract.GOVERNANCE_ROLE(),
        account
      );
      console.log(`  Has Governance Role: ${hasGovernance}`);
      console.log('');
    } catch (error) {
      console.error(`Error checking roles for ${account}:`, error.message);
    }
  }

  // Check deployer roles
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer (${deployer.address}):`);
  const deployerRoles = await contract.getUserRoles(deployer.address);
  console.log(`  Roles: ${deployerRoles.join(', ')}`);
  const deployerHasGovernance = await contract.hasRole(
    await contract.GOVERNANCE_ROLE(),
    deployer.address
  );
  console.log(`  Has Governance Role: ${deployerHasGovernance}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
