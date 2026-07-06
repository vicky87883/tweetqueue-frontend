import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BriefcaseBusiness, MapPin, Sparkles } from 'lucide-react';
import { MobileAppDock } from '@/components/mobile-app-dock';
import { jobs } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Careers at TweetQueue - Build the X Scheduling Platform',
  description:
    'Join TweetQueue and help creators, founders, and teams plan better X and Twitter content workflows.',
  alternates: {
    canonical: '/careers',
  },
};

const values = [
  'Ship calm tools for serious creators',
  'Care about mobile-first product quality',
  'Use clear writing and simple systems',
  'Build with security and reliability in mind',
];

export default function CareersPage() {
  return (
    <main className="min-h-dvh bg-black pb-24 text-white md:pb-0">
      <section className="border-b border-gray-800 bg-zinc-950 px-4 py-7 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to TweetQueue
          </Link>

          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-black px-3 py-1.5 text-sm text-[#1DA1F2]">
                <BriefcaseBusiness className="h-4 w-4" />
                Careers
              </div>
              <h1 className="text-balance text-4xl font-black leading-tight sm:text-6xl">
                Build the operating system for X creators
              </h1>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg">
              TweetQueue is building focused tools for planning, scheduling, analytics,
              and creator workflows. We care about fast product surfaces, clear writing,
              and production-ready systems.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="space-y-4">
            <div className="rounded-3xl border border-gray-800 bg-zinc-950 p-6">
              <Sparkles className="mb-4 h-7 w-7 text-[#1DA1F2]" />
              <h2 className="text-2xl font-bold">How we work</h2>
              <div className="mt-5 space-y-3">
                {values.map((value) => (
                  <div key={value} className="rounded-2xl border border-gray-800 bg-black p-4 text-sm text-gray-300">
                    {value}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="space-y-4">
            {jobs.map((job) => (
              <Link
                key={job.slug}
                href={`/careers/${job.slug}`}
                className="card group block rounded-3xl p-5 sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-3 w-fit rounded-full bg-zinc-900 px-3 py-1 text-xs text-[#1DA1F2]">
                      {job.department}
                    </div>
                    <h2 className="text-2xl font-bold group-hover:text-[#1DA1F2]">{job.title}</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-400">
                      {job.summary}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-2xl border border-gray-800 bg-black p-4 text-sm text-gray-400 sm:min-w-44">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#1DA1F2]" />
                      {job.location}
                    </div>
                    <div className="mt-2">{job.type}</div>
                    <div className="mt-2 text-white">{job.salary}</div>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        </div>
      </section>

      <MobileAppDock />
    </main>
  );
}
