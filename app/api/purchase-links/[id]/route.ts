import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const purchaseLink = await prisma.purchaseLink.findUnique({
      where: { id: params.id },
      include: {
        Event: {
          include: {
            Location: true,
          },
        },
      },
    });

    if (!purchaseLink) {
      return NextResponse.json(
        { error: "Purchase link not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(purchaseLink);
  } catch (error) {
    console.error("Failed to fetch purchase link:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase link" },
      { status: 500 }
    );
  }
}
