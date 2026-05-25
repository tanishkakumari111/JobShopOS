import { NextResponse } from "next/server";

import { createPurchaseRequestCommand } from "@/lib/commands/material-commands";
import { commandResultToHttpStatus, createDemoModeCommandResponse, getRequestIdempotencyKey } from "@/lib/commands/http";
import type { CommandContext } from "@/lib/commands/types";
import { getDataSourceMode } from "@/lib/data-source";

export const dynamic = "force-dynamic";

const FALLBACK_IDEMPOTENCY_KEY = "materials-J-2099-create-purchase-request-ui";

function buildCommandContext(idempotencyKey: string): CommandContext {
  return {
    actor: "Priya Mehta",
    role: "Buyer",
    idempotencyKey,
    now: new Date(),
    dataSourceMode: "database"
  };
}

export async function POST(request: Request) {
  const dataSourceMode = getDataSourceMode();

  if (dataSourceMode !== "database") {
    return NextResponse.json(createDemoModeCommandResponse(), { status: 409 });
  }

  const idempotencyKey = getRequestIdempotencyKey(request, FALLBACK_IDEMPOTENCY_KEY);
  const result = await createPurchaseRequestCommand(
    {
      jobId: "J-2099",
      materialSku: "AL-6061-PLT-0.375",
      purchaseRequestId: "PR-3091",
      quantity: 50
    },
    buildCommandContext(idempotencyKey)
  );

  return NextResponse.json(result, { status: commandResultToHttpStatus(result) });
}

export async function GET() {
  return NextResponse.json(
    { message: "Method not allowed. Use POST." },
    {
      status: 405,
      headers: {
        Allow: "POST"
      }
    }
  );
}
