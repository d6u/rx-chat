import React from 'react';
import MessageSection from './MessageSection.react';
import ThreadSection from './ThreadSection.react';
import * as Actions from '../actions';
import { threadsSource, currentMessagesSource } from '../store/store';

export default class ChatApp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      threads: [],
      messages: []
    };
  }

  componentDidMount() {
    this.disposable1 = threadsSource
      .subscribeOnNext(threads => this.setState({threads}));
    this.disposable2 = currentMessagesSource
      .subscribeOnNext(messages => this.setState({messages}));
    Actions.requestMessages.onNext();
  }

  componentWillUnmount() {
    this.disposable1.dispose();
    this.disposable2.dispose();
  }

  render() {
    return (
      <div className="chatapp">
        <ThreadSection threads={this.state.threads} />
        <MessageSection messages={this.state.messages} />
      </div>
    );
  }

};
