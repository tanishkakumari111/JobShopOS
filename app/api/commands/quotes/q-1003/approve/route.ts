import { NextResponse } from "next/server";

import { approveQuoteCommand } from "@/lib/commands/quote-commands";
import { commandResultToHttpStatus, createDemoModeCommandResponse, getRequestIdempotencyKey } from "@/lib/commands/http";
import type { CommandContext } from "@/lib/commands/types";
import { getDataSourceMode } from "@/lib/data-source";

export const dynamic = "force-dynamic";

const FALLBACK_IDEMPOTENCY_KEY = "quote-Q-1003-approve-ui";

function buildCommandContext(idempotencyKey: string): CommandContext {
  return {
    actor: "Owner / GM",
    role: "Owner / GM",
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
  const result = await approveQuoteCommand({ quoteId: "Q-1003" }, buildCommandContext(idempotencyKey));

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
