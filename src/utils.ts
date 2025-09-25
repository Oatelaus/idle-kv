// Remove first two characters before decoding
export function decodeBase64WithPrefix(input: string): { prefix: string, decoded: string } {
  if (input.length < 2) return { prefix: "", decoded: "" };
  const prefix = input.substring(0, 2);
  const base64 = input.substring(2);
  try {
    return { prefix, decoded: atob(base64) };
  } catch (e) {
    return { prefix, decoded: "" };
  }
}

// Encode string to base64 and add prefix
export function encodeBase64WithPrefix(prefix: string, input: string): string {
  return prefix + btoa(input);
}

// Parse the custom key-value string to an object
export function parseKV(input: string): Record<string, string> {
  const obj: Record<string, string> = {};
  input.split(",").forEach(pair => {
    const eqIdx = pair.indexOf("=");
    if (eqIdx > -1) {
      const key = pair.substring(0, eqIdx).trim();
      const value = pair.substring(eqIdx + 1).trim();
      obj[key] = value;
    }
  });
  return obj;
}

// Serialize object back to custom key-value string
export function serializeKV(obj: Record<string, string>): string {
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${value}`)
    .join(",");
}