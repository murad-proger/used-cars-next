"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import LoginForm from "@/app/api/auth/LoginForm";
import RegisterForm from "@/app/api/auth/RegisterForm";

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [cartCount, setCartCount] = useState<number>(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const menu = [
    { name: "Əsas Səhifə", href: "/" },
    { name: "Kataloq", href: "/catalog" },
    ...(session?.user?.role === "ADMIN" ? [{ name: "Admin", href: "/admin" }] : []),
  ];

  // Fetch количества товаров в корзине
  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/cart/count", { cache: "no-store" });
        if (!res.ok) return;

        const data: { count: number } = await res.json();
        setCartCount(data.count);
      } catch (e) {
        console.error(e);
      }
    }

    fetchCount();

    const handler = () => {
      fetchCount();
    };

    window.addEventListener("cart-changed", handler);
    return () => window.removeEventListener("cart-changed", handler);
  }, []);

  return (
    <>
      <header className="w-full border-b bg-white dark:bg-zinc-900 z-10 relative">
        <div className="max-w-7xl mx-auto px-3 py-2 flex gap-3 sm:flex-nowrap flex-wrap items-center justify-between">
          <Link className="text-2xl text-amber-600 font-bold" href="/">
            used-cars
          </Link>

          <nav className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto order-3 sm:order-0 justify-center sm:justify-start flex-wrap sm:flex-nowrap">
            {menu.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors ${
                    isActive
                      ? "text-amber-600 font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:text-amber-600"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {session?.user ? (
              <Link href="/cart" className="relative text-2xl">
                🛒
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-4.5 h-4.5 px-1 text-xs flex items-center justify-center rounded-full bg-red-500 text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            ) : ""}

            {session?.user ? (
              <>
                <span className="text-gray-700 dark:text-gray-300">{session.user.name}</span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-1 rounded border border-gray-600 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-4 py-1 rounded border border-gray-600 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => setShowRegister(true)}
                  className="px-4 py-1 rounded border border-amber-600 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900 transition-colors"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
      {showRegister && <RegisterForm onClose={() => setShowRegister(false)} />}
    </>
  );
}
