'use client';

import { useState, useEffect } from 'react';
import {
  Diamond,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import { ContractService, GHCBatch } from '@/lib/contractService';
import { getContractAddress } from '@/lib/config';
import { toast } from '@/hooks/use-toast';

export default function RetireCredit() {
  const { account, provider, signer } = useWallet();
  const [amount, setAmount] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [userBatches, setUserBatches] = useState<GHCBatch[]>([]);
  const [isRetiring, setIsRetiring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contractService, setContractService] =
    useState<ContractService | null>(null);

  // Initialize contract service when wallet is connected
  useEffect(() => {
    if (provider && signer) {
      const service = new ContractService(
        getContractAddress(),
        provider,
        signer
      );
      setContractService(service);
    }
  }, [provider, signer]);

  // Load user batches when contract service is available
  useEffect(() => {
    const loadUserBatches = async () => {
      if (!contractService || !account) return;

      setIsLoading(true);
      try {
        const batches = await contractService.getUserBatches(account);
        setUserBatches(batches);
        console.log('User batches loaded:', batches);
      } catch (error) {
        console.error('Error loading user batches:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your token batches',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserBatches();
  }, [contractService, account]);

  const handleRetire = async () => {
    if (!contractService || !account || !selectedBatch || !amount) {
      toast({
        title: 'Error',
        description:
          'Please ensure all fields are filled and wallet is connected',
        variant: 'destructive',
      });
      return;
    }

    const batchId = parseInt(selectedBatch);
    const retireAmount = parseFloat(amount);

    if (retireAmount <= 0) {
      toast({
        title: 'Error',
        description: 'Amount must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    // Find the selected batch to check available balance
    const batch = userBatches.find((b) => b.batchId === batchId);
    if (!batch) {
      toast({
        title: 'Error',
        description: 'Selected batch not found',
        variant: 'destructive',
      });
      return;
    }

    if (retireAmount > batch.quantity) {
      toast({
        title: 'Error',
        description: `Insufficient balance. You have ${batch.quantity} GHC in batch ${batchId}`,
        variant: 'destructive',
      });
      return;
    }

    setIsRetiring(true);

    try {
      // Call the smart contract to retire tokens
      const txHash = await contractService.retireBatch(batchId, retireAmount);

      toast({
        title: 'Success!',
        description: `Successfully retired ${retireAmount} GHC from batch ${batchId}`,
      });

      // Reset form
      setAmount('');
      setSelectedBatch('');

      // Reload user batches to reflect the changes
      const updatedBatches = await contractService.getUserBatches(account);
      setUserBatches(updatedBatches);
    } catch (error: any) {
      console.error('Error retiring tokens:', error);

      let errorMessage = 'Failed to retire tokens';
      if (error.message) {
        if (error.message.includes('insufficient balance')) {
          errorMessage = 'Insufficient balance for retirement';
        } else if (error.message.includes('batch does not exist')) {
          errorMessage = 'Selected batch does not exist';
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected by user';
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsRetiring(false);
    }
  };

  const networkFee = 0.00001;
  const total = amount ? parseFloat(amount) + networkFee : 0;

  // Check if user has any batches
  const hasBatches = userBatches.length > 0;
  const totalBalance = userBatches.reduce(
    (sum, batch) => sum + batch.quantity,
    0
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Diamond className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">
              <span className="text-primary">C2</span>
              <span className="text-white">Ledger</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-center">
          <Card className="glass-card border-border/50 w-full max-w-lg mb-24">
            <CardHeader>
              <CardTitle className="text-2xl">Retire GHC</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Wallet Connection Status */}
              {!account ? (
                <Alert className="bg-blue-500/10 border-blue-500/30">
                  <AlertDescription className="text-blue-200">
                    Please connect your wallet to retire GHC tokens.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  {/* Balance Summary */}
                  <Card className="bg-muted/20 border-border/30">
                    <CardHeader>
                      <CardTitle className="text-lg">Your Portfolio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Balance
                        </span>
                        <span className="font-mono">{totalBalance} GHC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Available Batches
                        </span>
                        <span className="font-mono">{userBatches.length}</span>
                      </div>
                      {userBatches.length === 0 && !isLoading && (
                        <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <p className="text-sm text-blue-200">
                            You don&apos;t have any GHC tokens yet. Tokens need
                            to be minted to your account before you can retire
                            them.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Batch Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="batch">Select Batch</Label>
                    <Select
                      value={selectedBatch}
                      onValueChange={setSelectedBatch}
                      disabled={isLoading || userBatches.length === 0}
                    >
                      <SelectTrigger className="bg-muted/30 border-border/50 py-6 text-lg">
                        <SelectValue
                          placeholder={
                            isLoading
                              ? 'Loading batches...'
                              : userBatches.length === 0
                              ? 'No batches available'
                              : 'Choose a batch to retire from'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {userBatches.map((batch) => (
                          <SelectItem
                            key={batch.batchId}
                            value={batch.batchId.toString()}
                          >
                            Batch {batch.batchId}: {batch.quantity} GHC (
                            {batch.status})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount to Retire</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-muted/30 border-border/50 py-6 text-lg"
                      disabled={
                        !selectedBatch || isLoading || userBatches.length === 0
                      }
                    />
                    {selectedBatch && (
                      <p className="text-sm text-muted-foreground">
                        Available:{' '}
                        {userBatches.find(
                          (b) => b.batchId === parseInt(selectedBatch)
                        )?.quantity || 0}{' '}
                        GHC
                      </p>
                    )}
                  </div>

                  {/* Transaction Summary */}
                  {amount && selectedBatch && (
                    <Card className="bg-muted/20 border-border/30">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Transaction Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Batch</span>
                          <span className="font-mono">#{selectedBatch}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Amount to Retire
                          </span>
                          <span className="font-mono">{amount} GHC</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Network Fee
                          </span>
                          <span className="font-mono">{networkFee} ETH</span>
                        </div>
                        <div className="border-t border-border/30 pt-3">
                          <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span className="font-mono">
                              {total.toFixed(5)} ETH
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Warning */}
                  <Alert className="bg-yellow-500/10 border-yellow-500/30">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <AlertDescription className="text-yellow-200">
                      <strong>Important Notice:</strong> Once you retire GHC,
                      the action is irreversible. Please ensure you have
                      selected the correct amount and are certain about this
                      action.
                    </AlertDescription>
                  </Alert>

                  {/* Confirm Button */}
                  <Button
                    onClick={handleRetire}
                    disabled={
                      !amount || !selectedBatch || isRetiring || !hasBatches
                    }
                    className="w-full py-6 text-lg bg-primary hover:bg-primary/90 rounded-2xl"
                  >
                    {isRetiring ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-3" />
                        Confirming Retirement...
                      </>
                    ) : !hasBatches ? (
                      'No Batches Available'
                    ) : (
                      'Confirm Retirement'
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
