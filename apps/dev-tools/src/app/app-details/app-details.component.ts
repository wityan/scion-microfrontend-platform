/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, OperatorFunction, Subject } from 'rxjs';
import { Application, Beans, Capability, Intention, ManifestService } from '@scion/microfrontend-platform';
import { distinctUntilChanged, map, switchMap, take } from 'rxjs/operators';
import { DevToolsManifestService } from '../dev-tools-manifest.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'devtools-app-details',
  templateUrl: './app-details.component.html',
  styleUrls: ['./app-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppDetailsComponent implements OnDestroy {

  public app$: Observable<Application>;
  public capabilities$: Observable<Capability[]>;
  public intentions$: Observable<Intention[]>;
  public requiredApplications$: Observable<Application[]>;
  public requiredByApplications$: Observable<Application[]>;

  private _appSymbolicName$: Observable<string>;
  private _title$: Subject<string> = new Subject<string>();
  private _capabilityFilter$ = new BehaviorSubject<string>('');
  private _intentionFilter$ = new BehaviorSubject<string>('');
  private _destroy$ = new Subject<void>();

  constructor(route: ActivatedRoute, private _manifestService: DevToolsManifestService) {
    this._appSymbolicName$ = route.paramMap
      .pipe(
        map(paramMap => paramMap.get('appSymbolicName')),
        distinctUntilChanged(),
      );
    this.installTitleProvider();
    this.installAppListener();
    this.installCapabilitiesListener();
    this.installIntentionsListener();
    this.installDependenciesListener();
  }

  private installTitleProvider(): void {
    this._appSymbolicName$.pipe(
      switchMap(appSymbolicName => Beans.get(ManifestService).lookupApplications$()
        .pipe(
          map(apps => apps.find(app => app.symbolicName === appSymbolicName)?.name),
          take(1)
        )
      ),
    ).subscribe(title => this._title$.next(title));
  }

  private installAppListener(): void {
    this.app$ = this._appSymbolicName$.pipe(
      switchMap(appSymbolicName => Beans.get(ManifestService).lookupApplications$()
        .pipe(map(apps => apps.find(app => app.symbolicName === appSymbolicName))),
      ),
    );
  }

  private installCapabilitiesListener(): void {
    this.capabilities$ = this._appSymbolicName$.pipe(
      switchMap(appSymbolicName => combineLatest([
        this._manifestService.capabilities$({appSymbolicName}),
        this._capabilityFilter$,
      ])),
      filterCapabilities(),
    );
  }

  private installIntentionsListener(): void {
    this.intentions$ = this._appSymbolicName$.pipe(
      switchMap(appSymbolicName => combineLatest([
        this._manifestService.intentions$({appSymbolicName}),
        this._intentionFilter$,
      ])),
      filterIntentions(),
    );
  }

  private installDependenciesListener(): void {
    this.requiredApplications$ = this._appSymbolicName$
      .pipe(switchMap(appSymbolicName => this._manifestService.applicationsRequiredBy$(appSymbolicName)));
    this.requiredByApplications$ = this._appSymbolicName$
      .pipe(switchMap(appSymbolicName => this._manifestService.applicationsRequiring$(appSymbolicName)));
  }

  public get title(): Observable<string> {
    return this._title$.asObservable();
  }

  public onCapabilityFilter(filterText: string): void {
    this._capabilityFilter$.next(filterText.toLowerCase());
  }

  public onIntentionFilter(filterText: string): void {
    this._intentionFilter$.next(filterText.toLowerCase());
  }

  public trackByFn(app: Application): string {
    return app.symbolicName;
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

function filterCapabilities(): OperatorFunction<[Capability[], string], Capability[]> {
  return map(([capabilities, filterText]: [Capability[], string]): Capability[] => {
    if (!filterText) {
      return capabilities;
    }

    return capabilities.filter(capability =>
      contains(capability.private ? 'private' : 'public', filterText) ||
      filterTypeAndQualifier(capability, filterText)
    );
  });
}

function filterIntentions(): OperatorFunction<[Intention[], string], Intention[]> {
  return map(([intentions, filterText]: [Intention[], string]): Intention[] => {
    if (!filterText) {
      return intentions;
    }

    return intentions.filter(intention => filterTypeAndQualifier(intention, filterText));
  });
}

function filterTypeAndQualifier(intention: Capability | Intention, filterText: string): boolean {
  return contains(intention.type, filterText) ||
    Object.keys(intention.qualifier || {}).some(key => contains(key, filterText)) ||
    Object.values(intention.qualifier || {}).some(value => contains(`${value}`, filterText));
}

function contains(value: string, filterText: string): boolean {
  return value.toLowerCase().includes(filterText);
}
