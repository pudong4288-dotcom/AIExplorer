import Constants from "expo-constants";

const DEFAULT_BACKEND_PORT = "3001";

type ExpoHostSource = {
  expoConfig?: {
    hostUri?: string;
  };
  manifest?: {
    debuggerHost?: string;
  };
  manifest2?: {
    extra?: {
      expoClient?: {
        hostUri?: string;
      };
      expoGo?: {
        debuggerHost?: string;
      };
    };
  };
};

function hostFromUri(uri: string | undefined): string | null {
  if (!uri) {
    return null;
  }

  const host = uri.replace(/^https?:\/\//, "").split(":")[0];
  return host || null;
}

function getExpoHost(): string | null {
  const constants = Constants as ExpoHostSource;

  return (
    hostFromUri(constants.expoConfig?.hostUri) ||
    hostFromUri(constants.manifest2?.extra?.expoClient?.hostUri) ||
    hostFromUri(constants.manifest2?.extra?.expoGo?.debuggerHost) ||
    hostFromUri(constants.manifest?.debuggerHost)
  );
}

function getDefaultApiBaseUrl(): string {
  const expoHost = getExpoHost();

  if (expoHost) {
    return `http://${expoHost}:${DEFAULT_BACKEND_PORT}`;
  }

  return `http://localhost:${DEFAULT_BACKEND_PORT}`;
}

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || getDefaultApiBaseUrl();

export const ANALYSIS_TIMEOUT_MS = 45000;
