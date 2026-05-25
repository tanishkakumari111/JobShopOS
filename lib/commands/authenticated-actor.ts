import { NextResponse } from "next/server";

import { getDataSourceMode } from "@/lib/data-source";

import {
  buildCommandContextFromActor,
  getCommandActorFromRequestHeaders,
  getTemporaryCommandActorForRoute,
  isCommandActorRole,
  normalizeCommandRole,
  type CommandActorContext,
  type CommandActorRequestResolution,
  type TemporaryCommandRouteKey
} from "./actor-context";

export type CommandActorResolution =
  | {
      ok: true;
      actor: CommandActorContext;
    }
  | {
      ok: false;
      status: 401 | 403;
      error: string;
    };

export type AuthenticatedActorCandidate = {
  actor: string;
  role: string;
};

const TEMPORARY_ROUTE_KEY_ALIASES: Record<string, TemporaryCommandRouteKey> = {
  "quote-approval": "quote-approval",
  "quote-conversion": "quote-conversion",
  "quality-scrap-approval": "quality-scrap-approval",
  "materials-purchase-request": "materials-purchase-request",
  "customer-report-generation": "customer-report-generation"
};

function resolveTemporaryRouteKey(routeKey: string): TemporaryCommandRouteKey | null {
  const normalized = routeKey.trim().toLowerCase();
  return TEMPORARY_ROUTE_KEY_ALIASES[normalized] ?? null;
}

function toForbiddenResolution(error: string): CommandActorResolution {
  return {
    ok: false,
    status: 403,
    error
  };
}

function toUnauthorizedResolution(error: string): CommandActorResolution {
  return {
    ok: false,
    status: 401,
    error
  };
}

export function resolveAuthenticatedActorFromRequest(request: Request): AuthenticatedActorCandidate | null {
  void request;
  return null;
}

function mapTemporaryHeaderResolution(
  resolution: CommandActorRequestResolution
): CommandActorResolution {
  if (resolution.ok) {
    return { ok: true, actor: resolution.actor };
  }

  return toForbiddenResolution(resolution.message);
}

export function getAuthenticatedCommandActor(request: Request, routeKey: string): CommandActorResolution {
  const temporaryRouteKey = resolveTemporaryRouteKey(routeKey);

  if (!temporaryRouteKey) {
    return toForbiddenResolution(`Unsupported command route key: ${routeKey}`);
  }

  if (getDataSourceMode() === "demo") {
    return { ok: true, actor: getTemporaryCommandActorForRoute(temporaryRouteKey) };
  }

  if (process.env.JOBSHOP_COMMAND_ACTOR_HEADER_ENABLED?.trim().toLowerCase() === "true") {
    const hasOverrideHeaders =
      request.headers.has("X-JobShop-Actor") || request.headers.has("X-JobShop-Role");

    if (hasOverrideHeaders) {
      return mapTemporaryHeaderResolution(
        getCommandActorFromRequestHeaders(request.headers, temporaryRouteKey)
      );
    }
  }

  const authenticatedActor = resolveAuthenticatedActorFromRequest(request);

  if (!authenticatedActor) {
    return toUnauthorizedResolution("Authentication is required for database-mode command routes.");
  }

  if (!authenticatedActor.actor.trim()) {
    return toUnauthorizedResolution("Authenticated actor is missing.");
  }

  if (!isCommandActorRole(authenticatedActor.role)) {
    return toForbiddenResolution(`Unsupported authenticated command actor role: ${authenticatedActor.role}`);
  }

  const normalizedRole = normalizeCommandRole(authenticatedActor.role);

  if (!normalizedRole) {
    return toForbiddenResolution(`Unsupported authenticated command actor role: ${authenticatedActor.role}`);
  }

  return {
    ok: true,
    actor: {
      actor: authenticatedActor.actor.trim(),
      role: normalizedRole
    }
  };
}

export function commandActorErrorResponse(resolution: Exclude<CommandActorResolution, { ok: true }>) {
  return NextResponse.json({ message: resolution.error }, { status: resolution.status });
}

export function buildAuthenticatedCommandContext(
  actor: CommandActorContext,
  idempotencyKey: string,
  now?: Date
) {
  return buildCommandContextFromActor({ ...actor, idempotencyKey, now });
}
