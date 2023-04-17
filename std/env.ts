export const get = (_: any, item: string): string => {
    return process.env[item] ?? ""
}