// This file bootstraps the entire application.

import ChatApp from './components/ChatApp.react';
import * as ChatWebAPIUtils from './utils/ChatWebAPIUtils';
import React from 'react';
import ReactDOM from 'react-dom';

ChatWebAPIUtils.getAllMessages();

ReactDOM.render(
  <ChatApp />,
  document.getElementById('react')
);
