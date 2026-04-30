import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { mapArticle } from "./lib";

export const list = query({
  args: { enabledOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("articles").collect();
    const filtered = args.enabledOnly ? all.filter((a) => a.isEnabled) : all;
    return filtered.sort((a, b) => a.displayOrder - b.displayOrder).map(mapArticle);
  },
});

export const get = query({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    return doc && doc.isEnabled ? mapArticle(doc) : null;
  },
});

const baseFields = {
  title: v.string(),
  preview: v.optional(v.union(v.string(), v.null())),
  content: v.string(),
  cover_image: v.optional(v.union(v.string(), v.null())),
  author: v.string(),
  published_date: v.string(),
  display_order: v.number(),
  is_enabled: v.optional(v.boolean()),
};

export const create = mutation({
  args: baseFields,
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("articles", {
      title: args.title,
      preview: args.preview ?? undefined,
      content: args.content,
      coverImage: args.cover_image ?? undefined,
      author: args.author,
      publishedDate: args.published_date,
      displayOrder: args.display_order,
      isEnabled: args.is_enabled ?? true,
    });
    const doc = await ctx.db.get(id);
    return mapArticle(doc!);
  },
});

export const update = mutation({
  args: {
    id: v.id("articles"),
    title: v.optional(v.string()),
    preview: v.optional(v.union(v.string(), v.null())),
    content: v.optional(v.string()),
    cover_image: v.optional(v.union(v.string(), v.null())),
    author: v.optional(v.string()),
    published_date: v.optional(v.string()),
    display_order: v.optional(v.number()),
    is_enabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {};
    if (args.title !== undefined) patch.title = args.title;
    if (args.preview !== undefined) patch.preview = args.preview ?? undefined;
    if (args.content !== undefined) patch.content = args.content;
    if (args.cover_image !== undefined) patch.coverImage = args.cover_image ?? undefined;
    if (args.author !== undefined) patch.author = args.author;
    if (args.published_date !== undefined) patch.publishedDate = args.published_date;
    if (args.display_order !== undefined) patch.displayOrder = args.display_order;
    if (args.is_enabled !== undefined) patch.isEnabled = args.is_enabled;
    await ctx.db.patch(args.id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
