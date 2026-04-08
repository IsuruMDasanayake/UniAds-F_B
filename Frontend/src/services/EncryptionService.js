/**
 * EncryptionService.js
 * Provides End-to-End Encryption (E2EE) utilities using the native Web Crypto API.
 * Uses AES-GCM (Advanced Encryption Standard with Galois/Counter Mode).
 */

const PLATFORM_SALT = 'uniads-secure-e2ee-salt-v1';

const keyCache = {};

/**
 * Derives a cryptographic key from a conversation ID and the platform salt.
 * Caches the derived key to avoid freezing the UI with repeated expensive PBKDF2 derives.
 */
async function deriveKey(conversationId) {
    if (keyCache[conversationId]) {
        return keyCache[conversationId];
    }

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(conversationId + PLATFORM_SALT),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    const derived = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode(PLATFORM_SALT),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );

    keyCache[conversationId] = derived;
    return derived;
}

const EncryptionService = {
    /**
     * Encrypts a plain text message.
     * Returns a Base64 string containing [IV][Ciphertext].
     */
    encrypt: async (text, conversationId) => {
        if (!text) return text;
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(text);
            const key = await deriveKey(conversationId.toString());
            
            // Initialization Vector
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                key,
                data
            );

            // Combine IV and encrypted data
            const combined = new Uint8Array(iv.length + encrypted.byteLength);
            combined.set(iv);
            combined.set(new Uint8Array(encrypted), iv.length);

            // Return as Base64
            const binary = String.fromCharCode.apply(null, combined);
            return 'enc:' + btoa(binary);
        } catch (error) {
            console.error('Encryption failed:', error?.message || error);
            return text; // Fallback to plain text if encryption fails
        }
    },

    /**
     * Decrypts an encrypted message string (prefixed with 'enc:').
     */
    decrypt: async (encryptedData, conversationId) => {
        if (!encryptedData) return encryptedData;

        // Strip HTML tags if any (handles cases where backend wraps in <p>)
        let cleanData = encryptedData;
        if (typeof encryptedData === 'string' && (encryptedData.includes('<') || encryptedData.includes('>'))) {
            cleanData = encryptedData.replace(/<[^>]*>/g, '').trim();
        }

        if (!cleanData.startsWith('enc:')) {
            return cleanData; // Return the cleaned (but not encrypted) data
        }

        try {
            // Browsers block crypto.subtle on non-HTTPS origins (e.g. mobile testing on local network IPs)
            if (!window.crypto || !window.crypto.subtle) {
                console.warn('Web Crypto API is disabled in insecure contexts (HTTP). Decryption unavailable.');
                return '[E2EE Disabled on HTTP - Please use HTTPS]';
            }

            const base64 = cleanData.substring(4);
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const iv = bytes.slice(0, 12);
            const data = bytes.slice(12);
            const key = await deriveKey(conversationId.toString());

            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                key,
                data
            );

            return new TextDecoder().decode(decrypted);
        } catch (error) {
            console.error('Decryption failed:', error?.message || error);
            // Include error detail if available for debugging
            return `[Decryption Error - ${error.name || 'Unknown'}]`;
        }
    }
};

export default EncryptionService;
