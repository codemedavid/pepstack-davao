import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { mapPromoCode } from "./lib";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("promoCodes").collect();
    return all
      .sort((a, b) => b._creationTime - a._creationTime)
      .map(mapPromoCode);
  },
});

export const findByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("promoCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
    return doc ? mapPromoCode(doc) : null;
  },
});

const baseFields = {
  code: v.string(),
  discount_type: v.union(v.literal("percentage"), v.literal("fixed")),
  discount_value: v.number(),
  min_purchase_amount: v.optional(v.number()),
  max_discount_amount: v.optional(v.union(v.number(), v.null())),
  start_date: v.optional(v.union(v.string(), v.null())),
  end_date: v.optional(v.union(v.string(), v.null())),
  usage_limit: v.optional(v.union(v.number(), v.null())),
  active: v.optional(v.boolean()),
};

const toMs = (s: string | null | undefined) =>
  s ? new Date(s).getTime() : undefined;

export const create = mutation({
  args: baseFields,
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("promoCodes", {
      code: args.code.toUpperCase(),
      discountType: args.discount_type,
      discountValue: args.discount_value,
      minPurchaseAmount: args.min_purchase_amount ?? 0,
      maxDiscountAmount: args.max_discount_amount ?? undefined,
      startDate: toMs(args.start_date),
      endDate: toMs(args.end_date),
      usageLimit: args.usage_limit ?? undefined,
      usageCount: 0,
      active: args.active ?? true,
    });
    const doc = await ctx.db.get(id);
    return mapPromoCode(doc!);
  },
});

export const update = mutation({
  args: {
    id: v.id("promoCodes"),
    code: v.optional(v.string()),
    discount_type: v.optional(v.union(v.literal("percentage"), v.literal("fixed"))),
    discount_value: v.optional(v.number()),
    min_purchase_amount: v.optional(v.number()),
    max_discount_amount: v.optional(v.union(v.number(), v.null())),
    start_date: v.optional(v.union(v.string(), v.null())),
    end_date: v.optional(v.union(v.string(), v.null())),
    usage_limit: v.optional(v.union(v.number(), v.null())),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {};
    if (args.code !== undefined) patch.code = args.code.toUpperCase();
    if (args.discount_type !== undefined) patch.discountType = args.discount_type;
    if (args.discount_value !== undefined) patch.discountValue = args.discount_value;
    if (args.min_purchase_amount !== undefined) patch.minPurchaseAmount = args.min_purchase_amount;
    if (args.max_discount_amount !== undefined)
      patch.maxDiscountAmount = args.max_discount_amount ?? undefined;
    if (args.start_date !== undefined) patch.startDate = toMs(args.start_date);
    if (args.end_date !== undefined) patch.endDate = toMs(args.end_date);
    if (args.usage_limit !== undefined) patch.usageLimit = args.usage_limit ?? undefined;
    if (args.active !== undefined) patch.active = args.active;
    await ctx.db.patch(args.id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("promoCodes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const incrementUsage = mutation({
  args: { id: v.id("promoCodes") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) return;
    await ctx.db.patch(args.id, { usageCount: doc.usageCount + 1 });
  },
});
