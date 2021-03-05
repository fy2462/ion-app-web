import { Layout, Modal, notification } from "antd";
const { confirm } = Modal;
const { Footer } = Layout;
import { reactLocalStorage } from "reactjs-localstorage";
import Message from '../chat/message';
import "styles/css/app.scss";
import { observer } from "mobx-react";
import { StoreContext } from "src/components/App";
import { IonHeader } from "./header";
import { IonContent } from "./content";
import React, { useContext, useEffect, useState } from "react";
import { Setting } from 'src/types';


const ContentLayout = () => {
  const { login, setSetting } = useContext(StoreContext).ionStore;

  useEffect(() => {
    let settings: Setting = reactLocalStorage.getObject("settings");
    setSetting(settings);
  }, []);

  return (
    <Layout className="app-layout">
      <IonHeader />
      <IonContent />
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


class App extends React.Component {


_cleanUp = async () => {
  await this.conference.cleanUp();
  await this.client.leave();
};

_notification = (message, description) => {
  notification.info({
    message: message,
    description: description,
    placement: 'bottomRight',
  });
};

_createClient = (signal: IonSFUJSONRPCSignal) => {
  let client = new Client(signal);
  // client.url = url;

  return client
}

localStorage.getItem();

_handleJoin = async values => {
  this.setState({ loading: true });

  let url = "wss://" + window.location.host;
  //for dev by scripts
  if (process.env.NODE_ENV == "development") {
    const proto = this._settings.isDevMode ? "ws" : "wss"
    url = proto + "://" + window.location.host;
  }
  const signal = new IonSFUJSONRPCSignal(url);

  let client = this._createClient(signal);

  window.onunload = async () => {
    await this._cleanUp();
  };

  client.onspeaker = (event: any) => {

    const id = event.id
    const meta = event.meta
    const info = event.jsonrpc
    const params = event.params
    if (event.method == "peer-join") {
      this._notification("Peer Join", "peer => " + info.name + ", join!");
      this._onSystemMessage(info.name + ", join!");
    } else if (event.method == "peer-leave") {
      this._notification("Peer Leave", "peer => " + id + ", leave!");
      this._onSystemMessage(info.name + ", leave!");
    }

  }

  client.on("peer-join", (id, info) => {
    this._notification("Peer Join", "peer => " + info.name + ", join!");
    this._onSystemMessage(info.name + ", join!");
  });

  client.on("peer-leave", (id) => {
    this._notification("Peer Leave", "peer => " + id + ", leave!");
    this._onSystemMessage(info.name + ", leave!");
  });

  client.on("transport-open", () => {
    console.log("transport open!");
    this._handleTransportOpen(values);
  });

  client.on("transport-closed", () => {
    console.log("transport closed!");
  });

  client.on("stream-add", (id, info) => {
    console.log("stream-add %s,%s!", id, info);
    this._notification(
      "Stream Add",
      "id => " + id + ", name => " + info.name
    );
  });

  client.on("stream-remove", (stream) => {
    console.log("stream-remove %s,%", stream.id);
    this._notification("Stream Remove", "id => " + stream.id);
  });

  client.on("broadcast", (mid, info) => {
    console.log("broadcast %s,%s!", mid, info);
    this._onMessageReceived(info);
  });

  this.client = client;
};

_handleTransportOpen = async (values) => {
  reactLocalStorage.remove("loginInfo");
  reactLocalStorage.setObject("loginInfo", values);
  await this.client.join(values.roomId, { name: values.displayName });
  this.setState({
    login: true,
    loading: false,
    loginInfo: values,
    localVideoEnabled: !values.audioOnly,
  });

  this._notification(
    "Connected!",
    "Welcome to the ion room => " + values.roomId
  );
  await this.conference.handleLocalStream(true);
}

_handleLeave = async () => {
  let client = this.client;
  let this2 = this;
  confirm({
    title: "Leave Now?",
    content: "Do you want to leave the room?",
    async onOk() {
      console.log("OK");
      await this2._cleanUp();
      this2.setState({ login: false });
    },
    onCancel() {
      console.log("Cancel");
    }
  });
};

_handleAudioTrackEnabled = enabled => {
  this.setState({
    localAudioEnabled: enabled
  });
  this.conference.muteMediaTrack("audio", enabled);
};

_handleVideoTrackEnabled = enabled => {
  this.setState({
    localVideoEnabled: enabled
  });
  this.conference.muteMediaTrack("video", enabled);
};

_handleScreenSharing = enabled => {
  this.setState({
    screenSharingEnabled: enabled
  });
  this.conference.handleScreenSharing(enabled);
};

_onRef = ref => {
  this.conference = ref;
};

_openOrCloseLeftContainer = collapsed => {
  this.setState({
    collapsed: collapsed
  });
};

_onVidFitClickHandler = () => {
  this.setState({
    vidFit: !this.state.vidFit
  });
};

_onFullScreenClickHandler = () => {
  let docElm = document.documentElement;

  if (this._fullscreenState()) {

    if (document.exitFullscreen) {
      document.exitFullscreen();
    }

    this.setState({ isFullScreen: false });

  } else {
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen();
    }

    this.setState({ isFullScreen: true });
  }
}

_fullscreenState = () => {
  return document.fullscreen || false;
}

_onMediaSettingsChanged = (selectedAudioDevice, selectedVideoDevice, resolution, bandwidth, codec, isDevMode) => {
  this._settings = { selectedAudioDevice, selectedVideoDevice, resolution, bandwidth, codec, isDevMode }
  reactLocalStorage.setObject("settings", this._settings);
}

_onMessageReceived = (data) => {
  console.log('Received message:' + data.senderName + ":" + data.msg);
  let messages = this.state.messages;
  let uid = 1;
  messages.push(new Message({ id: uid, message: data.msg, senderName: data.senderName }));
  this.setState({ messages });
}

_onSendMessage = (data) => {
  console.log('Send message:' + data);
  var info = {
    "senderName": this.state.loginInfo.displayName,
    "msg": data,
  };
  this.client.broadcast(info);
  let messages = this.state.messages;
  let uid = 0;
  messages.push(new Message({ id: uid, message: data, senderName: 'me' }));
  this.setState({ messages });
}

_onSystemMessage = (msg) => {
  let messages = this.state.messages;
  let uid = 2;
  messages.push(new Message({ id: uid, message: msg, senderName: 'System' }));
  this.setState({ messages });
}
