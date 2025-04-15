import { create } from "zustand";
import { EventWithLocation } from "@/lib/prisma";
import { Event, Ticket, TicketStatus, TicketType } from "@prisma/client";

type TicketTypeWithTickets = TicketType & {
  Tickets: Ticket[];
};

interface EventsStore {
  // Events state
  events: EventWithLocation[];
  currentEvent: EventWithLocation | null;
  loading: boolean;
  error: string | null;
  hasFetched: boolean;

  // Ticket Types state
  ticketTypes: TicketTypeWithTickets[];
  ticketTypesLoading: boolean;
  ticketTypesError: string | null;

  // Events actions
  setEvents: (events: EventWithLocation[]) => void;
  setCurrentEvent: (event: EventWithLocation | null) => void;
  fetchEvents: () => Promise<void>;
  fetchEvent: (id: string) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  createEvent: (values: any) => Promise<void>;
  updateEvent: (id: string, values: any) => Promise<EventWithLocation>;

  // Ticket Types actions
  fetchTicketTypes: (eventId: string) => Promise<void>;
  addTicketType: (
    eventId: string,
    ticketType: Omit<TicketType, "id" | "eventId" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateTicketType: (
    eventId: string,
    ticketTypeId: string,
    data: Partial<TicketType>
  ) => Promise<void>;
  deleteTicketType: (eventId: string, ticketTypeId: string) => Promise<void>;

  // Tickets actions
  addTicket: (
    eventId: string,
    ticket: Omit<Ticket, "id" | "eventId" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateTicket: (
    eventId: string,
    ticketId: string,
    data: Partial<Ticket>
  ) => Promise<void>;
  deleteTicket: (eventId: string, ticketId: string) => Promise<void>;
}

export const useEventStore = create<EventsStore>((set, get) => ({
  // Events state
  events: [],
  currentEvent: null,
  loading: false,
  error: null,
  hasFetched: false,

  // Ticket Types state
  ticketTypes: [],
  ticketTypesLoading: false,
  ticketTypesError: null,

  // Events actions
  setEvents: (events) => set({ events }),
  setCurrentEvent: (event) => set({ currentEvent: event }),
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
  fetchEvent: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Event not found");
        }
        throw new Error("Failed to fetch event");
      }
      const event = await res.json();
      set({ currentEvent: event });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
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

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update event");
      }

      const updatedEvent: EventWithLocation = await res.json();
      set({
        events: get().events.map((e) => (e.id === id ? updatedEvent : e)),
        currentEvent: updatedEvent,
      });

      return updatedEvent;
    } catch (err) {
      console.error("Update failed:", err);
      throw err;
    }
  },

  // Ticket Types actions
  fetchTicketTypes: async (eventId: string) => {
    set({ ticketTypesLoading: true, ticketTypesError: null });
    try {
      const res = await fetch(`/api/events/${eventId}/ticket-types`);
      if (!res.ok) throw new Error("Failed to fetch ticket types");
      const ticketTypes = await res.json();
      set({ ticketTypes });
    } catch (err: any) {
      set({ ticketTypesError: err.message });
      throw err;
    } finally {
      set({ ticketTypesLoading: false });
    }
  },
  addTicketType: async (
    eventId: string,
    ticketType: Omit<TicketType, "id" | "eventId" | "createdAt" | "updatedAt">
  ) => {
    set({ ticketTypesLoading: true, ticketTypesError: null });
    try {
      const res = await fetch(`/api/events/${eventId}/ticket-types`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketType),
      });

      if (!res.ok) throw new Error("Failed to add ticket type");

      const newTicketType = await res.json();
      set((state) => ({
        ticketTypes: [...state.ticketTypes, newTicketType],
        currentEvent: state.currentEvent
          ? {
              ...state.currentEvent,
              TicketTypes: [...state.currentEvent.TicketTypes, newTicketType],
            }
          : null,
      }));
    } catch (err: any) {
      set({ ticketTypesError: err.message });
      throw err;
    } finally {
      set({ ticketTypesLoading: false });
    }
  },
  updateTicketType: async (
    eventId: string,
    ticketTypeId: string,
    data: Partial<TicketType>
  ) => {
    set({ ticketTypesLoading: true, ticketTypesError: null });
    try {
      const res = await fetch(
        `/api/events/${eventId}/ticket-types/${ticketTypeId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!res.ok) throw new Error("Failed to update ticket type");

      const updatedTicketType = await res.json();
      set((state) => ({
        ticketTypes: state.ticketTypes.map((tt) =>
          tt.id === ticketTypeId ? updatedTicketType : tt
        ),
        currentEvent: state.currentEvent
          ? {
              ...state.currentEvent,
              TicketTypes: state.currentEvent.TicketTypes.map((tt) =>
                tt.id === ticketTypeId ? updatedTicketType : tt
              ),
            }
          : null,
      }));
    } catch (err: any) {
      set({ ticketTypesError: err.message });
      throw err;
    } finally {
      set({ ticketTypesLoading: false });
    }
  },
  deleteTicketType: async (eventId: string, ticketTypeId: string) => {
    set({ ticketTypesLoading: true, ticketTypesError: null });
    try {
      const res = await fetch(
        `/api/events/${eventId}/ticket-types/${ticketTypeId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Failed to delete ticket type");

      set((state) => ({
        ticketTypes: state.ticketTypes.filter((tt) => tt.id !== ticketTypeId),
        currentEvent: state.currentEvent
          ? {
              ...state.currentEvent,
              TicketTypes: state.currentEvent.TicketTypes.filter(
                (tt) => tt.id !== ticketTypeId
              ),
            }
          : null,
      }));
    } catch (err: any) {
      set({ ticketTypesError: err.message });
      throw err;
    } finally {
      set({ ticketTypesLoading: false });
    }
  },

  // Tickets actions
  addTicket: async (
    eventId: string,
    ticket: Omit<Ticket, "id" | "eventId" | "createdAt" | "updatedAt">
  ) => {
    try {
      const res = await fetch(`/api/events/${eventId}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticket),
      });

      if (!res.ok) throw new Error("Failed to add ticket");

      const newTicket = await res.json();
      set((state) => {
        const updatedTicketTypes = state.ticketTypes.map((tt) => {
          if (tt.id === ticket.ticketTypeId) {
            return {
              ...tt,
              Tickets: [...tt.Tickets, newTicket],
            };
          }
          return tt;
        });

        return {
          ticketTypes: updatedTicketTypes,
          currentEvent: state.currentEvent
            ? {
                ...state.currentEvent,
                Tickets: [...state.currentEvent.Tickets, newTicket],
                TicketTypes: state.currentEvent.TicketTypes.map((tt) => {
                  if (tt.id === ticket.ticketTypeId) {
                    return {
                      ...tt,
                      Tickets: [...tt.Tickets, newTicket],
                    };
                  }
                  return tt;
                }),
              }
            : null,
        };
      });
    } catch (err: any) {
      console.error("Failed to add ticket:", err);
      throw err;
    }
  },
  updateTicket: async (
    eventId: string,
    ticketId: string,
    data: Partial<Ticket>
  ) => {
    try {
      const res = await fetch(`/api/events/${eventId}/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update ticket");

      const updatedTicket = await res.json();
      set((state) => ({
        currentEvent: state.currentEvent
          ? {
              ...state.currentEvent,
              Tickets: state.currentEvent.Tickets.map((t) =>
                t.id === ticketId ? updatedTicket : t
              ),
            }
          : null,
      }));
    } catch (err: any) {
      console.error("Failed to update ticket:", err);
      throw err;
    }
  },
  deleteTicket: async (eventId: string, ticketId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/tickets/${ticketId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete ticket");

      set((state) => ({
        currentEvent: state.currentEvent
          ? {
              ...state.currentEvent,
              Tickets: state.currentEvent.Tickets.filter(
                (t) => t.id !== ticketId
              ),
            }
          : null,
      }));
    } catch (err: any) {
      console.error("Failed to delete ticket:", err);
      throw err;
    }
  },
}));
