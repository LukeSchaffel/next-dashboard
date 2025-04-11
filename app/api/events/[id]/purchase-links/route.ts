import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { price } = await request.json();
    const { id } = context.params;
    const { workspaceId } = await getAuthSession();

    const purchaseLink = await prisma.purchaseLink.create({
      data: {
        price,
        eventId: id,
        workspaceId,
      },
    });

    return NextResponse.json(purchaseLink);
  } catch (error) {
    console.error("Failed to create purchase link:", error);
    return NextResponse.json(
      { error: "Failed to create purchase link" },
      { status: 500 }
    );
  }
}
