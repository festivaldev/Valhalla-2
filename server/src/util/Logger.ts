const levelFormats: { [level: number]: (content: string) => string } = {
    0: (content: string) => `\x1b[31m[ERROR]\x1b[0m ${content}`,
    1: (content: string) => `\x1b[33m[WARN]\x1b[0m ${content}`,
    2: (content: string) => `\x1b[34m[INFO]\x1b[0m ${content}`,
    3: (content: string) => `\x1b[32m[HTTP]\x1b[0m ${content}`,
    4: (content: string) => `\x1b[35m[VERB]\x1b[0m ${content}`,
    5: (content: string) => `\x1b[36m[DEBUG]\x1b[0m ${content}`,
};

export class Logger {
    public static log(content: string, level: LogLevel = LogLevel.info): void {
        console.log(levelFormats[level](content));
    }
}

export enum LogLevel {
    error = 0,
    warn = 1,
    info = 2,
    http = 3,
    verbose = 4,
    debug = 5,
}