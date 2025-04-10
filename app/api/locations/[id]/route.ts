import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userRole = await prisma.userRole.findFirst({
      where: {
        email: session.user?.email,
      },
    });

    if (!userRole) {
      return new NextResponse("User role not found", { status: 404 });
    }

    const body = await req.json();
    const { name, address, workspaceId } = body;

    if (!name || !workspaceId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const location = await prisma.location.update({
      where: {
        id: params.id,
        workspaceId: userRole.workspaceId,
      },
      data: {
        name,
        address,
      },
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error("Error updating location:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userRole = await prisma.userRole.findFirst({
      where: {
        email: session.user?.email,
      },
    });

    if (!userRole) {
      return new NextResponse("User role not found", { status: 404 });
    }

    // Check if location has any events
    const events = await prisma.event.findMany({
      where: {
        locationId: params.id,
      },
    });

    if (events.length > 0) {
      return new NextResponse(
        "Cannot delete location with associated events",
        { status: 400 }
      );
    }

    await prisma.location.delete({
      where: {
        id: params.id,
        workspaceId: userRole.workspaceId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting location:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 