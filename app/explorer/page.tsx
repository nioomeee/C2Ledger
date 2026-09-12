'use client';

import { useState, useEffect } from 'react';
import { Diamond, Bell, User, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LiveExplorer from '@/components/LiveExplorer';
import { useWallet } from '@/contexts/WalletContext';
import { ContractService } from '@/lib/contractService';
import { getContractAddress } from '@/lib/config';

export default function Explorer() {
  const { account, isConnected, signer, provider } = useWallet();
  const [contractService, setContractService] =
    useState<ContractService | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

    // Initialize contract service when wallet is connected
  useEffect(() => {
    if (isConnected && signer && provider) {
      const service = new ContractService(
        getContractAddress(), // Get contract address from config
        provider,
        signer
      );
      setContractService(service);
    }
  }, [isConnected, signer, provider]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Diamond className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold">
                <span className="text-primary">C2</span>
                <span className="text-white">Ledger</span>
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search by Address, Token ID, Plant ID, or Transaction Hash"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-6 text-lg bg-card/50 border-border/50 rounded-2xl"
            />
          </div>
        </div>

        {/* Live Explorer Component */}
        <LiveExplorer contractService={contractService} />
      </main>
    </div>
  );
}
