import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface ShippingLocation {
    id: string;
    name: string;
    fee: number;
    is_active: boolean;
    order_index: number;
}

export const useShippingLocations = () => {
    const [data, setData] = useState<ShippingLocation[] | undefined>(undefined);

    const refetch = useCallback(async () => {
        const { data: rows, error } = await supabase
            .from('shipping_locations')
            .select('*')
            .eq('is_active', true)
            .order('order_index', { ascending: true });
        if (error) {
            console.error('useShippingLocations refetch error', error);
            setData([]);
            return;
        }
        setData((rows ?? []) as ShippingLocation[]);
    }, []);

    useEffect(() => { refetch(); }, [refetch]);

    const loading = data === undefined;
    const locations = useMemo<ShippingLocation[]>(() => (data ?? []) as ShippingLocation[], [data]);

    const getShippingFee = (locationId: string): number =>
        locations.find((l) => l.id === locationId)?.fee ?? 0;

    return { locations, loading, error: null as string | null, getShippingFee, refetch };
};

export const useShippingLocationsAdmin = () => {
    const [data, setData] = useState<ShippingLocation[] | undefined>(undefined);

    const refetch = useCallback(async () => {
        const { data: rows, error } = await supabase
            .from('shipping_locations')
            .select('*')
            .order('order_index', { ascending: true });
        if (error) {
            console.error('useShippingLocationsAdmin refetch error', error);
            setData([]);
            return;
        }
        setData((rows ?? []) as ShippingLocation[]);
    }, []);

    useEffect(() => { refetch(); }, [refetch]);

    const locations = (data ?? []) as ShippingLocation[];
    const loading = data === undefined;

    const updateLocation = async (id: string, updates: Partial<ShippingLocation>) => {
        const patch: Record<string, unknown> = {};
        if (updates.name !== undefined) patch.name = updates.name;
        if (updates.fee !== undefined) patch.fee = updates.fee;
        if (updates.is_active !== undefined) patch.is_active = updates.is_active;
        if (updates.order_index !== undefined) patch.order_index = updates.order_index;
        const { error } = await supabase.from('shipping_locations').update(patch).eq('id', id);
        if (error) throw new Error(error.message);
        await refetch();
    };

    const addLocation = async (
        location: Omit<ShippingLocation, 'order_index'> & { order_index?: number },
    ) => {
        const { error } = await supabase.from('shipping_locations').insert({
            id: location.id,
            name: location.name,
            fee: location.fee,
            is_active: location.is_active,
            order_index: location.order_index ?? locations.length + 1,
        });
        if (error) throw new Error(error.message);
        await refetch();
    };

    const deleteLocation = async (id: string) => {
        const { error } = await supabase.from('shipping_locations').delete().eq('id', id);
        if (error) throw new Error(error.message);
        await refetch();
    };

    return {
        locations,
        loading,
        error: null as string | null,
        updateLocation,
        addLocation,
        deleteLocation,
        refetch,
    };
};
