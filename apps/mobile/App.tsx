import { useEffect, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ErrorAlert } from "./src/components/ErrorAlert";
import { analyzeImage, ImageAnalysisError } from "./src/services/api";
import { loadRecentScans, saveRecentScan } from "./src/services/history";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ImagePickerScreen } from "./src/screens/ImagePickerScreen";
import { ResultScreen } from "./src/screens/ResultScreen";
import type { AnalysisResult, RecentScan, SelectedImage } from "./src/types/analysis";

type Screen = "home" | "preview" | "result";

const PERMISSION_ERROR =
  "AIExplorer needs permission to access your camera or photo library.";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadRecentScans()
      .then(setRecentScans)
      .catch(() => setRecentScans([]));
  }, []);

  async function chooseFromGallery() {
    setErrorMessage(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setErrorMessage(PERMISSION_ERROR);
      return;
    }

    const image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9
    });

    if (image.canceled || !image.assets[0]) {
      return;
    }

    setSelectedImage(image.assets[0]);
    setScreen("preview");
  }

  async function takePhoto() {
    setErrorMessage(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      setErrorMessage(PERMISSION_ERROR);
      return;
    }

    const image = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9
    });

    if (image.canceled || !image.assets[0]) {
      return;
    }

    setSelectedImage(image.assets[0]);
    setScreen("preview");
  }

  async function analyzeSelectedImage() {
    if (!selectedImage?.uri || isAnalyzing) {
      setErrorMessage("Please choose an image first.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const analysis = await analyzeImage(selectedImage.uri);
      setResult(analysis);
      setRecentScans(await saveRecentScan(selectedImage.uri, analysis));
      setScreen("result");
    } catch (error) {
      if (error instanceof ImageAnalysisError) {
        setErrorMessage(error.userMessage);
      } else {
        setErrorMessage("Something went wrong. Please try another image.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  }

  function resetToHome() {
    setScreen("home");
    setSelectedImage(null);
    setResult(null);
    setErrorMessage(null);
  }

  function renderScreen() {
    if (screen === "preview" && selectedImage) {
      return (
        <ImagePickerScreen
          selectedImage={selectedImage}
          isAnalyzing={isAnalyzing}
          onAnalyze={analyzeSelectedImage}
          onChooseDifferent={chooseFromGallery}
        />
      );
    }

    if (screen === "result" && result && selectedImage) {
      return (
        <ResultScreen
          result={result}
          imageUri={selectedImage.uri}
          onAnalyzeAnother={resetToHome}
        />
      );
    }

    return (
      <HomeScreen
        recentScans={recentScans}
        onChooseGallery={chooseFromGallery}
        onTakePhoto={takePhoto}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.appShell}>
        {errorMessage ? (
          <ErrorAlert message={errorMessage} onDismiss={() => setErrorMessage(null)} />
        ) : null}
        {renderScreen()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#f8fafc",
    flex: 1
  },
  appShell: {
    backgroundColor: "#f8fafc",
    flex: 1
  }
});
