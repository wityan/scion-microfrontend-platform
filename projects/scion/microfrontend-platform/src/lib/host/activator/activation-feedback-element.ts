import { Beans } from '../../bean-manager';
import { ActivationFeedback } from './activation-feedback';

export class ActivationFeedbackElement extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });
        const text = document.createElement('div');
        text.textContent = `Activation Feedback`;
        shadow.appendChild(text);

        const progress = document.createElement('progress');
        shadow.appendChild(progress);

        Beans.whenRunlevel(2).then(() => {
            Beans.get(ActivationFeedback).status$.subscribe(map => {

                const work = Array.from(map.values()).filter(Boolean).length;
                if (work > 0) {
                    progress.setAttribute('max', map.size.toString());
                    progress.setAttribute('value', Array.from(map.values()).filter(Boolean).length.toString());
                }

                [...map].sort().forEach(([k, v]) => {
                    const statusText = v ? 'done' : 'loading';
                    const e = shadow.getElementById(k);
                    if (e) {
                        e.textContent = `${k} ${statusText}`;
                    }
                    else {
                        const txt = document.createElement('div');
                        txt.setAttribute('id', k);
                        txt.textContent = `${k} ${statusText}`;
                        shadow.appendChild(txt);
                    }
                });
            });
        });
    }
}
