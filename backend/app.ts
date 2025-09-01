import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import type { JwtVariables } from 'hono/jwt'

type Variables = JwtVariables
const app = new Hono();

app.use("*", logger());
app.use(cors());
app.use("/api/sessions/*", (c, next) => {
  const jwtMiddleware = jwt({ secret: process.env.JWT_SECRET!  })
  return jwtMiddleware(c, next)
})

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

import authRoutes from './src/features/auth/auth.routes';
import sessionsRoutes from './src/features/sessions/sessions.routes';

app.route("/api/auth", authRoutes);
app.route('/api/sessions', sessionsRoutes);

export default app;