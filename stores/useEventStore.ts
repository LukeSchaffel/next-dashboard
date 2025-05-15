import { create } from "zustand";
import {
  Event,
  TicketType,
  Ticket,
  Location,
  EventSeries,
  EventSeat,
  EventRow,
  EventLayout,
  EventSection,
} from "@prisma/client";

export interface EventWithDetails extends Event {
  eventLayout: {
    id: string;
  };
  Location?: {
    id: string;
    name: string;
    address: string | null;
  } | null;
  EventSeries?: {
    id: string;
    name: string;
  } | null;
  _count?: {
    Tickets: number;
  };
  tags: {
    Tag: {
      id: string;
      name: string;
    };
  }[];
}

export interface TicketTypeWithDetails extends TicketType {
  Tickets: TicketWithSeatingInformation[];
}

export interface TicketWithSeatingInformation extends Ticket {
  seat: EventSeat & { Row: EventRow };
}

export interface EventSeriesWithDetails extends EventSeries {
  events: EventWithDetails[];
}

export interface EventSeatWithRow extends EventSeat {
  Row: EventRow;
}

export interface EventRowWithSeats extends EventRow {
  seats: EventSeat[];
}

export interface EventSectionWithRows extends EventSection {
  rows: EventRowWithSeats[];
}

export interface EventLayoutWithDetails extends EventLayout {
  sections: EventSectionWithRows[];
}

interface EventsStore {
  events: EventWithDetails[];
  eventSeries: EventSeriesWithDetails[];
  currentEvent: EventWithDetails | null;
  currentSeries: EventSeriesWithDetails | null;
  loading: boolean;
  error: string | null;
  hasFetched: boolean;
  ticketTypes: TicketTypeWithDetails[];
  ticketTypesLoading: boolean;
  currentEventLayout: EventLayoutWithDetails | null;
  layoutLoading: boolean;
  layoutError: string | null;
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
    type: "single" | "series";
    name: string;
    description: string;
    locationId?: string | null;
    // Single event fields
    startsAt?: Date;
    endsAt?: Date;
    // Series fields
    startDate?: Date;
    endDate?: Date;
    events?: {
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
    ticketTypes?: {
      name: string;
      description: string;
      price: number;
      quantity: number;
    }[];
    tags?: string[] | { id: string; name: string }[];
  }) => Promise<EventWithDetails | EventWithDetails[]>;
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
  fetchEventLayout: (eventId: string, layoutId: string) => Promise<void>;
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
  currentEventLayout: null,
  layoutLoading: false,
  layoutError: null,
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
      // Convert string array tags to object array if needed
      const tags = values.tags?.map((tag) => {
        if (typeof tag === "string") {
          return { id: tag };
        }
        return { id: tag.id, name: tag.name };
      });

      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          tags: tags || [],
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to create event:", errorData);
        throw new Error(errorData.error || "Failed to create event");
      }

      const response = await res.json();

      if (values.type === "series") {
        const { events, series } = response;
        set((state) => {
          const newEvents = [...state.events, ...events];
          const newSeries = [...state.eventSeries, series];
          return {
            events: newEvents,
            eventSeries: newSeries,
          };
        });
        return events;
      } else {
        // For single events, the response is the event itself
        set((state) => {
          const newEvents = [...state.events, response];
          return {
            events: newEvents,
          };
        });
        return response;
      }
    } catch (err) {
      console.error("Create failed:", err);
      throw err;
    }
  },
  updateEvent: async (id: string, values: any) => {
    try {
      // Handle tags if they are included in the update
      const updateData = { ...values };
      if (values.tags) {
        updateData.tags = values.tags.map((tag: any) => ({
          id: typeof tag === "string" ? tag : tag.id,
          name: typeof tag === "string" ? tag : tag.name,
        }));
      }

      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
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
            ) as EventWithDetails["Tickets"],
          } as EventWithDetails,
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
  fetchEventLayout: async (eventId: string, layoutId: string) => {
    set({ layoutLoading: true, layoutError: null });
    try {
      const res = await fetch(
        `/api/events/${eventId}/seating-layout/${layoutId}`
      );
      if (!res.ok) throw new Error("Failed to fetch event layout");
      const layout = await res.json();
      set({ currentEventLayout: layout });
    } catch (err: any) {
      set({ layoutError: err.message || "Failed to load event layout" });
    } finally {
      set({ layoutLoading: false });
    }
  },
}));
