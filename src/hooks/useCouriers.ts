import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

export interface Courier {
    id: string;
    name: string;
    code: string;
    tracking_url_template: string | null;
    is_active: boolean;
    sort_order: number;
    created_at: string;
}

export const useCouriers = () => {
    const data = useQuery(api.couriers.list, {});
    const createMut = useMutation(api.couriers.create);
    const updateMut = useMutation(api.couriers.update);
    const deleteMut = useMutation(api.couriers.remove);

    const couriers = (data ?? []) as Courier[];
    const loading = data === undefined;

    const addCourier = async (courier: Omit<Courier, 'id' | 'created_at'>) =>
        await createMut({
            code: courier.code,
            name: courier.name,
            tracking_url_template: courier.tracking_url_template,
            is_active: courier.is_active,
            sort_order: courier.sort_order,
        });

    const updateCourier = async (id: string, updates: Partial<Courier>) => {
        await updateMut({
            id: id as Id<'couriers'>,
            code: updates.code,
            name: updates.name,
            tracking_url_template: updates.tracking_url_template,
            is_active: updates.is_active,
            sort_order: updates.sort_order,
        });
    };

    const deleteCourier = async (id: string) => {
        await deleteMut({ id: id as Id<'couriers'> });
    };

    return {
        couriers,
        loading,
        addCourier,
        updateCourier,
        deleteCourier,
        refetch: () => {},
    };
};
