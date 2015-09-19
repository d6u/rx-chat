import React from 'react';
import ThreadListItem from '../components/ThreadListItem.react';

export default class ThreadSection extends React.Component {

  render() {
    let threadListItems = this.props.threads.map(thread =>
      <ThreadListItem key={thread.id} thread={thread} />);

    let unread =
      this.props.unreadCount === 0 ?
      null :
      <span>Unread threads: {this.props.unreadCount}</span>;

    return (
      <div className="thread-section">
        <div className="thread-count">
          {unread}
        </div>
        <ul className="thread-list">
          {threadListItems}
          </ul>
      </div>
    );
  }

};
