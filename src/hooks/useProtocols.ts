import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Protocol {
    id: string;
    name: string;
    category: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes: string[];
    storage: string;
    sort_order: number;
    active: boolean;
    product_id?: string;
    image_url?: string | null;
    content_type?: string;
    file_url?: string | null;
    created_at: string;
    updated_at: string;
}

export function useProtocols() {
    const [data, setData] = useState<Protocol[] | undefined>(undefined);

    const refetch = useCallback(async () => {
        const { data: rows, error } = await supabase
            .from('protocols')
            .select('*')
            .order('sort_order', { ascending: true });
        if (error) {
            console.error('useProtocols refetch error', error);
            setData([]);
            return;
        }
        setData((rows ?? []) as Protocol[]);
    }, []);

    useEffect(() => { refetch(); }, [refetch]);

    const protocols = (data ?? []) as Protocol[];
    const loading = data === undefined;

    const addProtocol = async (protocol: Omit<Protocol, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const { data: row, error } = await supabase
                .from('protocols')
                .insert({
                    name: protocol.name,
                    category: protocol.category,
                    dosage: protocol.dosage,
                    frequency: protocol.frequency,
                    duration: protocol.duration,
                    notes: protocol.notes,
                    storage: protocol.storage,
                    sort_order: protocol.sort_order,
                    active: protocol.active,
                    product_id: protocol.product_id ?? null,
                    image_url: protocol.image_url ?? null,
                    content_type: protocol.content_type ?? 'text',
                    file_url: protocol.file_url ?? null,
                })
                .select()
                .single();
            if (error) throw new Error(error.message);
            await refetch();
            return { success: true as const, data: row };
        } catch (err) {
            return {
                success: false as const,
                error: err instanceof Error ? err.message : 'Failed to add protocol',
            };
        }
    };

    const updateProtocol = async (id: string, updates: Partial<Protocol>) => {
        try {
            const patch: Record<string, unknown> = {};
            if (updates.name !== undefined) patch.name = updates.name;
            if (updates.category !== undefined) patch.category = updates.category;
            if (updates.dosage !== undefined) patch.dosage = updates.dosage;
            if (updates.frequency !== undefined) patch.frequency = updates.frequency;
            if (updates.duration !== undefined) patch.duration = updates.duration;
            if (updates.notes !== undefined) patch.notes = updates.notes;
            if (updates.storage !== undefined) patch.storage = updates.storage;
            if (updates.sort_order !== undefined) patch.sort_order = updates.sort_order;
            if (updates.active !== undefined) patch.active = updates.active;
            if (updates.product_id !== undefined) patch.product_id = updates.product_id || null;
            if (updates.image_url !== undefined) patch.image_url = updates.image_url;
            if (updates.content_type !== undefined) patch.content_type = updates.content_type;
            if (updates.file_url !== undefined) patch.file_url = updates.file_url;
            const { error } = await supabase.from('protocols').update(patch).eq('id', id);
            if (error) throw new Error(error.message);
            await refetch();
            return { success: true as const };
        } catch (err) {
            return {
                success: false as const,
                error: err instanceof Error ? err.message : 'Failed to update protocol',
            };
        }
    };

    const deleteProtocol = async (id: string) => {
        try {
            const { error } = await supabase.from('protocols').delete().eq('id', id);
            if (error) throw new Error(error.message);
            await refetch();
            return { success: true as const };
        } catch (err) {
            return {
                success: false as const,
                error: err instanceof Error ? err.message : 'Failed to delete protocol',
            };
        }
    };

    const toggleActive = (id: string, active: boolean) => updateProtocol(id, { active });

    return {
        protocols,
        loading,
        error: null as string | null,
        fetchProtocols: refetch,
        addProtocol,
        updateProtocol,
        deleteProtocol,
        toggleActive,
    };
}
