import { Hono, type Context } from "hono";
import { z } from "zod";
import { db } from "../../database";
import { sessionsTable } from "../../database/schema/schema";
import { eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";

const sessionsRoutes = new Hono();

const sessionSchema = z.object({
    id: z.number().int().positive().min(1),
    title: z.string(),
    description: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    compensation: z.string(),
});

const createSessionSchema = sessionSchema.omit({ id: true })

sessionsRoutes.get("/", async (c: Context) => {
    const sessions = await db.query.sessionsTable.findMany();
    return c.json(sessions)
});

sessionsRoutes.get("/:id{[0-9]+}", async (c: Context) => {
    const id = Number(c.req.param("id"));
    const session = await db.query.sessionsTable.findFirst({
        where: eq(sessionsTable.id, id)
    })
    if (!session) return c.json({ error: "Not Found" }, 404);
    return c.json(session);
});

sessionsRoutes.post("/", zValidator("json", createSessionSchema), async (c) => {
    const data = c.req.valid("json");
    const payload = c.get("jwtPayload")

    const [session] = await db.insert(sessionsTable).values({ ...data, devId: payload.id }).returning();
    return c.json(session, 201);
});

sessionsRoutes.delete("/:id{[0-9]+}", async (c: Context) => {
    const id = Number(c.req.param("id"));
    await db.delete(sessionsTable).where(eq(sessionsTable.id, id));
    return c.json({ success: true })
});

sessionsRoutes.patch("/:id{[0-9]+}", zValidator("json", createSessionSchema.partial()), async (c) => {
    const id = Number(c.req.param("id"))
    const data = c.req.valid("json")

    const [updated] = await db
        .update(sessionsTable)
        .set(data)
        .where(eq(sessionsTable.id, id))
        .returning();

    if (!updated) return c.json({ error: "Not found" }, 404);

    return c.json(updated)
});

export default sessionsRoutes;