'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';
import { ContractService, GHCBatch } from '@/lib/contractService';
import { useWallet } from '@/contexts/WalletContext';

interface RetireCreditsProps {
  contractService: ContractService;
}

export default function RetireCredits({ contractService }: RetireCreditsProps) {
  const { account } = useWallet();
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userBatches, setUserBatches] = useState<GHCBatch[]>([]);

  // Load user batches when component mounts
  useEffect(() => {
    const loadBatches = async () => {
      if (!account) return;
      try {
        const batches = await contractService.getUserBatches(account);
        setUserBatches(batches);
      } catch (err) {
        console.error('Error loading batches:', err);
      }
    };
    loadBatches();
  }, [account, contractService]);

  const handleRetire = async () => {
    if (!selectedBatch || !amount) {
      setError('Please fill in all fields');
      return;
    }

    if (!account) {
      setError('Wallet not connected');
      return;
    }

    // Validate amount
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Invalid amount');
      return;
    }

    // Check if user has enough balance
    const selectedBatchData = userBatches.find((b) => b.id === selectedBatch);
    if (!selectedBatchData || numAmount > selectedBatchData.quantity) {
      setError('Insufficient balance for this batch');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const batchId = Number(selectedBatch);
      const txHash = await contractService.retireBatch(batchId, numAmount);

      setSuccess(`Retirement successful! Transaction hash: ${txHash}`);

      // Reset form
      setSelectedBatch('');
      setAmount('');

      // Reload batches to update balances
      const updatedBatches = await contractService.getUserBatches(account);
      setUserBatches(updatedBatches);
    } catch (err: any) {
      console.error('Retirement error:', err);
      setError(err.message || 'Retirement failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getBatchDisplayName = (batch: GHCBatch) => {
    return `Batch ${batch.batchId} (${batch.quantity.toLocaleString()} GHC)`;
  };

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h3 className="text-lg font-semibold mb-2">Retire GHC Credits</h3>
        <p className="text-muted-foreground">
          Retire your Carbon Credits to remove them from circulation
        </p>
        <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-300 text-sm">
            <strong>Note:</strong> Retiring credits permanently removes them
            from circulation. This action cannot be undone.
          </p>
        </div>
      </div>

      {error && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-300">{error}</p>
            </div>
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

      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Batch Selection */}
          <div className="space-y-2">
            <Label htmlFor="batch">Select Batch</Label>
            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a batch to retire from" />
              </SelectTrigger>
              <SelectContent>
                {userBatches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {getBatchDisplayName(batch)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Retire (GHC)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount to retire"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="1"
            />
          </div>

          {/* Retire Button */}
          <Button
            onClick={handleRetire}
            disabled={isLoading || !selectedBatch || !amount}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            ) : (
              <RotateCcw className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Processing...' : 'Retire Credits'}
          </Button>
        </CardContent>
      </Card>

      {/* Available Batches Info */}
      {userBatches.length > 0 && (
        <Card className="border-blue-500/30 bg-blue-500/10">
          <CardHeader>
            <CardTitle className="text-sm text-blue-300">
              Available Batches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userBatches.map((batch) => (
                <div key={batch.id} className="flex justify-between text-sm">
                  <span className="text-blue-300">Batch {batch.batchId}:</span>
                  <span className="text-blue-200 font-mono">
                    {batch.quantity.toLocaleString()} GHC
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
