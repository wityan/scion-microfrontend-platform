/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { Capability, Qualifier } from '@scion/microfrontend-platform';

@Component({
  selector: 'devtools-capability-accordion-item',
  templateUrl: './capability-accordion-item.component.html',
  styleUrls: ['./capability-accordion-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CapabilityAccordionItemComponent implements OnChanges, OnDestroy {

  private _destroy$ = new Subject<void>();
  private _inputChange$ = new Subject<void>();

  public execQualifier: Qualifier;

  @Input()
  public appSymbolicName;

  @Input()
  public capability: Capability;

  constructor(cd: ChangeDetectorRef) {
    // this._inputChange$
    //   .pipe(
    //     switchMap(() => manifestRegistryService.capabilities$(PlatformCapabilityTypes.Popup, this.createExecQualifier())),
    //     map((capabilities: Capability[]) => capabilities.length > 0),
    //     takeUntil(this._destroy$),
    //   )
    //   .subscribe((executable: boolean) => {
    //     this.execQualifier = (executable ? this.createExecQualifier() : null);
    //     cd.markForCheck();
    //   });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this._inputChange$.next();
  }

  public onCapabilityExecute(event: MouseEvent): void {
    if (!this.execQualifier) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // TODO: open popup?
  }

  // private createExecQualifier(): Qualifier {
  //   return {
  //     entity: 'capability',
  //     action: 'execute',
  //     type: this.capability.type,
  //     capabilityId: this.capability.metadata.id,
  //   };
  // }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
