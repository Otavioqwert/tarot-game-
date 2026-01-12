
import { SaveState } from '../types';
import { TAROT_LIBRARY } from '../constants';
import { getMasterKey } from './keyAssembler';

// --- Symmetric XOR Cipher Utility ---
const xorCipher = (input: string, key: string): string => {
  let output = '';
  if (!key || key.length === 0) return input;
  
  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);
    const keyCharCode = key.charCodeAt(i % key.length);
    output += String.fromCharCode(charCode ^ keyCharCode);
  }
  return output;
};

const OBFUSCATED_SALT = "\x1d\x0c\x1b\x0c\x15\x0c\x03\x13\x12\x51\x4b\x1d\x0f\x18\x0b\x08\x51\x1e\x0b\x18\x0f\x0e\x03\x01\x1d\x0a\x0f\x06\x1b\x0a\x0b\x0b\x51\x0f\x00\x0a\x1d\x51\x12\x0b\x1b\x0c\x15\x0c\x51\x07\x0a\x13\x0d\x0c\x0b\x51\x1c\x0f\x51\x0b\x13\x1d\x0c\x51\x0e\x1d\x12\x12\x1b\x18\x0b\x55\x4c\x0c\x1d\x1d\x17\x13\x55\x4b\x1c\x1b\x1d\x18\x19\x1b\x1c\x0b\x55\x1e\x0f\x1d\x18\x0f\x4c\x17\x0f\x1c\x57\x1c\x1a\x19\x55\x1f\x1c\x1d\x54\x13\x1a\x19";

function getDecoySalt(): string {
  const masterKey = getMasterKey();
  return xorCipher(OBFUSCATED_SALT, masterKey);
}

// O REAL_SALT, agora ofuscado em Base64 para não ser imediatamente legível.
// Original: "aether_cycles_secret_salt_v1"
const OBFUSCATED_REAL_SALT = "YWV0aGVyX2N5Y2xlc19zZWNyZXRfc2FsdF92MQ==";
const SALT = atob(OBFUSCATED_REAL_SALT);
const SEPARATOR = '&';

// --- Encoding Helpers ---
const utf8_to_b64 = (str: string): string => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    console.error("UTF-8 to Base64 conversion failed:", e);
    return '';
  }
};

const b64_to_utf8 = (str: string): string => {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch(e) {
    console.error("Base64 to UTF-8 conversion failed:", e);
    return '';
  }
};

// --- Key Generation ---
const getDynamicKeyFromState = (state: SaveState): string => {
  return state.sl.map(card => {
    if (!card) return 'null';
    const cardData = TAROT_LIBRARY.find(c => c.id === card.cid);
    return cardData?.effectId?.toLowerCase().replace(/_/g, '') || 'unknown';
  }).join('');
};

// --- Public API ---

/**
 * Encodes the game state into a secure string.
 */
export const encodeSaveData = (state: SaveState): string => {
  try {
    const dynamicKey = getDynamicKeyFromState(state);
    const fullKey = SALT + dynamicKey;

    const jsonString = JSON.stringify(state);
    const encryptedData = xorCipher(jsonString, fullKey);
    
    const safeEncryptedData = utf8_to_b64(encryptedData);
    if (!safeEncryptedData) throw new Error("Base64 encoding of encrypted data failed.");

    return `${dynamicKey}${SEPARATOR}${safeEncryptedData}`;
  } catch (error) {
    console.error("Failed to encode save data:", error);
    return '';
  }
};

/**
 * Decodes a secure string back into the game state object.
 */
export const decodeSaveData = (code: string): SaveState | null => {
  try {
    const parts = code.split(SEPARATOR);
    if (parts.length !== 2) throw new Error("Invalid save code format.");
    
    const [dynamicKey, safeEncryptedData] = parts;
    const fullKey = SALT + dynamicKey;

    const encryptedData = b64_to_utf8(safeEncryptedData);
    if (!encryptedData) throw new Error("Base64 decoding of encrypted data failed.");

    const jsonString = xorCipher(encryptedData, fullKey);
    
    const state: SaveState = JSON.parse(jsonString);

    if (typeof state.v !== 'number' || typeof state.cur !== 'number' || typeof state.gh !== 'number') {
      throw new Error("Invalid save file structure after decryption.");
    }
    
    return state;
  } catch (error) {
    console.error("Failed to decode save data:", error);
    return null;
  }
};
