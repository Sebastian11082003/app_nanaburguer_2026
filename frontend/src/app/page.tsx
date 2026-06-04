import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-white">
      <h1 className="text-center text-6xl font-black">POS SaaS</h1>

      <p className="mt-4 text-center text-zinc-400">
        Plataforma inteligente para restaurantes
      </p>

      <div className="mt-10 flex w-full max-w-sm flex-col gap-4">
        <Link
          href="/restaurant/login"
          className="
            rounded-2xl
            bg-white
            px-8
            py-4
            text-center
            text-lg
            font-bold
            text-black
            transition-all
            hover:scale-105
          "
        >
          Ingresar Restaurante
        </Link>

        <Link
          href="/platform/login"
          className="
            rounded-2xl
            border
            border-zinc-700
            bg-zinc-900
            px-8
            py-4
            text-center
            text-lg
            font-bold
            text-white
            transition-all
            hover:bg-zinc-800
          "
        >
          Panel SaaS
        </Link>
      </div>
    </main>
  );
}
