import Link from "next/link";

export default function StartPracticeButton() {
  return (
    <Link
      href="/practice"
      className="press btn-glow flex w-full items-center justify-center rounded-full px-8 py-3.5 text-center font-semibold sm:w-auto"
    >
      Start Daily Practice
    </Link>
  );
}
