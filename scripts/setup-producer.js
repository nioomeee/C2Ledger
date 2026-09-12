const { ethers } = require('hardhat');

async function main() {
  console.log('Setting up producer account...');

  // Get the signer (deployer account)
  const [deployer] = await ethers.getSigners();
  console.log('Using account:', deployer.address);

  // Contract address
  const contractAddress = '0x0165878A594ca255338adfa4d48449f69242Eb8F';

  // User's producer account
  const producerAddress = '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720';

  // Get contract instance
  const GHCToken = await ethers.getContractFactory('GHCToken');
  const contract = GHCToken.attach(contractAddress);

  try {
    // Check if user already has producer role
    const hasProducerRole = await contract.hasRole(
      await contract.PRODUCER_ROLE(),
      producerAddress
    );
    console.log('User has producer role:', hasProducerRole);

    if (!hasProducerRole) {
      // Grant producer role
      console.log('Granting producer role...');
      const grantTx = await contract.grantRole(
        await contract.PRODUCER_ROLE(),
        producerAddress
      );
      await grantTx.wait();
      console.log('Producer role granted successfully!');
    }

    // Check user's current balance
    const userBatches = await contract.getUserBatchesPublic(producerAddress);
    console.log('User batches:', userBatches);

    if (userBatches.length === 0) {
      // Create a batch and mint credits
      console.log('Creating batch and minting credits...');

      // Create batch
      const createTx = await contract.createBatch(1, 150000);
      const createReceipt = await createTx.wait();

      // Find the batch ID from the event
      const batchCreatedEvent = createReceipt.logs.find((log) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'BatchCreated';
        } catch {
          return false;
        }
      });

      if (batchCreatedEvent) {
        const parsed = contract.interface.parseLog(batchCreatedEvent);
        const batchId = Number(parsed.args.batchId);
        console.log('Batch created with ID:', batchId);

        // Mint credits to user
        const mintTx = await contract.mintBatch(
          batchId,
          producerAddress,
          150000
        );
        await mintTx.wait();
        console.log('Credits minted successfully!');
      }
    }

    // Verify the setup
    const finalUserBatches = await contract.getUserBatchesPublic(
      producerAddress
    );
    console.log('Final user batches:', finalUserBatches);

    if (finalUserBatches.length > 0) {
      const balance = await contract.balanceOf(
        producerAddress,
        finalUserBatches[0]
      );
      console.log('User balance:', Number(balance));
    }

    const hasRole = await contract.hasRole(
      await contract.PRODUCER_ROLE(),
      producerAddress
    );
    console.log('Final producer role status:', hasRole);

    console.log('Producer setup completed successfully!');
  } catch (error) {
    console.error('Error setting up producer:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
