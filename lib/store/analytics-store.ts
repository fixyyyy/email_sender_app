import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';

export interface EmailStats {
  sent: number;
  delivered: number;
  failed: number;
  date: string;
}

interface AnalyticsState {
  data: EmailStats[];
  addStats: (stats: Omit<EmailStats, 'date'>) => void;
  getStats: () => {
    deliveryRate: number;
    failureRate: number;
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
  };
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      data: [],
      addStats: (stats) => {
        const newEntry = {
          ...stats,
          date: format(new Date(), 'EEE MMM dd'),
        };
        set((state) => ({
          data: [...state.data.slice(-6), newEntry],
        }));
      },
      getStats: () => {
        const state = get();
        const last7Days = state.data.slice(-7);
        const totalSent = last7Days.reduce((acc, curr) => acc + curr.sent, 0);
        const totalDelivered = last7Days.reduce((acc, curr) => acc + curr.delivered, 0);
        const totalFailed = last7Days.reduce((acc, curr) => acc + curr.failed, 0);

        return {
          deliveryRate: totalSent ? (totalDelivered / totalSent) * 100 : 0,
          failureRate: totalSent ? (totalFailed / totalSent) * 100 : 0,
          totalSent,
          totalDelivered,
          totalFailed,
        };
      },
    }),
    {
      name: 'analytics-storage',
      skipHydration: true,
    }
  )
);