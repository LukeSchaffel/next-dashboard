import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; layoutId: string } }
) {
  try {
    const { workspaceId } = await getAuthSession();

    const eventLayout = await prisma.eventLayout.findUnique({
      where: { id: params.layoutId },
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

    if (!eventLayout) {
      return NextResponse.json({ error: "Layout not found" }, { status: 404 });
    }

    if (eventLayout.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(eventLayout);
  } catch (error) {
    console.error("Failed to fetch event layout:", error);
    return NextResponse.json(
      { error: "Failed to fetch event layout" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; layoutId: string } }
) {
  try {
    const { workspaceId } = await getAuthSession();
    const { name, description, sections } = await request.json();

    const eventLayout = await prisma.eventLayout.findUnique({
      where: { id: params.layoutId },
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

    if (!eventLayout) {
      return NextResponse.json({ error: "Layout not found" }, { status: 404 });
    }

    if (eventLayout.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete all seats first
    for (const section of eventLayout.sections) {
      for (const row of section.rows) {
        await prisma.eventSeat.deleteMany({
          where: { rowId: row.id },
        });
      }
    }

    // Delete all rows
    for (const section of eventLayout.sections) {
      await prisma.eventRow.deleteMany({
        where: { sectionId: section.id },
      });
    }

    // Delete all sections
    await prisma.eventSection.deleteMany({
      where: { eventLayoutId: params.layoutId },
    });

    // Update the layout and create new sections
    const updatedLayout = await prisma.eventLayout.update({
      where: { id: params.layoutId },
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

    return NextResponse.json(updatedLayout);
  } catch (error) {
    console.error("Failed to update event layout:", error);
    return NextResponse.json(
      { error: "Failed to update event layout" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; layoutId: string } }
) {
  try {
    const { workspaceId } = await getAuthSession();

    const eventLayout = await prisma.eventLayout.findUnique({
      where: { id: params.layoutId },
    });

    if (!eventLayout) {
      return NextResponse.json({ error: "Layout not found" }, { status: 404 });
    }

    if (eventLayout.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.eventLayout.delete({
      where: { id: params.layoutId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete event layout:", error);
    return NextResponse.json(
      { error: "Failed to delete event layout" },
      { status: 500 }
    );
  }
}
