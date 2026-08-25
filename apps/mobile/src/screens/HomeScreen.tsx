import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { RecentScan } from "../types/analysis";

type HomeScreenProps = {
  recentScans: RecentScan[];
  onChooseGallery: () => void;
  onTakePhoto: () => void;
  onOpenPrivacy: () => void;
  onClearHistory: () => void;
};

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recent";
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export function HomeScreen({
  recentScans,
  onChooseGallery,
  onTakePhoto,
  onOpenPrivacy,
  onClearHistory
}: HomeScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AIExplorer</Text>
        <Text style={styles.subtitle}>Explore the world through AI vision.</Text>
        <Text style={styles.privacyNote}>
          Images are uploaded only for analysis and are not permanently stored by this app.
        </Text>
        <Pressable onPress={onOpenPrivacy}>
          <Text style={styles.privacyLink}>Privacy policy</Text>
        </Pressable>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={onChooseGallery}>
          <Text style={styles.primaryButtonText}>Choose from Gallery</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onTakePhoto}>
          <Text style={styles.secondaryButtonText}>Take Photo</Text>
        </Pressable>
      </View>

      {recentScans.length > 0 ? (
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Recent scans</Text>
            <Pressable onPress={onClearHistory}>
              <Text style={styles.clearButton}>Clear</Text>
            </Pressable>
          </View>
          {recentScans.map((scan) => (
            <View key={scan.id} style={styles.historyItem}>
              <Image source={{ uri: scan.imageUri }} style={styles.historyImage} />
              <View style={styles.historyText}>
                <Text style={styles.historyName} numberOfLines={1}>
                  {scan.name}
                </Text>
                <Text style={styles.historySummary} numberOfLines={2}>
                  {scan.summary}
                </Text>
                <Text style={styles.historyDate}>{formatDate(scan.createdAt)}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 22,
    paddingBottom: 36
  },
  header: {
    marginTop: 32
  },
  title: {
    color: "#111827",
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: 0
  },
  subtitle: {
    color: "#374151",
    fontSize: 18,
    lineHeight: 26,
    marginTop: 8
  },
  privacyNote: {
    color: "#6b7280",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 16
  },
  privacyLink: {
    color: "#0f766e",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 10
  },
  actions: {
    gap: 12,
    marginTop: 34
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 15
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700"
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderColor: "#d1d5db",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 15
  },
  secondaryButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700"
  },
  historySection: {
    marginTop: 36
  },
  historyHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800"
  },
  clearButton: {
    color: "#0f766e",
    fontSize: 15,
    fontWeight: "700"
  },
  historyItem: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
    padding: 10
  },
  historyImage: {
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    height: 66,
    width: 66
  },
  historyText: {
    flex: 1,
    justifyContent: "center"
  },
  historyName: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700"
  },
  historySummary: {
    color: "#4b5563",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3
  },
  historyDate: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 5
  }
});
