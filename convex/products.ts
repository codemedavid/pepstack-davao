import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { mapProduct, mapVariation } from "./lib";

export const list = query({
  args: { availableOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const products = await ctx.db.query("products").collect();
    const filtered = args.availableOnly ? products.filter((p) => p.available) : products;
    filtered.sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    const variations = await ctx.db.query("productVariations").collect();
    const variationsByProduct = new Map<string, typeof variations>();
    for (const variation of variations) {
      const key = variation.productId as string;
      const list = variationsByProduct.get(key) ?? [];
      list.push(variation);
      variationsByProduct.set(key, list);
    }
    return filtered.map((p) => {
      const vs = (variationsByProduct.get(p._id as string) ?? [])
        .sort((a, b) => a.quantityMg - b.quantityMg)
        .map(mapVariation);
      return { ...mapProduct(p), variations: vs };
    });
  },
});

export const getStock = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const p = await ctx.db.get(args.id);
    return p ? { stock_quantity: p.stockQuantity } : null;
  },
});

const productPatch = v.object({
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  category: v.optional(v.id("categories")),
  base_price: v.optional(v.number()),
  discount_price: v.optional(v.union(v.number(), v.null())),
  discount_active: v.optional(v.boolean()),
  purity_percentage: v.optional(v.number()),
  molecular_weight: v.optional(v.union(v.string(), v.null())),
  cas_number: v.optional(v.union(v.string(), v.null())),
  sequence: v.optional(v.union(v.string(), v.null())),
  storage_conditions: v.optional(v.string()),
  inclusions: v.optional(v.union(v.array(v.string()), v.null())),
  stock_quantity: v.optional(v.number()),
  available: v.optional(v.boolean()),
  featured: v.optional(v.boolean()),
  image_url: v.optional(v.union(v.string(), v.null())),
  safety_sheet_url: v.optional(v.union(v.string(), v.null())),
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: v.id("categories"),
    base_price: v.number(),
    purity_percentage: v.optional(v.number()),
    stock_quantity: v.optional(v.number()),
    available: v.optional(v.boolean()),
    featured: v.optional(v.boolean()),
    image_url: v.optional(v.union(v.string(), v.null())),
    discount_price: v.optional(v.union(v.number(), v.null())),
    discount_active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("products", {
      name: args.name,
      description: args.description,
      categoryId: args.category,
      basePrice: args.base_price,
      purityPercentage: args.purity_percentage ?? 99,
      stockQuantity: args.stock_quantity ?? 0,
      available: args.available ?? true,
      featured: args.featured ?? false,
      imageUrl: args.image_url ?? undefined,
      discountPrice: args.discount_price ?? undefined,
      discountActive: args.discount_active ?? false,
    });
    const doc = await ctx.db.get(id);
    return mapProduct(doc!);
  },
});

export const update = mutation({
  args: { id: v.id("products"), patch: productPatch },
  handler: async (ctx, args) => {
    const p: Record<string, unknown> = {};
    const x = args.patch;
    if (x.name !== undefined) p.name = x.name;
    if (x.description !== undefined) p.description = x.description;
    if (x.category !== undefined) p.categoryId = x.category;
    if (x.base_price !== undefined) p.basePrice = x.base_price;
    if (x.discount_price !== undefined) p.discountPrice = x.discount_price ?? undefined;
    if (x.discount_active !== undefined) p.discountActive = x.discount_active;
    if (x.purity_percentage !== undefined) p.purityPercentage = x.purity_percentage;
    if (x.molecular_weight !== undefined) p.molecularWeight = x.molecular_weight ?? undefined;
    if (x.cas_number !== undefined) p.casNumber = x.cas_number ?? undefined;
    if (x.sequence !== undefined) p.sequence = x.sequence ?? undefined;
    if (x.storage_conditions !== undefined) p.storageConditions = x.storage_conditions;
    if (x.inclusions !== undefined) p.inclusions = x.inclusions ?? undefined;
    if (x.stock_quantity !== undefined) p.stockQuantity = x.stock_quantity;
    if (x.available !== undefined) p.available = x.available;
    if (x.featured !== undefined) p.featured = x.featured;
    if (x.image_url !== undefined) p.imageUrl = x.image_url ?? undefined;
    if (x.safety_sheet_url !== undefined) p.safetySheetUrl = x.safety_sheet_url ?? undefined;
    await ctx.db.patch(args.id, p);
    const doc = await ctx.db.get(args.id);
    return mapProduct(doc!);
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const variations = await ctx.db
      .query("productVariations")
      .withIndex("by_product", (q) => q.eq("productId", args.id))
      .collect();
    for (const v of variations) await ctx.db.delete(v._id);
    await ctx.db.delete(args.id);
  },
});

export const updateStock = mutation({
  args: { id: v.id("products"), stock_quantity: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { stockQuantity: args.stock_quantity });
  },
});

// ── variations ─────────────────────────────────────────────────

const variationFields = {
  product_id: v.id("products"),
  name: v.string(),
  quantity_mg: v.number(),
  price: v.number(),
  stock_quantity: v.optional(v.number()),
  discount_price: v.optional(v.union(v.number(), v.null())),
  discount_active: v.optional(v.boolean()),
};

export const addVariation = mutation({
  args: variationFields,
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("productVariations", {
      productId: args.product_id,
      name: args.name,
      quantityMg: args.quantity_mg,
      price: args.price,
      stockQuantity: args.stock_quantity ?? 0,
      discountPrice: args.discount_price ?? undefined,
      discountActive: args.discount_active ?? false,
    });
    const doc = await ctx.db.get(id);
    return mapVariation(doc!);
  },
});

export const updateVariation = mutation({
  args: {
    id: v.id("productVariations"),
    name: v.optional(v.string()),
    quantity_mg: v.optional(v.number()),
    price: v.optional(v.number()),
    stock_quantity: v.optional(v.number()),
    discount_price: v.optional(v.union(v.number(), v.null())),
    discount_active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.quantity_mg !== undefined) patch.quantityMg = args.quantity_mg;
    if (args.price !== undefined) patch.price = args.price;
    if (args.stock_quantity !== undefined) patch.stockQuantity = args.stock_quantity;
    if (args.discount_price !== undefined) patch.discountPrice = args.discount_price ?? undefined;
    if (args.discount_active !== undefined) patch.discountActive = args.discount_active;
    await ctx.db.patch(args.id, patch);
  },
});

export const removeVariation = mutation({
  args: { id: v.id("productVariations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateVariationStock = mutation({
  args: { id: v.id("productVariations"), stock_quantity: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { stockQuantity: args.stock_quantity });
  },
});
