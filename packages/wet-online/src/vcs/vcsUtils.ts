import { parseJsonFile } from "../utils/parseJsonFile";

export function getShortestPathForName(paths: string[], name: string) {
    const suffix = `/${name}`;
    const result = paths
        .filter((e: string) => e === name || e.endsWith(suffix))
        .sort((a: string, b: string) => a.length - b.length)[0];
    if (!result) throw new Error(`Could not find path to: ${name}`);
    return result;
}

export const responseToJSON = (response: Response) => response.text().then((text) => parseJsonFile(response.url, text));

export const responseToText = (response: Response) => response.text();
