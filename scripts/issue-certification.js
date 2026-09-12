const { ethers } = require('hardhat');

async function main() {
  console.log('Issuing certification to producer...');

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
    // Check if deployer has certifier role
    const hasCertifierRole = await contract.hasRole(
      await contract.CERTIFIER_ROLE(),
      deployer.address
    );
    console.log('Deployer has certifier role:', hasCertifierRole);

    if (!hasCertifierRole) {
      // Grant certifier role to deployer
      console.log('Granting certifier role to deployer...');
      const grantTx = await contract.grantRole(
        await contract.CERTIFIER_ROLE(),
        deployer.address
      );
      await grantTx.wait();
      console.log('Certifier role granted successfully!');
    }

    // Check producer's current balance
    const userBatches = await contract.getUserBatchesPublic(producerAddress);
    console.log('Producer batches:', userBatches);

    if (userBatches.length > 0) {
      const balance = await contract.balanceOf(producerAddress, userBatches[0]);
      console.log('Producer balance:', Number(balance));

      // Issue certification
      console.log('Issuing certification...');
      const certTx = await contract.issueCertification(
        producerAddress,
        'Premium Green Hydrogen Producer - Grade A Certification for outstanding contribution to sustainable energy'
      );
      await certTx.wait();
      console.log('Certification issued successfully!');

      // Verify certification
      const producerCerts = await contract.getProducerCertifications(
        producerAddress
      );
      console.log('Producer certifications:', producerCerts);

      if (producerCerts.length > 0) {
        const cert = await contract.getCertification(producerCerts[0]);
        const gradeString = await contract.getCertificationGradeString(
          cert.grade
        );
        console.log('Certification details:', {
          id: Number(cert.id),
          grade: gradeString,
          totalCredits: Number(cert.totalCredits),
          description: cert.description,
          isActive: cert.isActive,
        });
      }
    } else {
      console.log('Producer has no batches, cannot issue certification');
    }

    console.log('Certification process completed!');
  } catch (error) {
    console.error('Error issuing certification:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
