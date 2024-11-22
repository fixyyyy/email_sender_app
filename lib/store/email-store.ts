import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EmailState {
  senderNames: string;
  fromEmail: string;
  subject: string;
  content: string;
  selectedList: string;
  setSenderNames: (names: string) => void;
  setFromEmail: (email: string) => void;
  setSubject: (subject: string) => void;
  setContent: (content: string) => void;
  setSelectedList: (list: string) => void;
  reset: () => void;
}

export const useEmailStore = create<EmailState>()(
  persist(
    (set) => ({
      senderNames: '',
      fromEmail: '',
      subject: '',
      content: '',
      selectedList: '',
      setSenderNames: (names) => set({ senderNames: names }),
      setFromEmail: (email) => set({ fromEmail: email }),
      setSubject: (subject) => set({ subject: subject }),
      setContent: (content) => set({ content: content }),
      setSelectedList: (list) => set({ selectedList: list }),
      reset: () => set({
        senderNames: '',
        fromEmail: '',
        subject: '',
        content: '',
        selectedList: '',
      }),
    }),
    {
      name: 'email-storage',
    }
  )
);