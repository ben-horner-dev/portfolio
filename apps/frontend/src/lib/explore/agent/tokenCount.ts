"use server";

import { TOKEN_LIMIT } from "@/lib/constants";
import { upsertUser } from "@/lib/db/commands/upsertUser";
import { getUserByAuthId } from "@/lib/db/queries/getUser";
import type { User } from "@/lib/db/types";
import { getDb } from "@/lib/db/utils";
import { AgentGraphError } from "@/lib/explore/errors";

export type TokenCheckResult =
  | { success: true; user: User; isGuest?: boolean }
  | { success: false; error: string };

const GUEST_USER_ID = "guest";

const createGuestUser = (): User => ({
  id: "00000000-0000-0000-0000-000000000000",
  authId: GUEST_USER_ID,
  email: "guest@example.com",
  name: "Guest User",
  tokens: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const checkDailyTokenCount = async (
  userAuthId: string,
): Promise<TokenCheckResult> => {
  if (userAuthId === GUEST_USER_ID) {
    return { success: true, user: createGuestUser(), isGuest: true };
  }

  const uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new AgentGraphError("DATABASE_URL is not set");
  }
  const { db, close } = await getDb(uri);
  try {
    const user = await getUserByAuthId(userAuthId, db);
    if (!user) {
      throw new AgentGraphError(
        "User not found, only authenticated users can use the chat",
      );
    }
    if (user.tokens < TOKEN_LIMIT) {
      return { success: true, user };
    }
    const lastUpdated = user.updatedAt;
    const DAY_IN_MS = 24 * 60 * 60 * 1000;
    const isLastUpdatedMoreThan24HrsAgo =
      lastUpdated.getTime() < Date.now() - DAY_IN_MS;

    if (isLastUpdatedMoreThan24HrsAgo) {
      const updatedUser = await upsertUser({ ...user, tokens: 0 }, db);
      return { success: true, user: updatedUser };
    }

    const oneDayAfterLastUpdated = new Date(lastUpdated.getTime() + DAY_IN_MS);

    return {
      success: false,
      error: `You have reached the token limit for today: ${
        user.tokens
      }, please try again on ${oneDayAfterLastUpdated.toLocaleDateString()} at ${oneDayAfterLastUpdated.toLocaleTimeString()}`,
    };
  } finally {
    await close();
  }
};

export const updateTokenCount = async (
  user: User,
  tokens: number,
): Promise<User> => {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new AgentGraphError("DATABASE_URL is not set");
  }
  const { db, close } = await getDb(uri);
  try {
    const updatedUser = await upsertUser(
      { ...user, tokens: user.tokens + tokens },
      db,
    );
    return updatedUser;
  } finally {
    await close();
  }
};
