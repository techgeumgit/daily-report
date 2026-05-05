import { create } from 'zustand';

export interface ReportData {
  _id: string;
  date: string;
  name: string;
  todaysWork: string;
  meetingAttended?: string;
  bottleneck?: string;
  tomorrowPlan: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserData {
  _id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

interface AdminFilters {
  startDate: string;
  endDate: string;
  name: string;
}

interface AdminStore {
  // Reports
  reports: ReportData[];
  filters: AdminFilters;
  loading: boolean;
  editingReport: ReportData | null;
  setReports: (reports: ReportData[]) => void;
  setFilters: (filters: Partial<AdminFilters>) => void;
  setLoading: (loading: boolean) => void;
  setEditingReport: (report: ReportData | null) => void;

  // Users
  users: UserData[];
  usersLoading: boolean;
  setUsers: (users: UserData[]) => void;
  setUsersLoading: (loading: boolean) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  // Reports
  reports: [],
  filters: { startDate: '', endDate: '', name: '' },
  loading: false,
  editingReport: null,
  setReports: (reports) => set({ reports }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  setLoading: (loading) => set({ loading }),
  setEditingReport: (report) => set({ editingReport: report }),

  // Users
  users: [],
  usersLoading: false,
  setUsers: (users) => set({ users }),
  setUsersLoading: (loading) => set({ usersLoading: loading }),
}));
