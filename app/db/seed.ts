import { drizzle } from "drizzle-orm/d1";
import { faker } from "@faker-js/faker";
import {
  usersTable,
  postsTable,
  likesTable,
  followsTable,
  notificationsTable,
} from "./schema";
import { v4 as uuidv4 } from "uuid";

interface Env {
  DB: D1Database;
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  async fetch(
    request: Request,
    env: Env
    // ctx: ExecutionContext
  ): Promise<Response> {
    const db = drizzle(env.DB);

    // ユーザーデータの作成
    const userData: (typeof usersTable.$inferInsert)[] = [];
    for (let i = 0; i < 20; i++) {
      userData.push({
        name: faker.person.fullName(),
        icon: faker.image.avatar(),
        imageS3Key: faker.image.avatar(),
        provider: "google",
        providerId: uuidv4(),
      });
    }
    await Promise.all(
      userData.map((data) => db.insert(usersTable).values(data))
    );

    // 投稿データの作成
    const postData: (typeof postsTable.$inferInsert)[] = [];
    const userIds = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .all();
    for (let i = 0; i < 50; i++) {
      const userId = faker.helpers.arrayElement(userIds).id;
      postData.push({
        prompt: faker.lorem.sentence(),
        imageS3Key: "https://100k-faces.glitch.me/random-image",
        imageName: faker.system.fileName(),
        imageAge: faker.number.int({ min: 1, max: 100 }).toString(),
        imageBirthplace: faker.location.country(),
        analysisResult: true,
        userId,
      });
    }
    await Promise.all(
      postData.map((data) => db.insert(postsTable).values(data))
    );

    // いいねデータの作成
    const likeData: (typeof likesTable.$inferInsert)[] = [];
    const postIds = await db
      .select({ id: postsTable.id })
      .from(postsTable)
      .all();
    for (let i = 0; i < 100; i++) {
      const userId = faker.helpers.arrayElement(userIds).id;
      const postId = faker.helpers.arrayElement(postIds).id;
      likeData.push({
        likeType: faker.helpers.arrayElement(["like", "super_like", "unlike"]),
        userId,
        postId,
      });
    }

    await Promise.all(
      likeData.map((data) => db.insert(likesTable).values(data))
    );

    // フォローデータの作成
    const followData: (typeof followsTable.$inferInsert)[] = [];
    for (let i = 0; i < 50; i++) {
      const followerId = faker.helpers.arrayElement(userIds).id;
      const followeeId = faker.helpers.arrayElement(userIds).id;
      if (followerId !== followeeId) {
        followData.push({
          followerId,
          followeeId,
        });
      }
    }
    await db.insert(followsTable).values(followData);

    // 通知データの作成

    const notificationData: (typeof notificationsTable.$inferInsert)[] = [];
    for (let i = 0; i < 200; i++) {
      const userId = faker.helpers.arrayElement(userIds).id;
      const notifierUserId = faker.helpers.arrayElement(userIds).id;
      const postId =
        Math.random() < 0.8
          ? faker.helpers.arrayElement(postIds).id
          : undefined;

      if (userId !== notifierUserId) {
        notificationData.push({
          notificationType: faker.helpers.arrayElement([
            "like",
            "super_like",
            "follow",
          ]),
          userId,
          notifierUserId,
          postId,
        });
      }
    }

    await Promise.all(
      notificationData.map((data) => db.insert(notificationsTable).values(data))
    );

    return Response.json({
      message: "Seed done",
    });
  },
};
