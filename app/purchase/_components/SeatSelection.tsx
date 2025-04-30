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
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);

  const handleSeatSelect = (seatId: string, finalPrice: number) => {
    setSelectedSeatId(seatId);
    onSeatSelect(seatId, finalPrice);
  };

  return (
    <SeatSelection
      sections={sections}
      basePrice={basePrice}
      selectedSeatId={selectedSeatId}
      onSeatSelect={handleSeatSelect}
    />
  );
}
