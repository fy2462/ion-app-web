import React, { FC, MutableRefObject, useRef, useContext, useEffect, useState } from "react";
import { SmallVideoProps } from "src/types";

const SmallVideoView: FC<SmallVideoProps> = (props) => {

  let videoRef: MutableRefObject<HTMLVideoElement | null> = useRef()

  const [ offset, setOffset ] = useState({
    clientWidth: document.body.offsetWidth,
    clientHeight: document.body.offsetHeight
  })

  useEffect(() => {
    videoRef.current!.srcObject = props.stream
    return () => {
      videoRef.current!.srcObject = null
    }
  }, [videoRef])

  return (
    <div onClick={() => { props.onClick({ id: props.id, index: props.index}) }} className="small-video-div">
      <video
        ref={videoRef}
        id={props.id}
        autoPlay
        playsInline
        muted={false}
        className="small-video-size"
      />
      <div className="small-video-id-div">
        <a className="small-video-id-a">{props.id}</a>
      </div>
    </div>
  );

}

export default SmallVideoView;
