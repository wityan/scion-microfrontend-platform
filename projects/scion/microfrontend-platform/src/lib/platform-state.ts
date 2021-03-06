/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';

/**
 * Allows observing the state of the microfrontend platform.
 *
 * @category Platform
 */
export class PlatformState {

  private _state$ = new BehaviorSubject<PlatformStates>(PlatformStates.Stopped);

  /**
   * @return the current platform state.
   */
  public get state(): PlatformStates {
    return this._state$.getValue();
  }

  /**
   * @param  state - the state to wait for.
   * @return A promise that resolves when the platform enters the given state.
   *         If already in that state, the promise resolve instantly.
   */
  public async whenState(state: PlatformStates): Promise<void> {
    return this._state$
      .pipe(filter(it => it === state), take(1))
      .toPromise()
      .then(() => Promise.resolve());
  }

  /**
   * @return An Observable that, when subscribed, emits the current platform state.
   *         It never completes and emits continuously when the state changes.
   */
  public get state$(): Observable<PlatformStates> {
    return this._state$;
  }

  /** @internal */
  public async enterState(newState: PlatformStates): Promise<void> {
    const currentState = (this.state === PlatformStates.Stopped) ? -1 : this.state;
    if (currentState >= newState) {
      throw Error(`[PlatformStateError] Failed to enter platform state [prevState=${PlatformStates[this.state]}, newState=${PlatformStates[newState]}].`);
    }

    this._state$.next(newState);

    // Let microtasks waiting for entering that state to resolve first.
    await this.whenState(newState);
  }
}

/**
 * Lifecycle states of the microfrontend platform.
 *
 * @category Platform
 */
export enum PlatformStates {
  /**
   * Indicates that the platform is about to start.
   */
  Starting = 1,
  /**
   * Indicates that the platform started.
   */
  Started = 2,
  /**
   * Indicates that the platform is about to stop.
   */
  Stopping = 3,
  /**
   * Indicates that the platform is not yet started.
   */
  Stopped = 4,
}
