import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { mapOrder } from "./lib";
import type { Id } from "./_generated/dataModel";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("orders").collect();
    return all
      .sort((a, b) => b._creationTime - a._creationTime)
      .map(mapOrder);
  },
});

export const get = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    return doc ? mapOrder(doc) : null;
  },
});

export const getDetailsForTracking = query({
  args: { orderInput: v.string() },
  handler: async (ctx, args) => {
    const trimmed = args.orderInput.trim();
    let doc = null;
    if (trimmed.startsWith("BRC-")) {
      doc = await ctx.db
        .query("orders")
        .withIndex("by_orderNumber", (q) => q.eq("orderNumber", trimmed))
        .unique();
    }
    if (!doc) {
      try {
        doc = await ctx.db.get(trimmed as Id<"orders">);
      } catch {
        doc = null;
      }
    }
    if (!doc) return null;
    const courier = doc.courierId ? await ctx.db.get(doc.courierId) : null;
    return {
      ...mapOrder(doc),
      courier_code: courier?.code ?? null,
      courier_name: courier?.name ?? null,
      tracking_url_template: courier?.trackingUrlTemplate ?? null,
    };
  },
});

export const listForSales = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("orders").collect();
    const eligible = all.filter(
      (o) =>
        ["confirmed", "processing", "shipped", "delivered"].includes(o.orderStatus ?? "") &&
        o.paymentStatus === "paid",
    );
    return eligible.map((o) => ({
      total_price: o.totalPrice,
      shipping_fee: o.shippingFee ?? 0,
      order_items: o.orderItems,
      order_status: o.orderStatus,
    }));
  },
});

export const create = mutation({
  args: {
    customer_name: v.string(),
    customer_email: v.string(),
    customer_phone: v.string(),
    contact_method: v.optional(v.string()),
    shipping_address: v.string(),
    shipping_city: v.optional(v.string()),
    shipping_state: v.optional(v.string()),
    shipping_zip_code: v.optional(v.string()),
    shipping_barangay: v.optional(v.string()),
    shipping_location: v.optional(v.string()),
    courier_id: v.optional(v.union(v.id("couriers"), v.null())),
    shipping_fee: v.optional(v.number()),
    order_items: v.any(),
    total_price: v.number(),
    payment_method_id: v.optional(v.union(v.string(), v.null())),
    payment_method_name: v.optional(v.union(v.string(), v.null())),
    payment_proof_url: v.optional(v.union(v.string(), v.null())),
    notes: v.optional(v.union(v.string(), v.null())),
    order_status: v.optional(v.string()),
    payment_status: v.optional(v.string()),
    promo_code_id: v.optional(v.union(v.id("promoCodes"), v.null())),
    promo_code: v.optional(v.union(v.string(), v.null())),
    discount_applied: v.optional(v.number()),
    order_number: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("orders", {
      customerName: args.customer_name,
      customerEmail: args.customer_email,
      customerPhone: args.customer_phone,
      contactMethod: args.contact_method,
      shippingAddress: args.shipping_address,
      shippingCity: args.shipping_city,
      shippingState: args.shipping_state,
      shippingZipCode: args.shipping_zip_code,
      shippingBarangay: args.shipping_barangay,
      shippingLocation: args.shipping_location,
      courierId: args.courier_id ?? undefined,
      shippingFee: args.shipping_fee ?? 0,
      orderItems: args.order_items,
      totalPrice: args.total_price,
      paymentMethodId: args.payment_method_id ?? undefined,
      paymentMethodName: args.payment_method_name ?? undefined,
      paymentProofUrl: args.payment_proof_url ?? undefined,
      notes: args.notes ?? undefined,
      orderStatus: args.order_status ?? "new",
      paymentStatus: args.payment_status ?? "pending",
      promoCodeId: args.promo_code_id ?? undefined,
      promoCode: args.promo_code ?? undefined,
      discountApplied: args.discount_applied ?? 0,
      orderNumber: args.order_number,
    });
    const doc = await ctx.db.get(id);
    return mapOrder(doc!);
  },
});

export const updateStatus = mutation({
  args: { id: v.id("orders"), order_status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      orderStatus: args.order_status,
      updatedAt: Date.now(),
    });
  },
});

export const updateTracking = mutation({
  args: {
    id: v.id("orders"),
    tracking_number: v.optional(v.union(v.string(), v.null())),
    shipping_provider: v.optional(v.union(v.string(), v.null())),
    shipping_note: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      trackingNumber: args.tracking_number ?? undefined,
      shippingProvider: args.shipping_provider ?? undefined,
      shippingNote: args.shipping_note ?? undefined,
      updatedAt: Date.now(),
    });
  },
});

export const confirmOrder = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found.");

    const items: Array<{
      product_id?: string;
      variation_id?: string | null;
      product_name: string;
      variation_name?: string | null;
      quantity: number;
    }> = order.orderItems ?? [];

    // Stock check
    for (const item of items) {
      const qty = item.quantity ?? 0;
      if (item.variation_id) {
        const variation = await ctx.db.get(item.variation_id as Id<"productVariations">);
        if (!variation) {
          throw new Error(
            `Variation "${item.variation_name ?? ""}" not found. It may have been deleted.`,
          );
        }
        if (variation.stockQuantity < qty) {
          throw new Error(
            `Insufficient stock for ${item.product_name} ${item.variation_name ?? ""}. Available: ${variation.stockQuantity}, Required: ${qty}`,
          );
        }
      } else if (item.product_id) {
        const product = await ctx.db.get(item.product_id as Id<"products">);
        if (!product) {
          throw new Error(`Product "${item.product_name}" not found.`);
        }
        if (product.stockQuantity < qty) {
          throw new Error(
            `Insufficient stock for ${item.product_name}. Available: ${product.stockQuantity}, Required: ${qty}`,
          );
        }
      }
    }

    // Deduct stock
    for (const item of items) {
      const qty = item.quantity ?? 0;
      if (item.variation_id) {
        const variation = await ctx.db.get(item.variation_id as Id<"productVariations">);
        if (variation) {
          await ctx.db.patch(variation._id, {
            stockQuantity: Math.max(0, variation.stockQuantity - qty),
          });
        }
      } else if (item.product_id) {
        const product = await ctx.db.get(item.product_id as Id<"products">);
        if (product) {
          await ctx.db.patch(product._id, {
            stockQuantity: Math.max(0, product.stockQuantity - qty),
          });
        }
      }
    }

    await ctx.db.patch(args.id, {
      orderStatus: "confirmed",
      paymentStatus: "paid",
      updatedAt: Date.now(),
    });
  },
});
