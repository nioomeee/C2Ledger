'use client';

import { useState } from 'react';
import { Diamond, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface RecentActivity {
  id: string;
  action: string;
  txHash: string;
  timestamp: string;
}

const recentActivity: RecentActivity[] = [
  {
    id: '1',
    action: 'Minted 1000 GHCs',
    txHash: '0xabc...def',
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    action: 'Minted 500 GHCs',
    txHash: '0x123...456',
    timestamp: '4 hours ago'
  },
  {
    id: '3',
    action: 'Minted 2000 GHCs',
    txHash: '0x789...abc',
    timestamp: '6 hours ago'
  },
  {
    id: '4',
    action: 'Minted 750 GHCs',
    txHash: '0xdef...123',
    timestamp: '8 hours ago'
  }
];

export default function IssueCredit() {
  const [formData, setFormData] = useState({
    walletAddress: '',
    quantity: '',
    plantId: 'PLANT-XYZ-123',
    productionDate: '',
    energySource: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate transaction preparation
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Transaction prepared successfully!');
    }, 2000);
  };

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
            <Diamond className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">
              <span className="text-primary">C2</span>
              <span className="text-white">Ledger</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Issue Form */}
          <div className="lg:col-span-2">
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl">Issue New Carbon Credit</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="wallet">Producer's Wallet Address</Label>
                    <Input
                      id="wallet"
                      placeholder="0x..."
                      value={formData.walletAddress}
                      onChange={(e) => setFormData({...formData, walletAddress: e.target.value})}
                      className="bg-muted/30 border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity of GHCs</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="Enter quantity"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      className="bg-muted/30 border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plantId">Plant ID</Label>
                    <Input
                      id="plantId"
                      placeholder="e.g., PLANT-XYZ-123"
                      value={formData.plantId}
                      onChange={(e) => setFormData({...formData, plantId: e.target.value})}
                      className="bg-muted/30 border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Production Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.productionDate}
                      onChange={(e) => setFormData({...formData, productionDate: e.target.value})}
                      className="bg-muted/30 border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Energy Source</Label>
                    <Select value={formData.energySource} onValueChange={(value) => setFormData({...formData, energySource: value})}>
                      <SelectTrigger className="bg-muted/30 border-border/50">
                        <SelectValue placeholder="Select energy source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solar">Solar</SelectItem>
                        <SelectItem value="wind">Wind</SelectItem>
                        <SelectItem value="hydro">Hydro</SelectItem>
                        <SelectItem value="geothermal">Geothermal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-6 text-lg bg-primary hover:bg-primary/90 rounded-2xl"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-3" />
                        Preparing Transaction...
                      </>
                    ) : (
                      'Prepare Issuance Transaction'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Rail */}
          <div className="space-y-8">
            {/* Total Credits Issued */}
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle>Total Credits Issued</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary font-mono">
                  8,456,789
                </div>
                <p className="text-muted-foreground mt-2">GHC Tokens</p>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-muted/20 transition-colors">
                      <Clock className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground font-mono">Tx: {activity.txHash}</p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}