import { observable, action, computed } from "mobx";
import { Store } from ".";
import _ from "lodash";
import { reactLocalStorage } from "reactjs-localstorage";
import { Setting, LoginInfo, Message } from 'src/types';

export default class IonStore {
    rootStore: Store;

    @observable setting: Setting = {
        selectedAudioDevice: "",
        selectedVideoDevice: "",
        resolution: "hd",
        bandwidth: 1024,
        codec: "vp8",
        isDevMode: false,
    };

    @observable login: boolean = false;
    @observable loading: boolean = false;
    @observable localAudioEnabled: boolean = true;
    @observable localVideoEnabled: boolean = true;
    @observable screenSharingEnabled: boolean = false;
    @observable collapsed: boolean = true;
    @observable isFullScreen: boolean = false;
    @observable vidFit: boolean = false;
    @observable loginInfo: LoginInfo = {
        roomId: 'IconTest',
        displayName: 'Guest',
        audioOnly: false
    };
    @observable messages: Message[] = [];
    @observable inputMessage: string = "";

    constructor(rootStore: Store) {
        this.rootStore = rootStore;
    }

    @action setSetting = (setting: any) => {
        _.assign(this.setting, setting);
        reactLocalStorage.setObject("settings", this.setting);
    };

    @action setLogin = (login: boolean) => {
        this.login = login;
    };

    @action setLoading = (loading: boolean) => {
        this.loading = loading;
    };

    @action setLocalAudioEnabled = (enable: boolean) => {
        this.localAudioEnabled = enable;
    };

    @action setLocalVideoEnabled = (enable: boolean) => {
        this.localVideoEnabled = enable;
    };

    @action setScreenSharingEnabled = (enable: boolean) => {
        this.screenSharingEnabled = enable;
    };
    @action setCollapsed = (is_collapsed: boolean) => {
        this.collapsed = is_collapsed;
    };

    @action setFullScreen = (full_screen: boolean) => {
        this.isFullScreen = full_screen;
    };

    @action setVidFit = (is_fit: boolean) => {
        this.vidFit = is_fit;
    };

    @action setLoginInfo = (info: any) => {
        _.assign(this.loginInfo, info);
    };

    @action setMessages = (message: Message) => {
        _.concat(this.messages, message);
    };

    @action loginSuccessful = (login:boolean, 
                               loading: boolean,
                               loginInfo: any,
                               localVideoEnabled: boolean) => {

        this.setLogin(login);
        this.setLoading(loading);
        this.setLoginInfo(loginInfo);
        this.setLocalVideoEnabled(localVideoEnabled);
    };

    @action setInputMessages = (message: string) => {
        this.inputMessage = message;
    };
}
