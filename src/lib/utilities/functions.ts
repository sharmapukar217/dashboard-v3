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

export function ensureRole(currentRole: string, requiredRoles: string[]) {
  const roles = ["developer"].concat(requiredRoles);
  return roles.includes(currentRole);
}
