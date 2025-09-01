import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { comparePassword, generateToken, hashPassword } from "../../utils/auth";
import { usersTable } from "../../database/schema/schema";
import { db } from "../../database";
import { eq } from "drizzle-orm";

const authRoutes = new Hono();

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["dev", "tester"]).optional().default("tester")
})

const loginSchema = registerSchema.omit({ role: true });

authRoutes.post("/register", zValidator("json", registerSchema), async (c) => {
    const { email, password, role } = c.req.valid("json");
    const passwordHash = await hashPassword(password);

    const [user] = await db.insert(usersTable).values({ email, passwordHash, role }).returning();
    if (!user) return c.json({ error: "User not created" });

    return c.json({ id: user.id, email: user.email, role: user.role })
})

authRoutes.post("/login", zValidator("json", loginSchema), async (c) => {
    const { email, password } = c.req.valid("json");

    const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.email, email)
    })

    if (!user) return c.json({ error: "Invalid credentials" }, 401);

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) return c.json({ error: "Invalid credentials" }, 401);

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return c.json({ token })
})

export default authRoutes;