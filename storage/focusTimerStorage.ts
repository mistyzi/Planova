import AsyncStorage from "@react-native-async-storage/async-storage";

const ACTIVE_FOCUS_SESSION_KEY = "@planova_active_focus_session";

export type ActiveFocusSession = {
  id: string;
  name: string;
  durationSeconds: number;
  endsAt: number;
  remainingSeconds: number;
  isRunning: boolean;
  isCompleted: boolean;
};

export async function getActiveFocusSession(): Promise<ActiveFocusSession | null> {
  try {
    const stored = await AsyncStorage.getItem(ACTIVE_FOCUS_SESSION_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") {
      await AsyncStorage.removeItem(ACTIVE_FOCUS_SESSION_KEY);
      return null;
    }
    return parsed as ActiveFocusSession;
  } catch (error) {
    console.log("Failed to get active focus session:", error);
    return null;
  }
}

export async function saveActiveFocusSession(session: ActiveFocusSession): Promise<void> {
  try {
    await AsyncStorage.setItem(ACTIVE_FOCUS_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.log("Failed to save active focus session:", error);
  }
}

export async function createActiveFocusSession(
  name: string,
  durationSeconds: number
): Promise<ActiveFocusSession> {
  const now = Date.now();
  const session: ActiveFocusSession = {
    id: `${now}`,
    name,
    durationSeconds,
    endsAt: now + durationSeconds * 1000,
    remainingSeconds: durationSeconds,
    isRunning: true,
    isCompleted: false,
  };
  await saveActiveFocusSession(session);
  return session;
}

export async function pauseActiveFocusSession(): Promise<ActiveFocusSession | null> {
  const session = await getActiveFocusSession();
  if (!session) return null;
  if (!session.isRunning) return session;
  const remainingSeconds = Math.max(0, Math.ceil((session.endsAt - Date.now()) / 1000));
  if (remainingSeconds <= 0) {
    const completedSession = {
      ...session,
      remainingSeconds: 0,
      isRunning: false,
      isCompleted: true,
      endsAt: 0,
    };
    await saveActiveFocusSession(completedSession);
    return completedSession;
  }
  const pausedSession: ActiveFocusSession = {
    ...session,
    endsAt: 0,
    remainingSeconds,
    isRunning: false,
    isCompleted: false,
  };
  await saveActiveFocusSession(pausedSession);
  return pausedSession;
}

export async function resumeActiveFocusSession(): Promise<ActiveFocusSession | null> {
  const session = await getActiveFocusSession();
  if (!session) return null;
  if (session.isRunning) return session;
  if (session.isCompleted || session.remainingSeconds <= 0) return null;
  const now = Date.now();
  const resumedSession: ActiveFocusSession = {
    ...session,
    endsAt: now + session.remainingSeconds * 1000,
    isRunning: true,
    isCompleted: false,
  };
  await saveActiveFocusSession(resumedSession);
  return resumedSession;
}

export async function completeActiveFocusSession(): Promise<void> {
  try {
    const session = await getActiveFocusSession();
    if (!session) return;
    const completedSession: ActiveFocusSession = {
      ...session,
      endsAt: 0,
      remainingSeconds: 0,
      isRunning: false,
      isCompleted: true,
    };
    await saveActiveFocusSession(completedSession);
  } catch (error) {
    console.log("Failed to complete focus session:", error);
  }
}

export async function clearActiveFocusSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACTIVE_FOCUS_SESSION_KEY);
  } catch (error) {
    console.log("Failed to clear active focus session:", error);
  }
}