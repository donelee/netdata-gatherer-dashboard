
import { Header } from "./Header";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 md:px-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
