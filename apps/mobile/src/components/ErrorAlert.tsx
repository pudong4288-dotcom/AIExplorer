import { Pressable, StyleSheet, Text, View } from "react-native";

type ErrorAlertProps = {
  message: string;
  onDismiss: () => void;
};

export function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.title}>Unable to analyze image</Text>
      <Text style={styles.message}>{message}</Text>
      <Pressable style={styles.button} onPress={onDismiss}>
        <Text style={styles.buttonText}>Dismiss</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 14,
    padding: 14
  },
  title: {
    color: "#991b1b",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4
  },
  message: {
    color: "#7f1d1d",
    fontSize: 14,
    lineHeight: 20
  },
  button: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingVertical: 4
  },
  buttonText: {
    color: "#991b1b",
    fontSize: 14,
    fontWeight: "700"
  }
});
