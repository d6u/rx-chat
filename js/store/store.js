import { Observable } from 'rx';
import {
  last, nAry, groupBy, findIndex, propEq, map, apply, props, compose, filter,
  prop, keys, merge, unary, update, reduce, of
} from 'ramda';
import { getMessages, postMessage } from '../ChatExampleDataServer';
import { requestMessages, createMessage, clickThread } from '../actions';
import {
  getCreatedMessageData,
  convertRawMessage
} from '../utils/ChatMessageUtils';

let messagesSource = requestMessages
  .flatMap(nAry(0, Observable.fromCallback(getMessages)))
  .map(map(convertRawMessage));

let newMessageSource = createMessage
  .map(props(['text', 'threadID']))
  .map(apply(getCreatedMessageData))
  .flatMap(message => {
    return Observable.fromCallback(postMessage)(message)
      .map(convertRawMessage)
      .map(merge({
        tempID: message.tempID,
        isRead: true
      }))
      .startWith(message)
      .map(of);
  });

let allMessagesSouce =
  Observable.merge(messagesSource, newMessageSource)
  .scan((allMessages, messages) => {
    if (messages.length > 1) {
      return allMessages.concat(messages);
    }

    let newMessage = messages[0];

    if (newMessage.id == null) {
      return allMessages.concat([newMessage]);
    }

    return update(
      findIndex(propEq('tempID', newMessage.tempID), allMessages),
      newMessage,
      allMessages);
  });

let source =
  Observable.combineLatest(allMessagesSouce, clickThread.startWith(null))
  .map(([messages, currentThreadID]) => {
    if (currentThreadID === null) {
      currentThreadID = last(messages).threadID;
    }
    return [messages, currentThreadID];
  })
  .replay(null, 1);

source.connect();

export let currentMessagesSource = source
  .map(([messages, currentThreadID]) => {
    for (let message of messages) {
      if (message.threadID === currentThreadID) {
        message.isRead = true;
      }
    }
    return filter(propEq('threadID', currentThreadID), messages);
  });

export let threadsSource = source
  .map(([messages, currentThreadID]) => {
    let dict = groupBy(prop('threadID'), messages);
    return keys(dict).map(threadID => {
      let threadMessages = dict[threadID];
      let lastMessage = last(threadMessages);
      return {
        id: threadID,
        name: threadMessages[0].threadName,
        authorName: threadMessages[0].authorName,
        lastMessage: lastMessage,
        isActive: threadID === currentThreadID
      };
    });
  });

export let unreadCountSouce = threadsSource
  .map(reduce((count, thread) => count + !thread.lastMessage.isRead, 0));
