import React, {
  createContext,
  useContext,
  useRef,
} from 'react';

import {
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import BottomSheet from '@gorhom/bottom-sheet';

import ProfileSheet from '@/components/profilesheet';

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
  const profileSheetRef =
    useRef<BottomSheet>(null);

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

        {/*
         * IMPORTANT:
         *
         * ProfileSheet is rendered AFTER the tabs.
         * This allows the sheet to visually overlay
         * the navbar.
         *
         * GestureHandlerRootView surrounds BOTH
         * the tabs and the profile sheet, so the
         * BottomSheet and its scroll view share the
         * same gesture-handler root.
         */}
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
      'useProfileSheet must be used inside ProfileSheetProvider'
    );
  }

  return context;
}