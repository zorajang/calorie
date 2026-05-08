"use client";

import type { Route } from "next";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function HistorySearchForm({ initialRange = 7 }: { initialRange?: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [range, setRange] = useState(searchParams.get("range") ?? String(initialRange));

  function submit() {
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    params.set("range", range);
    const href = `/history${params.toString() ? `?${params.toString()}` : ""}` as Route;
    router.push(href);
  }

  return (
    <section className="rounded-[28px] border border-ink/10 bg-white/75 p-5 shadow-[0_20px_60px_rgba(26,24,22,0.06)]">
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          className="flex-1 rounded-2xl border border-ink/10 bg-sand px-4 py-3 outline-none"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索历史食物，例如 鸡胸肉 / 乌冬面"
          value={query}
        />
        <select className="rounded-2xl border border-ink/10 bg-sand px-4 py-3 outline-none" onChange={(event) => setRange(event.target.value)} value={range}>
          <option value="7">近 7 天</option>
          <option value="14">近 14 天</option>
          <option value="30">近 30 天</option>
        </select>
        <button className="rounded-full bg-clay px-5 py-3 text-sm font-medium text-white" onClick={submit} type="button">
          搜索
        </button>
      </div>
    </section>
  );
}
