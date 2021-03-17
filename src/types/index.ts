import { ReactNode } from 'react';

export interface Setting {
    selectedAudioDevice: string,
    selectedVideoDevice: string,
    resolution: string,
    bandwidth: number,
    codec: "vp8" | "vp9" | "hd264",
    isDevMode: boolean,
}

export interface StepStateMap {
    [key: string]: StepState
}

export interface StepState {
    title: string,
    icon: ReactNode,
    status: string,
    info?: string,
}

export interface InputDevices {
    videoDevices: MediaDeviceInfo[],
    audioDevices: MediaDeviceInfo[],
    audioOutputDevices: MediaDeviceInfo[],
}

export interface LoginInfo {
    displayName: string,
    roomId: string,
    audioOnly: boolean,
}

export interface Stream {
    stream_id: string,
    track_id: string,
    stream: MediaStream,
    track: MediaStreamTrack
}

export interface MainVideoProps {
    id: string,
    stream: MediaStream,
}

export interface LocalVideoProps extends MainVideoProps {
    label: string,
    audioMuted: boolean,
    videoMuted: boolean,
    videoType: string,
}

export interface SmallVideoProps extends MainVideoProps {
    videoCount: number,
    index: number,
    onClick: ({ id: string, index: number }) => void
}

export interface Message {
    id: string,
    message: string,
    senderName: string
}
