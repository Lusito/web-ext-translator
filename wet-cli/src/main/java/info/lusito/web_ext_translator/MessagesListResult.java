package info.lusito.web_ext_translator;

public class MessagesListResult {
    public final MessagesFile[] files;
    public final String manifest;
    public final String error;

    public MessagesListResult(MessagesFile[] files, String manifest) {
        this.files = files;
        this.manifest = manifest;
        this.error = null;
    }

    public MessagesListResult(String error) {
        this.files = null;
        this.manifest = null;
        this.error = error;
    }
}
