export class Deferred<T> {
    private _resolve: (result: T) => void = null!;
    private _reject: (reason: any) => void = null!;

    public readonly promise: Promise<T> = new Promise((resolve, reject) => {
        this._resolve = resolve;
        this._reject = reject;
    });

    get resolve() {
        return this._resolve;
    }

    get reject() {
        return this._reject;
    }
}