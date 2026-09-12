import Link from "next/link";
import Logo from "@/components/Logo";
import SignOutButton from "@/components/SignOutButton";

export default function FocusTopBar() {
  return (
    <div className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
      <Link href="/home">
        <Logo />
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/quick-calm"
          className="press flex items-center gap-1.5 rounded-full border border-lavender-500/30 px-3 py-1.5 text-xs font-medium text-lavender-300 hover:bg-white/5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a9 9 0 1 0 5.6 16.1L21 20l-1-3.5A9 9 0 0 0 12 3Z" />
          </svg>
          Need a moment?
        </Link>
        <SignOutButton />
      </div>
    </div>
  );
}
