/**
 * This is used to execute the javascript code.
 */
import tsc from 'typescript';

export const execute = (contents: string): any => {
    // We are going to do a typescript convert incase it is typescript...
    // as we want to naturally allow for TypeScript.
    const converted = tsc.transpileModule(contents, {}).outputText;
    // We will now execute the contents
    const module: any = {}; // This is where the exports will be put
    Function('exports', 'require', converted)(module, require);
    return module
}