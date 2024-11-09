import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["index.ts"],
  platform: "node",
  format: "esm",
  bundle: true,
  outdir: "dist",
  packages: "external",
});
