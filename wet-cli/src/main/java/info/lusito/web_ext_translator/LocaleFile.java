/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

package info.lusito.web_ext_translator;

public class LocaleFile extends LoaderFile {

    public final String locale;
    public final String[] editorConfigs;

    public LocaleFile(String path, String data, String locale, String[] editorConfigs) {
        super(path, data);
        this.locale = locale;
        this.editorConfigs = editorConfigs;
    }
}
