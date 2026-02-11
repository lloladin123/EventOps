export async function getIdTokenOrThrow(user: unknown): Promise<string> {
  const u = user as any;
  const token =
    typeof u?.getIdToken === "function" ? await u.getIdToken() : null;
  if (!token) throw new Error("Kunne ikke hente login token");
  return token;
}
