import React, {
  createContext,
  useContext,
  useRef,
} from "react";

import {
  GestureHandlerRootView,
} from "react-native-gesture-handler";

import ProfileSheet from "@/components/profilesheet";

type ProfileSheetContextType = {
  openProfile: () => void;
  closeProfile: () => void;
};

const ProfileSheetContext =
  createContext<ProfileSheetContextType | null>(null);

export function ProfileSheetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const profileSheetRef = useRef<any>(null);

  const openProfile = () => {
    profileSheetRef.current?.snapToIndex(0);
  };

  const closeProfile = () => {
    profileSheetRef.current?.close();
  };

  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
      }}
    >
      <ProfileSheetContext.Provider
        value={{
          openProfile,
          closeProfile,
        }}
      >
        {children}

        {





}

        <ProfileSheet
          ref={profileSheetRef}
        />
      </ProfileSheetContext.Provider>
    </GestureHandlerRootView>
  );
}

export function useProfileSheet() {
  const context =
    useContext(ProfileSheetContext);

  if (!context) {
    throw new Error(
      "useProfileSheet must be used inside ProfileSheetProvider"
    );
  }

  return context;
}