import { create } from "zustand";

interface AppStateStore {
  siderCollapsed: boolean;
  toggleSiderCollapsed: () => void;
}

export const useAppStateStore = create<AppStateStore>((set, get) => ({
  siderCollapsed: true,
  toggleSiderCollapsed: () => {
    set({ siderCollapsed: !get().siderCollapsed });
  },
}));
