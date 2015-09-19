import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import * as Actions from '../actions';

class ThreadListItem extends Component {

  render() {
    let thread = this.props.thread;
    let lastMessage = thread.lastMessage;
    return (
      <li
        className={classNames({
          'thread-list-item': true,
          'active': thread.isActive
        })}
        onClick={this._onClick.bind(this)}>
        <h5 className="thread-name">{thread.name}</h5>
        <div className="thread-time">
          {lastMessage.date.toLocaleTimeString()}
        </div>
        <div className="thread-last-message">
          {lastMessage.text}
        </div>
      </li>
    );
  }

  _onClick() {
    Actions.clickThread.onNext(this.props.thread.id);
  }

};

ThreadListItem.propTypes = {
  thread: PropTypes.object.isRequired
};

export default ThreadListItem;
