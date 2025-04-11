import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { price } = await request.json();
    const { id } = params;
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
    console.log(error);
    console.error("Failed to create purchase link:", error);
    return NextResponse.json(
      { error: "Failed to create purchase link" },
      { status: 500 }
    );
  }
}
