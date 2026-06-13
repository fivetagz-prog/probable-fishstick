import { useEffect, useState } from "react";

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

export default function App() {
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
      ? `https://scriptblox.com/api/script/search?q=${encodeURIComponent(submitted)}&page=${page}`
      : `https://scriptblox.com/api/script/fetch?page=${page}`;

    fetch(url)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        setData({
          scripts: j.result?.scripts ?? [],
          totalPages: j.result?.totalPages ?? 1
        });
      })
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false));

    return () => {
      alive = false;
    };
  }, [submitted, page]);

  const copy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#1e1b4b_0%,#0a0a0f_55%)] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* HEADER */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-fuchsia-300">
            ScriptBlox Finder
          </h1>
          <p className="text-slate-400 text-sm">
            Search Roblox scripts in style
          </p>
        </header>

        {/* SEARCH */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSubmitted(query.trim());
          }}
          className="mb-6 flex gap-2"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 rounded-lg bg-white/10 p-2 outline-none"
            placeholder="Search..."
          />
          <button className="bg-fuchsia-500 px-4 rounded-lg">
            Search
          </button>
        </form>

        {/* STATES */}
        {loading && <p>Loading...</p>}
        {err && <p className="text-red-400">{err}</p>}

        {/* GRID */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.scripts?.map((s) => (
            <div key={s._id} className="bg-white/5 p-4 rounded-xl border border-white/10">
              <h3 className="font-bold">{s.title}</h3>

              <pre className="text-xs bg-black/40 p-2 rounded mt-2 overflow-auto max-h-40">
                {s.script}
              </pre>

              <button
                onClick={() => copy(s._id, s.script)}
                className="mt-2 text-xs bg-emerald-500 px-2 py-1 rounded"
              >
                {copied === s._id ? "Copied!" : "Copy"}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
