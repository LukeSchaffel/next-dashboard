"use client";
import { Tabs, Paper, Stack, Text, Button } from "@mantine/core";
import {
  IconEye,
  IconTag,
  IconTable,
  IconFileDescription,
  IconPhoto,
} from "@tabler/icons-react";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { use } from "react";
import { useDisclosure, useFullscreen } from "@mantine/hooks";
import Link from "next/link";

import { useEventStore } from "@/stores/useEventStore";
import { useSupabase } from "@/lib/supabase";
import TagManager from "./_components/TagManager";
import TicketTypeForm from "./_components/TicketTypeForm";
import EventOverview from "./_components/EventOverview";
import EventTickets from "./_components/EventTickets";
import EventSeating from "./_components/EventSeating";
import EventSkeleton from "./_components/EventSkeleton";
import EventDescription from "./_components/EventDescription";
import EventImages from "./_components/EventImages";

export default function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { ref, toggle, fullscreen } = useFullscreen();
  const { currentEvent, loading, fetchEvent, fetchTicketTypes } =
    useEventStore();

  const [editingTicketTypeId, setEditingTicketTypeId] = useState<string | null>(
    null
  );
  const [
    ticketTypeModalOpened,
    { open: openTicketTypeModal, close: closeTicketTypeModal },
  ] = useDisclosure(false);
  const [tagManagerOpened, { open: openTagManager, close: closeTagManager }] =
    useDisclosure(false);
  const [imagePath, setImagePath] = useState<string | null>(null);

  useEffect(() => {
    fetchEvent(id).catch(() => {
      notFound();
    });
    fetchTicketTypes(id).catch(console.error);
  }, [id, fetchEvent, fetchTicketTypes]);

  const handleEditTicketType = async (ticketTypeId: string) => {
    setEditingTicketTypeId(ticketTypeId);
    openTicketTypeModal();
  };

  if (loading || !currentEvent) {
    return <EventSkeleton />;
  }

  return (
    <Tabs defaultValue="overview">
      <Tabs.List mb={16}>
        <Tabs.Tab value="overview" leftSection={<IconEye size={16} />}>
          Overview
        </Tabs.Tab>
        <Tabs.Tab
          value="description"
          leftSection={<IconFileDescription size={16} />}
        >
          Description
        </Tabs.Tab>
        <Tabs.Tab value="tickets" leftSection={<IconTag size={16} />}>
          Tickets
        </Tabs.Tab>

        <Tabs.Tab value="seating" leftSection={<IconTable size={16} />}>
          Seating Chart
        </Tabs.Tab>

        <Tabs.Tab value="images" leftSection={<IconPhoto size={16} />}>
          Images
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="overview">
        <EventOverview event={currentEvent} onManageTags={openTagManager} />
      </Tabs.Panel>

      <Tabs.Panel value="description">
        <EventDescription event={currentEvent} />
      </Tabs.Panel>

      <Tabs.Panel value="tickets">
        <EventTickets
          onAddTicketType={openTicketTypeModal}
          onEditTicketType={handleEditTicketType}
        />
      </Tabs.Panel>

      <Tabs.Panel value="seating">
        {currentEvent.eventLayout ? (
          <EventSeating
            onToggleFullscreen={() => {
              toggle();
            }}
          />
        ) : (
          <Paper p="xl" withBorder>
            <Stack gap="md" align="center">
              <Text size="lg">No seating chart has been created yet</Text>
              <Button
                component={Link}
                href={`/dashboard/events/${currentEvent.id}/event-layout`}
              >
                Create Seating Chart
              </Button>
            </Stack>
          </Paper>
        )}
      </Tabs.Panel>

      <Tabs.Panel value="images">
        <EventImages
          event={currentEvent}
          imagePath={imagePath}
          onImageUploaded={setImagePath}
          onImageRemoved={() => setImagePath(null)}
        />
      </Tabs.Panel>

      <TicketTypeForm
        opened={ticketTypeModalOpened}
        onClose={() => {
          closeTicketTypeModal();
          setEditingTicketTypeId(null);
        }}
        eventId={id}
        editingTicketTypeId={editingTicketTypeId || undefined}
      />

      <TagManager opened={tagManagerOpened} onClose={closeTagManager} />
    </Tabs>
  );
}
