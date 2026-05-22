import type { WorkCenter } from "./types";

export const workCenters: WorkCenter[] = [
  {
    id: "laser-cutting",
    name: "Laser Cutting",
    capacityHoursPerWeek: 40,
    queuedHoursPerWeek: 28,
    utilization: 70,
    status: "Available"
  },
  {
    id: "cnc-mill",
    name: "CNC Mill",
    capacityHoursPerWeek: 40,
    queuedHoursPerWeek: 24,
    utilization: 60,
    status: "Available"
  },
  {
    id: "press-brake",
    name: "Press Brake",
    capacityHoursPerWeek: 40,
    queuedHoursPerWeek: 52,
    utilization: 130,
    status: "Bottleneck"
  },
  {
    id: "welding",
    name: "Welding",
    capacityHoursPerWeek: 40,
    queuedHoursPerWeek: 34,
    utilization: 85,
    status: "Near Capacity"
  },
  {
    id: "paint-finish",
    name: "Paint / Finish",
    capacityHoursPerWeek: 40,
    queuedHoursPerWeek: 16,
    utilization: 40,
    status: "Available"
  },
  {
    id: "inspection",
    name: "Inspection",
    capacityHoursPerWeek: 40,
    queuedHoursPerWeek: 20,
    utilization: 50,
    status: "Available"
  },
  {
    id: "packing",
    name: "Packing",
    capacityHoursPerWeek: 40,
    queuedHoursPerWeek: 18,
    utilization: 45,
    status: "Available"
  }
];
