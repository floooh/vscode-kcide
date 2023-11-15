var Module = {
    preRun: [
        () => { init(); } 
    ],
    postRun: [],
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
            case 'loadkcc': loadkcc(msg.kcc); break;
            default: console.log('unknown cmd called'); break;
        }
    });
};

function loadkcc(kcc) {
    console.log('### loadkcc called!');
}
