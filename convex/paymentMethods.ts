import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { mapPaymentMethod } from "./lib";

export const list = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("paymentMethods").collect();
    const filtered = args.activeOnly ? all.filter((m) => m.active) : all;
    return filtered.sort((a, b) => a.sortOrder - b.sortOrder).map(mapPaymentMethod);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    account_number: v.optional(v.string()),
    account_name: v.optional(v.string()),
    qr_code_url: v.optional(v.string()),
    active: v.boolean(),
    sort_order: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("paymentMethods", {
      name: args.name,
      accountNumber: args.account_number ?? "",
      accountName: args.account_name ?? "",
      qrCodeUrl: args.qr_code_url ?? "",
      active: args.active,
      sortOrder: args.sort_order,
    });
    const doc = await ctx.db.get(id);
    return mapPaymentMethod(doc!);
  },
});

export const update = mutation({
  args: {
    id: v.id("paymentMethods"),
    name: v.optional(v.string()),
    account_number: v.optional(v.string()),
    account_name: v.optional(v.string()),
    qr_code_url: v.optional(v.string()),
    active: v.optional(v.boolean()),
    sort_order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.account_number !== undefined) patch.accountNumber = args.account_number;
    if (args.account_name !== undefined) patch.accountName = args.account_name;
    if (args.qr_code_url !== undefined) patch.qrCodeUrl = args.qr_code_url;
    if (args.active !== undefined) patch.active = args.active;
    if (args.sort_order !== undefined) patch.sortOrder = args.sort_order;
    await ctx.db.patch(args.id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("paymentMethods") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const reorder = mutation({
  args: { orderedIds: v.array(v.id("paymentMethods")) },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.orderedIds.length; i++) {
      await ctx.db.patch(args.orderedIds[i], { sortOrder: i + 1 });
    }
  },
});
