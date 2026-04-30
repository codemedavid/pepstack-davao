import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { mapProtocol } from "./lib";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("protocols").collect();
    return all.sort((a, b) => a.sortOrder - b.sortOrder).map(mapProtocol);
  },
});

const baseFields = {
  name: v.string(),
  category: v.string(),
  dosage: v.string(),
  frequency: v.string(),
  duration: v.string(),
  notes: v.array(v.string()),
  storage: v.string(),
  sort_order: v.number(),
  active: v.boolean(),
  product_id: v.optional(v.union(v.id("products"), v.null())),
  image_url: v.optional(v.union(v.string(), v.null())),
  content_type: v.optional(v.string()),
  file_url: v.optional(v.union(v.string(), v.null())),
};

export const create = mutation({
  args: baseFields,
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("protocols", {
      name: args.name,
      category: args.category,
      dosage: args.dosage,
      frequency: args.frequency,
      duration: args.duration,
      notes: args.notes,
      storage: args.storage,
      sortOrder: args.sort_order,
      active: args.active,
      productId: args.product_id ?? undefined,
      imageUrl: args.image_url ?? undefined,
      contentType: args.content_type ?? "text",
      fileUrl: args.file_url ?? undefined,
    });
    const doc = await ctx.db.get(id);
    return mapProtocol(doc!);
  },
});

export const update = mutation({
  args: {
    id: v.id("protocols"),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    dosage: v.optional(v.string()),
    frequency: v.optional(v.string()),
    duration: v.optional(v.string()),
    notes: v.optional(v.array(v.string())),
    storage: v.optional(v.string()),
    sort_order: v.optional(v.number()),
    active: v.optional(v.boolean()),
    product_id: v.optional(v.union(v.id("products"), v.null())),
    image_url: v.optional(v.union(v.string(), v.null())),
    content_type: v.optional(v.string()),
    file_url: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.category !== undefined) patch.category = args.category;
    if (args.dosage !== undefined) patch.dosage = args.dosage;
    if (args.frequency !== undefined) patch.frequency = args.frequency;
    if (args.duration !== undefined) patch.duration = args.duration;
    if (args.notes !== undefined) patch.notes = args.notes;
    if (args.storage !== undefined) patch.storage = args.storage;
    if (args.sort_order !== undefined) patch.sortOrder = args.sort_order;
    if (args.active !== undefined) patch.active = args.active;
    if (args.product_id !== undefined) patch.productId = args.product_id ?? undefined;
    if (args.image_url !== undefined) patch.imageUrl = args.image_url ?? undefined;
    if (args.content_type !== undefined) patch.contentType = args.content_type;
    if (args.file_url !== undefined) patch.fileUrl = args.file_url ?? undefined;
    await ctx.db.patch(args.id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("protocols") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
