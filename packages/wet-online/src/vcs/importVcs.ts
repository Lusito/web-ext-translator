import { loadFiles } from "../utils/loader";
import { github } from "./providers/github";
import { VcsInfo, VcsProvider } from "./VcsProvider";
import { LoadExtensionData } from "../redux/extension";

const providers = [github];

async function importVcsAsync(
    url: string,
    provider: VcsProvider,
    info: VcsInfo,
    setLoading: (message: string) => void,
    onSuccess: (data: LoadExtensionData) => void,
    onError: (message: string) => void
) {
    try {
        setLoading(`Importing ${info.repository} from ${provider.getName()}`);

        const result = await provider.fetch(info);
        const submitUrl = provider.getSubmitUrl(info);
        onSuccess({ ...loadFiles(result), submitUrl, vcsInfo: info });
        setLoading("");
        window.history.replaceState({}, "", `/?gh=${url}`);
    } catch (e) {
        onError(`Failed to import ${provider.getName()} Project. Reason: ${e}`);

        console.log("Opps, Something went wrong!", e);
        setLoading("");
    }
}

export function importVcs(
    url: string,
    setLoading: (message: string) => void,
    onSuccess: (data: LoadExtensionData) => void,
    onError: (message: string) => void
) {
    for (const provider of providers) {
        const info = provider.parseUrl(url);

        if (info) {
            importVcsAsync(url, provider, info, setLoading, onSuccess, onError);
            return;
        }
    }
}
