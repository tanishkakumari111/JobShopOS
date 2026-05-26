import { getPrismaClient } from "./prisma";

type PrismaClientLike = ReturnType<typeof getPrismaClient>;

export type PrismaTransaction = Omit<
  PrismaClientLike,
  "$connect" | "$disconnect" | "$on" | "$use" | "$extends"
> & {
  auditEvent: {
    findFirst(args: {
      orderBy: { id: "desc" };
      select: { id: true };
    }): Promise<{ id: number } | null>;
    create(args: {
      data: {
        id: number;
        timestamp: string;
        actor: string;
        role: string;
        action: string;
        entityType: string;
        entityId: string;
        result: string;
        notes: string;
        severity: string;
        metadata?: unknown;
      };
    }): Promise<unknown>;
  };
};
