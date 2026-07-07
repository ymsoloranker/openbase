import { NextResponse } from "next/server";
import { db } from "@/db";
import { pages, blocks, workspaces } from "@/db/schema";
import { eq, and, isNull, desc, inArray } from "drizzle-orm";
import { z } from "zod";

const createPageSchema = z.object({
  title: z.string().optional(),
  icon: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  workspaceId: z.string().uuid(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const parentId = searchParams.get("parentId");
    const favorites = searchParams.get("favorites");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    const conditions = [
      eq(pages.workspaceId, workspaceId),
      eq(pages.isDeleted, false),
    ];

    if (parentId !== null) {
      if (parentId) {
        conditions.push(eq(pages.parentId, parentId));
      } else {
        conditions.push(isNull(pages.parentId));
      }
    }

    if (favorites === "true") {
      conditions.push(eq(pages.isFavorite, true));
    }

    const allPages = await db
      .select()
      .from(pages)
      .where(and(...conditions))
      .orderBy(desc(pages.updatedAt));

    return NextResponse.json(allPages);
  } catch (error) {
    console.error("Get pages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = createPageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { title, icon, coverImage, parentId, workspaceId } = result.data;

    const [newPage] = await db
      .insert(pages)
      .values({
        title: title || "Untitled",
        icon,
        coverImage,
        parentId: parentId || null,
        workspaceId,
      })
      .returning();

    // Create initial paragraph block
    await db.insert(blocks).values({
      pageId: newPage.id,
      type: "paragraph",
      content: "",
      order: 0,
    });

    return NextResponse.json(newPage);
  } catch (error) {
    console.error("Create page error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
