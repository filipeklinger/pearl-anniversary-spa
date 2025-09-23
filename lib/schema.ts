import { pgTable, text, integer, boolean, timestamp, serial } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tabela de convites
export const invites = pgTable('invites', {
  id: serial('id').primaryKey(),
  nameOnInvite: text('name_on_invite').notNull(),
  ddi: text('ddi'), // código do país
  phone: text('phone'), // telefone para confirmação
  group: text('group'), // grupo do convite (Filhas, Amigos, etc.)
  observation: text('observation'), // observação do convite
  code: text('code'), // opcional - identificador único
  token: text('token').unique(), // token único para acesso seguro ao convite
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de convidados
export const guests = pgTable('guests', {
  id: serial('id').primaryKey(),
  inviteId: integer('invite_id').notNull().references(() => invites.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  gender: text('gender'), // M, F
  ageGroup: text('age_group'), // Adulto, Idoso, Criança, etc.
  costPayment: text('cost_payment'), // Inteira, Meia, Cortesia, etc.
  status: text('status'), // Confirmado, Pendente, Cancelado, etc.
  tableNumber: integer('table_number'), // número da mesa
  confirmed: boolean('confirmed').default(false),
  message: text('message'), // mensagem do convidado para o anfitrião
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de usuários admin
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de configurações do sistema
export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Definindo relações
export const invitesRelations = relations(invites, ({ many }) => ({
  guests: many(guests),
}));

export const guestsRelations = relations(guests, ({ one }) => ({
  invite: one(invites, {
    fields: [guests.inviteId],
    references: [invites.id],
  }),
}));

// Tipos TypeScript para as tabelas
export type Invite = typeof invites.$inferSelect;
export type NewInvite = typeof invites.$inferInsert;

export type Guest = typeof guests.$inferSelect;
export type NewGuest = typeof guests.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
