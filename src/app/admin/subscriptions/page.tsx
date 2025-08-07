'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Subscription {
  id: string;
  userId: string;
  planType: string;
  price: number;
  currency: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
  userEmail: string;
  username: string;
}

interface EditSubscription {
  id: string;
  planType: string;
  price: number;
  currency: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [editingSubscription, setEditingSubscription] = useState<EditSubscription | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, [page, statusFilter, planFilter]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (statusFilter) params.append('status', statusFilter);
      if (planFilter) params.append('planType', planFilter);
      
      const response = await fetch(`/api/admin/subscriptions?${params}`);
      if (response.ok) {
        const data = await response.json() as { subscriptions: Subscription[] };
        setSubscriptions(data.subscriptions);
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;

    try {
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchSubscriptions();
      } else {
        alert('Failed to delete subscription');
      }
    } catch (error) {
      console.error('Failed to delete subscription:', error);
      alert('Failed to delete subscription');
    }
  };

  const handleUpdateSubscription = async () => {
    if (!editingSubscription) return;

    try {
      const response = await fetch(`/api/admin/subscriptions/${editingSubscription.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: editingSubscription.planType,
          price: editingSubscription.price,
          currency: editingSubscription.currency,
          status: editingSubscription.status,
          startDate: editingSubscription.startDate,
          endDate: editingSubscription.endDate,
          autoRenew: editingSubscription.autoRenew,
        }),
      });
      
      if (response.ok) {
        setEditingSubscription(null);
        fetchSubscriptions();
      } else {
        alert('Failed to update subscription');
      }
    } catch (error) {
      console.error('Failed to update subscription:', error);
      alert('Failed to update subscription');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'cancelled': return 'destructive';
      case 'expired': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
        </div>

        <Card className="p-6">
          <div className="flex gap-4 mb-6">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="h-10 px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Plans</option>
              <option value="premium">Premium</option>
              <option value="vip">VIP</option>
            </select>
            <Button variant="outline" onClick={fetchSubscriptions}>Filter</Button>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Auto Renew</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.username}</div>
                        <div className="text-sm text-gray-500">{subscription.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{subscription.planType}</Badge>
                    </TableCell>
                    <TableCell>
                      {subscription.currency} {subscription.price}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(subscription.status)}>
                        {subscription.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(subscription.startDate)}</TableCell>
                    <TableCell>{formatDate(subscription.endDate)}</TableCell>
                    <TableCell>
                      <Badge variant={subscription.autoRenew ? 'success' : 'secondary'}>
                        {subscription.autoRenew ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingSubscription({
                            id: subscription.id,
                            planType: subscription.planType,
                            price: subscription.price,
                            currency: subscription.currency,
                            status: subscription.status,
                            startDate: subscription.startDate,
                            endDate: subscription.endDate,
                            autoRenew: subscription.autoRenew,
                          })}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteSubscription(subscription.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {editingSubscription && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Subscription</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Plan Type</label>
                <select
                  value={editingSubscription.planType}
                  onChange={(e) => setEditingSubscription({ 
                    ...editingSubscription, 
                    planType: e.target.value 
                  })}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingSubscription.price}
                  onChange={(e) => setEditingSubscription({ 
                    ...editingSubscription, 
                    price: parseFloat(e.target.value) || 0 
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <Input
                  value={editingSubscription.currency}
                  onChange={(e) => setEditingSubscription({ 
                    ...editingSubscription, 
                    currency: e.target.value 
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={editingSubscription.status}
                  onChange={(e) => setEditingSubscription({ 
                    ...editingSubscription, 
                    status: e.target.value 
                  })}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <Input
                  type="date"
                  value={editingSubscription.startDate?.split('T')[0]}
                  onChange={(e) => setEditingSubscription({ 
                    ...editingSubscription, 
                    startDate: e.target.value 
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <Input
                  type="date"
                  value={editingSubscription.endDate?.split('T')[0]}
                  onChange={(e) => setEditingSubscription({ 
                    ...editingSubscription, 
                    endDate: e.target.value 
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Auto Renew</label>
                <input
                  type="checkbox"
                  checked={editingSubscription.autoRenew}
                  onChange={(e) => setEditingSubscription({ 
                    ...editingSubscription, 
                    autoRenew: e.target.checked 
                  })}
                  className="rounded"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleUpdateSubscription}>Save</Button>
              <Button variant="outline" onClick={() => setEditingSubscription(null)}>
                Cancel
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

export const runtime = "edge";
