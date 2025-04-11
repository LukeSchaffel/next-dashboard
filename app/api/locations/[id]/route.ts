import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { name, address } = await request.json();

  try {
    const location = await prisma.location.update({
      where: {
        id,
      },
      data: {
        name,
        address,
      },
    });
    return NextResponse.json(location, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const location = await prisma.location.delete({
      where: { id },
    });
    return NextResponse.json(location, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete location" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        Events: {
          orderBy: {
            startsAt: "asc",
          },
        },
      },
    });

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(location, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 }
    );
  }
}
