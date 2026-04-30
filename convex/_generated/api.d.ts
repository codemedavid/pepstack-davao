/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as articles from "../articles.js";
import type * as categories from "../categories.js";
import type * as coaReports from "../coaReports.js";
import type * as couriers from "../couriers.js";
import type * as faqs from "../faqs.js";
import type * as files from "../files.js";
import type * as lib from "../lib.js";
import type * as orders from "../orders.js";
import type * as paymentMethods from "../paymentMethods.js";
import type * as products from "../products.js";
import type * as promoCodes from "../promoCodes.js";
import type * as protocols from "../protocols.js";
import type * as seedFullSchema from "../seedFullSchema.js";
import type * as seedPriceList from "../seedPriceList.js";
import type * as shippingLocations from "../shippingLocations.js";
import type * as siteSettings from "../siteSettings.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  articles: typeof articles;
  categories: typeof categories;
  coaReports: typeof coaReports;
  couriers: typeof couriers;
  faqs: typeof faqs;
  files: typeof files;
  lib: typeof lib;
  orders: typeof orders;
  paymentMethods: typeof paymentMethods;
  products: typeof products;
  promoCodes: typeof promoCodes;
  protocols: typeof protocols;
  seedFullSchema: typeof seedFullSchema;
  seedPriceList: typeof seedPriceList;
  shippingLocations: typeof shippingLocations;
  siteSettings: typeof siteSettings;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
