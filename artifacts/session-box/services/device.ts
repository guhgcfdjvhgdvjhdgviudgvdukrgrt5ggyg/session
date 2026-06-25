import AsyncStorage from "@react-native-async-storage/async-storage";

const DEVICE_KEY = "@session_box_device_id";

function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "sbx_";
  for (let i = 0; i < 32; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

let cachedId: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (cachedId) return cachedId;
  const existing = await AsyncStorage.getItem(DEVICE_KEY);
  if (existing) {
    cachedId = existing;
    return existing;
  }
  const id = generateId();
  await AsyncStorage.setItem(DEVICE_KEY, id);
  cachedId = id;
  return id;
}
