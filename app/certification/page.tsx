'use client';

import { useState, useEffect } from 'react';
import { Award, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import { ContractService } from '@/lib/contractService';
import { getContractAddress } from '@/lib/config';
import CertificationActions from '@/components/CertificationActions';

const CONTRACT_ADDRESS = getContractAddress();

export default function CertificationPage() {
  const { account, isConnected, signer, provider } = useWallet();
  const [contractService, setContractService] =
    useState<ContractService | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize contract service when wallet is connected
  useEffect(() => {
    if (isConnected && signer && provider) {
      const service = new ContractService(CONTRACT_ADDRESS, provider, signer);
      setContractService(service);
    }
  }, [isConnected, signer, provider]);

  // Load user roles when contract service is available
  useEffect(() => {
    const loadUserRoles = async () => {
      if (!contractService || !account) return;

      try {
        setIsLoading(true);
        const roles = await contractService.getUserRoles(account);
        setUserRoles(roles);
      } catch (err) {
        console.error('Error loading user roles:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserRoles();
  }, [contractService, account]);

  const isCertifier = userRoles.includes('Certifier');

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-4">
            Please connect your wallet to access the certification portal.
          </p>
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isCertifier) {
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
              <Award className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold">
                <span className="text-primary">C2</span>
                <span className="text-white">Ledger</span>
                <span className="text-blue-400 ml-2">Certification</span>
              </span>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <Card className="glass-card border-border/50">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-muted-foreground mb-4">
                  Only Certifier users can access the certification portal.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Your current roles: {userRoles.join(', ') || 'None'}
                </p>
                <Link href="/dashboard">
                  <Button>Back to Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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
            <Award className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">
              <span className="text-primary">C2</span>
              <span className="text-white">Ledger</span>
              <span className="text-blue-400 ml-2">Certification Portal</span>
            </span>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 ml-auto">
              <Award className="w-3 h-3 mr-1" />
              Certifier
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Certification Portal</h1>
          <p className="text-muted-foreground">
            Grant certifications to producers based on their Carbon Credit holdings
          </p>
        </div>

        {/* Certification Actions */}
        {contractService && (
          <CertificationActions contractService={contractService} />
        )}

        {/* Certification Guidelines */}
        <Card className="glass-card border-border/50 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Certification Process</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">
                    Step 1: Search Producer
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Enter the producer&apos;s wallet address to search for their
                    credit holdings and determine eligibility.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    Step 2: Review Information
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Review the producer&apos;s total credits, active batches,
                    and automatically calculated grade.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    Step 3: Add Description
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Provide a detailed description of the certification,
                    including verification process and special notes.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    Step 4: Issue Certification
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Submit the certification transaction to the blockchain. The
                    grade is automatically determined based on credit holdings.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
