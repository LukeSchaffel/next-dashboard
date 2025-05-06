import { create } from "zustand";
import {
  Event,
  TicketType,
  Ticket,
  Location,
  EventSeries,
} from "@prisma/client";

interface EventWithDetails extends Event {
  Location?: {
    id: string;
    name: string;
    address: string | null;
  } | null;
  EventSeries?: {
    id: string;
    name: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
  } | null;
  TicketTypes: TicketType[];
  Tickets: (Ticket & {
    seat?: {
      id: string;
      number: string;
      status: "AVAILABLE" | "RESERVED" | "OCCUPIED" | "DISABLED";
    } | null;
  })[];
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
  } | null;
}

interface EventSeriesWithDetails extends EventSeries {
  events: EventWithDetails[];
}

interface EventsStore {
  events: EventWithDetails[];
  eventSeries: EventSeriesWithDetails[];
  currentEvent: EventWithDetails | null;
  currentSeries: EventSeriesWithDetails | null;
  loading: boolean;
  error: string | null;
  hasFetched: boolean;
  ticketTypes: TicketType[];
  ticketTypesLoading: boolean;
  setEvents: (events: EventWithDetails[]) => void;
  setEventSeries: (series: EventSeriesWithDetails[]) => void;
  fetchEvents: () => Promise<void>;
  fetchEventSeries: () => Promise<void>;
  fetchEvent: (slug: string) => Promise<void>;
  fetchEventSeriesById: (id: string) => Promise<void>;
  fetchTicketTypes: (eventId: string) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  deleteEventSeries: (seriesId: string) => Promise<void>;
  createEvent: (values: {
    name: string;
    description: string;
    locationId?: string | null;
    startsAt: Date;
    endsAt: Date;
    eventSeriesId?: string | null;
    ticketTypes?: {
      name: string;
      description: string;
      price: number;
      quantity: number;
    }[];
  }) => Promise<EventWithDetails>;
  createEventSeries: (values: {
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    events: {
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
    }[];
  }) => Promise<EventSeriesWithDetails>;
  updateEvent: (id: string, values: any) => Promise<EventWithDetails>;
  updateEventSeries: (
    id: string,
    values: any
  ) => Promise<EventSeriesWithDetails>;
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
  eventSeries: [],
  currentEvent: null,
  currentSeries: null,
  loading: false,
  error: null,
  hasFetched: false,
  ticketTypes: [],
  ticketTypesLoading: false,
  setEvents: (events) => set({ events }),
  setEventSeries: (series) => set({ eventSeries: series }),
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
  fetchEventSeries: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/event-series`);
      const seriesJSON = await res.json();
      set({ eventSeries: seriesJSON });
    } catch (err: any) {
      set({ error: err.message || "Failed to load event series" });
    } finally {
      set({ loading: false });
    }
  },
  fetchEventSeriesById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/event-series/${id}`);
      if (!res.ok) throw new Error("Failed to fetch event series");
      const series = await res.json();
      set({ currentSeries: series });
    } catch (err: any) {
      set({ error: err.message || "Failed to load event series" });
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
  deleteEventSeries: async (seriesId: string) => {
    try {
      const res = await fetch(`/api/event-series/${seriesId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete event series");

      set({
        eventSeries: get().eventSeries.filter((s) => s.id !== seriesId),
      });
    } catch (err) {
      console.error("Delete series failed:", err);
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
      const currentEvent = get().currentEvent;
      if (currentEvent) {
        set({
          currentEvent: {
            ...currentEvent,
            Tickets: [...currentEvent.Tickets, newTicket],
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
      const currentEvent = get().currentEvent;
      if (currentEvent) {
        set({
          currentEvent: {
            ...currentEvent,
            Tickets: currentEvent.Tickets.map((t) =>
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
  createEventSeries: async (values) => {
    try {
      const res = await fetch("/api/event-series", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to create event series");

      const newSeries: EventSeriesWithDetails = await res.json();

      set({
        eventSeries: [...get().eventSeries, newSeries],
      });

      return newSeries;
    } catch (err) {
      console.error("Create series failed:", err);
      throw err;
    }
  },
  updateEventSeries: async (id: string, values: any) => {
    try {
      const res = await fetch(`/api/event-series/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to update event series");

      const updatedSeries: EventSeriesWithDetails = await res.json();

      set({
        eventSeries: get().eventSeries.map((s) =>
          s.id === id ? updatedSeries : s
        ),
        currentSeries:
          get().currentSeries?.id === id ? updatedSeries : get().currentSeries,
      });

      return updatedSeries;
    } catch (err) {
      console.error("Update series failed:", err);
      throw err;
    }
  },
}));
