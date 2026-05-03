import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

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
    const [data, setData] = useState<Courier[] | undefined>(undefined);

    const refetch = useCallback(async () => {
        const { data: rows, error } = await supabase
            .from('couriers')
            .select('*')
            .order('sort_order', { ascending: true });
        if (error) {
            console.error('useCouriers refetch error', error);
            setData([]);
            return;
        }
        setData((rows ?? []) as Courier[]);
    }, []);

    useEffect(() => {
        refetch();
    }, [refetch]);

    const couriers = (data ?? []) as Courier[];
    const loading = data === undefined;

    const addCourier = async (courier: Omit<Courier, 'id' | 'created_at'>) => {
        const { data: row, error } = await supabase
            .from('couriers')
            .insert({
                code: courier.code,
                name: courier.name,
                tracking_url_template: courier.tracking_url_template,
                is_active: courier.is_active,
                sort_order: courier.sort_order,
            })
            .select()
            .single();
        if (error) throw new Error(error.message);
        await refetch();
        return row;
    };

    const updateCourier = async (id: string, updates: Partial<Courier>) => {
        const patch: Record<string, unknown> = {};
        if (updates.code !== undefined) patch.code = updates.code;
        if (updates.name !== undefined) patch.name = updates.name;
        if (updates.tracking_url_template !== undefined) patch.tracking_url_template = updates.tracking_url_template;
        if (updates.is_active !== undefined) patch.is_active = updates.is_active;
        if (updates.sort_order !== undefined) patch.sort_order = updates.sort_order;
        const { error } = await supabase.from('couriers').update(patch).eq('id', id);
        if (error) throw new Error(error.message);
        await refetch();
    };

    const deleteCourier = async (id: string) => {
        const { error } = await supabase.from('couriers').delete().eq('id', id);
        if (error) throw new Error(error.message);
        await refetch();
    };

    return {
        couriers,
        loading,
        addCourier,
        updateCourier,
        deleteCourier,
        refetch,
    };
};
