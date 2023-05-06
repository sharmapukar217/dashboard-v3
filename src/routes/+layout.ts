export async function load({ parent, url, data }) {
  return { ...data, route: url.pathname };
}
