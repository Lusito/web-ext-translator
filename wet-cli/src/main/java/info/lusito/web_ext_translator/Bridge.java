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

    public MessagesListResult loadMessagesList() {
        Path localesDir = extDir.resolve("_locales");
        ArrayList<MessagesFile> list = new ArrayList();
        String manifest;
        Path manifestFile = extDir.resolve("manifest.json");
        if (Files.exists(manifestFile) && Files.exists(localesDir)) {
            try {
                manifest = new String(Files.readAllBytes(manifestFile), UTF8);
            } catch (IOException ex) {
                return new MessagesListResult(ex.getMessage());
            }
            DirectoryStream.Filter<Path> filter = (file) -> Files.isDirectory(file);
            try (DirectoryStream<Path> directoryStream = Files.newDirectoryStream(localesDir, filter)) {
                for (Path path : directoryStream) {
                    Path messagesPath = path.resolve("messages.json");
                    if (Files.exists(messagesPath) && !Files.isDirectory(messagesPath)) {
                        list.add(new MessagesFile(path.getFileName().toString(), new String(Files.readAllBytes(messagesPath), UTF8)));
                    }
                }
            } catch (IOException ex) {
                return new MessagesListResult(ex.getMessage());
            }
            return new MessagesListResult(list.toArray(new MessagesFile[list.size()]), manifest);
        }
        return new MessagesListResult("manifest.json or _locales directory missing");
    }

    public String saveMessagesList(JSObject list) {
        Path localesDir = extDir.resolve("_locales");
        try {
            if (!Files.exists(localesDir)) {
                Files.createDirectory(localesDir);
            }
            assert (list != null) : "list must not be null";
            for (int i = 0; i < (Integer) list.getMember("length"); i++) {
                JSObject obj = (JSObject) list.getSlot(i);
                String locale = (String) obj.getMember("locale");
                assert (locale != null) : "locale must not be null";
                String content = (String) obj.getMember("content");
                assert (content != null) : "content must not be null";

                Path dir = localesDir.resolve(locale);
                if (!Files.exists(dir)) {
                    Files.createDirectory(dir);
                }
                Path file = dir.resolve("messages.json");
                Files.write(file, content.getBytes("utf-8"));
            }
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
}
