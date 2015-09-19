// This file bootstraps the entire application.

import React from 'react';
import ReactDOM from 'react-dom';
import ChatApp from './components/ChatApp.react';
import './store/store';
import * as Actions from './actions';

Actions.requestMessages.onNext();

ReactDOM.render(
  <ChatApp />,
  document.getElementById('react')
);
