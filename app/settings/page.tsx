'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, KeyRound, ShieldCheck, TestTube2 } from 'lucide-react';
import { AppMobileDock } from '@/components/app-mobile-dock';
import { ApiError, apiFetch } from '@/lib/api';
import { clearSession, getSession } from '@/lib/session';

type KeysResponse = {
  apiKey?: string;
  accessToken?: string | null;
};

type MutationResponse = {
  success: boolean;
  error?: string;
  message?: string;
};

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [accessSecret, setAccessSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState('');
  const [message, setMessage] = useState('');
  const [savedKeys, setSavedKeys] = useState<KeysResponse | null>(null);
  const router = useRouter();
  const hasCredentialDraft = [apiKey, apiSecret, accessToken, accessSecret].some((value) =>
    value.trim()
  );
  const canSave = hasCredentialDraft && !loading;

  function handleAuthError(error: unknown) {
    if (error instanceof ApiError && [401, 403].includes(error.status)) {
      clearSession();
      router.push('/login');
      return true;
    }
    return false;
  }

  async function loadExistingKeys(token: string) {
    try {
      const data = await apiFetch<KeysResponse>('/api/keys', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.apiKey) {
        setSavedKeys(data);
        setMessage('Credentials are already saved.');
      }
    } catch (err) {
      if (!handleAuthError(err)) {
        setMessage(err instanceof Error ? err.message : 'Could not load saved credentials.');
      }
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const session = getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      loadExistingKeys(session.token);
    }, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const saveKeys = async () => {
    setLoading(true);
    setMessage('');
    setTestResult('');
    const session = getSession();

    if (!session) {
      setLoading(false);
      router.push('/login');
      return;
    }

    if (!hasCredentialDraft) {
      setMessage('Add at least one credential value before saving.');
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch<MutationResponse>('/api/keys', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ apiKey, apiSecret, accessToken, accessSecret }),
      });

      if (data.success) {
        setMessage('API credentials saved securely.');
        setSavedKeys({
          apiKey: 'Saved',
          accessToken: accessToken ? 'Saved' : null,
        });
        setApiKey('');
        setApiSecret('');
        setAccessToken('');
        setAccessSecret('');
      } else {
        setMessage(data.error || 'Failed to save credentials.');
      }
    } catch (err) {
      if (!handleAuthError(err)) {
        setMessage(err instanceof Error ? err.message : 'Could not save credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setMessage('');
    const session = getSession();

    if (!session) {
      setLoading(false);
      router.push('/login');
      return;
    }

    try {
      const data = await apiFetch<MutationResponse>('/api/test-connection', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.token}` },
      });

      setTestResult(data.message || 'Connection tested');
    } catch (err) {
      if (!handleAuthError(err)) {
        setTestResult(err instanceof Error ? err.message : 'Could not verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-safe-page bg-black px-3 text-white sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="app-top-glass sticky top-0 z-30 -mx-3 mb-5 flex items-center justify-between gap-4 border-b border-gray-900 px-3 py-3 sm:static sm:mx-0 sm:mb-8 sm:border-b-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Settings</h1>
            <p className="mt-1 text-sm text-gray-500 sm:text-base">
              Connect X credentials and verify publishing access.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-800 text-gray-300 hover:bg-gray-900 hover:text-white sm:w-auto sm:px-4"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5 sm:mr-2" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_21rem]">
          <section className="mobile-surface rounded-[1.75rem] p-5 sm:rounded-3xl sm:p-8">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black">
                <KeyRound className="h-5 w-5 text-[#1DA1F2]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold sm:text-2xl">
                  X API credentials
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Values are sent to the backend only when you save.
                </p>
              </div>
            </div>

            {savedKeys?.apiKey && (
              <div className="mb-6 flex gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300 sm:text-base">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <span>
                  Saved credentials detected
                  {savedKeys.apiKey !== 'Saved' ? `: ${savedKeys.apiKey}` : ''}.
                  {savedKeys.accessToken ? ' Access token is also saved.' : ''}
                </span>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
              <div>
                <label className="mb-2 block text-xs text-gray-400 sm:text-sm" htmlFor="apiKey">
                  API Key
                </label>
                <input
                  id="apiKey"
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="min-h-12 w-full rounded-2xl border border-gray-700 bg-black px-4 py-3 text-base outline-none focus:border-[#1DA1F2]"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-gray-400 sm:text-sm" htmlFor="apiSecret">
                  API Secret
                </label>
                <input
                  id="apiSecret"
                  type="password"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  className="min-h-12 w-full rounded-2xl border border-gray-700 bg-black px-4 py-3 text-base outline-none focus:border-[#1DA1F2]"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-gray-400 sm:text-sm" htmlFor="accessToken">
                  Access Token
                </label>
                <input
                  id="accessToken"
                  type="text"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="min-h-12 w-full rounded-2xl border border-gray-700 bg-black px-4 py-3 text-base outline-none focus:border-[#1DA1F2]"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-gray-400 sm:text-sm" htmlFor="accessSecret">
                  Access Token Secret
                </label>
                <input
                  id="accessSecret"
                  type="password"
                  value={accessSecret}
                  onChange={(e) => setAccessSecret(e.target.value)}
                  className="min-h-12 w-full rounded-2xl border border-gray-700 bg-black px-4 py-3 text-base outline-none focus:border-[#1DA1F2]"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={saveKeys}
                disabled={!canSave}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-3xl bg-[#1DA1F2] py-3.5 text-sm font-bold text-black disabled:opacity-50 sm:text-base"
              >
                <ShieldCheck className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save Credentials'}
              </button>
              <button
                type="button"
                onClick={testConnection}
                disabled={loading}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-3xl border border-gray-700 py-3.5 text-sm hover:bg-gray-900 disabled:opacity-60 sm:text-base"
              >
                <TestTube2 className="h-4 w-4" />
                Test Connection
              </button>
            </div>

            {message && (
              <p className="mt-5 rounded-2xl border border-gray-800 bg-black px-4 py-3 text-center text-sm sm:text-base">
                {message}
              </p>
            )}
            {testResult && (
              <p className="mt-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-300 sm:text-base">
                {testResult}
              </p>
            )}
          </section>

          <aside className="space-y-4">
            <div className="mobile-surface rounded-[1.75rem] p-5 sm:rounded-3xl">
              <h3 className="text-lg font-semibold">Setup flow</h3>
              <div className="mt-4 space-y-3">
                {[
                  'Create X developer credentials',
                  'Paste API and access token values',
                  'Save, then test the connection',
                  'Return to the dashboard queue',
                ].map((item, index) => (
                  <div key={item} className="flex gap-3 text-sm text-gray-300">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs text-[#1DA1F2]">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mobile-surface rounded-[1.75rem] p-5 sm:rounded-3xl">
              <h3 className="text-lg font-semibold">Production reminder</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                On Vercel, set the backend API URL in the frontend and the database,
                JWT, encryption, admin, and X secrets in the backend project.
              </p>
            </div>
          </aside>
        </div>
      </div>
      <AppMobileDock />
    </div>
  );
}
