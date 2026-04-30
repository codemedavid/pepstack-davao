import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import type { Product, ProductVariation } from '../types';

export function useMenu() {
  const data = useQuery(api.products.list, { availableOnly: true });
  const createMut = useMutation(api.products.create);
  const updateMut = useMutation(api.products.update);
  const deleteMut = useMutation(api.products.remove);
  const addVariationMut = useMutation(api.products.addVariation);
  const updateVariationMut = useMutation(api.products.updateVariation);
  const deleteVariationMut = useMutation(api.products.removeVariation);

  const products = (data ?? []) as Product[];
  const loading = data === undefined;

  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const result = await createMut({
        name: product.name,
        description: product.description,
        category: product.category as Id<'categories'>,
        base_price: product.base_price,
        purity_percentage: product.purity_percentage,
        stock_quantity: product.stock_quantity,
        available: product.available,
        featured: product.featured,
        image_url: product.image_url ?? null,
        discount_price: product.discount_price ?? null,
        discount_active: product.discount_active,
      });
      return { success: true as const, data: result };
    } catch (err) {
      return {
        success: false as const,
        error: err instanceof Error ? err.message : 'Failed to add product',
      };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const patch: Record<string, unknown> = {};
      if (updates.name !== undefined) patch.name = updates.name;
      if (updates.description !== undefined) patch.description = updates.description;
      if (updates.category !== undefined) patch.category = updates.category as Id<'categories'>;
      if (updates.base_price !== undefined) patch.base_price = updates.base_price;
      if (updates.discount_price !== undefined) patch.discount_price = updates.discount_price;
      if (updates.discount_active !== undefined) patch.discount_active = updates.discount_active;
      if (updates.purity_percentage !== undefined) patch.purity_percentage = updates.purity_percentage;
      if (updates.molecular_weight !== undefined) patch.molecular_weight = updates.molecular_weight;
      if (updates.cas_number !== undefined) patch.cas_number = updates.cas_number;
      if (updates.sequence !== undefined) patch.sequence = updates.sequence;
      if (updates.storage_conditions !== undefined) patch.storage_conditions = updates.storage_conditions;
      if (updates.inclusions !== undefined) patch.inclusions = updates.inclusions;
      if (updates.stock_quantity !== undefined) patch.stock_quantity = updates.stock_quantity;
      if (updates.available !== undefined) patch.available = updates.available;
      if (updates.featured !== undefined) patch.featured = updates.featured;
      if (updates.image_url !== undefined) {
        const v = String(updates.image_url ?? '').trim();
        patch.image_url = v === '' ? null : v;
      }
      if (updates.safety_sheet_url !== undefined) patch.safety_sheet_url = updates.safety_sheet_url;
      const result = await updateMut({ id: id as Id<'products'>, patch: patch as any });
      return { success: true as const, data: result };
    } catch (err) {
      return {
        success: false as const,
        error: err instanceof Error ? err.message : 'Failed to update product',
      };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteMut({ id: id as Id<'products'> });
      return { success: true as const };
    } catch (err) {
      return {
        success: false as const,
        error: err instanceof Error ? err.message : 'Failed to delete product',
      };
    }
  };

  const addVariation = async (variation: Omit<ProductVariation, 'id' | 'created_at'>) => {
    try {
      const result = await addVariationMut({
        product_id: variation.product_id as Id<'products'>,
        name: variation.name,
        quantity_mg: variation.quantity_mg,
        price: variation.price,
        stock_quantity: variation.stock_quantity,
        discount_price: variation.discount_price ?? null,
        discount_active: variation.discount_active,
      });
      return { success: true as const, data: result };
    } catch (err) {
      return {
        success: false as const,
        error: err instanceof Error ? err.message : 'Failed to add variation',
      };
    }
  };

  const updateVariation = async (id: string, updates: Partial<ProductVariation>) => {
    try {
      await updateVariationMut({
        id: id as Id<'productVariations'>,
        name: updates.name,
        quantity_mg: updates.quantity_mg,
        price: updates.price,
        stock_quantity: updates.stock_quantity,
        discount_price: updates.discount_price === undefined ? undefined : updates.discount_price,
        discount_active: updates.discount_active,
      });
      return { success: true as const };
    } catch (err) {
      return {
        success: false as const,
        error: err instanceof Error ? err.message : 'Failed to update variation',
      };
    }
  };

  const deleteVariation = async (id: string) => {
    try {
      await deleteVariationMut({ id: id as Id<'productVariations'> });
      return { success: true as const };
    } catch (err) {
      return {
        success: false as const,
        error: err instanceof Error ? err.message : 'Failed to delete variation',
      };
    }
  };

  return {
    menuItems: products,
    products,
    loading,
    error: null as string | null,
    refreshProducts: async () => {},
    addProduct,
    updateProduct,
    deleteProduct,
    addVariation,
    updateVariation,
    deleteVariation,
  };
}
