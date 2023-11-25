var Module = {
    preRun: [],
    postRun: [
        () => { kcide_init(); }
    ],
    print: (() => {
        return (...args) => {
            text = Array.prototype.slice.call(args).join(' ');
            console.log(text);
        };
    })(),
    printErr: (...args) => {
        text = Array.prototype.slice.call(args).join(' ');
        console.error(text);
    },
    canvas: (() => {
        var canvas = document.getElementById('canvas');
        canvas.addEventListener('webglcontextlost', function(e) { alert('FIXME: WebGL context lost, please reload the page'); e.preventDefault(); }, false);
        return canvas;
    })(),
    setStatus: () => { },
    monitorRunDependencies: () => { },
};

function kcide_init() {
    // see emu.ts
    window.addEventListener('message', ev => {
        const msg = ev.data;
        switch (msg.cmd) {
            case 'boot': kcide_boot(); break;
            case 'reset': kcide_reset(); break;
            case 'ready': kcide_ready(); break;
            case 'loadkcc': kcide_loadkcc(msg.kcc, msg.start, msg.stopOnEntry); break;
            case 'connect': kcide_dbgConnect(); break;
            case 'disconnect': kcide_dbgDisconnect(); break;
            case 'updateBreakpoints': kcide_dbgUpdateBreakpoints(msg.removeAddrs, msg.addAddrs); break;
            case 'pause': kcide_dbgPause(); break;
            case 'continue': kcide_dbgContinue(); break;
            case 'step': kcide_dbgStep(); break;
            case 'stepIn': kcide_dbgStepIn(); break;
            case 'cpuState': kcide_dbgCpuState(); break;
            case 'disassemble': kcide_dbgDisassemble(msg.addr, msg.offsetLines, msg.numLines); break;
            default: console.log(`unknown cmd called: ${msg.cmd}`); break;
        }
    });
    Module.vsCodeApi = acquireVsCodeApi();
    Module.webapi_onStopped = (stop_reason, addr) => {
        Module.vsCodeApi.postMessage({ command: 'emu_stopped', stopReason: stop_reason, addr: addr });
    };
    Module.webapi_onContinued = () => {
        Module.vsCodeApi.postMessage({ command: 'emu_continued' });
    };
    Module._webapi_dbg_connect();
};

function kcide_dbgConnect() {
    Module._webapi_dbg_connect();
}

function kcide_dbgDisconnect() {
    Module._webapi_dbg_disconnect();
}

function kcide_boot() {
    Module._webapi_boot();
}

function kcide_reset() {
    Module._webapi_reset();
}

function kcide_ready() {
    const result = Module._webapi_ready();
    Module.vsCodeApi.postMessage({ command: 'emu_ready', isReady: result });
}

/**
 * @param {ArrayBuffer} buf
 * @param {boolean} start
 * @param {boolean} stopOnEntry
 */
function kcide_loadkcc(buf, start, stopOnEntry) {
    const kcc = new Uint8Array(buf);
    const size = kcc.length;
    const ptr = Module._webapi_alloc(size);
    Module.HEAPU8.set(kcc, ptr);
    Module._webapi_quickload(ptr, size, start ? 1:0, stopOnEntry ? 1:0);
    Module._webapi_free(ptr);
}

/**
 * @param {number[]} removeAddrs
 * @param {number[]} addAddrs
 */
function kcide_dbgUpdateBreakpoints(removeAddrs, addAddrs) {
    removeAddrs.forEach((addr) => Module._webapi_dbg_remove_breakpoint(addr));
    addAddrs.forEach((addr) => Module._webapi_dbg_add_breakpoint(addr));
}

function kcide_dbgPause() {
    Module._webapi_dbg_break();
}

function kcide_dbgContinue() {
    Module._webapi_dbg_continue();
}

function kcide_dbgStep() {
    Module._webapi_dbg_step_next();
}

function kcide_dbgStepIn() {
    Module._webapi_dbg_step_into();
}

function kcide_dbgCpuState() {
    // see chips-test webapi.h/webapi_cpu_state_t
    const u16idx = Module._webapi_dbg_cpu_state()>>1;
    let state = { type: 'unknown' };
    if (Module.HEAPU16[u16idx + 0] === 1) {
        // must match types.ts/CPUState
        state = {
            type: 'Z80',
            z80: {
                af:  Module.HEAPU16[u16idx + 1],
                bc:  Module.HEAPU16[u16idx + 2],
                de:  Module.HEAPU16[u16idx + 3],
                hl:  Module.HEAPU16[u16idx + 4],
                ix:  Module.HEAPU16[u16idx + 5],
                iy:  Module.HEAPU16[u16idx + 6],
                sp:  Module.HEAPU16[u16idx + 7],
                pc:  Module.HEAPU16[u16idx + 8],
                af2: Module.HEAPU16[u16idx + 9],
                bc2: Module.HEAPU16[u16idx + 10],
                de2: Module.HEAPU16[u16idx + 11],
                hl2: Module.HEAPU16[u16idx + 12],
                im:  Module.HEAPU16[u16idx + 13],
                ir:  Module.HEAPU16[u16idx + 14],
                iff: Module.HEAPU16[u16idx + 15],
            }
        };
    }
    Module.vsCodeApi.postMessage({ command: 'emu_cpustate', state });
}

function kcide_dbgDisassemble(addr, offset_lines, num_lines) {
    // NOTE: ptr points to an array of webapi_dasm_line_t structs:
    //
    //  uint16_t addr;
    //  uint8_t num_bytes;
    //  uint8_t num_addr;
    //  uint8_t bytes[8];
    //  uint8_t chars[32];
    //
    const ptr = Module._webapi_dbg_request_disassembly(addr, offset_lines, num_lines);
    const result = [];
    for (let line_idx = 0; line_idx < num_lines; line_idx++) {
        const p = ptr + line_idx * 44;
        const addr = Module.HEAPU16[p>>1];
        const num_bytes = Module.HEAPU8[p + 2];
        const num_chars = Module.HEAPU8[p + 3];
        const bytes = [];
        let chars = '';
        for (let i = 0; i < num_bytes; i++) {
            bytes.push(Module.HEAPU8[p + 4 + i]);
        }
        for (let i = 0; i < num_chars; i++) {
            chars += String.fromCharCode(Module.HEAPU8[p + 12 + i]);
        }
        result.push({ addr, bytes, chars });
    }
    Module._webapi_dbg_release_disassembly(ptr);
    Module.vsCodeApi.postMessage({ command: 'emu_disassembly', result });
}
