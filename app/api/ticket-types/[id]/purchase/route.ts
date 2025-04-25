import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { TicketStatus } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Find the ticket type and check if it exists
    const ticketType = await prisma.ticketType.findUnique({
      where: { id },
      include: {
        Tickets: true,
        Event: {
          include: {
            eventLayout: {
              include: {
                sections: {
                  include: {
                    rows: {
                      include: {
                        seats: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        allowedSections: true,
      },
    });

    if (!ticketType) {
      return NextResponse.json(
        { error: "Ticket type not found" },
        { status: 404 }
      );
    }

    // Check if ticket type is sold out
    if (
      ticketType.quantity !== null &&
      ticketType.Tickets.length >= ticketType.quantity
    ) {
      return NextResponse.json(
        { error: "Ticket type is sold out" },
        { status: 400 }
      );
    }

    // If a seat is selected, check if it's available
    if (body.seatId) {
      const seat = await prisma.eventSeat.findUnique({
        where: { id: body.seatId },
        include: {
          Row: {
            include: {
              Section: true,
            },
          },
        },
      });

      if (!seat) {
        return NextResponse.json(
          { error: "Selected seat not found" },
          { status: 404 }
        );
      }

      if (seat.status !== "AVAILABLE") {
        return NextResponse.json(
          { error: "Selected seat is not available" },
          { status: 400 }
        );
      }

      // Check if the seat's section is allowed for this ticket type
      const isSectionAllowed = ticketType.allowedSections.some(
        (section: { id: string }) => section.id === seat.Row.Section.id
      );

      if (!isSectionAllowed) {
        return NextResponse.json(
          { error: "Selected seat is not allowed for this ticket type" },
          { status: 400 }
        );
      }

      // Calculate final price based on section price multiplier
      const finalPrice = Math.round(
        ticketType.price * seat.Row.Section.priceMultiplier
      );

      // Create the ticket with the selected seat
      const ticket = await prisma.ticket.create({
        data: {
          name: body.name,
          email: body.email,
          price: finalPrice,
          status: TicketStatus.PENDING,
          eventId: ticketType.eventId,
          ticketTypeId: ticketType.id,
          seatId: seat.id,
        },
      });

      // Update the seat status and link it to the ticket
      await prisma.eventSeat.update({
        where: { id: seat.id },
        data: {
          status: "OCCUPIED",
          ticketId: ticket.id,
        },
      });

      return NextResponse.json({ ticketId: ticket.id }, { status: 201 });
    }

    // Create the ticket without a seat
    const ticket = await prisma.ticket.create({
      data: {
        name: body.name,
        email: body.email,
        price: ticketType.price,
        status: TicketStatus.PENDING,
        eventId: ticketType.eventId,
        ticketTypeId: ticketType.id,
      },
    });

    return NextResponse.json({ ticketId: ticket.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to purchase ticket:", error);
    return NextResponse.json(
      { error: "Failed to purchase ticket" },
      { status: 500 }
    );
  }
}
