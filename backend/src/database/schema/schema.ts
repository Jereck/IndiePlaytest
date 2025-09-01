import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["dev", "tester"])

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: varchar({ length: 255 }).notNull(),
  role: roleEnum().default("tester").notNull()
});

export const sessionsTable = pgTable("sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }),
  startTime: varchar({ length: 255 }).notNull(),
  endTime: varchar({ length: 255 }).notNull(),
  compensation: varchar({ length: 255 }).notNull(),

  devId: integer().references(() => usersTable.id, { onDelete: 'cascade' }).notNull()
});

// Session Participants (testers who join a session)
export const sessionParticipantTable = pgTable("session_participants", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sessionId: integer().references(() => sessionsTable.id, { onDelete: 'cascade' }).notNull(),
  testerId: integer().references(() => usersTable.id, { onDelete: 'cascade' })
});

export const sessionRelations = relations(sessionsTable, ({ one, many }) => ({
  dev: one(usersTable, {
    fields: [sessionsTable.devId],
    references: [usersTable.id]
  }),
  participants: many(sessionParticipantTable)
}))

export const userRelations = relations(usersTable, ({ many }) => ({
  sessions: many(sessionsTable),
  participants: many(sessionParticipantTable)
}))

export const sessionParticipantRelations = relations(sessionParticipantTable, ({ one }) => ({
  session: one(sessionsTable, {
    fields: [sessionParticipantTable.sessionId],
    references: [sessionsTable.id]
  }),
  testers: one(usersTable, {
    fields: [sessionParticipantTable.testerId],
    references: [usersTable.id]
  })
}))