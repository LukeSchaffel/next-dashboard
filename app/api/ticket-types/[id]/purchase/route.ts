import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { TicketStatus, PurchaseStatus } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      ticketType.Tickets.length + body.quantity > ticketType.quantity
    ) {
      return NextResponse.json(
        { error: "Not enough tickets available" },
        { status: 400 }
      );
    }

    // Create a new ticket purchase
    const purchase = await prisma.ticketPurchase.create({
      data: {
        totalAmount: body.seatIds
          ? body.seatIds.length * ticketType.price
          : ticketType.price * body.quantity,
        status: PurchaseStatus.PENDING,
        customerEmail: body.email,
        customerName: body.name,
        workspaceId: ticketType.workspaceId,
      },
    });

    // If seats are selected, check if they're available
    if (body.seatIds && body.seatIds.length > 0) {
      // Get all seats and their sections
      const seats = await prisma.eventSeat.findMany({
        where: {
          id: {
            in: body.seatIds,
          },
        },
        include: {
          Row: {
            include: {
              Section: true,
            },
          },
        },
      });

      // Check if all seats exist
      if (seats.length !== body.seatIds.length) {
        return NextResponse.json(
          { error: "One or more selected seats not found" },
          { status: 404 }
        );
      }

      // Check if all seats are available
      const unavailableSeats = seats.filter(
        (seat) => seat.status !== "AVAILABLE"
      );
      if (unavailableSeats.length > 0) {
        return NextResponse.json(
          { error: "One or more selected seats are not available" },
          { status: 400 }
        );
      }

      // Check if all seats' sections are allowed for this ticket type
      const invalidSections = seats.filter(
        (seat) =>
          !ticketType.allowedSections.some(
            (section) => section.id === seat.Row.Section.id
          )
      );
      if (invalidSections.length > 0) {
        return NextResponse.json(
          {
            error:
              "One or more selected seats are not allowed for this ticket type",
          },
          { status: 400 }
        );
      }

      // Create tickets for each seat
      const tickets = await Promise.all(
        seats.map((seat) =>
          prisma.ticket.create({
            data: {
              name: body.name,
              email: body.email,
              price: Math.round(
                ticketType.price * seat.Row.Section.priceMultiplier
              ),
              status: TicketStatus.PENDING,
              eventId: ticketType.eventId,
              ticketTypeId: ticketType.id,
              seatId: seat.id,
              purchaseId: purchase.id,
              workspaceId: ticketType.workspaceId,
            },
          })
        )
      );

      // Update all seats to occupied
      await Promise.all(
        seats.map((seat) =>
          prisma.eventSeat.update({
            where: { id: seat.id },
            data: {
              status: "OCCUPIED",
              ticketId: tickets.find((t) => t.seatId === seat.id)?.id,
            },
          })
        )
      );

      return NextResponse.json({ purchaseId: purchase.id }, { status: 201 });
    }

    // Create multiple tickets without seats
    const tickets = await Promise.all(
      Array(body.quantity)
        .fill(null)
        .map(() =>
          prisma.ticket.create({
            data: {
              name: body.name,
              email: body.email,
              price: ticketType.price,
              status: TicketStatus.PENDING,
              eventId: ticketType.eventId,
              ticketTypeId: ticketType.id,
              purchaseId: purchase.id,
              workspaceId: ticketType.workspaceId,
            },
          })
        )
    );

    return NextResponse.json({ purchaseId: purchase.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to purchase tickets:", error);
    return NextResponse.json(
      { error: "Failed to purchase tickets" },
      { status: 500 }
    );
  }
}
