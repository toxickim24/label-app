import React, { forwardRef, useMemo, ReactNode } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import BottomSheetModal, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useTheme } from 'react-native-paper';
import { useThemeStore } from '../store';

interface BottomSheetProps {
  children: ReactNode;
  title?: string;
  snapPoints?: (string | number)[];
  enableDismissOnClose?: boolean;
  enablePanDownToClose?: boolean;
  index?: number;
}

/**
 * Custom BottomSheet component that wraps @gorhom/bottom-sheet
 * with theme-aware styling and proper configuration
 *
 * Usage:
 * ```tsx
 * const bottomSheetRef = useRef<BottomSheetModal>(null);
 *
 * <BottomSheet ref={bottomSheetRef} title="Select Template">
 *   <YourContent />
 * </BottomSheet>
 *
 * // To open:
 * bottomSheetRef.current?.present();
 *
 * // To close:
 * bottomSheetRef.current?.dismiss();
 * ```
 */
export const BottomSheet = forwardRef<BottomSheetModal, BottomSheetProps>(
  (
    {
      children,
      title,
      snapPoints = ['50%', '75%'],
      enableDismissOnClose = true,
      enablePanDownToClose = true,
      index = 0,
    },
    ref
  ) => {
    const theme = useTheme();
    const currentTheme = useThemeStore((state) => state.theme);

    // Backdrop component that darkens the background
    const renderBackdrop = (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        pressBehavior="close"
      />
    );

    // Handle component for the top of the sheet
    const renderHandle = () => (
      <View style={[styles.handleContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.handle, { backgroundColor: theme.colors.onSurfaceVariant }]} />
        {title && (
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {title}
          </Text>
        )}
      </View>
    );

    const backgroundStyle = useMemo(
      () => ({
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }),
      [theme.colors.surface]
    );

    const handleIndicatorStyle = useMemo(
      () => ({
        backgroundColor: theme.colors.onSurfaceVariant,
      }),
      [theme.colors.onSurfaceVariant]
    );

    // On web, we fall back to a modal-style component since bottom sheets don't make sense
    if (Platform.OS === 'web') {
      return null; // Web will use Dialog instead
    }

    return (
      <BottomSheetModal
        ref={ref}
        index={index}
        snapPoints={snapPoints}
        enableDismissOnClose={enableDismissOnClose}
        enablePanDownToClose={enablePanDownToClose}
        backdropComponent={renderBackdrop}
        backgroundStyle={backgroundStyle}
        handleIndicatorStyle={handleIndicatorStyle}
        handleComponent={renderHandle}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetView style={styles.contentContainer}>
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';

const styles = StyleSheet.create({
  handleContainer: {
    paddingTop: 12,
    paddingBottom: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'DMSans_700Bold',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
});

/**
 * Simple content wrapper for bottom sheet items
 * Provides consistent padding and spacing
 */
interface BottomSheetItemProps {
  children: ReactNode;
  style?: any;
}

export const BottomSheetItem: React.FC<BottomSheetItemProps> = ({ children, style }) => {
  return <View style={[styles.itemContainer, style]}>{children}</View>;
};

const itemStyles = StyleSheet.create({
  itemContainer: {
    paddingVertical: 12,
  },
});

// Merge styles
Object.assign(styles, itemStyles);
