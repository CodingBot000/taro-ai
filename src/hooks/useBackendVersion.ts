'use client';

import { useEffect, useState } from 'react';
import { buildApiUrl } from '@/lib/api';
import type { BackendVersionResponse } from '@/types';

export function useBackendVersion(accessToken: string | null) {
  const [backendVersion, setBackendVersion] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadBackendVersion = async () => {
      try {
        const response = await fetch(buildApiUrl('/api/version'), {
          headers: accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
              }
            : undefined,
          credentials: 'include',
          cache: 'no-store',
        });
        if (!response.ok) {
          return;
        }

        const data: BackendVersionResponse = await response.json();
        if (isMounted && data.version) {
          setBackendVersion(data.version);
        }
      } catch {
        if (isMounted) {
          setBackendVersion(null);
        }
      }
    };

    void loadBackendVersion();

    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  return {
    backendVersion,
    setBackendVersion,
  };
}
