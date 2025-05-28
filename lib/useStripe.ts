import { useClientAuthSession } from "@/app/dashboard/_components/client-layout";
import { Workspace } from "@prisma/client";
import { useState, useEffect } from "react";

export const useStripe = () => {
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [accountLinkCreatePending, setAccountLinkCreatePending] =
    useState(false);
  const [error, setError] = useState(false);
  const [connectedAccountId, setConnectedAccountId] = useState<string>();

  const handleCreateStripeAccount = async (workspace: Workspace) => {
    if (workspace) {
      try {
        if (workspace.stripeAccountId) {
          setConnectedAccountId(workspace.stripeAccountId);
          return;
        }

        setAccountCreatePending(true);
        setError(false);
        const res = await fetch("/api/stripe/create_account", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workspaceId: workspace.id,
            someData: "Hello",
          }),
        });

        const json = await res.json();
        setAccountCreatePending(false);

        const { account, error } = json;

        if (account) {
          setConnectedAccountId(account);
        }

        if (error) {
          setError(true);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getStripeLink = async () => {
    try {
      
      const res = await fetch("/api/stripe/create_link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: connectedAccountId,
        }),
      });

      const json = await res.json();
      const { url } = json;
      window.open(url, "_blank");
    } catch (error) {
      console.log(error);
    }
  };

  return {
    handleCreateStripeAccount,
    accountCreatePending,
    accountLinkCreatePending,
    connectedAccountId,
    getStripeLink,
  };
};
