/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

package info.lusito.web_ext_translator;

public class LoaderData {
    public final LoaderFile[] locales;
    public final LoaderFile manifest;
    public final LoaderFile[] editorConfigs;

    public LoaderData(LoaderFile[] locales, LoaderFile manifest, LoaderFile[] editorConfigs) {
        this.locales = locales;
        this.manifest = manifest;
        this.editorConfigs = editorConfigs;
    }
}
