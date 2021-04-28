import { Layout, Modal, Card, Spin } from "antd";
const { confirm } = Modal;
const { Footer } = Layout;
import { reactLocalStorage } from "reactjs-localstorage";
import "styles/css/app.scss";
import { observer } from "mobx-react";
import { StoreContext } from "src/components/App";
import IonHeader from "./Header";
import IonRoom from "../room";
import LoginForm from "./LoginForm";
import React, { useContext, useEffect, useState, useRef } from "react";
import { Setting } from 'src/types';
import { notifyMessage } from 'src/utils';
import { SfuProxy } from "src/client";
import * as Ion from "src/sdk";
import _ from "lodash";


const useUnload = (fn) => {
  const cb = useRef(fn);
  useEffect(() => {
    const onUnload = cb.current;
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [cb]);
};

const ContentLayout = () => {

  const {
    login,
    setSetting,
    loading,
    messages,
    loginInfo,
    setMessages,
  } = useContext(StoreContext).ionStore;

  let client: Ion.Client = SfuProxy.getInstance().getDefaultClient();

  useEffect(() => {
    let settings: Setting = reactLocalStorage.getObject("settings");
    setSetting(settings);
  }, []);

  useEffect(() => {
    if (login) {
      const signalProxy = SfuProxy.getInstance()
      const signal = signalProxy.getSfuSignal();
      signal.onclose = (event: Event) => {
        notifyMessage("Signal Connect", "Connection closed!")
      };
      signal.onopen = () => {
        notifyMessage("Signal Connect", "Connection open!")
      };
      // signal.onmessage("peer-join", (id, info) => {
      //   notifyMessage("Peer Join", "peer => " + info.name + ", join!");
      //   _onSystemMessage(info.name + ", join!")
      // });

      // signal.onmessage("peer-leave", (id) => {
      //   notifyMessage("Peer Leave", "peer => " + id + ", leave!");
      //   _onSystemMessage(info.name + ", leave!")
      // });
      // signal.onmessage("stream-add", (id, info) => {
      //   notifyMessage("Peer Leave", "peer => " + id + ", leave!");
      //   _onSystemMessage(info.name + ", leave!")
      // });
      // signal.onmessage("stream-remove", (id, info) => {
      //   notifyMessage("Peer Leave", "peer => " + id + ", leave!");
      //   _onSystemMessage(info.name + ", leave!")
      // });
      client.join(loginInfo.roomId, loginInfo.displayName).then(() => {

      });
      client.onspeaker = (ev: string[]) => {
        _.map(ev, message => notifyMessage("Client message", message))
      }
      // client.on("broadcast", (mid, info) => {
      //   console.log("broadcast %s,%s!", mid, info);
      //   this._onMessageReceived(info);
      // });
      client.ondatachannel = (ev: RTCDataChannelEvent) => { }


    } else {
      // remove client resouce
      _cleanUp()
    }
  }, [login]);

  const _onSystemMessage = (msg) => {
    let uid = 2;
    setMessages({ id: uid.toString(), message: msg, senderName: 'System' });
  }

  const _cleanUp = async () => {
    client.leave();
  };

  useUnload(event => {
    _cleanUp();
  });


  return (
    <Layout className="app-layout">
      <IonHeader />
      <Content className="app-center-layout">
        {login ? (
          <IonRoom />
        ) : loading ? (
          <Spin size="large" tip="Connecting..." />
        ) : (
          <Card title="Join to Ion" className="app-login-card">
            <LoginForm />
          </Card>
        )}
      </Content>
      {!login && (
        <Footer className=".app-footer">
          Powered by{" "}
          <a href="https://pion.ly" target="_blank">
            Pion
          </a>{" "}
          WebRTC.
        </Footer>
      )}
    </Layout>
  );
};

export default observer(ContentLayout);
