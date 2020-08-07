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
import { KeyValuePair } from './filter-field/filter-field.component';
import { ManifestFilterStore } from './manifest-filter-store.service';

@Component({
  selector: 'devtools-find-capabilities',
  templateUrl: './find-capabilities.component.html',
  styleUrls: ['./find-capabilities.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FindCapabilitiesComponent {

  public readonly title = 'Find Capabilities';

  constructor(private _manifestFilterStore: ManifestFilterStore) {
  }

  public onTypeFilterAdded(type: string): void {
    this._manifestFilterStore.addType(type);
  }

  public onTypeFilterRemoved(type: string): void {
    this._manifestFilterStore.removeType(type);
  }

  public onQualifierFilterAdded(qualifier: KeyValuePair): void {
    this._manifestFilterStore.addQualifier(qualifier);
  }

  public onQualifierFilterRemoved(qualifier: KeyValuePair): void {
    this._manifestFilterStore.removeQualifier(qualifier);
  }

  public onAppFilterAdded(app: string): void {
    this._manifestFilterStore.addApp(app);
  }

  public onAppFilterRemoved(app: string): void {
    this._manifestFilterStore.removeApp(app);
  }
}
