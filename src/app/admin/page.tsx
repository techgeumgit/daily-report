'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAdminStore } from '@/store/adminStore';
import FilterBar from '@/components/FilterBar';
import ReportsTable from '@/components/ReportsTable';
import EditModal from '@/components/EditModal';
import AddReportModal from '@/components/AddReportModal';
import UserManagement from '@/components/UserManagement';
import { LayoutGrid, Users, LogOut } from 'lucide-react';
import Image from 'next/image';

type Tab = 'reports' | 'users';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('reports');
  const [loggingOut, setLoggingOut] = useState(false);
  const { setFilters, filters, setReports, setLoading, setUsers } = useAdminStore();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      toast.success('Signed out');
      router.push('/admin/login');
      router.refresh();
    } catch {
      toast.error('Logout failed');
    } finally {
      setLoggingOut(false);
    }
  };

  // Load all users into store on mount (for the filter dropdown)
  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUsers(d.data);
      })
      .catch(console.error);
  }, [setUsers]);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);
      if (filters.name) params.set('name', filters.name);

      const res = await fetch(`/api/reports?${params.toString()}`);
      const data = await res.json();
      if (data.success) setReports(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, setLoading, setReports]);

  const triggerRefetch = useCallback(() => {
    setFilters({ ...filters });
    refetch();
  }, [filters, setFilters, refetch]);

  return (
    <main className="min-h-screen bg-[#fafafa]">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-white border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          {/* Left: logo + tabs */}
          <div className="flex items-center w-full sm:w-auto gap-4 sm:gap-6 h-10 sm:h-14 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-3 pr-6 border-r border-[#f3f4f6]">
              <Image
                src="/logotechgeum.webp"
                alt="Tech Geum"
                width={80}
                height={26}
                className="object-contain"
              />
              <span className="text-[11px] text-[#9ca3af] font-medium border-l border-[#e5e7eb] pl-3">Admin</span>
            </div>

            {/* Tabs */}
            <nav className="flex h-full">
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center gap-1.5 px-1 text-xs font-medium border-b-2 transition-colors h-full cursor-pointer ${
                  activeTab === 'reports'
                    ? 'border-[#111827] text-[#111827]'
                    : 'border-transparent text-[#9ca3af] hover:text-[#6b7280]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Reports
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-1.5 px-1 ml-5 text-xs font-medium border-b-2 transition-colors h-full cursor-pointer ${
                  activeTab === 'users'
                    ? 'border-[#111827] text-[#111827]'
                    : 'border-transparent text-[#9ca3af] hover:text-[#6b7280]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Team Members
              </button>
            </nav>
          </div>

          {/* Right: actions */}
          <div className="flex items-center w-full sm:w-auto justify-end gap-3 border-t sm:border-0 border-[#f3f4f6] pt-2 sm:pt-0">
            {activeTab === 'reports' && (
              <AddReportModal onCreated={triggerRefetch} />
            )}
            <a
              href="/"
              className="text-xs text-[#9ca3af] hover:text-[#374151] transition-colors"
            >
              ← Employee Form
            </a>
            <div className="w-px h-4 bg-[#e5e7eb]" />
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="Sign out"
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] border border-transparent hover:border-[#e5e7eb] transition-all cursor-pointer disabled:opacity-40"
            >
              <LogOut className="w-3.5 h-3.5" />
              {loggingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {activeTab === 'reports' ? (
          <>
            {/* Filters */}
            <div className="bg-white rounded-xl border border-[#e5e7eb] px-5 py-4">
              <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-3">
                Filter Reports
              </p>
              <FilterBar />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-[#e5e7eb] px-5 py-4">
              <ReportsTable />
            </div>
          </>
        ) : (
          <div className="max-w-xl">
            <UserManagement />
          </div>
        )}
      </div>

      {/* Edit modal */}
      <EditModal onSaved={triggerRefetch} />
    </main>
  );
}
