// *************************
// .vscode/.json
// *************************
// ======================================
export const MINGW_LAUNCH_JSON = "{\n\
    \"version\": \"0.2.0\",\n\
    \"configurations\": [\n\
        {\n\
            \"name\": \"debug\",\n\
            \"type\": \"cppdbg\",\n\
            \"request\": \"launch\",\n\
            \"program\": \"${workspaceRoot}/build/debug/${workspaceRootFolderName}.exe\",\n\
            \"args\": [],\n\
            \"stopAtEntry\": false,\n\
            \"cwd\": \"${workspaceRoot}\",\n\
            \"environment\": [],\n\
            \"externalConsole\": false,\n\
            \"MIMode\": \"gdb\",\n\
            \"miDebuggerPath\": \"__DEBUGGER_PATH__\",\n\
            \"setupCommands\": [\n\
                {\n\
                    \"description\": \"Enable pretty-printing for gdb\",\n\
                    \"text\": \"-enable-pretty-printing\",\n\
                    \"ignoreFailures\": true\n\
                }\n\
            ],\n\
            \"preLaunchTask\": \"debug\"\n\
        }\n\
    ]\n\
}"

export const TASK_JSON = "{\n\
    \"version\": \"2.0.0\",\n\
    \"tasks\": [\n\
        {\n\
            \"label\": \"debug\",\n\
            \"type\": \"shell\",\n\
            \"command\": \"cmd\",\n\
            \"args\": [\n\
                \"/c\",\n\
                \"${workspaceRoot}/scripts/build_debug.bat\",\n\
                \"debug\"\n\
            ],\n\
            \"group\": {\n\
                \"kind\": \"build\",\n\
                \"isDefault\": true\n\
            }\n\
        },\n\
        {\n\
            \"label\": \"release\",\n\
            \"type\": \"shell\",\n\
            \"command\": \"cmd\",\n\
            \"args\": [\n\
                \"/c\",\n\
                \"${workspaceRoot}/scripts/build_release.bat\",\n\
                \"release\"\n\
            ],\n\
            \"group\": {\n\
                \"kind\": \"build\",\n\
                \"isDefault\": true\n\
            }\n\
        }\n\
    ]\n\
}"


export const C_CPP_JSON = "{\n\
    \"configurations\": [\n\
        {\n\
            \"name\": \"windows\",\n\
            \"includePath\": [\n\
                \"__QT_KIT_INCLUDE__\",\n\
                \"${workspaceRoot}/**\"\n\
            ],\n\
            \"cStandard\": \"c11\",\n\
            \"cppStandard\": \"c++17\"\n\
        }\n\
    ],\n\
    \"version\": 4\n\
}"

export const MSVC_LAUNCH_JSON = "{\n\
    \"version\": \"0.2.0\",\n\
    \"configurations\": [\n\
        {\n\
            \"name\": \"Launch\",\n\
            \"type\": \"cppvsdbg\",\n\
            \"request\": \"launch\",\n\
            \"program\": \"${workspaceRoot}/build/debug/${workspaceRootFolderName}.exe\",\n\
            \"args\": [],\n\
            \"stopAtEntry\": false,\n\
            \"cwd\": \"${workspaceRoot}\",\n\
            \"environment\": [],\n\
            \"console\": \"integratedTerminal\",\n\
            \"preLaunchTask\": \"debug\"\n\
        }\n\
    ]\n\
}"

// ======================================



// *************************
// scripts/.bat
// *************************
// ======================================

export const MSVC_BAT = "@echo off\n\
\n\
set QT_DIR=__QT_KIT_DIR__\n\
set SRC_DIR=%cd%\n\
set BUILD_DIR=%cd%\\build\n\
\n\
if not exist %QT_DIR% exit\n\
if not exist %SRC_DIR% exit\n\
if not exist %BUILD_DIR% md %BUILD_DIR%\n\
\n\
cd /d %BUILD_DIR%\n\
\n\
call \"__VCVARSALL_PATH__\" __EXEC_BITS__\n\
\n\
%QT_DIR%\\bin\\qmake.exe %SRC_DIR%\\__PROJECT_NAME__.pro -spec win32-msvc  __QMAKE_MODE__\n\
if exist %BUILD_DIR%\\__BUILD_MODE__\\__PROJECT_NAME__.exe del %BUILD_DIR%\\__BUILD_MODE__\\__PROJECT_NAME__.exe\n\
nmake __MAKEFILE_MODE__\n\
if not exist %BUILD_DIR%\\__BUILD_MODE__\\Qt5Cored.dll (\n\
  %QT_DIR%\\bin\\windeployqt.exe %BUILD_DIR%\\__BUILD_MODE__\\__PROJECT_NAME__.exe\n\
)"

export const MINGW_BAT = "@echo off\n\
title qmake and nmake build prompt\n\
set MINGW_PATH=__MINGW_PATH__\n\
set QT_DIR=__QT_KIT_DIR__\n\
set BUILD_DIR=%cd%\\build\n\
set PRO_DIR=%cd%\n\
set PATH=%MINGW_PATH%\\bin;%QT_DIR%\\bin;%PATH%\n\
\n\
\n\
if not exist %BUILD_DIR% (\n\
    md %BUILD_DIR%\n\
)\n\
\n\
cd build\n\
qmake.exe %PRO_DIR%\\__PROJECT_NAME__.pro -spec win32-g++ __QMAKE_MODE__\n\
if exist %BUILD_DIR%\\__BUILD_MODE__\\__PROJECT_NAME__.exe del %BUILD_DIR%\\__BUILD_MODE__\\__PROJECT_NAME__.exe\n\
@REM __JOM_PATH__ -j4\n\
%MINGW_PATH%\\bin\\mingw32-make -f Makefile.__MAKEFILE_MODE__\n\
cd __BUILD_MODE__\n\
if not exist %BUILD_DIR%\\__BUILD_MODE__\\Qt5Core.dll (\n\
    windeployqt __PROJECT_NAME__.exe\n\
)"
// ======================================


// *************************
// src/.h .cpp
// *************************
// ======================================
export const MAIN_CPP = "#include \"__PROJECT_NAME__.h\"\n\
\n\
#include <QApplication>\n\
#pragma comment(lib, \"user32.lib\")\n\
\n\
int main(int argc, char *argv[])\n\
{\n\
    QApplication a(argc, argv);\n\
    __PROJECT_NAME__ w;\n\
    w.show();\n\
    return a.exec();\n\
}"


export const PROEJCT_CPP = "#include \"__PROJECT_NAME__.h\"\n\
\n\
__PROJECT_NAME__::__PROJECT_NAME__(QWidget* parent)\n\
    : QMainWindow(parent)\n\
{\n\
}\n\
\n\
__PROJECT_NAME__::~__PROJECT_NAME__()\n\
{\n\
}"

export const PROEJCT_CPP_WITH_UI = "#include \"__PROJECT_NAME__.h\"\n\
\n\
__PROJECT_NAME__::__PROJECT_NAME__(QWidget* parent)\n\
    : QMainWindow(parent)\n\
    , ui(new Ui___PROJECT_NAME__)\n\
{\n\
    ui->setupUi(this);\n\
}\n\
\n\
__PROJECT_NAME__::~__PROJECT_NAME__()\n\
{\n\
    delete ui; \n\
}"

export const PROEJCT_H = "#pragma once\n\
#include <QMainWindow>\n\
\n\
class __PROJECT_NAME__ : public QMainWindow {\n\
    Q_OBJECT\n\
\n\
public:\n\
    __PROJECT_NAME__(QWidget* parent = nullptr);\n\
    ~__PROJECT_NAME__();\n\
};"

export const PROEJCT_H_WITH_UI = "#pragma once\n\
#include \"ui___PROJECT_NAME__.h\"\n\
#include <QMainWindow>\n\
\n\
class __PROJECT_NAME__ : public QMainWindow {\n\
    Q_OBJECT\n\
    \n\
public:\n\
    __PROJECT_NAME__(QWidget* parent = nullptr);\n\
    ~__PROJECT_NAME__();\n\
\n\
private:\n\
    Ui___PROJECT_NAME__* ui;\n\
};"

export const QT_PRO = "QT += core gui widgets\n\
\n\
CONFIG += c++17\n\
\n\
win32-msvc*:QMAKE_CXXFLAGS += /utf-8\n\
# QMAKE_LFLAGS += \"/MANIFESTUAC:\\\"level='requireAdministrator' uiAccess='false'\\\"\"\n\
\n\
SOURCES += \\\n\
    $$files($$PWD/src/*.cpp)\n\
\n\
HEADERS += \\\n\
    $$files($$PWD/src/*.h)\n\
\n\
# FORMS += __PROJECT_NAME__.ui\n\
\n\
# Default rules for deployment.\n\
qnx: target.path = /tmp/$${TARGET}/bin\n\
else: unix:!android: target.path = /opt/$${TARGET}/bin\n\
!isEmpty(target.path): INSTALLS += target"


export const QT_UI = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n\
<ui version=\"4.0\">\n\
 <class>__PROJECT_NAME__</class>\n\
 <widget class=\"QMainWindow\" name=\"__PROJECT_NAME__\">\n\
  <property name=\"geometry\">\n\
   <rect>\n\
    <x>0</x>\n\
    <y>0</y>\n\
    <width>800</width>\n\
    <height>600</height>\n\
   </rect>\n\
  </property>\n\
  <property name=\"windowTitle\">\n\
   <string>__PROJECT_NAME__</string>\n\
  </property>\n\
  <widget class=\"QWidget\" name=\"centralwidget\"/>\n\
  <widget class=\"QMenuBar\" name=\"menubar\"/>\n\
  <widget class=\"QStatusBar\" name=\"statusbar\"/>\n\
 </widget>\n\
 <resources/>\n\
 <connections/>\n\
</ui>"