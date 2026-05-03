import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Product, ProductVariation } from '../types';

export function useMenu() {
  const [data, setData] = useState<Product[] | undefined>(undefined);

  const refetch = useCallback(async () => {
    const { data: rows, error } = await supabase
      .from('products')
      .select('*, product_variations(*)')
      .eq('available', true);
    if (error) {
      console.error('useMenu refetch error', error);
      setData([]);
      return;
    }
    const products = (rows ?? []).map((row: any) => {
      const { product_variations, ...rest } = row;
      return {
        ...rest,
        variations: (product_variations ?? []) as ProductVariation[],
      } as Product;
    });
    setData(products);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const products = (data ?? []) as Product[];
  const loading = data === undefined;

  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: row, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          description: product.description,
          category: product.category,
          base_price: product.base_price,
          purity_percentage: product.purity_percentage,
          stock_quantity: product.stock_quantity,
          available: product.available,
          featured: product.featured,
          image_url: product.image_url ?? null,
          discount_price: product.discount_price ?? null,
          discount_active: product.discount_active,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      await refetch();
      return { success: true as const, data: row };
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
      if (updates.category !== undefined) patch.category = updates.category;
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
      const { data: row, error } = await supabase
        .from('products')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      await refetch();
      return { success: true as const, data: row };
    } catch (err) {
      return {
        success: false as const,
        error: err instanceof Error ? err.message : 'Failed to update product',
      };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw new Error(error.message);
      await refetch();
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
      const { data: row, error } = await supabase
        .from('product_variations')
        .insert({
          product_id: variation.product_id,
          name: variation.name,
          quantity_mg: variation.quantity_mg,
          price: variation.price,
          stock_quantity: variation.stock_quantity,
          discount_price: variation.discount_price ?? null,
          discount_active: variation.discount_active,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      await refetch();
      return { success: true as const, data: row };
    } catch (err) {
      return {
        success: false as const,
        error: err instanceof Error ? err.message : 'Failed to add variation',
      };
    }
  };

  const updateVariation = async (id: string, updates: Partial<ProductVariation>) => {
    try {
      const patch: Record<string, unknown> = {};
      if (updates.name !== undefined) patch.name = updates.name;
      if (updates.quantity_mg !== undefined) patch.quantity_mg = updates.quantity_mg;
      if (updates.price !== undefined) patch.price = updates.price;
      if (updates.stock_quantity !== undefined) patch.stock_quantity = updates.stock_quantity;
      if (updates.discount_price !== undefined) patch.discount_price = updates.discount_price;
      if (updates.discount_active !== undefined) patch.discount_active = updates.discount_active;
      const { error } = await supabase.from('product_variations').update(patch).eq('id', id);
      if (error) throw new Error(error.message);
      await refetch();
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
      const { error } = await supabase.from('product_variations').delete().eq('id', id);
      if (error) throw new Error(error.message);
      await refetch();
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
    refreshProducts: refetch,
    addProduct,
    updateProduct,
    deleteProduct,
    addVariation,
    updateVariation,
    deleteVariation,
  };
}
