import { db } from "@/db";
import {
  workspaces,
  pages,
  blocks,
  databases,
  databaseColumns,
  databaseRows,
  databaseCells,
} from "@/db/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Check if already seeded
  const existingWorkspaces = await db.select().from(workspaces).limit(1);
  if (existingWorkspaces.length > 0) {
    console.log("Database already seeded. Skipping...");
    return;
  }

  // Create default workspace
  const [workspace] = await db
    .insert(workspaces)
    .values({
      name: "My Workspace",
      icon: "🚀",
    })
    .returning();

  console.log("Created workspace:", workspace.name);

  // Create demo pages
  const welcomePage = await createPage(
    workspace.id,
    "Welcome to OpenBase",
    "👋",
    null
  );

  const gettingStartedPage = await createPage(
    workspace.id,
    "Getting Started",
    "📚",
    welcomePage.id
  );

  const featuresPage = await createPage(
    workspace.id,
    "Features Overview",
    "✨",
    welcomePage.id
  );

  const tasksPage = await createPage(
    workspace.id,
    "Task Database",
    "✅",
    null
  );

  const notesPage = await createPage(
    workspace.id,
    "Meeting Notes",
    "📝",
    null
  );

  const wikiPage = await createPage(
    workspace.id,
    "Team Wiki",
    "📖",
    null
  );

  // Add blocks to welcome page
  await db.insert(blocks).values([
    {
      pageId: welcomePage.id,
      type: "heading1",
      content: "Welcome to OpenBase! 🎉",
      order: 0,
    },
    {
      pageId: welcomePage.id,
      type: "paragraph",
      content:
        "This is a fully functional Notion alternative built with Next.js and PostgreSQL. Start exploring to see all the features!",
      order: 1,
    },
    {
      pageId: welcomePage.id,
      type: "callout",
      content:
        "💡 Tip: Use the sidebar to navigate between pages. You can create nested pages, add different block types, and even create databases!",
      properties: { color: "blue" },
      order: 2,
    },
    {
      pageId: welcomePage.id,
      type: "divider",
      content: "",
      order: 3,
    },
    {
      pageId: welcomePage.id,
      type: "heading2",
      content: "Quick Start Guide",
      order: 4,
    },
    {
      pageId: welcomePage.id,
      type: "bulletList",
      content: "Click on any page in the sidebar to view its content",
      order: 5,
    },
    {
      pageId: welcomePage.id,
      type: "bulletList",
      content: "Use / to insert new blocks",
      order: 6,
    },
    {
      pageId: welcomePage.id,
      type: "bulletList",
      content: "Drag blocks to reorder them",
      order: 7,
    },
    {
      pageId: welcomePage.id,
      type: "bulletList",
      content: "Create new pages with the + button",
      order: 8,
    },
    {
      pageId: welcomePage.id,
      type: "bulletList",
      content: "Star pages to add them to favorites",
      order: 9,
    },
  ]);

  // Add blocks to getting started page
  await db.insert(blocks).values([
    {
      pageId: gettingStartedPage.id,
      type: "heading1",
      content: "Getting Started",
      order: 0,
    },
    {
      pageId: gettingStartedPage.id,
      type: "paragraph",
      content:
        "Here's everything you need to know to get started with OpenBase.",
      order: 1,
    },
    {
      pageId: gettingStartedPage.id,
      type: "heading2",
      content: "Creating Pages",
      order: 2,
    },
    {
      pageId: gettingStartedPage.id,
      type: "paragraph",
      content:
        "Click the + button in the sidebar to create a new page. You can nest pages within other pages to create a hierarchy.",
      order: 3,
    },
    {
      pageId: gettingStartedPage.id,
      type: "heading2",
      content: "Working with Blocks",
      order: 4,
    },
    {
      pageId: gettingStartedPage.id,
      type: "paragraph",
      content:
        "Every piece of content in OpenBase is a block. You can have text, headings, lists, code blocks, and more.",
      order: 5,
    },
    {
      pageId: gettingStartedPage.id,
      type: "code",
      content:
        "// This is a code block\nfunction hello() {\n  console.log('Hello, World!');\n}",
      properties: { language: "javascript" },
      order: 6,
    },
    {
      pageId: gettingStartedPage.id,
      type: "heading2",
      content: "Keyboard Shortcuts",
      order: 7,
    },
    {
      pageId: gettingStartedPage.id,
      type: "bulletList",
      content: "/ - Open block menu",
      order: 8,
    },
    {
      pageId: gettingStartedPage.id,
      type: "bulletList",
      content: "Ctrl/Cmd + K - Quick find",
      order: 9,
    },
    {
      pageId: gettingStartedPage.id,
      type: "bulletList",
      content: "Ctrl/Cmd + Enter - Save page",
      order: 10,
    },
  ]);

  // Add blocks to features page
  await db.insert(blocks).values([
    {
      pageId: featuresPage.id,
      type: "heading1",
      content: "Features Overview",
      order: 0,
    },
    {
      pageId: featuresPage.id,
      type: "paragraph",
      content:
        "OpenBase comes packed with powerful features to help you organize your work.",
      order: 1,
    },
    {
      pageId: featuresPage.id,
      type: "callout",
      content:
        "🌟 All features are fully functional and backed by a PostgreSQL database!",
      properties: { color: "yellow" },
      order: 2,
    },
    {
      pageId: featuresPage.id,
      type: "heading2",
      content: "Core Features",
      order: 3,
    },
    {
      pageId: featuresPage.id,
      type: "checklist",
      content: "Rich text editing with multiple block types",
      properties: { checked: true },
      order: 4,
    },
    {
      pageId: featuresPage.id,
      type: "checklist",
      content: "Nested page hierarchy",
      properties: { checked: true },
      order: 5,
    },
    {
      pageId: featuresPage.id,
      type: "checklist",
      content: "Drag and drop block reordering",
      properties: { checked: true },
      order: 6,
    },
    {
      pageId: featuresPage.id,
      type: "checklist",
      content: "Database with multiple views",
      properties: { checked: true },
      order: 7,
    },
    {
      pageId: featuresPage.id,
      type: "checklist",
      content: "Favorites and quick access",
      properties: { checked: true },
      order: 8,
    },
    {
      pageId: featuresPage.id,
      type: "checklist",
      content: "Responsive design",
      properties: { checked: true },
      order: 9,
    },
  ]);

  // Create a database for tasks
  const [taskDatabase] = await db
    .insert(databases)
    .values({
      pageId: tasksPage.id,
      title: "Tasks",
      icon: "✅",
      view: "table",
    })
    .returning();

  // Create database columns
  const statusColumn = await db
    .insert(databaseColumns)
    .values({
      databaseId: taskDatabase.id,
      name: "Status",
      type: "select",
      options: [
        { value: "todo", label: "To Do", color: "gray" },
        { value: "in-progress", label: "In Progress", color: "blue" },
        { value: "done", label: "Done", color: "green" },
      ],
      order: 0,
    })
    .returning();

  const priorityColumn = await db
    .insert(databaseColumns)
    .values({
      databaseId: taskDatabase.id,
      name: "Priority",
      type: "select",
      options: [
        { value: "low", label: "Low", color: "gray" },
        { value: "medium", label: "Medium", color: "yellow" },
        { value: "high", label: "High", color: "red" },
      ],
      order: 1,
    })
    .returning();

  const dueDateColumn = await db
    .insert(databaseColumns)
    .values({
      databaseId: taskDatabase.id,
      name: "Due Date",
      type: "date",
      order: 2,
    })
    .returning();

  // Create database rows (tasks)
  const task1 = await db
    .insert(databaseRows)
    .values({
      databaseId: taskDatabase.id,
      title: "Set up project structure",
      icon: "🏗️",
    })
    .returning();

  const task2 = await db
    .insert(databaseRows)
    .values({
      databaseId: taskDatabase.id,
      title: "Design database schema",
      icon: "🗄️",
    })
    .returning();

  const task3 = await db
    .insert(databaseRows)
    .values({
      databaseId: taskDatabase.id,
      title: "Implement authentication",
      icon: "🔐",
    })
    .returning();

  const task4 = await db
    .insert(databaseRows)
    .values({
      databaseId: taskDatabase.id,
      title: "Build page editor",
      icon: "✏️",
    })
    .returning();

  const task5 = await db
    .insert(databaseRows)
    .values({
      databaseId: taskDatabase.id,
      title: "Create dashboard UI",
      icon: "🎨",
    })
    .returning();

  // Add cell values for tasks
  await db.insert(databaseCells).values([
    { rowId: task1[0].id, columnId: statusColumn[0].id, value: "done" },
    { rowId: task1[0].id, columnId: priorityColumn[0].id, value: "high" },
    { rowId: task2[0].id, columnId: statusColumn[0].id, value: "done" },
    { rowId: task2[0].id, columnId: priorityColumn[0].id, value: "high" },
    { rowId: task3[0].id, columnId: statusColumn[0].id, value: "done" },
    { rowId: task3[0].id, columnId: priorityColumn[0].id, value: "high" },
    { rowId: task4[0].id, columnId: statusColumn[0].id, value: "in-progress" },
    { rowId: task4[0].id, columnId: priorityColumn[0].id, value: "high" },
    { rowId: task5[0].id, columnId: statusColumn[0].id, value: "todo" },
    { rowId: task5[0].id, columnId: priorityColumn[0].id, value: "medium" },
  ]);

  // Add blocks to notes page
  await db.insert(blocks).values([
    {
      pageId: notesPage.id,
      type: "heading1",
      content: "Meeting Notes",
      order: 0,
    },
    {
      pageId: notesPage.id,
      type: "paragraph",
      content:
        "Keep track of all your meeting notes here. Create a new page for each meeting.",
      order: 1,
    },
    {
      pageId: notesPage.id,
      type: "heading2",
      content: "Weekly Standup - Dec 15, 2024",
      order: 2,
    },
    {
      pageId: notesPage.id,
      type: "bulletList",
      content: "Discussed project timeline and milestones",
      order: 3,
    },
    {
      pageId: notesPage.id,
      type: "bulletList",
      content: "Reviewed current sprint progress",
      order: 4,
    },
    {
      pageId: notesPage.id,
      type: "bulletList",
      content: "Assigned new tasks for next sprint",
      order: 5,
    },
    {
      pageId: notesPage.id,
      type: "heading3",
      content: "Action Items",
      order: 6,
    },
    {
      pageId: notesPage.id,
      type: "checklist",
      content: "Complete feature specifications",
      properties: { checked: true },
      order: 7,
    },
    {
      pageId: notesPage.id,
      type: "checklist",
      content: "Review pull requests",
      properties: { checked: false },
      order: 8,
    },
    {
      pageId: notesPage.id,
      type: "checklist",
      content: "Update documentation",
      properties: { checked: false },
      order: 9,
    },
  ]);

  // Add blocks to wiki page
  await db.insert(blocks).values([
    {
      pageId: wikiPage.id,
      type: "heading1",
      content: "Team Wiki",
      order: 0,
    },
    {
      pageId: wikiPage.id,
      type: "paragraph",
      content:
        "Central knowledge base for the team. Document processes, guidelines, and important information here.",
      order: 1,
    },
    {
      pageId: wikiPage.id,
      type: "divider",
      content: "",
      order: 2,
    },
    {
      pageId: wikiPage.id,
      type: "heading2",
      content: "Engineering Guidelines",
      order: 3,
    },
    {
      pageId: wikiPage.id,
      type: "paragraph",
      content:
        "Our team follows these engineering best practices to ensure code quality and consistency.",
      order: 4,
    },
    {
      pageId: wikiPage.id,
      type: "quote",
      content:
        "Code is read more often than it is written. Write code for humans, not just machines.",
      order: 5,
    },
    {
      pageId: wikiPage.id,
      type: "heading2",
      content: "Tech Stack",
      order: 6,
    },
    {
      pageId: wikiPage.id,
      type: "bulletList",
      content: "Frontend: Next.js, React, Tailwind CSS",
      order: 7,
    },
    {
      pageId: wikiPage.id,
      type: "bulletList",
      content: "Backend: Node.js, PostgreSQL",
      order: 8,
    },
    {
      pageId: wikiPage.id,
      type: "bulletList",
      content: "ORM: Drizzle",
      order: 9,
    },
  ]);

  // Mark welcome page as favorite
  await db
    .update(pages)
    .set({ isFavorite: true })
    .where(eq(pages.id, welcomePage.id));

  console.log("Database seeded successfully!");
}

async function createPage(
  workspaceId: string,
  title: string,
  icon: string | null,
  parentId: string | null
) {
  const [page] = await db
    .insert(pages)
    .values({
      workspaceId,
      parentId,
      title,
      icon,
    })
    .returning();
  return page;
}

// Run seed
seed()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
