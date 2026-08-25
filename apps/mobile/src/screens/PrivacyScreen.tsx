import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

type PrivacyScreenProps = {
  onBack: () => void;
};

export function PrivacyScreen({ onBack }: PrivacyScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Privacy</Text>
      <Text style={styles.paragraph}>
        When you analyze a photo, AIExplorer uploads that image to its backend so a
        vision model can return an educational explanation. The server keeps the
        image in memory for that request only and does not store it permanently.
      </Text>
      <Text style={styles.paragraph}>
        Recent scans stay on this device. You can clear them from the home screen.
        AIExplorer does not create an account and does not sell your data.
      </Text>
      <Text style={styles.paragraph}>
        Do not photograph information you do not want sent for analysis.
      </Text>
      <Pressable style={styles.button} onPress={onBack}>
        <Text style={styles.buttonText}>Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 22,
    paddingBottom: 36
  },
  title: {
    color: "#111827",
    fontSize: 32,
    fontWeight: "800",
    marginTop: 32
  },
  paragraph: {
    color: "#374151",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16
  },
  button: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    marginTop: 28,
    paddingHorizontal: 18,
    paddingVertical: 15
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700"
  }
});
