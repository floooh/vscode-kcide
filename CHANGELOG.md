# Changelog
All notable changes to the "vscode-kcide" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

### Changed

- update the embedded asmx.wasm to the latest version (see: https://github.com/floooh/easmx/pull/1)

## [2.2.0] - 2024-12-25

### Changed

- the emulator debug UI now use the Dear ImGui docking branch and persists the UI layout between sessions
- a teared-off emulator tab is no longer forced back into an embedded tab
- some code cleanup where rejected debug session promises were not caught

## [2.1.3] - 2024-12-02

### Fixed

- Fixed breakpoint validation on Windows (this was regressed in the last version).

## [2.1.2] - 2024-12-02

### Changed

- Update the section about using the extension in VSCode for Web.

## [2.1.1] - 2024-12-02

### Changed

- In setBreakpointsRequest(), don't assume that the incoming breakpoint location
  is a file path.

## [2.1.0] - 2024-12-02

### Changed

- Change getWorkspaceRelativePath() to only consider the URI path component, this
  might fix various situations where breakpoints cannot be validated.

## [2.0.0] - 2024-09-02

### Changed

- Update the `@vscode/wasm-wasi` extension to 1.0.0, and move the extension
  out of Preview mode.

## [1.8.2] - 2024-02-20

### Fixed

- Fix an issue where a label at address 0 is ignored, which then may lead
  to followup errors like 'Project is missing a '_start' label'.
  Fixes https://github.com/floooh/vscode-kcide/issues/7.

## [1.8.1] - 2024-01-24

### Changed

- Updated emulators to latest versions (no functional changes).

## [1.8.0] - 2023-12-29

### Added

- Amstrad CPC support has been added

### Removed

- The palette commands `KCIDE: Run` and `KCIDE: Check` have been removed

## [1.7.2] - 2023-12-27

### Changed

- In the readme, move the (quite important) Installation instructions above the screenshots.

## [1.7.1] - 2023-12-27

### Fixed

- Fixed a minor readme typo.

## [1.7.0] - 2023-12-27

### Added

- C64 support is now complete. Check the example project here:

  https://github.com/floooh/kcide-sample/tree/main/c64

## [1.6.0] - 2023-12-25

### Changed

- Breaking change: projects must now have a special `_start` label which defined the entry point of the program
  (previously the first instruction of the main source was the entry point).

### Added

- Initial C64 support. To setup a C64 project, use a `kcide.project.json` file like this:

    ```json
    {
        "emulator": {
            "system": "C64"
        },
        "assembler": {
            "cpu": "6502",
            "srcDir": "src",
            "mainSourceFile": "main.asm",
            "outDir": "build",
            "outBaseFilename": "out",
            "outFiletype": "PRG"
        }
    }
    ```

- Syntax highlighting has been extended with special ASMX keyword and 6502 mnemonics.

## [1.5.0] - 2023-12-19

### Changed

- Update emulators with improved emulation of the CTC CLKTRG0..3 input pins.

## [1.4.0] - 2023-12-19

### Changed

- An active debug session is now automatically terminated on emulator reset or reboot.

## [1.3.0] - 2023-12-14

### Added

- The KC85/4 emulator can now access the video RAM banks in the memory editor windows.

## [1.2.0] - 2023-12-13

### Added

- The KC emulator now has a 'stopwatch' window for performance profiling (under the menu item `Debug => Stopwatch`)

## [1.1.3] - 2023-12-12

### Changed
- More release process fixes.

## [1.1.2] - 2023-12-12

### Changed
- Fix changelog update happening before publishing

## [1.1.1] - 2023-12-12

### Changed
- Initial release
