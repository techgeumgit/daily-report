'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAdminStore, UserData } from '@/store/adminStore';
import { UserPlus, Power, Trash2, Users } from 'lucide-react';

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'admin123';

export default function UserManagement() {
  const { users, usersLoading, setUsers, setUsersLoading } = useAdminStore();
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), adminSecret: ADMIN_SECRET }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to add user');
      } else {
        toast.success(`${newName.trim()} added`);
        setNewName('');
        fetchUsers();
      }
    } catch {
      toast.error('Network error');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (user: UserData) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} "${user.name}"?`)) return;
    
    setToggling(user._id);
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !user.isActive,
          adminSecret: ADMIN_SECRET,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update user');
      } else {
        toast.success(
          data.data.isActive
            ? `${user.name} activated`
            : `${user.name} deactivated`
        );
        fetchUsers();
      }
    } catch {
      toast.error('Network error');
    } finally {
      setToggling(null);
    }
  };

  const handleDeleteUser = async (user: UserData) => {
    if (!confirm(`Delete "${user.name}" permanently?`)) return;
    setToggling(user._id);
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminSecret: ADMIN_SECRET }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to delete user');
      } else {
        toast.success(`${user.name} deleted`);
        fetchUsers();
      }
    } catch {
      toast.error('Network error');
    } finally {
      setToggling(null);
    }
  };

  const activeCount = users.filter((u) => u.isActive).length;

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#f3f4f6] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#6b7280]" />
          <p className="text-sm font-semibold text-[#111827]">Team Members</p>
          <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f0fdf4] text-[#16a34a]">
            {activeCount} active
          </span>
        </div>
      </div>

      {/* Add new user */}
      <div className="px-5 py-4 border-b border-[#f3f4f6]">
        <form onSubmit={handleAddUser} className="flex gap-2">
          <input
            type="text"
            id="new-user-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Full name…"
            className="flex-1 h-9 px-3 rounded-lg border border-[#e5e7eb] text-sm text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
          />
          <button
            type="submit"
            id="add-user-btn"
            disabled={adding || !newName.trim()}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-semibold bg-[#111827] text-white hover:bg-[#1f2937] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {adding ? 'Adding…' : 'Add'}
          </button>
        </form>
      </div>

      {/* User list */}
      <div className="divide-y divide-[#f3f4f6]">
        {usersLoading ? (
          <div className="px-5 py-8 text-center text-sm text-[#9ca3af]">
            Loading…
          </div>
        ) : users.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[#9ca3af]">
            No team members yet. Add one above.
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className="px-5 py-3 flex items-center gap-3"
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 ${
                  user.isActive
                    ? 'bg-[#eff6ff] text-[#2563eb]'
                    : 'bg-[#f3f4f6] text-[#9ca3af]'
                }`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>

              {/* Name + status */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    user.isActive ? 'text-[#111827]' : 'text-[#9ca3af] line-through'
                  }`}
                >
                  {user.name}
                </p>
                <p className="text-[11px] text-[#9ca3af]">
                  {user.isActive ? 'Active — visible in form' : 'Inactive — hidden from form'}
                </p>
              </div>

              {/* Toggle active */}
              <button
                onClick={() => handleToggleActive(user)}
                disabled={toggling === user._id}
                title={user.isActive ? 'Deactivate' : 'Activate'}
                className={`flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-40 ${
                  user.isActive
                    ? 'bg-[#f0fdf4] text-[#16a34a] hover:bg-[#dcfce7]'
                    : 'bg-[#fef2f2] text-[#dc2626] hover:bg-[#fee2e2]'
                }`}
              >
                <Power className="w-3 h-3" />
                {toggling === user._id
                  ? '…'
                  : user.isActive
                  ? 'Active'
                  : 'Inactive'}
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDeleteUser(user)}
                disabled={toggling === user._id}
                title="Delete user"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#d1d5db] hover:text-[#ef4444] hover:bg-[#fef2f2] transition-colors cursor-pointer disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
