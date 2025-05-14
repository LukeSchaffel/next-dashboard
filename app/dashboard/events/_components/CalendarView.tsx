"use client";
import { useEffect, useMemo, useState } from "react";
import { Box, Card, Group, Paper, Text, Badge, Title } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import dayjs from "dayjs";
import { GroupedEvents } from "../page";
import { EventForList } from "@/stores/useEventStore";
import Link from "next/link";

interface CalendarViewProps {
  groupedEvents: GroupedEvents[];
}

export default function CalendarView({ groupedEvents }: CalendarViewProps) {
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Flatten all events from the grouped structure
  const allEvents = useMemo(
    () => groupedEvents.flatMap((group) => group.events),
    [groupedEvents]
  );

  // Get events for currently selected date
  const eventsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = dayjs(selectedDate).format("YYYY-MM-DD");
    return allEvents.filter((event) => {
      const eventStartDate = event.startsAt
        ? dayjs(event.startsAt).format("YYYY-MM-DD")
        : null;
      return eventStartDate === dateStr;
    });
  }, [selectedDate, allEvents]);

  // Get all dates that have events
  const eventDates = useMemo(() => {
    const dates = new Set<string>();
    allEvents.forEach((event) => {
      if (event.startsAt) {
        dates.add(dayjs(event.startsAt).format("YYYY-MM-DD"));
      }
    });
    return dates;
  }, [allEvents]);

  return (
    <Group align="flex-start" grow>
      <Box>
        <Calendar
          value={date}
          onChange={(newDate) => {
            setDate(newDate || new Date());
            setSelectedDate(newDate);
          }}
          renderDay={(date) => {
            const day = date.getDate();
            const dateStr = dayjs(date).format("YYYY-MM-DD");
            const hasEvents = eventDates.has(dateStr);

            return (
              <div
                style={{
                  position: "relative",
                  height: "100%",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {day}
                {hasEvents && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 2,
                      width: "60%",
                      height: 3,
                      backgroundColor: "var(--mantine-color-blue-filled)",
                      borderRadius: 3,
                    }}
                  />
                )}
              </div>
            );
          }}
          size="lg"
        />
      </Box>

      <Box>
        {selectedDate ? (
          <>
            <Title order={5} mb="md">
              Events on {dayjs(selectedDate).format("MMMM D, YYYY")}
            </Title>
            {eventsForSelectedDate.length === 0 ? (
              <Text>No events on this date</Text>
            ) : (
              eventsForSelectedDate.map((event) => (
                <Link
                  key={event.id}
                  href={`/dashboard/events/${event.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <Paper
                    shadow="xs"
                    p="md"
                    withBorder
                    mb="md"
                    style={{ cursor: "pointer" }}
                  >
                    <Title order={6}>{event.name}</Title>
                    <Text size="sm">
                      {event.startsAt
                        ? dayjs(event.startsAt).format("h:mm A")
                        : "No time"}{" "}
                      -{" "}
                      {event.endsAt
                        ? dayjs(event.endsAt).format("h:mm A")
                        : "No end time"}
                    </Text>
                    {event.Location && (
                      <Badge color="blue">{event.Location.name}</Badge>
                    )}
                    {event.EventSeries && (
                      <Badge color="grape" ml="xs">
                        Series: {event.EventSeries.name}
                      </Badge>
                    )}
                  </Paper>
                </Link>
              ))
            )}
          </>
        ) : (
          <Text>Select a date to see events</Text>
        )}
      </Box>
    </Group>
  );
}
