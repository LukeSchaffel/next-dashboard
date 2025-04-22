import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; layoutId: string }> }
) {
  try {
    const { id, layoutId } = await params;
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

    const seatingLayout = await prisma.seatingLayout.findUnique({
      where: { id: layoutId },
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
  { params }: { params: Promise<{ id: string; layoutId: string }> }
) {
  try {
    const { id, layoutId } = await params;
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

    const seatingLayout = await prisma.seatingLayout.findUnique({
      where: { id: layoutId },
    });

    if (!seatingLayout) {
      return NextResponse.json(
        { error: "Seating layout not found" },
        { status: 404 }
      );
    }

    // Update the seating layout and its related data
    const updatedLayout = await prisma.seatingLayout.update({
      where: { id: layoutId },
      data: {
        name,
        description,
        sections: {
          deleteMany: {},
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
