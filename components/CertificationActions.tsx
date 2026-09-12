'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Award, Users, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { ContractService } from '@/lib/contractService';
import { useWallet } from '@/contexts/WalletContext';
import { isRateLimitError, waitForCircuitBreakerReset } from '@/lib/rateLimit';

interface CertificationActionsProps {
  contractService: ContractService | null;
}

interface ProducerInfo {
  address: string;
  totalCredits: number;
  grade: string;
  batches: number[];
}

export default function CertificationActions({
  contractService,
}: CertificationActionsProps) {
  const { account } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Certification Form
  const [producerAddress, setProducerAddress] = useState('');
  const [description, setDescription] = useState('');
  const [producerInfo, setProducerInfo] = useState<ProducerInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchProducer = async () => {
    if (!contractService || !producerAddress) {
      setError('Please enter a producer address');
      return;
    }

    setIsSearching(true);
    setError(null);
    setProducerInfo(null);

    try {
      // Get producer's batches
      const userBatches = await contractService
        .getContract()!
        .getUserBatchesPublic(producerAddress);

      if (userBatches.length === 0) {
        setError('No credits found for this producer address');
        return;
      }

      // Calculate total credits
      let totalCredits = 0;
      for (const batchId of userBatches) {
        const balance = await contractService
          .getContract()!
          .balanceOf(producerAddress, batchId);
        totalCredits += Number(balance);
      }

      // Determine grade based on total credits
      let grade = 'Grade D';
      if (totalCredits >= 10000) grade = 'Grade A';
      else if (totalCredits >= 5000) grade = 'Grade B';
      else if (totalCredits >= 1000) grade = 'Grade C';

      setProducerInfo({
        address: producerAddress,
        totalCredits,
        grade,
        batches: userBatches.map((b: any) => Number(b)),
      });
    } catch (err: any) {
      console.error('Error searching producer:', err);
      setError(
        'Failed to search producer. Please check the address and try again.'
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleIssueCertification = async () => {
    if (!contractService || !producerAddress || !description) {
      setError('Please fill in all fields');
      return;
    }

    if (!producerInfo) {
      setError('Please search for a producer first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Check if user has certifier role
      const hasCertifier = await contractService.hasRole(
        'CERTIFIER_ROLE',
        account || ''
      );

      if (!hasCertifier) {
        setError(
          'You do not have Certifier permissions. Please connect with a Certifier wallet.'
        );
        return;
      }

      // Issue certification
      const txHash = await contractService.issueCertification(
        producerAddress,
        description
      );

      setSuccess(
        `Successfully issued Grade ${
          producerInfo.grade
        } certification to ${producerAddress}. Transaction: ${txHash.slice(
          0,
          10
        )}...`
      );

      // Reset form
      setProducerAddress('');
      setDescription('');
      setProducerInfo(null);
    } catch (err: any) {
      console.error('Error issuing certification:', err);

      if (isRateLimitError(err)) {
        setError(
          'Rate limit reached. Please wait a moment and try again, or click "Reset Rate Limit" below.'
        );
      } else {
        setError(
          `Failed to issue certification: ${
            err.message || 'Make sure you have Certifier permissions.'
          }`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'Grade A':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'Grade B':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Grade C':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Grade D':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-300">{error}</p>
            </div>
            {isRateLimitError({ message: error }) && (
              <Button
                onClick={async () => {
                  setError('Resetting rate limit, please wait...');
                  await waitForCircuitBreakerReset();
                  setError(null);
                  setSuccess(
                    'Rate limit reset successfully. You can now try again.'
                  );
                }}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                Reset Rate Limit
              </Button>
            )}
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

      {/* Search Producer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Search Producer</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="producerAddress">Producer Address</Label>
              <Input
                id="producerAddress"
                placeholder="0x..."
                value={producerAddress}
                onChange={(e) => setProducerAddress(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSearchProducer}
                disabled={isSearching || !producerAddress}
                className="h-10"
              >
                <Search className="w-4 h-4 mr-2" />
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Producer Information */}
      {producerInfo && (
        <Card className="border-blue-500/30 bg-blue-500/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span>Producer Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Address</Label>
                <p className="font-mono text-sm">{producerInfo.address.slice(0, 6) + '...' + producerInfo.address.slice(-4)}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  Total Credits
                </Label>
                <p className="text-lg font-bold text-primary">
                  {producerInfo.totalCredits.toLocaleString()} GHC
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  Eligible Grade
                </Label>
                <Badge className={getGradeColor(producerInfo.grade)}>
                  <Award className="w-3 h-3 mr-1" />
                  Grade {producerInfo.grade}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                Active Batches
              </Label>
              <p className="text-sm">{producerInfo.batches.length} batches</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issue Certification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Issue Certification</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="description">Certification Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the certification details, verification process, and any special notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {producerInfo && (
            <div className="p-4 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Certification Summary:
              </p>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Producer:</strong> {producerInfo.address}
                </p>
                <p>
                  <strong>Grade:</strong> {producerInfo.grade} (based on{' '}
                  {producerInfo.totalCredits.toLocaleString()} GHC)
                </p>
                <p>
                  <strong>Batches:</strong> {producerInfo.batches.length} active
                  batches
                </p>
              </div>
            </div>
          )}

          <Button
            onClick={handleIssueCertification}
            disabled={isLoading || !producerInfo || !description}
            className="w-full"
          >
            <Award className="w-4 h-4 mr-2" />
            {isLoading ? 'Issuing Certification...' : 'Issue Certification'}
          </Button>
        </CardContent>
      </Card>

      {/* Certification Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Certification Guidelines</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                Grade A
              </Badge>
              <span>10,000+ GHC credits</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                Grade B
              </Badge>
              <span>5,000 - 9,999 GHC credits</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                Grade C
              </Badge>
              <span>1,000 - 4,999 GHC credits</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                Grade D
              </Badge>
              <span>500 - 999 GHC credits</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
