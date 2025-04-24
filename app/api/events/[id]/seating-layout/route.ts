import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { workspaceId } = await getAuthSession();

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        eventLayout: {
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
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Failed to fetch event layout:", error);
    return NextResponse.json(
      { error: "Failed to fetch event layout" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { workspaceId } = await getAuthSession();
    const { name, description, sections } = await request.json();

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        eventLayout: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (event.eventLayout) {
      return NextResponse.json(
        { error: "Event layout already exists" },
        { status: 400 }
      );
    }

    const eventLayout = await prisma.eventLayout.create({
      data: {
        name,
        description,
        eventId: event.id,
        workspaceId,
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

    return NextResponse.json(eventLayout, { status: 201 });
  } catch (error) {
    console.error("Failed to create event layout:", error);
    return NextResponse.json(
      { error: "Failed to create event layout" },
      { status: 500 }
    );
  }
}
