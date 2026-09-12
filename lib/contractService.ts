import { ethers } from 'ethers';
import GHCTokenABI from '../artifacts/contracts/GHCToken.sol/GHCToken.json';
import { withRateLimit, isRateLimitError } from './rateLimit';

export interface GHCBatch {
  id: string;
  batchId: number;
  quantity: number;
  issuanceDate: number;
  status: string;
  issuer: string;
  exists: boolean;
}

export interface UserRole {
  address: string;
  roles: string[];
}

export interface Transaction {
  id: string;
  eventType: 'Mint' | 'Transfer' | 'Retire';
  tokenId: string;
  from: string;
  to: string | null;
  amount: number;
  timestamp: number;
  hash: string;
}

export class ContractService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  constructor(
    contractAddress: string,
    provider: ethers.BrowserProvider,
    signer: ethers.JsonRpcSigner
  ) {
    this.provider = provider;
    this.signer = signer;
    this.contract = new ethers.Contract(
      contractAddress,
      GHCTokenABI.abi,
      signer
    );

    console.log('ContractService initialized with:', {
      contractAddress,
      provider: !!provider,
      signer: !!signer,
      contract: !!this.contract,
    });
  }

  // Get contract instance
  getContract() {
    return this.contract;
  }

  // Get user's total portfolio value
  async getPortfolioValue(userAddress: string): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const userBatches = await this.contract.getUserBatchesPublic(userAddress);
      let totalValue = 0;

      // Handle empty array case gracefully
      if (!userBatches || userBatches.length === 0) {
        console.log(`No batches found for user ${userAddress}`);
        return 0;
      }

      for (const batchId of userBatches) {
        const balance = await this.contract.balanceOf(userAddress, batchId);
        totalValue += Number(balance);
      }

      return totalValue;
    } catch (error) {
      console.error('Error getting portfolio value:', error);
      // If getUserBatchesPublic fails, return 0 instead of throwing
      return 0;
    }
  }

  // Get user's batches
  async getUserBatches(userAddress: string): Promise<GHCBatch[]> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      console.log('Getting user batches for address:', userAddress);
      console.log('Contract address:', this.contract.target);

      const userBatches = await withRateLimit(
        () => this.contract!.getUserBatchesPublic(userAddress),
        100
      );
      console.log('User batches result:', userBatches);

      const batches: GHCBatch[] = [];

      for (const batchId of userBatches) {
        try {
          const batch = await withRateLimit(
            () => this.contract!.getBatch(batchId),
            50
          );
          const balance = await withRateLimit(
            () => this.contract!.balanceOf(userAddress, batchId),
            50
          );

          if (Number(balance) > 0) {
            const statusString = await withRateLimit(
              () => this.contract!.getBatchStatusString(batchId),
              50
            );
            batches.push({
              id: batchId.toString(),
              batchId: Number(batchId),
              quantity: Number(balance),
              issuanceDate: Number(batch.issuanceDate),
              status: statusString,
              issuer: batch.issuer,
              exists: batch.exists,
            });
          }
        } catch (batchError) {
          console.warn(`Error processing batch ${batchId}:`, batchError);
          // Continue with other batches
        }
      }

      return batches;
    } catch (error: any) {
      console.error('Error getting user batches:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        data: error?.data,
        transaction: error?.transaction,
      });

      // Check if it's a rate limiting error
      if (isRateLimitError(error)) {
        console.log('Rate limit detected, returning empty array');
        return [];
      }

      // Return empty array instead of throwing
      return [];
    }
  }

  // Production of hydrogen (Producer only)
  async produceHydrogen(batchId: number, quantity: number): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const tx = await this.contract.produceHydrogen(batchId, quantity);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error producing hydrogen:', error);
      throw error;
    }
  }

  // Get all batches (for admin/explorer)
  async getAllBatches(): Promise<GHCBatch[]> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const batchCounter = await withRateLimit(
        () => this.contract!.batchCounter(),
        100
      );
      const batches: GHCBatch[] = [];

      for (let i = 1; i <= Number(batchCounter); i++) {
        try {
          const batch = await withRateLimit(
            () => this.contract!.getBatch(i),
            50
          );
          const statusString = await withRateLimit(
            () => this.contract!.getBatchStatusString(i),
            50
          );
          batches.push({
            id: i.toString(),
            batchId: i,
            quantity: Number(batch.quantity),
            issuanceDate: Number(batch.issuanceDate),
            status: statusString,
            issuer: batch.issuer,
            exists: batch.exists,
          });
        } catch (batchError) {
          console.warn(`Error processing batch ${i}:`, batchError);
          // Continue with other batches
        }
      }

      return batches;
    } catch (error: any) {
      console.error('Error getting all batches:', error);

      // Check if it's a rate limiting error
      if (isRateLimitError(error)) {
        console.log(
          'Rate limit detected in getAllBatches, returning empty array'
        );
        return [];
      }

      return [];
    }
  }

  // Create a new batch (admin only)
  async createBatch(tokenType: number, quantity: number): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const tx = await this.contract.createBatch(tokenType, quantity);
      const receipt = await tx.wait();

      // Find the BatchCreated event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract!.interface.parseLog(log);
          return parsed?.name === 'BatchCreated';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = this.contract!.interface.parseLog(event);
        if (parsed && parsed.args) {
          return Number(parsed.args.batchId);
        }
      }

      throw new Error('Failed to get batch ID from transaction');
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  }

  // Mint tokens for a batch (admin only)
  async mintBatch(
    batchId: number,
    to: string,
    quantity: number
  ): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const tx = await this.contract.mintBatch(batchId, to, quantity);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error minting batch:', error);
      throw error;
    }
  }

  // Transfer tokens between addresses
  async transferBatch(
    batchId: number,
    from: string,
    to: string,
    quantity: number
  ): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const tx = await this.contract.transferBatch(batchId, from, to, quantity);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error transferring batch:', error);
      throw error;
    }
  }

  // Retire tokens
  async retireBatch(batchId: number, quantity: number): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const tx = await this.contract.retireBatch(batchId, quantity);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error retiring batch:', error);
      throw error;
    }
  }

  // Get transaction history (this would need to be implemented with events)
  async getTransactionHistory(userAddress?: string): Promise<Transaction[]> {
    if (!this.contract || !this.provider)
      throw new Error('Contract or provider not initialized');

    try {
      console.log('Fetching transaction history...');

      // Get events from the contract
      const batchCreatedFilter = this.contract.filters.BatchCreated();
      const mintFilter = this.contract.filters.TokensMinted(
        null,
        null,
        userAddress || null
      );
      const transferFilter = this.contract.filters.TokensTransferred(
        null,
        null,
        userAddress || null,
        null
      );
      const retireFilter = this.contract.filters.TokensRetired(
        null,
        null,
        userAddress || null
      );

      console.log('Querying filters...');
      const [batchEvents, mintEvents, transferEvents, retireEvents] =
        await Promise.all([
          this.contract.queryFilter(batchCreatedFilter),
          this.contract.queryFilter(mintFilter),
          this.contract.queryFilter(transferFilter),
          this.contract.queryFilter(retireFilter),
        ]);

      console.log('Events found:', {
        batchCreated: batchEvents.length,
        minted: mintEvents.length,
        transferred: transferEvents.length,
        retired: retireEvents.length,
      });

      const transactions: Transaction[] = [];

      // Process batch created events
      for (const event of batchEvents) {
        try {
          const parsed = this.contract!.interface.parseLog(event);
          if (parsed && parsed.args) {
            const timestamp = event.blockNumber
              ? await this.getBlockTimestamp(event.blockNumber)
              : Date.now();

            transactions.push({
              id: `batch-${event.blockNumber}-${event.transactionIndex}`,
              eventType: 'Mint', // Treat batch creation as a mint event
              tokenId: `GHC-${parsed.args.batchId}`,
              from: '0x0000000000000000000000000000000000000000',
              to: parsed.args.issuer,
              amount: Number(parsed.args.quantity),
              timestamp,
              hash: event.transactionHash,
            });
          }
        } catch (error) {
          console.warn('Failed to parse batch created event:', error);
        }
      }

      // Process mint events
      for (const event of mintEvents) {
        try {
          const parsed = this.contract!.interface.parseLog(event);
          if (parsed && parsed.args) {
            const timestamp = event.blockNumber
              ? await this.getBlockTimestamp(event.blockNumber)
              : Date.now();

            transactions.push({
              id: `mint-${event.blockNumber}-${event.transactionIndex}`,
              eventType: 'Mint',
              tokenId: `GHC-${parsed.args.batchId}`,
              from: '0x0000000000000000000000000000000000000000',
              to: parsed.args.to,
              amount: Number(parsed.args.quantity),
              timestamp,
              hash: event.transactionHash,
            });
          }
        } catch (error) {
          console.warn('Failed to parse mint event:', error);
        }
      }

      // Process transfer events
      for (const event of transferEvents) {
        try {
          const parsed = this.contract!.interface.parseLog(event);
          if (parsed && parsed.args) {
            const timestamp = event.blockNumber
              ? await this.getBlockTimestamp(event.blockNumber)
              : Date.now();

            transactions.push({
              id: `transfer-${event.blockNumber}-${event.transactionIndex}`,
              eventType: 'Transfer',
              tokenId: `GHC-${parsed.args.batchId}`,
              from: parsed.args.from,
              to: parsed.args.to,
              amount: Number(parsed.args.quantity),
              timestamp,
              hash: event.transactionHash,
            });
          }
        } catch (error) {
          console.warn('Failed to parse transfer event:', error);
        }
      }

      // Process retire events
      for (const event of retireEvents) {
        try {
          const parsed = this.contract!.interface.parseLog(event);
          if (parsed && parsed.args) {
            const timestamp = event.blockNumber
              ? await this.getBlockTimestamp(event.blockNumber)
              : Date.now();

            transactions.push({
              id: `retire-${event.blockNumber}-${event.transactionIndex}`,
              eventType: 'Retire',
              tokenId: `GHC-${parsed.args.batchId}`,
              from: parsed.args.from,
              to: null,
              amount: Number(parsed.args.quantity),
              timestamp,
              hash: event.transactionHash,
            });
          }
        } catch (error) {
          console.warn('Failed to parse retire event:', error);
        }
      }

      // Sort by timestamp (newest first)
      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }

  // Helper method to get block timestamp
  private async getBlockTimestamp(blockNumber: number): Promise<number> {
    if (!this.provider) return Date.now();

    try {
      const block = await this.provider.getBlock(blockNumber);
      return block?.timestamp || Date.now();
    } catch {
      return Date.now();
    }
  }

  // Role management methods
  async getUserRoles(userAddress: string): Promise<string[]> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      return await this.contract.getUserRoles(userAddress);
    } catch (error) {
      console.error('Error getting user roles:', error);
      return [];
    }
  }

  async hasRole(role: string, userAddress: string): Promise<boolean> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      // Get the role hash
      let roleHash: string;
      switch (role) {
        case 'GOVERNANCE_ROLE':
          roleHash = await withRateLimit(
            () => this.contract!.GOVERNANCE_ROLE(),
            100
          );
          break;
        case 'CERTIFIER_ROLE':
          roleHash = await withRateLimit(
            () => this.contract!.CERTIFIER_ROLE(),
            100
          );
          break;
        case 'PRODUCER_ROLE':
          roleHash = await withRateLimit(
            () => this.contract!.PRODUCER_ROLE(),
            100
          );
          break;
        default:
          roleHash = role;
      }

      // Check if user has the specific role
      return await withRateLimit(
        () => this.contract!.hasRole(roleHash, userAddress),
        50
      );
    } catch (error: any) {
      console.error('Error checking role:', error);

      // Check if it's a rate limiting error
      if (isRateLimitError(error)) {
        console.log('Rate limit detected in role check, returning false');
        return false;
      }

      return false;
    }
  }

  async grantRole(role: string, userAddress: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const tx = await this.contract.grantRole(role, userAddress);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error granting role:', error);
      throw error;
    }
  }

  async revokeRole(role: string, userAddress: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const tx = await this.contract.revokeRole(role, userAddress);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error revoking role:', error);
      throw error;
    }
  }

  // Certification methods
  async issueCertification(producerAddress: string, description: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const tx = await this.contract.issueCertification(producerAddress, description);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error issuing certification:', error);
      throw error;
    }
  }

  async getCertification(certificationId: number): Promise<any> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      return await this.contract.getCertification(certificationId);
    } catch (error) {
      console.error('Error getting certification:', error);
      throw error;
    }
  }

  async getProducerCertifications(producerAddress: string): Promise<number[]> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      return await this.contract.getProducerCertifications(producerAddress);
    } catch (error) {
      console.error('Error getting producer certifications:', error);
      throw error;
    }
  }

  async getCertifierIssuedCertifications(certifierAddress: string): Promise<number[]> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      return await this.contract.getCertifierIssuedCertifications(certifierAddress);
    } catch (error) {
      console.error('Error getting certifier issued certifications:', error);
      throw error;
    }
  }
}
