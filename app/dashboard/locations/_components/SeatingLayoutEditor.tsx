"use client";

import {
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Button,
  TextInput,
  LoadingOverlay,
  NumberInput,
  ActionIcon,
  Grid,
  Box,
  Badge,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { IconPlus, IconTrash, IconX } from "@tabler/icons-react";

export interface Section {
  id: string;
  name: string;
  description: string;
  priceMultiplier: number;
  rows: Row[];
}

export interface Row {
  id: string;
  name: string;
  seats: Seat[];
}

export interface Seat {
  id: string;
  number: string;
  status: "AVAILABLE" | "RESERVED" | "OCCUPIED" | "DISABLED";
}

export interface SeatingLayout {
  id: string;
  name: string;
  description: string;
  sections: Section[];
}

interface SeatingLayoutEditorProps {
  initialLayout?: SeatingLayout;
  loading?: boolean;
  saving?: boolean;
  onSubmit: (values: {
    name: string;
    description: string;
    sections: Section[];
  }) => Promise<void>;
  submitLabel?: string;
}

export default function SeatingLayoutEditor({
  initialLayout,
  loading = false,
  saving = false,
  onSubmit,
  submitLabel = "Create Layout",
}: SeatingLayoutEditorProps) {
  const [sections, setSections] = useState<Section[]>(
    initialLayout?.sections || []
  );
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [seatCounts, setSeatCounts] = useState<Record<string, number>>({});

  const form = useForm({
    initialValues: {
      name: initialLayout?.name || "",
      description: initialLayout?.description || "",
    },
    validate: {
      name: (value) => (value.length < 1 ? "Name is required" : null),
    },
  });

  const addSection = () => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      name: `Section ${sections.length + 1}`,
      description: "",
      priceMultiplier: 1.0,
      rows: [],
    };
    setSections([...sections, newSection]);
    setSelectedSection(newSection);
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    );
  };

  const deleteSection = (sectionId: string) => {
    setSections(sections.filter((section) => section.id !== sectionId));
    if (selectedSection?.id === sectionId) {
      setSelectedSection(null);
    }
  };

  const addRow = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const newRow: Row = {
      id: crypto.randomUUID(),
      name: String.fromCharCode(65 + section.rows.length), // A, B, C, etc.
      seats: [],
    };

    updateSection(sectionId, {
      rows: [...section.rows, newRow],
    });
  };

  const removeRow = (sectionId: string, rowId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const updatedRows = section.rows.filter((row) => row.id !== rowId);

    updateSection(sectionId, { rows: updatedRows });
  };

  const addSeats = (sectionId: string, rowId: string, count: number) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const row = section.rows.find((r) => r.id === rowId);
    if (!row) return;

    const newSeats: Seat[] = Array.from({ length: count }, (_, i) => ({
      id: crypto.randomUUID(),
      number: String(row.seats.length + i + 1),
      status: "AVAILABLE",
    }));

    const updatedRows = section.rows.map((r) =>
      r.id === rowId ? { ...r, seats: [...r.seats, ...newSeats] } : r
    );

    updateSection(sectionId, { rows: updatedRows });
    setSeatCounts({ ...seatCounts, [rowId]: 1 }); // Reset to default value
  };

  const removeSeat = (sectionId: string, rowId: string, seatId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const row = section.rows.find((r) => r.id === rowId);
    if (!row) return;

    const updatedRows = section.rows.map((r) =>
      r.id === rowId
        ? {
            ...r,
            seats: r.seats.filter((seat) => seat.id !== seatId),
          }
        : r
    );

    updateSection(sectionId, { rows: updatedRows });
  };

  const handleSubmit = async (values: any) => {
    if (sections.length === 0) {
      alert("Please add at least one section to the layout");
      return;
    }

    await onSubmit({
      ...values,
      sections,
    });
  };

  return (
    <Stack gap="xl">
      <Paper p="xl" withBorder>
        <Stack gap="md">
          <Title order={2}>
            {initialLayout ? "Edit Seating Layout" : "Create Seating Layout"}
          </Title>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <LoadingOverlay
              visible={loading || saving}
              zIndex={1000}
              overlayProps={{ radius: "sm", blur: 2 }}
            />
            <Stack gap="md">
              <TextInput
                label="Layout Name"
                placeholder="Main Hall Layout"
                required
                {...form.getInputProps("name")}
              />
              <TextInput
                label="Description"
                placeholder="Describe this seating layout"
                {...form.getInputProps("description")}
              />

              <Title order={3} mt="xl">
                Sections
              </Title>
              <Button
                variant="light"
                leftSection={<IconPlus size={16} />}
                onClick={addSection}
              >
                Add Section
              </Button>

              <Grid>
                {sections.map((section) => (
                  <Grid.Col key={section.id} span={4}>
                    <Paper
                      p="md"
                      withBorder
                      style={{
                        borderColor:
                          selectedSection?.id === section.id
                            ? "var(--mantine-color-blue-6)"
                            : undefined,
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedSection(section)}
                    >
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text fw={500}>{section.name}</Text>
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSection(section.id);
                            }}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                        <TextInput
                          label="Section Name"
                          value={section.name}
                          onChange={(e) =>
                            updateSection(section.id, { name: e.target.value })
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                        <TextInput
                          label="Description"
                          value={section.description}
                          onChange={(e) =>
                            updateSection(section.id, {
                              description: e.target.value,
                            })
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                        <NumberInput
                          label="Price Multiplier"
                          value={section.priceMultiplier}
                          onChange={(value) =>
                            updateSection(section.id, {
                              priceMultiplier:
                                typeof value === "number" ? value : 1.0,
                            })
                          }
                          min={0.1}
                          step={0.1}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          variant="light"
                          leftSection={<IconPlus size={16} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            addRow(section.id);
                          }}
                        >
                          Add Row
                        </Button>
                        {section.rows.map((row) => (
                          <Box key={row.id} pl="md">
                            <Group>
                              <Group>
                                <Text fw={500}>Row {row.name}</Text>
                                <ActionIcon
                                  size="xs"
                                  color="red"
                                  variant="subtle"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeRow(section.id, row.id);
                                  }}
                                >
                                  <IconTrash size={14} />
                                </ActionIcon>
                              </Group>
                              <Group>
                                <NumberInput
                                  size="xs"
                                  min={1}
                                  max={100}
                                  value={seatCounts[row.id] || 1}
                                  onChange={(value) =>
                                    setSeatCounts({
                                      ...seatCounts,
                                      [row.id]:
                                        typeof value === "number" ? value : 1,
                                    })
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ width: "80px" }}
                                />
                                <Button
                                  size="xs"
                                  variant="light"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addSeats(
                                      section.id,
                                      row.id,
                                      seatCounts[row.id] || 1
                                    );
                                  }}
                                >
                                  Add Seats
                                </Button>
                              </Group>
                            </Group>
                            <Group gap="xs" mt="xs">
                              {row.seats.map((seat) => (
                                <Tooltip
                                  key={seat.id}
                                  label={`Seat ${seat.number}`}
                                  position="top"
                                >
                                  <Badge
                                    size="lg"
                                    variant={
                                      seat.status === "DISABLED"
                                        ? "outline"
                                        : "filled"
                                    }
                                    color={
                                      seat.status === "AVAILABLE"
                                        ? "green"
                                        : seat.status === "RESERVED"
                                        ? "yellow"
                                        : seat.status === "OCCUPIED"
                                        ? "red"
                                        : "gray"
                                    }
                                    rightSection={
                                      <ActionIcon
                                        size="xs"
                                        variant="transparent"
                                        color="gray"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeSeat(
                                            section.id,
                                            row.id,
                                            seat.id
                                          );
                                        }}
                                      >
                                        <IconX size={12} />
                                      </ActionIcon>
                                    }
                                  >
                                    {seat.number}
                                  </Badge>
                                </Tooltip>
                              ))}
                            </Group>
                          </Box>
                        ))}
                      </Stack>
                    </Paper>
                  </Grid.Col>
                ))}
              </Grid>

              <Button type="submit" mt="xl">
                {submitLabel}
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Stack>
  );
}
