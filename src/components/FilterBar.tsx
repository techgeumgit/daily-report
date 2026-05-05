'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAdminStore, ReportData } from '@/store/adminStore';
import { ChevronDown, X } from 'lucide-react';

export default function FilterBar() {
  const { filters, setFilters, setReports, setLoading, users } = useAdminStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchReports = useCallback(
    async (currentFilters: typeof filters) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (currentFilters.startDate) params.set('startDate', currentFilters.startDate);
        if (currentFilters.endDate) params.set('endDate', currentFilters.endDate);
        if (currentFilters.name) params.set('name', currentFilters.name);

        const res = await fetch(`/api/reports?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setReports(
            data.data.map((r: ReportData & { _id: string }) => ({
              ...r,
              _id: r._id.toString(),
            }))
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setReports]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchReports(filters);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters, fetchReports]);

  const clearFilters = () => {
    setFilters({ startDate: '', endDate: '', name: '' });
  };

  const hasFilters = filters.startDate || filters.endDate || filters.name;

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Start Date */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wide">
          Start Date
        </label>
        <input
          type="date"
          id="filter-start-date"
          value={filters.startDate}
          onChange={(e) => setFilters({ startDate: e.target.value })}
          className="h-9 px-3 rounded-lg border border-[#e5e7eb] bg-white text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
        />
      </div>

      {/* End Date */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wide">
          End Date
        </label>
        <input
          type="date"
          id="filter-end-date"
          value={filters.endDate}
          onChange={(e) => setFilters({ endDate: e.target.value })}
          className="h-9 px-3 rounded-lg border border-[#e5e7eb] bg-white text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
        />
      </div>

      {/* Name — dropdown from Zustand users list */}
      <div className="flex flex-col gap-1 min-w-[180px]">
        <label className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wide">
          Team Member
        </label>
        <div className="relative">
          <select
            id="filter-name"
            value={filters.name}
            onChange={(e) => setFilters({ name: e.target.value })}
            className="w-full h-9 pl-3 pr-8 rounded-lg border border-[#e5e7eb] bg-white text-sm text-[#111827] appearance-none focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all cursor-pointer"
          >
            <option value="">All members</option>
            {users.map((u) => (
              <option key={u._id} value={u.name}>
                {u.name}
                {!u.isActive ? ' (inactive)' : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
        </div>
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          id="clear-filters-btn"
          className="h-9 flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium text-[#6b7280] hover:text-[#111827] border border-[#e5e7eb] hover:border-[#d1d5db] bg-white transition-all cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
