package info.lusito.web_ext_translator;

import com.sun.javafx.webkit.WebConsoleListener;
import java.net.URL;
import java.util.Optional;
import javafx.application.Application;
import javafx.concurrent.Worker;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Alert.AlertType;
import javafx.scene.control.ButtonType;
import javafx.scene.image.Image;
import javafx.scene.layout.StackPane;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import javafx.stage.Stage;
import netscape.javascript.JSObject;

public class Main extends Application {

    private WebView browser;
    private WebEngine webEngine;
    private Bridge bridge;

    private void onLoad() {
        JSObject jsobj = (JSObject) webEngine.executeScript("window.translator");
        jsobj.call("init", bridge);
    }

    @Override
    public void start(Stage primaryStage) {
        bridge = new Bridge(primaryStage);
        primaryStage.getIcons().addAll(
                new Image(this.getClass().getResource("/app_icons/icon16.png").toString()),
                new Image(this.getClass().getResource("/app_icons/icon24.png").toString()),
                new Image(this.getClass().getResource("/app_icons/icon32.png").toString()),
                new Image(this.getClass().getResource("/app_icons/icon48.png").toString()),
                new Image(this.getClass().getResource("/app_icons/icon64.png").toString())
        );
        WebConsoleListener.setDefaultListener((webView, message, lineNumber, sourceId)
                -> System.out.println("Console: [" + sourceId + ":" + lineNumber + "] " + message)
        );
        primaryStage.setTitle("Web Extension Translator");
        browser = new WebView();
        browser.setContextMenuEnabled(false);
        webEngine = browser.getEngine();
        URL url = this.getClass().getResource("/main.html");
        webEngine.load(url.toString());

        webEngine.getLoadWorker().stateProperty().addListener(
                (observable, oldValue, newValue) -> {
                    if (newValue == Worker.State.SUCCEEDED) {
                        onLoad();
                    }
                });
        primaryStage.setOnCloseRequest(event -> {
            if (bridge.isDirty()) {
                Alert alert = new Alert(AlertType.CONFIRMATION);
                alert.setTitle("Files have not been saved");
                alert.setHeaderText("There are unsaved changes.");
                alert.setContentText("Discard all changes?");

                Optional<ButtonType> result = alert.showAndWait();
                if (result.get() != ButtonType.OK) {
                    event.consume();
                }
            }
        });
        StackPane root = new StackPane();
        root.getChildren().add(browser);
        primaryStage.setScene(new Scene(root, 1024, 600));
        primaryStage.show();
        primaryStage.setMaximized(true);
    }

    public static void main(String[] args) {
        launch(args);
    }
}
