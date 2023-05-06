import { getPackages } from "$lib/functions/package.server";
export async function load({ parent }) {
  const { currentUser } = await parent();
  const packages = await getPackages(currentUser);
  return { packages };
}
