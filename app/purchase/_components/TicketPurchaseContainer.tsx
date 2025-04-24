"use client";
import { useState } from "react";
import SeatSelection from "./SeatSelection";
import PurchaseForm from "./PurchaseForm";

interface Section {
  id: string;
  name: string;
  description?: string | null;
  priceMultiplier: number;
  rows: {
    id: string;
    name: string;
    seats: {
      id: string;
      number: string;
      status: "AVAILABLE" | "RESERVED" | "OCCUPIED" | "DISABLED";
    }[];
  }[];
}

interface TicketPurchaseContainerProps {
  sections: Section[];
  basePrice: number;
  ticketTypeId: string;
}

export default function TicketPurchaseContainer({
  sections,
  basePrice,
  ticketTypeId,
}: TicketPurchaseContainerProps) {
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [finalPrice, setFinalPrice] = useState(basePrice);

  const handleSeatSelect = (seatId: string, price: number) => {
    setSelectedSeatId(seatId);
    setFinalPrice(price);
  };

  return (
    <>
      <SeatSelection
        sections={sections}
        basePrice={basePrice}
        onSeatSelect={handleSeatSelect}
      />
      <PurchaseForm
        price={finalPrice}
        ticketTypeId={ticketTypeId}
        selectedSeatId={selectedSeatId}
      />
    </>
  );
}
