"use client";
import { useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Event } from "@prisma/client";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import styles from "./CalendarView.module.css";

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
  Tickets: any[];
  TicketTypes: any[];
}

interface CalendarViewProps {
  events: EventWithDetails[];
}

export default function CalendarView({ events }: CalendarViewProps) {
  const router = useRouter();
  const calendarRef = useRef<FullCalendar>(null);

  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.name,
    start: event.startsAt ? dayjs(event.startsAt).toDate() : undefined,
    end: event.endsAt ? dayjs(event.endsAt).toDate() : undefined,
  }));

  return (
    <div className={styles.calendarContainer}>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridDay",
        }}
        events={calendarEvents}
        eventClick={(info) => {
          router.push(`/dashboard/events/${info.event.id}`);
        }}
      />
    </div>
  );
}
