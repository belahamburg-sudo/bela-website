const MIN_PASSWORD_LENGTH = 10;

export function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Das Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.`;
  }
  if (!/[a-zA-Z]/.test(password)) {
    return "Das Passwort muss mindestens einen Buchstaben enthalten.";
  }
  if (!/[0-9]/.test(password)) {
    return "Das Passwort muss mindestens eine Zahl enthalten.";
  }
  return null;
}

export function passwordMeetsPolicy(password: string): boolean {
  return validatePassword(password) === null;
}
