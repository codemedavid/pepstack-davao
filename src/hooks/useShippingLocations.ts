import { useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export interface ShippingLocation {
    id: string;
    name: string;
    fee: number;
    is_active: boolean;
    order_index: number;
}

export const useShippingLocations = () => {
    const data = useQuery(api.shippingLocations.list, { activeOnly: true });
    const loading = data === undefined;
    const locations = useMemo<ShippingLocation[]>(() => (data ?? []) as ShippingLocation[], [data]);

    const getShippingFee = (locationId: string): number =>
        locations.find((l) => l.id === locationId)?.fee ?? 0;

    return { locations, loading, error: null as string | null, getShippingFee, refetch: () => {} };
};

export const useShippingLocationsAdmin = () => {
    const data = useQuery(api.shippingLocations.list, {});
    const createMut = useMutation(api.shippingLocations.create);
    const updateMut = useMutation(api.shippingLocations.update);
    const deleteMut = useMutation(api.shippingLocations.remove);

    const locations = (data ?? []) as ShippingLocation[];
    const loading = data === undefined;

    const updateLocation = async (id: string, updates: Partial<ShippingLocation>) => {
        await updateMut({
            code: id,
            name: updates.name,
            fee: updates.fee,
            is_active: updates.is_active,
            order_index: updates.order_index,
        });
    };

    const addLocation = async (
        location: Omit<ShippingLocation, 'order_index'> & { order_index?: number },
    ) => {
        await createMut({
            code: location.id,
            name: location.name,
            fee: location.fee,
            is_active: location.is_active,
            order_index: location.order_index ?? locations.length + 1,
        });
    };

    const deleteLocation = async (id: string) => {
        await deleteMut({ code: id });
    };

    return {
        locations,
        loading,
        error: null as string | null,
        updateLocation,
        addLocation,
        deleteLocation,
        refetch: () => {},
    };
};
