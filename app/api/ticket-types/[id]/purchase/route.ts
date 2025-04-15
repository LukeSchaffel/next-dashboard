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

    // Create the ticket
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