/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */
package info.lusito.web_ext_translator;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;
import javafx.application.HostServices;
import javafx.stage.DirectoryChooser;
import javafx.stage.Stage;
import netscape.javascript.JSObject;

public class Bridge {

    private static final Charset UTF8 = Charset.forName("utf-8");
    private final Stage primaryStage;
    private final HostServices hostServices;
    private boolean dirty = false;
    private Path extDir = Paths.get(System.getProperty("user.dir"));

    public Bridge(Stage primaryStage, HostServices hostServices) {
        this.primaryStage = primaryStage;
        this.hostServices = hostServices;
    }

    public LoadFilesResult loadFiles() {
        Path localesDir = extDir.resolve("_locales");
        Path manifestFile = extDir.resolve("manifest.json");
        if (Files.exists(manifestFile) && Files.exists(localesDir)) {
            DirectoryStream.Filter<Path> filter = (file) -> Files.isDirectory(file);
            try (DirectoryStream<Path> directoryStream = Files.newDirectoryStream(localesDir, filter)) {
                HashMap<String, Path> editorConfigMap = new HashMap();
                ArrayList<LocaleFile> list = new ArrayList();
                for (Path path : directoryStream) {
                    Path messagesPath = path.resolve("messages.json");
                    if (Files.exists(messagesPath) && !Files.isDirectory(messagesPath)) {
                        ArrayList<Path> editorConfigPaths = getEditorConfigPaths(path);
                        String[] editorConfigPathArray = new String[editorConfigPaths.size()];
                        int index = 0;
                        for (Path editorConfigPath : editorConfigPaths) {
                            String key = getFilePath(editorConfigPath);
                            editorConfigMap.put(key, editorConfigPath);
                            editorConfigPathArray[index++] = key;
                        }
                        list.add(readLocaleFile(messagesPath, editorConfigPathArray));
                    }
                }
                final List<LoaderFile> editorConfigList = editorConfigMap.values().stream().map(this::readFile).collect(Collectors.toList());
                return new LoadFilesResult(null, new LoaderData(
                        list.toArray(new LocaleFile[list.size()]),
                        readFile(manifestFile), editorConfigList.toArray(new LoaderFile[editorConfigList.size()])));
            } catch (Exception ex) {
                return new LoadFilesResult(ex.getMessage(), null);
            }
        }
        return new LoadFilesResult("manifest.json or _locales directory missing", null);
    }

    public String saveFiles(JSObject list) {
        Path localesDir = extDir.resolve("_locales");
        try {
            if (!Files.exists(localesDir)) {
                Files.createDirectory(localesDir);
            }
            assert (list != null) : "list must not be null";
            int length = (Integer) list.getMember("length");
            for (int i = 0; i < length; i++) {
                JSObject obj = (JSObject) list.getSlot(i);
                String locale = (String) obj.getMember("locale");
                assert (locale != null) : "locale must not be null";
                String data = (String) obj.getMember("data");
                assert (data != null) : "content must not be null";

                Path dir = localesDir.resolve(locale.replace("-", "_"));
                if (!Files.exists(dir)) {
                    Files.createDirectory(dir);
                }
                Path file = dir.resolve("messages.json");
                Files.write(file, data.getBytes("utf-8"));
            }
            setDirty(false);
            return null;
        } catch (IOException ex) {
            return ex.getMessage();
        }
    }

    public void setDirty(boolean dirty) {
        this.dirty = dirty;
    }

    public boolean isDirty() {
        return dirty;
    }

    public boolean openDirectory() {
        DirectoryChooser chooser = new DirectoryChooser();
        chooser.setTitle("Select your Web Extension root directory");
        if (Files.exists(extDir)) {
            chooser.setInitialDirectory(extDir.toFile());
        } else {
            chooser.setInitialDirectory(new File(System.getProperty("user.dir")));
        }
        File selectedDirectory = chooser.showDialog(primaryStage);
        if (selectedDirectory != null) {
            extDir = Paths.get(selectedDirectory.getAbsolutePath());
            return true;
        }
        return false;
    }

    public void openBrowser(String url) {
        hostServices.showDocument(url);
    }

    public void consoleProxy(String method, String message, String stack) {
        if ("error".equals(method)) {
            System.err.println(method + ": " + message + "\nStacktrace:\n" + stack + "\n");
        } else {
            System.out.println(method + ": " + message + "\n");
        }
    }

    private LoaderFile readFile(Path path) {
        try {
            return new LoaderFile(getFilePath(path), new String(Files.readAllBytes(path), UTF8));
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
    }

    private LocaleFile readLocaleFile(Path path, String[] editorConfigPaths) {
        try {
            return new LocaleFile(
                    getFilePath(path),
                    new String(Files.readAllBytes(path), UTF8),
                    path.getParent().getFileName().toString().replace("_", "-"),
                    editorConfigPaths
            );
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
    }

    private String getFilePath(Path path) {
        return extDir.relativize(path).toString().replace("\\", "/");
    }

    private ArrayList<Path> getEditorConfigPaths(Path path) {
        ArrayList<Path> result = new ArrayList();

        while (!path.equals(extDir)) {

            Path configPath = path.resolve(".editorconfig");
            if (Files.exists(configPath)) {
                result.add(configPath);
            }

            path = path.getParent();
        }

        Path configPath = extDir.resolve(".editorconfig");
        if (Files.exists(configPath)) {
            result.add(configPath);
        }

        return result;
    }
}
