import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { mapCourier } from "./lib";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("couriers").collect();
    return all
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map(mapCourier);
  },
});

export const create = mutation({
  args: {
    code: v.string(),
    name: v.string(),
    tracking_url_template: v.optional(v.union(v.string(), v.null())),
    is_active: v.optional(v.boolean()),
    sort_order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("couriers", {
      code: args.code,
      name: args.name,
      trackingUrlTemplate: args.tracking_url_template ?? undefined,
      isActive: args.is_active ?? true,
      sortOrder: args.sort_order ?? 0,
    });
    const doc = await ctx.db.get(id);
    return mapCourier(doc!);
  },
});

export const update = mutation({
  args: {
    id: v.id("couriers"),
    code: v.optional(v.string()),
    name: v.optional(v.string()),
    tracking_url_template: v.optional(v.union(v.string(), v.null())),
    is_active: v.optional(v.boolean()),
    sort_order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {};
    if (args.code !== undefined) patch.code = args.code;
    if (args.name !== undefined) patch.name = args.name;
    if (args.tracking_url_template !== undefined)
      patch.trackingUrlTemplate = args.tracking_url_template ?? undefined;
    if (args.is_active !== undefined) patch.isActive = args.is_active;
    if (args.sort_order !== undefined) patch.sortOrder = args.sort_order;
    await ctx.db.patch(args.id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("couriers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
