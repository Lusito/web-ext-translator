import { parseString, KnownProps } from "editorconfig";
import { Minimatch } from "minimatch";

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
export function getEditorConfigPaths(paths: string[], startingPath = "") {
    const editorConfigPaths: string[] = [];
    const pathComponents = startingPath.split("/");

    while (pathComponents.length) {
        const parentPath = pathComponents.join("/");
        const parentEditorConfigPath = `${parentPath}/.editorconfig`;

        if (paths.indexOf(`${parentPath}/.editorconfig`) > -1) {
            editorConfigPaths.push(parentEditorConfigPath);
        }

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

        if (props.indent_style === "tab" || props.indent_style === "space") {
            parsedProps.indent_style = props.indent_style;
        }
        if ("indent_size" in props) {
            const indentSize = Number(props.indent_size);
            if (!isNaN(indentSize)) {
                parsedProps.indent_size = indentSize;
            }
        }
        if (props.end_of_line === "lf" || props.end_of_line === "crlf") {
            parsedProps.end_of_line = props.end_of_line;
        }
        if ("insert_final_newline" in props) {
            if (props.insert_final_newline === "true") {
                parsedProps.insert_final_newline = true;
            } else if (props.insert_final_newline === "false") {
                parsedProps.insert_final_newline = false;
            }
        }

        parsedConfig.sections.push({
            pattern,
            props: parsedProps
        });
    }

    return parsedConfig;
}

export function getEditorConfigPropsForPath(editorConfigs: EditorConfig[], path: string) {
    let matchedSection: (EditorConfigSectionProps | undefined);

    for (const nextConfig of editorConfigs) {
        for (const { pattern, props } of nextConfig.sections) {
            const minimatch = new Minimatch(pattern, { matchBase: true });
            if (minimatch.match(path)) {
                // If prop has already been set, it has precedence from a nearer config
                for (const prop in props) {
                    if (matchedSection && (prop in matchedSection)) {
                        delete props[prop];
                    }
                }

                matchedSection = { ...matchedSection, ...props };
            }
        }

        if (nextConfig.root) {
            break;
        }
    }

    return matchedSection;
}
