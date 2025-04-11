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
    const { price } = await request.json();
    const { workspaceId } = await getAuthSession();

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const purchaseLink = await prisma.purchaseLink.create({
      data: {
        price,
        eventId: id,
        workspaceId,
      },
    });

    return NextResponse.json(purchaseLink, { status: 201 });
  } catch (error) {
    console.error("Failed to create purchase link:", error);
    return NextResponse.json(
      { error: "Failed to create purchase link" },
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

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        PurchaseLinks: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(event.PurchaseLinks, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch purchase links:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase links" },
      { status: 500 }
    );
  }
}
