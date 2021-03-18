import React, { FC, Component } from 'react';
import Icon from '@ant-design/icons';
import UserIcon from "@mdi/react";
import { Message } from 'src/types';

const ChatBubble: FC<{key: string, message: Message}> = (key, message) => {

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
            {message.message}
          </p>
        </div>
      </div>
    </div >
    ) : message.id == 0 ? (
      <div className='bubble-right'>
          <div className='bubble-msg'>
            <p style={{ textAlign: 'right' }} className="sender-name">{message.senderName}</p>
            <div className='bubble-msgword'>
              <p className='pr'>
                {message.message}
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
            {message.message}
          </p>
        </div>
      </div>
    </div>
    ) : (<div />)}
    </div>
  );
};

export default ChatBubble
