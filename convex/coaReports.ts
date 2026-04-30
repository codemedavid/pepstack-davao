import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { mapCoa } from "./lib";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("coaReports").collect();
    return all
      .sort((a, b) => (b.testDate > a.testDate ? 1 : -1))
      .map(mapCoa);
  },
});

const baseFields = {
  product_name: v.string(),
  batch: v.optional(v.string()),
  test_date: v.string(),
  purity_percentage: v.number(),
  quantity: v.string(),
  task_number: v.string(),
  verification_key: v.string(),
  image_url: v.string(),
  featured: v.optional(v.boolean()),
  manufacturer: v.optional(v.string()),
  laboratory: v.optional(v.string()),
};

export const create = mutation({
  args: baseFields,
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("coaReports", {
      productName: args.product_name,
      batch: args.batch ?? undefined,
      testDate: args.test_date,
      purityPercentage: args.purity_percentage,
      quantity: args.quantity,
      taskNumber: args.task_number,
      verificationKey: args.verification_key,
      imageUrl: args.image_url,
      featured: args.featured ?? false,
      manufacturer: args.manufacturer ?? undefined,
      laboratory: args.laboratory ?? undefined,
    });
    const doc = await ctx.db.get(id);
    return mapCoa(doc!);
  },
});

export const update = mutation({
  args: {
    id: v.id("coaReports"),
    product_name: v.optional(v.string()),
    batch: v.optional(v.string()),
    test_date: v.optional(v.string()),
    purity_percentage: v.optional(v.number()),
    quantity: v.optional(v.string()),
    task_number: v.optional(v.string()),
    verification_key: v.optional(v.string()),
    image_url: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    manufacturer: v.optional(v.string()),
    laboratory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {};
    if (args.product_name !== undefined) patch.productName = args.product_name;
    if (args.batch !== undefined) patch.batch = args.batch;
    if (args.test_date !== undefined) patch.testDate = args.test_date;
    if (args.purity_percentage !== undefined) patch.purityPercentage = args.purity_percentage;
    if (args.quantity !== undefined) patch.quantity = args.quantity;
    if (args.task_number !== undefined) patch.taskNumber = args.task_number;
    if (args.verification_key !== undefined) patch.verificationKey = args.verification_key;
    if (args.image_url !== undefined) patch.imageUrl = args.image_url;
    if (args.featured !== undefined) patch.featured = args.featured;
    if (args.manufacturer !== undefined) patch.manufacturer = args.manufacturer;
    if (args.laboratory !== undefined) patch.laboratory = args.laboratory;
    await ctx.db.patch(args.id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("coaReports") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
