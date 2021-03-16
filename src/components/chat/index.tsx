'use strict'

import React, { useContext, useEffect } from "react";
import { StoreContext } from "src/components/App";
import PropTypes from 'prop-types';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import "./style.scss";
import Message from './message';
import { observer } from "mobx-react";
import { SfuProxy } from "src/client";
import { Client, Signal } from "ion-sdk-js";

const ChatFeed = () => {
    const { 
      messages,
      setMessages,
      inputMessage,
      loginInfo
  } = useContext(StoreContext).ionStore;

  const _renderGroup = (index, id) => {
    let group = []

    for (let i = index; messages[i] ? messages[i].id == id : false; i--) {
      group.push(messages[i])
    }

    var message_nodes = group.reverse().map((curr, index) => {
      return (
        <ChatBubble
          key={Math.random().toString(36)}
          message={curr}
        />
      )
    })
    return (
      <div key={Math.random().toString(36)} className='chatbubble-wrapper'>
        {message_nodes}
      </div>
    )
  }


  const _renderMessages = () => {
    var message_nodes = messages.map((curr: Message, index) => {
      if (
        (messages[index + 1] ? false : true) ||
        messages[index + 1].id != curr.id
      ) {
        return _renderGroup(index, curr.id)
      }
    })
    return message_nodes
  }

  // monitor sendMessage

  useEffect(() => {
    console.log('Send message:' + inputMessage);
    var info = {
      "senderName": loginInfo.displayName,
      "msg": inputMessage,
    };
    let client: Client = SfuProxy.getInstance().getDefaultClient();
    // this.client.broadcast(info);
    let uid = 0;
    setMessages(new Message({ id: uid, message: inputMessage, senderName: 'me' }))
  }, [inputMessage])

  return (
    <div id="chat-panel" className='chat-panel'>
        <div className='title-panel'>
          <span className='title-chat'>Chat</span>
        </div>

        <div ref="chat" className='chat-history'>
          <div>
            {_renderMessages()}
          </div>
        </div>
        <ChatInput />
      </div>
  );
}

export default observer(ChatFeed)
