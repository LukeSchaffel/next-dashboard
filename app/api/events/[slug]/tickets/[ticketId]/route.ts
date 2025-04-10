import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TicketStatus } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string; ticketId: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    const ticket = await prisma.ticket.update({
      where: { id: params.ticketId },
      data: { status },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Failed to update ticket:", error);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string; ticketId: string } }
) {
  try {
    await prisma.ticket.delete({
      where: { id: params.ticketId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete ticket:", error);
    return NextResponse.json(
      { error: "Failed to delete ticket" },
      { status: 500 }
    );
  }
}
