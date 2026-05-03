import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: string;
    order_index: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface FAQCategory {
    id: string;
    name: string;
    icon: string;
    order_index: number;
}

const now = new Date().toISOString();
const makeFAQ = (id: string, question: string, answer: string, category: string, order_index: number): FAQItem => ({
    id,
    question,
    answer,
    category,
    order_index,
    is_active: true,
    created_at: now,
    updated_at: now,
});

const defaultFAQs: FAQItem[] = [
    makeFAQ('1', 'Are your products on-hand?', 'Yes. All products are on-hand unless stated otherwise.', 'ORDERING & PACKAGING', 1),
    makeFAQ('2', 'What does "with inclusions" mean?', '"With inclusions" means the product comes with the listed included items shown on the product page.', 'ORDERING & PACKAGING', 2),
    makeFAQ('3', 'Are prices fixed?', 'Prices may change without prior notice depending on supply, shipping, and sourcing costs.', 'ORDERING & PACKAGING', 3),
    makeFAQ('4', 'Can I cancel my order after payment?', 'Once an order has been confirmed and prepared for processing, cancellation may no longer be allowed.', 'ORDERING & PACKAGING', 4),
    makeFAQ('5', 'What if my order arrives damaged, incomplete, or incorrect?', 'Please contact us within 24 hours of receiving your order and provide clear photos and a full unboxing video, if available, so the issue can be reviewed properly.', 'ORDERING & PACKAGING', 5),
    makeFAQ('6', 'Do you offer refunds or replacements after reconstitution?', 'No. Any gelling, cloudiness, clumping, contamination, or damage during or after reconstitution does not qualify for a refund or replacement.', 'ORDERING & PACKAGING', 6),

    makeFAQ('7', 'Why do vial cap colors sometimes differ?', 'Vial cap colors may vary by batch and supplier availability. This does not automatically mean the product itself is different.', 'PRODUCT & USAGE', 7),
    makeFAQ('8', 'Do you provide COAs?', 'COAs may be available for selected products when provided by the supplier or manufacturer.', 'PRODUCT & USAGE', 8),
    makeFAQ('9', 'Are these FDA-approved?', 'No. Products on this site are provided as research compounds for in vitro / in vivo laboratory research only. They are not medications, are not FDA-approved, and are not intended for use in humans or animals.', 'PRODUCT & USAGE', 9),
    makeFAQ('10', 'Do you provide medical advice?', 'No. Any guides, protocols, or information shared are for educational purposes only and are based on commonly seen references and personal experience. They do not replace medical advice, diagnosis, or treatment.', 'PRODUCT & USAGE', 10),
    makeFAQ('11', 'Do you have a partner doctor?', "No. It's hard to prove their legitimacy especially since these consultations are done online. You might want to visit a doctor near you instead. Be careful.", 'PRODUCT & USAGE', 11),

    makeFAQ('12', 'Do you offer COD?', 'No. We do not offer cash on delivery.', 'PAYMENT METHODS', 12),

    makeFAQ('13', 'Where do you ship from?', 'Orders ship from Davao City.', 'SHIPPING & DELIVERY', 13),
    makeFAQ('14', 'Do you do meet-ups or pick-ups?', 'We appreciate the interest, but we do not accommodate meet-ups or pick-ups at this time. All orders are shipped via courier.', 'SHIPPING & DELIVERY', 14),
    makeFAQ('15', 'What courier do you use?', 'We usually ship via J&T. Local delivery options may be available depending on rider availability and location.', 'SHIPPING & DELIVERY', 15),
    makeFAQ('16', 'When will my order be shipped?', 'Orders are processed in the order they are received. Orders placed after cut-off, on weekends, holidays, or outside business hours may be shipped the next business day.', 'SHIPPING & DELIVERY', 16),
    makeFAQ('17', 'Do you accept rush orders?', 'No. All orders are processed in the order they are received.', 'SHIPPING & DELIVERY', 17),
    makeFAQ('18', 'Can I track my order?', 'You can check your order status on the Track Order page using your Order ID, which is found in your order confirmation message. Tracking details are updated as they become available — I may not be able to message everyone individually once their order ships, so please check the Track Order page for updates.', 'SHIPPING & DELIVERY', 18),
    makeFAQ('19', 'What if I entered the wrong shipping details?', 'Please contact us as soon as possible. Changes can only be made if the order has not yet been packed or shipped.', 'SHIPPING & DELIVERY', 19),
    makeFAQ('20', 'What if my package is delayed?', 'Once shipped, delivery speed depends on the courier. Delays caused by the courier, weather, customs, holidays, or other external factors are beyond our control.', 'SHIPPING & DELIVERY', 20),
];

export const useFAQs = () => {
    const [data, setData] = useState<FAQItem[] | undefined>(undefined);

    const refetch = useCallback(async () => {
        const { data: rows, error } = await supabase
            .from('faqs')
            .select('*')
            .eq('is_active', true)
            .order('order_index', { ascending: true });
        if (error) {
            console.error('useFAQs refetch error', error);
            setData([]);
            return;
        }
        setData((rows ?? []) as FAQItem[]);
    }, []);

    useEffect(() => { refetch(); }, [refetch]);

    const loading = data === undefined;
    const faqs = useMemo<FAQItem[]>(() => {
        const list = (data ?? []) as FAQItem[];
        return list.length > 0 ? list : defaultFAQs;
    }, [data]);
    const categories = useMemo(
        () => [...new Set(faqs.map((f) => f.category))],
        [faqs],
    );
    return { faqs, categories, loading, error: null as string | null, refetch };
};

export const useFAQsAdmin = () => {
    const [data, setData] = useState<FAQItem[] | undefined>(undefined);

    const refetch = useCallback(async () => {
        const { data: rows, error } = await supabase
            .from('faqs')
            .select('*')
            .order('order_index', { ascending: true });
        if (error) {
            console.error('useFAQsAdmin refetch error', error);
            setData([]);
            return;
        }
        setData((rows ?? []) as FAQItem[]);
    }, []);

    useEffect(() => { refetch(); }, [refetch]);

    const list = (data ?? []) as FAQItem[];
    const usingDefaults = data !== undefined && list.length === 0;
    const faqs = list.length > 0 ? list : defaultFAQs;
    const loading = data === undefined;

    const addFAQ = async (faq: Omit<FAQItem, 'id' | 'created_at' | 'updated_at'>) => {
        const { data: row, error } = await supabase
            .from('faqs')
            .insert({
                question: faq.question,
                answer: faq.answer,
                category: faq.category,
                order_index: faq.order_index,
                is_active: faq.is_active,
            })
            .select()
            .single();
        if (error) throw new Error(error.message);
        await refetch();
        return row;
    };

    const updateFAQ = async (id: string, updates: Partial<FAQItem>) => {
        const patch: Record<string, unknown> = {};
        if (updates.question !== undefined) patch.question = updates.question;
        if (updates.answer !== undefined) patch.answer = updates.answer;
        if (updates.category !== undefined) patch.category = updates.category;
        if (updates.order_index !== undefined) patch.order_index = updates.order_index;
        if (updates.is_active !== undefined) patch.is_active = updates.is_active;
        const { error } = await supabase.from('faqs').update(patch).eq('id', id);
        if (error) throw new Error(error.message);
        await refetch();
    };

    const deleteFAQ = async (id: string) => {
        const { error } = await supabase.from('faqs').delete().eq('id', id);
        if (error) throw new Error(error.message);
        await refetch();
    };

    const seedDefaults = async () => {
        const payload = defaultFAQs.map(({ question, answer, category, order_index, is_active }) => ({
            question,
            answer,
            category,
            order_index,
            is_active,
        }));
        const { error } = await supabase.from('faqs').insert(payload);
        if (error) throw new Error(error.message);
        await refetch();
    };

    return {
        faqs,
        loading,
        error: null as string | null,
        usingDefaults,
        addFAQ,
        updateFAQ,
        deleteFAQ,
        seedDefaults,
        refetch,
    };
};
