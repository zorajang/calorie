import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getProfile, saveProfile } from "@/lib/api";
import type { UserProfileRecord } from "@/lib/types";

export default function SettingsScreen() {
  const [profile, setProfile] = useState<UserProfileRecord | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    getProfile()
      .then((data) => setProfile(data.profile))
      .catch((error) => setStatus(error.message));
  }, []);

  if (!profile) {
    return (
      <SafeAreaView style={styles.loading} edges={["top"]}>
        <Text style={styles.loadingText}>加载设置中...</Text>
      </SafeAreaView>
    );
  }

  async function handleSave() {
    try {
      const result = await saveProfile({
        ...profile,
        name: profile.name ?? ""
      });
      setProfile(result.profile);
      setStatus(`已保存。今日目标 ${result.dailyTarget.targetIntakeKcal} kcal`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "保存失败");
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>Profile</Text>
      <Text style={styles.title}>基础设置</Text>

      <View style={styles.card}>
        <Field label="昵称" value={profile.name ?? ""} onChange={(value) => setProfile({ ...profile, name: value })} />
        <Field label="年龄" value={String(profile.age)} onChange={(value) => setProfile({ ...profile, age: Number(value) || 0 })} />
        <Field label="身高(cm)" value={String(profile.heightCm)} onChange={(value) => setProfile({ ...profile, heightCm: Number(value) || 0 })} />
        <Field label="体重(kg)" value={String(profile.weightKg)} onChange={(value) => setProfile({ ...profile, weightKg: Number(value) || 0 })} />
        <Field
          label="热量缺口目标(kcal)"
          value={String(profile.goalAdjustmentKcal)}
          onChange={(value) => setProfile({ ...profile, goalAdjustmentKcal: Number(value) || 0 })}
        />
        <Pressable onPress={handleSave} style={styles.button}>
          <Text style={styles.buttonText}>保存设置</Text>
        </Pressable>
        <Text style={styles.helper}>{status}</Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput onChangeText={onChange} style={styles.input} value={value} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f1e8"
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f1e8"
  },
  loadingText: {
    color: "#6f655c"
  },
  container: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 28,
    gap: 16,
    backgroundColor: "#f5f1e8"
  },
  eyebrow: {
    color: "#c86a3c",
    fontSize: 12,
    letterSpacing: 3,
    textTransform: "uppercase"
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#1a1816"
  },
  card: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: "#fffdf8",
    gap: 14
  },
  field: {
    gap: 8
  },
  label: {
    color: "#6f655c",
    fontSize: 13
  },
  input: {
    borderRadius: 18,
    backgroundColor: "#f6f0e6",
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  button: {
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: "#c86a3c",
    paddingVertical: 14,
    alignItems: "center"
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600"
  },
  helper: {
    color: "#6f655c"
  }
});
