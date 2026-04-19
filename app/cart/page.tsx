import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";

import CartItems from "@/components/CartItems";
import BreadCrumbs from "@/components/BreadCrumbs";
import CheckoutButton from "@/components/CheckoutButton";
import { Product } from "@/@types/product";

async function getCartProducts(): Promise<Product[]> {
  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const baseUrl = process.env.NEXTAUTH_URL;

  if (!baseUrl) {
    throw new Error("NEXTAUTH_URL is not defined");
  }
  
  const res = await fetch(`${baseUrl}/api/cart`, {
    cache: "no-store",
    headers: {
      Cookie: cookieHeader,
    },
  });

  if (!res.ok) {
    console.error("Failed to fetch cart", res.status);
    return [];
  }

  const data = await res.json();
  return data.items as Product[];
}

export default async function CartPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <h1 className="text-3xl font-bold text-amber-700">
          You are unauthorized
        </h1>
      </div>
    );
  }

  const cartProducts = await getCartProducts();

  const totalPrice = cartProducts.reduce(
    (sum, item) => sum + Number(item.price),
    0,
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col py-2 px-3 bg-white dark:bg-black">
        <BreadCrumbs />

        <h1 className="font-bold text-3xl text-amber-600 mb-7">Səbət</h1>

        {cartProducts.length > 0 ? (
          <div className="flex w-full flex-col gap-5">
            <CartItems items={cartProducts} />

            <div className="text-right font-bold text-xl">
              Cəmi: {totalPrice.toLocaleString("ru-RU")} ₼
            </div>
            <CheckoutButton />
          </div>
        ) : (
          <div className="text-gray-500 text-lg">Səbətiniz boşdur</div>
        )}
      </main>
    </div>
  );
}
