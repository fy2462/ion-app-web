import React, { useContext, useEffect, useRef, useState, createRef } from 'react';
import { Modal, Button, Select, Tooltip, Switch } from 'antd';
import SoundMeter from './soundmeter';
import PropTypes from 'prop-types';
import { observer } from "mobx-react";
import { reactLocalStorage } from "reactjs-localstorage";
import SettingsOutlineIcon from "mdi-react/SettingsOutlineIcon";
import Icon from '@ant-design/icons';

import "./style.scss";
import { StoreContext } from "src/components/App";
import { InputDevices } from "src/types";
import _ from 'lodash';

const Option = Select.Option;

const closeMediaStream = function (stream) {
    if (!stream) {
        return;
    }
    if (MediaStreamTrack && MediaStreamTrack.prototype && MediaStreamTrack.prototype.stop) {
        var tracks, i, len;

        if (stream.getTracks) {
            tracks = stream.getTracks();
            for (i = 0, len = tracks.length; i < len; i += 1) {
                tracks[i].stop();
            }
        } else {
            tracks = stream.getAudioTracks();
            for (i = 0, len = tracks.length; i < len; i += 1) {
                tracks[i].stop();
            }

            tracks = stream.getVideoTracks();
            for (i = 0, len = tracks.length; i < len; i += 1) {
                tracks[i].stop();
            }
        }
        // Deprecated by the spec, but still in use.
    } else if (typeof stream.stop === 'function') {
        console.log('closeMediaStream() | calling stop() on the MediaStream');
        stream.stop();
    }
}

// Attach a media stream to an element.
const attachMediaStream = function (element, stream) {
    element.srcObject = stream;
};

const MediaSettings = () => {

    let gStream = useRef<MediaStream>()
    let gSoundMeter = useRef<SoundMeter>()
    let gAudioContext = useRef<AudioContext>()

    const { setting, setSetting } = useContext(StoreContext).ionStore;

    const [currentSetting, setCurrentSetting] = useState({
        visible: false,
        videoDevices: [],
        audioDevices: [],
        audioOutputDevices: [],
        resolution: setting.resolution,
        bandwidth: setting.bandwidth,
        selectedAudioDevice: setting.selectedAudioDevice,
        selectedVideoDevice: setting.selectedVideoDevice,
        codec: setting.codec,
        isDevMode: setting.isDevMode,
    });

    const [audioLevel, setAudioLevel] = useState(0.0);

    try {
        window.AudioContext = window.AudioContext
        gAudioContext.current = new AudioContext();
    } catch (e) {
        console.log('Web Audio API not supported.');
    }


    const _setCurrentState = (state: any) => {
        setCurrentSetting({ ...currentSetting, ...state })
    }

    const updateInputDevices: () => Promise<InputDevices> = () => {
        return new Promise((pResolve, pReject) => {
            let videoDevices: MediaDeviceInfo[] = [];
            let audioDevices: MediaDeviceInfo[] = [];
            let audioOutputDevices: MediaDeviceInfo[] = [];
            const mediaDevices = navigator.mediaDevices as any;
            mediaDevices.enumerateDevices()
                .then((devices) => {
                    for (let device of devices) {
                        if (device.kind === 'videoinput') {
                            videoDevices.push(device);
                        } else if (device.kind === 'audioinput') {
                            audioDevices.push(device);
                        } else if (device.kind === 'audiooutput') {
                            audioOutputDevices.push(device);
                        }
                    }
                }).then(() => {
                    let devices: InputDevices = { videoDevices, audioDevices, audioOutputDevices };
                    pResolve(devices);
                });
        });
    }

    useEffect(() => {

        updateInputDevices().then((devices: InputDevices) => {

            let newSetting = {};

            if (currentSetting.selectedAudioDevice === "" && devices.audioDevices.length > 0) {
                _.assign(newSetting, {
                    selectedAudioDevice: devices.audioDevices[0].deviceId
                })
                console.log("Selected audioDevice::" + JSON.stringify(devices.audioDevices[0]));
            }
            if (currentSetting.selectedVideoDevice === "" && devices.videoDevices.length > 0) {
                _.assign(newSetting, {
                    selectedVideoDevice: devices.videoDevices[0].deviceId
                })
                console.log("Selected videoDevice::" + JSON.stringify(devices.videoDevices[0]));
            }

            _setCurrentState({
                ...newSetting,
                videoDevices: devices.videoDevices,
                audioDevices: devices.audioDevices,
                audioOutputDevices: devices.audioOutputDevices,
            })
        });

    }, []);


    const _handleOk = (e) => {
        console.log(e);
        _setCurrentState({ visible: false, })
        _stopPreview();
        setSetting({
            selectedAudioDevice: currentSetting.selectedAudioDevice,
            selectedVideoDevice: currentSetting.selectedVideoDevice,
            resolution: currentSetting.resolution,
            bandwidth: currentSetting.bandwidth,
            codec: currentSetting.codec,
            isDevMode: currentSetting.isDevMode,
        })
    }

    const _stopPreview = () => {
        if (gStream.current) {
            closeMediaStream(gStream.current);
        }
    }

    const _handleCancel = (e) => {
        _setCurrentState({ visible: false, })
        _stopPreview();
    }

    const _soundMeterProcess = () => {
        var val = parseFloat(((gSoundMeter.current.instant * 348) + 1).toFixed(2));
        setAudioLevel(val)
        if (currentSetting.visible)
            setTimeout(_soundMeterProcess, 100);
    }

    const _startPreview = () => {
        if (gStream.current) {
            closeMediaStream(gStream.current);
        }
        let videoElement = document.getElementById('previewVideo');
        let audioSource = currentSetting.selectedAudioDevice;
        let videoSource = currentSetting.selectedVideoDevice;
        gSoundMeter.current = new SoundMeter(gAudioContext.current);
        let constraints = {
            audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
            video: { deviceId: videoSource ? { exact: videoSource } : undefined }
        };
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (stream) {
                gStream.current = stream; // make stream available to console
                //videoElement.srcObject = stream;
                attachMediaStream(videoElement, stream);
                gSoundMeter.current.connectToSource(stream);
                setTimeout(_soundMeterProcess, 100);
                // Refresh button list in case labels have become available
                return navigator.mediaDevices.enumerateDevices();
            })
            .then((devces) => { })
            .catch((erro) => { });
    }

    const _showModal = () => {
        _setCurrentState({ visible: true })
        setTimeout(_startPreview, 100);
    }

    const _handleAudioDeviceChange = (e) => {
        _setCurrentState({ selectedAudioDevice: e })
        setTimeout(_startPreview, 100);
    }

    const _handleVideoDeviceChange = (e) => {
        _setCurrentState({ selectedVideoDevice: e })
        setTimeout(_startPreview, 100);

    }

    const _handleResolutionChange = (e) => {
        _setCurrentState({ bandwidth: e })
    }

    const _handleVideoCodeChange = (code) => {
        _setCurrentState({ bandwidth: code })
    }

    const _handleBandWidthChange = (e) => {
        _setCurrentState({ bandwidth: e })
    }

    const _handleDevChange = (checked) => {
        _setCurrentState({ isDevMode: checked })
    }


    return (
        <div>
            {
                <Tooltip title='System setup'>
                    <Button shape="circle" ghost onClick={_showModal} >
                        <Icon
                            component={SettingsOutlineIcon}
                            style={{ display: "flex", justifyContent: "center" }}
                        />
                    </Button>
                </Tooltip>
            }
            <Modal
                title='Settings'
                visible={currentSetting.visible}
                onOk={_handleOk}
                onCancel={_handleCancel}
                okText='Ok'
                cancelText='Cancel'>
                <div className="settings-item">
                    <span className="settings-item-left">DevMode</span>
                    <div className="settings-item-right">
                        <Switch checked={currentSetting.isDevMode} onChange={_handleDevChange} />
                    </div>
                </div>
                <div className="settings-item">
                    <span className="settings-item-left">Micphone</span>
                    <div className="settings-item-right">
                        <Select value={currentSetting.selectedAudioDevice} style={{ width: 350 }} onChange={_handleAudioDeviceChange}>
                            {
                                currentSetting.audioDevices.map((device, index) => {
                                    return (<Option value={device.deviceId} key={device.deviceId}>{device.label}</Option>);
                                })
                            }
                        </Select>
                        <div ref="progressbar" style={{
                            width: audioLevel + 'px',
                            height: '10px',
                            backgroundColor: '#8dc63f',
                            marginTop: '20px',
                        }}>
                        </div>
                    </div>
                </div>
                <div className="settings-item">
                    <span className="settings-item-left">Camera</span>
                    <div className="settings-item-right">
                        <Select value={currentSetting.selectedVideoDevice} style={{ width: 350 }} onChange={_handleVideoDeviceChange}>
                            {
                                currentSetting.videoDevices.map((device, index) => {
                                    return (<Option value={device.deviceId} key={device.deviceId}>{device.label}</Option>);
                                })
                            }
                        </Select>
                        <div className="settings-video-container">
                            <video id='previewVideo' ref='previewVideo' autoPlay playsInline muted={true} style={{ width: '100%', height: '100%', objectFit: 'contain' }}></video>
                        </div>

                    </div>
                </div>
                <div className="settings-item">
                    <span className="settings-item-left">Quality</span>
                    <div className="settings-item-right">
                        <Select style={{ width: 350 }} value={currentSetting.resolution} onChange={_handleResolutionChange}>
                            <Option value="qvga">QVGA(320x180)</Option>
                            <Option value="vga">VGA(640x360)</Option>
                            <Option value="shd">SHD(960x540)</Option>
                            <Option value="hd">HD(1280x720)</Option>
                        </Select>
                    </div>
                </div>
                <div className="settings-item">
                    <span className="settings-item-left">VideoCode</span>
                    <div className="settings-item-right">
                        <Select style={{ width: 350 }} value={currentSetting.codec} onChange={_handleVideoCodeChange}>
                            <Option value="h264">H264</Option>
                            <Option value="vp8">VP8</Option>
                            <Option value="vp9">VP9</Option>
                        </Select>
                    </div>
                </div>
                <div className="settings-item">
                    <span className="settings-item-left">Bandwidth</span>
                    <div className="settings-item-right">
                        <Select style={{ width: 350 }} value={currentSetting.bandwidth} onChange={_handleBandWidthChange}>
                            <Option value="256">Low(256kbps)</Option>
                            <Option value="512">Medium(512kbps)</Option>
                            <Option value="1024">High(1Mbps)</Option>
                            <Option value="4096">Lan(4Mbps)</Option>
                        </Select>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default observer(MediaSettings);
