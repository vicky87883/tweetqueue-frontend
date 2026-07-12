import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Mail, MapPin } from 'lucide-react';
import { MobileAppDock } from '@/components/mobile-app-dock';
import { jobs } from '@/lib/content';
import { getPublicJob } from '@/lib/public-content';

type JobPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return jobs.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getPublicJob(slug);

  if (!job) return {};

  return {
    title: `${job.title} at TweetQueue`,
    description: job.summary,
    alternates: { canonical: `/careers/${job.slug}` },
  };
}

export default async function JobPage({ params }: JobPageProps) {
  const { slug } = await params;
  const job = await getPublicJob(slug);

  if (!job) notFound();

  const numericSalary = job.salary.match(/\$([\d,]+)/g)?.map((value) => Number(value.replace(/[$,]/g, '')));
  const jobJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: `${job.summary} Responsibilities: ${job.responsibilities.join(' ')} Requirements: ${job.requirements.join(' ')}`,
    datePosted: job.postedAt,
    validThrough: job.validThrough,
    employmentType: job.type.toUpperCase().replace('-', '_'),
    hiringOrganization: { '@type': 'Organization', name: 'TweetQueue', sameAs: 'https://tweetqueue.com' },
    jobLocationType: 'TELECOMMUTE',
    ...(numericSalary?.length === 2
      ? {
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: 'USD',
            value: { '@type': 'QuantitativeValue', minValue: numericSalary[0], maxValue: numericSalary[1], unitText: job.salary.includes('hour') ? 'HOUR' : 'YEAR' },
          },
        }
      : {}),
  };

  return (
    <main className="min-h-dvh bg-black pb-24 text-white md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobJsonLd) }} />

      <section className="border-b border-gray-800 bg-zinc-950 px-4 py-7 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-4xl">
          <Link href="/careers" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to careers
          </Link>

          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-black px-3 py-1.5 text-[#1DA1F2]">{job.department}</span>
            <span className="inline-flex items-center gap-2 text-gray-500"><MapPin className="h-4 w-4" />{job.location}</span>
            <span className="text-gray-500">{job.type}</span>
          </div>

          <h1 className="text-balance text-4xl font-black leading-tight sm:text-6xl">{job.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-gray-400 sm:text-xl">{job.summary}</p>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_18rem]">
          <article className="space-y-8">
            <section className="rounded-3xl border border-gray-800 bg-zinc-950 p-6 sm:p-8">
              <h2 className="text-2xl font-bold">Responsibilities</h2>
              <div className="mt-5 space-y-3">
                {job.responsibilities.map((item) => (
                  <div key={item} className="flex gap-3 text-gray-300"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1DA1F2]" /><span>{item}</span></div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-gray-800 bg-zinc-950 p-6 sm:p-8">
              <h2 className="text-2xl font-bold">Requirements</h2>
              <div className="mt-5 space-y-3">
                {job.requirements.map((item) => (
                  <div key={item} className="flex gap-3 text-gray-300"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1DA1F2]" /><span>{item}</span></div>
                ))}
              </div>
            </section>
          </article>

          <aside className="h-fit rounded-3xl border border-gray-800 bg-zinc-950 p-6">
            <h2 className="text-xl font-bold">Role details</h2>
            <div className="mt-5 space-y-3 text-sm text-gray-400">
              <div>{job.location}</div>
              <div>{job.type}</div>
              <div className="text-white">{job.salary}</div>
              <div>Posted {job.postedAt}</div>
            </div>
            <a href={`mailto:careers@tweetqueue.com?subject=${encodeURIComponent(job.title)}`} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-black hover:bg-gray-200">
              <Mail className="h-4 w-4" />
              Apply by email
            </a>
          </aside>
        </div>
      </section>

      <MobileAppDock />
    </main>
  );
}
