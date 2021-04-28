import React, { FC, useEffect, useState, useContext } from "react";
import { Spin, notification } from "antd";
import { LocalVideoView, MainVideoView, SmallVideoView } from "../videoview";
import { observer } from "mobx-react";
import { SfuProxy } from "src/client";
import * as Ion from "src/sdk";
import { StoreContext } from "src/components/App";
import { Stream } from "src/types";
import "styles/css/conference.scss";
import _ from "lodash";

const Conference: FC<{}> = () => {

  const client: Ion.Client = SfuProxy.getInstance().getDefaultClient();

  const {
    localAudioEnabled,
    localVideoEnabled,
    screenSharingEnabled,
    setting,
    loginInfo
  } = useContext(StoreContext).ionStore;

  const [streams, setStreams] = useState<Stream[]>([])
  const [localStream, setLocalStream] = useState<Ion.LocalStream>(null)
  const [localScreen, setLocalScreen] = useState<Ion.LocalStream>(null)
  const [audioMuted, setAudioMuted] = useState<boolean>(false)
  const [videoMuted, setVideoMuted] = useState<boolean>(false)

  useEffect(() => {
    client.ontrack = (track: MediaStreamTrack, stream: Ion.RemoteStream) => {
      _handleAddStream({
        stream_id: stream.id,
        track_id: track.id, 
        stream, track
      })
      setStreams(_.concat([], ...streams, {
        stream_id: stream.id,
        track_id: track.id, 
        stream, track
      }))
    }
    return () => {
      _cleanUp()
    }
  }, [])

  const _cleanUp = async () => {
    streams.map(async (item: Stream) => {
      item.track.stop();
    });
    setStreams([])
    await _unpublish(localStream)
    await _unpublish(localScreen)
    setLocalStream(null)
    setLocalScreen(null)
  };

  const _handleAddStream = async (stream: Stream) => {
    let remote_stream = stream.stream as Ion.RemoteStream
    if (stream.track.kind === "video") {
      remote_stream.preferLayer("medium")
    }
    setStreams(_.concat([], ...streams, stream))
  };

  const _handleRemoveStream = async (stream: Stream) => {
    stream.track.stop();
    let streams_filtered = streams.filter(item => item.stream_id !== stream.stream_id);
    setStreams(streams_filtered)
  };

  const _muteMediaTrack = (type, enabled) => {
    if (!localStream) {
      return
    }
    if (enabled) {
      localStream.unmute(type)
    } else {
      localStream.mute(type)
    }
    if (type === "audio") {
      setAudioMuted(!enabled)
    } else if (type === "video") {
      setVideoMuted(!enabled)
    }
  };

  useEffect(() => {
    _muteMediaTrack("audio", localAudioEnabled);
  }, [localAudioEnabled])


  const _handleLocalStream = async (enabled) => {
    console.log(setting)
    try {
      if (enabled) {
        setLocalStream(await Ion.LocalStream.getUserMedia({
          codec: setting.codec.toUpperCase(),
          resolution: setting.resolution,
          audio: true,
          video: true,
        }));
        await client.publish(localStream);
      } else {
        if (localStream) {
          _unpublish(localStream);
          setLocalStream(null)
        }
      }
      console.log("local stream", localStream.getTracks())
    } catch (e) {
      console.log("handleLocalStream error => " + e);
      // this._notification("publish/unpublish failed!", e);
    }
  };

  useEffect(() => {
    _handleLocalStream(localVideoEnabled)
    _muteMediaTrack("video", localVideoEnabled);
  }, [localVideoEnabled])


  const _handleScreenSharing = async enabled => {
    if (enabled) {
      setLocalScreen(await Ion.LocalStream.getDisplayMedia({
        codec: setting.codec.toUpperCase(),
        resolution: setting.resolution,
      }));
      client.publish(localScreen);
      let track = localScreen.getVideoTracks()[0];
      if (track) {
        track.addEventListener("ended", () => {
          _handleScreenSharing(false);
        });
      }
    } else {
      if (localScreen) {
        _unpublish(localScreen);
        setLocalScreen(null)
      }
    }
  };

  useEffect(() => {
    _handleScreenSharing(screenSharingEnabled)
  }, [screenSharingEnabled])

  const _stopMediaStream = async (stream) => {
    let tracks = stream.getTracks();
    for (let i = 0, len = tracks.length; i < len; i++) {
      await tracks[i].stop();
    }
  };

  const _unpublish = async stream => {
    if (stream) {
      await _stopMediaStream(stream);
      await stream.unpublish();
    }
  };

  const _onChangeVideoPosition = data => {
    let id = data.id;
    let index = data.index;
    console.log("_onChangeVideoPosition id:" + id + "  index:" + index);

    if (index == 0) {
      return;
    }

    let first = 0;
    let big = 0;
    for (let i = 0; i < streams.length; i++) {
      let item = streams[i];
      if (item.stream_id == id) {
        big = i;
        break;
      }
    }

    let c = streams[first];
    streams[first] = streams[big];
    streams[big] = c;

    setStreams(streams)
  };

  const getMainVideoView = () => {

    if (streams.length === 0) {
      return (
        <div className="conference-layout-wating">
          <Spin size="large" tip="Wait for other people joining ..." />
        </div>
      )
    }

    let main_view: Stream = streams[0]
    return (
      <MainVideoView id={main_view.stream_id} stream={main_view.stream} />
    )
  }

  return (
    <div className="conference-layout">
      {getMainVideoView()}
      {localStream && (
        <div className="conference-local-video-layout">
          <LocalVideoView
            id={loginInfo.displayName + "-video"}
            label="Local Stream"
            stream={localStream}
            audioMuted={audioMuted}
            videoMuted={videoMuted}
            videoType="localVideo"
          />
        </div>
      )}
      {localScreen && (
        <div className="conference-local-screen-layout">
          <LocalVideoView
            id={loginInfo.displayName + "-screen"}
            label="Screen Sharing"
            stream={localScreen}
            audioMuted={false}
            videoMuted={false}
            videoType="localScreen"
          />
        </div>
      )}
      <div className="small-video-list-div">
        <div className="small-video-list">
          {streams.map((item: Stream, index) => {
            return index > 0 ? (
              <SmallVideoView
                id={item.stream_id}
                stream={item.stream}
                videoCount={streams.length}
                index={index}
                onClick={_onChangeVideoPosition}
              />
            ) : (
              <div />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default observer(Conference);