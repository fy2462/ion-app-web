import React, { FC, MutableRefObject, useRef, useContext, useEffect } from "react";
import { StoreContext } from "src/components/App";
import { MainVideoProps } from "src/types";

const MainVideoView: FC<MainVideoProps> = (props) => {

  const { vidFit } = useContext(StoreContext).ionStore;

  let videoRef: MutableRefObject<HTMLVideoElement | null> = useRef()

  useEffect(() => {
    videoRef.current!.srcObject = props.stream
    return () => {
      videoRef.current!.srcObject = null
    }
  }, [videoRef])

  return (
    <div className="main-video-layout">
    <video
      ref={videoRef}
      id={props.id}
      autoPlay
      playsInline
      muted={false}
      className={"main-video-size " + (vidFit ? "fit-vid" : "")}
    />
    <div className="main-video-name">
      <a className="main-video-name-a">{props.id}</a>
    </div>
  </div>
  )
}

export default MainVideoView;
