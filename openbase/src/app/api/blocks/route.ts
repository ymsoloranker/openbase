import { NextResponse } from "next/server";
import { db } from "@/db";
import { blocks, pages } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const createBlockSchema = z.object({
  pageId: z.string().uuid(),
  type: z.enum([
    "paragraph",
    "heading1",
    "heading2",
    "heading3",
    "bulletList",
    "numberedList",
    "checklist",
    "quote",
    "code",
    "divider",
    "callout",
    "image",
    "table",
    "toggle",
    "bookmark",
  ]),
  content: z.string().optional(),
  properties: z.any().optional(),
  order: z.number().optional(),
  parentId: z.string().uuid().nullable().optional(),
});

const updateBlocksOrderSchema = z.array(
  z.object({
    id: z.string().uuid(),
    order: z.number(),
  })
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = createBlockSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { pageId, type, content, properties, order, parentId } = result.data;

    // Verify page exists
    const [page] = await db
      .select()
      .from(pages)
      .where(eq(pages.id, pageId))
      .limit(1);

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Get max order if not provided
    let finalOrder = order;
    if (finalOrder === undefined) {
      const maxOrderBlock = await db
        .select({ order: blocks.order })
        .from(blocks)
        .where(eq(blocks.pageId, pageId))
        .orderBy(blocks.order)
        .limit(1);

      finalOrder = maxOrderBlock.length > 0 ? maxOrderBlock[0].order + 1 : 0;
    }

    const [newBlock] = await db
      .insert(blocks)
      .values({
        pageId,
        type,
        content: content || "",
        properties: properties || {},
        order: finalOrder,
        parentId: parentId || null,
      })
      .returning();

    return NextResponse.json(newBlock);
  } catch (error) {
    console.error("Create block error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Check if it's a reorder operation
    if (Array.isArray(body)) {
      const result = updateBlocksOrderSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          { error: "Invalid input", details: result.error.flatten() },
          { status: 400 }
        );
      }

      // Update order for each block
      const updates = result.data.map((item) =>
        db
          .update(blocks)
          .set({ order: item.order, updatedAt: new Date() })
          .where(eq(blocks.id, item.id))
      );

      await Promise.all(updates);

      return NextResponse.json({ success: true });
    }

    // Single block update
    const { id, content, properties, isCollapsed } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Block ID is required" },
        { status: 400 }
      );
    }

    const [updatedBlock] = await db
      .update(blocks)
      .set({
        ...(content !== undefined && { content }),
        ...(properties !== undefined && { properties }),
        ...(isCollapsed !== undefined && { isCollapsed }),
        updatedAt: new Date(),
      })
      .where(eq(blocks.id, id))
      .returning();

    return NextResponse.json(updatedBlock);
  } catch (error) {
    console.error("Update blocks error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Block ID is required" },
        { status: 400 }
      );
    }

    await db.delete(blocks).where(eq(blocks.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete block error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
