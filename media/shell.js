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
            case 'loadkcc': loadkcc(msg.kcc); break;
            default: console.log('unknown cmd called'); break;
        }
    });
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

function loadkcc(buf /*ArrayBuffer*/) {
    const kcc = new Uint8Array(buf);
    const size = kcc.length;
    console.log(`### loadkcc called (size: ${size})`);
    console.log(kcc);
    const ptr = Module._webapi_alloc(size);
    Module.HEAPU8.set(kcc, ptr);
    Module._webapi_quickload(ptr, size);
    Module._webapi_free(ptr);
}
