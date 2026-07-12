import Link from 'next/link';
import { CheckCircle2, MailCheck, XCircle } from 'lucide-react';
import { MobileAppDock } from '@/components/mobile-app-dock';

type VerifyEmailPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { status } = await searchParams;
  const verified = status === 'verified';
  const invalid = status === 'invalid';

  return (
    <main className="mobile-safe-page flex min-h-dvh items-center justify-center bg-black px-4 text-white sm:px-6">
      <section className="w-full max-w-lg rounded-[2rem] border border-gray-800 bg-zinc-950 p-6 text-center shadow-2xl shadow-black/40 sm:p-8">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-black">
          {verified ? (
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          ) : invalid ? (
            <XCircle className="h-8 w-8 text-red-400" />
          ) : (
            <MailCheck className="h-8 w-8 text-[#1DA1F2]" />
          )}
        </div>

        <h1 className="text-3xl font-black sm:text-4xl">
          {verified ? 'Email verified' : invalid ? 'Verification link expired' : 'Check your inbox'}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-gray-400">
          {verified
            ? 'Your account is active. You can now sign in and open your dashboard.'
            : invalid
              ? 'This verification link is invalid or expired. Register again or request a new verification email from sign in support.'
              : 'Open the verification email from TweetQueue and click the secure link to activate your account.'}
        </p>

        <Link
          href={verified ? '/login' : '/register'}
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[#1DA1F2] px-8 font-bold text-black hover:bg-sky-400"
        >
          {verified ? 'Sign in' : 'Back to register'}
        </Link>
      </section>
      <MobileAppDock />
    </main>
  );
}
