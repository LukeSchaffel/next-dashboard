import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { workspaceId } = await request.json();
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required and must be a string" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Invalid workspace" }, { status: 400 });
    }

    if (workspace.stripeAccountId) {
      return NextResponse.json(
        { stripeAccountId: workspace.stripeAccountId },
        { status: 200 }
      );
    }

    const account = await stripe.accounts.create({});

    await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        stripeAccountId: account.id,
      },
    });

    return NextResponse.json({ account: account.id });
  } catch (error) {
    console.error(
      "An error occurred when calling the Stripe API to create an account:",
      error
    );

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
