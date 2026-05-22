import { calculateMaterialAvailability, calculateMaterialShortage } from "./helpers";
import type { Material } from "./types";

export const materials: Material[] = [
  {
    sku: "AL-6061-PLT-0.375",
    name: "Aluminum Plate 6061, 3/8 inch",
    requiredForJobId: "J-2099",
    requiredSheets: 48,
    onHand: 12,
    reserved: 8,
    available: calculateMaterialAvailability(12, 8),
    shortage: calculateMaterialShortage(48, calculateMaterialAvailability(12, 8)),
    supplier: "Midwest Metals Supply",
    leadTimeBusinessDays: 3,
    lastPurchasePrice: 185,
    suggestedOrderQuantity: 50
  }
];
