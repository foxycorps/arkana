import { execSync } from 'child_process'

export const clone = (env: any, url: string, location: string): void => {
    execSync(`git clone ${url} ${location}`, {
        cwd: env.cwd,
        env
    })
}

export const checkout = (env: any, branch: string): void => {
    execSync(`git checkout -b ${branch}`, {
        cwd: env.cwd,
        env
    })
}

export const add = (env: any, whatToAdd: string): void => {
    execSync(`git add ${whatToAdd}`, {
        cwd: env.cwd,
        env
    })
}

export const commit = (env: any, message: string): void => {
    execSync(`git commit -m "${message}"`, {
        cwd: env.cwd,
        env
    })
}

export const pull = (env: any): void => {
    execSync(`git pull`, {
        cwd: env.cwd,
        env
    })
}

export const push = (env: any): void => {
    execSync(`git push`, {
        cwd: env.cwd,
        env
    })
}

export const fetch = (env: any): void => {
    execSync(`git fetch`, {
        cwd: env.cwd,
        env
    })
}