/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

package info.lusito.web_ext_translator;

public class LoadFilesResult {
    public final LoaderData data;
    public final String error;

    public LoadFilesResult(String error, LoaderData data) {
        this.data = data;
        this.error = error;
    }
}
