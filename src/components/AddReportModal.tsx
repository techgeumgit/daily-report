'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'admin123';

const EMPTY = {
  date: new Date().toISOString().split('T')[0],
  name: '',
  todaysWork: '',
  meetingAttended: '',
  bottleneck: '',
  tomorrowPlan: '',
};

interface Props {
  onCreated: () => void;
}

export default function AddReportModal({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, adminSecret: ADMIN_SECRET }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to create report.');
      } else {
        toast.success('Report added.');
        setForm(EMPTY);
        setOpen(false);
        onCreated();
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        id="add-report-btn"
        className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Add Report
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] px-4">
          <div className="w-full max-w-lg bg-white rounded-xl border border-[#e5e7eb] shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f3f4f6]">
              <div>
                <h2 className="text-sm font-semibold text-[#111827]">Add Report</h2>
                <p className="text-xs text-[#9ca3af] mt-0.5">Admin — any date, no restriction</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f3f4f6] text-[#9ca3af] hover:text-[#374151] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wide">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    className="w-full h-9 px-3 rounded-lg border border-[#e5e7eb] text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wide">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Full name"
                    className="w-full h-9 px-3 rounded-lg border border-[#e5e7eb] text-sm text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wide">Today&apos;s Work</label>
                <textarea
                  name="todaysWork"
                  value={form.todaysWork}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wide">Meetings Attended</label>
                <input
                  type="text"
                  name="meetingAttended"
                  value={form.meetingAttended}
                  onChange={handleChange}
                  required
                  className="w-full h-9 px-3 rounded-lg border border-[#e5e7eb] text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wide">Bottleneck</label>
                <input
                  type="text"
                  name="bottleneck"
                  value={form.bottleneck}
                  onChange={handleChange}
                  required
                  className="w-full h-9 px-3 rounded-lg border border-[#e5e7eb] text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wide">Tomorrow&apos;s Plan</label>
                <textarea
                  name="tomorrowPlan"
                  value={form.tomorrowPlan}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="h-8 px-4 text-xs font-medium text-[#374151] hover:bg-[#f3f4f6] rounded-lg border border-[#e5e7eb] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-8 px-4 text-xs font-medium bg-[#2563eb] text-white hover:bg-[#1d4ed8] rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Adding...' : 'Add Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
