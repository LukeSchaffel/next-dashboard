import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import {
  updateEventTags,
  validateEventAccess,
  eventWithDetailsSelector,
} from "@/lib/event-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { workspaceId } = await getAuthSession();

    const event = await prisma.event.findUnique({
      where: { id },
      include: eventWithDetailsSelector,
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

    // Validate event access
    await validateEventAccess(id, workspaceId);

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
        ...(updateData.tags !== undefined && {
          tags: await updateEventTags(updateData.tags, workspaceId),
        }),
        ...(updateData.headerImgUrl && {
          headerImgUrl: updateData.headerImgUrl,
        }),
      },
      include: eventWithDetailsSelector,
    });

    return NextResponse.json(event, { status: 200 });
  } catch (error: any) {
    console.error("Failed to update event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update event" },
      { status: error.message === "Unauthorized" ? 403 : 500 }
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
