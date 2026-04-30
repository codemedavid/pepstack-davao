import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

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
    const data = useQuery(api.protocols.list, {});
    const createMut = useMutation(api.protocols.create);
    const updateMut = useMutation(api.protocols.update);
    const deleteMut = useMutation(api.protocols.remove);

    const protocols = (data ?? []) as Protocol[];
    const loading = data === undefined;

    const addProtocol = async (protocol: Omit<Protocol, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const result = await createMut({
                name: protocol.name,
                category: protocol.category,
                dosage: protocol.dosage,
                frequency: protocol.frequency,
                duration: protocol.duration,
                notes: protocol.notes,
                storage: protocol.storage,
                sort_order: protocol.sort_order,
                active: protocol.active,
                product_id: protocol.product_id ? (protocol.product_id as Id<'products'>) : null,
                image_url: protocol.image_url ?? null,
                content_type: protocol.content_type ?? 'text',
                file_url: protocol.file_url ?? null,
            });
            return { success: true as const, data: result };
        } catch (err) {
            return {
                success: false as const,
                error: err instanceof Error ? err.message : 'Failed to add protocol',
            };
        }
    };

    const updateProtocol = async (id: string, updates: Partial<Protocol>) => {
        try {
            await updateMut({
                id: id as Id<'protocols'>,
                name: updates.name,
                category: updates.category,
                dosage: updates.dosage,
                frequency: updates.frequency,
                duration: updates.duration,
                notes: updates.notes,
                storage: updates.storage,
                sort_order: updates.sort_order,
                active: updates.active,
                product_id:
                    updates.product_id === undefined
                        ? undefined
                        : updates.product_id
                          ? (updates.product_id as Id<'products'>)
                          : null,
                image_url: updates.image_url,
                content_type: updates.content_type,
                file_url: updates.file_url,
            });
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
            await deleteMut({ id: id as Id<'protocols'> });
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
        fetchProtocols: async () => {},
        addProtocol,
        updateProtocol,
        deleteProtocol,
        toggleActive,
    };
}
