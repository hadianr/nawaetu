import { db } from "./src/db";
import { transactions } from "./src/db/schema";
import { desc } from "drizzle-orm";

async function main() {
    try {
        const txs = await db.query.transactions.findMany({
            orderBy: [desc(transactions.createdAt)],
            limit: 10
        });
        console.log(JSON.stringify(txs, null, 2));
    } catch (e) {
        console.error(e);
    }
}

main();
