import Rx from 'rx';

export let clickThread = new Rx.Subject();
export let createMessage = new Rx.Subject();
export let requestMessages = new Rx.Subject();
