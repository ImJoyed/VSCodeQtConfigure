<!--
 * @Coding: utf-8
 * @Author: vector-wlc
 * @Date: 2021-08-17 22:07:29
 * @Description: 
-->
# QtConfigurator README

## Only Windows and Linux are supported

<strong>这不是 Qt 官方工具！！！x3</strong>

在 VSCode 中生成 Qt 项目配置文件，按下 F5 可独立运行调试 Qt 项目

## Features

* Command: `QtConfigure : New Project` 生成 Qt 项目配置文件

* Command: `QtConfigure : Set Qt Dir` 选择 Qt 安装目录，注意是安装目录，而不是 Qt 套件目录，
该扩展会根据 Qt 安装路径搜索相应的 Qt 套件以及编译器

* Command: `QtConfigure : Open Qt Designer` 打开 Qt Designer，该命令仅在生成 Qt Ui 项目后才能使用

* Command: `QtConfigure : Open Qt Assistant` 打开 Qt Assistant

* Command: `QtConfigure : Set X Server Address`（个人在Linux的code-server上使用的功能，未进行充足的测试） 设置X Server地址，设置后可在指定地址打开GUI（Qt Designer、Qt Assistant和你编译的程序），需要有X Server配合使用

### CMake

* 需要配合 VSCode [CMake](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cmake-tools)  扩展使用

### QMake

* Build Debug:
在编译运行 Debug 时，请将`./.vscode/launch.json` 中的有关内容修改如下:`"program": "${workspaceRoot}/build/debug/${workspaceRootFolderName}.exe"    "preLaunchTask": "debug"`

* Build Release:
在编译运行 Release 时，请将`./.vscode/launch.json` 中的有关内容修改如下 :`"program": "${workspaceRoot}/build/release/${workspaceRootFolderName}.exe"    "preLaunchTask": "release"`

## Requirements

* [Qt](https://www.qt.io/)
* [ms-vscode.cpptools](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools)
* [CMake](https://cmake.org) 
* [ms-vscode.cmake-tools](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cmake-tools) 
