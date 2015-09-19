import Rx from 'rx';
import last from 'lodash/array/last';
import groupBy from 'lodash/collection/groupBy';
import { getMessages, postMessage } from '../ChatExampleDataServer';
import { clickThread, createMessage, requestMessages } from '../actions';
import { convertRawMessage } from '../utils/ChatMessageUtils';

let messagesSource = requestMessages
  .flatMap(() => Rx.Observable.fromCallback(getMessages)())
  .map(rawMessages => rawMessages.map(convertRawMessage));

let source = Rx.Observable.combineLatest(
    messagesSource,
    clickThread.startWith(null)
  )
  .map(([messages, currentThreadID]) => {
    if (currentThreadID === null) {
      currentThreadID = last(messages).threadID;
    }
    return [messages, currentThreadID];
  });

export let currentMessagesSource = source
  .map(([messages, currentThreadID]) => {
    for (let message of messages) {
      if (message.threadID === currentThreadID) {
        message.isRead = true;
      }
    }
    return messages.filter(message => message.threadID === currentThreadID);
  })
  .replay(s => s, 1);

export let threadsSource = source
  .map(([messages, currentThreadID]) => {
    let dict = groupBy(messages, 'threadID');
    return Object.keys(dict).map(threadID => {
      let threadMessages = dict[threadID];
      let lastMessage = last(threadMessages);
      return {
        id: threadID,
        name: lastMessage.threadName,
        authorName: lastMessage.authorName,
        lastMessage: lastMessage,
        isActive: threadID === currentThreadID
      };
    });
  })
  .replay(s => s, 1);
