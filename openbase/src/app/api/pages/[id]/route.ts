import { NextResponse } from "next/server";
import { db } from "@/db";
import { pages, blocks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const updatePageSchema = z.object({
  title: z.string().optional(),
  icon: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  isFavorite: z.boolean().optional(),
  parentId: z.string().uuid().nullable().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [page] = await db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.id, id),
          eq(pages.isDeleted, false)
        )
      )
      .limit(1);

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Get blocks for this page
    const pageBlocks = await db
      .select()
      .from(blocks)
      .where(eq(blocks.pageId, id))
      .orderBy(blocks.order);

    // Get child pages
    const childPages = await db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.parentId, id),
          eq(pages.isDeleted, false)
        )
      )
      .orderBy(pages.createdAt);

    return NextResponse.json({
      ...page,
      blocks: pageBlocks,
      children: childPages,
    });
  } catch (error) {
    console.error("Get page error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = updatePageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Verify page exists
    const [existingPage] = await db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.id, id),
          eq(pages.isDeleted, false)
        )
      )
      .limit(1);

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const [updatedPage] = await db
      .update(pages)
      .set({
        ...result.data,
        updatedAt: new Date(),
      })
      .where(eq(pages.id, id))
      .returning();

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error("Update page error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify page exists
    const [existingPage] = await db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.id, id),
          eq(pages.isDeleted, false)
        )
      )
      .limit(1);

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Soft delete
    await db
      .update(pages)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(pages.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete page error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
