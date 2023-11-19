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
            case 'loadkcc': loadkcc(msg.kcc, msg.start, msg.stopOnEntry); break;
            case 'updateBreakpoints': dbgUpdateBreakpoints(msg.removeAddrs, msg.addAddrs); break;
            case 'pause': dbgPause(); break;
            case 'continue': dbgContinue(); break;
            case 'step': dbgStep(); break;
            case 'stepIn': dbgStepIn(); break;
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
