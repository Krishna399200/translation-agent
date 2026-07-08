"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { PracticeIcon, MantraIcon, SoundIcon, WordsIcon, ProgressIcon, SettingsIcon } from "@/components/nav/icons";

const ITEMS = [
  { href: "/practice", label: "Practice", Icon: PracticeIcon },
  { href: "/mantra", label: "Mantra", Icon: MantraIcon },
  { href: "/sound-foundations", label: "Sounds", Icon: SoundIcon },
  { href: "/trigger-words", label: "Words", Icon: WordsIcon },
  { href: "/progress", label: "Progress", Icon: ProgressIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col border-b border-white/[0.06] bg-black/20 md:hidden">
      <div className="px-4 pt-4">
        <Logo />
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 py-3">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`press flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                active ? "bg-teal-500/15 text-teal-300" : "text-ink-soft"
              }`}
            >
              <Icon className={active ? "text-teal-300" : "text-ink-faint"} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
