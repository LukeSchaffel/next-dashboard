import { create } from "zustand";
import { EventWithLocation } from "@/lib/prisma";

interface EventsStore {
  events: EventWithLocation[];
  loading: boolean;
  error: string | null;
  hasFetched: boolean;
  setEvents: (events: EventWithLocation[]) => void;
  fetchEvents: () => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  createEvent: (values: any) => Promise<void>;
  updateEvent: (id: string, values: any) => Promise<EventWithLocation>;
}

export const useEventStore = create<EventsStore>((set, get) => ({
  events: [],
  loading: false,
  error: null,
  hasFetched: false,
  setEvents: (events) => set({ events }),
  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/events`);
      const eventsJSON = await res.json();
      set({ events: eventsJSON, hasFetched: true });
    } catch (err: any) {
      set({ error: err.message || "Failed to load events" });
    } finally {
      set({ loading: false });
    }
  },
  deleteEvent: async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete event");

      set({
        events: get().events.filter((e) => e.id !== eventId),
      });
    } catch (err) {
      console.error("Delete failed:", err);
    }
  },
  createEvent: async (values: any) => {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to create event");

      const newEvent: EventWithLocation = await res.json();

      set({
        events: [...get().events, newEvent],
      });
    } catch (err) {
      console.error("Create failed:", err);
    }
  },
  updateEvent: async (id: string, values: any) => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to update event");

      const updatedEvent: EventWithLocation = await res.json();

      set({
        events: get().events.map((e) => (e.id === id ? updatedEvent : e)),
      });

      return updatedEvent;
    } catch (err) {
      console.error("Update failed:", err);
      throw err;
    }
  },
}));
