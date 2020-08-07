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
import { combineLatest, MonoTypeOperatorFunction, Observable, of, OperatorFunction, pipe } from 'rxjs';
import { Application, Beans, Capability, Intention, ManifestObject, ManifestObjectFilter, ManifestService } from '@scion/microfrontend-platform';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DevToolsManifestService {

  public intentions$(filter: ManifestObjectFilter): Observable<Intention[]> {
    return Beans.get(ManifestService).lookupIntentions$(filter)
      .pipe(map(intentions => intentions.sort(byType)));
  }

  public capabilities$(filter: ManifestObjectFilter): Observable<Capability[]> {
    return Beans.get(ManifestService).lookupCapabilities$(filter)
      .pipe(map(capabilities => capabilities.sort(byType)));
  }

  public applicationsHandlingIntention$(intention: Intention): Observable<Application[]> {
    const capabilityFilter = {
      type: intention.type,
      qualifier: intention.qualifier
    };

    return combineLatest([
      Beans.get(ManifestService).lookupCapabilities$(capabilityFilter).pipe(distinctAppSymbolicNames()),
      this.applicationsMap$()
    ]).pipe(applicationsBySymbolicName());
  }

  public applicationsUsingCapability$(capability: Capability): Observable<Application[]> {
    const intentionFilter = {
      type: capability.type,
      qualifier: capability.qualifier
    };

    return combineLatest([
      Beans.get(ManifestService).lookupIntentions$(intentionFilter).pipe(distinctAppSymbolicNames()),
      this.applicationsMap$()
    ]).pipe(applicationsBySymbolicName());
  }

  public applicationsRequiredBy$(appSymbolicName: string): Observable<Application[]> {
    const mappingFunc = (intention) => this.applicationsHandlingIntention$(intention);
    return Beans.get(ManifestService).lookupIntentions$({appSymbolicName})
      .pipe(findDistinctApplications(appSymbolicName, mappingFunc));
  }

  public applicationsRequiring$(appSymbolicName: string): Observable<Application[]> {
    const mappingFunc = (capability) => this.applicationsUsingCapability$(capability);
    return Beans.get(ManifestService).lookupCapabilities$({appSymbolicName})
      .pipe(findDistinctApplications(appSymbolicName, mappingFunc));
  }

  private applicationsMap$(): Observable<Map<string, Application>> {
    return Beans.get(ManifestService).lookupApplications$()
      .pipe(map(applications => applications.reduce((appMap, app) => appMap.set(app.symbolicName, app), new Map<string, Application>())));
  }
}

const bySymbolicName = (app1: Application, app2: Application): number => app1.symbolicName.localeCompare(app2.symbolicName);
const byType = (mo1: ManifestObject, mo2: ManifestObject): number => mo1.type.localeCompare(mo2.type);

function distinctAppSymbolicNames(): OperatorFunction<ManifestObject[], string[]> {
  return pipe(
    map(elements => elements.map(it => it.metadata.appSymbolicName)),
    map(elements => elements.reduce((elementSet, it) => elementSet.add(it), new Set<string>())),
    map(elementSet => Array.from(elementSet.values())),
  );
}

function applicationsBySymbolicName(): OperatorFunction<[string[], Map<string, Application>], Application[]> {
  return pipe(
    map(([appSymbolicNames, appMap]) => appSymbolicNames.map(appSymbolicName => appMap.get(appSymbolicName))),
    map(apps => Array.from(apps).sort(bySymbolicName)),
  );
}

function findDistinctApplications(appSymbolicName: string, mappingFunc: (it: ManifestObject) => Observable<Application[]>): OperatorFunction<ManifestObject[], Application[]> {
  return pipe(
    switchMap(elements => elements.length ? combineLatest(elements.map(element => mappingFunc(element)
      .pipe(map(apps => apps.filter(app => app.symbolicName !== appSymbolicName))))) : of([])
    ),
    map(arrayOfArrays => arrayOfArrays.reduce((resultingArray, array) => [...resultingArray, ...array], [])),
    distinctApplications(),
  );
}

function distinctApplications(): MonoTypeOperatorFunction<Application[]> {
  return pipe(
    map(applications => applications.reduce((appMap, app) => appMap.set(app.symbolicName, app), new Map<string, Application>())),
    map(appMap => Array.from(appMap.values()).sort(bySymbolicName))
  );
}


