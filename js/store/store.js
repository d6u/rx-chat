import { Observable } from 'rx';
import last from 'lodash/array/last';
import groupBy from 'lodash/collection/groupBy';
import findIndex from 'lodash/array/findIndex';
import ary from 'lodash/function/ary';
import * as ChatExampleDataServer from '../ChatExampleDataServer';
import * as Actions from '../actions';
import * as ChatMessageUtils from '../utils/ChatMessageUtils';

let messagesSource = Actions.requestMessages
  .flatMap(ary(Observable.fromCallback(ChatExampleDataServer.getMessages), 0))
  .map(rawMessages => rawMessages.map(ChatMessageUtils.convertRawMessage));

let newMessageSource = Actions.createMessage
  .map(({text, threadID}) => ChatMessageUtils.getCreatedMessageData(text, threadID))
  .flatMap(message => {
    return Observable.fromCallback(ChatExampleDataServer.postMessage)(message)
      .map(rawMessage => {
        let newMessage = ChatMessageUtils.convertRawMessage(rawMessage);
        newMessage.tmp_id = message.tmp_id;
        newMessage.isRead = true;
        return newMessage;
      })
      .startWith(message);
  });

let allMessagesSouce =
  Observable.combineLatest(messagesSource, newMessageSource.startWith(null))
  .scan((allMessages, [messages, newMessage]) => {
    if (!newMessage) {
      return allMessages.concat(messages);
    }

    if (newMessage.id == null) {
      return allMessages.concat([newMessage]);
    } else {
      let i = findIndex(allMessages, {tmp_id: newMessage.tmp_id});
      allMessages[i] = newMessage;
      return allMessages;
    }
  }, []);

let source =
  Observable.combineLatest(allMessagesSouce, Actions.clickThread.startWith(null))
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
    return messages.filter(message => message.threadID === currentThreadID);
  });

export let threadsSource = source
  .map(([messages, currentThreadID]) => {
    let dict = groupBy(messages, 'threadID');
    return Object.keys(dict).map(threadID => {
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
  .map(ts => ts.reduce((c, t) => c + (t.lastMessage.isRead ? 0 : 1), 0));
