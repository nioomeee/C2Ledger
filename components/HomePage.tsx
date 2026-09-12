'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, Diamond, AlertCircle } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { account, isConnected, isConnecting, connectWallet, error, chainId } =
    useWallet();
  const router = useRouter();
  const [showError, setShowError] = useState(false);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  // Redirect to dashboard when connected
  useEffect(() => {
    if (isConnected && account) {
      router.push('/dashboard');
    }
  }, [isConnected, account, router]);

  // Show error for 5 seconds
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-50" />

      {/* Main Content */}
      <div className="flex flex-col items-center space-y-12 z-10">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center animate-glow">
              <Diamond className="w-10 h-10 text-primary" />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-6xl font-bold tracking-tight">
              <span className="text-primary">C2</span>
              <span className="text-white">Ledger</span>
            </h1>
            <p className="text-xl text-muted-foreground mt-4 max-w-md">
              The premier platform for Carbon Credit management on the
              blockchain
            </p>
          </div>
        </div>

        {/* Connection Status */}
        {isConnected && account && (
          <div className="text-center space-y-4">
            <div className="glass-card border-border/50 rounded-2xl px-6 py-4">
              <p className="text-green-400 font-medium">Wallet Connected!</p>
              <p className="text-sm text-muted-foreground mt-1">
                {account.slice(0, 6)}...{account.slice(-4)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Chain ID: {chainId}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Redirecting to dashboard...
            </p>
          </div>
        )}

        {/* CTA */}
        {!isConnected && (
          <Button
            size="lg"
            onClick={handleConnectWallet}
            disabled={isConnecting}
            className="px-12 py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl transition-all duration-300 hover:scale-105"
          >
            {isConnecting ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-3" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5 mr-3" />
                Connect Wallet
              </>
            )}
          </Button>
        )}

        {/* Instructions */}
        <div className="text-sm text-muted-foreground text-center max-w-lg space-y-2">
          <p>
            Connect your Web3 wallet to start issuing, transferring, and
            retiring Carbon Credits
          </p>
          <p className="text-xs">
            Make sure you&apos;re connected to the Hardhat local network (Chain
            ID: 31337)
          </p>
        </div>

        {/* Error Display */}
        {showError && error && (
          <div className="glass-card border-red-500/30 bg-red-500/10 rounded-2xl px-6 py-4 max-w-md">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div className="text-sm">
                <p className="font-medium text-red-400">Connection Error</p>
                <p className="text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Network Info */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Network: Hardhat Local (31337)</p>
          <p>RPC URL: http://127.0.0.1:8545</p>
          {chainId && chainId !== 31337 && (
            <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-300 font-medium">⚠️ Wrong Network</p>
              <p className="text-yellow-200 text-xs">
                Current: {chainId} | Required: 31337
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
