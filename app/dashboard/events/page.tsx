"use client";
import {
  Flex,
  Title,
  Button,
  Box,
  Popover,
  Text,
  ScrollArea,
  Anchor,
  Group,
  Badge,
  SimpleGrid,
  SegmentedControl,
  Collapse,
} from "@mantine/core";
import { Event, EventSeries } from "@prisma/client";

import { Table } from "@/lib/components";
import { useContext, useEffect, useState } from "react";
import { DashboardContext } from "../_components/client-layout";
import Link from "next/link";
import {
  IconEye,
  IconRefresh,
  IconCalendar,
  IconTable,
  IconPlus,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";
import { useEventStore } from "@/stores/useEventStore";
import CalendarView from "./_components/CalendarView";

type ViewType = "table" | "calendar";

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

interface GroupedEvents {
  seriesId: string;
  seriesName: string;
  events: EventWithDetails[];
}

interface CalendarViewProps {
  events: EventWithDetails[];
}

export default function EventsPage() {
  const { userRole } = useContext(DashboardContext);
  const [selectedEvent, setSelectedEvent] = useState<
    EventWithDetails | undefined
  >(undefined);
  const [view, setView] = useState<ViewType>("table");
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());
  const { events, loading, hasFetched, fetchEvents, deleteEvent } =
    useEventStore();

  useEffect(() => {
    if (!hasFetched) {
      fetchEvents();
    }
  }, [hasFetched, fetchEvents]);

  const groupedEvents = events.reduce<GroupedEvents[]>((acc, event) => {
    const seriesId = event.EventSeries?.id || "standalone";
    const seriesName = event.EventSeries?.name || "Standalone Events";

    const existingGroup = acc.find((group) => group.seriesId === seriesId);
    if (existingGroup) {
      existingGroup.events.push(event);
    } else {
      acc.push({
        seriesId,
        seriesName,
        events: [event],
      });
    }
    return acc;
  }, []);

  const toggleSeries = (seriesId: string) => {
    setExpandedSeries((prev) => {
      const next = new Set(prev);
      if (next.has(seriesId)) {
        next.delete(seriesId);
      } else {
        next.add(seriesId);
      }
      return next;
    });
  };

  return (
    <>
      <Flex justify={"space-between"} align="center">
        <Group>
          <Title order={4}>Events</Title>
          <Button
            variant="subtle"
            leftSection={<IconRefresh size={16} />}
            onClick={fetchEvents}
            loading={loading}
          >
            Refresh
          </Button>
        </Group>
        <Group>
          <SegmentedControl
            value={view}
            onChange={(value) => setView(value as ViewType)}
            data={[
              { label: <IconTable size={16} />, value: "table" },
              { label: <IconCalendar size={16} />, value: "calendar" },
            ]}
          />
          <Link href="/dashboard/events/create">
            <Button leftSection={<IconPlus size={16} />}>New Event</Button>
          </Link>
        </Group>
      </Flex>

      {view === "table" ? (
        <Table
          loading={loading}
          data={{
            caption: "My events",
            head: [
              "",
              "Name",
              "Location",
              "Start Date",
              "End Date",
              "Tickets",
              "",
            ],
            body: groupedEvents.flatMap((group) => {
              const isExpanded = expandedSeries.has(group.seriesId);
              const seriesRow = [
                <Button
                  key={`toggle-${group.seriesId}`}
                  variant="subtle"
                  onClick={() => toggleSeries(group.seriesId)}
                  leftSection={
                    isExpanded ? (
                      <IconChevronDown size={16} />
                    ) : (
                      <IconChevronRight size={16} />
                    )
                  }
                >
                  {group.seriesName}
                </Button>,
                <Badge
                  key={`series-badge-${group.seriesId}`}
                  size="lg"
                  variant="light"
                >
                  {group.events.length}{" "}
                  {group.events.length === 1 ? "Event" : "Events"}
                </Badge>,
                "",
                "",
                "",
                "",
                "",
              ];

              const eventRows = isExpanded
                ? group.events.map((event) => [
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      key={`view-${event.id}`}
                    >
                      <Button
                        variant="subtle"
                        leftSection={<IconEye size={16} />}
                      >
                        View
                      </Button>
                    </Link>,
                    <Text key={`name-${event.id}`} ml="xl">
                      {event.name}
                    </Text>,
                    event.Location?.name || "No location",
                    event.startsAt
                      ? new Date(event.startsAt).toLocaleString()
                      : "Not set",
                    event.endsAt
                      ? new Date(event.endsAt).toLocaleString()
                      : "Not set",
                    <Badge key={`badge-${event.id}`} size="lg" variant="light">
                      {event.Tickets?.length || 0}{" "}
                      {event.Tickets?.length === 1 ? "Ticket" : "Tickets"}
                    </Badge>,
                    <Flex key={`actions-${event.id}`}>
                      <Button
                        variant="subtle"
                        onClick={() => setSelectedEvent(event)}
                      >
                        Edit
                      </Button>

                      <Popover shadow="md">
                        <Popover.Target>
                          <Button color="red" variant="transparent">
                            Delete
                          </Button>
                        </Popover.Target>
                        <Popover.Dropdown>
                          <Text size="xs">
                            Are you sure you want to delete this?
                          </Text>
                          <Button
                            variant="transparent"
                            size="xs"
                            onClick={() => deleteEvent(event.id)}
                            color="red"
                          >
                            Yes
                          </Button>
                        </Popover.Dropdown>
                      </Popover>
                    </Flex>,
                  ])
                : [];

              return [seriesRow, ...eventRows];
            }),
          }}
        />
      ) : (
        <CalendarView events={events} />
      )}
    </>
  );
}
