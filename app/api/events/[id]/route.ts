import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { workspaceId } = await getAuthSession();

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        Location: true,
        Tickets: {
          include: {
            TicketType: true,
          },
        },
        TicketTypes: {
          include: {
            Tickets: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updateData = await request.json();
    const { workspaceId } = await getAuthSession();

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.startsAt && { startsAt: new Date(updateData.startsAt) }),
        ...(updateData.endsAt && { endsAt: new Date(updateData.endsAt) }),
        ...(updateData.description !== undefined && {
          description: updateData.description,
        }),
        ...(updateData.locationId !== undefined && {
          locationId: updateData.locationId || null,
        }),
      },
      include: {
        Location: true,
        Tickets: {
          include: {
            TicketType: true,
          },
        },
        TicketTypes: {
          include: {
            Tickets: true,
          },
        },
      },
    });

    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { workspaceId } = await getAuthSession();

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
