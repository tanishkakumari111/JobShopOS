import "server-only";

import type { CommandContext, CommandResult } from "./types";

export type ApproveQuoteCommandInput = {
  quoteId: string;
};

export type ConvertQuoteToJobCommandInput = {
  quoteId: string;
};

type QuoteCommandResult = {
  quoteId: string;
};

export async function approveQuoteCommand(
  input: ApproveQuoteCommandInput,
  context: CommandContext
): Promise<CommandResult<QuoteCommandResult>> {
  throw new Error(`approveQuoteCommand is not implemented yet for ${input.quoteId} (${context.idempotencyKey}).`);
}

export async function convertQuoteToJobCommand(
  input: ConvertQuoteToJobCommandInput,
  context: CommandContext
): Promise<CommandResult<QuoteCommandResult>> {
  throw new Error(`convertQuoteToJobCommand is not implemented yet for ${input.quoteId} (${context.idempotencyKey}).`);
}
