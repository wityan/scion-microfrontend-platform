/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Capability } from '@scion/microfrontend-platform';
import { ManifestFilterStore } from '../find-capabilities/manifest-filter-store.service';

@Component({
  selector: 'devtools-filter-results',
  templateUrl: './filter-results.component.html',
  styleUrls: ['./filter-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterResultsComponent {

  public title = 'Filter Results';
  public capabilities$: Observable<Capability[]>;

  constructor(private _manifestFilterStore: ManifestFilterStore) {
    this.capabilities$ = this._manifestFilterStore.capabilities$();
  }
}
