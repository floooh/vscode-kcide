var Module = {
    preRun: [],
    postRun: [
        () => { init(); }
    ],
    print: (() => {
        return (text) => {
            text = Array.prototype.slice.call(arguments).join(' ');
            console.log(text);
        };
    })(),
    printErr: (text) => {
        text = Array.prototype.slice.call(arguments).join(' ');
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

function id(id) {
    return document.getElementById(id);
}

function init() {
    // see emu.ts
    window.addEventListener('message', ev => {
        const msg = ev.data;
        switch (msg.cmd) {
            case 'boot': boot(); break;
            case 'reset': reset(); break;
            case 'ready': ready(); break;
            case 'loadkcc': loadkcc(msg.kcc, msg.start, msg.stopOnEntry); break;
            case 'updateBreakpoints': dbgUpdateBreakpoints(msg.removeAddrs, msg.addAddrs); break;
            case 'pause': dbgPause(); break;
            case 'continue': dbgContinue(); break;
            case 'step': dbgStep(); break;
            case 'stepIn': dbgStepIn(); break;
            case 'cpuState': dbgCpuState(); break;
            default: console.log('unknown cmd called'); break;
        }
    });
    Module.vsCodeApi = acquireVsCodeApi();
    Module.webapi_onStopped = (stop_reason, addr) => {
        Module.vsCodeApi.postMessage({ command: 'emu_stopped', stopReason: stop_reason, addr: addr });
    };
    Module.webapi_onContinued = () => {
        Module.vsCodeApi.postMessage({ command: 'emu_continued' });
    };
    Module._webapi_enable_external_debugger();
};

function boot() {
    Module._webapi_boot();
}

function reset() {
    Module._webapi_reset();
}

function ready() {
    const result = Module._webapi_ready();
    Module.vsCodeApi.postMessage({ command: 'emu_ready', isReady: result });
}

/**
 * @param {ArrayBuffer} buf
 * @param {boolean} start
 * @param {boolean} stopOnEntry
 */
function loadkcc(buf, start, stopOnEntry) {
    const kcc = new Uint8Array(buf);
    const size = kcc.length;
    console.log(kcc);
    const ptr = Module._webapi_alloc(size);
    Module.HEAPU8.set(kcc, ptr);
    Module._webapi_quickload(ptr, size, start ? 1:0, stopOnEntry ? 1:0);
    Module._webapi_free(ptr);
}

/**
 * @param {number[]} removeAddrs
 * @param {number[]} addAddrs
 */
function dbgUpdateBreakpoints(removeAddrs, addAddrs) {
    removeAddrs.forEach((addr) => Module._webapi_dbg_remove_breakpoint(addr));
    addAddrs.forEach((addr) => Module._webapi_dbg_add_breakpoint(addr));
}

function dbgPause() {
    Module._webapi_dbg_break();
}

function dbgContinue() {
    Module._webapi_dbg_continue();
}

function dbgStep() {
    Module._webapi_dbg_step_next();
}

function dbgStepIn() {
    Module._webapi_dbg_step_into();
}

function dbgCpuState() {
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
