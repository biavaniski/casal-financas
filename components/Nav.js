"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function Nav() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/signup" || pathname === "/") return null;

  const link = (href, label) => (
    <Link
      href={href}
      className={`text-sm font-medium px-3 py-1.5 rounded-lg ${
        pathname === href ? "bg-brand text-white" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
      <div className="flex gap-2">
        {link("/dashboard", "Início")}
        {link("/lancamentos", "Lançamentos")}
      </div>
      <button
        onClick={() => signOut({ callbackUrl: `${window.location.origin}/login` })}
        className="text-sm font-medium text-gray-500 hover:text-gray-800"
      >
        Sair
      </button>
    </nav>
  );
}
