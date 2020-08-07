/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule, NgZone } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Beans, MessageClient, MicrofrontendPlatform, PlatformState, PlatformStates } from '@scion/microfrontend-platform';
import { AngularZoneMessageClientDecorator } from './angular-zone-message-client.decorator';
import { AppDetailsComponent } from './app-details/app-details.component';
import { AppListComponent } from './app-list/app-list.component';
import { SciViewportModule } from '@scion/toolkit/viewport';
import { SciAccordionModule, SciFilterFieldModule, SciFormFieldModule, SciListModule, SciParamsEnterModule, SciPropertyModule, SciTabbarModule } from '@scion/toolkit.internal/widgets';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CapabilityAccordionPanelComponent } from './capability-accordion-panel/capability-accordion-panel.component';
import { CapabilityAccordionItemComponent } from './capability-accordion-item/capability-accordion-item.component';
import { IntentionAccordionPanelComponent } from './intention-accordion-panel/intention-accordion-panel.component';
import { IntentionAccordionItemComponent } from './intention-accordion-item/intention-accordion-item.component';
import { QualifierChipListComponent } from './qualifier-chip-list/qualifier-chip-list.component';
import { SciDimensionModule } from '@scion/toolkit/dimension';
import { FindCapabilitiesComponent } from './find-capabilities/find-capabilities.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SciSashboxModule } from '@scion/toolkit/sashbox';
import { FilterFieldComponent } from './find-capabilities/filter-field/filter-field.component';
import { AppListItemComponent } from './app-list-item/app-list-item.component';
import { FilterResultsComponent } from './filter-results/filter-results.component';

@NgModule({
  declarations: [
    AppComponent,
    AppDetailsComponent,
    FindCapabilitiesComponent,
    AppListComponent,
    AppListItemComponent,
    CapabilityAccordionPanelComponent,
    CapabilityAccordionItemComponent,
    IntentionAccordionPanelComponent,
    IntentionAccordionItemComponent,
    QualifierChipListComponent,
    FilterFieldComponent,
    FilterResultsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    SciViewportModule,
    SciListModule,
    SciAccordionModule,
    SciFilterFieldModule,
    SciParamsEnterModule,
    SciPropertyModule,
    SciTabbarModule,
    SciDimensionModule,
    SciFormFieldModule,
    SciSashboxModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: providePlatformInitializerFn,
      deps: [NgZone],
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

export function providePlatformInitializerFn(zone: NgZone): () => Promise<void> {
  return (): Promise<void> => {
    // Make the platform to run with Angular
    Beans.get(PlatformState).whenState(PlatformStates.Starting).then(() => {
      Beans.register(NgZone, {useValue: zone});
      Beans.registerDecorator(MessageClient, {useClass: AngularZoneMessageClientDecorator});
    });

    // Run the microfrontend platform as client app
    return MicrofrontendPlatform.connectToHost({symbolicName: 'dev-tools'});
  };
}
