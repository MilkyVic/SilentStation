import { ui, useLocale } from '../preferences/ui';
import { useEffect, useState } from 'react';
import { DEMO_MODE } from '../../services/surveyService';
import { readinessMessage } from './backend-status';

export default function BackendStatus() {
  useLocale();
  const [status, setStatus] = useState<string | null>(null);
  useEffect(() => {
    if (DEMO_MODE) return;
    let active = true;
    const abort = new AbortController(), timeout = setTimeout(() => abort.abort(), 5000);
    fetch('/api/ready', { credentials: 'omit', cache: 'no-store', signal: abort.signal })
      .then(async response => {
        const payload = await response.json();
        if (active) setStatus(readinessMessage(response.ok, payload));
      })
      .catch(() => { if (active) setStatus('API chưa kết nối'); })
      .finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); abort.abort(); };
  }, []);
  return status ? <div className="backend-status" role="status">{ui(status)}</div> : null;
}
