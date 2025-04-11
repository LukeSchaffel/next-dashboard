import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TicketStatus } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, email } = await request.json();
    const purchaseLink = await prisma.purchaseLink.findUnique({
      where: { id: params.id },
    });

    if (!purchaseLink) {
      return NextResponse.json(
        { error: "Purchase link not found" },
        { status: 404 }
      );
    }

    const ticket = await prisma.ticket.create({
      data: {
        name,
        email,
        price: purchaseLink.price,
        status: TicketStatus.PENDING,
        eventId: purchaseLink.eventId,
      },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Failed to create ticket:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
