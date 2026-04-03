/**
 * Toast Notification Utility
 * Professional toast notifications with consistent styling
 */

import Toast from 'react-native-toast-message';

export const showToast = {
  success: (message: string, description?: string) => {
    Toast.show({
      type: 'success',
      text1: message,
      text2: description,
      position: 'top',
      visibilityTime: 3000,
      topOffset: 60,
    });
  },

  error: (message: string, description?: string) => {
    Toast.show({
      type: 'error',
      text1: message,
      text2: description,
      position: 'top',
      visibilityTime: 4000,
      topOffset: 60,
    });
  },

  info: (message: string, description?: string) => {
    Toast.show({
      type: 'info',
      text1: message,
      text2: description,
      position: 'top',
      visibilityTime: 3000,
      topOffset: 60,
    });
  },

  warning: (message: string, description?: string) => {
    Toast.show({
      type: 'error', // Using error type for warnings with custom styling
      text1: message,
      text2: description,
      position: 'top',
      visibilityTime: 3500,
      topOffset: 60,
    });
  },

  // Quick action toast with undo functionality
  action: (message: string, onUndo?: () => void) => {
    Toast.show({
      type: 'success',
      text1: message,
      text2: onUndo ? 'Tap to undo' : undefined,
      position: 'bottom',
      visibilityTime: 4000,
      bottomOffset: 100,
      onPress: onUndo,
    });
  },
};

export default showToast;
