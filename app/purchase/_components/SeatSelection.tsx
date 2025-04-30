"use client";

import { useState } from "react";
import { SeatSelection } from "@/lib/components/seating-layout";
import type { Section } from "@/lib/components/seating-layout";

interface SeatSelectionProps {
  sections: Section[];
  basePrice: number;
  onSeatSelect: (seatId: string, finalPrice: number) => void;
}

export default function PurchaseSeatSelection({
  sections,
  basePrice,
  onSeatSelect,
}: SeatSelectionProps) {
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);

  const handleSeatSelect = (seatId: string, finalPrice: number) => {
    setSelectedSeatIds((prev) => {
      const isSelected = prev.includes(seatId);
      if (isSelected) {
        return prev.filter((id) => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
    onSeatSelect(seatId, finalPrice);
  };

  return (
    <SeatSelection
      sections={sections}
      basePrice={basePrice}
      selectedSeatIds={selectedSeatIds}
      onSeatSelect={handleSeatSelect}
    />
  );
}
