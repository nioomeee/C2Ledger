'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, Factory } from 'lucide-react';
import { ContractService, GHCBatch } from '@/lib/contractService';
import { formatNumber } from '@/lib/utils';
import { isRateLimitError, waitForCircuitBreakerReset } from '@/lib/rateLimit';

interface ProductionActionsProps {
  contractService: ContractService;
}

export default function ProductionActions({
  contractService,
}: ProductionActionsProps) {
  const [batches, setBatches] = useState<GHCBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingBatches, setIsFetchingBatches] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch batches on mount
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setIsFetchingBatches(true);
        // We use getAllBatches to find active batches to produce against
        const allBatches = await contractService.getAllBatches();
        // Filter for active batches only
        const activeBatches = allBatches.filter(
          (b) => b.status === 'Active'
        );
        setBatches(activeBatches);
      } catch (err: any) {
        console.error('Error fetching batches:', err);
        setError('Failed to load batches. Please try again.');
      } finally {
        setIsFetchingBatches(false);
      }
    };

    fetchBatches();
  }, [contractService]);

  const handleProduce = async () => {
    if (!selectedBatchId || !quantity) {
      setError('Please select a batch and enter a quantity');
      return;
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity greater than 0');
      return;
    }

    // Check against batch limit (approximation based on available info)
    const batch = batches.find((b) => b.id === selectedBatchId);
    if (batch && qty > batch.quantity) {
      setError(`Quantity cannot exceed batch limit of ${formatNumber(batch.quantity)}`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const txHash = await contractService.produceHydrogen(
        Number(selectedBatchId),
        qty
      );

      setSuccess(
        `Successfully produced ${formatNumber(qty)} Carbon credits! Transaction: ${txHash.slice(0, 10)}...`
      );
      
      // Reset form
      setQuantity('');
      // Keep selected batch for convenience
    } catch (err: any) {
      console.error('Error producing hydrogen:', err);
      
      if (isRateLimitError(err)) {
        setError(
          'Rate limit reached. Please wait a moment and try again.'
        );
      } else {
        setError(
          `Failed to produce carbon credits: ${err.message || 'Unknown error'}`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedBatch = batches.find((b) => b.id === selectedBatchId);

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-300">{error}</p>
            </div>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Factory className="w-5 h-5 text-green-500" />
            <span>Produce Carbon Credits</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="batch-select">Select Batch to Produce Against</Label>
            {isFetchingBatches ? (
              <div className="h-10 w-full bg-muted/20 animate-pulse rounded-md" />
            ) : (
              <Select
                value={selectedBatchId}
                onValueChange={setSelectedBatchId}
              >
                <SelectTrigger id="batch-select">
                  <SelectValue placeholder="Select a batch..." />
                </SelectTrigger>
                <SelectContent>
                  {batches.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No active batches available
                    </div>
                  ) : (
                    batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        Batch {batch.batchId} - Limit: {formatNumber(batch.quantity)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity (GHC)</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Enter amount to produce..."
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={isLoading || !selectedBatchId}
            />
            {selectedBatch && (
              <p className="text-xs text-muted-foreground">
                Max production limit for this batch: {formatNumber(selectedBatch.quantity)}
              </p>
            )}
          </div>

          <Button
            onClick={handleProduce}
            disabled={isLoading || !selectedBatchId || !quantity}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Production...
              </>
            ) : (
              <>
                <Factory className="w-4 h-4 mr-2" />
                Produce Carbon Credits
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      {/* Information Card */}
      <Card className="bg-muted/10 border-muted/20">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Note:</strong> Producing carbon credits will mint new GHC tokens to your wallet.</p>
            <p>You can only produce against active batches. Ensure your production quantity does not exceed the batch limit.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
