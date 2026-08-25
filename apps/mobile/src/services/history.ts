import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AnalysisResult, RecentScan } from "../types/analysis";

const STORAGE_KEY = "@AIExplorer/recentScans";
const MAX_RECENT_SCANS = 8;

export async function loadRecentScans(): Promise<RecentScan[]> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveRecentScan(
  imageUri: string,
  result: AnalysisResult
): Promise<RecentScan[]> {
  const existing = await loadRecentScans();
  const next: RecentScan = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    imageUri,
    name: result.name,
    summary: result.summary,
    createdAt: new Date().toISOString()
  };

  const scans = [next, ...existing].slice(0, MAX_RECENT_SCANS);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
  return scans;
}

export async function clearRecentScans(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
