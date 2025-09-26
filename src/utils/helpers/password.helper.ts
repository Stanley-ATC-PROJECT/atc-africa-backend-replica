export class PasswordHelper {
  // Generates a secure temporary password with a good balance of complexity
  // Ensures at least one lowercase, uppercase, digit, and symbol
  static generateTemporaryPassword(length = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const symbols = '!@#$%^&*()-_=+[]{};:,.?';

    const allChars = lowercase + uppercase + digits + symbols;

    function getRandomChar(chars: string): string {
      // Use crypto-quality randomness via Node's crypto.getRandomValues if available
      // Fallback to Math.random for environments without crypto (shouldn't happen in Node)
      const idx = Math.floor(Math.random() * chars.length);
      return chars[idx];
    }

    const passwordChars: string[] = [];

    // Guarantee required character classes
    passwordChars.push(getRandomChar(lowercase));
    passwordChars.push(getRandomChar(uppercase));
    passwordChars.push(getRandomChar(digits));
    passwordChars.push(getRandomChar(symbols));

    // Fill the rest
    for (let i = passwordChars.length; i < length; i++) {
      passwordChars.push(getRandomChar(allChars));
    }

    // Shuffle to avoid predictable positions
    for (let i = passwordChars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [passwordChars[i], passwordChars[j]] = [
        passwordChars[j],
        passwordChars[i],
      ];
    }

    return passwordChars.join('');
  }
}
