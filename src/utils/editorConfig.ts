import { parseString, KnownProps } from "editorconfig";
import { Minimatch } from "minimatch";
import { WetLoaderFile } from "web-ext-translator-shared";

export interface EditorConfig {
    root: boolean;
    sections: EditorConfigSection[];
}

export interface EditorConfigSection {
    pattern: string;
    props: EditorConfigSectionProps;
}

export type EditorConfigSectionProps = KnownProps;

// Find .editorconfig files in parent directories
export function getEditorConfigPaths(paths: string[], startingPath: string) {
    const editorConfigPaths: string[] = [];
    const pathComponents = startingPath.split("/");

    while (pathComponents.length) {
        const parentEditorConfigPath = `${pathComponents.join("/")}/.editorconfig`;

        if (paths.indexOf(parentEditorConfigPath) > -1)
            editorConfigPaths.push(parentEditorConfigPath);

        pathComponents.pop();
    }

    if (paths.indexOf(".editorconfig") > -1) {
        editorConfigPaths.push(".editorconfig");
    }

    return editorConfigPaths;
}

// Parse .editorconfig text
// https://editorconfig-specification.readthedocs.io/en/latest/
export function parseEditorConfig(data: string) {
    const parsedConfig: EditorConfig = {
        root: false
      , sections: []
    };

    for (const [ pattern, props ] of parseString(data)) {
        // Preamble has null pattern
        if (pattern === null) {
            if (props.root === "true") {
                parsedConfig.root = true;
            } else if (props.root === "false") {
                parsedConfig.root = false;
            }

            continue;
        }

        const parsedProps: KnownProps = {};

        if (props.indent_style === "tab" || props.indent_style === "space" || props.indent_style === "unset") {
            parsedProps.indent_style = props.indent_style;
        }
        if (props.indent_size === "unset") {
            parsedProps.indent_size = props.indent_size;
        } else if ("indent_size" in props) {
            const indentSize = Number(props.indent_size);
            if (!isNaN(indentSize)) {
                parsedProps.indent_size = indentSize;
            }
        }
        if (props.end_of_line === "lf" || props.end_of_line === "crlf" || props.end_of_line === "unset") {
            parsedProps.end_of_line = props.end_of_line;
        }
        if (props.insert_final_newline === "true") {
            parsedProps.insert_final_newline = true;
        } else if (props.insert_final_newline === "false") {
            parsedProps.insert_final_newline = false;
        } else if (props.insert_final_newline === "unset") {
            parsedProps.insert_final_newline = props.insert_final_newline;
        }

        parsedConfig.sections.unshift({
            pattern,
            props: parsedProps
        });
    }

    return parsedConfig;
}

export function parseEditorConfigs(files: WetLoaderFile[]) {
    const editorConfigs: { [s: string]: EditorConfig } = {};
    for (const file of files)
        editorConfigs[file.path] = parseEditorConfig(file.data);
    return editorConfigs;
}

export function getEditorConfigPropsForPath(editorConfigs: EditorConfig[], path: string) {
    let matchedSection: (EditorConfigSectionProps | undefined);

    for (const nextConfig of editorConfigs) {
        for (const { pattern, props } of nextConfig.sections) {
            const minimatch = new Minimatch(pattern, { matchBase: true });
            if (minimatch.match(path)) {
                matchedSection = { ...props, ...matchedSection };
            }
        }

        if (nextConfig.root) {
            break;
        }
    }

    return matchedSection;
}
