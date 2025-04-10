"use client";
import { Flex, Title, Button, Box, Popover, Text, Badge } from "@mantine/core";
import { EventWithLocation } from "@/lib/prisma";

import { Table } from "@/lib/components";
import EventForm from "./_components/EventForm";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { IconEye } from "@tabler/icons-react";
import { useClientAuthSession } from "../_components/client-layout";
import { useEventStore } from "@/stores/useEventStore";

export default function EventsPage() {
  const { userRole } = useClientAuthSession();
  const [selectedEvent, setSelectedEvent] = useState<
    EventWithLocation | undefined
  >(undefined);
  const { events, loading, fetchEvents, deleteEvent } = useEventStore();

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <>
      <Flex justify={"space-between"}>
        <Title order={4}>Upcoming events</Title>
        <EventForm
          userRole={userRole}
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
        />
      </Flex>

      <Table
        loading={loading}
        data={{
          caption: "My events",
          head: [
            "",
            "Name",
            "Description",
            "Location",
            "Start",
            "End",
            "Tickets",
            "",
          ],
          body: events.map((evt) => {
            return [
              <Link href={`/dashboard/events/${evt.id}`} key={evt.id}>
                <Button variant="subtle" leftSection={<IconEye size={16} />}>
                  View
                </Button>
              </Link>,
              evt.name,
              evt.description,
              evt.Location?.name || "No location",
              dayjs(evt.startsAt).format("MM/DD/YYYY"),
              dayjs(evt.endsAt).format("MM/DD/YYYY"),
              <Badge size="lg" variant="light">
                {evt.Tickets?.length || 0}{" "}
                {evt.Tickets?.length === 1 ? "Ticket" : "Tickets"}
              </Badge>,
              <Flex>
                <Button variant="subtle" onClick={() => setSelectedEvent(evt)}>
                  Edit
                </Button>

                <Popover shadow="md">
                  <Popover.Target>
                    <Button color="red" variant="transparent">
                      Delete
                    </Button>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <Text size="xs">Are you sure you want to delete this?</Text>
                    <Button
                      variant="transparent"
                      size="xs"
                      onClick={() => deleteEvent(evt.id)}
                      color="red"
                    >
                      Yes
                    </Button>
                  </Popover.Dropdown>
                </Popover>
              </Flex>,
            ];
          }),
        }}
      />
    </>
  );
}
