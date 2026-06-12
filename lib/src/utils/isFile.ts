// deps

    // natives
    import { lstat } from "node:fs";

// types & interfaces

    // natives
    import type { Stats } from "node:fs";

// module

export default function isFile (path: string): Promise<boolean> {

    return new Promise((resolve: (value: boolean) => void): void => {

        lstat(path, (err: NodeJS.ErrnoException | null, stats: Stats): void => {
            return resolve(Boolean(!err && stats.isFile()));
        });

    });

}
