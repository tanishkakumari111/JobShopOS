import type { CommandContext, IdempotencyKey } from "./types";

export type CommandActorRole =
  | "Owner / GM"
  | "Scheduler"
  | "Shop Supervisor"
  | "Buyer"
  | "Customer Service"
  | "Estimator"
  | "Operator"
  | "System"
  | "Automation";

export type CommandActorContext = {
  actor: string;
  role: CommandActorRole;
};

export type CommandActorRequestResolution =
  | {
      ok: true;
      actor: CommandActorContext;
    }
  | {
      ok: false;
      status: 400;
      message: string;
    };

export type TemporaryCommandRouteKey =
  | "quote-approval"
  | "quote-conversion"
  | "quality-scrap-approval"
  | "materials-purchase-request"
  | "customer-report-generation";

const COMMAND_ACTOR_ROLES = new Set<CommandActorRole>([
  "Owner / GM",
  "Scheduler",
  "Shop Supervisor",
  "Buyer",
  "Customer Service",
  "Estimator",
  "Operator",
  "System",
  "Automation"
]);

const TEMPORARY_ROUTE_ACTORS: Record<TemporaryCommandRouteKey, CommandActorContext> = {
  "quote-approval": {
    actor: "Owner / GM",
    role: "Owner / GM"
  },
  "quote-conversion": {
    actor: "Scheduler",
    role: "Scheduler"
  },
  "quality-scrap-approval": {
    actor: "Shop Supervisor",
    role: "Shop Supervisor"
  },
  "materials-purchase-request": {
    actor: "Priya Mehta",
    role: "Buyer"
  },
  "customer-report-generation": {
    actor: "Customer Service",
    role: "Customer Service"
  }
};

export function normalizeCommandRole(input: string): CommandActorRole | null {
  const trimmed = input.trim();

  if (COMMAND_ACTOR_ROLES.has(trimmed as CommandActorRole)) {
    return trimmed as CommandActorRole;
  }

  const normalized = trimmed.toLowerCase();

  switch (normalized) {
    case "owner / gm":
      return "Owner / GM";
    case "scheduler":
      return "Scheduler";
    case "shop supervisor":
      return "Shop Supervisor";
    case "buyer":
      return "Buyer";
    case "customer service":
      return "Customer Service";
    case "estimator":
      return "Estimator";
    case "operator":
      return "Operator";
    case "system":
      return "System";
    case "automation":
      return "Automation";
    default:
      return null;
  }
}

export function isCommandActorRole(input: string): input is CommandActorRole {
  return normalizeCommandRole(input) !== null;
}

export function buildCommandContextFromActor(input: CommandActorContext & { idempotencyKey: IdempotencyKey; now?: Date }): CommandContext {
  return {
    actor: input.actor.trim(),
    role: input.role,
    idempotencyKey: input.idempotencyKey,
    now: input.now ?? new Date()
  };
}

export function getTemporaryCommandActorForRoute(routeKey: TemporaryCommandRouteKey): CommandActorContext {
  return TEMPORARY_ROUTE_ACTORS[routeKey];
}

function isCommandActorHeaderOverrideEnabled() {
  return process.env.JOBSHOP_COMMAND_ACTOR_HEADER_ENABLED?.trim().toLowerCase() === "true";
}

export function getCommandActorFromRequestHeaders(
  headers: Pick<Headers, "get">,
  fallbackRouteKey: TemporaryCommandRouteKey
): CommandActorRequestResolution {
  const fallback = getTemporaryCommandActorForRoute(fallbackRouteKey);

  if (!isCommandActorHeaderOverrideEnabled()) {
    return { ok: true, actor: fallback };
  }

  const headerActor = headers.get("X-JobShop-Actor")?.trim() ?? "";
  const headerRole = headers.get("X-JobShop-Role")?.trim() ?? "";

  if (!headerActor && !headerRole) {
    return { ok: true, actor: fallback };
  }

  if (!headerActor || !headerRole) {
    return {
      ok: false,
      status: 400,
      message: "X-JobShop-Actor and X-JobShop-Role headers must both be provided when actor override is enabled."
    };
  }

  if (!headerActor.trim()) {
    return {
      ok: false,
      status: 400,
      message: "X-JobShop-Actor must not be empty when actor override is enabled."
    };
  }

  const role = normalizeCommandRole(headerRole);

  if (!role) {
    return {
      ok: false,
      status: 400,
      message: `Unsupported command actor role: ${headerRole}`
    };
  }

  return {
    ok: true,
    actor: {
      actor: headerActor,
      role
    }
  };
}
