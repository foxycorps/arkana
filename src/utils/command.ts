import { execSync } from "child_process";

/**
 * This is the actual processor of the commands
 */
export const executeCommand = (commandTemplate: string) => (env: any, ...args: string[]) => {
    // Everything must come out to be a boolean in the end.
    // If it doesn't... we will just return True, or False if it fails.
    try {
        // We are going to fill in the template.
        let commandString = commandTemplate;
        for (let i = 0; i < args.length; i++) {
            commandString = commandString.replace("${" + (i + 1) + "}", args[i])
        }
        const result = execSync(commandString, {
            cwd: env.cwd,
            env
        });
        return Boolean(result);
    } catch {
        console.log("There was an error with the command")
        return false;
    }
}