'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Diamond, LayoutDashboard, CreditCard, Activity, Settings, Award, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWallet } from '@/contexts/WalletContext';
import { useState, useEffect } from 'react';
import { ContractService } from '@/lib/contractService';
import { getContractAddress } from '@/lib/config';

export default function Navigation() {
  const pathname = usePathname();
  const { account, isConnected, signer, provider } = useWallet();
  const [userRoles, setUserRoles] = useState<string[]>([]);

  // Load user roles
  useEffect(() => {
    const loadRoles = async () => {
      if (!isConnected || !signer || !provider || !account) return;
      
      try {
        const contractService = new ContractService(getContractAddress(), provider, signer);
        const roles = await contractService.getUserRoles(account);
        setUserRoles(roles);
      } catch (error) {
        console.error('Error loading user roles:', error);
      }
    };

    loadRoles();
  }, [isConnected, signer, provider, account]);

  const isCertifier = userRoles.includes('Certifier');
  const isProducer = userRoles.includes('Producer');

  // Base navigation items
  const baseNavItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/explorer', icon: Activity, label: 'Live Explorer' },
  ];

  // Role-specific navigation items
  const roleNavItems = [];

  // Add certification items based on role
  if (isCertifier) {
    roleNavItems.push({ href: '/certification', icon: Award, label: 'Grant Certificate' });
  }

  if (isProducer) {
    roleNavItems.push({ href: '/show-certification', icon: FileText, label: 'Show Certificate' });
  }

  // Combine navigation items
  const navItems = [...baseNavItems, ...roleNavItems];

  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass-card border-border/50 rounded-2xl px-3 py-2">
        <div className="flex items-center space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center px-4 py-3 rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-primary/20 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}