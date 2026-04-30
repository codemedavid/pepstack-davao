import { useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
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

export const useSiteSettings = () => {
  const data = useQuery(api.siteSettings.list, {});
  const upsertOne = useMutation(api.siteSettings.upsert);
  const upsertMany = useMutation(api.siteSettings.upsertMany);

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
    await upsertOne({ key: id, value });
  };

  const updateSiteSettings = async (updates: Partial<SiteSettings>) => {
    const entries = Object.entries(updates).map(([key, value]) => ({
      key,
      value: String(value),
      type: 'text' as const,
    }));
    await upsertMany({ entries });
  };

  return {
    siteSettings,
    loading,
    error: null as string | null,
    updateSiteSetting,
    updateSiteSettings,
    refetch: () => {},
  };
};
