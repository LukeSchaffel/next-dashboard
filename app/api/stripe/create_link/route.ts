import { stripe } from "@/lib";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json();

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${request.headers.get("origin")}/refresh/${accountId}`,
      return_url: `${request.headers.get("origin")}/return/${accountId}`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error(
      "An error occurred when calling the Stripe API to create an account link:",
      error
    );

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
