import Link from "next/link";
import Logo from "@/components/Logo";
import SignOutButton from "@/components/SignOutButton";

export default function FocusTopBar() {
  return (
    <div className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
      <Link href="/home">
        <Logo />
      </Link>
      <SignOutButton />
    </div>
  );
}
