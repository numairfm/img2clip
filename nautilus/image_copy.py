#!/usr/bin/env python3
# Nautilus extension: Copy Image to Clipboard (Native GTK4 version for GNOME 48+)

import gi
gi.require_version("Gtk", "4.0")
gi.require_version("GdkPixbuf", "2.0")
from gi.repository import Nautilus, GObject, Gtk, GdkPixbuf, Gdk, Gio
import os

class CopyImageToClipboardExtension(GObject.GObject, Nautilus.MenuProvider):
    """Adds 'Copy Image to Clipboard' to Nautilus right-click menu."""

    def __init__(self):
        super().__init__()

    def get_file_items_full(self, provider, files):
        if len(files) != 1:
            return []
        f = files[0]
        mime = f.get_mime_type() or ""
        if not mime.startswith("image/"):
            return []

        item = Nautilus.MenuItem(
            name="CopyImageToClipboardExtension::CopyImage",
            label="Copy Image to Clipboard",
            tip="Copy this image directly to the clipboard (native GTK)"
        )
        item.connect("activate", self.copy_image_to_clipboard, f)
        return [item]

    def copy_image_to_clipboard(self, menu, file):
        try:
            path = file.get_location().get_path()
            if not path or not os.path.exists(path):
                print(f"[nautilus-ext] Invalid path: {path}")
                return

            # Load image as GdkPixbuf
            pixbuf = GdkPixbuf.Pixbuf.new_from_file(path)

            # Get clipboard from default display
            display = Gdk.Display.get_default()
            clipboard = Gdk.Display.get_clipboard(display)

            # Copy to clipboard
            clipboard.set_content(Gdk.ContentProvider.new_for_value(pixbuf))
            print(f"[nautilus-ext] Copied image to clipboard: {path}")

        except Exception as e:
            print(f"[nautilus-ext] Failed: {e}")

