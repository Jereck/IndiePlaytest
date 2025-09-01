import { eq } from "drizzle-orm";
import { db } from "../../database";
import { sessionsTable } from "../../database/schema/schema";

export class SessionService {
    static async getAllSession() {
        return await db.select().from(sessionsTable);
    }
    static async getSession(id: number) {
        return await db.query.sessionsTable.findFirst({
            where: eq(sessionsTable.id, id)
        })
    }
    static async createSession(sessionData: Omit<typeof sessionsTable.$inferInsert, "id">) {
        const [session] = await db.insert(sessionsTable).values(sessionData).returning();
        return session;
    }
    static async deleteSession(id: number) {
        await db.delete(sessionsTable).where(eq(sessionsTable.id, id));
        return { success: true }
    }
}