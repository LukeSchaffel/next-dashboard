import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { name, address } = await request.json();
    const { workspaceId } = await getAuthSession();

    const location = await prisma.location.create({
      data: {
        name,
        address,
        workspaceId,
      },
      include: {
        templateLayout: true,
      },
    });
    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { workspaceId } = await getAuthSession();

    const locations = await prisma.location.findMany({
      where: {
        workspaceId,
      },
      include: {
        templateLayout: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(locations, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
