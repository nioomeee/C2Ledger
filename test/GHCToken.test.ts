import { expect } from 'chai';
import { ethers } from 'hardhat';
import { GHCToken } from '../typechain-types';

describe('GHCToken', function () {
  let ghcToken: GHCToken;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const GHCToken = await ethers.getContractFactory('GHCToken');
    ghcToken = await GHCToken.deploy();
  });

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      expect(await ghcToken.owner()).to.equal(owner.address);
    });

    it('Should have correct name and symbol', async function () {
      expect(await ghcToken.name()).to.equal('Green Hydrogen Credit');
      expect(await ghcToken.symbol()).to.equal('GHC');
    });
  });

  describe('Batch Management', function () {
    it('Should allow owner to create a batch', async function () {
      const quantity = ethers.parseUnits('100000', 0);
      await expect(ghcToken.createBatch(1, quantity))
        .to.emit(ghcToken, 'BatchCreated')
        .withArgs(1, 1, quantity, owner.address);
    });

    it('Should not allow non-owner to create a batch', async function () {
      const quantity = ethers.parseUnits('100000', 0);
      await expect(
        ghcToken.connect(user1).createBatch(1, quantity)
      ).to.be.revertedWithCustomError(ghcToken, 'OwnableUnauthorizedAccount');
    });

    it('Should increment batch counter', async function () {
      const quantity = ethers.parseUnits('100000', 0);
      await ghcToken.createBatch(1, quantity);
      expect(await ghcToken.batchCounter()).to.equal(1);
    });
  });

  describe('Token Operations', function () {
    beforeEach(async function () {
      const quantity = ethers.parseUnits('100000', 0);
      await ghcToken.createBatch(1, quantity);
    });

    it('Should allow owner to mint tokens', async function () {
      const batchId = 1;
      const quantity = ethers.parseUnits('50000', 0);

      await expect(ghcToken.mintBatch(batchId, user1.address, quantity))
        .to.emit(ghcToken, 'TokensMinted')
        .withArgs(batchId, quantity, user1.address);

      expect(await ghcToken.balanceOf(user1.address, batchId)).to.equal(
        quantity
      );
    });

    it('Should not allow non-owner to mint tokens', async function () {
      const batchId = 1;
      const quantity = ethers.parseUnits('50000', 0);

      await expect(
        ghcToken.connect(user1).mintBatch(batchId, user2.address, quantity)
      ).to.be.revertedWithCustomError(ghcToken, 'OwnableUnauthorizedAccount');
    });

    it('Should allow users to transfer tokens', async function () {
      const batchId = 1;
      const quantity = ethers.parseUnits('50000', 0);

      // Mint tokens to user1 first
      await ghcToken.mintBatch(batchId, user1.address, quantity);

      // Transfer from user1 to user2
      await expect(
        ghcToken.transferBatch(batchId, user1.address, user2.address, quantity)
      )
        .to.emit(ghcToken, 'TokensTransferred')
        .withArgs(batchId, quantity, user1.address, user2.address);

      expect(await ghcToken.balanceOf(user1.address, batchId)).to.equal(0);
      expect(await ghcToken.balanceOf(user2.address, batchId)).to.equal(
        quantity
      );
    });

    it('Should allow users to retire tokens', async function () {
      const batchId = 1;
      const quantity = ethers.parseUnits('50000', 0);

      // Mint tokens to user1 first
      await ghcToken.mintBatch(batchId, user1.address, quantity);

      // Retire tokens
      await expect(ghcToken.connect(user1).retireBatch(batchId, quantity))
        .to.emit(ghcToken, 'TokensRetired')
        .withArgs(batchId, quantity, user1.address);

      expect(await ghcToken.balanceOf(user1.address, batchId)).to.equal(0);
    });
  });

  describe('Batch Information', function () {
    beforeEach(async function () {
      const quantity = ethers.parseUnits('100000', 0);
      await ghcToken.createBatch(1, quantity);
    });

    it('Should return correct batch information', async function () {
      const batch = await ghcToken.getBatch(1);
      expect(batch.batchId).to.equal(1);
      expect(batch.quantity).to.equal(ethers.parseUnits('100000', 0));
      expect(batch.status).to.equal('Active');
      expect(batch.issuer).to.equal(owner.address);
      expect(batch.exists).to.be.true;
    });

    it('Should return user batches correctly', async function () {
      const batchId = 1;
      const quantity = ethers.parseUnits('50000', 0);

      // Mint tokens to user1
      await ghcToken.mintBatch(batchId, user1.address, quantity);

              const userBatches = await ghcToken.getUserBatchesPublic(user1.address);
      expect(userBatches).to.include(batchId);
    });
  });
});
