export function omit<T, Key extends keyof T>(data: T, keys: Key[]): Omit<T, Key> {
  const newData = Object.assign({}, data);
  for (const key of keys) delete newData[key];
  return newData;
}

export function pick<T, Key extends keyof T>(data: T, keys: Key[]): Pick<T, Key> {
  const newData = Object.assign({});
  for (const key of keys) newData[key] = data[key];
  return newData;
}

export function ensureRoles(currentRole: string, requiredRoles: string[]) {
  const roles = ["DEVELOPER"].concat(requiredRoles);
  return roles.includes(currentRole);
}

export const splitCamelCase = (value: string) => {
  if (typeof value !== "string") return "";
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
};

export function generatePassword(length = 12) {
  let password = "";
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i <= length; i++) {
    const randomNumber = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomNumber, randomNumber + 1);
  }
  return password;
}

export function generateOtp(length = 6) {
  return Math.random().toString().substr(2, length);
}
