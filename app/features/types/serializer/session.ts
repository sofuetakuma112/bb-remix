import { InferSelectModel } from "drizzle-orm";
import { usersTable, sessionsTable } from "@/db/schema";

export type Session = {
  sessionToken: InferSelectModel<typeof sessionsTable>["sessionToken"];
  userId: InferSelectModel<typeof sessionsTable>["userId"];
  expires: string;
  user: Omit<
    InferSelectModel<typeof usersTable>,
    "emailVerified" | "createdAt" | "updatedAt"
  > & {
    emailVerified: string | null;
    createdAt: string;
    updatedAt: string;
  };
};
