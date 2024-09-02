An assembler IDE for 8-bit home computers (currently KC85/3, KC85/4, C64 and Amstrad CPC) with integrated assembler and debugger.

## Screenshots

![screenshot-1](/screenshots/vscode-kcide-1.webp)

![screenshot-4](/screenshots/vscode-kcide-4.webp)

![screenshot-5](/screenshots/vscode-kcide-5.webp)

![screenshot-3](/screenshots/vscode-kcide-3.webp)

## Quickstart

- clone https://github.com/floooh/kcide-sample
- open VSCode in one of the following subdirectories:
  - `kc854/`: for the KC85/4 sample
  - `c64/`: for the C64 sample
  - `cpc/`: for the Amstrad CPC sample
- the extension should detect the `kcide.project.json` file and activate itself
  (a new tab should open with the embedded emulator)
- open the `src/main.asm` file, and hit **F7**, you should see a message
  `Output written to ...`, and a new subdirectory `build/` should have been
  created with the files `out.hex`, `out.lst` and `out.map`, and a system-specific
  binary file (`out.kcc`, `out.prg` or `out.bin`)
- with the `src/main` file loaded and active, press **F5** to start a debug session
- explore additional features by opening the VSCode command palette and typing `kcide`

## Feature Overview

- build the project into a KCC or PRG file by pressing **F7**
- build and debug the project by pressing **F5**
- explore additional commands in the command palette by typing `kcide`
- the assembler is a slightly extended [ASMX](http://svn.xi6.com/svn/asmx/branches/2.x/asmx-doc.html) compiled to WASI, the changes are tracked [here](https://github.com/floooh/easmx)
- the emulators are taken from the [chips project](https://floooh.github.io/tiny8bit/) compiled to WASM+WebGL, running in a VSCode tab
- original syntax highlighting https://github.com/mborik/z80-macroasm-vscode/blob/main/syntaxes/z80-macroasm.tmLanguage.json,
  extended for 6502 assembler syntax and special ASMX keywords
- during a debug session, you can change into the 'raw' disassembly view at any time by running the palette command `Open Disassembly View`, this also happens automatically when stepping into code
that's not part of the project (such as operating system code)
- you can inspect memory by hovering over a CPU register in the VSCode `Variables` panel and clicking
the 'binary' icon with the tooltip `View Binary Data`, however note that the emulator's integrated
debugging UI has a much more powerful memory viewer and editor than what VSCode can provide through the Debug Adapter Protocol

## Starting a new KC85 project

- create a new project directory and cd into it
- create a file `project.kcide.json` looking like this, tweak the attributes as needed (the extension provides a JSON schema to VSCode to provide completion and validation):

  ```json
  {
    "emulator": {
        "system": "KC85/4"
    },
    "assembler": {
        "srcDir": "src",
        "mainSourceFile": "main.asm",
        "cpu": "Z80",
        "outDir": "build",
        "outBaseFilename": "hello",
        "outFiletype": "KCC"
    }
  }
  ```
- ...also put the `outDir` value into your `.gitignore`
- create a directory `src/` and in it a file `main.asm` execution will start
  at the label `_start`:

  ```asm
      org 200h
  _start:
      ld a,5
      ld b,6
      add a,b
      ret
  ```

- test building by pressing **F7** or running the palette command `KCIDE: Build`
- test debugging by pressing **F5** or running the palette command `KCIDE: Debug`

## Starting a new C64 project

- create a new project directory and cd into it
- create a file `project.kcide.json` looking like this, tweak the attributes as needed (the extension provides a JSON schema to VSCode to provide completion and validation):

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
- ...also put the `outDir` value into your `.gitignore`
- create a directory `src/` and in it a file `main.asm` execution will start
  at the label `_start`

  ```asm
        org $801
  _start:
        lda #5
        clc
        adc #6
        rts
  ```

- test building by pressing **F7** or running the palette command `KCIDE: Build`
- test debugging by pressing **F5** or running the palette command `KCIDE: Debug`
- for a more 'idiomatic' C64 PRG sample, check the example project here: https://github.com/floooh/kcide-sample/tree/main/c64

## Starting a new Amstrad CPC project

- create a new project directory and cd into it
- create a file `project.kcide.json` looking like this, tweak the attributes as needed (the extension provides a JSON schema to VSCode to provide completion and validation):

  ```json
  {
      "emulator": {
          "system": "CPC6128"
      },
      "assembler": {
          "cpu": "Z80",
          "srcDir": "src",
          "mainSourceFile": "main.asm",
          "outDir": "build",
          "outBaseFilename": "out",
          "outFiletype": "AMSDOS_BIN"
      }
  }
  ```
- ...also put the `outDir` value into your `.gitignore`
- create a directory `src/` and in it a file `main.asm` execution will start
  at the label `_start`

  ```asm
      org 4000h
  _start:
      ld a,5
      ld b,6
      add a,b
      ret
  ```

- test building by pressing **F7** or running the palette command `KCIDE: Build`
- test debugging by pressing **F5** or running the palette command `KCIDE: Debug`
- for a more 'idiomatic' C64 PRG sample, check the example project here: https://github.com/floooh/kcide-sample/tree/main/c64


## The integrated debugging UI

The emulator comes with an integrated debugging UI implemented with [Dear ImGui](https://github.com/ocornut/imgui) which is much more powerful than what the VSCode debug adapter protocol can provide:

![screenshot-2](/screenshots/vscode-kcide-2.webp)

- the integrated CPU debugger allows to step in single clock cycles instead of full instructions
  and displays the actual cycle count of executed instructions
- more powerful breakpoints:
  - break on memory access
  - break on IO access
  - break on interrupts
  - break on specific raster scanlines (C64 only)
- a much more powerful memory view/edit window
- an execution history window
- status windows for the CPU and system chips
- ...and more

## Running in VSCode for Web

The extension has 'best effort' support for running in the VSCode browser version with the
following known issues:

- currently only the Insider version is supported (https://insiders.vscode.dev/)
- currently only working on local repositories is supported, directly opening
Github respositories doesn't work
- starting a debug session for the first time seems to take considerably longer
than on the desktop VSCode version
