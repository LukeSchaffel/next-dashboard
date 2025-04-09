import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { name, startsAt, endsAt, description } = await request.json();

  try {
    const event = await prisma.event.update({
      where: {
        id: String(slug),
      },
      data: {
        name,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        description,
      },
    });
    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}
