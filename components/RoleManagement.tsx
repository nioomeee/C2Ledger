'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, UserPlus, UserMinus, Users } from 'lucide-react';
import { ContractService, UserRole } from '@/lib/contractService';
import { useWallet } from '@/contexts/WalletContext';

interface RoleManagementProps {
  contractService: ContractService | null;
}

export default function RoleManagement({
  contractService,
}: RoleManagementProps) {
  const { account } = useWallet();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const roles = [
    { value: 'GOVERNANCE_ROLE', label: 'Governance' },
    { value: 'CERTIFIER_ROLE', label: 'Certifier' },
    { value: 'PRODUCER_ROLE', label: 'Producer' },
  ];

  const loadUserRoles = async () => {
    if (!contractService) return;

    setIsLoading(true);
    try {
      // For demo purposes, let's show some test accounts with their roles
      const testAccounts = [
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
        '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
        '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
        '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
        '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
      ];

      const rolesData: UserRole[] = [];
      for (const address of testAccounts) {
        try {
          const roles = await contractService.getUserRoles(address);
          rolesData.push({ address, roles });
        } catch (err) {
          console.warn(`Failed to get roles for ${address}:`, err);
          rolesData.push({ address, roles: [] });
        }
      }

      setUserRoles(rolesData);
    } catch (err) {
      console.error('Error loading user roles:', err);
      setError('Failed to load user roles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contractService) {
      loadUserRoles();
    }
  }, [contractService]);

  const handleGrantRole = async () => {
    if (!contractService || !newAddress || !selectedRole) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await contractService.grantRole(selectedRole, newAddress);
      setSuccess(`Successfully granted ${selectedRole} role to ${newAddress}`);
      setNewAddress('');
      setSelectedRole('');
      await loadUserRoles(); // Refresh the list
    } catch (err) {
      console.error('Error granting role:', err);
      setError(
        'Failed to grant role. Make sure you have Governance permissions.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeRole = async (role: string, address: string) => {
    if (!contractService) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await contractService.revokeRole(role, address);
      setSuccess(`Successfully revoked ${role} role from ${address}`);
      await loadUserRoles(); // Refresh the list
    } catch (err) {
      console.error('Error revoking role:', err);
      setError(
        'Failed to revoke role. Make sure you have Governance permissions.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Governance':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Certifier':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Producer':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="pt-6">
            <p className="text-red-300">{error}</p>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-500/30 bg-green-500/10">
          <CardContent className="pt-6">
            <p className="text-green-300">{success}</p>
          </CardContent>
        </Card>
      )}

      {/* Grant Role Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Grant Role</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Wallet Address"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
            />
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleGrantRole}
              disabled={isLoading || !newAddress || !selectedRole}
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Grant Role
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Roles List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>User Roles</span>
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
          ) : (
            <div className="space-y-4">
              {userRoles.map((userRole) => (
                <div
                  key={userRole.address}
                  className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-sm text-zinc-200 truncate" title={userRole.address}>
                          {userRole.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {userRole.roles.length > 0 ? (
                        userRole.roles.map((role) => (
                          <Badge key={role} className={getRoleColor(role)}>
                            {role}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-zinc-500 font-medium">
                          No Roles Assigned
                        </span>
                      )}
                    </div>
                  </div>

                  {userRole.roles.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider mr-2">
                          Revoke:
                        </span>
                        {userRole.roles.map((role) => (
                          <Button
                            key={role}
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleRevokeRole(role, userRole.address)
                            }
                            disabled={isLoading}
                            className="h-8 px-3 bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors"
                          >
                            <UserMinus className="w-3.5 h-3.5 mr-1.5" />
                            {role}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
