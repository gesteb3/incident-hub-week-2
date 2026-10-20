import { useEffect, useState } from 'react';
import { fetchCatalogs, type Catalogs } from '../api';
import { errorMessage } from './presentation';

export function useCatalogs() {
  const [catalogs, setCatalogs] = useState<Catalogs>({ categories: [], technicians: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetchCatalogs(controller.signal).then((data) => {
      if (!controller.signal.aborted) setCatalogs(data);
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(errorMessage(cause));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision]);
  return { catalogs, loading, error, retry: () => setRevision((value) => value + 1) };
}
