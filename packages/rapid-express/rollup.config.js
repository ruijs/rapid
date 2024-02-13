import { exec } from "child_process";
import typescript from 'rollup-plugin-typescript2';

const tscAlias = () => {
    return {
        name: "tsAlias",
        writeBundle: () => {
            return new Promise((resolve, reject) => {
                exec("tsc-alias", function callback(error, stdout, stderr) {
                    if (stderr || error) {
                        reject(stderr || error);
                    } else {
                        resolve(stdout);
                    }
                });
            });
        },
    };
};

export default {
    input: ["src/index.ts"],
    output: [
        {
            dir: "dist",
            entryFileNames: "[name].js",
            format: "cjs",
            exports: "named"
        }
    ],
    plugins: [
        typescript(),
        tscAlias(),
    ],
    external: [
    ]
};
