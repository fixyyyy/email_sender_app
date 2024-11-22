import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ServerType = 'smtp' | 'sendgrid';

export interface SmtpServer {
  id: string;
  type: ServerType;
  host?: string;
  port?: string;
  username?: string;
  password?: string;
  isRootServer?: boolean;
  apiKey?: string;
  status: 'Active' | 'Failed' | 'Disabled';
}

interface SmtpState {
  servers: SmtpServer[];
  addSmtpServer: (server: Omit<SmtpServer, 'id' | 'status' | 'type'>) => void;
  addSendGridServer: (apiKey: string) => void;
  removeServer: (id: string) => void;
  updateServerStatus: (id: string, status: SmtpServer['status']) => void;
  getActiveServer: () => SmtpServer | undefined;
}

export const useSmtpStore = create<SmtpState>()(
  persist(
    (set, get) => ({
      servers: [],
      addSmtpServer: (server) => {
        const newServer = {
          ...server,
          id: crypto.randomUUID(),
          type: 'smtp' as const,
          status: 'Active' as const,
        };
        set((state) => ({
          servers: [...state.servers, newServer],
        }));
      },
      addSendGridServer: (apiKey) => {
        const newServer = {
          id: crypto.randomUUID(),
          type: 'sendgrid' as const,
          apiKey,
          status: 'Active' as const,
        };
        set((state) => ({
          servers: [...state.servers, newServer],
        }));
      },
      removeServer: (id) => {
        set((state) => ({
          servers: state.servers.filter((server) => server.id !== id),
        }));
      },
      updateServerStatus: (id, status) => {
        set((state) => ({
          servers: state.servers.map((server) =>
            server.id === id ? { ...server, status } : server
          ),
        }));
      },
      getActiveServer: () => {
        const state = get();
        return state.servers.find((server) => server.status === 'Active');
      },
    }),
    {
      name: 'smtp-server-storage',
      skipHydration: true,
    }
  )
);