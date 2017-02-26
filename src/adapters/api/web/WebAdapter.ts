import "../../../util/Resolver";
import Class from "../../../lang/Class";
import ConsoleChannel from "../ConsoleChannel";
import { addModules } from "../../../util/Resolver";
import Runner from "../../mocha/Runner";
const {ipcRenderer} = require("electron");


export default class WebRunner extends Class {
    props;
    constructor(props) {
        super();
        this.props = props || {};
        ipcRenderer.on("onMainConfirmStart", this.onMainConfirmStart);
    }

    run(callback){
        let args = this.props.options;
        if (!args.interactive) {
            ConsoleChannel.remote();
        }
        const { ipcRenderer: ipc } = require('electron');
        try {
            args.preload.forEach((script) => {
                const tag = document.createElement('script');
                tag.src = script;
                tag.async = false;
                document.head.appendChild(tag)
            });
            const nodeRunner = new Runner(this.props);
            nodeRunner.run(callback);
        } catch (error) {
            this.onError(error);
        }
    }


    public onFinishLoad(){
        console.log("On Finish Loaded");
        this.props.options = ipcRenderer.sendSync("onRenderedLoaded", true);
        let rootList = this.props.options.rootList;
        addModules(rootList);
        if(!this.props.options.interactive) {
            ConsoleChannel.remote();
        }
        ipcRenderer.send("onRenderedBeforeStart", true);
    }

    public onMainConfirmStart(event, result) {
        this.start(this.onSuccess);
    }

    public start(onCompleted) {
        try {
            this.run(onCompleted);
        } catch (e) {
            this.onError(e);
        }
    }

    public onSuccess(count) {
        ipcRenderer.send("onRenderedCompleted", count);
    }

    public onError(result) {
        ipcRenderer.send("onRenderedCompleted", error);
    }
}