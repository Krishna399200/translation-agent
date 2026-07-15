"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import SignOutButton from "@/components/SignOutButton";
import { PracticeIcon, MantraIcon, SoundIcon, WordsIcon, ScenarioIcon, ProgressIcon, SettingsIcon } from "@/components/nav/icons";

const ITEMS = [
  { href: "/practice", label: "Practice", Icon: PracticeIcon },
  { href: "/mantra", label: "Mantra", Icon: MantraIcon },
  { href: "/sound-foundations", label: "Sound Foundations", Icon: SoundIcon },
  { href: "/trigger-words", label: "Words That Challenge Me", Icon: WordsIcon },
  { href: "/scenarios", label: "Practice a Moment", Icon: ScenarioIcon },
  { href: "/progress", label: "Progress", Icon: ProgressIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-1 border-r border-white/[0.06] bg-black/20 px-4 py-6 md:flex">
      <div className="mb-6 px-2">
        <Logo className="text-lg" />
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`press flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-teal-500/15 text-teal-300 shadow-[0_0_24px_-8px_rgba(47,184,166,0.5)]"
                  : "text-ink-soft hover:bg-white/5 hover:text-ink"
              }`}
            >
              <Icon className={active ? "text-teal-300" : "text-ink-faint"} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.06] px-2 pt-4">
        <Link
          href="/quick-calm"
          className="press mb-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-lavender-300 hover:bg-white/5"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a9 9 0 1 0 5.6 16.1L21 20l-1-3.5A9 9 0 0 0 12 3Z" />
          </svg>
          Need a moment?
        </Link>
        <SignOutButton />
      </div>
    </aside>
  );
}
