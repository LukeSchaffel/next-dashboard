import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { name, description, sections, locationId, eventId } = await request.json();
    const { workspaceId } = await getAuthSession();

    // Validate that either locationId or eventId is provided, but not both
    if (!locationId && !eventId) {
      return NextResponse.json(
        { error: "Either locationId or eventId must be provided" },
        { status: 400 }
      );
    }

    if (locationId && eventId) {
      return NextResponse.json(
        { error: "Cannot provide both locationId and eventId" },
        { status: 400 }
      );
    }

    // If locationId is provided, check if it exists and belongs to the workspace
    if (locationId) {
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

      // Check if location already has a default layout
      const existingLayout = await prisma.seatingLayout.findUnique({
        where: { locationId },
      });

      if (existingLayout) {
        return NextResponse.json(
          { error: "Location already has a default layout" },
          { status: 400 }
        );
      }
    }

    // If eventId is provided, check if it exists and belongs to the workspace
    if (eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { Location: true },
      });

      if (!event) {
        return NextResponse.json(
          { error: "Event not found" },
          { status: 404 }
        );
      }

      if (event.Location.workspaceId !== workspaceId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      // Check if event already has a custom layout
      const existingLayout = await prisma.seatingLayout.findUnique({
        where: { eventId },
      });

      if (existingLayout) {
        return NextResponse.json(
          { error: "Event already has a custom layout" },
          { status: 400 }
        );
      }
    }

    // Create the seating layout with all its related data
    const seatingLayout = await prisma.seatingLayout.create({
      data: {
        name,
        description,
        locationId,
        eventId,
        sections: {
          create: sections.map((section: any) => ({
            name: section.name,
            description: section.description,
            priceMultiplier: section.priceMultiplier,
            rows: {
              create: section.rows.map((row: any) => ({
                name: row.name,
                seats: {
                  create: row.seats.map((seat: any) => ({
                    number: seat.number,
                    status: seat.status,
                  })),
                },
              })),
            },
          })),
        },
      },
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
    });

    return NextResponse.json(seatingLayout, { status: 201 });
  } catch (error) {
    console.error("Failed to create seating layout:", error);
    return NextResponse.json(
      { error: "Failed to create seating layout" },
      { status: 500 }
    );
  }
} 