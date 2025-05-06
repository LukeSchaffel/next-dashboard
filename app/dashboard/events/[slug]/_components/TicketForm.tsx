import {
  Modal,
  TextInput,
  Select,
  Stack,
  Button,
  Group,
  Text,
  ThemeIcon,
  rem,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { useEventStore } from "@/stores/useEventStore";
import { TicketStatus, TicketType } from "@prisma/client";
import {
  IconUser,
  IconMail,
  IconTicket,
  IconAlertCircle,
} from "@tabler/icons-react";

interface TicketFormProps {
  opened: boolean;
  onClose: () => void;
  eventSlug: string;
  ticketTypes: (TicketType & {
    Tickets: { id: string }[];
  })[];
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
      name: (value) => {
        if (value.length < 1) return "Name is required";
        if (value.length < 2) return "Name must be at least 2 characters";
        return null;
      },
      email: (value) => {
        if (!value) return "Email is required";
        if (!/^\S+@\S+$/.test(value)) return "Invalid email format";
        return null;
      },
      ticketTypeId: (value) => {
        if (!value) return "Ticket type is required";
        return null;
      },
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (opened) {
      form.reset();
    }
  }, [opened, form]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await addTicket(eventSlug, values);
      form.reset();
      onClose();
    } catch (error) {
      console.error("Failed to create ticket:", error);
    }
  };

  const selectedTicketType = ticketTypes.find(
    (type) => type.id === form.values.ticketTypeId
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add Ticket"
      size="md"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <TextInput
            label="Name"
            placeholder="Ticket holder's name"
            required
            leftSection={<IconUser size={16} />}
            {...form.getInputProps("name")}
          />
          <TextInput
            label="Email"
            placeholder="ticket@example.com"
            required
            leftSection={<IconMail size={16} />}
            {...form.getInputProps("email")}
          />
          <Select
            label="Ticket Type"
            placeholder="Select a ticket type"
            leftSection={<IconTicket size={16} />}
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
            leftSection={<IconAlertCircle size={16} />}
            data={Object.values(TicketStatus)}
            defaultValue={TicketStatus.PENDING}
            {...form.getInputProps("status")}
          />

          {selectedTicketType && (
            <Group gap="xs" c="dimmed">
              <ThemeIcon size="sm" radius="xl" variant="light">
                <IconTicket size={14} />
              </ThemeIcon>
              <Text size="sm">
                {selectedTicketType.quantity !== null
                  ? `${selectedTicketType.Tickets.length} of ${selectedTicketType.quantity} tickets sold`
                  : "Unlimited tickets available"}
              </Text>
            </Group>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Add Ticket
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
