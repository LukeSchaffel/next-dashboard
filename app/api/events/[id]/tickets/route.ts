import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { TicketStatus } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { workspaceId } = await getAuthSession();

    const event = await prisma.event.findUnique({
      where: { id },
      select: { workspaceId: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const tickets = await prisma.ticket.findMany({
      where: { eventId: id },
      include: {
        TicketType: true,
      },
    });

    return NextResponse.json(tickets, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { workspaceId } = await getAuthSession();
    const body = await request.json();

    const event = await prisma.event.findUnique({
      where: { id },
      select: { workspaceId: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let ticketPrice = body.price;
    if (body.ticketTypeId) {
      const ticketType = await prisma.ticketType.findUnique({
        where: { id: body.ticketTypeId },
        select: { eventId: true, quantity: true, Tickets: true, price: true },
      });

      if (ticketType?.price) {
        ticketPrice = ticketType.price;
      }

      if (!ticketType) {
        return NextResponse.json(
          { error: "Ticket type not found" },
          { status: 404 }
        );
      }

      if (ticketType.eventId !== id) {
        return NextResponse.json(
          { error: "Ticket type does not belong to this event" },
          { status: 400 }
        );
      }

      if (
        ticketType.quantity !== null &&
        ticketType.Tickets.length >= ticketType.quantity
      ) {
        return NextResponse.json(
          { error: "Ticket type is sold out" },
          { status: 400 }
        );
      }
    }

    const ticket = await prisma.ticket.create({
      data: {
        name: body.name,
        email: body.email,
        price: ticketPrice,
        status: body.status,
        eventId: id,
        ticketTypeId: body.ticketTypeId,
      },
      include: {
        TicketType: true,
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error("Failed to create ticket:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
