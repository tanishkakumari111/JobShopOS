import { isDatabaseMode } from "../data-source";
import { getPrismaClient } from "../db/prisma";
import { createDatabaseRepositories } from "./database";
import { createDemoRepositories } from "./demo";
import type { RepositorySet } from "./types";

export function getRepositories(): RepositorySet {
  if (isDatabaseMode()) {
    getPrismaClient();
    return createDatabaseRepositories();
  }

  return createDemoRepositories();
}

export type { RepositorySet } from "./types";
