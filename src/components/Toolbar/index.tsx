import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux-nano";
import { WetSaveFilesEntry } from "web-ext-translator-shared";

import IconButton from "../IconButton";
import packageJSON from "../../../package.json";
import { importFromZip } from "../../utils/importFromZip";
import { selectExtension, LoadExtensionData, loadExtension, setLoading } from "../../redux/extension";
import { serializeMessages } from "../../utils/exportToZip";
import { importVcs } from "../../vcs/importVcs";
import { useOpen } from "../../hooks";
import "./style.css";
import { useAppBridge } from "../../AppBridge";
import { selectWebExtensionActive } from "../../redux/webExtension";
import AlertDialog from "../Dialogs/AlertDialog";
import ApplyDialog from "../Dialogs/ApplyDialog";
import ExportDialog from "../Dialogs/ExportDialog";
import FileDialog from "../Dialogs/FileDialog";
import PromptDialog from "../Dialogs/PromptDialog";
import SubmitDialog from "../Dialogs/SubmitDialog";
import { togglePreview } from "../../redux/preview";
import { setDirty } from "../../utils/setDirty";

const importGithubMarkdown = `You can import translations from a github project like this:  \

- Go to the github page of your web-extension
- Copy the URL and paste it here: (Branch URLs work as well!)`;

const aboutMarkdown = `- Version: ${packageJSON.version}
- Author: Santo Pfingsten
- Support on Github: [web-ext-translator](https://github.com/Lusito/web-ext-translator/issues)`;

const ShowAboutButton = () => {
    const [open, setOpen, setClosed] = useOpen();

    return (
        <>
            <IconButton icon="question-circle" tooltip="About" onClick={setOpen} className="icon-button--toolbar" />
            {open && <AlertDialog title="Web-Extension Translator" message={aboutMarkdown} onClose={setClosed} />}
        </>
    );
};

const ImportZipButton = () => {
    const appBridge = useAppBridge();
    const [open, setOpen, setClosed] = useOpen();
    const [alertMessage, setAlertMessage] = useState("");
    const dispatch = useDispatch();
    const setLoadingMessage = (message: string) => dispatch(setLoading(message));
    const onSuccess = (data: LoadExtensionData) => {
        dispatch(loadExtension(data));
        setDirty(appBridge, false);
    };

    const onAccept = (fileList: FileList) => {
        if (fileList.length) {
            importFromZip(fileList[0], setLoadingMessage, onSuccess, setAlertMessage);
            setClosed();
        }
    };

    return (
        <>
            <IconButton
                icon="file-archive-o"
                tooltip="Import an extension from a ZIP file"
                onClick={setOpen}
                className="icon-button--toolbar"
            />
            {open && <FileDialog title="Select your web-extension zip file" onAccept={onAccept} onCancel={setClosed} />}
            {alertMessage && (
                <AlertDialog title="Something went wrong!" message={alertMessage} onClose={() => setAlertMessage("")} />
            )}
        </>
    );
};

const GithubButton = () => {
    const appBridge = useAppBridge();
    const [alertMessage, setAlertMessage] = useState("");
    const [open, setOpen, setClosed] = useOpen();
    const dispatch = useDispatch();
    const setLoadingMessage = (message: string) => dispatch(setLoading(message));
    const onSuccess = (data: LoadExtensionData) => {
        dispatch(loadExtension(data));
        setDirty(appBridge, false);
    };

    return (
        <>
            <IconButton icon="github" tooltip="Load from Github" onClick={setOpen} className="icon-button--toolbar" />
            {alertMessage && (
                <AlertDialog title="Something went wrong!" message={alertMessage} onClose={() => setAlertMessage("")} />
            )}
            {open && (
                <PromptDialog
                    title="Import from Github"
                    text={importGithubMarkdown}
                    placeholder="e.g. https://github.com/Lusito/forget-me-not"
                    onAccept={(value: string) => importVcs(value, setLoadingMessage, onSuccess, setAlertMessage)}
                    onCancel={setClosed}
                />
            )}
        </>
    );
};

const ZipExportButton = () => {
    const [open, setOpen, setClosed] = useOpen();

    return (
        <>
            <IconButton icon="download" tooltip="Export to ZIP" onClick={setOpen} className="icon-button--toolbar" />
            {open && <ExportDialog onClose={setClosed} />}
        </>
    );
};

const GithubSubmitButton = () => {
    const extension = useSelector(selectExtension);
    const [open, setOpen, setClosed] = useOpen();

    return (
        <>
            <IconButton
                icon="arrow-circle-right"
                tooltip="Submit changes to the developers"
                onClick={setOpen}
                className="icon-button--toolbar"
            />
            {open &&
                (extension?.submitUrl ? (
                    <SubmitDialog onClose={setClosed} />
                ) : (
                    <AlertDialog
                        title="Github projects only"
                        message="This action only works for github projects at this moment. Please export the translations as ZIP file and send it manually to the developers."
                        onClose={setClosed}
                    />
                ))}
        </>
    );
};

const ApplyButton = () => {
    const extension = useSelector(selectExtension);
    const [open, setOpen, setClosed] = useOpen();

    return (
        <>
            <IconButton
                icon="share-square-o"
                tooltip="Send to extension to preview"
                onClick={setOpen}
                className="icon-button--toolbar"
            />
            {open &&
                (extension?.vcsInfo ? (
                    <ApplyDialog onClose={setClosed} />
                ) : (
                    <AlertDialog
                        title="Github projects only"
                        message="This action only works for github projects at this moment."
                        onClose={setClosed}
                    />
                ))}
        </>
    );
};

const TogglePreviewButton = () => {
    const dispatch = useDispatch();
    const onClick = () => dispatch(togglePreview());
    return <IconButton icon="eye" tooltip="Toggle Preview" onClick={onClick} className="icon-button--toolbar" />;
};

const AppButtons = () => {
    const appBridge = useAppBridge();
    const extension = useSelector(selectExtension);
    const onClick = () => {
        if (extension) {
            const files: WetSaveFilesEntry[] = Object.keys(extension.languages)
                .map((key) => extension.languages[key])
                .map((lang) => ({
                    locale: lang.locale,
                    data: serializeMessages(lang, extension.mainLanguage),
                }));
            appBridge.saveFiles(files);
        }
    };
    return (
        <>
            <IconButton
                icon="folder-o"
                tooltip="Open a directory"
                onClick={() => appBridge.openDirectory()}
                className="icon-button--toolbar"
            />
            <IconButton icon="floppy-o" tooltip="Save to Disk" onClick={onClick} className="icon-button--toolbar" />
        </>
    );
};

const WebAppButtons = () => {
    const extension = useSelector(selectExtension);
    const webExtensionActive = useSelector(selectWebExtensionActive);
    return (
        <>
            <GithubButton />
            <ImportZipButton />
            {extension && (
                <>
                    <div className="toolbar__separator" />
                    <ZipExportButton />
                    <GithubSubmitButton />
                </>
            )}
            {webExtensionActive && (
                <>
                    <div className="toolbar__separator" />
                    <ApplyButton />
                </>
            )}
        </>
    );
};

export default () => {
    const appBridge = useAppBridge();

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
