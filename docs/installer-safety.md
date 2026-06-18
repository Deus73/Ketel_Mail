# Ketel Mail Windows installer safety scope

This document describes the intended scope of `Ketel-Mail-Setup-0.1.0.exe`.

## What the installer is allowed to change

- Install Ketel Mail for the current Windows user only.
- Create a Desktop shortcut named `Ketel Mail`.
- Create a Start Menu shortcut named `Ketel Mail`.
- Register a normal Windows uninstall entry for Ketel Mail.
- Start Ketel Mail after the installation finishes.
- Temporarily extract and show the installer animation from the NSIS plugin temp folder.

## What the installer must not change

- It must not request administrator elevation.
- It must not install machine-wide for all users.
- It must not pin anything to the taskbar.
- It must not install services, drivers, browser extensions, scheduled tasks, or background agents.
- It must not change unrelated Windows settings.
- It must not include mail credentials or a `.env` file in the packaged app.
- It must not delete app data during uninstall.
- It must not ship PowerShell, command, or batch installer scripts inside the packaged app.

## Known limitations

- The installer is not code-signed yet, so Windows SmartScreen may warn before opening it.
- The installer targets modern 64-bit Windows systems.
- Ketel Mail stores its own runtime data in the normal per-user application data folder managed by Electron.
