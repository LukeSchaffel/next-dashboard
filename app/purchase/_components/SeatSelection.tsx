"use client";
import { Box, Grid, Paper, Text, Group, Button, Stack } from "@mantine/core";
import { useState } from "react";

interface Seat {
  id: string;
  number: string;
  status: "AVAILABLE" | "RESERVED" | "OCCUPIED" | "DISABLED";
}

interface Row {
  id: string;
  name: string;
  seats: Seat[];
}

interface Section {
  id: string;
  name: string;
  description?: string | null;
  priceMultiplier: number;
  rows: Row[];
}

interface SeatSelectionProps {
  sections: Section[];
  basePrice: number;
  onSeatSelect: (seatId: string, finalPrice: number) => void;
}

export default function SeatSelection({
  sections,
  basePrice,
  onSeatSelect,
}: SeatSelectionProps) {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  const handleSeatClick = (seat: Seat, section: Section) => {
    if (seat.status !== "AVAILABLE") return;

    setSelectedSeat(seat.id);
    setSelectedSection(section);
    const finalPrice = Math.round(basePrice * section.priceMultiplier);
    onSeatSelect(seat.id, finalPrice);
  };

  return (
    <Stack gap="xl">
      {sections.map((section) => (
        <Box key={section.id}>
          <Text size="lg" fw={500} mb="md">
            {section.name}
            {section.description && (
              <Text size="sm" c="dimmed" component="span" ml="xs">
                - {section.description}
              </Text>
            )}
            <Text size="sm" c="dimmed" component="span" ml="xs">
              (Price: $
              {((basePrice * section.priceMultiplier) / 100).toFixed(2)})
            </Text>
          </Text>
          <Paper p="md" withBorder>
            <Stack gap="md">
              {section.rows.map((row) => (
                <Box key={row.id}>
                  <Text size="sm" fw={500} mb="xs">
                    Row {row.name}
                  </Text>
                  <Group gap="xs">
                    {row.seats.map((seat) => (
                      <Button
                        key={seat.id}
                        variant={
                          seat.id === selectedSeat
                            ? "filled"
                            : seat.status === "AVAILABLE"
                            ? "outline"
                            : "subtle"
                        }
                        color={
                          seat.status === "AVAILABLE"
                            ? "blue"
                            : seat.status === "OCCUPIED"
                            ? "red"
                            : "gray"
                        }
                        size="xs"
                        onClick={() => handleSeatClick(seat, section)}
                        disabled={seat.status !== "AVAILABLE"}
                      >
                        {seat.number}
                      </Button>
                    ))}
                  </Group>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Box>
      ))}
    </Stack>
  );
}
