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

    // Check if location already has a template layout
    const existingLayout = await prisma.templateLayout.findUnique({
      where: { locationId: id },
    });

    if (existingLayout) {
      return NextResponse.json(
        { error: "Location already has a template layout" },
        { status: 400 }
      );
    }

    // Create the template layout with all its related data
    const templateLayout = await prisma.templateLayout.create({
      data: {
        name,
        description,
        locationId: id,
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

    // Update the location to include the template layout
    await prisma.location.update({
      where: { id },
      data: {
        templateLayout: {
          connect: { id: templateLayout.id },
        },
      },
    });

    return NextResponse.json(templateLayout, { status: 201 });
  } catch (error) {
    console.error("Failed to create template layout:", error);
    return NextResponse.json(
      { error: "Failed to create template layout" },
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
      where: { locationId: id },
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
