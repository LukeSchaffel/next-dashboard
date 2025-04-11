import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { workspaceId } = await getAuthSession();

    const purchaseLinks = await prisma.purchaseLink.findMany({
      where: {
        workspaceId,
      },
      include: {
        Event: {
          include: {
            Location: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(purchaseLinks, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch purchase links:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase links" },
      { status: 500 }
    );
  }
} 