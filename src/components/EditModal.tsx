'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAdminStore } from '@/store/adminStore';
import { X } from 'lucide-react';

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'admin123';

interface Props {
  onSaved: () => void;
}

export default function EditModal({ onSaved }: Props) {
  const { editingReport, setEditingReport } = useAdminStore();
  const [form, setForm] = useState({
    date: '',
    name: '',
    todaysWork: '',
    meetingAttended: '',
    bottleneck: '',
    tomorrowPlan: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingReport) {
      setForm({
        date: editingReport.date.split('T')[0],
        name: editingReport.name,
        todaysWork: editingReport.todaysWork,
        meetingAttended: editingReport.meetingAttended || '',
        bottleneck: editingReport.bottleneck || '',
        tomorrowPlan: editingReport.tomorrowPlan,
      });
    }
  }, [editingReport]);

  if (!editingReport) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/reports/${editingReport._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, adminSecret: ADMIN_SECRET }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Update failed.');
      } else {
        toast.success('Report updated.');
        setEditingReport(null);
        onSaved();
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this report? This cannot be undone.')) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/reports/${editingReport._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminSecret: ADMIN_SECRET }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Delete failed.');
      } else {
        toast.success('Report deleted.');
        setEditingReport(null);
        onSaved();
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] px-4">
      <div className="w-full max-w-lg bg-white rounded-xl border border-[#e5e7eb] shadow-xl">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f3f4f6]">
          <div>
            <h2 className="text-sm font-semibold text-[#111827]">Edit Report</h2>
            <p className="text-xs text-[#9ca3af] mt-0.5">Admin override — any date allowed</p>
          </div>
          <button
            onClick={() => setEditingReport(null)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f3f4f6] text-[#9ca3af] hover:text-[#374151] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
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
                className="w-full h-9 px-3 rounded-lg border border-[#e5e7eb] text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
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

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="h-8 px-3 text-xs font-medium text-[#ef4444] hover:bg-[#fef2f2] rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
            >
              Delete
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingReport(null)}
                disabled={loading}
                className="h-8 px-4 text-xs font-medium text-[#374151] hover:bg-[#f3f4f6] rounded-lg border border-[#e5e7eb] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-8 px-4 text-xs font-medium bg-[#111827] text-white hover:bg-[#1f2937] rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
