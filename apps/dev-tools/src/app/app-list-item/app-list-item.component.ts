/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Application, Beans, ManifestService } from '@scion/microfrontend-platform';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'devtools-app-list-item',
  templateUrl: './app-list-item.component.html',
  styleUrls: ['./app-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppListItemComponent implements OnInit {

  @Input()
  public app: Application;
  public capabilityCount$: Observable<number>;
  public intentionCount$: Observable<number>;

  public ngOnInit(): void {
    this.capabilityCount$ =  Beans.get(ManifestService).lookupCapabilities$({appSymbolicName: this.app.symbolicName})
      .pipe(map(capabilities => capabilities.length));
    this.intentionCount$ =  Beans.get(ManifestService).lookupIntentions$({appSymbolicName: this.app.symbolicName})
      .pipe(map(intentions => intentions.length));
  }

}
