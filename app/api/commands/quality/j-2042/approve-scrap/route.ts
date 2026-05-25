import { NextResponse } from "next/server";

import { approveScrapAndCreateReworkCommand } from "@/lib/commands/quality-commands";
import { commandResultToHttpStatus, createDemoModeCommandResponse, getRequestIdempotencyKey } from "@/lib/commands/http";
import type { CommandContext } from "@/lib/commands/types";
import { getDataSourceMode } from "@/lib/data-source";

export const dynamic = "force-dynamic";

const FALLBACK_IDEMPOTENCY_KEY = "quality-J-2042-approve-scrap-ui";

function buildCommandContext(idempotencyKey: string): CommandContext {
  return {
    actor: "Shop Supervisor",
    role: "Shop Supervisor",
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
  const result = await approveScrapAndCreateReworkCommand(
    {
      jobId: "J-2042",
      reworkOrderId: "RW-2042-01"
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
