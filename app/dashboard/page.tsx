'use client';

import { useState, useEffect } from 'react';
import {
  Diamond,
  ArrowUpRight,
  RotateCcw,
  History,
  TrendingUp,
  LogOut,
  Shield,
  Plus,
  RefreshCw,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';
import { useWallet } from '@/contexts/WalletContext';
import { ContractService, GHCBatch } from '@/lib/contractService';
import { useRouter } from 'next/navigation';
import RoleManagement from '@/components/RoleManagement';
import GovernanceActions from '@/components/GovernanceActions';
import CertificationActions from '@/components/CertificationActions';
import TransferCredits from '@/components/TransferCredits';
import RetireCredits from '@/components/RetireCredits';
import ProductionActions from '@/components/ProductionActions';
import { getContractAddress } from '@/lib/config';
import { isRateLimitError, waitForCircuitBreakerReset } from '@/lib/rateLimit';

// Get contract address from config
const CONTRACT_ADDRESS = getContractAddress();

export default function Dashboard() {
  const { account, isConnected, signer, provider, disconnectWallet } =
    useWallet();
  const router = useRouter();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [contractService, setContractService] =
    useState<ContractService | null>(null);
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [userBatches, setUserBatches] = useState<GHCBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  // Function to refresh portfolio data
  const refreshPortfolio = async () => {
    if (!contractService || !account) return;

    try {
      setIsLoading(true);
      const [value, batches, roles] = await Promise.all([
        contractService.getPortfolioValue(account),
        contractService.getUserBatches(account),
        contractService.getUserRoles(account),
      ]);
      setPortfolioValue(value);
      setUserBatches(batches);
      setUserRoles(roles);
    } catch (err: any) {
      console.error('Error refreshing portfolio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize contract service when wallet is connected
  useEffect(() => {
    if (isConnected && signer && provider) {
      const service = new ContractService(CONTRACT_ADDRESS, provider, signer);
      setContractService(service);
    }
  }, [isConnected, signer, provider]);

  // Load user data when contract service is available
  useEffect(() => {
    const loadUserData = async () => {
      if (!contractService || !account) return;

      try {
        setIsLoading(true);
        setError(null);

        // Add delay to prevent rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Load portfolio value, user batches, and user roles
        const [value, batches, roles] = await Promise.all([
          contractService.getPortfolioValue(account),
          contractService.getUserBatches(account),
          contractService.getUserRoles(account),
        ]);

        console.log('Portfolio data loaded:', {
          value,
          batchesCount: batches.length,
          roles,
        });
        console.log('User roles loaded:', {
          account,
          roles,
          isGovernance: roles.includes('Governance'),
        });
        setPortfolioValue(value);
        setUserBatches(batches);
        setUserRoles(roles);
      } catch (err: any) {
        console.error('Error loading user data:', err);

        // Check if it's a rate limiting error
        if (isRateLimitError(err)) {
          setError(
            'Rate limit reached. Please wait a moment and refresh the page, or click the "Reset Rate Limit" button below.'
          );
        } else {
          setError('Failed to load portfolio data. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [contractService, account]);

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  // Handle disconnect
  const handleDisconnect = () => {
    disconnectWallet();
    router.push('/');
  };

  const getStatusChipClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
      case 'Partial':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.15)]';
      case 'Retired':
        return 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30 shadow-[0_0_10px_rgba(113,113,122,0.15)]';
      case 'Not Certified':
        return 'bg-red-500/20 text-red-300 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.15)]';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.15)]';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper functions to check user roles
  const hasRole = (role: string) => userRoles.includes(role);
  const isGovernance = hasRole('Governance');
  const isCertifier = hasRole('Certifier');
  const isProducer = hasRole('Producer');

  // Debug logging for role checking
  // console.log('Role checking debug:', {
  //   userRoles,
  //   isGovernance,
  //   isCertifier,
  //   isProducer,
  //   hasGovernanceRole: hasRole('Governance'),
  //   hasCertifierRole: hasRole('Certifier'),
  //   hasProducerRole: hasRole('Producer'),
  // });

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090D14]">
        <div className="text-center animate-in fade-in duration-700">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]" />
          <p className="text-zinc-400 font-medium tracking-wide">Establishing secure connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D14] text-white relative overflow-hidden selection:bg-emerald-500/30">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-emerald-900/10 blur-[120px] mix-blend-screen animate-pulse duration-[10000ms]" />
        <div className="absolute top-[20%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-blue-900/10 blur-[100px] mix-blend-screen" />
        <div className="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-purple-900/5 blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen overflow-y-auto custom-scrollbar">
        {/* Premium Header */}
        <header className="sticky top-0 z-40 border-b border-white/5 bg-[#090D14]/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#090D14]/40">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-3 group cursor-pointer transition-transform hover:scale-[1.02]">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity rounded-full" />
                <div className="relative bg-black/50 p-2 rounded-xl border border-white/10 backdrop-blur-sm">
                  <Diamond className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-emerald-400">C2</span>
                <span className="text-zinc-100">Ledger</span>
              </span>
            </div>

            {/* User / Wallet */}
            <div className="flex items-center space-x-6">
              <div className="hidden sm:flex flex-col items-end">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]" />
                  <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Network Connected</span>
                </div>
                <p className="font-mono text-sm text-zinc-400 mt-0.5">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="border-white/10 bg-white/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 rounded-xl transition-all duration-300 h-10 px-4"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col gap-8">
          {/* Welcome & Roles Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white block to-zinc-400">
                Welcome Back
              </h1>
              <p className="text-lg text-zinc-400 max-w-xl">
                Manage your Carbon Credit portfolio, monitor batches, and execute operations across the network.
              </p>
              
              {/* Glowing Badges */}
              {userRoles.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {isGovernance && (
                    <div className="flex items-center px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-inset ring-purple-500/30">
                      <Shield className="w-4 h-4 mr-2 text-purple-400" />
                      Governance Authority
                    </div>
                  )}
                  {isCertifier && (
                    <div className="flex items-center px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-inset ring-blue-500/30">
                      <Award className="w-4 h-4 mr-2 text-blue-400" />
                      Authorized Certifier
                    </div>
                  )}
                  {isProducer && (
                    <div className="flex items-center px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-inset ring-emerald-500/30">
                      <Diamond className="w-4 h-4 mr-2 text-emerald-400" />
                      Verified Producer
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Quick Refresh */}
            <Button
              onClick={refreshPortfolio}
              disabled={isLoading}
              variant="outline"
              className="group relative overflow-hidden bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-emerald-400 rounded-xl h-12 px-6 transition-all duration-300 backdrop-blur-md"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <RefreshCw className={`w-4 h-4 mr-2 text-zinc-400 group-hover:text-emerald-400 transition-colors ${isLoading ? 'animate-spin' : ''}`} />
              <span className="font-medium">Sync Network</span>
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center text-red-400">
                <Shield className="w-5 h-5 mr-3 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
              {isRateLimitError({ message: error }) && (
                <Button
                  onClick={async () => {
                    setError('Resetting rate limit, please wait...');
                    await waitForCircuitBreakerReset();
                    setError(null);
                    await refreshPortfolio();
                  }}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 rounded-xl text-sm h-9"
                >
                  Reset Rate Limit
                </Button>
              )}
            </div>
          )}

          {/* Hero Portfolio Card */}
          <div className="relative group rounded-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl border border-white/10 pointer-events-none" />
            <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <Card className="relative bg-[#090D14]/80 backdrop-blur-2xl border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent mix-blend-screen pointer-events-none" />
              
              <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="z-10">
                  <div className="flex items-center space-x-2 text-zinc-400 font-medium mb-4">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span className="uppercase tracking-wider text-sm font-semibold">Total GHC Portfolio</span>
                  </div>
                  <div className="flex items-baseline space-x-3">
                    {isLoading ? (
                      <div className="w-64 h-20 bg-white/5 rounded-2xl animate-pulse" />
                    ) : (
                      <>
                        <span className="text-6xl md:text-7xl font-bold font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 drop-shadow-sm">
                          {portfolioValue > 0 ? formatNumber(portfolioValue) : '0.00'}
                        </span>
                        <span className="text-3xl font-bold text-emerald-500/80">GHC</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons Hub */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 w-full md:w-auto z-10 mx-auto md:mx-0">
                  {isGovernance && (
                    <Button
                      className="h-12 px-4 bg-purple-600/90 hover:bg-purple-500 text-white rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.2)] hover:shadow-[0_0_25px_rgba(147,51,234,0.4)] transition-all hover:-translate-y-0.5 w-full sm:w-auto font-medium text-sm md:text-base border border-purple-400/30"
                      onClick={() => setSelectedAction('issue')}
                    >
                      <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2 opacity-90" />
                      Issue Credit
                    </Button>
                  )}
                  {isProducer && (
                    <Button
                      className="h-12 px-4 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all hover:-translate-y-0.5 w-full sm:w-auto font-medium text-sm md:text-base border border-emerald-400/30"
                      onClick={() => setSelectedAction('production')}
                    >
                      <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2 opacity-90" />
                      Certify Prod.
                    </Button>
                  )}
                  {isCertifier && (
                    <Button
                      className="h-12 px-4 bg-blue-600/90 hover:bg-blue-500 text-white rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all hover:-translate-y-0.5 w-full sm:w-auto font-medium text-sm md:text-base border border-blue-400/30"
                      onClick={() => setSelectedAction('certification')}
                    >
                      <Award className="w-4 h-4 md:w-5 md:h-5 mr-2 opacity-90" />
                      Grant Cert.
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    className="h-12 px-4 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white rounded-xl transition-all hover:-translate-y-0.5 w-full sm:w-auto font-medium text-sm md:text-base"
                    onClick={() => setSelectedAction('transfer')}
                    disabled={userBatches.length === 0}
                  >
                    <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 mr-2 opacity-80" />
                    Transfer
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 px-4 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white rounded-xl transition-all hover:-translate-y-0.5 w-full sm:w-auto font-medium text-sm md:text-base"
                    onClick={() => setSelectedAction('retire')}
                    disabled={userBatches.length === 0}
                  >
                    <RotateCcw className="w-4 h-4 md:w-5 md:h-5 mr-2 opacity-80" />
                    Retire
                  </Button>
                </div>
              </CardContent>
              
              {/* Quick Stats Banner inside Hero Card */}
              {userBatches.length > 0 && (
                <div className="border-t border-white/10 bg-white/[0.02] p-6 lg:px-12 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
                  <div className="py-3 sm:py-0 sm:px-6 flex flex-col first:pl-0 last:pr-0">
                    <span className="text-zinc-500 text-sm font-semibold uppercase tracking-wider mb-1">Active Batches</span>
                    <span className="text-3xl font-bold text-white">{userBatches.length}</span>
                  </div>
                  <div className="py-3 sm:py-0 sm:px-6 flex flex-col">
                    <span className="text-zinc-500 text-sm font-semibold uppercase tracking-wider mb-1">Active Credits</span>
                    <span className="text-3xl font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                      {userBatches.filter((b) => b.status === 'Active').length}
                    </span>
                  </div>
                  <div className="py-3 sm:py-0 sm:px-6 flex flex-col">
                    <span className="text-zinc-500 text-sm font-semibold uppercase tracking-wider mb-1">Retired Credits</span>
                    <span className="text-3xl font-bold text-zinc-400">
                      {userBatches.filter((b) => b.status === 'Retired').length}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
            {/* Left Column: Ledger Table */}
            <div className={`${(isGovernance || isCertifier) ? 'xl:col-span-2' : 'xl:col-span-3'} space-y-8`}>
              <Card className="bg-[#090D14]/80 backdrop-blur-xl border-white/10 rounded-3xl overflow-hidden shadow-xl h-full">
                <CardHeader className="border-b border-white/5 px-8 py-6 bg-white/[0.02]">
                  <CardTitle className="text-xl font-semibold flex items-center text-zinc-100">
                    <History className="w-5 h-5 mr-3 text-emerald-400" />
                    Transaction Ledger
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-8 space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                      ))}
                    </div>
                  ) : userBatches.length === 0 ? (
                    <div className="text-center py-24 px-6">
                      <div className="w-20 h-20 rounded-full bg-white/5 mx-auto mb-6 flex items-center justify-center border border-white/10">
                        <History className="w-10 h-10 text-zinc-600" />
                      </div>
                      <h3 className="text-xl font-medium text-white mb-2">No Active Ledger Entries</h3>
                      <p className="text-zinc-500 max-w-sm mx-auto">
                        Your authenticated batches will continuously sync here once you establish operations.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="bg-white/[0.02] border-b border-white/5">
                            <th className="py-4 px-8 font-semibold text-xs uppercase tracking-wider text-zinc-500">Batch Identifier</th>
                            <th className="py-4 px-4 font-semibold text-xs uppercase tracking-wider text-zinc-500">Verified Quantity</th>
                            <th className="py-4 px-4 font-semibold text-xs uppercase tracking-wider text-zinc-500">Issuance Date</th>
                            <th className="py-4 px-8 font-semibold text-xs uppercase tracking-wider text-zinc-500 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {userBatches.map((batch) => (
                            <tr
                              key={batch.id}
                              className="hover:bg-white/[0.04] transition-colors group cursor-default"
                            >
                              <td className="py-5 px-8">
                                <div className="font-mono text-zinc-300 group-hover:text-emerald-400 transition-colors font-medium">
                                  Batch {batch.batchId}
                                </div>
                              </td>
                              <td className="py-5 px-4 font-mono font-semibold text-white">
                                {formatNumber(batch.quantity)} <span className="text-zinc-500 text-sm font-normal">GHC</span>
                              </td>
                              <td className="py-5 px-4 text-zinc-400 font-medium">
                                {formatDate(batch.issuanceDate)}
                              </td>
                              <td className="py-5 px-8 text-right">
                                <Badge className={`px-3 py-1.5 text-xs font-semibold rounded-full border bg-transparent ${getStatusChipClass(batch.status)}`}>
                                  {batch.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Roles Actions */}
            <div className="space-y-6">
              {/* Governance Actions Section */}
              {contractService && isGovernance && (
                <Card className="bg-[#090D14]/80 backdrop-blur-xl border-purple-500/20 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(147,51,234,0.05)]">
                  <CardHeader className="border-b border-purple-500/10 px-6 py-5 bg-purple-500/5">
                    <CardTitle className="text-lg font-semibold flex items-center text-purple-100">
                      <Shield className="w-5 h-5 mr-3 text-purple-400" />
                      Network Governance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <GovernanceActions contractService={contractService} />
                  </CardContent>
                </Card>
              )}

              {/* Certification Actions Section */}
              {contractService && isCertifier && (
                <Card className="bg-[#090D14]/80 backdrop-blur-xl border-blue-500/20 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.05)]">
                  <CardHeader className="border-b border-blue-500/10 px-6 py-5 bg-blue-500/5">
                    <CardTitle className="text-lg font-semibold flex items-center text-blue-100">
                      <Award className="w-5 h-5 mr-3 text-blue-400" />
                      Certification Ops
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CertificationActions contractService={contractService} />
                  </CardContent>
                </Card>
              )}

            </div>
          {/* Role Management Section - Spanning full width */}
          {contractService && isGovernance && (
            <div className="xl:col-span-3 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500">
              <Card className="bg-[#090D14]/80 backdrop-blur-xl border-white/10 rounded-3xl overflow-hidden shadow-2xl relative group">
                {/* Subtle Glow Overlay */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-30" />
                
                <CardHeader className="border-b border-white/5 px-8 py-6 bg-white/[0.02]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <Shield className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-zinc-100 tracking-tight">Ecosystem Role Management</CardTitle>
                        <p className="text-sm text-zinc-500 mt-0.5">Configure network permissions and authority levels across the C2Ledger nodes.</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <RoleManagement contractService={contractService} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        </main>

        {/* Elegant Blur Modals */}
        {selectedAction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            <div 
              className="absolute inset-0 bg-[#090D14]/80 backdrop-blur-lg" 
              onClick={() => setSelectedAction(null)} 
            />
            
            {/* Modal Container */}
            <div className="relative w-full max-w-3xl bg-[#090D14] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 ring-1 ring-white/10">
              <div className="absolute top-0 right-0 w-1/2 h-40 bg-gradient-to-l from-emerald-500/10 to-transparent mix-blend-screen pointer-events-none" />
              
              {/* Modal Header */}
              <div className="relative flex items-center justify-between px-8 py-6 border-b border-white/10 bg-white/[0.01]">
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 tracking-tight">
                  {selectedAction === 'issue' && 'Issue Network Credits'}
                  {selectedAction === 'certification' && 'Grant Origin Certification'}
                  {selectedAction === 'production' && 'Certify Production Records'}
                  {selectedAction === 'transfer' && 'Execute Asset Transfer'}
                  {selectedAction === 'retire' && 'Retire Asset Identity'}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    setSelectedAction(null);
                    await refreshPortfolio();
                  }}
                  className="rounded-full w-10 h-10 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  ✕
                </Button>
              </div>

              {/* Modal Content Frame */}
              <div className="relative p-8 overflow-y-auto custom-scrollbar">
                {/* Logic handling components mapped appropriately */}
                {selectedAction === 'issue' && contractService && isGovernance ? (
                  <GovernanceActions contractService={contractService} />
                ) : selectedAction === 'certification' && contractService && isCertifier ? (
                  <CertificationActions contractService={contractService} />
                ) : selectedAction === 'production' && contractService && isProducer ? (
                  <ProductionActions contractService={contractService} />
                ) : selectedAction === 'transfer' && contractService ? (
                  <TransferCredits contractService={contractService} />
                ) : selectedAction === 'retire' && contractService ? (
                  <RetireCredits contractService={contractService} />
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                      <Shield className="w-10 h-10 text-red-500" />
                    </div>
                    <p className="text-red-400 font-semibold text-xl mb-3">Unauthorized Protocol Request</p>
                    <p className="text-zinc-500 max-w-sm mx-auto">Your current network identity lacks execution clearance for this endpoint layer.</p>
                    <div className="mt-8">
                      <Button variant="outline" className="border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white rounded-xl h-12 px-8" onClick={() => setSelectedAction(null)}>Acknowledge & Close</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
