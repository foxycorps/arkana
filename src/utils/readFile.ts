/**
 * Just a simple file reader
 */

import { readFileSync } from "fs-extra"

export const readFile = (filePath: string): string => {
    return readFileSync(filePath, 'utf8');
}