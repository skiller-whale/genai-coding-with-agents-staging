/**
 * Copies text to clipboard using the Clipboard API
 * @param text - The text to copy
 * @returns Promise that resolves when text is copied
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (!navigator.clipboard) {
    throw new Error('Clipboard API not available');
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    throw new Error('Failed to copy to clipboard');
  }
}

/**
 * Shows a temporary success message
 * @param element - The element to show the message in
 * @param message - The message to display
 * @param duration - Duration in milliseconds
 */
export function showTemporaryMessage(
  element: HTMLElement,
  message: string,
  duration: number = 2000
): void {
  const originalText = element.textContent;
  element.textContent = message;
  element.classList.add('success');

  setTimeout(() => {
    element.textContent = originalText;
    element.classList.remove('success');
  }, duration);
}
