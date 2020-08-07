/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';

export type Filter = string | KeyValuePair;

export interface KeyValuePair {
  key: string;
  value: string;
}

@Component({
  selector: 'devtools-filter-field',
  templateUrl: './filter-field.component.html',
  styleUrls: ['./filter-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterFieldComponent {

  @Input()
  public title: string;

  @Input()
  public type: 'value' | 'key-value' = 'value';

  @Input()
  public logicalOperation: 'and' | 'or';

  @Output()
  public filterAdded: EventEmitter<Filter> = new EventEmitter<Filter>();

  @Output()
  public filterRemoved: EventEmitter<Filter> = new EventEmitter<Filter>();

  @ViewChild('key', {read: ElementRef})
  public key: ElementRef;
  public keyFC = new FormControl();

  @ViewChild('value', {read: ElementRef})
  public value: ElementRef;
  public valueFC = new FormControl();

  public _filters: Set<Filter> = new Set<Filter>();

  public get filters(): Filter[] {
    return Array.from(this._filters.values());
  }

  public onAddFilterClick(): void {
    const key = this.keyFC.value;
    const value = this.valueFC.value;
    this.keyFC.setValue('');
    this.valueFC.setValue('');
    const xxx = this.add(key, value);
    if (xxx) {
      this.filterAdded.emit(xxx);
    }
  }

  public onRemoveFilter(filter: Filter): void {
    this._filters.delete(filter);
    this.filterRemoved.emit(filter);
  }

  private add(key: string, value: string): Filter {
    if (this.type === 'value' && value && !this._filters.has(value)) {
      this._filters.add(value);
      this.value.nativeElement.focus();
      return value;
    }
    else if (this.type === 'key-value') {
      if (key) {
        this.key.nativeElement.focus();
        const entry = {key, value};
        if (this.hasEntry(entry)) {
          return;
        }
        this._filters.add(entry);
        return entry;
      }
    }
  }

  private hasEntry(entry: KeyValuePair): boolean {
    return !!Array.from(this._filters.values()).find((filter: KeyValuePair) => filter.key === entry.key && filter.value === entry.value);
  }
}
