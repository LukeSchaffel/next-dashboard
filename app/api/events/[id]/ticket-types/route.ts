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
    const { workspaceId } = await getAuthSession();
    const body = await request.json();

    // Verify event exists and belongs to workspace
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        eventLayout: {
          include: {
            sections: true,
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

    // Validate sections if provided
    if (body.allowedSections && body.allowedSections.length > 0) {
      const validSectionIds =
        event.eventLayout?.sections.map((section) => section.id) || [];
      const invalidSections = body.allowedSections.filter(
        (sectionId: string) => !validSectionIds.includes(sectionId)
      );

      if (invalidSections.length > 0) {
        return NextResponse.json(
          { error: "Invalid section IDs provided" },
          { status: 400 }
        );
      }
    }

    // Create ticket type
    const ticketType = await prisma.ticketType.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        quantity: body.quantity,
        eventId: id,
        workspaceId: workspaceId,
        allowedSections: body.allowedSections
          ? {
              connect: body.allowedSections.map((sectionId: string) => ({
                id: sectionId,
              })),
            }
          : undefined,
      },
      include: {
        Tickets: true,
        allowedSections: true,
      },
    });

    return NextResponse.json(ticketType, { status: 201 });
  } catch (error) {
    console.error("Failed to create ticket type:", error);
    return NextResponse.json(
      { error: "Failed to create ticket type" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticketTypes = await prisma.ticketType.findMany({
      where: {
        eventId: id,
      },
      include: {
        Tickets: {
          include: {
            purchase: true,
            seat: {
              include: { Row: true },
            },
          },
        },
        allowedSections: true,
      },
    });

    return NextResponse.json(ticketTypes);
  } catch (error) {
    console.error("Error fetching ticket types:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket types" },
      { status: 500 }
    );
  }
}
