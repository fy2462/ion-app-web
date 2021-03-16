import React, { FC, useContext } from "react";
import { StoreContext } from "src/components/App";
import { Layout, Button, Tooltip } from "antd";
const { Content, Sider } = Layout;
import { observer } from "mobx-react";
import ChatFeed from '../chat';
import Conference from "./Conference";
import "styles/css/app.scss";

const IonRoom: FC<{}> = () => {
  const {
    collapsed,
    vidFit,
    isFullScreen,
    setCollapsed,
    setVidFit,
    setFullScreen
  } = useContext(StoreContext).ionStore;

  const _openOrCloseLeftContainer = () => setCollapsed(!collapsed);
  const _onVidFitClickHandler = () => setVidFit(!vidFit);
  const _onFullScreenClickHandler = () => {
    const fullscreenState = () => { return document.fullscreenElement.nodeName == 'VIDEO' ? true : false; }
    const currentFullscreenState = fullscreenState()
    if (currentFullscreenState) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    } else {
      if (document.fullscreenElement.requestFullscreen) {
        document.fullscreenElement.requestFullscreen();
      }
    }
    setFullScreen(!currentFullscreenState);
  }

  return (
    <Content className="app-center-layout">
      <Layout className="app-content-layout">
        <Sider
          width={320}
          style={{ background: "#333" }}
          collapsedWidth={0}
          trigger={null}
          collapsible
          collapsed={collapsed}>
          <div className="left-container">
            <ChatFeed />
          </div>
        </Sider>
        <Layout className="app-right-layout">
          <Content style={{ flex: 1 }}>
            <Conference />
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
    </Content>
  );
};

export default observer(IonRoom)
