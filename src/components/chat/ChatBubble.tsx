import React, { Component } from 'react';
import { Icon } from 'antd';
import UserIcon from "mdi-react/UserIcon";

const ChatBubble = () => {

  const message: any = {}

  return (
    <div>
    { message.id == 1 ? (
      <div className = 'bubble-left' >
      <div className='bubble-head'>
        <Icon component={UserIcon} />
      </div>
      <div className='bubble-msg'>
        <p className="sender-name">{message.senderName}</p>
        <div className='bubble-msgword'>
          <p className='pl'>
            {this.props.message.message}
          </p>
        </div>
      </div>
    </div >
    ) : message.id == 0 ? (
      <div className='bubble-right'>
          <div className='bubble-msg'>
            <p style={{ textAlign: 'right' }} className="sender-name">{this.props.message.senderName}</p>
            <div className='bubble-msgword'>
              <p className='pr'>
                {this.props.message.message}
              </p>
            </div>
          </div>
          <div className='bubble-head'>
            <Icon component={UserIcon} />
          </div>
        </div>
    ) : message.id == 2 ? (
      <div className='bubble-middle'>
      <div className='bubble-msg'>
        <div className='bubble-msgword-middle'>
          <p className='pm'>
            {this.props.message.message}
          </p>
        </div>
      </div>
    </div>
    ) : (<div />)}
    </div>
  );
};

export default ChatBubble
