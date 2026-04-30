import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export const useCOAPageSetting = () => {
  const setting = useQuery(api.siteSettings.get, { key: 'coa_page_enabled' });
  const loading = setting === undefined;
  const coaPageEnabled = setting === null || setting === undefined ? true : setting.value === 'true';
  return { coaPageEnabled, loading };
};
