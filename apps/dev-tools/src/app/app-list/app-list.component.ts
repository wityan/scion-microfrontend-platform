/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { Component } from '@angular/core';
import { Application, Beans, ManifestService } from '@scion/microfrontend-platform';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'devtools-app-list',
  templateUrl: './app-list.component.html',
  styleUrls: ['./app-list.component.scss']
})
export class AppListComponent {

  public readonly title = 'Application List';
  public applications$: Observable<Application[]>;
  private _appFilter$ = new BehaviorSubject<string>('');

  constructor() {
    this.applications$ = combineLatest([Beans.get(ManifestService).lookupApplications$(), this._appFilter$])
      .pipe(
        map(([apps, appFilter]) => apps
          .filter(app => app.name.toLowerCase().includes(appFilter))
          .sort((app1, app2) => app1.name.localeCompare(app2.name))
        ));
  }

  public trackByFn(app: Application): string {
    return app.symbolicName;
  }

  public onAppFilter(appFilter: string): void {
    this._appFilter$.next(appFilter.toLowerCase());
  }
}
