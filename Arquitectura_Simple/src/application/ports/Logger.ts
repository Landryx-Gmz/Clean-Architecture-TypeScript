// Define the Logger interface
export interface Logger {
    info(message: string, obj?: Record<string, any>): void;
    error(message: string, obj?: Record<string, any>): void;
    warn(message: string, obj?: Record<string, any>): void;
    debug(message: string, obj?: Record<string, any>): void;
    child(context: LoggerContext): Logger;
}

// Define the LoggerContext interface
export interface LoggerContext {
    requestId?: string;
    userId?: string;
    operation?: string;
    [key: string]: any;
}