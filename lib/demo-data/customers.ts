import type { Customer } from "./types";

export const customers: Customer[] = [
  {
    slug: "metrofab-industries",
    name: "MetroFab Industries",
    shortName: "MetroFab",
    status: "Active",
    primaryContact: "Jordan Ellis",
    city: "Cleveland",
    state: "OH"
  },
  {
    slug: "northline-fabrication",
    name: "Northline Fabrication",
    shortName: "Northline",
    status: "Active",
    primaryContact: "Maya Chen",
    city: "Columbus",
    state: "OH"
  },
  {
    slug: "apex-rail-components",
    name: "Apex Rail Components",
    shortName: "Apex Rail",
    status: "Active",
    primaryContact: "Darren Patel",
    city: "Pittsburgh",
    state: "PA"
  },
  {
    slug: "kepler-machine-works",
    name: "Kepler Machine Works",
    shortName: "Kepler",
    status: "Active",
    primaryContact: "Nina Alvarez",
    city: "Detroit",
    state: "MI"
  },
  {
    slug: "delta-signworks",
    name: "Delta Signworks",
    shortName: "Delta",
    status: "Prospect",
    primaryContact: "Owen Brooks",
    city: "Indianapolis",
    state: "IN"
  }
];
