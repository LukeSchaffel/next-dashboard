import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { workspaceId } = await getAuthSession();
    const body = await request.json();

    // Verify event exists and belongs to workspace
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

    // Create ticket type
    const ticketType = await prisma.ticketType.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        quantity: body.quantity,
        eventId: id,
      },
      include: {
        Tickets: true,
      },
    });

    return NextResponse.json(ticketType, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create ticket type" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketTypes = await prisma.ticketType.findMany({
      where: {
        eventId: params.id,
      },
      include: {
        Tickets: true,
      },
    });

    return NextResponse.json(ticketTypes);
  } catch (error) {
    console.error("Error fetching ticket types:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket types" },
      { status: 500 }
    );
  }
} 