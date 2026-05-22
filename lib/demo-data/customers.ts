import type { Customer, CustomerProfile } from "./types";

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

export const metrofabCustomerProfile: CustomerProfile = {
  slug: "metrofab-industries",
  name: "MetroFab Industries",
  accountContact: "Elena Morris",
  email: "elena.morris@metrofab.example",
  phone: "+1 555-0134",
  status: "Active",
  openJobs: 3,
  openQuotes: 1,
  onTimeDeliveryRate: 94,
  lastUpdated: "Today 11:18 AM",
  tabs: ["Open Jobs", "Quotes", "Shipments", "Status Reports", "Notes", "Audit"]
};
