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
export function getEditorConfigPaths(paths: string[], path?: string) {
    if (!path) {
        return paths.filter((path) => path.split("/").pop() === ".editorconfig");
    }

    const editorConfigPaths: string[] = [];
    const pathComponents = path.split("/");

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
        // Preable has null pattern
        if (pattern === null) {
            if (props.root === "true") {
                parsedConfig.root = true;
            } else if (props.root === "false") {
                parsedConfig.root = false;
            }

            continue;
        }

        const parsedProps: KnownProps = {};

        if ("indent_style" in props) {
            if (props.indent_style === "tab" || props.indent_style === "space") {
                parsedProps.indent_style = props.indent_style;
            }
        }
        if ("indent_size" in props) {
            if (props.indent_size === "tab") {
                parsedProps.indent_size = "tab";
            } else {
                const indentSize = Number(props.indent_size);
                if (!isNaN(indentSize)) {
                    parsedProps.indent_size = indentSize;

                    // tab_width defaults to indent_size
                    if (!("tab_width" in props)) {
                        parsedProps.tab_width = indentSize;
                    }
                }
            }
        }
        if ("tab_width" in props) {
            const tabWidth = Number(props.tab_width);
            if (!isNaN(tabWidth)) {
                parsedProps.tab_width = tabWidth;
            }
        }
        if ("end_of_line" in props) {
            if (props.end_of_line === "lf" || props.end_of_line === "crlf") {
                parsedProps.end_of_line = props.end_of_line;
            }
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

// Takes an array of EditorConfig objects and a path, loops through each
// section within each config until all props from matching section are
// reduced to a single set of props.
export function getEditorConfigPropsForPath(editorConfigs: EditorConfig[], path: string) {
    let matchedSection: (EditorConfigSectionProps | undefined);

    for (const nextConfig of editorConfigs) {
        for (const { pattern, props } of nextConfig.sections) {
            const minimatch = new Minimatch(pattern, { matchBase: true });
            if (minimatch.match(path)) {
                // Handle unset values
                for (const prop in props) {
                    if (props[prop] === "unset" && (matchedSection && (prop in matchedSection))) {
                        delete matchedSection[prop];
                        delete props[prop];
                    }
                }

                // Merge with previous matching sections
                matchedSection = { ...matchedSection, ...props };
            }
        }

        // If a matching section has been found or we hit the root config, stop here
        if (matchedSection || nextConfig.root) {
            break;
        }
    }

    return matchedSection;
}
