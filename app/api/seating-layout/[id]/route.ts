import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { workspaceId } = await getAuthSession();

    const seatingLayout = await prisma.seatingLayout.findUnique({
      where: { id },
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

    if (!seatingLayout) {
      return NextResponse.json(
        { error: "Seating layout not found" },
        { status: 404 }
      );
    }

    // Check if the seating layout belongs to a location or event in the workspace
    if (seatingLayout.locationId) {
      const location = await prisma.location.findUnique({
        where: { id: seatingLayout.locationId },
      });

      if (!location || location.workspaceId !== workspaceId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    } else if (seatingLayout.eventId) {
      const event = await prisma.event.findUnique({
        where: { id: seatingLayout.eventId },
        include: { Location: true },
      });

      if (!event || event?.Location.workspaceId !== workspaceId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    return NextResponse.json(seatingLayout, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch seating layout:", error);
    return NextResponse.json(
      { error: "Failed to fetch seating layout" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { name, description, sections } = await request.json();
    const { workspaceId } = await getAuthSession();

    const seatingLayout = await prisma.seatingLayout.findUnique({
      where: { id },
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

    if (!seatingLayout) {
      return NextResponse.json(
        { error: "Seating layout not found" },
        { status: 404 }
      );
    }

    // Check if the seating layout belongs to a location or event in the workspace
    if (seatingLayout.locationId) {
      const location = await prisma.location.findUnique({
        where: { id: seatingLayout.locationId },
      });

      if (!location || location.workspaceId !== workspaceId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    } else if (seatingLayout.eventId) {
      const event = await prisma.event.findUnique({
        where: { id: seatingLayout.eventId },
        include: { Location: true },
      });

      if (!event || event.Location.workspaceId !== workspaceId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    // First, delete all existing seats
    await prisma.seat.deleteMany({
      where: {
        Row: {
          Section: {
            seatingLayoutId: id,
          },
        },
      },
    });

    // Then, delete all existing rows
    await prisma.row.deleteMany({
      where: {
        Section: {
          seatingLayoutId: id,
        },
      },
    });

    // Then, delete all existing sections
    await prisma.section.deleteMany({
      where: {
        seatingLayoutId: id,
      },
    });

    // Finally, update the seating layout and create new sections, rows, and seats
    const updatedLayout = await prisma.seatingLayout.update({
      where: { id },
      data: {
        name,
        description,
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

    return NextResponse.json(updatedLayout, { status: 200 });
  } catch (error) {
    console.error("Failed to update seating layout:", error);
    return NextResponse.json(
      { error: "Failed to update seating layout" },
      { status: 500 }
    );
  }
}
