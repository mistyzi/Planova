import AsyncStorage from "@react-native-async-storage/async-storage";

const ACTIVE_FOCUS_SESSION_KEY = "@planova_active_focus_session";

export type ActiveFocusSession = {
  id: string;
  name: string;
  durationSeconds: number;
  startedAt: number;
  endsAt: number;
  remainingSeconds: number;
  isRunning: boolean;
  isCompleted: boolean;
};

export async function saveActiveFocusSession(
  session: ActiveFocusSession,
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      ACTIVE_FOCUS_SESSION_KEY,
      JSON.stringify(session),
    );
  } catch (error) {
    console.log("Failed to save active focus session:", error);
  }
}

export async function getActiveFocusSession(): Promise<ActiveFocusSession | null> {
  try {
    const stored = await AsyncStorage.getItem(ACTIVE_FOCUS_SESSION_KEY);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as ActiveFocusSession;

    if (
      !parsed ||
      typeof parsed.id !== "string" ||
      typeof parsed.name !== "string" ||
      typeof parsed.durationSeconds !== "number" ||
      typeof parsed.remainingSeconds !== "number"
    ) {
      await AsyncStorage.removeItem(ACTIVE_FOCUS_SESSION_KEY);
      return null;
    }

    return parsed;
  } catch (error) {
    console.log("Failed to load active focus session:", error);
    return null;
  }
}

export async function clearActiveFocusSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACTIVE_FOCUS_SESSION_KEY);
  } catch (error) {
    console.log("Failed to clear active focus session:", error);
  }
}

export async function pauseActiveFocusSession(): Promise<ActiveFocusSession | null> {
  try {
    const session = await getActiveFocusSession();

    if (!session) {
      return null;
    }

    if (session.isCompleted) {
      return session;
    }

    if (!session.isRunning) {
      return session;
    }

    const remainingSeconds = Math.max(
      0,
      Math.ceil((session.endsAt - Date.now()) / 1000),
    );

    if (remainingSeconds <= 0) {
      const completedSession: ActiveFocusSession = {
        ...session,
        remainingSeconds: 0,
        isRunning: false,
        isCompleted: true,
      };

      await saveActiveFocusSession(completedSession);

      return completedSession;
    }

    const pausedSession: ActiveFocusSession = {
      ...session,
      remainingSeconds,
      isRunning: false,
      isCompleted: false,
    };

    await saveActiveFocusSession(pausedSession);

    return pausedSession;
  } catch (error) {
    console.log("Failed to pause active focus session:", error);
    return null;
  }
}

export async function resumeActiveFocusSession(): Promise<ActiveFocusSession | null> {
  try {
    const session = await getActiveFocusSession();

    if (!session) {
      return null;
    }

    if (session.isCompleted) {
      return null;
    }

    if (session.isRunning) {
      return session;
    }

    if (session.remainingSeconds <= 0) {
      const completedSession: ActiveFocusSession = {
        ...session,
        remainingSeconds: 0,
        isRunning: false,
        isCompleted: true,
      };

      await saveActiveFocusSession(completedSession);

      return completedSession;
    }

    const now = Date.now();

    const resumedSession: ActiveFocusSession = {
      ...session,
      startedAt: now,
      endsAt: now + session.remainingSeconds * 1000,
      isRunning: true,
      isCompleted: false,
    };

    await saveActiveFocusSession(resumedSession);

    return resumedSession;
  } catch (error) {
    console.log("Failed to resume active focus session:", error);
    return null;
  }
}