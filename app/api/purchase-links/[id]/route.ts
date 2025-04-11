import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { workspaceId } = await getAuthSession();

    const purchaseLink = await prisma.purchaseLink.findUnique({
      where: { id },
      include: {
        Event: {
          include: {
            Location: true,
          },
        },
      },
    });

    if (!purchaseLink) {
      return NextResponse.json({ error: "Purchase link not found" }, { status: 404 });
    }

    if (purchaseLink.workspaceId !== workspaceId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(purchaseLink, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch purchase link:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase link" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { workspaceId } = await getAuthSession();

    const purchaseLink = await prisma.purchaseLink.findUnique({
      where: { id },
    });

    if (!purchaseLink) {
      return NextResponse.json({ error: "Purchase link not found" }, { status: 404 });
    }

    if (purchaseLink.workspaceId !== workspaceId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.purchaseLink.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete purchase link:", error);
    return NextResponse.json(
      { error: "Failed to delete purchase link" },
      { status: 500 }
    );
  }
}
