/**
 * Decodes HTML entities in a string.
 * Uses a temporary textarea element for robust decoding in browser environments.
 * @param {string} html - The string containing HTML entities.
 * @returns {string} - The decoded string.
 */
export const decodeHTMLEntities = (html) => {
    if (!html || typeof html !== 'string') return html || '';
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
};
