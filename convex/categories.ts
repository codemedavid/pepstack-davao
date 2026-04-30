import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { mapCategory } from "./lib";

export const list = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("categories").collect();
    const filtered = args.activeOnly ? all.filter((c) => c.active) : all;
    return filtered
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(mapCategory);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    icon: v.string(),
    sort_order: v.number(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("categories", {
      name: args.name,
      icon: args.icon,
      sortOrder: args.sort_order,
      active: args.active,
    });
    const doc = await ctx.db.get(id);
    return mapCategory(doc!);
  },
});

export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    icon: v.optional(v.string()),
    sort_order: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.icon !== undefined) patch.icon = args.icon;
    if (args.sort_order !== undefined) patch.sortOrder = args.sort_order;
    if (args.active !== undefined) patch.active = args.active;
    await ctx.db.patch(args.id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", args.id))
      .first();
    if (products) {
      throw new Error(
        "Cannot delete category that contains products. Please move or delete the products first.",
      );
    }
    await ctx.db.delete(args.id);
  },
});

export const reorder = mutation({
  args: { orderedIds: v.array(v.id("categories")) },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.orderedIds.length; i++) {
      await ctx.db.patch(args.orderedIds[i], { sortOrder: i + 1 });
    }
  },
});

export const productCounts = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const counts: Record<string, number> = {};
    for (const p of products) {
      const key = p.categoryId as string;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  },
});
