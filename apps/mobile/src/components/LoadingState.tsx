import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export function LoadingState() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0f766e" />
      <Text style={styles.title}>Analyzing image...</Text>
      <Text style={styles.subtitle}>This may take a few seconds.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    padding: 28
  },
  title: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700"
  },
  subtitle: {
    color: "#4b5563",
    fontSize: 14
  }
});
