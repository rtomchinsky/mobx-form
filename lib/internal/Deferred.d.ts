export declare class Deferred<T> {
    private _resolve;
    private _reject;
    readonly promise: Promise<T>;
    readonly resolve: (result: T) => void;
    readonly reject: (reason: any) => void;
}
