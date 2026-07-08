import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { AnalysisResult } from "../types/analysis";

type ResultScreenProps = {
  result: AnalysisResult;
  imageUri: string;
  onAnalyzeAnother: () => void;
};

function confidenceLabel(confidence: number): string {
  const percent = Math.round(confidence * 100);

  if (confidence >= 0.75) {
    return `Confidence: ${percent}%`;
  }

  if (confidence >= 0.45) {
    return `Moderate confidence: ${percent}%`;
  }

  return `Uncertain: ${percent}%`;
}

export function ResultScreen({ result, imageUri, onAnalyzeAnother }: ResultScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.thumbnail} resizeMode="cover" />

      <View style={styles.header}>
        <Text style={styles.name}>{result.name}</Text>
        {result.scientificName ? (
          <Text style={styles.scientificName}>{result.scientificName}</Text>
        ) : null}
        <Text style={styles.confidence}>{confidenceLabel(result.confidence)}</Text>
      </View>

      <Text style={styles.summary}>{result.summary}</Text>

      {result.facts.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fun Facts</Text>
          {result.facts.map((fact, index) => (
            <Text key={`${fact}-${index}`} style={styles.fact}>
              - {fact}
            </Text>
          ))}
        </View>
      ) : null}

      {result.resources.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          {result.resources.map((resource, index) => (
            <Pressable
              key={`${resource.url}-${index}`}
              style={styles.resourceLink}
              onPress={() => Linking.openURL(resource.url)}
            >
              <Text style={styles.resourceType}>[{resource.type}]</Text>
              <Text style={styles.resourceTitle}>{resource.title}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <Pressable style={styles.primaryButton} onPress={onAnalyzeAnother}>
        <Text style={styles.primaryButtonText}>Analyze Another Image</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 38
  },
  thumbnail: {
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    height: 220,
    marginTop: 18,
    width: "100%"
  },
  header: {
    marginTop: 22
  },
  name: {
    color: "#111827",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36
  },
  scientificName: {
    color: "#4b5563",
    fontSize: 17,
    fontStyle: "italic",
    marginTop: 4
  },
  confidence: {
    color: "#0f766e",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 10
  },
  summary: {
    color: "#1f2937",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 18
  },
  section: {
    marginTop: 26
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 10
  },
  fact: {
    color: "#1f2937",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8
  },
  resourceLink: {
    alignItems: "center",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginBottom: 9,
    padding: 12
  },
  resourceType: {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize"
  },
  resourceTitle: {
    color: "#0f766e",
    flex: 1,
    fontSize: 15,
    fontWeight: "700"
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    marginTop: 30,
    paddingHorizontal: 18,
    paddingVertical: 15
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700"
  }
});
