import React, { useState, useContext, FC } from 'react';
import { observer } from "mobx-react";
import { Modal, Button, Tooltip, Input } from 'antd';
import Icon from '@ant-design/icons';
import DotsVerticalIcon from "mdi-react/DotsVerticalIcon";
import { StoreContext } from "src/components/App";


const ToolShare: FC<{}> = () => {

    const { loginInfo } = useContext(StoreContext).ionStore;

    const [visible, setVisible] = useState(false)
    const [url, setUrl] = useState("")

    const _showModal = () => {
        setVisible(true)
        let host = window.location.host;
        let url = window.location.protocol + "//" + host + "/?room=" + loginInfo.roomId;
        setUrl(url)
    }

    return (
        <div className="app-header-tool-container">
            <Tooltip title='Shared conference'>
            <Button ghost size="large" type="link" onClick={_showModal}>
              <Icon
                component={DotsVerticalIcon}
                style={{ display: "flex", justifyContent: "center" }}
              />
            </Button>
            </Tooltip>
            <Modal
                title='Shared conference'
                visible={visible}
                onOk={() => {setVisible(false)}}
                onCancel={() => {setVisible(false)}}
                okText='Ok'
                cancelText='Cancel'>
                <div>
                    <div>
                        <span>Send link to your friends</span>
                        <Input readOnly={true} value={url} />
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default observer(ToolShare)
