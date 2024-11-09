import * as esbuild from "esbuild";

const ctx = await esbuild.context({
  entryPoints: ["index.ts"],
  platform: "node",
  format: "esm",
  bundle: true,
  outdir: "dist",
  packages: "external",
});

console.log("watching...");
await ctx.watch();
