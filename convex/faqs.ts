import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { mapFaq } from "./lib";

export const list = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("faqs").collect();
    const filtered = args.activeOnly ? all.filter((f) => f.isActive) : all;
    return filtered.sort((a, b) => a.orderIndex - b.orderIndex).map(mapFaq);
  },
});

const baseFields = {
  question: v.string(),
  answer: v.string(),
  category: v.string(),
  order_index: v.number(),
  is_active: v.optional(v.boolean()),
};

export const create = mutation({
  args: baseFields,
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("faqs", {
      question: args.question,
      answer: args.answer,
      category: args.category,
      orderIndex: args.order_index,
      isActive: args.is_active ?? true,
    });
    const doc = await ctx.db.get(id);
    return mapFaq(doc!);
  },
});

export const update = mutation({
  args: {
    id: v.id("faqs"),
    question: v.optional(v.string()),
    answer: v.optional(v.string()),
    category: v.optional(v.string()),
    order_index: v.optional(v.number()),
    is_active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {};
    if (args.question !== undefined) patch.question = args.question;
    if (args.answer !== undefined) patch.answer = args.answer;
    if (args.category !== undefined) patch.category = args.category;
    if (args.order_index !== undefined) patch.orderIndex = args.order_index;
    if (args.is_active !== undefined) patch.isActive = args.is_active;
    await ctx.db.patch(args.id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("faqs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const seedMany = mutation({
  args: {
    faqs: v.array(
      v.object({
        question: v.string(),
        answer: v.string(),
        category: v.string(),
        order_index: v.number(),
        is_active: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const f of args.faqs) {
      await ctx.db.insert("faqs", {
        question: f.question,
        answer: f.answer,
        category: f.category,
        orderIndex: f.order_index,
        isActive: f.is_active,
      });
    }
  },
});
