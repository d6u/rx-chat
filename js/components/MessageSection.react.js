import React from 'react';
import MessageComposer from './MessageComposer.react';
import MessageListItem from './MessageListItem.react';

function getMessageListItem(message) {
  return (
    <MessageListItem
      key={message.id || message.tempID}
      message={message}
    />
  );
}

export default class MessageSection extends React.Component {

  componentDidMount() {
    this._scrollToBottom();
  }

  render() {
    if (this.props.messages.length) {
      let firstMessage = this.props.messages[0];
      let messageListItems = this.props.messages.map(getMessageListItem);
      return (
        <div className="message-section">
          <h3 className="message-thread-heading">{firstMessage.threadName}</h3>
          <ul className="message-list" ref="messageList">
            {messageListItems}
          </ul>
          <MessageComposer threadID={firstMessage.threadID}/>
        </div>
      );
    } else {
      return <div className="message-section"></div>;
    }
  }

  componentDidUpdate() {
    this._scrollToBottom();
  }

  _scrollToBottom() {
    let ul = this.refs.messageList;
    if (ul) {
      ul.scrollTop = ul.scrollHeight;
    }
  }

};
