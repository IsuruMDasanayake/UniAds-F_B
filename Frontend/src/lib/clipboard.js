/**
 * Utility to copy text to clipboard with fallback for insecure contexts (HTTP)
 * navigator.clipboard requires HTTPS or localhost. For other cases (like local IP),
 * we use a hidden textarea fallback.
 */
export const copyToClipboard = (text) => {
    return new Promise((resolve, reject) => {
        // Try navigator.clipboard first (Secure Context only)
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text)
                .then(resolve)
                .catch(err => {
                    console.warn('navigator.clipboard failed, trying fallback:', err);
                    if (fallbackCopy(text)) {
                        resolve();
                    } else {
                        reject(err);
                    }
                });
            return;
        }

        // Fallback for insecure contexts (HTTP)
        if (fallbackCopy(text)) {
            resolve();
        } else {
            reject(new Error('Fallback copy failed'));
        }
    });
};

const fallbackCopy = (text) => {
    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        
        // Ensure it's not visible but still functional for execCommand
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        textArea.style.padding = "0";
        textArea.style.border = "none";
        textArea.style.outline = "none";
        textArea.style.boxShadow = "none";
        textArea.style.background = "transparent";
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
    } catch (err) {
        console.error('Fallback copy failed:', err?.message || err);
        return false;
    }
};
