/**
 * Implementación del algoritmo Knuth-Morris-Pratt (KMP)
 * para búsqueda de subcadenas con complejidad O(n + m).
 */

function buildLPS(pattern) {
    const lps = new Array(pattern.length).fill(0);
    let len = 0;
    let i = 1;

    while (i < pattern.length) {
        if (pattern[i].toLowerCase() === pattern[len].toLowerCase()) {
            len++;
            lps[i] = len;
            i++;
        } else {
            if (len !== 0) {
                len = lps[len - 1];
            } else {
                lps[i] = 0;
                i++;
            }
        }
    }
    return lps;
}

export function kmpSearch(text, pattern) {
    if (!pattern) return true;
    if (!text) return false;

    const lps = buildLPS(pattern);
    let i = 0; // index for text
    let j = 0; // index for pattern

    while (i < text.length) {
        if (pattern[j].toLowerCase() === text[i].toLowerCase()) {
            i++;
            j++;
        }

        if (j === pattern.length) {
            return true; // Encontrado
        } else if (i < text.length && pattern[j].toLowerCase() !== text[i].toLowerCase()) {
            if (j !== 0) {
                j = lps[j - 1];
            } else {
                i++;
            }
        }
    }
    return false;
}
