'use client';

import { useAdminStore, ReportData } from '@/store/adminStore';
import { Download } from 'lucide-react';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function escapeCsvCell(value: string | undefined | null): string {
  if (!value) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default function ReportsTable() {
  const { reports, loading, setEditingReport } = useAdminStore();

  const handleExportCSV = () => {
    if (!reports.length) return;

    const headers = [
      'Date',
      'Name',
      "Today's Work",
      'Meetings Attended',
      'Bottleneck',
      "Tomorrow's Plan",
      'Submitted At',
    ];

    const rows = reports.map((r) => [
      formatDate(r.date),
      escapeCsvCell(r.name),
      escapeCsvCell(r.todaysWork),
      escapeCsvCell(r.meetingAttended),
      escapeCsvCell(r.bottleneck),
      escapeCsvCell(r.tomorrowPlan),
      new Date(r.createdAt).toLocaleString('en-IN'),
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `reports-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-[#9ca3af]">
        <svg className="animate-spin w-5 h-5 mr-2 text-[#2563eb]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading reports...
      </div>
    );
  }

  return (
    <div>
      {/* Table header row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-[#6b7280]">
          {reports.length === 0
            ? 'No reports found.'
            : `${reports.length} report${reports.length !== 1 ? 's' : ''} found`}
        </p>
        <button
          onClick={handleExportCSV}
          id="export-csv-btn"
          disabled={!reports.length}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-[#111827] text-white hover:bg-[#1f2937] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#e5e7eb] rounded-xl text-[#9ca3af] text-sm">
          No reports match your filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#e5e7eb]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                {['Date', 'Name', "Today's Work", 'Meetings', 'Bottleneck', "Tomorrow's Plan", ''].map(
                  (h, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {reports.map((report: ReportData, idx) => (
                <tr
                  key={report._id}
                  className={`border-b border-[#f3f4f6] hover:bg-[#f9fafb] transition-colors ${
                    idx === reports.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-[#374151] font-medium">
                    {formatDate(report.date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-[#111827]">
                    {report.name}
                  </td>
                  <td className="px-4 py-3 text-[#6b7280] min-w-[200px]">
                    <p className="whitespace-pre-wrap text-xs leading-relaxed" title={report.todaysWork}>
                      {report.todaysWork}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-[#6b7280] min-w-[160px]">
                    <p className="whitespace-pre-wrap text-xs leading-relaxed" title={report.meetingAttended}>
                      {report.meetingAttended || <span className="text-[#d1d5db]">—</span>}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-[#6b7280] min-w-[160px]">
                    <p className="whitespace-pre-wrap text-xs leading-relaxed" title={report.bottleneck}>
                      {report.bottleneck || <span className="text-[#d1d5db]">—</span>}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-[#6b7280] min-w-[200px]">
                    <p className="whitespace-pre-wrap text-xs leading-relaxed" title={report.tomorrowPlan}>
                      {report.tomorrowPlan}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setEditingReport(report)}
                      className="text-[11px] font-medium text-[#2563eb] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
