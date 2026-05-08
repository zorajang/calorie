import Link from "next/link";
import { PageShell } from "@/components/common/page-shell";
import { RecentWeightList } from "@/components/forms/recent-weight-list";
import { SettingsForm } from "@/components/forms/settings-form";
import { getLatestProfile, getRecentWeightLogs } from "@/lib/repository";
import { sampleRecentWeightLogs } from "@/lib/sample-data";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await getLatestProfile();
  const recentWeightLogs = await getRecentWeightLogs(6);
  const safeRecentWeightLogs = recentWeightLogs.length > 0 ? recentWeightLogs : sampleRecentWeightLogs;

  return (
    <PageShell
      actions={
        <Link className="inline-flex rounded-full border border-ink/15 bg-white/70 px-4 py-2 text-sm" href="/">
          返回首页
        </Link>
      }
      description="用这些数据计算 BMR、TDEE 和每日目标摄入。历史记录会按天保存快照，不跟随后续修改重算。"
      eyebrow="Profile"
      title="基础设置"
    >
      <SettingsForm initialProfile={profile} />
      <RecentWeightList items={safeRecentWeightLogs} />
    </PageShell>
  );
}
