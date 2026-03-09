import React, { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const HOTLINES = [
  {
    name: "Sumithrayo",
    role: "Emotional Support & Suicide Prevention",
    phone: "011 2 696 666",
    hours: "24 hours / 7 days",
    website: "https://www.sumithrayo.org",
    note: "Sri Lanka's first befriending service",
    color: "border-spotify-green",
    accent: "text-spotify-green",
  },
  {
    name: "National Mental Health Helpline",
    role: "Ministry of Health – Sri Lanka",
    phone: "1926",
    hours: "24 hours / 7 days",
    website: null,
    note: "Free government helpline",
    color: "border-blue-400",
    accent: "text-blue-400",
  },
  {
    name: "CCCline",
    role: "Counselling & Crisis Support",
    phone: "1333",
    hours: "8:00 AM – 10:00 PM",
    website: "https://www.cccline.org",
    note: "Free & confidential counselling",
    color: "border-yellow-400",
    accent: "text-yellow-400",
  },
  {
    name: "NIMH Sri Lanka",
    role: "National Institute of Mental Health",
    phone: "011 2 578 234",
    hours: "Mon–Fri, 8:00 AM – 4:00 PM",
    website: "https://www.nimh.health.gov.lk",
    note: "Inpatient & outpatient services",
    color: "border-orange-400",
    accent: "text-orange-400",
  },
];

const VIDEOS = [
  {
    id: "g9KKdB4-9sE",
    title: "How To Manage Your Stress | Stress Management Techniques (3 Motivational Tips)",
    channel: "Simplebooks",
    duration: "10:53",
    tag: "#Stress Management ",
    tagColor: "bg-blue-500/20 text-blue-300",
  },
  {
    id: "ZToicYcHIOU",
    title: "Progressive Muscle Relaxation",
    channel: "Anxiety Relief",
    duration: "10:00",
    tag: "Relaxation",
    tagColor: "bg-purple-500/20 text-purple-300",
  },
  {
    id: "O-6f5wQXSu8",
    title: "Guided Meditation for Anxiety",
    channel: "Great Meditation",
    duration: "10:02",
    tag: "Meditation",
    tagColor: "bg-spotify-green/20 text-spotify-green",
  },
  {
    id: "MIr3RsUWrdo",
    title: "How to Deal with Depression",
    channel: "Psych2Go",
    duration: "7:44",
    tag: "Depression",
    tagColor: "bg-red-500/20 text-red-300",
  },
  {
    id: "bF_1ZiFta-E",
    title: "Square Breathing Visual",
    channel: "UAB Student Affairs",
    duration: "3:17",
    tag: "Breathing",
    tagColor: "bg-blue-500/20 text-blue-300",
  },
  {
    id: "aSWLkMU7Ml4",
    title: "How to stay focused in studies | Buddhism In English",
    channel: "Buddhism",
    duration: "05:26",
    tag: " #studystrategies",
    tagColor: "bg-orange-500/20 text-orange-300",
  },
];

const ACTIVITIES = [
  {
    icon: "🌬️",
    title: "4-7-8 Breathing",
    category: "Breathing",
    time: "5 min",
    difficulty: "Easy",
    description:
      "Inhale for 4 counts, hold for 7, exhale for 8. Activates the parasympathetic nervous system to calm anxiety within minutes.",
    steps: [
      "Find a comfortable seated position",
      "Inhale quietly through nose for 4 counts",
      "Hold breath for 7 counts",
      "Exhale through mouth for 8 counts",
      "Repeat 3–4 cycles",
    ],
    color: "border-blue-500/40 hover:border-blue-400",
    iconBg: "bg-blue-500/10",
  },
  {
    icon: "🧘",
    title: "Body Scan Meditation",
    category: "Mindfulness",
    time: "10–15 min",
    difficulty: "Moderate",
    description:
      "Systematically direct attention through each body part, releasing tension and grounding yourself in the present moment.",
    steps: [
      "Lie flat or sit comfortably",
      "Close your eyes and take 3 deep breaths",
      "Start at your feet — notice any sensations",
      "Slowly move attention upward through each body part",
      "Release any tension you find as you go",
    ],
    color: "border-purple-500/40 hover:border-purple-400",
    iconBg: "bg-purple-500/10",
  },
  {
    icon: "📓",
    title: "Gratitude Journaling",
    category: "Cognitive",
    time: "5–10 min",
    difficulty: "Easy",
    description:
      "Writing three specific things you're grateful for rewires the brain toward positive patterns and reduces depressive symptoms.",
    steps: [
      "Open a notebook or notes app",
      "Write 3 specific things you're grateful for today",
      "For each one, briefly explain why",
      "Re-read what you wrote slowly",
      "Notice how your mood shifts",
    ],
    color: "border-yellow-500/40 hover:border-yellow-400",
    iconBg: "bg-yellow-500/10",
  },
  {
    icon: "🚶",
    title: "10-Minute Mindful Walk",
    category: "Movement",
    time: "10 min",
    difficulty: "Easy",
    description:
      "Walking while deliberately engaging your senses pulls you out of your head. Particularly effective for stress and low mood.",
    steps: [
      "Step outside (even just around the building)",
      "Put your phone away",
      "Notice 5 things you can see",
      "Notice 4 things you can touch",
      "Notice 3 sounds, 2 smells, 1 taste",
    ],
    color: "border-green-500/40 hover:border-spotify-green",
    iconBg: "bg-spotify-green/10",
  },
  {
    icon: "🧊",
    title: "Cold Water Grounding",
    category: "Grounding",
    time: "2 min",
    difficulty: "Easy",
    description:
      "Splashing cold water on your face activates the dive reflex, slowing heart rate and interrupting panic or dissociation.",
    steps: [
      "Go to a sink or use a bowl of cold water",
      "Take a slow breath in",
      "Splash cold water on your face 3–5 times",
      "Focus entirely on the physical sensation",
      "Notice your heart rate slowing",
    ],
    color: "border-cyan-500/40 hover:border-cyan-400",
    iconBg: "bg-cyan-500/10",
  },
  {
    icon: "🎨",
    title: "Creative Expression",
    category: "Creative",
    time: "15–30 min",
    difficulty: "Easy",
    description:
      "Drawing, colouring, or doodling without a goal quiets the inner critic and activates a meditative flow state.",
    steps: [
      "Get any paper and something to draw with",
      "Set a timer for 15 minutes",
      "Draw or doodle freely — no judgment",
      "Let your hand move without planning",
      "When done, observe what came out",
    ],
    color: "border-orange-500/40 hover:border-orange-400",
    iconBg: "bg-orange-500/10",
  },
];

const TIPS = [
  {
    icon: "💤",
    title: "Sleep Hygiene",
    body: "Consistent sleep and wake times stabilise mood more than almost any other lifestyle factor. Aim for 7–9 hours.",
  },
  {
    icon: "📵",
    title: "Digital Detox",
    body: "Even 30 minutes phone-free before bed significantly reduces cortisol and improves sleep quality.",
  },
  {
    icon: "🥗",
    title: "Nutrition",
    body: "The gut produces ~90% of serotonin. Eat whole foods, reduce sugar, and stay hydrated to support mental wellbeing.",
  },
  {
    icon: "🤝",
    title: "Social Connection",
    body: "Even brief, genuine conversations with others counteract the isolation that feeds anxiety and depression.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader = ({ eyebrow, title, subtitle }) => (
  <div className="mb-10 animate-fade-in">
    <p className="text-spotify-green text-xs font-bold uppercase tracking-[0.2em] mb-2">
      {eyebrow}
    </p>
    <h2 className="text-3xl font-extrabold text-white mb-3 leading-tight">
      {title}
    </h2>
    {subtitle && (
      <p className="text-text-gray max-w-2xl leading-relaxed">{subtitle}</p>
    )}
  </div>
);

const ActivityCard = ({ activity }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={`bg-spotify-dark-gray rounded-xl border transition-all duration-300 cursor-pointer ${activity.color}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${activity.iconBg}`}
            >
              {activity.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-text-gray bg-spotify-light-gray px-2 py-0.5 rounded-full">
                  {activity.category}
                </span>
                <span className="text-xs text-text-gray">{activity.time}</span>
                <span className="text-xs text-spotify-green">
                  {activity.difficulty}
                </span>
              </div>
              <h3 className="text-white font-bold text-lg leading-tight">
                {activity.title}
              </h3>
              <p className="text-text-gray text-sm mt-1 leading-relaxed">
                {activity.description}
              </p>
            </div>
          </div>
          <div
            className={`text-text-gray transition-transform duration-300 flex-shrink-0 mt-1 ${expanded ? "rotate-180" : ""}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {expanded && (
          <div className="mt-5 pt-4 border-t border-spotify-gray animate-fade-in">
            <p className="text-xs text-text-gray uppercase tracking-widest font-semibold mb-3">
              How to do it
            </p>
            <ol className="space-y-2">
              {activity.steps.map((step, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-text-gray"
                >
                  <span className="w-5 h-5 rounded-full bg-spotify-light-gray text-spotify-green flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

const VideoCard = ({ video }) => (
  <a
    href={`https://www.youtube.com/watch?v=${video.id}`}
    target="_blank"
    rel="noopener noreferrer"
    className="group block bg-spotify-dark-gray rounded-xl overflow-hidden border border-spotify-gray hover:border-spotify-green transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
  >
    <div className="relative overflow-hidden">
      <img
        src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
        alt={video.title}
        className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-spotify-green flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-elevated">
          <svg
            className="w-5 h-5 text-black ml-0.5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
        {video.duration}
      </div>
    </div>
    <div className="p-4">
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${video.tagColor}`}
      >
        {video.tag}
      </span>
      <h3 className="text-white font-semibold text-sm mt-2 leading-snug group-hover:text-spotify-green transition-colors">
        {video.title}
      </h3>
      <p className="text-text-gray text-xs mt-1">{video.channel}</p>
    </div>
  </a>
);

const HotlineCard = ({ contact, index }) => (
  <div
    className={`bg-spotify-dark-gray rounded-xl border-l-4 ${contact.color} p-5 flex flex-col gap-3 hover:bg-spotify-light-gray transition-colors duration-200 animate-fade-in`}
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    <div>
      <h3 className={`font-extrabold text-lg ${contact.accent}`}>
        {contact.name}
      </h3>
      <p className="text-text-gray text-sm">{contact.role}</p>
    </div>
    <div className="flex items-center gap-2">
      <svg
        className="w-4 h-4 text-text-gray flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
      <a
        href={`tel:${contact.phone.replace(/\s/g, "")}`}
        className={`font-bold text-xl tracking-wide ${contact.accent} hover:underline`}
        onClick={(e) => e.stopPropagation()}
      >
        {contact.phone}
      </a>
    </div>
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-gray">
      <span className="flex items-center gap-1">
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {contact.hours}
      </span>
      {contact.note && <span className="italic">{contact.note}</span>}
    </div>
    {contact.website && (
      <a
        href={contact.website}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-text-gray hover:text-spotify-green transition-colors flex items-center gap-1 w-fit"
        onClick={(e) => e.stopPropagation()}
      >
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
        {contact.website.replace("https://", "")}
      </a>
    )}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  "Emergency Contacts",
  "Stress Activities",
  "Helpful Videos",
  "Wellness Tips",
];

const MentalHealthResourcesPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <main className="min-h-screen bg-spotify-black text-white">
      {/* Hero */}
      <div className="relative overflow-hidden bg-spotify-dark-gray border-b border-spotify-gray">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-spotify-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 py-14 md:py-20 relative">

          <div className="max-w-2xl animate-fade-in">
            <span className="inline-block bg-spotify-green/10 text-spotify-green text-xs font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-spotify-green/20 mb-4">
              Mental Health Resources · Sri Lanka
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              You are not alone.
              <br />
              <span className="text-spotify-green">Help is here.</span>
            </h1>
            <p className="text-text-gray text-lg leading-relaxed">
              A curated collection of crisis contacts, guided exercises, videos,
              and wellness tips — all in one place. If you're struggling, please
              reach out.
            </p>
            <div className="flex-shrink-0">
              <img
                src="dist/assets/Flag_of_Sri_Lanka.png"
                alt="Mental Health Resources"
                className="w-64 max-w-full rounded-lg border border-spotify-gray shadow-lg"
              />
            </div>
          </div>

          {/* Quick-dial banner */}
          <div className="mt-8 flex flex-wrap gap-3">
            {HOTLINES.slice(0, 2).map((h) => (
              <a
                key={h.phone}
                href={`tel:${h.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 bg-spotify-light-gray hover:bg-spotify-gray px-4 py-2.5 rounded-full transition-colors border border-spotify-gray hover:border-spotify-green group"
              >
                <svg
                  className="w-4 h-4 text-spotify-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="text-sm font-bold text-white group-hover:text-spotify-green transition-colors">
                  {h.name}
                </span>
                <span className="text-text-gray text-sm">{h.phone}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="sticky top-0 z-20 bg-spotify-black/90 backdrop-blur-md border-b border-spotify-gray">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex overflow-x-auto scrollbar-none gap-1 py-1">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all duration-200 border-b-2 -mb-px ${
                  activeTab === i
                    ? "border-spotify-green text-white"
                    : "border-transparent text-text-gray hover:text-white hover:border-spotify-gray"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* ── Tab 0: Emergency Contacts ── */}
        {activeTab === 0 && (
          <div className="animate-fade-in">
            <SectionHeader
              eyebrow="Crisis Support"
              title="Sri Lanka Mental Health Contacts"
              subtitle="These services are free, confidential, and available to anyone in Sri Lanka. If you are in immediate danger, please call 119 (Police) or 110 (Ambulance)."
            />

            {/* Emergency banner */}
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🚨</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm">
                  In immediate danger?
                </p>
                <p className="text-text-gray text-sm">
                  Call{" "}
                  <a
                    href="tel:119"
                    className="text-red-400 font-bold hover:underline"
                  >
                    119
                  </a>{" "}
                  (Police) or{" "}
                  <a
                    href="tel:110"
                    className="text-red-400 font-bold hover:underline"
                  >
                    110
                  </a>{" "}
                  (Ambulance) immediately.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {HOTLINES.map((contact, i) => (
                <HotlineCard key={contact.name} contact={contact} index={i} />
              ))}
            </div>

            {/* How to talk section */}
            <div className="mt-12">
              <SectionHeader
                eyebrow="Guidance"
                title="How to ask for help"
                subtitle="Reaching out can feel hard. Here are some ways to start the conversation."
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    icon: "📞",
                    title: "On a call",
                    body: "You can simply say: \"I've been struggling with my mental health and I need to talk to someone.\" You don't need to explain everything at once.",
                  },
                  {
                    icon: "👨‍⚕️",
                    title: "With a doctor",
                    body: "\"I've been feeling very low / anxious / stressed lately and it's affecting my daily life. Can you refer me to someone?\" That's enough to start.",
                  },
                  {
                    icon: "💬",
                    title: "With a friend",
                    body: '"I\'ve been going through something hard and I just need someone to listen — not to fix it, just to hear me." Most people want to help.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="bg-spotify-dark-gray rounded-xl p-5 border border-spotify-gray hover:border-spotify-green/50 transition-colors"
                  >
                    <div className="text-3xl mb-3">{item.icon}</div>
                    <h3 className="text-white font-bold mb-2">{item.title}</h3>
                    <p className="text-text-gray text-sm leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 1: Stress Activities ── */}
        {activeTab === 1 && (
          <div className="animate-fade-in">
            <SectionHeader
              eyebrow="Self-Care Toolkit"
              title="Stress Management Activities"
              subtitle="Evidence-based exercises you can do right now. Tap any card to see step-by-step instructions."
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {ACTIVITIES.map((activity, i) => (
                <ActivityCard key={i} activity={activity} />
              ))}
            </div>

            {/* Quick-access: If in crisis */}
            <div className="mt-10 bg-spotify-dark-gray rounded-xl border border-spotify-green/30 p-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="text-4xl">💚</div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-white font-bold mb-1">
                  Activities not enough right now?
                </h3>
                <p className="text-text-gray text-sm">
                  If you're in a mental health crisis, please reach out to a
                  professional. Help is one call away.
                </p>
              </div>
              <button
                onClick={() => setActiveTab(0)}
                className="flex-shrink-0 px-5 py-2.5 bg-spotify-green hover:bg-spotify-green-hover text-black font-bold rounded-full text-sm transition-colors"
              >
                View Contacts
              </button>
            </div>
          </div>
        )}

        {/* ── Tab 2: Helpful Videos ── */}
        {activeTab === 2 && (
          <div className="animate-fade-in">
            <SectionHeader
              eyebrow="Video Library"
              title="Guided Videos & Exercises"
              subtitle="Curated YouTube videos for breathing, meditation, movement, and understanding mental health. All open in YouTube."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {VIDEOS.map((video, i) => (
                <VideoCard key={i} video={video} />
              ))}
            </div>

            <div className="mt-8 p-5 bg-spotify-dark-gray rounded-xl border border-spotify-gray text-sm text-text-gray flex items-start gap-3">
              <span className="text-xl flex-shrink-0">ℹ️</span>
              <p>
                These are general wellness videos and are not a substitute for
                professional mental health care. If you are experiencing
                significant distress, please contact one of the{" "}
                <button
                  className="text-spotify-green hover:underline"
                  onClick={() => setActiveTab(0)}
                >
                  crisis services
                </button>{" "}
                listed in our contacts tab.
              </p>
            </div>
          </div>
        )}

        {/* ── Tab 3: Wellness Tips ── */}
        {activeTab === 3 && (
          <div className="animate-fade-in">
            <SectionHeader
              eyebrow="Daily Wellbeing"
              title="Wellness Tips for Everyday Life"
              subtitle="Small, consistent actions compound into meaningful mental health improvements over time."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
              {TIPS.map((tip, i) => (
                <div
                  key={i}
                  className="bg-spotify-dark-gray rounded-xl p-6 border border-spotify-gray hover:border-spotify-green/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="text-4xl mb-4">{tip.icon}</div>
                  <h3 className="text-white font-bold text-lg mb-2">
                    {tip.title}
                  </h3>
                  <p className="text-text-gray text-sm leading-relaxed">
                    {tip.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Daily checklist */}
            <SectionHeader
              eyebrow="Daily Practice"
              title="Your Mental Health Checklist"
              subtitle="A simple daily routine to support your wellbeing."
            />
            <div className="bg-spotify-dark-gray rounded-xl border border-spotify-gray overflow-hidden">
              {[
                {
                  time: "Morning",
                  items: [
                    "Drink a glass of water before coffee",
                    "5 minutes of stretching or deep breathing",
                    "Set one intention for the day",
                  ],
                },
                {
                  time: "Afternoon",
                  items: [
                    "Take a proper break from screens",
                    "Eat a nutritious meal mindfully",
                    "Check in with your emotional state",
                  ],
                },
                {
                  time: "Evening",
                  items: [
                    "Move your body for at least 10 minutes",
                    "Write 3 things that went well today",
                    "Wind down screens 30 min before bed",
                  ],
                },
              ].map((block, bi) => (
                <div
                  key={block.time}
                  className={`p-5 ${bi < 2 ? "border-b border-spotify-gray" : ""}`}
                >
                  <h4 className="text-spotify-green text-xs font-bold uppercase tracking-widest mb-3">
                    {block.time}
                  </h4>
                  <ul className="space-y-2">
                    {block.items.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-sm text-text-gray"
                      >
                        <div className="w-5 h-5 rounded border border-spotify-gray flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Footer CTA */}
            <div className="mt-10 text-center py-10 border-t border-spotify-gray">
              <p className="text-text-gray text-sm mb-2">
                Remember — seeking help is a sign of strength, not weakness.
              </p>
              <button
                onClick={() => setActiveTab(0)}
                className="mt-3 px-6 py-3 bg-spotify-green hover:bg-spotify-green-hover text-black font-bold rounded-full transition-colors"
              >
                View Crisis Contacts
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MentalHealthResourcesPage;
