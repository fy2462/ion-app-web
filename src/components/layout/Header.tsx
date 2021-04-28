import React, { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react";
import { Layout, Button, Modal, notification, Tooltip } from "antd";
import Icon from '@ant-design/icons';
const { confirm } = Modal
const { Header } = Layout;
import { StoreContext } from "src/components/App";
import ToolShare from './ToolShare';
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
const pionLogo = require("assets/images/pion-logo.svg");
import "styles/css/app.scss";

const IonHeader = () => {

    const {
        login,
        localAudioEnabled,
        localVideoEnabled,
        screenSharingEnabled,
        setLocalAudioEnabled,
        setLocalVideoEnabled,
        setScreenSharingEnabled,
        setLogin,
    } = useContext(StoreContext).ionStore;

    const _handleLeave = async () => {
        confirm({
            title: "Leave Now?",
            content: "Do you want to leave the room?",
            async onOk() {
                console.log("OK");
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
                            onClick={() => setLocalAudioEnabled(!localAudioEnabled) }
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
                            onClick={() => setLocalVideoEnabled(!localVideoEnabled)}
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
                            danger
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
                            onClick={() => setScreenSharingEnabled(!screenSharingEnabled)}
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
