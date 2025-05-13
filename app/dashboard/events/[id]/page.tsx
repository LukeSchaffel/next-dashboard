"use client";
import { Tabs } from "@mantine/core";
import { IconEye, IconTag, IconTable } from "@tabler/icons-react";
import { Event, Ticket, TicketType } from "@prisma/client";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { use } from "react";
import { useDisclosure, useFullscreen } from "@mantine/hooks";
import { useEventStore } from "@/stores/useEventStore";
import { useSupabase } from "@/lib/supabase";
import DescriptionEditorModal from "../_components/DescriptionEditorModal";
import TagManager from "./_components/TagManager";
import TicketTypeForm from "./_components/TicketTypeForm";
import EventOverview from "./_components/EventOverview";
import EventTickets from "./_components/EventTickets";
import EventSeating from "./_components/EventSeating";
import EventSkeleton from "./_components/EventSkeleton";

export default function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { ref, toggle, fullscreen } = useFullscreen();
  const {
    currentEvent,
    loading,
    fetchEvent,
    addTicketType,
    updateTicket,
    updateEvent,
    ticketTypes,
    ticketTypesLoading,
    fetchTicketTypes,
    deleteTicketType,
    updateTicketType,
  } = useEventStore();

  const [editingTicketTypeId, setEditingTicketTypeId] = useState<string | null>(
    null
  );
  const [
    ticketTypeModalOpened,
    { open: openTicketTypeModal, close: closeTicketTypeModal },
  ] = useDisclosure(false);
  const [
    descriptionModalOpened,
    { open: openDescriptionModal, close: closeDescriptionModal },
  ] = useDisclosure(false);
  const [descriptionLoading, setDescriptionLoading] = useState(false);
  const [descriptionContent, setDescriptionContent] = useState(
    currentEvent?.description || ""
  );
  const [showFullscreenSeating, setShowFullscreenSeating] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [tagManagerOpened, { open: openTagManager, close: closeTagManager }] =
    useDisclosure(false);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const { listImages } = useSupabase();
  const [images, setImages] = useState<string[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    fetchEvent(id).catch(() => {
      notFound();
    });
    fetchTicketTypes(id).catch(console.error);
  }, [id, fetchEvent, fetchTicketTypes]);

  useEffect(() => {
    if (currentEvent?.id && !imagesLoaded) {
      const fetchImages = async () => {
        const imgs = await listImages("events", currentEvent.id);
        setImages(imgs || []);
        setImagesLoaded(true);
      };
      fetchImages();
    }
  }, [listImages, currentEvent?.id, imagesLoaded]);

  const handleEditTicketType = async (ticketTypeId: string) => {
    setEditingTicketTypeId(ticketTypeId);
    openTicketTypeModal();
  };

  const handleDeleteTicketType = async (ticketTypeId: string) => {
    if (!confirm("Are you sure you want to delete this ticket type?")) return;

    try {
      await deleteTicketType(id, ticketTypeId);
    } catch (error) {
      console.error("Failed to delete ticket type:", error);
    }
  };

  const handleUpdateDescription = async () => {
    if (!currentEvent) return;

    setDescriptionLoading(true);
    try {
      await updateEvent(currentEvent.id, { description: descriptionContent });
      closeDescriptionModal();
    } catch (error) {
      console.error("Failed to update description:", error);
    } finally {
      setDescriptionLoading(false);
    }
  };

  const handleSeatClick = (seat: { id: string }, section: any) => {
    const ticket = currentEvent?.Tickets.find((t) => t.seat?.id === seat.id);
    if (ticket) {
      setSelectedTicket(ticket);
    }
  };

  if (loading || !currentEvent) {
    return <EventSkeleton />;
  }

  return (
    <Tabs defaultValue="overview">
      <Tabs.List>
        <Tabs.Tab value="overview" leftSection={<IconEye size={16} />}>
          Overview
        </Tabs.Tab>
        <Tabs.Tab value="tickets" leftSection={<IconTag size={16} />}>
          Tickets
        </Tabs.Tab>
        {currentEvent.eventLayout && (
          <Tabs.Tab value="seating" leftSection={<IconTable size={16} />}>
            Seating Chart
          </Tabs.Tab>
        )}
      </Tabs.List>

      <Tabs.Panel value="overview">
        <EventOverview
          event={currentEvent}
          onEditDescription={openDescriptionModal}
          onToggleFullscreen={() => {
            setShowFullscreenSeating(true);
            toggle();
          }}
          fullscreen={fullscreen}
          onManageTags={openTagManager}
          imagePath={imagePath}
          onImageUploaded={setImagePath}
          onImageRemoved={() => setImagePath(null)}
        />
      </Tabs.Panel>

      <Tabs.Panel value="tickets">
        <EventTickets
          event={currentEvent}
          ticketTypes={ticketTypes}
          loading={ticketTypesLoading}
          onAddTicketType={openTicketTypeModal}
          onEditTicketType={handleEditTicketType}
          onDeleteTicketType={handleDeleteTicketType}
        />
      </Tabs.Panel>

      {currentEvent.eventLayout && (
        <Tabs.Panel value="seating">
          <EventSeating
            event={currentEvent}
            onToggleFullscreen={() => {
              setShowFullscreenSeating(true);
              toggle();
            }}
            onSeatClick={handleSeatClick}
          />
        </Tabs.Panel>
      )}

      <TicketTypeForm
        opened={ticketTypeModalOpened}
        onClose={() => {
          closeTicketTypeModal();
          setEditingTicketTypeId(null);
        }}
        eventId={id}
        editingTicketTypeId={editingTicketTypeId || undefined}
      />

      <DescriptionEditorModal
        opened={descriptionModalOpened}
        onClose={closeDescriptionModal}
        value={descriptionContent}
        onChange={setDescriptionContent}
        onSave={handleUpdateDescription}
        loading={descriptionLoading}
      />

      <TagManager
        opened={tagManagerOpened}
        onClose={closeTagManager}
        eventId={id}
        currentTags={currentEvent.tags || []}
      />
    </Tabs>
  );
}
