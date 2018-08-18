/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

const TEXTAREA_STYLES = "width: 10px; height: 10px; overflow: hidden; opacity: 0; position: absolute; pointer-events: none;".replace(/;/g, " !important;");

export function copyToClipboard(text: string) {
    const textarea = document.createElement("textarea");
    textarea.setAttribute("style", TEXTAREA_STYLES);
    textarea.setAttribute("readonly", "");
    textarea.value = text;
    document.body.appendChild(textarea);

    try {
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);
        return document.execCommand("copy");
    }
    catch (err) {
        return false;
    } finally {
        document.body.removeChild(textarea);
    }
}
