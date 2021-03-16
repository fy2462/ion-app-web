import { ComponentType, ReactNode } from 'react';

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
