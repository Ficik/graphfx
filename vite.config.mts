import {readdirSync} from 'node:fs';
import {extname, isAbsolute, relative, resolve, sep} from 'node:path';
import {defineConfig} from 'vite';

const projectRoot = import.meta.dirname;
const sourceRoot = resolve(projectRoot, 'src');
const vendorSourceRoot = resolve(projectRoot, 'vendor/ts-aruco/src');

const collectEntries = (
    directory: string,
    outputRoot: string,
): Record<string, string> => {
    const entries: Record<string, string> = {};

    for (const entry of readdirSync(directory, {withFileTypes: true})) {
        const path = resolve(directory, entry.name);
        if (entry.isDirectory()) {
            Object.assign(entries, collectEntries(path, outputRoot));
            continue;
        }

        const extension = extname(entry.name);
        if (!['.js', '.ts'].includes(extension) ||
            entry.name.endsWith('.d.ts') ||
            /\.(?:x?spec|test)\.[jt]s$/.test(entry.name)) {
            continue;
        }

        const outputPath = relative(outputRoot, path)
            .slice(0, -extension.length)
            .split(sep)
            .join('/');
        entries[outputPath] = path;
    }

    return entries;
};

// Every source file is an entry so Rolldown only transpiles modules; it must not
// fold the library into a bundle or tree-shake deep-imported modules away.
const entries = {
    ...collectEntries(sourceRoot, sourceRoot),
    ...collectEntries(vendorSourceRoot, projectRoot),
};

const isExternal = (id: string) =>
    !id.startsWith('.') &&
    !id.startsWith('\0') &&
    !id.startsWith('graphfx/src') &&
    !isAbsolute(id);

export default defineConfig({
    resolve: {
        alias: {
            'graphfx/src': sourceRoot,
        },
    },
    build: {
        target: 'node14',
        outDir: resolve(projectRoot, 'dist'),
        emptyOutDir: true,
        copyPublicDir: false,
        minify: false,
        sourcemap: true,
        rolldownOptions: {
            input: entries,
            external: isExternal,
            treeshake: false,
            preserveEntrySignatures: 'strict',
            output: [
                {
                    dir: resolve(projectRoot, 'dist/esm'),
                    format: 'es',
                    entryFileNames: '[name].mjs',
                    chunkFileNames: '[name].mjs',
                    minifyInternalExports: false,
                    preserveModules: true,
                    preserveModulesRoot: projectRoot,
                    virtualDirname: '_runtime',
                },
                {
                    dir: resolve(projectRoot, 'dist/cjs'),
                    format: 'cjs',
                    exports: 'named',
                    entryFileNames: '[name].js',
                    chunkFileNames: '[name].js',
                    minifyInternalExports: false,
                    preserveModules: true,
                    preserveModulesRoot: projectRoot,
                    virtualDirname: '_runtime',
                },
            ],
        },
    },
});
