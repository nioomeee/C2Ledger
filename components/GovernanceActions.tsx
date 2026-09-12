'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Coins, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { ContractService } from '@/lib/contractService';
import { useWallet } from '@/contexts/WalletContext';
import { isRateLimitError, waitForCircuitBreakerReset } from '@/lib/rateLimit';

interface GovernanceActionsProps {
  contractService: ContractService | null;
}

export default function GovernanceActions({
  contractService,
}: GovernanceActionsProps) {
  const { account } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create Batch Form
  const [batchQuantity, setBatchQuantity] = useState('');
  const [batchTokenType, setBatchTokenType] = useState('1');

  // Mint Tokens Form
  const [mintBatchId, setMintBatchId] = useState('');
  const [mintQuantity, setMintQuantity] = useState('');
  const [mintToAddress, setMintToAddress] = useState('');
  const [allBatches, setAllBatches] = useState<any[]>([]);

  const handleCreateBatch = async () => {
    if (!contractService || !batchQuantity || !batchTokenType) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Debug: Check if user has governance role
      console.log('Checking governance role for:', account);

      // Add a small delay to prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));

      const hasGovernance = await contractService.hasRole(
        'GOVERNANCE_ROLE',
        account || ''
      );
      console.log('Has governance role:', hasGovernance);

      if (!hasGovernance) {
        setError(
          'You do not have Governance permissions. Please connect with a Governance wallet.'
        );
        return;
      }

      const batchId = await contractService.createBatch(
        parseInt(batchTokenType),
        parseInt(batchQuantity)
      );
      setSuccess(
        `Successfully created batch ${batchId} with ${batchQuantity} GHC`
      );
      setBatchQuantity('');
      setBatchTokenType('1');
    } catch (err: any) {
      console.error('Error creating batch:', err);

      // Check if it's a rate limiting error
      if (isRateLimitError(err)) {
        setError(
          'Rate limit reached. Please wait a moment and try again, or click "Reset Rate Limit" below.'
        );
      } else {
        setError(
          `Failed to create batch: ${
            err.message || 'Make sure you have Governance permissions.'
          }`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMintTokens = async () => {
    if (!contractService || !mintBatchId || !mintQuantity || !mintToAddress) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const txHash = await contractService.mintBatch(
        parseInt(mintBatchId),
        mintToAddress,
        parseInt(mintQuantity)
      );
      setSuccess(
        `Successfully minted ${mintQuantity} GHC to ${mintToAddress}. Transaction: ${txHash.slice(
          0,
          10
        )}...`
      );
      setMintBatchId('');
      setMintQuantity('');
      setMintToAddress('');

      // Refresh batches after minting
      loadAllBatches();
    } catch (err) {
      console.error('Error minting tokens:', err);
      setError(
        'Failed to mint tokens. Make sure you have Governance permissions.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllBatches = async () => {
    if (!contractService) return;

    try {
      const batches = await contractService.getAllBatches();
      setAllBatches(batches);
    } catch (err) {
      console.error('Error loading batches:', err);
    }
  };

  // Load batches on component mount
  useEffect(() => {
    loadAllBatches();
  }, [contractService]);

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-300">{error}</p>
            </div>
            {isRateLimitError({ message: error }) && (
              <Button
                onClick={async () => {
                  setError('Resetting rate limit, please wait...');
                  await waitForCircuitBreakerReset();
                  setError(null);
                  setSuccess(
                    'Rate limit reset successfully. You can now try again.'
                  );
                }}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                Reset Rate Limit
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-500/30 bg-green-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-300">{success}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Batch */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Create New Batch</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tokenType">Token Type</Label>
              <select
                id="tokenType"
                value={batchTokenType}
                onChange={(e) => setBatchTokenType(e.target.value)}
                className="w-full p-2 border border-border/50 rounded-lg bg-background"
              >
                <option value="1">Mint Token</option>
                <option value="2">Transfer Token</option>
                <option value="3">Retire Token</option>
              </select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity (GHC)</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="1000"
                value={batchQuantity}
                onChange={(e) => setBatchQuantity(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={handleCreateBatch}
            disabled={isLoading || !batchQuantity || !batchTokenType}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Batch
          </Button>
        </CardContent>
      </Card>

      {/* Mint Tokens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coins className="w-5 h-5" />
            <span>Mint Tokens</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="batchId">Batch ID</Label>
              <select
                id="batchId"
                value={mintBatchId}
                onChange={(e) => setMintBatchId(e.target.value)}
                className="w-full p-2 border border-border/50 rounded-lg bg-background"
              >
                <option value="">Select Batch</option>
                {allBatches.map((batch) => (
                  <option key={batch.batchId} value={batch.batchId}>
                    Batch {batch.batchId} - {batch.quantity} GHC ({batch.status}
                    )
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="mintQuantity">GHC</Label>
              <Input
                id="mintQuantity"
                type="number"
                placeholder="100"
                value={mintQuantity}
                onChange={(e) => setMintQuantity(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="toAddress">To Address</Label>
              <Input
                id="toAddress"
                placeholder="0x..."
                value={mintToAddress}
                onChange={(e) => setMintToAddress(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={handleMintTokens}
            disabled={
              isLoading || !mintBatchId || !mintQuantity || !mintToAddress
            }
            className="w-full"
          >
            <Coins className="w-4 h-4 mr-2" />
            Mint Tokens
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white/5 border-white/10 rounded-2xl overflow-hidden shadow-lg">
        <CardHeader className="border-b border-white/5 px-6 py-4 bg-white/[0.02]">
          <CardTitle className="text-base font-semibold flex items-center text-zinc-200">
            <Users className="w-4 h-4 mr-2.5 text-emerald-400" />
            Governance Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setMintToAddress(account || '');
                setMintBatchId('1');
                setMintQuantity('1000');
              }}
              className="group h-auto py-4 px-6 flex flex-col items-center justify-center space-y-3 bg-white/5 border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300 rounded-2xl"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Coins className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-center">
                <span className="block text-sm font-bold text-zinc-100">Mint 1000 GHC</span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold group-hover:text-emerald-400/70">Execute to Self</span>
              </div>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setMintToAddress('0x14dc79964da2c08b23698b3d3cc7ca32193d9955');
                setMintBatchId('1');
                setMintQuantity('500');
              }}
              className="group h-auto py-4 px-6 flex flex-col items-center justify-center space-y-3 bg-white/5 border-white/10 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all duration-300 rounded-2xl"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-center">
                <span className="block text-sm font-bold text-zinc-100">Mint 500 GHC</span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold group-hover:text-blue-400/70">Test Recipient</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
