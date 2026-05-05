'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import {
  Send,
  ChevronDown,
  Calendar,
  ClipboardList,
  Users,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

function getLocalDateString(offset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

function isToday(dateStr: string): boolean {
  return dateStr === getLocalDateString(0);
}

interface FormState {
  date: string;
  name: string;
  todaysWork: string;
  meetingAttended: string;
  bottleneck: string;
  tomorrowPlan: string;
}

const INITIAL_STATE: FormState = {
  date: getLocalDateString(0),
  name: '',
  todaysWork: '',
  meetingAttended: '',
  bottleneck: '',
  tomorrowPlan: '',
};

interface ActiveUser {
  _id: string;
  name: string;
}

// Dynamic label config based on selected date
function getLabels(dateStr: string) {
  const forToday = isToday(dateStr);
  return {
    workLabel: forToday ? "Today's Work" : "Yesterday's Work",
    workPlaceholder: forToday
      ? 'Describe what you worked on today...'
      : 'Describe what you worked on yesterday...',
    meetingLabel: forToday ? 'Meetings Attended Today' : 'Meetings Attended Yesterday',
    meetingPlaceholder: forToday
      ? 'e.g. Sprint planning, client call...'
      : 'e.g. Weekly sync, design review...',
    bottleneckLabel: forToday ? 'Bottleneck / Blocker' : 'Bottleneck / Blocker (Yesterday)',
    planLabel: forToday ? "Tomorrow's Plan" : "Plan for Today",
    planPlaceholder: forToday
      ? "What's planned for tomorrow?"
      : "What's your plan for today?",
  };
}

export default function SubmitPage() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<ActiveUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [today] = useState(getLocalDateString(0));
  const [yesterday] = useState(getLocalDateString(-1));
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch('/api/users?active=true')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUsers(d.data);
      })
      .catch(console.error)
      .finally(() => setUsersLoading(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Submission failed. Please try again.');
      } else {
        setSubmitted(true);
        toast.success('Report submitted!');
        setTimeout(() => {
          setSubmitted(false);
          setForm({ ...INITIAL_STATE, date: getLocalDateString(0) });
        }, 2000);
      }
    } catch {
      toast.error('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const labels = getLabels(form.date);

  return (
    <main className="min-h-screen bg-[#fafafa] flex items-start justify-center py-16 px-4">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="mb-10 flex flex-col items-start">
          <Image
            src="/logotechgeum.webp"
            alt="Tech Geum Logo"
            width={120}
            height={40}
            className="mb-4 object-contain"
          />
          <h1 className="text-2xl font-semibold text-[#111827] tracking-tight">
            Daily Report
          </h1>
          <p className="text-sm text-[#6b7280] mt-1">
            Submit your end-of-day work summary.
          </p>
        </div>

        {/* Success state */}
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <CheckCircle2 className="w-10 h-10 text-[#10b981]" />
            <p className="text-sm font-medium text-[#111827]">Report submitted!</p>
            <p className="text-xs text-[#9ca3af]">Resetting form…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Row: Date + Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-[#374151] uppercase tracking-wide">
                  <Calendar className="w-3.5 h-3.5" />
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={form.date}
                  min={yesterday}
                  max={today}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-[#e5e7eb] bg-white text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                />
                <p className="text-[11px] text-[#9ca3af]">
                  {isToday(form.date) ? 'Reporting for today' : 'Reporting for yesterday'}
                </p>
              </div>

              {/* Name dropdown */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-[#374151] uppercase tracking-wide">
                  <Users className="w-3.5 h-3.5" />
                  Your Name
                </label>
                <div className="relative">
                  <select
                    name="name"
                    id="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    disabled={usersLoading}
                    className="w-full h-10 pl-3 pr-8 rounded-lg border border-[#e5e7eb] bg-white text-sm text-[#111827] appearance-none focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all disabled:opacity-50 disabled:cursor-wait cursor-pointer"
                  >
                    <option value="">
                      {usersLoading ? 'Loading…' : 'Select name'}
                    </option>
                    {users.map((u) => (
                      <option key={u._id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
                </div>
                {!usersLoading && users.length === 0 && (
                  <p className="text-[11px] text-[#ef4444]">No active users — contact admin.</p>
                )}
              </div>
            </div>

            {/* Today's / Yesterday's Work */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#374151] uppercase tracking-wide">
                <ClipboardList className="w-3.5 h-3.5" />
                {labels.workLabel}
                <span className="ml-auto text-[#2563eb] font-normal normal-case tracking-normal">Required</span>
              </label>
              <textarea
                name="todaysWork"
                id="todaysWork"
                value={form.todaysWork}
                onChange={handleChange}
                placeholder={labels.workPlaceholder}
                required
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-[#111827] text-sm placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] resize-none transition-all"
              />
            </div>

            {/* Meetings */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#374151] uppercase tracking-wide">
                <Users className="w-3.5 h-3.5" />
                {labels.meetingLabel}
                <span className="ml-auto text-[#9ca3af] font-normal normal-case tracking-normal">Optional</span>
              </label>
              <input
                type="text"
                name="meetingAttended"
                id="meetingAttended"
                value={form.meetingAttended}
                onChange={handleChange}
                placeholder={labels.meetingPlaceholder}
                className="w-full h-10 px-3 rounded-lg border border-[#e5e7eb] bg-white text-[#111827] text-sm placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
              />
            </div>

            {/* Bottleneck */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#374151] uppercase tracking-wide">
                <AlertCircle className="w-3.5 h-3.5" />
                {labels.bottleneckLabel}
                <span className="ml-auto text-[#9ca3af] font-normal normal-case tracking-normal">Optional</span>
              </label>
              <input
                type="text"
                name="bottleneck"
                id="bottleneck"
                value={form.bottleneck}
                onChange={handleChange}
                placeholder="Any blockers or challenges?"
                className="w-full h-10 px-3 rounded-lg border border-[#e5e7eb] bg-white text-[#111827] text-sm placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
              />
            </div>

            {/* Tomorrow's Plan / Plan for Today */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#374151] uppercase tracking-wide">
                <ArrowRight className="w-3.5 h-3.5" />
                {labels.planLabel}
                <span className="ml-auto text-[#2563eb] font-normal normal-case tracking-normal">Required</span>
              </label>
              <textarea
                name="tomorrowPlan"
                id="tomorrowPlan"
                value={form.tomorrowPlan}
                onChange={handleChange}
                placeholder={labels.planPlaceholder}
                required
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-[#111827] text-sm placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] resize-none transition-all"
              />
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                id="submit-btn"
                disabled={loading || usersLoading || users.length === 0}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-[#111827] hover:bg-[#1f2937] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-[#f3f4f6] flex justify-end">
          <a href="/admin" className="text-xs text-[#9ca3af] hover:text-[#6b7280] transition-colors">
            Admin Dashboard →
          </a>
        </div>
      </div>
    </main>
  );
}
