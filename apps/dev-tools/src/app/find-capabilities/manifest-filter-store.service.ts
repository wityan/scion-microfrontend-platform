/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { Injectable } from '@angular/core';
import { combineLatest, Observable, Subject } from 'rxjs';
import { Beans, Capability, ManifestService, Qualifier } from '@scion/microfrontend-platform';
import { map, startWith } from 'rxjs/operators';
import { KeyValuePair } from './filter-field/filter-field.component';

@Injectable({
  providedIn: 'root'
})
export class ManifestFilterStore {
  private _update$ = new Subject<void>();
  private _types = new Set<string>();
  private _qualifiers = new Array<KeyValuePair>();
  private _apps = new Set<string>();

  public capabilities$(): Observable<Capability[]> {
    return combineLatest([Beans.get(ManifestService).lookupCapabilities$(), this._update$.pipe(startWith(true))])
      .pipe(map(([capabilities]) => this.filter(capabilities)));
  }

  private filter(capabilities: Capability[]): Capability[] {
    return capabilities
      .filter(capability => this._types.size === 0 || this._types.has(capability.type))
      .filter(capability => this._qualifiers.length === 0 || this.xxx(capability.qualifier))
      .filter(capability => this._apps.size === 0 || this._apps.has(capability.metadata.appSymbolicName))
      .sort((p1, p2) => compare(p1, p2));
  }

  public addType(type: string): void {
    if (this._types.has(type)) {
      return;
    }
    this._types.add(type);
    this._update$.next();
  }

  public removeType(type: string): void {
    this._types.delete(type) && this._update$.next();
  }

  public addQualifier(qualifier: KeyValuePair): void {
    if (this.matchesQualifier(qualifier)) {
      return;
    }
    this._qualifiers.push(qualifier);
    this._update$.next();
  }

  public removeQualifier(qualifier: KeyValuePair): void {
    const index = this._qualifiers.findIndex(q => q.key === qualifier.key && q.value === qualifier.value);
    if (index !== -1) {
      this._qualifiers.splice(index, 1);
    }
    this._update$.next();
  }

  public addApp(app: string): void {
    if (this._apps.has(app)) {
      return;
    }
    this._apps.add(app);
    this._update$.next();
  }

  public removeApp(app: string): void {
    this._apps.delete(app) && this._update$.next();
  }

  // TODO: how to match wildcards?
  private xxx(qualifier: Qualifier): boolean {
    return Object.keys(qualifier).some(key => this.matchesQualifier({key, value: qualifier[key] as string}));
  }

  // Exact matching here
  private matchesQualifier(qualifier: KeyValuePair): boolean {
    return this._qualifiers.some(q => q.key === qualifier.key && q.value === qualifier.value);
  }
}

function compare(p1: Capability, p2: Capability): number {
  return p1.metadata.appSymbolicName.localeCompare(p2.metadata.appSymbolicName) || p1.type.localeCompare(p2.type);
}
