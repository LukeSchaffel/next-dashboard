import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
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

    const locations = await prisma.location.findMany({
      where: {
        workspaceId: userRole.workspaceId,
      },
    });

    return NextResponse.json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const location = await prisma.location.create({
      data: {
        name,
        address,
        workspaceId,
      },
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error("Error creating location:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 