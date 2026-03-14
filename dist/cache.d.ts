export interface State {
    key: string;
    cachedKey: string | undefined;
}
export declare function restore(cwd: string): Promise<State>;
export declare function save(state: State): Promise<void>;
