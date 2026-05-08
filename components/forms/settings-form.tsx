"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserProfileRecord } from "@/lib/types";

const activityOptions = [
  { value: "sedentary", label: "久坐", note: "活动系数 1.2" },
  { value: "light", label: "轻度活动", note: "活动系数 1.375" },
  { value: "moderate", label: "中度活动", note: "活动系数 1.55" },
  { value: "high", label: "高度活动", note: "活动系数 1.725" }
];

type SettingsFormProps = {
  initialProfile: UserProfileRecord | null;
};

export function SettingsForm({ initialProfile }: SettingsFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") || ""),
      gender: String(formData.get("gender") || "female"),
      age: Number(formData.get("age") || 0),
      heightCm: Number(formData.get("heightCm") || 0),
      weightKg: Number(formData.get("weightKg") || 0),
      activityLevel: String(formData.get("activityLevel") || "moderate"),
      goalType: String(formData.get("goalType") || "cut"),
      goalAdjustmentKcal: Number(formData.get("goalAdjustmentKcal") || 0)
    };

    const response = await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    setIsSaving(false);

    if (!response.ok) {
      setStatus(data.error ? "保存失败，请检查输入或数据库配置。" : "保存失败。");
      return;
    }

    setStatus(`已保存。今日目标摄入 ${data.dailyTarget.targetIntakeKcal} kcal`);
    router.refresh();
  }

  return (
    <form className="grid gap-6 rounded-[32px] border border-ink/10 bg-white/75 p-6 shadow-[0_20px_60px_rgba(26,24,22,0.06)] md:grid-cols-2" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-2 md:col-span-2">
        <span className="text-sm text-ink/65">昵称</span>
        <input
          className="rounded-2xl border border-ink/10 bg-sand px-4 py-3 outline-none"
          defaultValue={initialProfile?.name ?? ""}
          name="name"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-ink/65">性别</span>
        <select
          className="rounded-2xl border border-ink/10 bg-sand px-4 py-3 outline-none"
          defaultValue={initialProfile?.gender ?? "female"}
          name="gender"
        >
          <option value="female">女</option>
          <option value="male">男</option>
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-ink/65">年龄</span>
        <input
          className="rounded-2xl border border-ink/10 bg-sand px-4 py-3 outline-none"
          defaultValue={initialProfile?.age ?? 29}
          name="age"
          type="number"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-ink/65">身高（cm）</span>
        <input
          className="rounded-2xl border border-ink/10 bg-sand px-4 py-3 outline-none"
          defaultValue={initialProfile?.heightCm ?? 168}
          name="heightCm"
          step="0.1"
          type="number"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-ink/65">体重（kg）</span>
        <input
          className="rounded-2xl border border-ink/10 bg-sand px-4 py-3 outline-none"
          defaultValue={initialProfile?.weightKg ?? 60}
          name="weightKg"
          step="0.1"
          type="number"
        />
      </label>

      <label className="flex flex-col gap-2 md:col-span-2">
        <span className="text-sm text-ink/65">活动等级</span>
        <div className="grid gap-3 md:grid-cols-4">
          {activityOptions.map((option) => (
            <label key={option.value} className="rounded-[24px] border border-ink/10 bg-sand p-4">
              <input
                className="mb-3"
                defaultChecked={(initialProfile?.activityLevel ?? "moderate") === option.value}
                name="activityLevel"
                type="radio"
                value={option.value}
              />
              <p className="text-base font-semibold">{option.label}</p>
              <p className="mt-1 text-sm text-ink/60">{option.note}</p>
            </label>
          ))}
        </div>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-ink/65">目标模式</span>
        <select
          className="rounded-2xl border border-ink/10 bg-sand px-4 py-3 outline-none"
          defaultValue={initialProfile?.goalType ?? "cut"}
          name="goalType"
        >
          <option value="cut">减脂</option>
          <option value="maintain">维持</option>
          <option value="bulk">增肌</option>
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-ink/65">热量调整（kcal）</span>
        <input
          className="rounded-2xl border border-ink/10 bg-sand px-4 py-3 outline-none"
          defaultValue={initialProfile?.goalAdjustmentKcal ?? 500}
          name="goalAdjustmentKcal"
          type="number"
        />
      </label>

      <div className="md:col-span-2 flex items-center justify-between rounded-[28px] bg-mist px-5 py-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-ink/45">Preview</p>
          <p className="mt-2 text-lg font-semibold">保存后自动为今天生成 BMR / TDEE / 目标摄入快照</p>
          {status ? <p className="mt-2 text-sm text-ink/65">{status}</p> : null}
        </div>
        <button className="rounded-full bg-clay px-5 py-3 text-sm font-medium text-white disabled:opacity-60" disabled={isSaving} type="submit">
          {isSaving ? "保存中..." : "保存设置"}
        </button>
      </div>
    </form>
  );
}
