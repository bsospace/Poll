import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
      {children}
    </div>
  );
}
