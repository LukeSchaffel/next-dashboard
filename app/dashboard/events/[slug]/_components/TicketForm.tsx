import { Modal, TextInput, Select, Stack, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { useEventStore } from "@/stores/useEventStore";
import { TicketStatus, TicketType } from "@prisma/client";

interface TicketFormProps {
  opened: boolean;
  onClose: () => void;
  eventSlug: string;
  ticketTypes: TicketType[];
  loading?: boolean;
}

export default function TicketForm({
  opened,
  onClose,
  eventSlug,
  ticketTypes,
  loading = false,
}: TicketFormProps) {
  const { addTicket } = useEventStore();
  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      ticketTypeId: "",
      status: TicketStatus.PENDING,
      price: 0,
    },
    validate: {
      name: (value) => (value.length < 1 ? "Name is required" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      ticketTypeId: (value) =>
        value.length < 1 ? "Ticket type is required" : null,
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (opened) {
      form.reset();
    }
  }, [opened]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await addTicket(eventSlug, values);
      form.reset();
      onClose();
    } catch (error) {
      console.error("Failed to create ticket:", error);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Add Ticket">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="Ticket holder's name"
            required
            {...form.getInputProps("name")}
          />
          <TextInput
            label="Email"
            placeholder="ticket@example.com"
            required
            {...form.getInputProps("email")}
          />
          <Select
            label="Ticket Type"
            placeholder="Select a ticket type"
            data={ticketTypes.map((type) => ({
              value: type.id,
              label: `${type.name} - $${(type.price / 100).toFixed(2)}`,
              disabled:
                type.quantity !== null && type.Tickets.length >= type.quantity,
            }))}
            {...form.getInputProps("ticketTypeId")}
          />
          <Select
            label="Status"
            data={Object.values(TicketStatus)}
            defaultValue={TicketStatus.PENDING}
            {...form.getInputProps("status")}
          />
          <Button type="submit" loading={loading}>
            Add Ticket
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
