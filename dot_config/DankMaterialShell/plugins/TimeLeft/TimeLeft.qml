import QtQuick
import QtQuick.Layouts
import Quickshell.Io
import qs.Common
import qs.Widgets
import qs.Modules.Plugins

PluginComponent {
    id: root
    property var data: null
    property bool failed: false
    property bool refreshPending: false
    readonly property string birthDate: pluginData.birthDate || ""
    readonly property string countdownText: failed ? "Unavailable" : data ? data.label : "…"
    readonly property var rowIcons: ["work_outline", "bedtime", "calendar_today", "person_outline"]
    readonly property string modeIcon: rowIcons[data?.mode === "bed" ? 1 : 0]
    readonly property real activeProgress: data?.rows[data.mode === "bed" ? 1 : 0]?.progress ?? 0
    readonly property color activeColor: data?.mode === "bed" ? Theme.secondary : Theme.primary
    popoutWidth: 390
    popoutHeight: 440

    function refresh() {
        if (clockProcess.running) {
            refreshPending = true;
            return;
        }
        refreshPending = false;
        clockProcess.running = true;
    }
    onBirthDateChanged: refresh()
    Timer {
        interval: 1000
        repeat: true
        running: true
        triggeredOnStart: true
        property int lastMinute: -1
        onTriggered: {
            const minute = Math.floor(Date.now() / 60000);
            if (minute !== lastMinute) {
                lastMinute = minute;
                root.refresh();
            }
        }
    }
    Process {
        id: clockProcess
        command: ["python3", Qt.resolvedUrl("countdown.py").toString().replace(/^file:\/\//, ""), root.birthDate]
        stdout: StdioCollector {
            onStreamFinished: {
                try {
                    root.data = JSON.parse(text);
                    root.failed = false;
                } catch (error) {
                    root.failed = true;
                }
            }
        }
        onExited: (exitCode) => {
            if (exitCode !== 0)
                root.failed = true;
            if (root.refreshPending)
                Qt.callLater(root.refresh);
        }
    }

    horizontalBarPill: Component {
        Item {
            implicitWidth: barRow.implicitWidth
            implicitHeight: barRow.implicitHeight
            Row {
                id: barRow
                anchors.centerIn: parent
                spacing: Theme.spacingS
                DankIcon {
                    anchors.verticalCenter: parent.verticalCenter
                    name: root.modeIcon
                    size: root.iconSize
                    color: Theme.primary
                }
                StyledText {
                    anchors.verticalCenter: parent.verticalCenter
                    text: root.countdownText
                    font.pixelSize: Theme.fontSizeMedium
                    color: Theme.surfaceText
                }
                Rectangle {
                    anchors.verticalCenter: parent.verticalCenter
                    width: 44
                    height: 4
                    radius: height / 2
                    visible: root.data !== null && !root.failed
                    color: Theme.surfaceContainerHighest
                    Rectangle {
                        width: parent.width * root.activeProgress
                        height: parent.height
                        radius: parent.radius
                        color: root.activeColor
                    }
                }
            }
        }
    }
    verticalBarPill: Component {
        Column {
            spacing: 2
            DankIcon {
                anchors.horizontalCenter: parent.horizontalCenter
                name: root.modeIcon
                size: root.iconSize
                color: Theme.primary
            }
            StyledText {
                text: root.failed ? "!" : root.data ? root.data.minutes : "…"
                font.pixelSize: Theme.fontSizeSmall
                color: Theme.surfaceText
            }
        }
    }
    popoutContent: Component {
        Item {
            id: popupContainer
            implicitHeight: popup.implicitHeight + Theme.spacingM * 2
            property var closePopout: null
            property var parentPopout: null

            Column {
                id: popup
                x: Theme.spacingM
                y: Theme.spacingM
                width: parent.width - Theme.spacingM * 2
                spacing: Theme.spacingM

                Column {
                    width: parent.width
                    spacing: Theme.spacingXS
                    RowLayout {
                        width: parent.width
                        height: 32
                        StyledText {
                            Layout.fillWidth: true
                            text: "Time left"
                            font.pixelSize: Theme.fontSizeLarge + 4
                            font.weight: Font.Bold
                            color: Theme.surfaceText
                        }
                        Rectangle {
                            Layout.preferredWidth: 32
                            Layout.preferredHeight: 32
                            radius: 16
                            color: closeArea.containsMouse ? Theme.errorHover : "transparent"
                            DankIcon {
                                anchors.centerIn: parent
                                name: "close"
                                size: Theme.iconSize - 4
                                color: Theme.surfaceText
                            }
                            MouseArea {
                                id: closeArea
                                anchors.fill: parent
                                hoverEnabled: true
                                cursorShape: Qt.PointingHandCursor
                                onClicked: popupContainer.closePopout?.()
                            }
                        }
                    }
                    StyledText {
                        width: parent.width
                        text: root.failed ? "Could not read the clock" : "Europe/Brussels"
                        font.pixelSize: Theme.fontSizeMedium
                        color: Theme.surfaceVariantText
                    }
                }
                Rectangle {
                    width: parent.width
                    height: 1
                    color: Theme.surfaceContainerHighest
                }
                Column {
                    width: parent.width
                    topPadding: Theme.spacingS
                    bottomPadding: Theme.spacingS
                    spacing: Theme.spacingL + Theme.spacingXS
                    Repeater {
                        model: root.failed ? [] : root.data?.rows || []
                        delegate: GridLayout {
                            id: progressRow
                            required property var modelData
                            required property int index
                            width: parent.width
                            columns: 2
                            columnSpacing: Theme.spacingS
                            rowSpacing: Theme.spacingS
                            readonly property color accent: index === 0 ? Theme.primary : index === 1 ? Theme.secondary : index === 2 ? Theme.tertiary : Theme.primary

                            RowLayout {
                                Layout.preferredWidth: (progressRow.width - progressRow.columnSpacing) * 0.6
                                Layout.fillWidth: true
                                spacing: Theme.spacingS
                                DankIcon {
                                    name: root.rowIcons[progressRow.index]
                                    size: Theme.iconSizeSmall
                                    color: progressRow.accent
                                }
                                StyledText {
                                    Layout.fillWidth: true
                                    text: progressRow.modelData.title
                                    font.weight: Font.Medium
                                    color: Theme.surfaceText
                                }
                            }
                            StyledText {
                                Layout.preferredWidth: (progressRow.width - progressRow.columnSpacing) * 0.4
                                Layout.fillWidth: true
                                horizontalAlignment: Text.AlignRight
                                text: progressRow.modelData.remaining
                                color: progressRow.accent
                            }
                            Rectangle {
                                Layout.columnSpan: 2
                                Layout.fillWidth: true
                                Layout.preferredHeight: 7
                                radius: height / 2
                                color: Theme.surfaceContainerHighest
                                Rectangle {
                                    width: parent.width * (progressRow.modelData.progress || 0)
                                    height: parent.height
                                    radius: parent.radius
                                    color: progressRow.accent
                                }
                            }
                            StyledText {
                                Layout.fillWidth: true
                                Layout.columnSpan: progressRow.modelData.progress === null ? 2 : 1
                                text: progressRow.modelData.detail
                                font.pixelSize: Theme.fontSizeSmall
                                color: Theme.surfaceVariantText
                                wrapMode: Text.WordWrap
                            }
                            StyledText {
                                Layout.fillWidth: true
                                visible: progressRow.modelData.progress !== null
                                horizontalAlignment: Text.AlignRight
                                text: ((progressRow.modelData.progress || 0) * 100).toFixed(1) + "%"
                                font.pixelSize: Theme.fontSizeSmall
                                color: Theme.surfaceVariantText
                            }
                        }
                    }
                }
            }
        }
    }
}
