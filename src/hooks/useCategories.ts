import { useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

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
  const data = useQuery(api.categories.list, { activeOnly: true });
  const createMut = useMutation(api.categories.create);
  const updateMut = useMutation(api.categories.update);
  const deleteMut = useMutation(api.categories.remove);
  const reorderMut = useMutation(api.categories.reorder);

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
    return await createMut({
      name: category.name,
      icon: category.icon,
      sort_order: category.sort_order,
      active: category.active,
    });
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    await updateMut({
      id: id as Id<'categories'>,
      name: updates.name,
      icon: updates.icon,
      sort_order: updates.sort_order,
      active: updates.active,
    });
  };

  const deleteCategory = async (id: string) => {
    await deleteMut({ id: id as Id<'categories'> });
  };

  const reorderCategories = async (reordered: Category[]) => {
    await reorderMut({
      orderedIds: reordered
        .filter((c) => c.id !== 'all')
        .map((c) => c.id as Id<'categories'>),
    });
  };

  return {
    categories,
    loading,
    error: null as string | null,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    refetch: () => {},
  };
};
