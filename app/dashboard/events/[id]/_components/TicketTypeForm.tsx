import {
  Modal,
  TextInput,
  NumberInput,
  Stack,
  Button,
  MultiSelect,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { useEventStore } from "@/stores/useEventStore";

interface Section {
  id: string;
  name: string;
}

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number | null;
  allowedSections?: Section[];
}

interface TicketTypeFormProps {
  opened: boolean;
  onClose: () => void;
  eventId: string;
  editingTicketTypeId?: string;
}

export default function TicketTypeForm({
  opened,
  onClose,
  eventId,
  editingTicketTypeId,
}: TicketTypeFormProps) {
  const { addTicketType, updateTicketType, ticketTypes, currentEvent } =
    useEventStore();
  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      price: 0,
      quantity: null as number | null,
      allowedSections: [] as string[],
    },
    validate: {
      name: (value) => (value.length < 1 ? "Name is required" : null),
      price: (value) => (value < 0 ? "Price must be positive" : null),
      quantity: (value) =>
        value !== null && value < 0 ? "Quantity must be positive" : null,
    },
  });

  // Reset form when modal opens/closes or editingTicketTypeId changes
  useEffect(() => {
    if (opened) {
      if (editingTicketTypeId) {
        const ticketType = ticketTypes.find(
          (tt) => tt.id === editingTicketTypeId
        ) as TicketType | undefined;
        if (ticketType) {
          form.setValues({
            name: ticketType.name,
            description: ticketType.description || "",
            price: ticketType.price / 100,
            quantity: ticketType.quantity,
            allowedSections:
              ticketType.allowedSections?.map((section) => section.id) || [],
          });
        }
      } else {
        form.reset();
      }
    }
  }, [opened, editingTicketTypeId, ticketTypes]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingTicketTypeId) {
        await updateTicketType(eventId, editingTicketTypeId, values);
      } else {
        await addTicketType(eventId, values);
      }
      form.reset();
      onClose();
    } catch (error) {
      console.error("Failed to create/update ticket type:", error);
    }
  };

  const sectionOptions =
    currentEvent?.eventLayout?.sections.map((section) => ({
      value: section.id,
      label: section.name,
    })) || [];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editingTicketTypeId ? "Edit Ticket Type" : "Add Ticket Type"}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="General Admission"
            {...form.getInputProps("name")}
          />
          <TextInput
            label="Description"
            placeholder="Description of the ticket type"
            {...form.getInputProps("description")}
          />
          <NumberInput
            label="Price"
            placeholder="0.00"
            min={0}
            step={0.01}
            {...form.getInputProps("price")}
          />
          <NumberInput
            label="Quantity"
            placeholder="Leave empty for unlimited"
            min={0}
            {...form.getInputProps("quantity")}
          />
          <MultiSelect
            label="Allowed Sections"
            placeholder="Select sections this ticket type can be used for"
            data={sectionOptions}
            {...form.getInputProps("allowedSections")}
          />
          <Button type="submit">Save</Button>
        </Stack>
      </form>
    </Modal>
  );
}
