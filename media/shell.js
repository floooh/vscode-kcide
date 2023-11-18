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
    window.addEventListener('message', ev => {
        const msg = ev.data;
        switch (msg.cmd) {
            case 'boot': boot(); break;
            case 'reset': reset(); break;
            case 'loadkcc': loadkcc(msg.kcc, msg.start, msg.stopOnEntry); break;
            default: console.log('unknown cmd called'); break;
        }
    });
    Module.vsCodeApi = acquireVsCodeApi();
    Module.webapi_onStopped = (break_type, addr) => {
        console.log(`shell.html: onStopped event received: break_type=${break_type}, addr=${addr}`);
        Module.vsCodeApi.postMessage({ command: 'emu_stopped', breakType: break_type, addr: addr });
    };
    Module.webapi_onContinued = () => {
        console.log('shell.html: onContinued event received');
        Module.vsCodeApi.postMessage({ command: 'emu_continued' });
    };
    Module._webapi_disable_speaker_icon();
};

function boot() {
    console.log('### boot called!');
    Module._webapi_boot();
}

function reset() {
    console.log('### reset called');
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
    console.log(`### loadkcc called (size: ${size}, start: ${start}, stopOnEntry: ${stopOnEntry})`);
    console.log(kcc);
    const ptr = Module._webapi_alloc(size);
    Module.HEAPU8.set(kcc, ptr);
    Module._webapi_quickload(ptr, size, start ? 1:0, stopOnEntry ? 1:0);
    Module._webapi_free(ptr);
}
