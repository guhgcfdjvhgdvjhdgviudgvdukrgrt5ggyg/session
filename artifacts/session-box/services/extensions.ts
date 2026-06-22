import AsyncStorage from "@react-native-async-storage/async-storage";

const EXTENSIONS_PREFIX = "@session_extensions_";

export function extensionsKey(sessionId: string): string {
  return `${EXTENSIONS_PREFIX}${sessionId}`;
}

export async function clearSessionExtensions(sessionId: string): Promise<void> {
  await AsyncStorage.removeItem(extensionsKey(sessionId));
}
