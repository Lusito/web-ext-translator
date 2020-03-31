/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import Dialog from "../Dialog";
import { LoadedExtension } from "../../../shared";
import { WetAction } from "../../../actions";
import { getNewDialogIndex } from "..";
import "./style.css";

interface ApplyDialogDispatchProps {
    closeDialog?: (key: string) => void;
}

interface ApplyDialogProps {
    index: string;
    extension: LoadedExtension;
}

type ApplyDialogMergedProps = ApplyDialogProps & ApplyDialogDispatchProps;

function ApplyDialog({ closeDialog, extension, index }: ApplyDialogMergedProps) {
    let ref: HTMLSelectElement | null = null;

    function accept() {
        closeDialog?.(index);
        if (ref) {
            const language = extension.languages[ref.value];
            if (extension.vcsInfo) {
                window.postMessage(
                    {
                        action: "WetApplyLanguage",
                        language,
                        vcsHost: extension.vcsInfo.host,
                        vcsUser: extension.vcsInfo.user,
                        vcsRepository: extension.vcsInfo.repository,
                    },
                    "*"
                );
            }
        }
    }
    const options = Object.getOwnPropertyNames(extension.languages).map((locale) => (
        <option key={locale} value={locale}>
            {extension.languages[locale].label}
        </option>
    ));

    function cancel() {
        closeDialog?.(index);
    }

    function onRef(e: HTMLSelectElement | null) {
        ref = e;
    }

    const buttons = [
        { label: "OK", focus: true, onClick: accept },
        { label: "Cancel", focus: false, onClick: cancel },
    ];
    const defaultValue =
        extension.firstLocale === extension.mainLanguage.locale ? extension.secondLocale : extension.firstLocale;

    return (
        <Dialog className="apply-dialog" title="Apply Translation" buttons={buttons}>
            <select ref={onRef} className="apply-dialog__select" defaultValue={defaultValue || undefined}>
                {options}
            </select>
        </Dialog>
    );
}

function mapDispatchToProps(dispatch: Dispatch<WetAction>) {
    return {
        closeDialog: (key: string) => dispatch({ type: "HIDE_DIALOG", payload: key }),
    };
}

const ConnectedApplyDialog = connect<{}, ApplyDialogDispatchProps, ApplyDialogProps>(
    null,
    mapDispatchToProps
)(ApplyDialog);
export default ConnectedApplyDialog;

export function createApplyDialog(extension: LoadedExtension) {
    const index = getNewDialogIndex().toString();
    return <ConnectedApplyDialog key={index} index={index} extension={extension} />;
}
