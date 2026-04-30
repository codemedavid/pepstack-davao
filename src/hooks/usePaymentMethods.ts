import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

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
  const data = useQuery(api.paymentMethods.list, {});
  const createMut = useMutation(api.paymentMethods.create);
  const updateMut = useMutation(api.paymentMethods.update);
  const deleteMut = useMutation(api.paymentMethods.remove);
  const reorderMut = useMutation(api.paymentMethods.reorder);

  const allMethods = (data ?? []) as PaymentMethod[];
  const paymentMethods = allMethods.filter((m) => m.active);
  const loading = data === undefined;

  const normalizeQr = (input: string | undefined | null): string => {
    const trimmed = String(input ?? '').trim();
    return trimmed === '' ? PLACEHOLDER_QR : trimmed;
  };

  const addPaymentMethod = async (method: Omit<PaymentMethod, 'created_at' | 'updated_at'>) => {
    return await createMut({
      name: method.name,
      account_number: method.account_number,
      account_name: method.account_name,
      qr_code_url: normalizeQr(method.qr_code_url),
      active: method.active,
      sort_order: method.sort_order,
    });
  };

  const updatePaymentMethod = async (id: string, updates: Partial<PaymentMethod>) => {
    await updateMut({
      id: id as Id<'paymentMethods'>,
      name: updates.name,
      account_number: updates.account_number,
      account_name: updates.account_name,
      qr_code_url: 'qr_code_url' in updates ? normalizeQr(updates.qr_code_url) : undefined,
      active: updates.active,
      sort_order: updates.sort_order,
    });
  };

  const deletePaymentMethod = async (id: string) => {
    await deleteMut({ id: id as Id<'paymentMethods'> });
  };

  const reorderPaymentMethods = async (reordered: PaymentMethod[]) => {
    await reorderMut({
      orderedIds: reordered.map((m) => m.id as Id<'paymentMethods'>),
    });
  };

  const noop = async () => {};

  return {
    paymentMethods,
    loading,
    error: null as string | null,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    reorderPaymentMethods,
    refetch: noop,
    refetchAll: noop,
  };
};
