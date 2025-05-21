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

    const templateLayout = await prisma.templateLayout.findUnique({
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

    if (!templateLayout) {
      return NextResponse.json(
        { error: "Template layout not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(templateLayout, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch template layout:", error);
    return NextResponse.json(
      { error: "Failed to fetch template layout" },
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

    const templateLayout = await prisma.templateLayout.findUnique({
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

    if (!templateLayout) {
      return NextResponse.json(
        { error: "Template layout not found" },
        { status: 404 }
      );
    }

    // First, delete all existing seats
    await prisma.templateSeat.deleteMany({
      where: {
        Row: {
          Section: {
            templateLayoutId: layoutId,
          },
        },
      },
    });

    // Then, delete all existing rows
    await prisma.templateRow.deleteMany({
      where: {
        Section: {
          templateLayoutId: layoutId,
        },
      },
    });

    // Then, delete all existing sections
    await prisma.templateSection.deleteMany({
      where: {
        templateLayoutId: layoutId,
      },
    });

    // Finally, update the template layout and create new sections, rows, and seats
    const updatedLayout = await prisma.templateLayout.update({
      where: { id: layoutId },
      data: {
        name,
        description,
        workspaceId,
        sections: {
          create: sections.map((section: any) => ({
            name: section.name,
            description: section.description,
            priceMultiplier: section.priceMultiplier,
            workspaceId,
            rows: {
              create: section.rows.map((row: any) => ({
                name: row.name,
                workspaceId,
                seats: {
                  create: row.seats.map((seat: any) => ({
                    number: seat.number,
                    status: seat.status,
                    workspaceId,
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
    console.error("Failed to update template layout:", error);
    return NextResponse.json(
      { error: "Failed to update template layout" },
      { status: 500 }
    );
  }
}
