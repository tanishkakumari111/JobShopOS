import "server-only";

import { getDataSourceMode } from "@/lib/data-source";
import { getRepositories } from "@/lib/repositories";
import {
  q1003ApprovalHistory,
  q1003ConversionRecord,
  q1003QuoteForm,
  quoteMaterialEstimateRows,
  quoteRoutingEstimateRows
} from "@/lib/demo-data";
import type {
  AuditEvent,
  Quote,
  QuoteApprovalHistoryEntry,
  QuoteApprovalQueueRow,
  QuoteConversionRecord,
  QuoteDashboardRow,
  QuoteFormSnapshot,
  QuoteMaterialEstimateRow,
  QuoteRoutingEstimateRow,
  QuoteSummary
} from "@/lib/demo-data/types";

export type QuotesDashboardReadModel = {
  dataSourceMode: ReturnType<typeof getDataSourceMode>;
  summary: QuoteSummary;
  quoteRows: QuoteDashboardRow[];
};

export type QuoteDetailReadModel = {
  dataSourceMode: ReturnType<typeof getDataSourceMode>;
  quoteId: string;
  quote: Quote | undefined;
  auditEvents: AuditEvent[];
  approvalHistory: QuoteApprovalHistoryEntry[];
  routingEstimateRows: QuoteRoutingEstimateRow[];
  materialEstimateRows: QuoteMaterialEstimateRow[];
  quoteForm: QuoteFormSnapshot | undefined;
  conversionRecord: QuoteConversionRecord | undefined;
};

export type ApprovalsReadModel = {
  dataSourceMode: ReturnType<typeof getDataSourceMode>;
  quotes: Quote[];
  summary: QuoteSummary;
  approvalQueueRows: QuoteApprovalQueueRow[];
};

function isQuoteDataFallbackError(error: unknown) {
  return error instanceof Error && error.message.includes("not implemented yet");
}

async function readWithFallback<T>(reader: Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await reader;
  } catch (error) {
    if (isQuoteDataFallbackError(error)) {
      return fallback();
    }

    throw error;
  }
}

function getQuoteDetailFallbackSections(quoteId: string) {
  if (quoteId !== "Q-1003") {
    return {
      approvalHistory: [] as QuoteApprovalHistoryEntry[],
      routingEstimateRows: [] as QuoteRoutingEstimateRow[],
      materialEstimateRows: [] as QuoteMaterialEstimateRow[],
      quoteForm: undefined as QuoteFormSnapshot | undefined,
      conversionRecord: undefined as QuoteConversionRecord | undefined
    };
  }

  return {
    approvalHistory: q1003ApprovalHistory,
    routingEstimateRows: quoteRoutingEstimateRows,
    materialEstimateRows: quoteMaterialEstimateRows,
    quoteForm: q1003QuoteForm,
    conversionRecord: q1003ConversionRecord
  };
}

export async function getQuotesDashboardReadModel(): Promise<QuotesDashboardReadModel> {
  const repositories = getRepositories();
  const [summary, quoteRows] = await Promise.all([
    repositories.quotes.getQuoteSummary(),
    repositories.quotes.getQuoteRows()
  ]);

  return {
    dataSourceMode: getDataSourceMode(),
    summary,
    quoteRows
  };
}

export async function getQuoteDetailReadModel(quoteId: string): Promise<QuoteDetailReadModel> {
  const repositories = getRepositories();
  const detailFallback = getQuoteDetailFallbackSections(quoteId);
  const [quote, auditEvents, approvalHistory, routingEstimateRows, materialEstimateRows, quoteForm, conversionRecord] =
    await Promise.all([
      repositories.quotes.getQuoteById(quoteId),
      repositories.audit.getAuditEvents(),
      readWithFallback(repositories.quotes.getApprovalHistory(quoteId), () => detailFallback.approvalHistory),
      readWithFallback(repositories.quotes.getQuoteRoutingEstimate(quoteId), () => detailFallback.routingEstimateRows),
      readWithFallback(repositories.quotes.getQuoteMaterialEstimate(quoteId), () => detailFallback.materialEstimateRows),
      readWithFallback(repositories.quotes.getQuoteForm(quoteId), () => detailFallback.quoteForm),
      readWithFallback(repositories.quotes.getConversionRecord(quoteId), () => detailFallback.conversionRecord)
    ]);

  return {
    dataSourceMode: getDataSourceMode(),
    quoteId,
    quote,
    auditEvents,
    approvalHistory,
    routingEstimateRows,
    materialEstimateRows,
    quoteForm,
    conversionRecord
  };
}

export async function getApprovalsReadModel(): Promise<ApprovalsReadModel> {
  const repositories = getRepositories();
  const [quotes, summary, approvalQueueRows] = await Promise.all([
    repositories.quotes.getQuotes(),
    repositories.quotes.getQuoteSummary(),
    repositories.quotes.getApprovalQueueRows()
  ]);

  return {
    dataSourceMode: getDataSourceMode(),
    quotes,
    summary,
    approvalQueueRows
  };
}
