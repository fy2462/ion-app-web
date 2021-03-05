import React, { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react";
import { reactLocalStorage } from "reactjs-localstorage";
import { Layout, Button, Modal, notification, Tooltip } from "antd";
import Icon from '@ant-design/icons';
const { confirm } = Modal
const { Header } = Layout;
import { StoreContext } from "src/components/App";
import ToolShare from '../ToolShare';
import MediaSettings from '../settings';
// icon
import MicrophoneIcon from "mdi-react/MicrophoneIcon";
import MicrophoneOffIcon from "mdi-react/MicrophoneOffIcon";
import VideoIcon from "mdi-react/VideoIcon";
import VideocamOffIcon from "mdi-react/VideocamOffIcon";
import HangupIcon from "mdi-react/PhoneHangupIcon";
import TelevisionIcon from "mdi-react/TelevisionIcon";
import TelevisionOffIcon from "mdi-react/TelevisionOffIcon";
// assets
import pionLogo from 'assets/images/pion-logo.svg';
import "styles/css/app.scss";

const IonHeader = () => {

    const {
        login,
        localAudioEnabled,
        localVideoEnabled,
        screenSharingEnabled,
        setLocalAudioEnabled,
        setLocalVideoEnabled,
        setLoginInfo,
        setScreenSharingEnabled,
        setLogin,
        loginSuccessful
    } = useContext(StoreContext).ionStore;

    const _handleAudioTrackEnabled = enabled => {
        setLocalAudioEnabled(enabled);
        this.conference.muteMediaTrack("audio", enabled);
    };

    const _handleVideoTrackEnabled = enabled => {
        setLocalVideoEnabled(enabled);
        this.conference.muteMediaTrack("video", enabled);
    };

    const _notification = (message, description) => {
        notification.info({
            message: message,
            description: description,
            placement: 'bottomRight',
        });
    };

    const _cleanUp = async () => {
        await this.conference.cleanUp();
        await this.client.leave();
    };

    const _handleTransportOpen = async (values) => {
        setLoginInfo()
        reactLocalStorage.remove("loginInfo");
        reactLocalStorage.setObject("loginInfo", values);
        // await this.client.join(values.roomId, { name: values.displayName });

        loginSuccessful(true, false, values, !values.audioOnly);
        _notification(
            "Connected!",
            "Welcome to the ion room => " + values.roomId
        );
        await this.conference.handleLocalStream(true);
    }

    const _handleScreenSharing = enabled => {
        setScreenSharingEnabled(enabled);
        this.conference.handleScreenSharing(enabled);
    };

    const _handleLeave = async () => {
        confirm({
            title: "Leave Now?",
            content: "Do you want to leave the room?",
            async onOk() {
                console.log("OK");
                await _cleanUp();
                setLogin(false);
            },
            onCancel() {
                console.log("Cancel");
            }
        });
    };

    return (
        <Header className="app-header">
            <div className="app-header-left">
                <a href="https://pion.ly" target="_blank">
                    <img src={pionLogo} className="app-logo-img" />
                </a>
            </div>
            {login ? (
                <div className="app-header-tool">
                    <Tooltip title='Mute/Cancel'>
                        <Button
                            ghost
                            size="large"
                            style={{ color: localAudioEnabled ? "" : "red" }}
                            type="link"
                            onClick={() => _handleAudioTrackEnabled(!localAudioEnabled)}
                        >
                            <Icon
                                component={
                                    localAudioEnabled ? MicrophoneIcon : MicrophoneOffIcon
                                }
                                style={{ display: "flex", justifyContent: "center" }}
                            />
                        </Button>
                    </Tooltip>
                    <Tooltip title='Open/Close video'>
                        <Button
                            ghost
                            size="large"
                            style={{ color: localVideoEnabled ? "" : "red" }}
                            type="link"
                            onClick={() =>
                                _handleVideoTrackEnabled(!localVideoEnabled)
                            }
                        >
                            <Icon
                                component={localVideoEnabled ? VideoIcon : VideocamOffIcon}
                                style={{ display: "flex", justifyContent: "center" }}
                            />
                        </Button>
                    </Tooltip>
                    <Tooltip title='Hangup'>
                        <Button
                            shape="circle"
                            ghost
                            size="large"
                            type="danger"
                            style={{ marginLeft: 16, marginRight: 16 }}
                            onClick={_handleLeave}
                        >
                            <Icon
                                component={HangupIcon}
                                style={{ display: "flex", justifyContent: "center" }}
                            />
                        </Button>
                    </Tooltip>
                    <Tooltip title='Share desktop'>
                        <Button
                            ghost
                            size="large"
                            type="link"
                            style={{ color: screenSharingEnabled ? "red" : "" }}
                            onClick={() => _handleScreenSharing(!screenSharingEnabled)}
                        >
                            <Icon
                                component={
                                    screenSharingEnabled ? TelevisionOffIcon : TelevisionIcon
                                }
                                style={{ display: "flex", justifyContent: "center" }}
                            />
                        </Button>
                    </Tooltip>
                    <ToolShare />
                </div>
            ) : (
                <div />
            )}
            <div className="app-header-right">
                <MediaSettings />
            </div>
        </Header>
    );
};

export default observer(IonHeader);
