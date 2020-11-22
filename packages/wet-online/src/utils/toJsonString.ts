const escapeChars: { [s: string]: string } = {
    "\b": "\\b",
    "\f": "\\f",
    "\r": "\\r",
    "\n": "\\n",
    "\t": "\\t",
    '"': '\\"',
};

export function toJsonString(value: string) {
    const result = [];
    for (let i = 0; i < value.length; i++) {
        const c = value[i];
        if (c === "\\") {
            if (value[i + 1] !== "u") result.push("\\\\");
            else {
                result.push("\\u");
                i++;
            }
        } else {
            result.push(escapeChars[c] || c);
        }
    }
    return `"${result.join("")}"`;
}
