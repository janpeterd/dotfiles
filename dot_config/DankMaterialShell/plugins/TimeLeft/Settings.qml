import QtQuick
import qs.Common
import qs.Widgets
import qs.Modules.Plugins

PluginSettings {
    pluginId: "timeLeft"

    StringSetting {
        settingKey: "birthDate"
        label: "Date of birth"
        description: "YYYY-MM-DD. Used locally for lifetime progress toward age 90."
        placeholder: "YYYY-MM-DD"
        defaultValue: ""
    }
    StyledText {
        width: parent.width
        text: "Europe/Brussels\nWorkday: 06:00 to 17:00\nUntil bed: 06:00 to 23:30\nAfter bedtime: Over until midnight.\nDaily schedule applies on weekends too."
        wrapMode: Text.WordWrap
        color: Theme.surfaceVariantText
        font.pixelSize: Theme.fontSizeMedium
    }
}
