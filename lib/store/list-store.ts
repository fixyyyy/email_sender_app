import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EmailList {
  id: string;
  name: string;
  emails: string[];
  created: string;
}

interface ListState {
  lists: EmailList[];
  addList: (name: string, emails: string[]) => void;
  updateList: (id: string, name: string, emails: string[]) => void;
  removeList: (id: string) => void;
  getList: (id: string) => EmailList | undefined;
}

export const useListStore = create<ListState>()(
  persist(
    (set, get) => ({
      lists: [],
      addList: (name, emails) => {
        const newList = {
          id: crypto.randomUUID(),
          name,
          emails,
          created: new Date().toLocaleDateString(),
        };
        set((state) => ({
          lists: [...state.lists, newList],
        }));
      },
      updateList: (id, name, emails) => {
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === id
              ? {
                  ...list,
                  name,
                  emails,
                }
              : list
          ),
        }));
      },
      removeList: (id) => {
        set((state) => ({
          lists: state.lists.filter((list) => list.id !== id),
        }));
      },
      getList: (id) => {
        return get().lists.find((list) => list.id === id);
      },
    }),
    {
      name: 'email-list-storage',
      skipHydration: true,
    }
  )
);