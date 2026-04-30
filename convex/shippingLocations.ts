import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { mapShippingLocation } from "./lib";

export const list = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("shippingLocations").collect();
    const filtered = args.activeOnly ? all.filter((s) => s.isActive) : all;
    return filtered.sort((a, b) => a.orderIndex - b.orderIndex).map(mapShippingLocation);
  },
});

export const create = mutation({
  args: {
    code: v.string(),
    name: v.string(),
    fee: v.number(),
    is_active: v.optional(v.boolean()),
    order_index: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("shippingLocations")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
    if (existing) {
      throw new Error(`Shipping location with code "${args.code}" already exists.`);
    }
    const all = await ctx.db.query("shippingLocations").collect();
    const id = await ctx.db.insert("shippingLocations", {
      code: args.code,
      name: args.name,
      fee: args.fee,
      isActive: args.is_active ?? true,
      orderIndex: args.order_index ?? all.length + 1,
    });
    return id;
  },
});

export const update = mutation({
  args: {
    code: v.string(),
    name: v.optional(v.string()),
    fee: v.optional(v.number()),
    is_active: v.optional(v.boolean()),
    order_index: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("shippingLocations")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
    if (!existing) throw new Error(`Shipping location "${args.code}" not found.`);
    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.fee !== undefined) patch.fee = args.fee;
    if (args.is_active !== undefined) patch.isActive = args.is_active;
    if (args.order_index !== undefined) patch.orderIndex = args.order_index;
    await ctx.db.patch(existing._id, patch);
  },
});

export const remove = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("shippingLocations")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
    if (existing) await ctx.db.delete(existing._id);
  },
});
