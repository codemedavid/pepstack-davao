import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useCOAPageSetting = () => {
  const [coaPageEnabled, setCoaPageEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('id', 'coa_page_enabled')
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setCoaPageEnabled(true);
      } else {
        setCoaPageEnabled(String(data.value) === 'true');
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { coaPageEnabled, loading };
};
