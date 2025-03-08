/**
 * Utility functions for handling mobile keyboard
 */

/**
 * Dismisses the mobile keyboard by removing focus from the active element
 * and optionally forcing the blur event
 *
 * @param {boolean} forceBlur - Whether to force blur on all input elements
 */
export const dismissKeyboard = (forceBlur = false) => {
  // Blur the currently focused element
  if (document.activeElement) {
    document.activeElement.blur();
  }

  // For more stubborn keyboards, we can try to blur all input elements
  if (forceBlur) {
    const inputs = document.querySelectorAll("input, textarea");
    inputs.forEach((input) => input.blur());
  }

  // For iOS devices, we can try to scroll the page slightly
  // This is a common trick to force the keyboard to dismiss
  try {
    window.scrollTo(0, window.scrollY + 1);
    window.scrollTo(0, window.scrollY - 1);
  } catch (e) {
    // Ignore any errors
  }
};

/**
 * Creates a handler that dismisses the keyboard when called
 * Useful for attaching to onBlur, onChange, etc.
 *
 * @param {Function} callback - Optional callback to run after dismissing keyboard
 * @returns {Function} - Handler function
 */
export const createKeyboardDismissHandler = (callback) => {
  return (...args) => {
    dismissKeyboard();
    if (typeof callback === "function") {
      callback(...args);
    }
  };
};
