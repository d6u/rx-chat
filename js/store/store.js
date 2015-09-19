import Rx from 'rx';
import last from 'lodash/array/last';
import groupBy from 'lodash/collection/groupBy';
import * as ChatExampleDataServer from '../ChatExampleDataServer';
import * as Actions from '../actions';
import * as ChatMessageUtils from '../utils/ChatMessageUtils';

let messagesSource = Actions.requestMessages
  .flatMap(() => Rx.Observable.fromCallback(ChatExampleDataServer.getMessages)())
  .map(rawMessages => rawMessages.map(ChatMessageUtils.convertRawMessage));

let source = Rx.Observable.combineLatest(
    messagesSource,
    Actions.clickThread.startWith(null)
  )
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
        name: lastMessage.threadName,
        authorName: lastMessage.authorName,
        lastMessage: lastMessage,
        isActive: threadID === currentThreadID
      };
    });
  });
