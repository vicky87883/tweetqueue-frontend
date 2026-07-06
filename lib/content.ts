export type BlogPost = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
  intro: string;
  sections: Array<{
    heading: string;
    body: string[];
  }>;
  checklist: string[];
};

export type JobPost = {
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  postedAt: string;
  validThrough: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-tweet-on-twitter-x',
    title: 'How to Tweet on Twitter/X: A Practical Posting Guide',
    seoTitle: 'How to Tweet on Twitter/X: Step-by-Step Guide for Better Posts',
    description:
      'Learn how to tweet on Twitter/X with stronger hooks, clearer structure, hashtags, timing, and a repeatable posting workflow.',
    category: 'Twitter Basics',
    readTime: '7 min read',
    date: '2026-05-17',
    image: '/dashboard-preview.svg',
    intro:
      'Posting on X looks simple from the outside: write a thought, publish it, and move on. The creators and teams that grow consistently treat every tweet like a small communication system with a clear point, a strong first line, and a next action.',
    sections: [
      {
        heading: 'Start with one clear idea',
        body: [
          'A good tweet should be easy to understand in one pass. Before writing, decide whether the post is teaching, announcing, asking, entertaining, or inviting discussion. Mixing too many goals makes the post feel vague.',
          'For a simple structure, write the core idea first, then add the context. If the post still feels long, turn the supporting points into a thread or save them for later posts.',
        ],
      },
      {
        heading: 'Write the hook before the body',
        body: [
          'The first line decides whether people keep reading. Strong hooks are specific, direct, and connected to a real outcome. Instead of opening with a generic statement, show the result, tension, lesson, or mistake.',
          'Examples of useful hook patterns include a lesson learned, a before-and-after, a bold observation, a short question, or a number-backed insight.',
        ],
      },
      {
        heading: 'Make the post easy to scan',
        body: [
          'Short sentences work well on X because users are moving quickly. Break longer thoughts into line-separated points, keep hashtags limited, and avoid filler that does not change the meaning.',
          'If you are posting for a product, add one clear call to action. That can be a question, a link, a request to reply, or an invitation to follow the next update.',
        ],
      },
    ],
    checklist: [
      'One idea per tweet',
      'Specific first line',
      'Short readable sentences',
      'Clear next action',
      'Scheduled inside a weekly queue',
    ],
  },
  {
    slug: 'best-time-to-post-on-x',
    title: 'Best Time to Post on X: Build a Schedule That Learns',
    seoTitle: 'Best Time to Post on X: How to Find Your Twitter Posting Schedule',
    description:
      'Find the best time to post on X by testing posting windows, reading analytics, and building a weekly schedule.',
    category: 'Scheduling',
    readTime: '6 min read',
    date: '2026-05-17',
    image: '/calendar-preview.svg',
    intro:
      'There is no universal best time to post on X. Audience location, topic, content format, and posting consistency all change the answer. The best approach is to build a schedule that tests windows and improves from real results.',
    sections: [
      {
        heading: 'Start with repeatable time blocks',
        body: [
          'Pick two or three posting windows you can maintain for at least two weeks. Morning, afternoon, and evening windows usually give enough variety without making the calendar hard to manage.',
          'The goal is not to guess the perfect hour immediately. The goal is to create enough consistent data so you can compare windows fairly.',
        ],
      },
      {
        heading: 'Compare formats separately',
        body: [
          'A quick opinion post and a deep thread behave differently. If you compare all posts together, the timing data can become noisy. Track format, topic, and time together.',
          'When a time slot works for one format, test that format again before moving your entire schedule.',
        ],
      },
      {
        heading: 'Use a queue to protect consistency',
        body: [
          'Manual posting creates gaps because busy days interrupt the habit. A queue lets you prepare ideas in batches, spread them across the week, and keep the test running.',
          'TweetQueue helps you see whether the week is balanced before you publish, which makes timing experiments much easier to run.',
        ],
      },
    ],
    checklist: [
      'Choose 2-3 time windows',
      'Test for at least two weeks',
      'Track topic and format',
      'Avoid changing every variable at once',
      'Review winners weekly',
    ],
  },
  {
    slug: 'x-content-calendar-for-creators',
    title: 'X Content Calendar: A Weekly System for Creators',
    seoTitle: 'X Content Calendar for Creators: Plan a Week of Twitter Posts',
    description:
      'Create an X content calendar that balances ideas, launches, education, personal posts, and analytics review.',
    category: 'Content Calendar',
    readTime: '8 min read',
    date: '2026-05-17',
    image: '/calendar-preview.svg',
    intro:
      'A content calendar is not only a list of posts. It is a planning surface that helps you balance topics, avoid repeating the same angle, and keep publishing even when the week gets busy.',
    sections: [
      {
        heading: 'Give every day a role',
        body: [
          'Assign simple themes to the week. Monday can be lessons, Tuesday can be product education, Wednesday can be behind-the-scenes, Thursday can be opinion, and Friday can be recap or proof.',
          'Themes reduce blank-page pressure because you already know what kind of post you are writing before you open the composer.',
        ],
      },
      {
        heading: 'Batch ideas before scheduling',
        body: [
          'Write rough ideas first. Do not worry about perfect wording while collecting them. Once the idea bank is ready, choose the best posts and rewrite them for clarity.',
          'This two-step process keeps planning creative and scheduling operational, which makes the workflow faster.',
        ],
      },
      {
        heading: 'Keep space for timely posts',
        body: [
          'A good calendar should not be packed so tightly that you cannot react to launches, customer feedback, or trending conversations. Leave a few open slots each week.',
          'The best schedule gives you consistency without making the account feel automated.',
        ],
      },
    ],
    checklist: [
      'Assign daily themes',
      'Batch ideas first',
      'Rewrite hooks second',
      'Leave open slots',
      'Review the full week before publishing',
    ],
  },
  {
    slug: 'how-to-write-twitter-thread',
    title: 'How to Write a Twitter/X Thread People Finish',
    seoTitle: 'How to Write a Twitter/X Thread: Hooks, Structure, and Examples',
    description:
      'Learn how to write a Twitter/X thread with a strong promise, clean structure, and clear conclusion.',
    category: 'Threads',
    readTime: '7 min read',
    date: '2026-05-17',
    image: '/dashboard-preview.svg',
    intro:
      'A thread should feel like a guided path, not a stack of disconnected posts. The strongest threads make a promise at the start and then move through the idea in a clear order.',
    sections: [
      {
        heading: 'Open with the promise',
        body: [
          'The first post should tell readers what they will learn or why the story matters. If the opening does not create a reason to continue, the rest of the thread has to work much harder.',
          'Avoid overpromising. A practical thread that delivers one useful framework usually performs better than a broad thread that tries to cover everything.',
        ],
      },
      {
        heading: 'Use each post for one step',
        body: [
          'Every post in the thread should move the reader forward. One post can define the problem, another can show the mistake, another can explain the fix, and another can show an example.',
          'Numbering can help when the thread is instructional, but it is not required. Clarity matters more than format.',
        ],
      },
      {
        heading: 'End with a useful next action',
        body: [
          'The final post should not simply say thanks. Invite readers to reply, bookmark, follow, try the checklist, or read the related resource.',
          'If the thread supports a product, connect the call to action to the lesson rather than forcing a sales pitch into the ending.',
        ],
      },
    ],
    checklist: [
      'Clear first-post promise',
      'One step per post',
      'Examples included',
      'No filler transitions',
      'Useful final action',
    ],
  },
  {
    slug: 'twitter-analytics-for-better-posts',
    title: 'Twitter/X Analytics: How to Improve Your Next Posts',
    seoTitle: 'Twitter/X Analytics Guide: Use Data to Write Better Posts',
    description:
      'Use Twitter/X analytics to understand hooks, formats, posting windows, and topics that deserve another test.',
    category: 'Analytics',
    readTime: '6 min read',
    date: '2026-05-17',
    image: '/analytics-preview.svg',
    intro:
      'Analytics are useful only when they change what you do next. Instead of checking numbers for validation, use them to decide which hooks, topics, and formats deserve more attention.',
    sections: [
      {
        heading: 'Look beyond likes',
        body: [
          'Likes are visible, but they do not tell the whole story. Replies can show conversation, reposts can show shareability, bookmarks can show utility, and profile visits can show curiosity.',
          'A post with fewer likes but many replies may be better for community building than a high-like post that creates no follow-up conversation.',
        ],
      },
      {
        heading: 'Compare similar posts',
        body: [
          'Compare posts with the same goal. Educational posts should be compared with educational posts, launch posts with launch posts, and personal posts with personal posts.',
          'This keeps the analysis fair and helps you find repeatable patterns instead of random spikes.',
        ],
      },
      {
        heading: 'Turn winners into templates',
        body: [
          'When a post works, identify the structure behind it. Was it a list, a lesson, a contrarian opinion, a short story, or a proof point?',
          'Save that structure and use it again with a new topic. This is how analytics becomes a content system.',
        ],
      },
    ],
    checklist: [
      'Review by format',
      'Track replies and bookmarks',
      'Compare similar posts',
      'Save winning templates',
      'Plan next tests in the queue',
    ],
  },
  {
    slug: 'schedule-tweets-without-looking-automated',
    title: 'How to Schedule Tweets Without Looking Automated',
    seoTitle: 'How to Schedule Tweets Without Sounding Robotic on X',
    description:
      'Schedule tweets on X while keeping your account natural, timely, and human with flexible queue planning.',
    category: 'Automation',
    readTime: '6 min read',
    date: '2026-05-17',
    image: '/dashboard-preview.svg',
    intro:
      'Scheduling is useful when it protects consistency. It becomes a problem when every post sounds disconnected from the real conversation around your account.',
    sections: [
      {
        heading: 'Write scheduled posts like live notes',
        body: [
          'The easiest way to avoid sounding automated is to write in a direct, specific voice. Mention the actual lesson, decision, problem, or observation instead of using generic marketing lines.',
          'Posts should feel like something a person would say even if the publish time was planned ahead.',
        ],
      },
      {
        heading: 'Mix planned and responsive content',
        body: [
          'Use scheduled posts for recurring ideas: lessons, education, product updates, and weekly recaps. Keep space for live replies, timely opinions, and customer conversations.',
          'This mix lets the account stay consistent without becoming rigid.',
        ],
      },
      {
        heading: 'Review the queue before it publishes',
        body: [
          'A queue review catches repeated phrasing, crowded topics, and posts that no longer fit the week. It also helps you pause content if the timing feels wrong.',
          'TweetQueue is built around this review step so scheduled publishing still feels intentional.',
        ],
      },
    ],
    checklist: [
      'Use natural language',
      'Leave flexible slots',
      'Review before publishing',
      'Avoid repeated hooks',
      'Pair scheduling with live engagement',
    ],
  },
];

export const jobs: JobPost[] = [
  {
    slug: 'frontend-engineer',
    title: 'Frontend Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    salary: '$70,000 - $110,000',
    postedAt: '2026-05-17',
    validThrough: '2026-08-17',
    summary:
      'Build fast, polished, mobile-first product surfaces for creators who plan and schedule content on X.',
    responsibilities: [
      'Build responsive Next.js interfaces for queue, analytics, and scheduling workflows.',
      'Improve interaction quality across mobile and desktop screens.',
      'Work with product and design to ship simple, reliable creator tools.',
    ],
    requirements: [
      'Strong React and TypeScript experience.',
      'Comfort with responsive UI, accessibility, and performance.',
      'Ability to own product details from implementation to QA.',
    ],
  },
  {
    slug: 'full-stack-engineer',
    title: 'Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    salary: '$80,000 - $125,000',
    postedAt: '2026-05-17',
    validThrough: '2026-08-17',
    summary:
      'Own backend APIs, Prisma data models, auth flows, and product features that connect the frontend to live scheduling infrastructure.',
    responsibilities: [
      'Build and maintain Node.js API routes, Prisma models, and production integrations.',
      'Improve authentication, credential security, and deployment reliability.',
      'Create observability and test coverage for key user workflows.',
    ],
    requirements: [
      'Experience with Node.js, PostgreSQL, and Prisma.',
      'Strong understanding of API design and deployment environments.',
      'Care for security, error handling, and production debugging.',
    ],
  },
  {
    slug: 'growth-content-strategist',
    title: 'Growth Content Strategist',
    department: 'Growth',
    location: 'Remote',
    type: 'Contract',
    salary: '$35 - $75 per hour',
    postedAt: '2026-05-17',
    validThrough: '2026-08-17',
    summary:
      'Create SEO guides, X content playbooks, launch posts, and creator education that help TweetQueue rank and convert.',
    responsibilities: [
      'Plan and write content around X scheduling, Twitter posting, analytics, and creator workflows.',
      'Turn product features into practical examples, guides, and templates.',
      'Review content performance and improve pages based on search intent.',
    ],
    requirements: [
      'Portfolio of SaaS, creator, or SEO content.',
      'Understanding of X/Twitter publishing workflows.',
      'Ability to write practical guides without fluff.',
    ],
  },
  {
    slug: 'product-designer',
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Part-time',
    salary: '$45 - $90 per hour',
    postedAt: '2026-05-17',
    validThrough: '2026-08-17',
    summary:
      'Design calm, dense, mobile-first workflows for creators managing queues, drafts, and analytics.',
    responsibilities: [
      'Design dashboard, onboarding, and settings flows for web and mobile viewports.',
      'Create interaction patterns that make scheduling feel quick and focused.',
      'Partner with engineering to refine details after implementation.',
    ],
    requirements: [
      'Strong product design portfolio for SaaS or productivity tools.',
      'Comfort designing dense dashboards and mobile app-like experiences.',
      'Clear communication and systems thinking.',
    ],
  },
];
