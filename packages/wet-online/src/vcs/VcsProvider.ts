import { WetLoaderData } from "web-ext-translator-shared";

export interface VcsInfo {
    host: string;
    user: string;
    repository: string;
    branch: string;
}

export interface VcsProvider {
    getName(): string;
    getSubmitUrl(info: VcsInfo): string | undefined;
    parseUrl(url: string): VcsInfo | null;
    fetch(info: VcsInfo): Promise<WetLoaderData>;
}
