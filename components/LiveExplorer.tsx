'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink, Clock, Hash } from 'lucide-react';
import { ContractService, Transaction } from '@/lib/contractService';
import { useWallet } from '@/contexts/WalletContext';

interface LiveExplorerProps {
  contractService: ContractService | null;
}

export default function LiveExplorer({ contractService }: LiveExplorerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { account } = useWallet();

  const loadTransactions = async () => {
    if (!contractService) {
      console.log('No contract service available');
      setError(
        'Contract service not available. Please ensure you are connected to the correct network.'
      );
      return;
    }

    console.log('Loading transactions...');
    setIsLoading(true);
    setError(null);

    try {
      // Get all transactions from the blockchain (pass empty string to get all)
      console.log('Calling getTransactionHistory...');
      const allTransactions = await contractService.getTransactionHistory('');
      console.log('Transactions received:', allTransactions);

      if (allTransactions.length === 0) {
        console.log('No transactions found in blockchain');
        setTransactions([]);
      } else {
        setTransactions(allTransactions);
      }
    } catch (err: any) {
      console.error('Error loading transactions:', err);
      setError(
        `Failed to load transaction history: ${err.message || 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contractService) {
      console.log('Contract service available, loading transactions...');
      loadTransactions();
    } else {
      console.log('Waiting for contract service:', {
        contractService: !!contractService,
      });
    }
  }, [contractService]);

  const formatTimestamp = (timestamp: number) => {
    // Blockchain timestamps are in seconds, convert to milliseconds for Date constructor
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'Mint':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'Transfer':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Retire':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Live Explorer</h2>
          <p className="text-muted-foreground">
            Real-time blockchain transaction history
          </p>
        </div>
        <Button
          onClick={loadTransactions}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="pt-6">
            <p className="text-red-300">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Hash className="w-5 h-5" />
            <span>Transaction History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-muted/30 rounded animate-pulse"
                />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No transactions found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Transactions will appear here as they occur on the blockchain
              </p>
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-300 text-sm">
                  <strong>Debug Info:</strong> Check the browser console for
                  detailed logs about what's happening with the transaction
                  loading.
                </p>
                <div className="mt-2 text-xs text-blue-200">
                  <p>
                    Contract Service:{' '}
                    {contractService ? 'Available' : 'Not Available'}
                  </p>
                  <p>
                    Network: {contractService ? 'Connected' : 'Not Connected'}
                  </p>
                  <p>Last Load: {new Date().toLocaleTimeString()}</p>
                </div>
                <Button
                  onClick={loadTransactions}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  <RefreshCw
                    className={`w-3 h-3 mr-1 ${
                      isLoading ? 'animate-spin' : ''
                    }`}
                  />
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 border border-border/50 rounded-lg hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className={getEventTypeColor(tx.eventType)}>
                        {tx.eventType}
                      </Badge>
                      <div>
                        <p className="font-medium">{tx.tokenId}</p>
                        <p className="text-sm text-muted-foreground">
                          Amount: {tx.amount.toLocaleString()} GHC
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatTimestamp(tx.timestamp)}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {truncateHash(tx.hash)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() =>
                            window.open(
                              `https://etherscan.io/tx/${tx.hash}`,
                              '_blank'
                            )
                          }
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/30">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">From: </span>
                        <span className="font-mono">
                          {truncateHash(tx.from)}
                        </span>
                      </div>
                      {tx.to && (
                        <div>
                          <span className="text-muted-foreground">To: </span>
                          <span className="font-mono">
                            {truncateHash(tx.to)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
