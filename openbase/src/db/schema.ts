import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  jsonb,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Workspaces table
export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    icon: text("icon"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
);

// Pages table (documents)
export const pages = pgTable(
  "pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id"),
    title: text("title").notNull().default("Untitled"),
    icon: text("icon"),
    coverImage: text("cover_image"),
    isFavorite: boolean("is_favorite").default(false),
    isDeleted: boolean("is_deleted").default(false),
    deletedAt: timestamp("deleted_at"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    workspaceIdIdx: index("pages_workspace_id_idx").on(table.workspaceId),
    parentIdIdx: index("pages_parent_id_idx").on(table.parentId),
    isFavoriteIdx: index("pages_is_favorite_idx").on(table.isFavorite),
    isDeletedIdx: index("pages_is_deleted_idx").on(table.isDeleted),
  })
);

// Blocks table (content within pages)
export const blocks = pgTable(
  "blocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id"),
    type: text("type").notNull(),
    content: text("content").default(""),
    properties: jsonb("properties").default({}),
    order: integer("order").notNull().default(0),
    isCollapsed: boolean("is_collapsed").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    pageIdIdx: index("blocks_page_id_idx").on(table.pageId),
    parentIdIdx: index("blocks_parent_id_idx").on(table.parentId),
    orderIdx: index("blocks_order_idx").on(table.order),
  })
);

// Database tables (Notion-style databases)
export const databases = pgTable(
  "databases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    icon: text("icon"),
    view: text("view").notNull().default("table"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    pageIdIdx: index("databases_page_id_idx").on(table.pageId),
  })
);

// Database columns/properties
export const databaseColumns = pgTable(
  "database_columns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    databaseId: uuid("database_id")
      .notNull()
      .references(() => databases.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull(),
    options: jsonb("options").default([]),
    order: integer("order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    databaseIdIdx: index("database_columns_database_id_idx").on(
      table.databaseId
    ),
  })
);

// Database rows
export const databaseRows = pgTable(
  "database_rows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    databaseId: uuid("database_id")
      .notNull()
      .references(() => databases.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("Untitled"),
    icon: text("icon"),
    coverImage: text("cover_image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    databaseIdIdx: index("database_rows_database_id_idx").on(table.databaseId),
  })
);

// Database cell values
export const databaseCells = pgTable(
  "database_cells",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    rowId: uuid("row_id")
      .notNull()
      .references(() => databaseRows.id, { onDelete: "cascade" }),
    columnId: uuid("column_id")
      .notNull()
      .references(() => databaseColumns.id, { onDelete: "cascade" }),
    value: jsonb("value").default(null),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    rowIdIdx: index("database_cells_row_id_idx").on(table.rowId),
    columnIdIdx: index("database_cells_column_id_idx").on(table.columnId),
    uniqueCell: index("database_cells_unique").on(table.rowId, table.columnId),
  })
);

// Relations
export const workspacesRelations = relations(workspaces, ({ many }) => ({
  pages: many(pages),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [pages.workspaceId],
    references: [workspaces.id],
  }),
  blocks: many(blocks),
  databases: many(databases),
}));

export const blocksRelations = relations(blocks, ({ one }) => ({
  page: one(pages, {
    fields: [blocks.pageId],
    references: [pages.id],
  }),
}));

export const databasesRelations = relations(databases, ({ one, many }) => ({
  page: one(pages, {
    fields: [databases.pageId],
    references: [pages.id],
  }),
  columns: many(databaseColumns),
  rows: many(databaseRows),
}));

export const databaseColumnsRelations = relations(
  databaseColumns,
  ({ one, many }) => ({
    database: one(databases, {
      fields: [databaseColumns.databaseId],
      references: [databases.id],
    }),
    cells: many(databaseCells),
  })
);

export const databaseRowsRelations = relations(
  databaseRows,
  ({ one, many }) => ({
    database: one(databases, {
      fields: [databaseRows.databaseId],
      references: [databases.id],
    }),
    cells: many(databaseCells),
  })
);

export const databaseCellsRelations = relations(databaseCells, ({ one }) => ({
  row: one(databaseRows, {
    fields: [databaseCells.rowId],
    references: [databaseRows.id],
  }),
  column: one(databaseColumns, {
    fields: [databaseCells.columnId],
    references: [databaseColumns.id],
  }),
}));
