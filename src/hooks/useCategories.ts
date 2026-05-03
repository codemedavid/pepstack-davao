import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Category {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCategories = () => {
  const [data, setData] = useState<Category[] | undefined>(undefined);

  const refetch = useCallback(async () => {
    const { data: rows, error } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (error) {
      console.error('useCategories refetch error', error);
      setData([]);
      return;
    }
    setData((rows ?? []) as Category[]);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const loading = data === undefined;

  const categories = useMemo<Category[]>(() => {
    const list = (data ?? []) as Category[];
    if (list.some((c) => c.id === 'all')) return list;
    const sentinel: Category = {
      id: 'all',
      name: 'All Peptides',
      icon: 'Grid',
      sort_order: 0,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return [sentinel, ...list];
  }, [data]);

  const addCategory = async (category: Omit<Category, 'created_at' | 'updated_at'>) => {
    const payload: any = {
      name: category.name,
      icon: category.icon,
      sort_order: category.sort_order,
      active: category.active,
    };
    if (category.id) payload.id = category.id;
    const { data: row, error } = await supabase
      .from('categories')
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    await refetch();
    return row;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const patch: Record<string, unknown> = {};
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.icon !== undefined) patch.icon = updates.icon;
    if (updates.sort_order !== undefined) patch.sort_order = updates.sort_order;
    if (updates.active !== undefined) patch.active = updates.active;
    const { error } = await supabase.from('categories').update(patch).eq('id', id);
    if (error) throw new Error(error.message);
    await refetch();
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await refetch();
  };

  const reorderCategories = async (reordered: Category[]) => {
    const filtered = reordered.filter((c) => c.id !== 'all');
    await Promise.all(
      filtered.map((c, idx) =>
        supabase.from('categories').update({ sort_order: idx + 1 }).eq('id', c.id),
      ),
    );
    await refetch();
  };

  return {
    categories,
    loading,
    error: null as string | null,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    refetch,
  };
};
