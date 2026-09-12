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
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { ContractService, GHCBatch } from '@/lib/contractService';
import { useWallet } from '@/contexts/WalletContext';

interface TransferCreditsProps {
  contractService: ContractService;
}

export default function TransferCredits({
  contractService,
}: TransferCreditsProps) {
  const { account } = useWallet();
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState('');
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

  const handleTransfer = async () => {
    if (!selectedBatch || !recipientAddress || !amount) {
      setError('Please fill in all fields');
      return;
    }

    if (!account) {
      setError('Wallet not connected');
      return;
    }

    // Validate recipient address
    if (!recipientAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('Invalid recipient address');
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
      const txHash = await contractService.transferBatch(
        batchId,
        account,
        recipientAddress,
        numAmount
      );

      setSuccess(`Transfer successful! Transaction hash: ${txHash}`);

      // Reset form
      setSelectedBatch('');
      setRecipientAddress('');
      setAmount('');

      // Reload batches to update balances
      const updatedBatches = await contractService.getUserBatches(account);
      setUserBatches(updatedBatches);
    } catch (err: any) {
      console.error('Transfer error:', err);
      setError(err.message || 'Transfer failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getBatchDisplayName = (batch: GHCBatch) => {
    return `Batch ${batch.batchId} (${batch.quantity.toLocaleString()} GHC)`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Transfer GHC Credits</h3>
        <p className="text-muted-foreground">
          Transfer your Carbon Credits to another address
        </p>
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
                <SelectValue placeholder="Choose a batch to transfer from" />
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

          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              type="text"
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="font-mono"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (GHC)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount to transfer"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="1"
            />
          </div>

          {/* Transfer Button */}
          <Button
            onClick={handleTransfer}
            disabled={
              isLoading || !selectedBatch || !recipientAddress || !amount
            }
            className="w-full"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            ) : (
              <ArrowRight className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Processing...' : 'Transfer Credits'}
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
