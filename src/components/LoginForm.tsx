import React, { FC, useContext, useState, useEffect, useRef, MutableRefObject } from "react";
import Center from 'react-center';
import { observer } from "mobx-react";
import { Form, Input, Button, Checkbox, notification, Avatar, Badge, Tooltip } from "antd";
import Icon from '@ant-design/icons';
import { reactLocalStorage } from "reactjs-localstorage";
import { StoreContext } from "src/components/App";
// icon and css
import "../styles/css/login.scss";
import CheckIcon from "mdi-react/CheckIcon";
import ShuffleIcon from "mdi-react/ShuffleIcon";
import NetworkIcon from "mdi-react/NetworkIcon";
import ServerNetworkIcon from "mdi-react/ServerNetworkIcon";
import GoogleClassroomIcon from "mdi-react/GoogleClassroomIcon";
import ProgressClockIcon from "mdi-react/ProgressClockIcon";
import ProgressAlertIcon from "mdi-react/ProgressAlertIcon";
import ProgressCloseIcon from "mdi-react/ProgressCloseIcon";
import VideoCheckIcon from "mdi-react/VideoCheckIcon";
import UploadLockIcon from "mdi-react/UploadLockIcon";
import SwapVerticalIcon from "mdi-react/SwapVerticalIcon";
import DownloadLockIcon from "mdi-react/DownloadLockIcon";

import { getRequest } from "src/utils";
import { SfuProxy } from "src/client";
import * as Ion from "ion-sdk-js";
import _ from "lodash";
import { StepStateMap } from "src/types";
import { parse, write, MediaAttributes } from 'sdp-transform';

const TEST_STEPS: StepStateMap = {
  "biz": { title: 'Biz Websocket', icon: <ServerNetworkIcon />, status: "pending" },
  "lobby": { title: 'Joining Test Room', icon: <GoogleClassroomIcon />, status: "pending" },
  "publish": { title: 'Publish', icon: <UploadLockIcon />, status: "pending" },
  "subscribe": { title: 'Subscription', icon: <DownloadLockIcon />, status: "pending" },
};

const ICONS = {
  connected: CheckIcon,
  ok: CheckIcon,
  pending: ProgressClockIcon,
  warning: ProgressAlertIcon,
  "no candidates": ProgressAlertIcon,
  error: ProgressCloseIcon,
  joined: CheckIcon,
  published: CheckIcon,
  subscribed: CheckIcon,
};

const ConnectionStep = ({ step }) => {
  const color = (
    step.status === 'pending' ? null :
      step.status === 'warning' || step.status === 'no candidates' ? 'orange' :
        step.status === 'error' ? 'red' :
          'green');
  const Icon = ICONS[step.status];

  return (<div className='test-connection-step'>
    <Badge count={Icon ? <Icon style={{ color }} /> : null}>
      <Tooltip title={
        <>{step.title}
          {step.status ? ": " + step.status : null}
          {step.info ? <div>{step.info}</div> : null}</>}
      >
        <Avatar shape="square" size="large" icon={step.icon} />
      </Tooltip>
    </Badge>
  </div>);
};


const LoginForm = () => {

  const {
    loading, setLoading
  } = useContext(StoreContext).ionStore;

  let testUpdateLoop = null;
  let form: any = useRef();
  let signalProxy: SfuProxy = null;

  const [testState, setTestState] = useState({
    steps: TEST_STEPS
  })

  const [runTest, setRunTest] = useState({
    testing: false,
    success: false,
  });

  const [loginFiled, setLoginFiled] = useState({
    roomId: 'IconTest',
    displayName: 'Guest',
    audioOnly = false
  })

  useEffect(() => {

    let localStorage = reactLocalStorage.getObject("loginInfo");
    if (localStorage) {
      setLoginFiled({
        roomId: localStorage.roomId,
        displayName: localStorage.displayName,
        audioOnly = localStorage.audioOnly
      })
      console.log(`localStorage: ${loginFiled.roomId} ${loginFiled.displayName}`);
    }

    const params: any = getRequest();
    if (params && params.hasOwnProperty('room')) {
      setLoginFiled({
        ...loginFiled,
        roomId: params.room
      });
    }

  }, []);


  const _handleSubmit = (values) => {
    setLoading(true);
    signalProxy = SfuProxy.getInstance();
    const client: Ion.Client = signalProxy.getClient();


    signalProxy.getSfuSignal().onclose = (event: Event) => {

    }

    signalProxy.getSfuSignal().onerror = (error: Event) => {

    }

    signalProxy.getSfuSignal().onopen = () => {
      _testStep('biz', 'connected', signalProxy && signalProxy.getUrl());
      _testStep('lobby', 'pending');
      const rid = 'lobby-' + Math.floor(1000000 * Math.random());
      await client.join(rid, 'lobby-user');
      _testStep('lobby', 'joined', 'room id=' + rid);
      const localStream = await Ion.LocalStream.getUserMedia({
        codec: 'vp9',
        resolution: 'hd',
        audio: true,
        video: true,
      });

      _testStep('publish', 'pending');
      client.publish(localStream);
      _testStep('publish', 'no candidates');
      client.ontrack = (track: MediaStreamTrack, stream: Ion.RemoteStream) => {
        _testStep('publish', 'published', "info");
        _testStep('subscribe', 'subscribed', 'mid: ');
      };
    };

    // set client event callback
    client.onspeaker = (events: string[]) => {

      // const id = event.id
      // const meta = event.meta
      // const info = event.jsonrpc
      // const params = event.params
      // if (event.method == "peer-join") {
      //   this._notification("Peer Join", "peer => " + info.name + ", join!");
      //   this._onSystemMessage(info.name + ", join!");
      // } else if (event.method == "peer-leave") {
      //   this._notification("Peer Leave", "peer => " + id + ", leave!");
      //   this._onSystemMessage(info.name + ", leave!");
      // }

    };
  };

  const _validField = (errorInfo: any) => {
    notification.info({
      message: "please check your input",
      description: errorInfo,
      placement: "bottomRight"
    });
  };

  const _testStep = (step: string, status: string, info: string = null) => {
    const prior = testState.steps[step];
    setTestState({
      steps: {
        ...testState.steps,
        [step]: { ...prior, status, info }
      }
    });
    console.log('Test Connection:', step, status, info);
  }

  const _cleanup = async () => {
    const client: Ion.Client = signalProxy.getClient();
    await client.close();
  };

  window.onunload = async () => {
    await _cleanup()
  }

  const _testConnection = async () => {
    setRunTest({
      ...runTest,
      testing: true,
    })
    _testStep('biz', 'pending');
  };

  return (
    <>
      <Form
        ref={form}
        onFinish={_handleSubmit}
        onFinishFailed={_validField}
        className="login-form"
        initialValues={{ audioOnly: 'true' }} >
        <Form.Item name="roomId" rules={[{ required: true, message: "Please enter your room Id!" }]}>
          <Input
            prefix={<Icon type="team" className="login-input-icon" />}
            placeholder="Room Id"
          />
        </Form.Item>
        <Form.Item name="displayName" rules={[{ required: true, message: "Please enter your Name!" }]}>
          <Input
            prefix={
              <Icon type="contacts" className="login-input-icon" />
            }
            placeholder="Display Name"
          />
        </Form.Item>
        <Form.Item name="audioOnly" valuePropName='checked'>
          <Checkbox >
            Audio only
        </Checkbox>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-join-button">
            Join
        </Button>
        </Form.Item>
      </Form>
      <Center>
        {runTest.testing ?
          <>
            <ConnectionStep step={testState.steps.biz} />
            <ConnectionStep step={testState.steps.lobby} />
            <ConnectionStep step={testState.steps.publish} />
            <ConnectionStep step={testState.steps.subscribe} />
          </>
          : <Button onClick={() => _testConnection()}>Test Connection</Button>
        }
      </Center>
    </>
  );

};

export default observer(LoginForm);
