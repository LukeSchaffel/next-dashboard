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
import { Event } from "@prisma/client";
import dayjs from "dayjs";

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
import { useEventStore, EventWithDetails } from "@/stores/useEventStore";
import CalendarView from "./_components/CalendarView";

type ViewType = "table" | "calendar";

export interface GroupedEvents {
  seriesId: string;
  seriesName: string;
  events: EventWithDetails[];
}

export default function EventsPage() {
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
    if (event.EventSeries) {
      const seriesId = event.EventSeries.id;
      const seriesName = event.EventSeries.name;

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
    } else {
      acc.push({
        seriesId: event.id,
        seriesName: event.name,
        events: [event],
      });
    }
    return acc;
  }, []);

  const toggleSeries = (seriesId: string) => {
    const group = groupedEvents.find((g) => g.seriesId === seriesId);
    if (group && group.events.length > 1) {
      setExpandedSeries((prev) => {
        const next = new Set(prev);
        if (next.has(seriesId)) {
          next.delete(seriesId);
        } else {
          next.add(seriesId);
        }
        return next;
      });
    }
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
            head: ["", "Name", "Location", "Start Date", "End Date", ""],
            body: groupedEvents.flatMap((group) => {
              const isExpanded = expandedSeries.has(group.seriesId);
              if (group.events.length === 1) {
                const event = group.events[0];
                return [
                  [
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
                    <Text key={`name-${event.id}`}>{event.name}</Text>,
                    event.Location?.name || "No location",
                    event.startsAt
                      ? dayjs(event.startsAt).format("MM/DD/YY hh:mm A")
                      : "Not set",
                    event.endsAt
                      ? dayjs(event.endsAt).format("MM/DD/YY hh:mm A")
                      : "Not set",
                    <Flex key={`actions-${event.id}`}>
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
                  ],
                ];
              }

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
                group.events[0]?.Location?.name || "No location",
                group.events.length > 0
                  ? dayjs(
                      Math.min(
                        ...group.events
                          .map((e) =>
                            e.startsAt
                              ? new Date(e.startsAt).getTime()
                              : Infinity
                          )
                          .filter((date): date is number => date !== Infinity)
                      )
                    ).format("MM/DD/YY hh:mm A")
                  : "Not set",
                group.events.length > 0
                  ? dayjs(
                      Math.max(
                        ...group.events
                          .map((e) =>
                            e.endsAt ? new Date(e.endsAt).getTime() : -Infinity
                          )
                          .filter((date): date is number => date !== -Infinity)
                      )
                    ).format("MM/DD/YY hh:mm A")
                  : "Not set",
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
                      ? dayjs(event.startsAt).format("MM/DD/YY hh:mm A")
                      : "Not set",
                    event.endsAt
                      ? dayjs(event.endsAt).format("MM/DD/YY hh:mm A")
                      : "Not set",
                    <Flex key={`actions-${event.id}`}>
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
        <CalendarView groupedEvents={groupedEvents} />
      )}
    </>
  );
}
