# Changelog
All notable changes to the "vscode-kcide" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

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
