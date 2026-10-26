# CodeChef Clipboard Helper

A Chrome extension designed to bypass editor clipboard restrictions and cleanly format & inject code into the CodeChef IDE.

## Features

- **Unblock Clipboard & Shortcuts**: Overrides restrictive event listeners on CodeChef editor tabs, re-enabling `Ctrl+V`, `Ctrl+C`, `Ctrl+A`, context menu, and paste events.
- **Smart Indentation & Code Formatting**: Ensures consistent 4-space indentation for clean code insertion without broken indentation.
- **Direct Editor Injection**: Reliably detects CodeChef's code editor instances (Ace Editor / Monaco / textarea) and directly injects formatted code.
- **CSP Compliant**: Built strictly following Chrome Extension Manifest V3 guidelines.

## Installation

1. Clone or download this repository:
   ```bash
   git clone https://github.com/priyadarsh912/codechef-clipboard.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** toggle in the top-right corner.
4. Click **Load unpacked** and select this project directory.

## Project Structure

- `manifest.json`: Extension Manifest V3 configuration and permissions.
- `popup.html`: Extension popup UI with formatting controls and status indicator.
- `popup.js`: Popup logic, Java code formatter, and injection dispatcher.
- `content.js`: Content script that unblocks copy/paste/keyboard shortcuts on CodeChef.
