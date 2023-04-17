import { execSync } from "child_process"

export const run = (env: any, command: string): void => {
    execSync(command, {
        cwd: env.cwd,
        env
    })
}