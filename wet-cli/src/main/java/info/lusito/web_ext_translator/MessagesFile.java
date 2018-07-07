/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

package info.lusito.web_ext_translator;

public class MessagesFile {

    public final String locale;
    public final String content;

    public MessagesFile(String locale, String content) {
        this.locale = locale;
        this.content = content;
    }
}
