"use client";
import { useState } from "react";
import SeatSelection from "./SeatSelection";
import PurchaseForm from "./PurchaseForm";
import type { Section } from "@/lib/components/seating-layout";

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
  const [selectedSeats, setSelectedSeats] = useState<
    Array<{ id: string; price: number }>
  >([]);
  const [finalPrice, setFinalPrice] = useState(basePrice);

  const handleSeatSelect = (seatId: string, price: number) => {
    setSelectedSeats((prev) => {
      const isSelected = prev.some((seat) => seat.id === seatId);
      if (isSelected) {
        const newSeats = prev.filter((seat) => seat.id !== seatId);
        setFinalPrice(newSeats.reduce((sum, seat) => sum + seat.price, 0));
        return newSeats;
      } else {
        const newSeats = [...prev, { id: seatId, price }];
        setFinalPrice(newSeats.reduce((sum, seat) => sum + seat.price, 0));
        return newSeats;
      }
    });
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
        selectedSeatIds={selectedSeats.map((seat) => seat.id)}
        quantity={selectedSeats.length}
      />
    </>
  );
}
