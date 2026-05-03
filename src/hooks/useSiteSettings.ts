import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { SiteSettings } from '../types';

const DEFAULTS: SiteSettings = {
  site_name: 'RSPEPTIDE',
  site_logo: '/logo.png',
  site_description: '',
  currency: 'PHP',
  currency_code: 'PHP',
  hero_badge_text: 'Premium Peptide Solutions',
  hero_title_prefix: 'Premium',
  hero_title_highlight: 'Peptides',
  hero_title_suffix: '& Essentials',
  hero_subtext: 'From the Lab to You — Simplifying Science, One Dose at a Time.',
  hero_tagline: 'Quality-tested products. Reliable performance. Trusted by our community.',
  hero_description: 'RSPEPTIDE provides research-grade peptides engineered for precision, purity, and consistency.',
  hero_accent_color: 'gold-500',
  contact_whatsapp_enabled: 'false',
  contact_whatsapp_number: '',
  contact_telegram_enabled: 'false',
  contact_telegram_link: '',
};

interface SiteSettingRow {
  id: string;
  value: string;
  type?: string;
  description?: string | null;
}

export const useSiteSettings = () => {
  const [data, setData] = useState<SiteSettingRow[] | undefined>(undefined);

  const refetch = useCallback(async () => {
    const { data: rows, error } = await supabase.from('site_settings').select('*');
    if (error) {
      console.error('useSiteSettings refetch error', error);
      setData([]);
      return;
    }
    setData((rows ?? []) as SiteSettingRow[]);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const loading = data === undefined;

  const siteSettings = useMemo<SiteSettings | null>(() => {
    if (loading) return null;
    const map = new Map<string, string>();
    for (const row of data ?? []) map.set(row.id, row.value);
    return {
      ...DEFAULTS,
      ...Object.fromEntries(
        Object.keys(DEFAULTS).map((key) => [key, map.get(key) ?? (DEFAULTS as any)[key]]),
      ),
    } as SiteSettings;
  }, [data, loading]);

  const updateSiteSetting = async (id: string, value: string) => {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ id, value, type: 'text' }, { onConflict: 'id' });
    if (error) throw new Error(error.message);
    await refetch();
  };

  const updateSiteSettings = async (updates: Partial<SiteSettings>) => {
    const entries = Object.entries(updates).map(([key, value]) => ({
      id: key,
      value: String(value),
      type: 'text',
    }));
    if (entries.length === 0) return;
    const { error } = await supabase
      .from('site_settings')
      .upsert(entries, { onConflict: 'id' });
    if (error) throw new Error(error.message);
    await refetch();
  };

  return {
    siteSettings,
    loading,
    error: null as string | null,
    updateSiteSetting,
    updateSiteSettings,
    refetch,
  };
};
