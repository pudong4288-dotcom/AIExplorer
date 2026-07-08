import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { LoadingState } from "../components/LoadingState";
import type { SelectedImage } from "../types/analysis";

type ImagePickerScreenProps = {
  selectedImage: SelectedImage;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onChooseDifferent: () => void;
};

export function ImagePickerScreen({
  selectedImage,
  isAnalyzing,
  onAnalyze,
  onChooseDifferent
}: ImagePickerScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.previewHeader}>
        <Text style={styles.title}>Preview image</Text>
        <Text style={styles.subtitle}>Make sure the object is visible before analysis.</Text>
      </View>

      <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} resizeMode="cover" />

      {isAnalyzing ? (
        <LoadingState />
      ) : (
        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={onAnalyze} disabled={isAnalyzing}>
            <Text style={styles.primaryButtonText}>Analyze Image</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={onChooseDifferent}>
            <Text style={styles.secondaryButtonText}>Choose Different Image</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  previewHeader: {
    marginTop: 22,
    marginBottom: 16
  },
  title: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "800"
  },
  subtitle: {
    color: "#4b5563",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6
  },
  previewImage: {
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    height: 360,
    width: "100%"
  },
  actions: {
    gap: 12,
    marginTop: 22
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
    backgroundColor: "#ffffff",
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
  }
});
