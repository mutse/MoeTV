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

interface User {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  isSubscribed: boolean;
  subscriptionType?: string;
  subscriptionExpires?: string;
  createdAt: string;
}

interface EditUser {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  isSubscribed: boolean;
  subscriptionType: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState<EditUser | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    username: '',
    password: '',
    isAdmin: false,
  });

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
      });
      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json() as { users: User[] };
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchUsers();
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editingUser.email,
          username: editingUser.username,
          isAdmin: editingUser.isAdmin,
          isSubscribed: editingUser.isSubscribed,
          subscriptionType: editingUser.subscriptionType || null,
        }),
      });
      
      if (response.ok) {
        setEditingUser(null);
        fetchUsers();
      } else {
        alert('Failed to update user');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user');
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.username || !newUser.password) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      
      if (response.ok) {
        setNewUser({ email: '', username: '', password: '', isAdmin: false });
        setShowCreateForm(false);
        fetchUsers();
      } else {
        alert('Failed to create user');
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <Button onClick={() => setShowCreateForm(true)}>Create User</Button>
        </div>

        <Card className="p-6">
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="outline" onClick={fetchUsers}>Search</Button>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <Badge variant={user.isAdmin ? 'destructive' : 'secondary'}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isSubscribed ? (
                        <Badge variant="success">{user.subscriptionType}</Badge>
                      ) : (
                        <Badge variant="outline">Free</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingUser({
                            id: user.id,
                            email: user.email,
                            username: user.username,
                            isAdmin: user.isAdmin,
                            isSubscribed: user.isSubscribed,
                            subscriptionType: user.subscriptionType || '',
                          })}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(user.id)}
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

        {editingUser && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <Input
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Admin</label>
                <input
                  type="checkbox"
                  checked={editingUser.isAdmin}
                  onChange={(e) => setEditingUser({ ...editingUser, isAdmin: e.target.checked })}
                  className="rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subscribed</label>
                <input
                  type="checkbox"
                  checked={editingUser.isSubscribed}
                  onChange={(e) => setEditingUser({ ...editingUser, isSubscribed: e.target.checked })}
                  className="rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subscription Type</label>
                <select
                  value={editingUser.subscriptionType}
                  onChange={(e) => setEditingUser({ ...editingUser, subscriptionType: e.target.value })}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">None</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleUpdateUser}>Save</Button>
              <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            </div>
          </Card>
        )}

        {showCreateForm && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Create User</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <Input
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Admin</label>
                <input
                  type="checkbox"
                  checked={newUser.isAdmin}
                  onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
                  className="rounded"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCreateUser}>Create</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

export const runtime = "edge";
