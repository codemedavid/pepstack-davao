import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("siteSettings").collect();
    return all.map((s) => ({
      id: s.key,
      value: s.value,
      type: s.type,
      description: s.description ?? null,
      updated_at: new Date(s._creationTime).toISOString(),
    }));
  },
});

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (!doc) return null;
    return {
      id: doc.key,
      value: doc.value,
      type: doc.type,
      description: doc.description ?? null,
    };
  },
});

export const upsert = mutation({
  args: {
    key: v.string(),
    value: v.string(),
    type: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    const patch = {
      key: args.key,
      value: args.value,
      type: args.type ?? existing?.type ?? "text",
      description: args.description ?? existing?.description,
    };
    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }
    return await ctx.db.insert("siteSettings", patch);
  },
});

export const upsertMany = mutation({
  args: {
    entries: v.array(
      v.object({
        key: v.string(),
        value: v.string(),
        type: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const entry of args.entries) {
      const existing = await ctx.db
        .query("siteSettings")
        .withIndex("by_key", (q) => q.eq("key", entry.key))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, {
          value: entry.value,
          type: entry.type ?? existing.type,
        });
      } else {
        await ctx.db.insert("siteSettings", {
          key: entry.key,
          value: entry.value,
          type: entry.type ?? "text",
        });
      }
    }
  },
});
