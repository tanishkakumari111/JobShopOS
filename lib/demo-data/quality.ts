import { calculateScrapRate } from "./helpers";
import type { ReworkOrder } from "./types";

export const reworkOrders: ReworkOrder[] = [
  {
    id: "RW-2042-01",
    linkedJobId: "J-2042",
    reason: "Weld Porosity",
    workCenter: "Welding",
    estimatedHours: 6,
    priority: "High",
    status: "Open",
    supervisor: "Dana Brooks"
  }
];

export const qualityRecords = [
  {
    jobId: "J-2042",
    inspectionStatus: "Scrap Approval Required",
    scrapRate: calculateScrapRate(18, 180),
    allowedTolerance: 0.05,
    disposition: "Awaiting owner approval"
  }
];
