package info.lusito.web_ext_translator;

public class MessagesListResult {
    public final MessagesFile[] files;
    public final String error;

    public MessagesListResult(MessagesFile[] files) {
        this.files = files;
        this.error = null;
    }

    public MessagesListResult(String error) {
        this.files = null;
        this.error = error;
    }
}
