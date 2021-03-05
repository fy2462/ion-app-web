import React, { useContext } from "react";
import { StoreContext } from "src/components/App";
import PropTypes from 'prop-types';
import { Input, Button } from 'antd';


const ChatInput = () => {

  let inputMessage: string;

  const {
    setSendMessages
  } = useContext(StoreContext).ionStore;

  const _onInputChange = (event) => {
    inputMessage = event.target.value;
  }

  const _sendMessage = () => {
    let msg = inputMessage;
    if (msg.length === 0) {
      return;
    }
    if (msg.replace(/(^\s*)|(\s*$)/g, "").length === 0) {
      return;
    }
    setSendMessages(msg)
    inputMessage = ""
  }

  const _onInputKeyUp = (event) => {
    // enter
    if (event.keyCode == 13) {
      _sendMessage()
    }
  }


  return (
    <div className='chat-input'>
      <Input
        placeholder='Please input message'
        onChange={_onInputChange}
        onPressEnter={_onInputKeyUp} />
      <Button style={{ marginLeft: '4px', }} icon='message' onClick={(event) => {
        _sendMessage();
      }} />
    </div>
  );
};

export default ChatInput;
