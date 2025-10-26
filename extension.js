import Gio from "gi://Gio";
import GLib from "gi://GLib";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

export default class Img2ClipExtension extends Extension {
    enable() {
        this.settings = this.getSettings();
        const enabled = this.settings.get_boolean("enabled");
        this._updateNautilusExtension(enabled);

        this.settingsChangedId = this.settings.connect("changed::enabled", () => {
            this._updateNautilusExtension(this.settings.get_boolean("enabled"));
        });
    }

    disable() {
        if (this.settingsChangedId)
            this.settings.disconnect(this.settingsChangedId);

        // Ensure Nautilus extension is removed when the shell extension is disabled
        this._updateNautilusExtension(false);
    }

    _updateNautilusExtension(enabled) {
        const home = GLib.get_home_dir();
        const nautilusDir = GLib.build_filenamev([home, ".local/share/nautilus-python/extensions"]);
        const nautilusExtPath = GLib.build_filenamev([nautilusDir, "image_copy.py"]);

        // Make sure the directory exists
        GLib.mkdir_with_parents(nautilusDir, 0o755);

        if (enabled) {
            // Copy the Python script
            GLib.spawn_command_line_async(`cp "${this.path}/nautilus/image_copy.py" "${nautilusExtPath}"`);
            log("[img2clip] Nautilus extension installed.");
        } else {
            // Remove it
            GLib.spawn_command_line_async(`rm -f "${nautilusExtPath}"`);
            log("[img2clip] Nautilus extension removed.");
        }

        // Always restart Nautilus (quietly)
        this._restartNautilus();
    }

    _restartNautilus() {
        try {
            GLib.spawn_command_line_async("nautilus -q");
            log("[img2clip] Nautilus restarted.");
        } catch (e) {
            logError(e, "[img2clip] Failed to restart Nautilus.");
        }
    }
}

