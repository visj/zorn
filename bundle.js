import vm from "vm";
import fs from "node:fs";
import { exec } from "child_process";
import * as esbuild from "esbuild";

async function loadEnums() {
    const code = await fs.promises.readFile("./src/core.js", "utf-8");
    await vm.runInThisContext(code.split("/* __ENUMS__ */")[0]);
}

const replaceEnumPlugin = {
    name: "replaceEnumPlugin",
    setup: function (build) {
        build.onLoad({ filter: /\.js$/ }, async (args) => {
            let contents = await fs.promises.readFile(args.path, "utf8");
            var enums = { State, Stage };
            for (var name in enums) {
                var object = enums[name];
                for (var key in object) {
                    contents = contents.replaceAll(name + "." + key, object[key]);
                }
            }
            return { contents };
        });
    }
}

async function esbuildBundleBench() {
    await esbuild.build({
        entryPoints: ["./bench/haile/zorn/index.js"],
        bundle: true,
        minify: true,
        target: "ES5",
        mangleProps: /^_/,
        outfile: "./bench/haile/zorn/zorn.esbuild.js",
        plugins: [replaceEnumPlugin],
    });
}

async function esbuildBundlePreact() {
    await esbuild.build({
        entryPoints: ["./bench/haile/preact/index.js"],
        bundle: true,
        minify: true,
        outfile: "./bench/haile/preact/index.min.js",
    });
}

async function esbuildBundleSjs() {
    await esbuild.build({
        entryPoints: ["./bench/haile/S/index.js"],
        bundle: true,
        minify: true,
        outfile: "./bench/haile/S/index.min.js",
    });
}

async function esbuildBundleSolid() {
    await esbuild.build({
        entryPoints: ["./bench/haile/solid/index.js"],
        bundle: true,
        minify: true,
        outfile: "./bench/haile/solid/index.min.js",
    });
}

async function esbuildBundleMaverick() {
    await esbuild.build({
        entryPoints: ["./bench/haile/maverick/index.js"],
        bundle: true,
        minify: true,
        outfile: "./bench/haile/maverick/index.min.js",
    });
}

async function esbuildBundleuSignal() {
    await esbuild.build({
        entryPoints: ["./bench/haile/usignal/index.js"],
        bundle: true,
        minify: true,
        outfile: "./bench/haile/usignal/index.min.js",
    });
}

async function closureBundleBench() {
    return new Promise((resolve, reject) => {
        const cmd = [
            "closure-compiler",
            "-O ADVANCED",
            "--language_out ECMASCRIPT_NEXT",
            "--js src/api.js",
            "--js src/core.js",
            "--js src/types.js",
            "--js bench/haile/zorn/index.js",
            "--js_output_file bench/haile/zorn/zorn.closure.js"
        ];
        exec(cmd.join(" "), (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                if (stderr) {
                    console.error(stderr);
                }
                resolve({ stdout, stderr });
            }
        });
    });
}

async function bundleBench() {
    await Promise.all([
        esbuildBundleBench(),
        closureBundleBench(),
        esbuildBundlePreact(),
        esbuildBundleSjs(),
        esbuildBundleSolid(),
        esbuildBundleMaverick(),
        esbuildBundleuSignal()
    ]);
}

async function closureBundleLibrary() {
    return new Promise((resolve, reject) => {
        const cmd = [
            "closure-compiler",
            "-O ADVANCED",
            "--language_out ECMASCRIPT5",
            "--js src/core.js",
            "--js src/types.js",
            "--js src/entry.js",
            "--externs src/api.js",
            "--js_output_file temp/closure.build.js"
        ];
        exec(cmd.join(" "), async (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                if (stderr) {
                    console.error(stderr);
                } else {
                    let code = await fs.promises.readFile("./temp/closure.build.js", "utf-8")
                    const esmRegex = /window\.zorn\.([\$\w]*)\s*=\s*function\s*\(/g;
                    const esm = code.replace(esmRegex, "export function $1(");
                    const iifeRegex = /([\;\s]*)window\.zorn\.([\$\w]+)\s*=\s*function\s*\(/g;
                    var i = 0;
                    let iife = "var zorn=(function(){" + code.replace(iifeRegex, function (_, newLine, capture) {
                        if (i++ === 0) {
                            return ";return{" + capture + ":function(";
                        }
                        if (newLine) {
                            newLine = newLine.replace(";", "");
                        }
                        return newLine + "," + capture + ":function(";
                    });
                    iife = iife.replace(/[\s\;]*$/, "");
                    iife = iife + "};" + "})();";
                    await fs.promises.writeFile("./dist/zorn.js", iife);
                    await fs.promises.writeFile("./dist/zorn.mjs", esm);
                    await fs.promises.rm("./temp/closure.build.js");
                    resolve({ stdout, stderr });
                }
            }
        });
    });
}

async function bundleLibrary() {
    await closureBundleLibrary();
}

async function closureBundleTests() {
    return new Promise((resolve, reject) => {
        const cmd = [
            "closure-compiler",
            "-O ADVANCED",
            "--language_out ECMASCRIPT_NEXT",
            "--js src/api.js",
            "--js src/core.js",
            "--js src/types.js",
            "--js test/helper/*",
            "--js test/tests/*",
            "--js test/index.js",
            "--js_output_file test/dist/closure.test.js"
        ];
        exec(cmd.join(" "), (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                if (stderr) {
                    console.error(stderr);
                }
                resolve({ stdout, stderr });
            }
        });
    });
}

async function esbuildBundleTests() {
    await esbuild.build({
        entryPoints: ["./test/index.js"],
        minify: true,
        bundle: true,
        treeShaking: true,
        mangleProps: /^_/,
        outfile: "./test/dist/esbuild.test.js",
        plugins: [replaceEnumPlugin],
    });
}

async function bundleTests() {
    await Promise.all([
        closureBundleTests(),
        esbuildBundleTests()
    ]);
}

async function main() {
    await loadEnums();
    try {
        await Promise.all([
            bundleBench(),
            // bundleTests(),
            bundleLibrary(),
        ]);
    } catch (err) {
        console.error(err);
    }
}

main();