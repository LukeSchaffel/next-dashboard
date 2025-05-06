"use client";
import { useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import styles from "./CalendarView.module.css";
import type { EventWithDetails, GroupedEvents } from "../page";

interface CalendarViewProps {
  groupedEvents: GroupedEvents[];
}

export default function CalendarView({ groupedEvents }: CalendarViewProps) {
  const router = useRouter();
  const calendarRef = useRef<FullCalendar>(null);

  const calendarEvents = groupedEvents.map((group) => {
    const isSeries = group.events[0].EventSeries !== null;

    if (isSeries) {
      return {
        id: group.seriesId,
        title: group.seriesName,
        start: dayjs(group.events[0].EventSeries!.startDate).toDate(),
        end: dayjs(group.events[0].EventSeries!.endDate).add(1, "day").toDate(),
        backgroundColor: "#228be6",
        borderColor: "#228be6",
      };
    }
    // For standalone events, just use the first (and only) event
    const event = group.events[0];
    return {
      id: event.id,
      title: event.name,
      start: event.startsAt ? dayjs(event.startsAt).toDate() : undefined,
      end: event.endsAt ? dayjs(event.endsAt).toDate() : undefined,
      backgroundColor: "#40c057",
      borderColor: "#40c057",
    };
  });

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
        // eventClick={(info) => {
        //   router.push(`/dashboard/events/${info.event.id}`);
        // }}
      />
    </div>
  );
}
