import { create } from "zustand";
import { Location } from "@prisma/client";

interface LocationsStore {
  locations: Location[];
  loading: boolean;
  error: string | null;
  hasFetched: boolean;
  setLocations: (locations: Location[]) => void;
  fetchLocations: () => Promise<void>;
  deleteLocation: (locationId: string) => Promise<void>;
  createLocation: (values: any) => Promise<void>;
  updateLocation: (id: string, values: any) => Promise<Location>;
}

export const useLocationStore = create<LocationsStore>((set, get) => ({
  locations: [],
  loading: false,
  error: null,
  hasFetched: false,
  setLocations: (locations) => set({ locations }),
  fetchLocations: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/locations`);
      const locationsJSON = await res.json();
      set({ locations: locationsJSON, hasFetched: true });
    } catch (err: any) {
      set({ error: err.message || "Failed to load locations" });
    } finally {
      set({ loading: false });
    }
  },
  deleteLocation: async (locationId: string) => {
    try {
      const res = await fetch(`/api/locations/${locationId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete location");

      set({
        locations: get().locations.filter((l) => l.id !== locationId),
      });
    } catch (err) {
      console.error("Delete failed:", err);
    }
  },
  createLocation: async (values: any) => {
    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to create location");

      const newLocation: Location = await res.json();

      set({
        locations: [...get().locations, newLocation],
      });
    } catch (err) {
      console.error("Create failed:", err);
    }
  },
  updateLocation: async (id: string, values: any) => {
    try {
      const res = await fetch(`/api/locations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to update location");

      const updatedLocation: Location = await res.json();

      set({
        locations: get().locations.map((l) => (l.id === id ? updatedLocation : l)),
      });

      return updatedLocation;
    } catch (err) {
      console.error("Update failed:", err);
      throw err;
    }
  },
})); 