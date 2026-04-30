import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  categories: defineTable({
    name: v.string(),
    icon: v.string(),
    sortOrder: v.number(),
    active: v.boolean(),
  }).index("by_name", ["name"]),

  products: defineTable({
    name: v.string(),
    description: v.string(),
    basePrice: v.number(),
    categoryId: v.id("categories"),
    available: v.boolean(),
    featured: v.boolean(),
    stockQuantity: v.number(),
    imageUrl: v.optional(v.string()),

    discountPrice: v.optional(v.number()),
    discountStartDate: v.optional(v.number()),
    discountEndDate: v.optional(v.number()),
    discountActive: v.optional(v.boolean()),

    purityPercentage: v.optional(v.number()),
    molecularWeight: v.optional(v.string()),
    casNumber: v.optional(v.string()),
    sequence: v.optional(v.string()),
    storageConditions: v.optional(v.string()),
    inclusions: v.optional(v.array(v.string())),
    safetySheetUrl: v.optional(v.string()),
  })
    .index("by_name", ["name"])
    .index("by_category", ["categoryId"])
    .index("by_featured", ["featured"]),

  productVariations: defineTable({
    productId: v.id("products"),
    name: v.string(),
    quantityMg: v.number(),
    price: v.number(),
    stockQuantity: v.number(),
    discountPrice: v.optional(v.number()),
    discountActive: v.optional(v.boolean()),
  }).index("by_product", ["productId"]),

  siteSettings: defineTable({
    key: v.string(),
    value: v.string(),
    type: v.string(),
    description: v.optional(v.string()),
  }).index("by_key", ["key"]),

  paymentMethods: defineTable({
    name: v.string(),
    accountNumber: v.optional(v.string()),
    accountName: v.optional(v.string()),
    qrCodeUrl: v.optional(v.string()),
    active: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_sortOrder", ["sortOrder"]),

  shippingLocations: defineTable({
    code: v.string(),
    name: v.string(),
    fee: v.number(),
    isActive: v.boolean(),
    orderIndex: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_orderIndex", ["orderIndex"]),

  couriers: defineTable({
    code: v.string(),
    name: v.string(),
    trackingUrlTemplate: v.optional(v.string()),
    isActive: v.boolean(),
    sortOrder: v.optional(v.number()),
  })
    .index("by_code", ["code"])
    .index("by_sortOrder", ["sortOrder"]),

  promoCodes: defineTable({
    code: v.string(),
    discountType: v.union(v.literal("percentage"), v.literal("fixed")),
    discountValue: v.number(),
    minPurchaseAmount: v.optional(v.number()),
    maxDiscountAmount: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    usageLimit: v.optional(v.number()),
    usageCount: v.number(),
    active: v.boolean(),
  }).index("by_code", ["code"]),

  orders: defineTable({
    orderNumber: v.optional(v.string()),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    contactMethod: v.optional(v.string()),
    shippingAddress: v.string(),
    shippingCity: v.optional(v.string()),
    shippingState: v.optional(v.string()),
    shippingZipCode: v.optional(v.string()),
    shippingCountry: v.optional(v.string()),
    shippingBarangay: v.optional(v.string()),
    shippingRegion: v.optional(v.string()),
    shippingLocation: v.optional(v.string()),
    courierId: v.optional(v.id("couriers")),
    shippingFee: v.optional(v.number()),
    orderItems: v.any(),
    subtotal: v.optional(v.number()),
    totalPrice: v.number(),
    pricingMode: v.optional(v.string()),
    paymentMethodId: v.optional(v.string()),
    paymentMethodName: v.optional(v.string()),
    paymentStatus: v.optional(v.string()),
    paymentProofUrl: v.optional(v.string()),
    promoCodeId: v.optional(v.id("promoCodes")),
    promoCode: v.optional(v.string()),
    discountApplied: v.optional(v.number()),
    orderStatus: v.optional(v.string()),
    notes: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    trackingCourier: v.optional(v.string()),
    shippingProvider: v.optional(v.string()),
    shippingNote: v.optional(v.string()),
    shippedAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_email", ["customerEmail"])
    .index("by_phone", ["customerPhone"])
    .index("by_status", ["orderStatus"])
    .index("by_orderNumber", ["orderNumber"]),

  coaReports: defineTable({
    productName: v.string(),
    batch: v.optional(v.string()),
    testDate: v.string(),
    purityPercentage: v.number(),
    quantity: v.string(),
    taskNumber: v.string(),
    verificationKey: v.string(),
    imageUrl: v.string(),
    featured: v.boolean(),
    manufacturer: v.optional(v.string()),
    laboratory: v.optional(v.string()),
  })
    .index("by_verification", ["verificationKey"])
    .index("by_featured", ["featured"]),

  faqs: defineTable({
    question: v.string(),
    answer: v.string(),
    category: v.string(),
    orderIndex: v.number(),
    isActive: v.boolean(),
  })
    .index("by_category", ["category"])
    .index("by_orderIndex", ["orderIndex"]),

  articles: defineTable({
    title: v.string(),
    preview: v.optional(v.string()),
    content: v.string(),
    coverImage: v.optional(v.string()),
    author: v.string(),
    publishedDate: v.string(),
    displayOrder: v.number(),
    isEnabled: v.boolean(),
  })
    .index("by_displayOrder", ["displayOrder"])
    .index("by_enabled", ["isEnabled"]),

  protocols: defineTable({
    name: v.string(),
    category: v.string(),
    dosage: v.string(),
    frequency: v.string(),
    duration: v.string(),
    notes: v.array(v.string()),
    storage: v.string(),
    sortOrder: v.number(),
    active: v.boolean(),
    productId: v.optional(v.id("products")),
    imageUrl: v.optional(v.string()),
    contentType: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
  })
    .index("by_name", ["name"])
    .index("by_sortOrder", ["sortOrder"])
    .index("by_product", ["productId"]),
});
