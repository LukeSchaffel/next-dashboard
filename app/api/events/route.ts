import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { name, description, locationId, startsAt, endsAt, ticketTypes } =
      await request.json();
    const { workspaceId, userRoleId } = await getAuthSession();

    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    if (location.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const event = await prisma.event.create({
      data: {
        name,
        description,
        locationId,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        userRoleId,
        workspaceId,
        TicketTypes: ticketTypes
          ? {
              create: ticketTypes.map((type: any) => ({
                name: type.name,
                description: type.description,
                price: type.price,
                quantity: type.quantity,
              })),
            }
          : undefined,
      },
      include: {
        Location: {
          select: {
            id: true,
            name: true,
          },
        },
        TicketTypes: true,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { workspaceId } = await getAuthSession();

    const events = await prisma.event.findMany({
      where: {
        workspaceId,
      },
      include: {
        Location: {
          select: {
            id: true,
            name: true,
          },
        },
        TicketTypes: true,
      },
      orderBy: {
        startsAt: "desc",
      },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
