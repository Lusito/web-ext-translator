/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import * as React from "react";
import "./style.css";
import { IconButton } from "../IconButton";
import { WetAction } from "../../actions";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { State } from "../../shared";
import { createExportDialog } from "../Dialogs/ExportDialog";
import packageJSON from "../../../package.json";
import { createFileDialog } from "../Dialogs/FileDialog";
import { importFromZip } from "../../utils/importFromZip";
import { createAlertDialog } from "../Dialogs/AlertDialog";
import { createPromptDialog } from "../Dialogs/PromptDialog";
import { importFromGithub } from "../../utils/importFromGithub";
import store from "../../store";
import { WetAppBridge } from "../../wetInterfaces";
import { loadFromAppBridge, saveToAppBridge } from "../../actions/setAppBridge";

export interface ToolbarProps {
  onShowConvert?: () => void;
  onShowImportFromGithub?: () => void;
  onSave?: () => void;
  onTogglePreview?: () => void;
  onShowAbout?: () => void;
  appBridge: WetAppBridge | null;
}

export function Toolbar(props: ToolbarProps) {
  const appBridge = props.appBridge;
  const contextElements = appBridge
    ? [
      <IconButton icon="folder-o" tooltip="Open a directory" onClick={() => loadFromAppBridge(appBridge, true)} className="icon-button--toolbar" />,
      <IconButton icon="floppy-o" tooltip="Save to Disk" onClick={() => saveToAppBridge(appBridge)} className="icon-button--toolbar" />
    ]
    : [
      <IconButton icon="github" tooltip="Load from Github" onClick={props.onShowImportFromGithub} className="icon-button--toolbar" />,
      <IconButton icon="file-archive-o" tooltip="Import an extension from a ZIP file" onClick={props.onShowConvert} className="icon-button--toolbar" />,
      <div className="toolbar__separator" />,
      <IconButton icon="download" tooltip="Export to ZIP" onClick={props.onSave} className="icon-button--toolbar" />
    ];
  return <div className="toolbar">
    {contextElements}
    <div className="toolbar__separator" />
    <IconButton icon="eye" tooltip="Toggle Preview" onClick={props.onTogglePreview} className="icon-button--toolbar" />
    <h2 className="toolbar__title">Web Extension Translator</h2>
    <IconButton icon="question-circle" tooltip="About" onClick={props.onShowAbout} className="icon-button--toolbar" />
  </div>;
}

function mapStateToProps({ appBridge }: State) {
  return { appBridge };
}

const importGithubMarkdown = `You can import translations from a github project like this:  \

- Go to the github page of your web-extension
- Copy the URL and paste it here: (Branch URLs work as well!)`;

function mapDispatchToProps(dispatch: Dispatch<WetAction>) {
  return {
    onShowAbout: () => dispatch({ type: "SHOW_DIALOG", payload: createAlertDialog("Web-Extension Translator", `- Version: ${packageJSON.version}\n- Author: Santo Pfingsten\n- Support on Github: [web-ext-translator](https://github.com/Lusito/web-ext-translator/issues)`) }),
    onShowConvert: () => dispatch({ type: "SHOW_DIALOG", payload: createFileDialog("Select your web-extension zip file", (fileList: FileList) => importFromZip(fileList[0])) }),
    onShowImportFromGithub: () => dispatch({ type: "SHOW_DIALOG", payload: createPromptDialog("Import from Github", importGithubMarkdown, "", "e.g. https://github.com/Lusito/forget-me-not", (value: string) => importFromGithub(value)) }),
    onSave: () => {
      const extension = store.getState().extension;
      extension && dispatch({ type: "SHOW_DIALOG", payload: createExportDialog(extension) });
    },
    onTogglePreview: () => dispatch({ type: "PREVIEW_TOGGLE", payload: null })
  };
}
export default connect<ToolbarProps>(mapStateToProps, mapDispatchToProps)(Toolbar);
