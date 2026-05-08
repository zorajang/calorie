import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getHistorySeries, searchHistory } from "@/lib/api";
import type { HistoryPoint, HistorySearchItem, WeightTrendPoint } from "@/lib/types";

const CHART_HEIGHT = 140;
const CHART_DOT_SIZE = 10;
const CHART_HORIZONTAL_PADDING = 12;

export default function HistoryScreen() {
  const [days, setDays] = useState(7);
  const [calorieSeries, setCalorieSeries] = useState<HistoryPoint[]>([]);
  const [weightSeries, setWeightSeries] = useState<WeightTrendPoint[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HistorySearchItem[]>([]);
  const [status, setStatus] = useState("");

  const loadHistoryData = useCallback(() => {
    getHistorySeries(days)
      .then((data) => {
        setCalorieSeries(data.calorieSeries);
        setWeightSeries(data.weightSeries);
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : "加载历史失败"));
  }, [days]);

  useEffect(() => {
    loadHistoryData();
  }, [loadHistoryData]);

  useFocusEffect(
    useCallback(() => {
      loadHistoryData();
    }, [loadHistoryData])
  );

  async function handleSearch() {
    try {
      const data = await searchHistory(query, 20);
      setResults(data.items);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "搜索失败");
    }
  }

  const calorieMax = useMemo(() => Math.max(1, ...calorieSeries.map((point) => Math.max(point.consumedKcal, point.targetIntakeKcal))), [calorieSeries]);
  const weightMin = useMemo(() => Math.min(...weightSeries.map((point) => point.weightKg), 0), [weightSeries]);
  const weightMax = useMemo(() => Math.max(...weightSeries.map((point) => point.weightKg), 1), [weightSeries]);
  const weightSpan = Math.max(weightMax - weightMin, 0.5);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>Trend</Text>
        <Text style={styles.title}>历史趋势</Text>

        <View style={styles.rangeRow}>
          {[7, 14, 30].map((value) => (
            <Pressable key={value} onPress={() => setDays(value)} style={[styles.rangeChip, days === value && styles.rangeChipActive]}>
              <Text style={[styles.rangeText, days === value && styles.rangeTextActive]}>{value}天</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>热量趋势</Text>
          <Text style={styles.cardHint}>橙线是已摄入，浅线是目标摄入</Text>
          <CalorieLineChart points={calorieSeries} maxValue={calorieMax} />
          {calorieSeries.map((point) => (
            <View key={`meta-${point.date}`} style={styles.row}>
              <Text style={styles.rowDate}>{point.date}</Text>
              <Text style={styles.rowValue}>
                {point.consumedKcal} / {point.targetIntakeKcal} kcal
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>体重趋势</Text>
          <Text style={styles.cardHint}>按最近记录绘制移动端简版趋势</Text>
          <View style={styles.chartRow}>
            {weightSeries.map((point) => {
              const relative = ((point.weightKg - weightMin) / weightSpan) * 100;
              return (
                <View key={point.date} style={styles.chartColumn}>
                  <View style={styles.weightTrack}>
                    <View style={[styles.weightDot, { bottom: `${Math.min(92, Math.max(4, relative))}%` }]} />
                  </View>
                  <Text style={styles.chartLabel}>{point.date.slice(5)}</Text>
                </View>
              );
            })}
          </View>
          {weightSeries.map((point) => (
            <View key={`weight-${point.date}`} style={styles.row}>
              <Text style={styles.rowDate}>{point.date}</Text>
              <Text style={styles.rowValue}>{point.weightKg} kg</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>历史搜索</Text>
          <View style={styles.searchRow}>
            <TextInput onChangeText={setQuery} placeholder="搜索鸡胸肉 / 乌冬面" style={styles.searchInput} value={query} />
            <Pressable onPress={handleSearch} style={styles.searchButton}>
              <Text style={styles.searchButtonText}>搜索</Text>
            </Pressable>
          </View>
          {results.map((item) => (
            <View key={item.id} style={styles.row}>
              <Text style={styles.rowDate}>
                {item.date} · {item.foodName}
              </Text>
              <Text style={styles.rowValue}>{item.caloriesKcal} kcal</Text>
            </View>
          ))}
          {status ? <Text style={styles.helper}>{status}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CalorieLineChart({ points, maxValue }: { points: HistoryPoint[]; maxValue: number }) {
  const [chartWidth, setChartWidth] = useState(0);

  if (points.length === 0) {
    return <Text style={styles.helper}>还没有历史热量数据</Text>;
  }

  return (
    <View style={styles.lineChartWrap}>
      <View
        style={styles.lineChartArea}
        onLayout={(event) => setChartWidth(Math.max(event.nativeEvent.layout.width - CHART_HORIZONTAL_PADDING * 2, 0))}
      >
        <View style={styles.gridLine} />
        <View style={[styles.gridLine, styles.gridLineMid]} />
        <View style={[styles.gridLine, styles.gridLineTop]} />

        {chartWidth > 0 &&
          points.map((point, index) => {
            if (index === points.length - 1) {
              return null;
            }

            const currentX = xForIndex(index, points.length, chartWidth);
            const nextX = xForIndex(index + 1, points.length, chartWidth);
            const currentConsumed = valueToY(point.consumedKcal, maxValue);
            const nextConsumed = valueToY(points[index + 1].consumedKcal, maxValue);
            const currentTarget = valueToY(point.targetIntakeKcal, maxValue);
            const nextTarget = valueToY(points[index + 1].targetIntakeKcal, maxValue);

            return (
              <View key={`segments-${point.date}`}>
                <LineSegment fromX={currentX} fromY={currentConsumed} toX={nextX} toY={nextConsumed} color="#c86a3c" />
                <LineSegment fromX={currentX} fromY={currentTarget} toX={nextX} toY={nextTarget} color="#d8cdbc" />
              </View>
            );
          })}

        {chartWidth > 0 &&
          points.map((point, index) => {
            const x = xForIndex(index, points.length, chartWidth);
            const consumedY = valueToY(point.consumedKcal, maxValue);
            const targetY = valueToY(point.targetIntakeKcal, maxValue);

            return (
              <View key={point.date}>
                <View style={[styles.targetDot, pointStyle(x, targetY)]} />
                <View style={[styles.consumedDot, pointStyle(x, consumedY)]} />
              </View>
            );
          })}
      </View>

      <View style={styles.chartLabelsRow}>
        {points.map((point) => (
          <Text key={`label-${point.date}`} style={styles.chartLabel}>
            {point.date.slice(5)}
          </Text>
        ))}
      </View>
    </View>
  );
}

function LineSegment({
  fromX,
  fromY,
  toX,
  toY,
  color
}: {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
}) {
  const deltaX = toX - fromX;
  const deltaY = toY - fromY;
  const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const angle = Math.atan2(deltaY, deltaX);

  return (
    <View
      style={[
        styles.lineSegment,
        {
          left: CHART_HORIZONTAL_PADDING + fromX,
          top: fromY,
          width: length,
          backgroundColor: color,
          transform: [{ rotate: `${angle}rad` }]
        }
      ]}
    />
  );
}

function xForIndex(index: number, count: number, width: number) {
  if (count <= 1) {
    return width / 2;
  }

  return (index * width) / (count - 1);
}

function valueToY(value: number, maxValue: number) {
  const usableHeight = CHART_HEIGHT - 24;
  const ratio = value / Math.max(maxValue, 1);
  return 10 + (1 - ratio) * usableHeight;
}

function pointStyle(x: number, top: number) {
  return {
    left: CHART_HORIZONTAL_PADDING + x,
    top,
    marginLeft: -(CHART_DOT_SIZE / 2),
    marginTop: -(CHART_DOT_SIZE / 2)
  } as const;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f1e8"
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
  rangeRow: {
    flexDirection: "row",
    gap: 8
  },
  rangeChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d8cdbc",
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  rangeChipActive: {
    backgroundColor: "#c86a3c",
    borderColor: "#c86a3c"
  },
  rangeText: {
    color: "#6f655c"
  },
  rangeTextActive: {
    color: "#ffffff"
  },
  card: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: "#fffdf8",
    gap: 12
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1816"
  },
  cardHint: {
    color: "#6f655c",
    fontSize: 13
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    minHeight: 156,
    paddingTop: 8
  },
  lineChartWrap: {
    gap: 10
  },
  lineChartArea: {
    position: "relative",
    height: CHART_HEIGHT,
    borderRadius: 24,
    backgroundColor: "#f6f0e6",
    paddingHorizontal: CHART_HORIZONTAL_PADDING,
    paddingVertical: 10,
    overflow: "hidden"
  },
  gridLine: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 10,
    borderTopWidth: 1,
    borderColor: "#eadfcf"
  },
  gridLineMid: {
    bottom: CHART_HEIGHT / 2
  },
  gridLineTop: {
    bottom: CHART_HEIGHT - 12
  },
  lineSegment: {
    position: "absolute",
    height: 2
  },
  consumedDot: {
    position: "absolute",
    width: CHART_DOT_SIZE,
    height: CHART_DOT_SIZE,
    borderRadius: 999,
    backgroundColor: "#c86a3c"
  },
  targetDot: {
    position: "absolute",
    width: CHART_DOT_SIZE,
    height: CHART_DOT_SIZE,
    borderRadius: 999,
    backgroundColor: "#d8cdbc",
    borderWidth: 1,
    borderColor: "#c7b9a3"
  },
  chartLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8
  },
  chartColumn: {
    flex: 1,
    alignItems: "center",
    gap: 8
  },
  weightTrack: {
    position: "relative",
    width: "100%",
    maxWidth: 28,
    height: 120,
    borderRadius: 999,
    backgroundColor: "#efe7d8"
  },
  weightDot: {
    position: "absolute",
    left: "50%",
    marginLeft: -7,
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: "#6f8b4e"
  },
  chartLabel: {
    color: "#85796e",
    fontSize: 11
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6
  },
  rowDate: {
    color: "#6f655c"
  },
  rowValue: {
    color: "#1a1816",
    fontWeight: "600"
  },
  searchRow: {
    flexDirection: "row",
    gap: 10
  },
  searchInput: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "#f6f0e6",
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  searchButton: {
    borderRadius: 18,
    backgroundColor: "#c86a3c",
    paddingHorizontal: 16,
    justifyContent: "center"
  },
  searchButtonText: {
    color: "#ffffff",
    fontWeight: "600"
  },
  helper: {
    color: "#6f655c",
    fontSize: 13
  }
});
