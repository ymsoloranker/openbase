import { NextResponse } from "next/server";
import { db } from "@/db";
import { workspaces } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const workspacesList = await db
      .select()
      .from(workspaces)
      .orderBy(desc(workspaces.createdAt))
      .limit(1);

    if (workspacesList.length === 0) {
      // Create default workspace
      const [newWorkspace] = await db
        .insert(workspaces)
        .values({
          name: "My Workspace",
          icon: "🚀",
        })
        .returning();

      return NextResponse.json({ workspace: newWorkspace });
    }

    return NextResponse.json({ workspace: workspacesList[0] });
  } catch (error) {
    console.error("Get workspace error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, icon } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 }
      );
    }

    const [updatedWorkspace] = await db
      .update(workspaces)
      .set({
        name: name || "My Workspace",
        icon: icon || "🚀",
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, id))
      .returning();

    return NextResponse.json({ workspace: updatedWorkspace });
  } catch (error) {
    console.error("Update workspace error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
