import React, { FC, useContext, useState, useEffect } from "react";
import { StoreContext } from "src/components/App";
import { Layout, Button, Card, Spin, Tooltip } from "antd";
const { Content, Sider } = Layout;
import { observer } from "mobx-react";
import ChatFeed from '../chat';
import Conference from "../Conference";
import LoginForm from "../LoginForm";
import "styles/css/app.scss";

const IonContent: FC = () => {
    const { 
        login,
        loading,
        collapsed,
        vidFit,
        isFullScreen,
        localAudioEnabled,
        localVideoEnabled,
        setCollapsed,
        setVidFit,
        setFullScreen
    } = useContext(StoreContext).ionStore;

    const _openOrCloseLeftContainer = () => setCollapsed(!collapsed);
    const _onVidFitClickHandler = () => setVidFit(!vidFit);
    const _onFullScreenClickHandler = () => {
        let docElm = document.documentElement;
        const fullscreenState = () => { return document.fullscreen || false; }
        const currentFullscreenState = fullscreenState()
        if (currentFullscreenState) {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        } else {
          if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
          }
        }
        setFullScreen(!currentFullscreenState);
      }

    return (
        <Content className="app-center-layout">
        {login ? (
          <Layout className="app-content-layout">
            <Sider
              width={320}
              style={{ background: "#333" }}
              collapsedWidth={0}
              trigger={null}
              collapsible
              collapsed={collapsed}>
              <div className="left-container">
                <ChatFeed messages={this.state.messages} onSendMessage={this._onSendMessage} />
              </div>
            </Sider>
            <Layout className="app-right-layout">
              <Content style={{ flex: 1 }}>
                <Conference
                  collapsed={collapsed}
                  client={this.client}
                  settings={this._settings}
                  localAudioEnabled={localAudioEnabled}
                  localVideoEnabled={localVideoEnabled}
                  vidFit={vidFit}
                  ref={ref => {
                    this.conference = ref;
                  }}
                />
              </Content>
              <div className="app-collapsed-button">
                <Tooltip title='Open/Close chat panel'>
                  <Button
                    icon={collapsed ? "right" : "left"}
                    size="large"
                    shape="circle"
                    onClick={_openOrCloseLeftContainer}
                  />
                </Tooltip>
              </div>
              <div className="app-fullscreen-layout">
                <Tooltip title='Fit/Stretch Video'>
                  <Button
                    icon={vidFit ? "minus-square" : "plus-square"}
                    size="large"
                    shape="circle"
                    ghost
                    onClick={_onVidFitClickHandler}
                  />
                </Tooltip>
                <Tooltip title='Fullscreen/Exit'>
                  <Button
                    icon={isFullScreen ? "fullscreen-exit" : "fullscreen"}
                    size="large"
                    shape="circle"
                    className="app-fullscreen-button"
                    ghost
                    onClick={_onFullScreenClickHandler}
                  />
                </Tooltip>
              </div>
            </Layout>
          </Layout>
        ) : loading ? (
          <Spin size="large" tip="Connecting..." />
        ) : (
          <Card title="Join to Ion" className="app-login-card">
            <LoginForm />
          </Card>
        )}
      </Content>
    );
};

export default observer(IonContent)
