// Helper functions for base64 encoding/decoding of UTF-8
function base64EncodeUTF8(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary);
}

function base64DecodeUTF8(base64: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// Remove first two characters before decoding (UTF-8)
export function decodeBase64WithPrefix(input: string): { prefix: string, decoded: string } {
  if (input.length < 2) return { prefix: "", decoded: "" };
  const prefix = input.substring(0, 2);
  const base64 = input.substring(2);
  try {
    return { prefix, decoded: base64DecodeUTF8(base64) };
  } catch (e) {
    return { prefix, decoded: "" };
  }
}

// Encode string to base64 (UTF-8) and add prefix
export function encodeBase64WithPrefix(prefix: string, input: string): string {
  return prefix + base64EncodeUTF8(input);
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
