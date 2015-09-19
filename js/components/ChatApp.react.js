import React from 'react';
import MessageSection from './MessageSection.react';
import ThreadSection from './ThreadSection.react';
import * as Actions from '../actions';
import {
  threadsSource,
  currentMessagesSource,
  unreadCountSouce
} from '../store/store';

export default class ChatApp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      threads: [],
      messages: [],
      unreadCount: null
    };
  }

  componentDidMount() {
    this.disposable1 = threadsSource
      .subscribeOnNext(threads => this.setState({threads}));
    this.disposable2 = currentMessagesSource
      .subscribeOnNext(messages => this.setState({messages}));
    this.disposable3 = unreadCountSouce
      .subscribeOnNext(unreadCount => this.setState({unreadCount}));
  }

  componentWillUnmount() {
    this.disposable1.dispose();
    this.disposable2.dispose();
    this.disposable3.dispose();
  }

  render() {
    return (
      <div className="chatapp">
        <ThreadSection
          threads={this.state.threads}
          unreadCount={this.state.unreadCount}
        />
        <MessageSection messages={this.state.messages} />
      </div>
    );
  }

};
