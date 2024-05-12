import { usersTable } from "@/db/schema";
import { DrizzleClient } from "@/features/types/drizzle";
import { GoogleProfile } from "remix-auth-google";
import { eq } from "drizzle-orm";

export async function createUserIfNotExists(
  db: DrizzleClient,
  profile: GoogleProfile
) {
  let user = await db.query.usersTable.findFirst({
    where: eq(usersTable.providerId, profile.id),
  });
  if (user == null) {
    user = await db
      .insert(usersTable)
      .values({
        provider: profile.provider,
        providerId: profile.id,
        name: profile.displayName,
        icon: profile.photos[0].value,
      })
      .returning()
      .get();
  }

  return user;
}
