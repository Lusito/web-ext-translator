/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

package info.lusito.web_ext_translator;

public class LoaderFile {

    public final String path;
    public final String data;

    public LoaderFile(String path, String data) {
        this.path = path;
        this.data = data;
    }
}
