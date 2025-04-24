import { create } from "zustand";
import { Event, TicketType, Ticket, Location } from "@prisma/client";

interface EventWithDetails extends Event {
  Location: {
    id: string;
    name: string;
    address: string | null;
  };
  TicketTypes: TicketType[];
  Tickets: Ticket[];
  eventLayout?: {
    id: string;
    name: string;
    description: string;
    sections: {
      id: string;
      name: string;
      description: string;
      priceMultiplier: number;
      rows: {
        id: string;
        name: string;
        seats: {
          id: string;
          number: string;
          status: "AVAILABLE" | "RESERVED" | "OCCUPIED" | "DISABLED";
        }[];
      }[];
    }[];
  };
}

interface EventsStore {
  events: EventWithDetails[];
  currentEvent: EventWithDetails | null;
  loading: boolean;
  error: string | null;
  hasFetched: boolean;
  ticketTypes: TicketType[];
  ticketTypesLoading: boolean;
  setEvents: (events: EventWithDetails[]) => void;
  fetchEvents: () => Promise<void>;
  fetchEvent: (slug: string) => Promise<void>;
  fetchTicketTypes: (eventId: string) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  createEvent: (values: {
    name: string;
    description: string;
    locationId?: string | null;
    startsAt: Date;
    endsAt: Date;
    ticketTypes?: {
      name: string;
      description: string;
      price: number;
      quantity: number;
    }[];
  }) => Promise<EventWithDetails>;
  updateEvent: (id: string, values: any) => Promise<EventWithDetails>;
  addTicketType: (eventId: string, values: any) => Promise<void>;
  addTicket: (eventId: string, values: any) => Promise<void>;
  updateTicket: (
    eventId: string,
    ticketId: string,
    values: any
  ) => Promise<void>;
  updateTicketType: (
    eventId: string,
    ticketTypeId: string,
    values: any
  ) => Promise<void>;
  deleteTicketType: (eventId: string, ticketTypeId: string) => Promise<void>;
}

export const useEventStore = create<EventsStore>((set, get) => ({
  events: [],
  currentEvent: null,
  loading: false,
  error: null,
  hasFetched: false,
  ticketTypes: [],
  ticketTypesLoading: false,
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
  fetchEvent: async (slug: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/events/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch event");
      const event = await res.json();
      set({ currentEvent: event });
    } catch (err: any) {
      set({ error: err.message || "Failed to load event" });
    } finally {
      set({ loading: false });
    }
  },
  fetchTicketTypes: async (eventId: string) => {
    set({ ticketTypesLoading: true });
    try {
      const res = await fetch(`/api/events/${eventId}/ticket-types`);
      if (!res.ok) throw new Error("Failed to fetch ticket types");
      const ticketTypes = await res.json();
      set({ ticketTypes });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ ticketTypesLoading: false });
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
  createEvent: async (values) => {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to create event");

      const newEvent: EventWithDetails = await res.json();

      set({
        events: [...get().events, newEvent],
      });

      return newEvent;
    } catch (err) {
      console.error("Create failed:", err);
      throw err;
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

      const updatedEvent: EventWithDetails = await res.json();

      set({
        events: get().events.map((e) => (e.id === id ? updatedEvent : e)),
        currentEvent:
          get().currentEvent?.id === id ? updatedEvent : get().currentEvent,
      });

      return updatedEvent;
    } catch (err) {
      console.error("Update failed:", err);
      throw err;
    }
  },
  addTicketType: async (eventId: string, values: any) => {
    try {
      const res = await fetch(`/api/events/${eventId}/ticket-types`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to add ticket type");

      const newTicketType = await res.json();
      set({
        ticketTypes: [...get().ticketTypes, newTicketType],
      });
    } catch (err) {
      console.error("Add ticket type failed:", err);
      throw err;
    }
  },
  addTicket: async (eventId: string, values: any) => {
    try {
      const res = await fetch(`/api/events/${eventId}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to add ticket");

      const newTicket = await res.json();
      if (get().currentEvent) {
        set({
          currentEvent: {
            ...get().currentEvent,
            Tickets: [...get().currentEvent.Tickets, newTicket],
          },
        });
      }
    } catch (err) {
      console.error("Add ticket failed:", err);
      throw err;
    }
  },
  updateTicket: async (eventId: string, ticketId: string, values: any) => {
    try {
      const res = await fetch(`/api/events/${eventId}/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to update ticket");

      const updatedTicket = await res.json();
      if (get().currentEvent) {
        set({
          currentEvent: {
            ...get().currentEvent,
            Tickets: get().currentEvent.Tickets.map((t) =>
              t.id === ticketId ? updatedTicket : t
            ),
          },
        });
      }
    } catch (err) {
      console.error("Update ticket failed:", err);
      throw err;
    }
  },
  updateTicketType: async (
    eventId: string,
    ticketTypeId: string,
    values: any
  ) => {
    try {
      const res = await fetch(
        `/api/events/${eventId}/ticketTypes/${ticketTypeId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!res.ok) throw new Error("Failed to update ticket type");

      const updatedTicketType = await res.json();
      set({
        ticketTypes: get().ticketTypes.map((t) =>
          t.id === ticketTypeId ? updatedTicketType : t
        ),
      });
    } catch (err) {
      console.error("Update ticket type failed:", err);
      throw err;
    }
  },
  deleteTicketType: async (eventId: string, ticketTypeId: string) => {
    try {
      const res = await fetch(
        `/api/events/${eventId}/ticketTypes/${ticketTypeId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Failed to delete ticket type");

      set({
        ticketTypes: get().ticketTypes.filter((t) => t.id !== ticketTypeId),
      });
    } catch (err) {
      console.error("Delete ticket type failed:", err);
      throw err;
    }
  },
}));
