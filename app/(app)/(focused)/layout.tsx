import FocusTopBar from "@/components/shell/FocusTopBar";
import FocusFooter from "@/components/shell/FocusFooter";

export default function FocusedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-focused flex min-h-dvh flex-col">
      <FocusTopBar />
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4">
        {children}
      </main>
      <FocusFooter />
    </div>
  );
}
