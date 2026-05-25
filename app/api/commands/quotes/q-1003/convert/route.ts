import { NextResponse } from "next/server";

import { convertQuoteToJobCommand } from "@/lib/commands/quote-commands";
import { buildAuthenticatedCommandContext, commandActorErrorResponse, getAuthenticatedCommandActor } from "@/lib/commands/authenticated-actor";
import { commandResultToHttpStatus, createDemoModeCommandResponse, getRequestIdempotencyKey } from "@/lib/commands/http";
import { getDataSourceMode } from "@/lib/data-source";

export const dynamic = "force-dynamic";

const FALLBACK_IDEMPOTENCY_KEY = "quote-Q-1003-convert-ui";
const ROUTE_KEY = "quote-conversion";

export async function POST(request: Request) {
  const dataSourceMode = getDataSourceMode();

  if (dataSourceMode !== "database") {
    return NextResponse.json(createDemoModeCommandResponse(), { status: 409 });
  }

  const idempotencyKey = getRequestIdempotencyKey(request, FALLBACK_IDEMPOTENCY_KEY);
  const actorResolution = getAuthenticatedCommandActor(request, ROUTE_KEY);

  if (!actorResolution.ok) {
    return commandActorErrorResponse(actorResolution);
  }

  const result = await convertQuoteToJobCommand(
    { quoteId: "Q-1003", jobId: "J-2104", workOrderId: "WO-2104" },
    buildAuthenticatedCommandContext(actorResolution.actor, idempotencyKey)
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
