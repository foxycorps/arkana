import { readFileSync } from "fs-extra";
import { execSync } from "node:child_process";
import { executeCommand } from "utils/command";
import { execute } from "utils/execute";

type Dict<T> = {
    [key: string]: T
}

class Task {
    constructor(private name: string) { }
}

class Blueprint {
    private parameters: Map<string, string> = new Map<string, string>();
    private tasks: Map<string, Task> = new Map<string, Task>();

    constructor(private name: string, private definition: any) {
        this.readParams();
    }

    private readParams(): void {
        for (const [name, details] of Object.entries(this.definition)) {
            let def: string = "";
            if ((details as any).default != null) {
                def = (details as any).default;
            }
            this.parameters.set(name, def);
        }
    }

    public execute(...params: any[]) {
        // TODO: Need to implement
    }
}

export default class Interpreter {

    private library: Map<string, any> = new Map<string, any>();
    private commands: Map<string, any> = new Map<string, any>();
    private blueprints: Map<string, any> = new Map<string, any>();

    constructor(private obj: any) { }

    interpret(dryRun: boolean) {

        // We will start by reading the dependencies
        this.readImports();
        this.loadCommands();
        this.loadBlueprints();

        if (!dryRun) {
            this.executeTasks();
        }
    }

    executeTasks() {
        // We are going to loop through every task, and run it.
        for (const task of this.obj.tasks) {
            console.log(`=== RUNNING "${task.name}" ===`);
            // START :: CONDITION
            let shouldExit = false;
            for (const cmd of task.condition) {
                if (shouldExit) continue;
                const result = this.executeCallee(cmd.identifier, task.env)(...this.executeParams(...cmd.params))
                if (!result) shouldExit = true;
            }
            if (shouldExit) continue;
            // END :: CONDITION
            // START :: ENV
            const updatedEnv = {};
            for (const [env, envValue] of Object.entries(task.env)) {
                if (typeof envValue === 'string') continue;
                // It is not a string... so we will 
                // run it as a function.
                updatedEnv[env] = this.executeCallee((envValue as any).identifier, {})(...this.executeParams(...(envValue as any).params))
            }
            task.env = { ...process.env, ...task.env, ...updatedEnv }
            // END :: ENV

            // We will now step through every command
            for (const cmd of task.command) {
                if (Array.isArray(cmd)) {
                    // This means it is a string command... which is the same as `shell.run`
                    execSync(cmd[0], {
                        cwd: task.env.cwd,
                        env: task.env
                    });
                    continue;
                }

                if (cmd.callee) {
                    // This means that we are calling a function
                    this.executeCallee(cmd.identifier, task.env ?? {})(...this.executeParams(...cmd.params))
                    continue;
                }

                if (cmd.blueprint) {
                    this.executeBlueprint(cmd.identifier)(...this.executeParams(...cmd.params));
                }
            }
        }
    }

    executeParams(...paramList: any[]) {
        const newParams = [];

        // We are going to loop through every param, and execute the `functions`
        for (const param of paramList) {
            if (typeof param === "string") {
                newParams.push(param);
                continue;
            }
            console.log({ param })
            // If we are here... its a function
            newParams.push(this.executeCallee(String(param.identifier), {})(...this.executeParams(...param.params ?? [])))
        }

        return newParams;
    }

    executeCallee(functionName: string, env: Dict<string>) {
        console.log({ functionName })
        // We are going to check to see if the `functionName` has at least 1 `.` in it.
        // If it does, then we will only check the `library` section...
        // and we will loop through until we find the obj.
        if (functionName.includes('.')) {
            let parts = functionName.split(".");
            if (!this.library.has(parts[0])) throw new Error(`Function "${parts[0]}" is not defined.`);

            let func = this.library.get(parts[0]);

            for (const part of parts) {
                if (part === parts[0]) continue;
                if (Object.keys(func).includes(part)) {
                    func = func[part];
                }
            }
            if (typeof func === 'function') return (...params: any[]) => func(env, ...params);
            throw new Error(`"${functionName}" is not a function.`)
        }
        // We are going to check to see where the function exists.
        if (this.library.has(functionName)) {
            // This is a regular library function... so we will return a function
            // for the params.
            return (...params: string[]) => this.library.get(functionName)(env, ...params);
        }

        if (this.commands.has(functionName)) {
            // This is a command, so we will return the direct command
            return (...params: string[]) => this.commands.get(functionName)(env, ...params);
        }

        // If we are here... we don't know anything about this function
        throw new Error(`Function "${functionName}" is not defined.`)
    }
    executeBlueprint(blueprintName: string) {
        if (this.blueprints.has(blueprintName)) {
            // This is a blueprint... so we will get the blueprint
            // then return a specific function of it.
            const bp = this.blueprints.get(blueprintName);
            return bp.execute
        }

        throw new Error(`Blueprint "${blueprintName}" is not defined.`)
    }

    readImports() {
        for (const impObj of this.obj.imports) {
            for (const [impName, imp] of Object.entries(impObj)) {
                // We will check to see if the url has `http` in it.
                // If it does, we will do a node-fetch for the import data...
                // otherwise we will read the file.
                if (String(imp).includes("http")) {
                    // It is an actual URL so we will do a node-fetch for the import.
                    fetch(String(imp), { method: "GET" }).then((res) => res.text()).then((res) => {
                        const result = execute(res);
                        if (impName.startsWith('--') && impName.endsWith('--')) {
                            // This means its a blind import.
                            for (const [k, v] of Object.entries(result)) {
                                this.library.set(k, v);
                            }
                            return;
                        }
                        this.library.set(impName, result);
                    })
                } else {
                    // We are reading the file from local.
                    const fileContents = readFileSync(String(imp), 'utf8');
                    const result = execute(fileContents);
                    if (impName.startsWith('--') && impName.endsWith('--')) {
                        // This means its a blind import.
                        for (const [k, v] of Object.entries(result)) {
                            this.library.set(k, v);
                        }
                        continue;
                    }
                    this.library.set(impName, result);
                }

            }
        }
    }
    loadBlueprints() {
        for (const [bluePrintName, details] of Object.entries(this.obj.blueprints)) {
            // We are going to make a new BluePrint obj for each one.
            this.blueprints.set(bluePrintName, new Blueprint(bluePrintName, details))
        }
    }
    loadCommands() {
        // Everything inside the `commands` section is a key-value pair
        // of a shell command.

        // This means we will fill a map with the commands, and a child-process ready to go
        for (const [command, commandValue] of Object.entries(this.obj.commands)) {
            // We take an approach that we will only warn the user that there is a duplicate
            // command. We don't actually care to throw an error, or stop.
            // We will just replace what they have already defined.

            if (this.commands.has(command)) {
                console.warn(`"${command}" has already been defined. This will be replaced.`);
            }

            this.commands.set(command, executeCommand(commandValue as string));
        }
    }

}