// calendar/src/util/platform.js
export const isMac = () => {
  return typeof navigator !== 'undefined' &&
        navigator.platform.toUpperCase().indexOf('MAC') >= 0;
};

export const getModifierSymbol = () => {
  return isMac() ? '⌘' : 'Ctrl';
};

// Enhance locale strings with platform-specific modifier keys
export const enhanceLocaleWithPlatformKeys = (locale) => {
  if (!locale) return locale;

  const isMacOS = isMac();

  // Don't modify if already correct platform or no modification needed
  if (!isMacOS) return locale;

  const enhanced = { ...locale };

  // Replace in relevant fields for Mac users
  ['previousYear', 'nextYear', 'previousMonth', 'nextMonth'].forEach(key => {
    if (enhanced[key] && typeof enhanced[key] === 'string') {
      // Replace Chinese/Traditional Chinese pattern: Control键 -> Command键
      enhanced[key] = enhanced[key].replace(/Control键/g, 'Command键');

      // Replace patterns with space: "Control + " or "Ctrl + " -> "⌘ + "
      enhanced[key] = enhanced[key].replace(/Control \+/g, '⌘ +');
      enhanced[key] = enhanced[key].replace(/Ctrl \+/g, '⌘ +');

      // Replace standalone Control/Ctrl without space (fallback)
      enhanced[key] = enhanced[key].replace(/\bControl\b/g, 'Command');
      enhanced[key] = enhanced[key].replace(/\bCtrl\b/g, '⌘');
    }
  });

  return enhanced;
};
