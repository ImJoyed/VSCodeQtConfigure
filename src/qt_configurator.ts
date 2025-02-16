/*
 * @Coding: utf-8
 * @Author: vector-wlc
 * @Date: 2021-08-17 10:32:54
 * @Description:
 */

import * as vscode from 'vscode';
import * as fs from "fs";
import * as template_files from "./template_files";
import * as os from "os"
import { prototype } from 'events';
import { parse } from 'path';

// {
//     "version": "0.2.0",
//     "configurations": [
//         {
//             "name": "QtBuild",
//             "type": "cppdbg",
//             "request": "launch",
//             "program": "${command:cmake.launchTargetPath}",
//             "args": [],
//             "stopAtEntry": false,
//             "cwd": "${workspaceRoot}",
//             "environment": [
//                 {
//                     "name": "PATH",
//                     "value": "/home/joyed/Qt5.12.12/5.12.12/gcc_64/bin"
//                 },
//                 {
//                     "name": "DISPLAY",
//                     "value": "127.0.0.1:0.0"
//                 }
//             ],
//             "externalConsole": false,
//         }
//     ]
// }

interface envObj {
    name: string,
    value: string
}

interface configurationObj {
    environment: envObj[]
}

interface LaunchObj {
    configurations: configurationObj[]
};

export class QtConfigurator {
    private qtDir: string;
    private xServerAddress: string;
    private isMsvc: boolean;
    private projectDir: string;
    private projectName: string;
    private qtKitDirList: string[];
    private qtSelectedKitDir: string;
    private qtSelectedKitName: string;
    private mingwPath: string;
    private gdbPath: string;
    private makePath: string;
    private vcvarsallPath: string;
    private isHasQtUi: boolean;
    private qtTerminal: vscode.Terminal | undefined;
    private platform: string;
    private isWin32: boolean;
    private isLinux: boolean;
    private execSuffix: string;
    private cmdSuffix: string;
    private buildTools: string;

    constructor() {
        this.qtDir = "";
        this.xServerAddress = "127.0.0.1:0.0";
        this.isMsvc = true;
        this.projectDir = "";
        this.projectName = "";
        this.qtKitDirList = [];
        this.qtSelectedKitDir = "";
        this.qtSelectedKitName = "";
        this.mingwPath = "";
        this.gdbPath = "/usr/bin/gdb";
        this.makePath = "/usr/bin/make";
        this.vcvarsallPath = "C:/Program Files (x86)/Microsoft Visual Studio/__VS_VERSION__/Community/VC/Auxiliary/Build/vcvarsall.bat";
        this.isHasQtUi = false;
        this.platform = os.platform().toString();
        this.isWin32 = this.platform.search("win32") !== -1;
        this.isLinux = this.platform.search("linux") !== -1;
        this.execSuffix = "";
        if (this.isWin32) {
            this.execSuffix = ".exe";
        }
        this.cmdSuffix = "";
        if (this.isLinux) {
            this.cmdSuffix = " &";
        }
        this.buildTools = "";
    }

    public setProjectName(projectName: string): void {
        this.projectName = projectName;
    }


    public setProjectDir(projectDir: string): void {
        this.projectDir = projectDir;
    }


    public setQtDir(qtDir: string): void {
        // 寻找 Qt 套件
        this.qtKitDirList = [];
        let one_dirs = fs.readdirSync(qtDir);
        for (let one_dir of one_dirs) {
            if (one_dir[0] >= '0' && one_dir[0] <= '9') {
                let two_dirs = fs.readdirSync(qtDir + "/" + one_dir);
                for (let two_dir of two_dirs) {
                    if (two_dir.search("mingw") !== -1 || two_dir.search("msvc") !== -1 || two_dir.search("gcc") !== -1) {
                        this.qtKitDirList.push(qtDir + "/" + one_dir + "/" + two_dir);
                    }
                }
            }
        }

        if (this.qtKitDirList.length !== 0) {
            this.qtDir = qtDir;
        }

    }

    public setXServerAddress(xServerAddress: string): void {
        this.xServerAddress = xServerAddress;
        vscode.workspace.getConfiguration().update('qtConfigure.xServerAddress', this.xServerAddress, false);

        let _content: string = "";
        if(this.projectDir.length === 0) {
            this.projectDir = vscode.workspace.workspaceFolders![0].uri.fsPath;
        }
        _content = this.readFile(this.projectDir + "/.vscode/launch.json");
        let displayIndex: number = _content.indexOf('"DISPLAY"');
        let lastContent: string = _content.substring(displayIndex);
        let displayValueIndex: number = lastContent.indexOf('"value"');
        lastContent = lastContent.substring(displayValueIndex + 7);
        let addressStartIndex: number = lastContent.indexOf('"');
        lastContent = lastContent.substring(addressStartIndex);
        let addressEndIndex: number = lastContent.indexOf('"\n');
        let valueStr: string = lastContent.substring(0, addressEndIndex + 1);

        _content = _content.replace(valueStr, '"' + this.xServerAddress + '"');
        this.writeFile(this.projectDir + "/.vscode/launch.json", _content);
    }

    public getQtKitDirList(): string[] {
        return this.qtKitDirList;
    }

    public setQtKitDir(qtKitDir: string) {
        this.qtSelectedKitDir = qtKitDir;
        this.qtSelectedKitDir = this.strReplaceAll(this.qtSelectedKitDir, "\\", "/");
        vscode.workspace.getConfiguration().update('qtConfigure.qtKitDir', this.qtSelectedKitDir, false);
        this.qtSelectedKitName = qtKitDir.split("/").pop()?.toString()!;
    }

    public setQtUi(isHasQtUi: boolean) {
        this.isHasQtUi = isHasQtUi;
    }

    public isGetQtDir(): boolean {
        return this.qtDir !== "";
    }

    public setBuildTools(buildTools: string) {
        this.buildTools = buildTools;
    }

    private mkDir(dirName: string): boolean {
        if (fs.existsSync(dirName)) {
            return true;
        }
        fs.mkdirSync(dirName);
        return fs.existsSync(dirName);
    }

    private writeFile(fileName: string, content: string): void {
        if (fs.existsSync(fileName)) {
            fs.unlinkSync(fileName);
        }
        fs.writeFile(fileName, content, "utf-8", (err) => {
            if (err) {
                vscode.window.showErrorMessage("Write File : " + fileName + " Failed");
            }
        });
    }

    private readFile(fileName: string): string {
        return fs.readFileSync(fileName, 'utf-8');
    }

    public createQtConfigureFiles() {
        this.projectDir = vscode.workspace.workspaceFolders![0].uri.fsPath;
        this.mkDir(this.projectDir + "/.vscode");
        this.mkDir(this.projectDir + "/src");
        this.createSrc();
        if (this.buildTools === "CMake") {
            this.createCMakeFiles();
        } else if (this.buildTools === "QMake") {
            this.createQMakeFiles();
        } else {
            vscode.window.showErrorMessage("未知的构建工具! (Unknown build tool !)");
        }


    }

    private createCMakeFiles() {
        this.createCMakeLaunchJson();
        this.createCMakeLists();
    }

    private createQMakeFiles() {
        this.isMsvc = this.qtSelectedKitDir.search("msvc") !== -1;
        this.createQMakeJsonFiles();
        if (this.isWin32) {
            this.mkDir(this.projectDir + "/scripts");
            this.createQMakeBatFiles();
        }
        this.createPro();
    }

    public openDesigner() {
        let _qtSelectedKitDir = vscode.workspace.getConfiguration().get('qtConfigure.qtKitDir');
        if (!_qtSelectedKitDir) {
            vscode.window.showErrorMessage("请创建 Qt 项目后再使用此命令 (Please create Qt project before using this command)");
            return;
        }
        if (this.qtTerminal === undefined) {
            this.qtTerminal = vscode.window.createTerminal("qtTerminal", this.isWin32 ? "cmd" : "bash");
        }

        if(this.isLinux) {
            let _xServerAddress = new String(vscode.workspace.getConfiguration().get('qtConfigure.xServerAddress'));
            if(_xServerAddress.length !== 0) {
                this.qtTerminal.sendText("export DISPLAY=" + _xServerAddress);
            }
        }

        if (this.projectName.length === 0) { // 寻找 projectName
            this.projectDir = vscode.workspace.workspaceFolders![0].uri.fsPath;
            let projectFileList = fs.readdirSync(this.projectDir + "/src");
            for (let projectFile of projectFileList) {
                if (projectFile.search("\\.ui") !== -1) {
                    this.projectName = projectFile.replace(".ui", "");
                    break;
                }
            }
        }

        let uiFileName = this.projectDir + "/src/" + this.projectName + ".ui";
        if (fs.existsSync(uiFileName)) {
            this.qtTerminal.sendText(_qtSelectedKitDir + "/bin/designer" + this.execSuffix + " " + uiFileName + this.cmdSuffix);
        } else {
            vscode.window.showErrorMessage("请创建 Qt UI 项目后再使用此命令 (Please create Qt UI project before using this command)");
        }

    }

    public openAssistant() {
        let _qtSelectedKitDir = vscode.workspace.getConfiguration().get('qtConfigure.qtKitDir');
        if (!_qtSelectedKitDir) {
            vscode.window.showErrorMessage("请创建 Qt 项目后再使用此命令 (Please create Qt project before using this command)");
            return;
        }
        if (this.qtTerminal === undefined) {
            this.qtTerminal = vscode.window.createTerminal("qtTerminal", this.isWin32 ? "cmd" : "bash");
        }

        if(this.isLinux) {
            let _xServerAddress = new String(vscode.workspace.getConfiguration().get('qtConfigure.xServerAddress'));
            if(_xServerAddress.length !== 0) {
                this.qtTerminal.sendText("export DISPLAY=" + _xServerAddress);
            }
        }

        this.qtTerminal.sendText(_qtSelectedKitDir + "/bin/assistant" + this.execSuffix + this.cmdSuffix);
    }

    public closeTerminal() {
        this.qtTerminal = undefined;
    }

    private strReplaceAll(str: string, subStr: string, newSubStr: string): string {
        return str.split(subStr).join(newSubStr);
    }

    private getMinGWPath(): void {
        let _mingwPath = vscode.workspace.getConfiguration().get('qtConfigure.mingwPath');
        if (_mingwPath) {
            this.mingwPath = <string>_mingwPath;
        } else {
            let mingwName = this.strReplaceAll(this.qtSelectedKitName, "_", "0_");
            this.mingwPath = this.qtDir + "/Tools/" + mingwName;
            vscode.workspace.getConfiguration().update('qtConfigure.mingwPath', this.mingwPath, true);
        }
    }

    private getGccPath(): void {
        let _gdbPath = vscode.workspace.getConfiguration().get('qtConfigure.gdbPath');
        let _makePath = vscode.workspace.getConfiguration().get('qtConfigure.makePath');
        if (_gdbPath) {
            this.gdbPath = <string>_gdbPath;
        }
        if (_makePath) {
            this.makePath = <string>_makePath;
        }
    }

    private createQMakeJsonFiles() {
        // c_cpp_properties
        let content = template_files.C_CPP_JSON;
        content = this.strReplaceAll(content, "__QT_KIT_INCLUDE__", this.qtSelectedKitDir + "/include/**");
        content = this.strReplaceAll(content, "\\", "/");

        this.writeFile(this.projectDir + "/.vscode/c_cpp_properties.json", content);

        // launch.json
        if (this.isMsvc) {
            content = template_files.MSVC_LAUNCH_JSON;
        } else {
            content = template_files.MINGW_OR_GCC_LAUNCH_JSON;
            let debugger_path = "";
            if (this.isWin32) {
                this.getMinGWPath();
                debugger_path = this.mingwPath + "/bin/gdb.exe";
            } else {
                this.getGccPath();
                debugger_path = this.gdbPath;
            }
            content = this.strReplaceAll(content, "__DEBUGGER_PATH__", debugger_path);
            content = this.strReplaceAll(content, "\\", "/");

        }
        content = this.strReplaceAll(content, "__PROJECT_NAME__", this.projectName + this.execSuffix);
        this.writeFile(this.projectDir + "/.vscode/launch.json", content);

        // tasks
        if (this.isWin32) {
            this.writeFile(this.projectDir + "/.vscode/tasks.json", template_files.WINDOWS_TASK_JSON);
        } else {
            content = template_files.LINUX_TASK_JSON;
            content = this.strReplaceAll(content, "__QMAKE_PATH__", this.qtSelectedKitDir + "/bin/qmake");
            content = this.strReplaceAll(content, "__GCC_MAKE_PATH_", this.makePath);
            this.writeFile(this.projectDir + "/.vscode/tasks.json", content);
        }

    }

    private createQMakeBatFiles() {
        let content = this.isMsvc ? template_files.MSVC_BAT : template_files.MINGW_BAT;
        content = this.strReplaceAll(content, "__QT_KIT_DIR__", this.qtSelectedKitDir);
        content = this.strReplaceAll(content, "__PROJECT_NAME__", this.projectName);

        if (this.isMsvc) {
            let _vcvarsallPath = vscode.workspace.getConfiguration().get('qtConfigure.vcvarsallPath');
            if (_vcvarsallPath) {
                this.vcvarsallPath = <string>_vcvarsallPath;
            }
            let is_x64 = this.qtSelectedKitName.search("_64") !== -1;
            if (this.vcvarsallPath.search("__VS_VERSION__") != -1) {
                let vs_version = this.strReplaceAll(this.qtSelectedKitName, "msvc", "");
                vs_version = this.strReplaceAll(vs_version, "_64", "");
                this.vcvarsallPath = this.strReplaceAll(this.vcvarsallPath, "__VS_VERSION__", vs_version)
                vscode.workspace.getConfiguration().update('qtConfigure.vcvarsallPath', this.vcvarsallPath, true);
            }
            content = this.strReplaceAll(content, "__VCVARSALL_PATH__", this.vcvarsallPath);
            content = this.strReplaceAll(content, "__EXEC_BITS__", is_x64 ? "x64" : "x86");
        } else { // MinGW
            let jomPath = this.qtDir + "/Tools/QtCreator/bin/jom.exe";

            content = this.strReplaceAll(content, "__MINGW_PATH__", this.mingwPath);
            content = this.strReplaceAll(content, "__JOM_PATH__", jomPath);
        }

        // debug
        let buildDebugStr = content;
        buildDebugStr = this.strReplaceAll(buildDebugStr, "__QMAKE_MODE__", "\"CONFIG+=debug\" \"CONFIG+=console\"");
        buildDebugStr = this.strReplaceAll(buildDebugStr, "__BUILD_MODE__", "debug");
        buildDebugStr = this.strReplaceAll(buildDebugStr, "__MAKEFILE_MODE__", "Debug");
        buildDebugStr = this.strReplaceAll(buildDebugStr, "/", "\\");
        this.writeFile(this.projectDir + "/scripts/build_debug.bat", buildDebugStr);

        // release
        let buildReleaseStr = content;
        buildReleaseStr = this.strReplaceAll(buildReleaseStr, "__QMAKE_MODE__", "\"CONFIG+=release\"");
        buildReleaseStr = this.strReplaceAll(buildReleaseStr, "__BUILD_MODE__", "release");
        buildReleaseStr = this.strReplaceAll(buildReleaseStr, "__MAKEFILE_MODE__", "Release");
        if (this.isMsvc) {
            buildReleaseStr = this.strReplaceAll(buildReleaseStr, "Qt5Cored.dll", "Qt5Core.dll");
        }
        buildReleaseStr = this.strReplaceAll(buildReleaseStr, "/", "\\");
        this.writeFile(this.projectDir + "/scripts/build_release.bat", buildReleaseStr);
    }


    private createSrc() {
        let content = template_files.MAIN_CPP;
        content = this.strReplaceAll(content, "__PROJECT_NAME__", this.projectName);
        this.writeFile(this.projectDir + "/src/main.cpp", content);

        content = this.isHasQtUi ? template_files.PROEJCT_CPP_WITH_UI : template_files.PROEJCT_CPP;
        content = this.strReplaceAll(content, "__PROJECT_NAME__", this.projectName);
        this.writeFile(this.projectDir + "/src/" + this.projectName + ".cpp", content);

        content = this.isHasQtUi ? template_files.PROEJCT_H_WITH_UI : template_files.PROEJCT_H;
        content = this.strReplaceAll(content, "__PROJECT_NAME__", this.projectName);
        this.writeFile(this.projectDir + "/src/" + this.projectName + ".h", content);

        if (this.isHasQtUi) {
            content = template_files.QT_UI;
            content = this.strReplaceAll(content, "__PROJECT_NAME__", this.projectName);
            this.writeFile(this.projectDir + "/src/" + this.projectName + ".ui", content);
        }
    }

    private createPro() {
        let content = template_files.QT_PRO;
        content = this.strReplaceAll(content, "__PROJECT_NAME__", this.projectName);
        if (this.isHasQtUi) {
            content = this.strReplaceAll(content, "# FORMS", "FORMS");
        }
        this.writeFile(this.projectDir + "/" + this.projectName + ".pro", content);
    }

    private createCMakeLists() {
        let content = template_files.CMAKE_LISTS_TXT;
        content = this.strReplaceAll(content, "__PROJECT_NAME__", this.projectName);
        content = this.strReplaceAll(content, "__QT_KIT_DIR__", this.qtSelectedKitDir);
        this.writeFile(this.projectDir + "/CMakeLists.txt", content);
    }

    private createCMakeLaunchJson() {
        let content = template_files.CMAKE_LAUNCH_JSON;
        content = this.strReplaceAll(content, "__QT_KIT_DIR__", this.qtSelectedKitDir);
        let _xServerAddress = new String(vscode.workspace.getConfiguration().get('qtConfigure.xServerAddress'));
        content = this.strReplaceAll(content, "__X_SERVER_ADDRESS__", _xServerAddress.toString());
        this.writeFile(this.projectDir + "/.vscode/launch.json", content);
    }
}
