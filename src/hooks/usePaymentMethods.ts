import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface PaymentMethod {
  id: string;
  name: string;
  account_number: string;
  account_name: string;
  qr_code_url: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const PLACEHOLDER_QR =
  'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';

export const usePaymentMethods = () => {
  const [data, setData] = useState<PaymentMethod[] | undefined>(undefined);

  const refetch = useCallback(async () => {
    const { data: rows, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) {
      console.error('usePaymentMethods refetch error', error);
      setData([]);
      return;
    }
    setData((rows ?? []) as PaymentMethod[]);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const allMethods = (data ?? []) as PaymentMethod[];
  const paymentMethods = allMethods.filter((m) => m.active);
  const loading = data === undefined;

  const normalizeQr = (input: string | undefined | null): string => {
    const trimmed = String(input ?? '').trim();
    return trimmed === '' ? PLACEHOLDER_QR : trimmed;
  };

  const addPaymentMethod = async (method: Omit<PaymentMethod, 'created_at' | 'updated_at'>) => {
    const payload: any = {
      name: method.name,
      account_number: method.account_number,
      account_name: method.account_name,
      qr_code_url: normalizeQr(method.qr_code_url),
      active: method.active,
      sort_order: method.sort_order,
    };
    if (method.id) payload.id = method.id;
    const { data: row, error } = await supabase
      .from('payment_methods')
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    await refetch();
    return row;
  };

  const updatePaymentMethod = async (id: string, updates: Partial<PaymentMethod>) => {
    const patch: Record<string, unknown> = {};
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.account_number !== undefined) patch.account_number = updates.account_number;
    if (updates.account_name !== undefined) patch.account_name = updates.account_name;
    if ('qr_code_url' in updates) patch.qr_code_url = normalizeQr(updates.qr_code_url);
    if (updates.active !== undefined) patch.active = updates.active;
    if (updates.sort_order !== undefined) patch.sort_order = updates.sort_order;
    const { error } = await supabase.from('payment_methods').update(patch).eq('id', id);
    if (error) throw new Error(error.message);
    await refetch();
  };

  const deletePaymentMethod = async (id: string) => {
    const { error } = await supabase.from('payment_methods').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await refetch();
  };

  const reorderPaymentMethods = async (reordered: PaymentMethod[]) => {
    await Promise.all(
      reordered.map((m, idx) =>
        supabase.from('payment_methods').update({ sort_order: idx + 1 }).eq('id', m.id),
      ),
    );
    await refetch();
  };

  return {
    paymentMethods,
    loading,
    error: null as string | null,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    reorderPaymentMethods,
    refetch,
    refetchAll: refetch,
  };
};
