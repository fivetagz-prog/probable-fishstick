import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScriptBlox Finder" },
      { name: "description", content: "Search Roblox scripts via the ScriptBlox API with a slick UI." },
    ],
  }),
  component: Index,
});

type Script = {
  _id: string;
  title: string;
  game: { name: string; imageUrl: string };
  views: number;
  key: boolean;
  isUniversal: boolean;
  isPatched: boolean;
  createdAt: string;
  image?: string;
  script: string;
  slug: string;
};

const IMG_BASE = "https://scriptblox.com";

function imgUrl(p?: string) {
  if (!p) return "";
  if (p.startsWith("http")) return p;
  return IMG_BASE + p;
}

function Index() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ scripts: Script[]; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);
    const url = submitted
  ? `/api/scripts?q=${encodeURIComponent(submitted)}&page=${page}`
  : `/api/scripts?page=${page}`;
    fetch(url)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        setData({
          scripts: j.result?.scripts ?? [],
          totalPages: j.result?.totalPages ?? 1,
        });
      })
      .catch((e) => alive && setErr(String(e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [submitted, page]);

  const copy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500);
  };

  const totalPages = data?.totalPages ?? 1;
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#1e1b4b_0%,#0a0a0f_55%)] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col items-start gap-2">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 shadow-[0_0_30px_-5px_rgba(217,70,239,0.6)]">
              <span className="text-xl font-black">S</span>
            </div>
            <h1 className="bg-gradient-to-r from-fuchsia-300 via-violet-200 to-indigo-300 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl">
              ScriptBlox Finder
            </h1>
          </div>
          <p className="text-sm text-slate-400">Search, browse and grab Roblox scripts in style.</p>
        </header>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSubmitted(query.trim());
          }}
          className="mb-8 flex gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search scripts (e.g. blox fruits)…"
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-500"
          />
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-5 py-2 text-sm font-semibold shadow-lg shadow-fuchsia-500/20 transition hover:brightness-110"
          >
            Search
          </button>
        </form>

        {loading && <div className="py-20 text-center text-slate-400">Loading…</div>}
        {err && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">{err}</div>}

        {!loading && data && (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.scripts.map((s) => (
                <ScriptCard key={s._id} s={s} copied={copied === s._id} onCopy={() => copy(s._id, s.script)} />
              ))}
            </div>

            <nav className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <PageBtn disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                ← Prev
              </PageBtn>
              {pageNumbers.map((n, i) =>
                n === "…" ? (
                  <span key={i} className="px-2 text-slate-500">…</span>
                ) : (
                  <button
                    key={i}
                    onClick={() => setPage(n as number)}
                    className={`grid h-10 w-10 place-items-center rounded-xl border text-sm font-semibold transition ${
                      n === page
                        ? "border-fuchsia-400 bg-gradient-to-br from-fuchsia-500 to-indigo-500 shadow-lg shadow-fuchsia-500/30"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {n}
                  </button>
                ),
              )}
              <PageBtn disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next →
              </PageBtn>
            </nav>
            <p className="mt-3 text-center text-xs text-slate-500">
              Page {page} of {totalPages}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function PageBtn({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Badge({ label, value }: { label: string; value: boolean }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
        value
          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
          : "border-slate-500/30 bg-slate-500/10 text-slate-400"
      }`}
    >
      {label}: {value ? "True" : "False"}
    </span>
  );
}

function ScriptCard({ s, copied, onCopy }: { s: Script; copied: boolean; onCopy: () => void }) {
  const created = new Date(s.createdAt);
  const dateStr = created.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-xl backdrop-blur transition hover:border-fuchsia-400/40 hover:shadow-fuchsia-500/10">
      <div className="relative aspect-video overflow-hidden bg-slate-900">
        {s.image ? (
          <img
            src={imgUrl(s.image)}
            alt={s.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => ((e.currentTarget.style.opacity = "0"))}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-slate-600">no preview</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
        <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-full bg-black/50 px-2 py-1 backdrop-blur">
          <img src={imgUrl(s.game.imageUrl)} alt="" className="h-5 w-5 rounded" onError={(e) => (e.currentTarget.style.display = "none")} />
          <span className="text-xs font-medium">{s.game.name}</span>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <h3 className="line-clamp-2 text-base font-bold leading-snug">{s.title}</h3>

        <dl className="grid grid-cols-2 gap-2 text-xs">
          <Info k="Views" v={s.views.toLocaleString()} />
          <Info k="Created" v={dateStr} />
        </dl>

        <div className="flex flex-wrap gap-1.5">
          <Badge label="Universal" value={s.isUniversal} />
          <Badge label="Key" value={s.key} />
          <Badge label="Patched" value={s.isPatched} />
        </div>

        <div className="relative">
          <textarea
            readOnly
            value={s.script}
            className="h-24 w-full resize-none rounded-lg border border-white/10 bg-black/40 p-2 font-mono text-[11px] text-emerald-200 outline-none"
          />
          <button
            onClick={onCopy}
            className={`absolute right-2 top-2 rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
              copied
                ? "bg-emerald-500 text-black"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </article>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/5 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-slate-400">{k}</div>
      <div className="truncate font-semibold">{v}</div>
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | "…")[] {
  const out: (number | "…")[] = [];
  const add = (n: number | "…") => out.push(n);
  const max = Math.min(total, 7);
  if (total <= 7) {
    for (let i = 1; i <= total; i++) add(i);
    return out;
  }
  add(1);
  if (current > 3) add("…");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) add(i);
  if (current < total - 2) add("…");
  add(total);
  return out;
  void max;
          }

