import typescript from "rollup-plugin-typescript2";
import tscAlias from "rollup-plugin-tsc-alias";

export default {
  input: ["src/index.ts"],
  output: [
    {
      dir: "dist",
      entryFileNames: "[name].js",
      format: "cjs",
      exports: "named",
    },
  ],
  plugins: [typescript(), tscAlias()],
  external: [],
};
