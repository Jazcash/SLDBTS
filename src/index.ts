export { SLDBModel } from "./sldb-model";

export { SLDBClient } from "./client";

export interface SLDBClientConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    verbose?: boolean;
}