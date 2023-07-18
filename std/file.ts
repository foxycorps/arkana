import { execSync } from "child_process";

export const write = (env: any, location: string, contents: string): void => {
    execSync(`echo "${contents}" >> ${location}`, {
        cwd: env.cwd,
        env
    })
}

export const del = (env: any, location: string): void => {
    execSync(`rm ${location}`, {
        cwd: env.cwd,
        env
    })
}

export const delDir = (env: any, location: string): void => {
    execSync(`rm -rf ${location}`, {
        cwd: env.cwd,
        env
    })
}

export const mkdir = (env: any, location: string): void => {
    execSync(`mkdir -p ${location}`, {
        cwd: env.cwd,
        env
    })
}

export const copy = (env: any, location1: string, location2: string): void => {
    execSync(`cp ${location1} ${location2}`, {
        cwd: env.cwd,
        env
    })
}

export const move = (env: any, location1: string, location2: string): void => {
    execSync(`mv ${location1} ${location2}`, {
        cwd: env.cwd,
        env
    })
}

// Shell command to see if a folder exists
export const existsDir = (env: any, location: string): boolean => {
    try {
        // Barbaric way of doing it... but it should work
        execSync(`cd ${location}`, {
            cwd: env.cwd,
            env
        })
        return true;
    } catch (e) {
        return false;
    }
}