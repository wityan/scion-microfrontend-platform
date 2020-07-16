import { BehaviorSubject } from 'rxjs';

export class ActivationFeedback {

    public status$ = new BehaviorSubject(new Map<string, boolean>());

    private _status = new Map<string, boolean>();

    public status(app: string, status: boolean = false): void {
        this._status.set(app, status);
        this.status$.next(this._status);
    }

}
