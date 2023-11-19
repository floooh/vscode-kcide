# A KC85 Assembly IDE for Visual Studio Code

NOTE: WIP, do not use yet!

## Preliminary Instructions

- currently the following extension dependency must be installed manually as **pre-release** version
  (automatic installation doesn't work yet because that extension doesn't have a release version yet):
  https://marketplace.visualstudio.com/items?itemName=ms-vscode.wasm-wasi-core

- start by opening VSCode in a folder with a file `kcide.project.json` looking like this:

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

- create a directory `src` and in it, a file `main.asm`:

  ```asm
      ld a,5
      ld b,6
      add a,b
      ret
  ```

- run the palette command `KCIDE: Debug` (Ctrl/Cmd + Shift + P => KCIDE: Debug)

- syntax highlighting support based on https://github.com/mborik/z80-macroasm-vscode/blob/main/syntaxes/z80-macroasm.tmLanguage.json