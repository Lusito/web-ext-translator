import React from "react";
import { useSelector, useDispatch } from "react-redux-nano";

import IconButton from "../IconButton";
import { createExportDialog } from "../Dialogs/ExportDialog";
import packageJSON from "../../../package.json";
import { createFileDialog } from "../Dialogs/FileDialog";
import { importFromZip } from "../../utils/importFromZip";
import { createAlertDialog } from "../Dialogs/AlertDialog";
import { createPromptDialog } from "../Dialogs/PromptDialog";
import store from "../../redux/store";
import { saveToAppBridge } from "../../redux/actions/setAppBridge";
import { github } from "../../vcs";
import { createSubmitDialog } from "../Dialogs/SubmitDialog";
import { createApplyDialog } from "../Dialogs/ApplyDialog";
import { selectExtension, selectAppBridge, selectWebExtensionMode } from "../../redux/selectors";
import "./style.css";

const importGithubMarkdown = `You can import translations from a github project like this:  \

- Go to the github page of your web-extension
- Copy the URL and paste it here: (Branch URLs work as well!)`;

const ShowAboutButton = () => {
    const dispatch = useDispatch();

    const onClick = () =>
        dispatch({
            type: "SHOW_DIALOG",
            payload: createAlertDialog(
                "Web-Extension Translator",
                `- Version: ${packageJSON.version}\n- Author: Santo Pfingsten\n- Support on Github: [web-ext-translator](https://github.com/Lusito/web-ext-translator/issues)`
            ),
        });

    return <IconButton icon="question-circle" tooltip="About" onClick={onClick} className="icon-button--toolbar" />;
};

const ImportZipButton = () => {
    const dispatch = useDispatch();

    const onClick = () =>
        dispatch({
            type: "SHOW_DIALOG",
            payload: createFileDialog("Select your web-extension zip file", (fileList: FileList) =>
                importFromZip(fileList[0])
            ),
        });
    return (
        <IconButton
            icon="file-archive-o"
            tooltip="Import an extension from a ZIP file"
            onClick={onClick}
            className="icon-button--toolbar"
        />
    );
};

const GithubButton = () => {
    const dispatch = useDispatch();

    const onClick = () =>
        dispatch({
            type: "SHOW_DIALOG",
            payload: createPromptDialog(
                "Import from Github",
                importGithubMarkdown,
                "",
                "e.g. https://github.com/Lusito/forget-me-not",
                (value: string) => github.import(value)
            ),
        });
    return <IconButton icon="github" tooltip="Load from Github" onClick={onClick} className="icon-button--toolbar" />;
};

const ZipExportButton = () => {
    const dispatch = useDispatch();
    const onClick = () => dispatch({ type: "SHOW_DIALOG", payload: createExportDialog() });
    return <IconButton icon="download" tooltip="Export to ZIP" onClick={onClick} className="icon-button--toolbar" />;
};

const GithubSubmitButton = () => {
    const dispatch = useDispatch();

    const onClick = () => {
        const { extension } = store.getState();
        const payload = extension?.submitUrl
            ? createSubmitDialog()
            : createAlertDialog(
                  "Github projects only",
                  "This action only works for github projects at this moment. Please export the translations as ZIP file and send it manually to the developers."
              );

        dispatch({ type: "SHOW_DIALOG", payload });
    };

    return (
        <IconButton
            icon="arrow-circle-right"
            tooltip="Submit changes to the developers"
            onClick={onClick}
            className="icon-button--toolbar"
        />
    );
};

const ApplyButton = () => {
    const dispatch = useDispatch();
    const extension = useSelector(selectExtension);

    const onClick = () => {
        const payload = extension?.vcsInfo
            ? createApplyDialog()
            : createAlertDialog("Github projects only", "This action only works for github projects at this moment.");

        dispatch({ type: "SHOW_DIALOG", payload });
    };
    return (
        <IconButton
            icon="share-square-o"
            tooltip="Send to extension to preview"
            onClick={onClick}
            className="icon-button--toolbar"
        />
    );
};

const TogglePreviewButton = () => {
    const dispatch = useDispatch();
    const onClick = () => dispatch({ type: "PREVIEW_TOGGLE", payload: null });
    return <IconButton icon="eye" tooltip="Toggle Preview" onClick={onClick} className="icon-button--toolbar" />;
};

const AppButtons = () => {
    const appBridge = useSelector(selectAppBridge);
    return (
        <>
            <IconButton
                icon="folder-o"
                tooltip="Open a directory"
                onClick={() => appBridge.openDirectory()}
                className="icon-button--toolbar"
            />
            <IconButton
                icon="floppy-o"
                tooltip="Save to Disk"
                onClick={() => saveToAppBridge(appBridge)}
                className="icon-button--toolbar"
            />
        </>
    );
};

const WebAppButtons = () => {
    const webExtensionMode = useSelector(selectWebExtensionMode);
    return (
        <>
            <GithubButton />
            <ImportZipButton />
            <div className="toolbar__separator" />
            <ZipExportButton />
            <GithubSubmitButton />
            {webExtensionMode && (
                <>
                    <div className="toolbar__separator" />
                    <ApplyButton />
                </>
            )}
        </>
    );
};

export default () => {
    const appBridge = useSelector(selectAppBridge);

    return (
        <div className="toolbar">
            {appBridge ? <AppButtons /> : <WebAppButtons />}
            <div className="toolbar__separator" />
            <TogglePreviewButton />
            <h2 className="toolbar__title">Web Extension Translator</h2>
            <ShowAboutButton />
        </div>
    );
};
