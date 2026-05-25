import { NextResponse } from "next/server";

import { generateCustomerStatusReportCommand } from "@/lib/commands/report-commands";
import { buildAuthenticatedCommandContext, commandActorErrorResponse, getAuthenticatedCommandActor } from "@/lib/commands/authenticated-actor";
import { commandResultToHttpStatus, createDemoModeCommandResponse, getRequestIdempotencyKey } from "@/lib/commands/http";
import { getDataSourceMode } from "@/lib/data-source";

export const dynamic = "force-dynamic";

const FALLBACK_IDEMPOTENCY_KEY = "reports-J-2035-generate-customer-status-ui";
const ROUTE_KEY = "customer-report-generation";

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

  const result = await generateCustomerStatusReportCommand(
    {
      jobId: "J-2035",
      customerSlug: "metrofab-industries",
      reportId: "REPORT-J-2035-STATUS"
    },
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
