import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const {
      name,
      address,
      description,
      phoneNumber,
      email,
      website,
      facebookUrl,
      instagramUrl,
      twitterUrl,
      linkedinUrl,
    } = await request.json();
    const { workspaceId } = await getAuthSession();

    const location = await prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    if (location.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedLocation = await prisma.location.update({
      where: { id },
      data: {
        name: name || location.name,
        address: address || location.address,
        description: description || location.description,
        phoneNumber: phoneNumber || location.phoneNumber,
        email: email || location.email,
        website: website || location.website,
        facebookUrl: facebookUrl || location.facebookUrl,
        instagramUrl: instagramUrl || location.instagramUrl,
        twitterUrl: twitterUrl || location.twitterUrl,
        linkedinUrl: linkedinUrl || location.linkedinUrl,
      },
    });

    return NextResponse.json(updatedLocation, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update location" },
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

    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        Events: true,
      },
    });

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    if (location.Events?.length > 0) {
      return NextResponse.json(
        { error: "A location with existing events can not be deleted" },
        { status: 400 }
      );
    }

    if (location.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.location.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete location" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { workspaceId } = await getAuthSession();

    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        Events: {
          orderBy: {
            startsAt: "asc",
          },
        },
        templateLayout: true,
      },
    });

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    if (location.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(location, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 }
    );
  }
}
