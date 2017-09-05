import { once } from 'lodash';

export type ResolveOrReject<T> = {
    (resolve: true, arg: T): any;
    (resolve: false, reason: any): any;
}

export class Deferred<T> {
    private resolveOrReject: ResolveOrReject<T>;
    public readonly promise: Promise<T> = new Promise((resolve, reject) => {
        const r = resolve;
        const j = reject;
        this.resolveOrReject = once(
            (resolve: boolean, arg: T | any) => {
                if (resolve) {
                    r(arg as T);
                } else {
                    j(arg as any);
                }
            }
        )
    });

    get resolve() {
        return (value: T) => this.resolveOrReject(true, value);
    }

    get reject() {
        return (reason: any) => this.resolveOrReject(false, reason);
    }
}