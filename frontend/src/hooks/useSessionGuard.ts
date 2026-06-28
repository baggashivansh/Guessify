import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPartySession, clearPartySession } from '../utils/storage';
import { normalizeResourceCode } from '../utils/validation';

export function usePartySessionGuard(redirectTo?: string) {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const normalized = normalizeResourceCode(code);

  useEffect(() => {
    if (!normalized) {
      navigate('/', { replace: true });
      return;
    }
    const session = getPartySession(normalized);
    if (!session && redirectTo) {
      navigate(`/party/${normalized}`, { replace: true });
    }
  }, [code, normalized, navigate, redirectTo]);

  if (!normalized) return null;
  const session = getPartySession(normalized);
  if (!session && redirectTo) return null;
  return { code: normalized, session };
}

export function useInvalidCodeRedirect() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const normalized = normalizeResourceCode(code);

  useEffect(() => {
    if (code && !normalized) {
      navigate('/', { replace: true });
    }
  }, [code, normalized, navigate]);

  return normalized;
}

export function invalidatePartySession(code: string) {
  clearPartySession(code);
}
