import React, { FC, useContext, useState, useEffect, useCallback } from "react";
import Center from 'react-center';
import { observer } from "mobx-react";
import { Form, Input, Button, Checkbox, Avatar, Badge, Tooltip } from "antd";
import Icon from '@ant-design/icons';
import { reactLocalStorage } from "reactjs-localstorage";
import { StoreContext } from "src/components/App";
// icon and css
import "styles/css/login.scss";
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

import { getRequest, notifyMessage } from "src/utils";
import { SfuProxy } from "src/client";
import { Client, LocalStream, RemoteStream, Constraints, Signal, Trickle  } from "src/sdk";
import { PeerEvent, StreamEvent  } from "src/sdk/ion";
import _, { stubTrue } from "lodash";
import { StepStateMap, LoginInfo } from "src/types";
import { parse, write, MediaAttributes } from 'sdp-transform';

let TEST_STEPS: StepStateMap = {
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
  const IconClass = ICONS[step.status];

  return (<div className='test-connection-step'>
    <Badge count={IconClass ? <Icon component={IconClass} style={{ color }} /> : null}>
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
    setLoading,
    loginSuccessful,
    loginInfo,
    setLoginInfo
  } = useContext(StoreContext).ionStore;

  let signalProxy: SfuProxy = null;

  useEffect(() => {
    // initial parameters
    let localStorage = reactLocalStorage.getObject("loginInfo");
    if (localStorage) {
      setLoginInfo({
        roomId: localStorage.roomId,
        displayName: localStorage.displayName,
        audioOnly: localStorage.audioOnly
      })
      console.log(`localStorage: ${loginInfo.roomId} ${loginInfo.displayName}`);
    }

    const params: any = getRequest();
    if (params && params.hasOwnProperty('room')) {
      setLoginInfo({
        ...loginInfo,
        roomId: params.room
      });
    }

    signalProxy = SfuProxy.getInstance();

  }, []);

  const [testState, setTestState] = useState({
    steps: {
      "biz": { title: 'Biz Websocket', icon: <ServerNetworkIcon />, status: "pending" },
      "lobby": { title: 'Joining Test Room', icon: <GoogleClassroomIcon />, status: "pending" },
      "publish": { title: 'Publish', icon: <UploadLockIcon />, status: "pending" },
      "subscribe": { title: 'Subscription', icon: <DownloadLockIcon />, status: "pending" },
    }
  })

  const [runTest, setRunTest] = useState({
    testing: false,
    signalSuccess: false,
  });

  const _handleSubmit = async (values) => {
    if (runTest.signalSuccess) {
      loginSuccessful(true, false, values, !values.audioOnly);
    } else {
      notifyMessage("Signal Connect", "Do not connect the Signal, please test the connection.")
    }
  }

  const _testConnection = () => {

    const _testStep = (step: string, status: string, info: string = null) => {
      const prior = testState.steps[step];
      let new_status = { ...prior, status, info }
      let test_state = {
        steps: {
          ...testState.steps, [step]: new_status
        }
      }
      setTestState(test_state);
      console.log('Test Connection:', step, status, info);
    }


    if (!signalProxy) {
      notifyMessage("Signal Connect", "Not found Signal server, please check configuration.")
    }

    setRunTest({
      signalSuccess: false,
      testing: true,
    })

    // setLoading(true);
    const rid = 'lobby-' + Math.floor(1000000 * Math.random());
    let client = signalProxy.createNewClient();

    client.onclose = (event: Event) => {
      // setLoading(false)
      notifyMessage("Signal Connect", "Connection closed!")
    };

    client.onerror = (error: Error) => {
      // setLoading(false)
      notifyMessage("Signal Connect", `Connection error!: ${error.message}`)
    };

    client.onopen = () => {
      // setLoading(false)
      _testStep('biz', 'connected', signalProxy && signalProxy.getUrl());
    };

    const _testPublish = async () => {
      _testStep('publish', 'pending');
      try {
        const localStream = await LocalStream.getUserMedia({
          codec: 'vp8',
          resolution: 'hd',
          audio: true,
          video: true,
        });
        client.sfu.publish(localStream);
        _testStep('publish', 'no candidates');
      } catch (e) {
        console.log("Get local stream error => " + e);
        _testStep('publish', 'error');
      }
    }

    client.onjoin = (success: boolean, reason: string) => {
      if (success) {
        _testStep('lobby', 'joined', 'room id=' + rid);
        setTimeout(_testPublish, 2000);
      }
    };

    client.ontrack = async (track: MediaStreamTrack, stream: RemoteStream) => {
      _testStep('publish', 'published', "info");
      _testStep('subscribe', 'subscribed', 'mid: ');
      let leave_response = await client.leave('lobby-user');
      client = null;
      setRunTest({
        signalSuccess: true,
        testing: false,
      })
      client.close()
    };

    client.onleave = (reason: string) => {
      notifyMessage("Biz leave", `${reason}`)
    }

    client.onpeerevent = (ev: PeerEvent) => {
      notifyMessage("Biz peer event", `${ev.peer.uid}`)
    }

    client.onstreamevent = (ev: StreamEvent) => {
      notifyMessage("Biz peer event", `${ev.uid}`)
    }

    client.ondatachannel = (ev: RTCDataChannelEvent) => {
      notifyMessage("Biz data channel", `${ev.returnValue}`)
    }

    client.onspeaker = (ev: string[]) => {
      notifyMessage("Biz speaker", `${_.join(ev, ",")}`)
    }

    let join_response = client.join(rid, 'lobby-user', new Map<string, any>(), undefined);
    let flag = 1
  };

  const _validField = (errorInfo: any) => {
    notifyMessage("Signal Connect", `Please check your input, error: ${errorInfo}`);
  }

  return (
    <>
      <Form
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
