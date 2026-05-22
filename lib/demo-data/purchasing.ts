import type { PurchaseRequest } from "./types";

export const purchaseRequests: PurchaseRequest[] = [
  {
    id: "PR-3091",
    materialSku: "AL-6061-PLT-0.375",
    linkedJobId: "J-2099",
    supplier: "Midwest Metals Supply",
    quantity: 50,
    unitCost: 185,
    estimatedTotal: 9250,
    buyer: "Priya Mehta",
    status: "Submitted",
    priority: "High"
  }
];
