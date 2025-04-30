"use client";

import {
  Box,
  Grid,
  Paper,
  Text,
  Group,
  Button,
  Stack,
  MantineColor,
} from "@mantine/core";
import { Ticket } from "@prisma/client";

export interface Seat {
  id: string;
  number: string;
  status: "AVAILABLE" | "RESERVED" | "OCCUPIED" | "DISABLED";
}

export interface Row {
  id: string;
  name: string;
  seats: Seat[];
}

export interface Section {
  id: string;
  name: string;
  description?: string | null;
  priceMultiplier: number;
  rows: Row[];
}

export interface SeatSelectionProps {
  sections: Section[];
  basePrice: number;
  selectedSeatIds?: string[];
  onSeatSelect?: (seatId: string, finalPrice: number) => void;
  onSeatClick?: (seat: Seat, section: Section) => void;
  colors?: {
    available?: MantineColor;
    occupied?: MantineColor;
    selected?: MantineColor;
    disabled?: MantineColor;
  };
  buttonSize?: "xs" | "sm" | "md" | "lg" | "xl";
  showPrices?: boolean;
  className?: string;
  readOnly?: boolean;
}

export function SeatSelection({
  sections,
  basePrice,
  selectedSeatIds = [],
  onSeatSelect,
  onSeatClick,
  colors = {
    available: "blue",
    occupied: "red",
    selected: "blue",
    disabled: "gray",
  },
  buttonSize = "xs",
  showPrices = true,
  className,
  readOnly = false,
}: SeatSelectionProps) {
  const handleSeatClick = (seat: Seat, section: Section) => {
    if (readOnly) {
      onSeatClick?.(seat, section);
      return;
    }
    if (seat.status !== "AVAILABLE" || !onSeatSelect) return;
    const finalPrice = Math.round(basePrice * section.priceMultiplier);
    onSeatSelect(seat.id, finalPrice);
  };

  const getSeatColor = (seat: Seat) => {
    if (selectedSeatIds.includes(seat.id)) return colors.selected;
    if (readOnly && seat.status === "OCCUPIED") return "green";
    switch (seat.status) {
      case "AVAILABLE":
        return colors.available;
      case "OCCUPIED":
        return colors.occupied;
      default:
        return colors.disabled;
    }
  };

  const getSeatVariant = (seat: Seat) => {
    if (selectedSeatIds.includes(seat.id)) return "filled";
    if (readOnly) return "light";
    return seat.status === "AVAILABLE" ? "outline" : "subtle";
  };

  return (
    <Stack gap="xl" className={className}>
      {sections.map((section) => (
        <Box key={section.id}>
          <Text size="lg" fw={500} mb="md">
            {section.name}
            {section.description && (
              <Text size="sm" c="dimmed" component="span" ml="xs">
                - {section.description}
              </Text>
            )}
            {showPrices && (
              <Text size="sm" c="dimmed" component="span" ml="xs">
                (Price: $
                {((basePrice * section.priceMultiplier) / 100).toFixed(2)})
              </Text>
            )}
          </Text>
          <Paper p="md" withBorder>
            <Stack gap="md">
              {section.rows.map((row) => (
                <Box key={row.id}>
                  <Text size="sm" fw={500} mb="xs">
                    Row {row.name}
                  </Text>
                  <Group gap="xs">
                    {[...row.seats]
                      .sort((a, b) => parseInt(a.number) - parseInt(b.number))
                      .map((seat) => (
                        <Button
                          key={seat.id}
                          variant={getSeatVariant(seat)}
                          color={getSeatColor(seat)}
                          size={buttonSize}
                          onClick={() => handleSeatClick(seat, section)}
                          disabled={!readOnly && seat.status !== "AVAILABLE"}
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

export default SeatSelection;
