const { ethers } = require('hardhat');

async function main() {
  console.log('Deploying GHC Token contract...');

  const GHCToken = await ethers.getContractFactory('GHCToken');
  const ghcToken = await GHCToken.deploy();

  await ghcToken.waitForDeployment();

  const address = await ghcToken.getAddress();
  console.log('GHC Token deployed to:', address);

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
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
