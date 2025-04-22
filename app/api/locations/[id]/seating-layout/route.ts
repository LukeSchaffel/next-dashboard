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
    const { name, description, sections } = await request.json();
    const { workspaceId } = await getAuthSession();

    const location = await prisma.location.findUnique({
      where: { id },
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
      where: { locationId: id },
    });

    if (existingLayout) {
      return NextResponse.json(
        { error: "Location already has a default layout" },
        { status: 400 }
      );
    }

    // Create the seating layout with all its related data
    const seatingLayout = await prisma.seatingLayout.create({
      data: {
        name,
        description,
        locationId: id,
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
