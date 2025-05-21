import { create } from "zustand";
import { Location } from "@prisma/client";
import { notifications } from "@mantine/notifications";

interface LocationWithTemplate extends Location {
  templateLayout?: {
    id: string;
    name: string;
    description?: string;
  };
}

interface LocationsStore {
  locations: LocationWithTemplate[];
  loading: boolean;
  error: string | null;
  hasFetched: boolean;
  setLocations: (locations: LocationWithTemplate[]) => void;
  fetchLocations: () => Promise<void>;
  deleteLocation: (locationId: string) => Promise<void>;
  createLocation: (values: any) => Promise<LocationWithTemplate>;
  updateLocation: (id: string, values: any) => Promise<LocationWithTemplate>;
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
      const res = await fetch(`/api/locations/${locationId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const resJson = await res.json();
        throw new Error(resJson.error || "Failed to delete location");
      }

      set({
        locations: get().locations.filter((l) => l.id !== locationId),
      });
    } catch (err: any) {
      notifications.show({
        title: "Could not delete locations",
        message: err.message,
        color: "red",
      });
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

      const newLocation: LocationWithTemplate = await res.json();

      set({
        locations: [...get().locations, newLocation],
      });
      return newLocation;
    } catch (err) {
      console.error("Create failed:", err);
      throw err;
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

      const updatedLocation: LocationWithTemplate = await res.json();

      set({
        locations: get().locations.map((l) =>
          l.id === id ? updatedLocation : l
        ),
      });

      return updatedLocation;
    } catch (err) {
      console.error("Update failed:", err);
      throw err;
    }
  },
}));
