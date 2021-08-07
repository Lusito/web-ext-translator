#!/usr/bin/env node

import electron from "electron";
import proc from "child_process";
import path from "path";

const child = proc.spawn(electron as any, [path.join(__dirname, "..")], {
    stdio: "inherit",
    windowsHide: false,
});
child.on("close", (code) => {
    process.exit(code ?? 0);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => {
        if (!child.killed) {
            child.kill(signal);
        }
    });
}
