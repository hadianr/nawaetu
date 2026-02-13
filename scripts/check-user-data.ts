
import { db } from "@/db";
import { users, bookmarks, userCompletedMissions, dailyActivities, intentions } from "@/db/schema";
import { eq } from "drizzle-orm";

async function checkUserData() {
    const email = "dataplay98@gmail.com";
    console.log(`Checking data for email: ${email}`);

    const user = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (!user) {
        console.log("User not found.");
        return;
    }

    console.log("User Found:", user.id);
    console.log("User Settings:", JSON.stringify(user.settings, null, 2));

    const userBookmarks = await db.query.bookmarks.findMany({
        where: eq(bookmarks.userId, user.id),
    });
    console.log(`Bookmarks Count: ${userBookmarks.length}`);
    if (userBookmarks.length > 0) console.log("Sample Bookmark:", userBookmarks[0]);

    const userMissions = await db.query.userCompletedMissions.findMany({
        where: eq(userCompletedMissions.userId, user.id),
    });
    console.log(`Completed Missions Count: ${userMissions.length}`);
    if (userMissions.length > 0) console.log("Sample Mission:", userMissions[0]);

    const userIntentions = await db.query.intentions.findMany({
        where: eq(intentions.userId, user.id),
    });
    console.log(`Intentions Count: ${userIntentions.length}`);

    const userActivity = await db.query.dailyActivities.findMany({
        where: eq(dailyActivities.userId, user.id),
    });
    console.log(`Daily Activity Entries: ${userActivity.length}`);
    if (userActivity.length > 0) console.log("Sample Activity:", userActivity[0]);

    process.exit(0);
}

checkUserData().catch((err) => {
    console.error(err);
    process.exit(1);
});
