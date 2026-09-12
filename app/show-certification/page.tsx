'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  ArrowLeft,
  Award,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import { ContractService } from '@/lib/contractService';
import { getContractAddress } from '@/lib/config';

const CONTRACT_ADDRESS = getContractAddress();

export default function ShowCertificationPage() {
  const { account, isConnected, signer, provider } = useWallet();
  const [contractService, setContractService] =
    useState<ContractService | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize contract service when wallet is connected
  useEffect(() => {
    if (isConnected && signer && provider) {
      const service = new ContractService(CONTRACT_ADDRESS, provider, signer);
      setContractService(service);
    }
  }, [isConnected, signer, provider]);

  // Load user roles and certifications when contract service is available
  useEffect(() => {
    const loadData = async () => {
      if (!contractService || !account) return;

      try {
        setIsLoading(true);
        setError(null);

        // Load user roles
        const roles = await contractService.getUserRoles(account);
        setUserRoles(roles);

        // Load certifications if user is a producer
        if (roles.includes('Producer')) {
          const certIds = await contractService.getProducerCertifications(
            account
          );
          const certs = [];

          for (const certId of certIds) {
            try {
              const cert = await contractService.getCertification(certId);
              certs.push(cert);
            } catch (err) {
              console.warn(`Error loading certification ${certId}:`, err);
            }
          }

          setCertifications(certs);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load certification data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [contractService, account]);

  const isProducer = userRoles.includes('Producer');

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#090D14] flex items-center justify-center p-6 selection:bg-emerald-500/30">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-emerald-900/10 blur-[120px] mix-blend-screen animate-pulse" />
        </div>
        <Card className="relative z-10 w-full max-w-md bg-[#090D14]/80 backdrop-blur-2xl border-white/10 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-zinc-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h2>
          <p className="text-zinc-400 mb-8 leading-relaxed">
            Authentication is required to retrieve your certified carbon records from the ledger.
          </p>
          <Link href="/" className="block">
            <Button className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold transition-all">
              Establish Connection
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090D14] flex items-center justify-center transition-all">
        <div className="text-center animate-in fade-in duration-700">
          <div className="w-16 h-16 border-4 border-white/10 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]" />
          <p className="text-zinc-500 font-medium tracking-wide">Syncing certifications...</p>
        </div>
      </div>
    );
  }

  if (!isProducer) {
    return (
      <div className="min-h-screen bg-[#090D14] flex flex-col selection:bg-red-500/30">
        <header className="sticky top-0 z-40 border-b border-white/5 bg-[#090D14]/60 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5 text-zinc-400">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-emerald-400" />
                <span className="text-xl font-bold text-white tracking-tight">C2Ledger</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-lg w-full bg-[#090D14]/80 backdrop-blur-2xl border-red-500/20 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl pointer-events-none" />
             <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
               <AlertCircle className="w-8 h-8 text-red-500" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Access Restricted</h2>
             <p className="text-zinc-400 mb-6 leading-relaxed">
               Your current network identity lack the <b>Producer</b> clearance required to view this endpoint.
             </p>
             <div className="flex items-center justify-center space-x-2 mb-8 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Active Roles:</span>
                <span className="text-xs font-mono text-zinc-300">{userRoles.join(', ') || 'None'}</span>
             </div>
             <Link href="/dashboard">
               <Button className="h-12 px-8 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all">
                 Return to Hub
               </Button>
             </Link>
          </Card>
        </main>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[#090D14] text-white relative overflow-hidden selection:bg-emerald-500/30">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-emerald-900/10 blur-[120px] mix-blend-screen animate-pulse duration-[10000ms]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-blue-900/5 blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-white/5 bg-[#090D14]/60 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5 text-zinc-400 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center space-x-3 group animate-in slide-in-from-left-4 duration-500">
                <Award className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.55)]" />
                <span className="text-xl font-bold text-white tracking-tight">C2Ledger</span>
                <span className="mx-2 text-zinc-600 font-light">/</span>
                <span className="text-zinc-400 font-medium">Certification Hub</span>
              </div>
            </div>
            
            <div className="flex items-center px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-in slide-in-from-right-4 duration-500">
              <CheckCircle className="w-3.5 h-3.5 mr-2 text-emerald-400" />
              Verified Producer
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto w-full px-6 py-12 flex flex-col gap-10">
          {/* Welcome Section */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white block to-zinc-400">
              Verified Certifications
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
              Authenticated documentation of your Carbon credit production standards, issued and audited by network authorities.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center text-red-400 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Certifications List */}
          {certifications.length === 0 ? (
            <Card className="bg-[#090D14]/80 backdrop-blur-2xl border-white/10 rounded-3xl p-16 text-center shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Award className="w-10 h-10 text-zinc-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">No Active Certifications</h2>
              <p className="text-zinc-500 max-w-sm mx-auto leading-relaxed">
                Your performance metrics are being analyzed. Certifications will manifest once your credit holdings meet the network threshold.
              </p>
            </Card>
          ) : (
            <div className="grid gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              {certifications.map((cert) => (
                <Card key={cert.id} className="group relative bg-[#090D14]/80 backdrop-blur-2xl border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-white/20 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/[0.03] to-transparent pointer-events-none" />
                  
                  <CardHeader className="border-b border-white/5 px-8 py-6 bg-white/[0.01]">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <Award className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-zinc-100">Quality Certification #{cert.id}</CardTitle>
                          <p className="text-xs font-mono text-zinc-500 mt-0.5 uppercase tracking-widest">Protocol ID: {cert.id}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className={`px-4 py-1.5 rounded-full border text-xs font-black tracking-widest uppercase flex items-center shadow-sm ${
                          cert.grade === 'A' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
                          cert.grade === 'B' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 
                          'bg-zinc-500/10 text-zinc-300 border-zinc-500/30'
                        }`}>
                          Grade {cert.grade}
                        </div>
                        {cert.isActive ? (
                          <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                            Active Status
                          </div>
                        ) : (
                          <div className="px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-widest">
                            Revoked
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Validated Portfolio</p>
                        <p className="text-2xl font-bold font-mono text-white">
                          {Number(cert.totalCredits).toLocaleString()} <span className="text-zinc-500 text-sm font-normal ml-1">GHC</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Issuance Timestamp</p>
                        <p className="text-sm font-medium text-zinc-200">
                          {formatDate(Number(cert.issuanceDate))}
                        </p>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Authority Signature</p>
                        <p className="font-mono text-xs text-zinc-400 break-all bg-white/[0.03] p-2 rounded-lg border border-white/5">
                          {cert.certifier}
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3">Professional Evaluation</p>
                      <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5 relative">
                        <div className="absolute top-4 left-4 text-white/5">
                          <FileText className="w-12 h-12" />
                        </div>
                        <p className="text-zinc-300 text-sm leading-relaxed relative z-10 font-medium">
                          {cert.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
