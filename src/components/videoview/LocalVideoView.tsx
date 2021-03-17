import React, { FC, useEffect, useRef, useState, MutableRefObject } from "react";
import MicrophoneOffIcon from "mdi-react/MicrophoneOffIcon";
import VideocamOffIcon from "mdi-react/VideocamOffIcon";
import { Avatar, Button } from 'antd';
import PictureInPictureBottomRightOutlineIcon from "mdi-react/PictureInPictureBottomRightOutlineIcon";
import { LocalVideoProps } from "src/types";

const LocalVideoView: FC<LocalVideoProps> = (props) => {

  const [minimize, setMinimize] = useState(false)

  let videoRef: MutableRefObject<HTMLVideoElement | null> = useRef()

  useEffect(() => {
    videoRef.current!.srcObject = props.stream
    return () => {
      videoRef.current!.srcObject = null
    }
  }, [videoRef])

  return (
    <div className="local-video-container" style={{ borderWidth: `${minimize ? '0px' : '0.5px'}` }}>
      <video
        ref={videoRef}
        id={props.id}
        autoPlay
        playsInline
        muted={true}
        className="local-video-size"
        style={{ display: `${minimize ? 'none' : ''}` }}
      />
      <div className={`${minimize && props.videoType == "localVideo" ?
        'local-video-min-layout' : 'local-video-icon-layout'}`}>
        {!minimize && props.audioMuted && <MicrophoneOffIcon size={18} color="white" />}
        {!minimize && props.videoMuted && <VideocamOffIcon size={18} color="white" />}

        <Button
          ghost
          size="small"
          type="link"
          onClick={() => setMinimize(!minimize)}
        >
          <PictureInPictureBottomRightOutlineIcon
            size={18}
          />
        </Button>

      </div>
      {
        props.videoMuted ?
          <div className="local-video-avatar" style={{ display: `${minimize ? 'none' : ''}` }}>
            <Avatar size={64} icon="user" />
          </div>
          : ""
      }
      <a className="local-video-name" style={{ display: `${minimize ? 'none' : ''}` }}>{props.label}</a>
    </div>
  );

}

export default LocalVideoView
