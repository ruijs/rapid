import typescript from 'rollup-plugin-typescript2';
// import tsConfigPaths from "rollup-plugin-tsconfig-paths"

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
        // tsConfigPaths(),
    ],
    external: [
    ]
};
