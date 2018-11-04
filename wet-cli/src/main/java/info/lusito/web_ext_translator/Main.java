/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */
package info.lusito.web_ext_translator;

import java.net.URL;
import java.util.Optional;
import javafx.application.Application;
import javafx.concurrent.Worker;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Alert.AlertType;
import javafx.scene.control.Button;
import javafx.scene.control.ButtonType;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.image.Image;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyCodeCombination;
import javafx.scene.input.KeyCombination;
import javafx.scene.input.KeyEvent;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import javafx.stage.Stage;
import netscape.javascript.JSObject;

public class Main extends Application {

    private BorderPane borderPane;
    private TextField textField;
    private WebView browser;
    private WebEngine webEngine;
    private Bridge bridge;

    private void onLoad() {
        getWet().call("setBridge", bridge);
    }

    private JSObject getWet() {
        return (JSObject) webEngine.executeScript("window.wet");
    }

    @Override
    public void start(Stage primaryStage) {
        bridge = new Bridge(primaryStage, getHostServices());
        primaryStage.getIcons().addAll(
                new Image(this.getClass().getResource("/app_icons/icon16.png").toString()),
                new Image(this.getClass().getResource("/app_icons/icon24.png").toString()),
                new Image(this.getClass().getResource("/app_icons/icon32.png").toString()),
                new Image(this.getClass().getResource("/app_icons/icon48.png").toString()),
                new Image(this.getClass().getResource("/app_icons/icon64.png").toString())
        );
        primaryStage.setTitle("Web Extension Translator");
        browser = new WebView();
        browser.setContextMenuEnabled(false);
        webEngine = browser.getEngine();
        URL url = this.getClass().getResource("/index.html");
        webEngine.load(url.toString());

        webEngine.getLoadWorker().stateProperty().addListener((o, ov, newValue) -> {
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
        borderPane = new BorderPane();
        borderPane.setCenter(browser);
        final Scene scene = new Scene(borderPane, 1024, 600);
        primaryStage.setScene(scene);
        primaryStage.show();
        primaryStage.setMaximized(true);

        setupSearch(scene);
    }

    private void setupSearch(Scene scene) {
        textField = new TextField("");
        final Button close = new Button("x");

        Region r = new Region();
        HBox.setHgrow(r, Priority.ALWAYS);
        Button next = new Button("\u25BC");
        Button prev = new Button("\u25B2");
        HBox hbox = new HBox(new Label("Search: "), textField, prev, next, r, close);
        hbox.setPadding(new Insets(3));
        hbox.setSpacing(8);
        hbox.setAlignment(Pos.CENTER_LEFT);

        final KeyCombination openSearchCombo = new KeyCodeCombination(KeyCode.F, KeyCombination.CONTROL_DOWN);
        scene.addEventHandler(KeyEvent.KEY_RELEASED, (e) -> {
            if (openSearchCombo.match(e)) {
                borderPane.setBottom(hbox);
                textField.requestFocus();
            } else if (e.getCode() == KeyCode.F3) {
                searchPrevNext(textField.getText(), e.isShiftDown());
            }
        });

        close.setOnAction((e) -> borderPane.setBottom(null));

        textField.addEventFilter(KeyEvent.KEY_RELEASED, (e) -> {
            if (e.getCode() == KeyCode.ESCAPE) {
                borderPane.setBottom(null);
            } else if (e.getCode() == KeyCode.ENTER) {
                searchPrevNext(textField.getText(), e.isShiftDown());
            }
        });
        textField.textProperty().addListener((a, b, value) -> searchNext(value, false));
        next.setOnAction((e) -> searchNext(textField.getText(), true));
        prev.setOnAction((e) -> searchPrev(textField.getText()));
    }

    private void searchPrevNext(String text, boolean prev) {
        if (!text.isEmpty()) {
            if (prev) {
                searchPrev(text);
            } else {
                searchNext(text, true);
            }
        }
    }

    private void searchNext(String text, boolean force) {
        getWet().call("searchNext", text, force);
        textField.requestFocus();
    }

    private void searchPrev(String text) {
        getWet().call("searchPrev", text);
        textField.requestFocus();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
