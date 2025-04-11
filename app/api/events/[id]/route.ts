import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        Location: true,
        Tickets: true,
        PurchaseLinks: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const updateData = await request.json();

  try {
    const event = await prisma.event.update({
      where: {
        id,
      },
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
        Tickets: true,
        PurchaseLinks: true,
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
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const event = await prisma.event.delete({ where: { id } });
    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
