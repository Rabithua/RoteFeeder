const kv = await Deno.openKv("./denokv/dedupe.db");

export async function isSeen(guid: string): Promise<boolean> {
  const result = await kv.get(["seen", guid]);
  return result.value !== null;
}

export async function markSeen(
  guid: string,
  ttlDays: number = 30,
): Promise<void> {
  // TTL is 30 days by default to prevent re-processing of old items
  await kv.set(["seen", guid], Date.now(), {
    expireIn: ttlDays * 24 * 60 * 60 * 1000,
  });
}
