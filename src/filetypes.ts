// see: https://en.wikipedia.org/wiki/Intel_HEX

function findMinMaxAddr(lines: string[]): { minAddr: number, maxAddr: number } {
    let minAddr = 0xFFFF;
    let maxAddr = 0;
    lines.forEach((line) => {
        if (line.startsWith(':')) {
            const numBytes = parseInt(line.slice(1, 3), 16);
            const addr = parseInt(line.slice(3, 7), 16);
            if (addr < minAddr) {
                minAddr = addr;
            }
            if ((addr + numBytes) > maxAddr) {
                maxAddr = addr + numBytes;
            }
        }
    });
    return { minAddr, maxAddr };
}

function appendHexData(arr: Uint8Array, minAddr: number, headerSize: number, lines: string[]) {
    lines.forEach((line) => {
        if (line.startsWith(':')) {
            const numBytes = parseInt(line.slice(1, 3), 16);
            const index = (parseInt(line.slice(3, 7), 16) - minAddr) + headerSize;
            const type = parseInt(line.slice(7, 9), 16);
            if (type !== 0) {
                throw new Error(`Invalid ihex record type encountered: ${type}`);
            }
            for (let i = 0; i < numBytes; i++) {
                const si = 9 + 2*i;
                const byte = parseInt(line.slice(si, si+2), 16);
                arr[index + i] = byte;
            }
        }
    });
}

// FIXME: add this stuff right into asmx?
export function hexToKCC(hex: string, withExecAddr: boolean) {
    const lines = hex.split('\n');
    const { minAddr, maxAddr } = findMinMaxAddr(lines);
    const execAddr = minAddr;

    // generate KCC header
    const kccHeaderSize = 128;
    const numBytes = kccHeaderSize + (maxAddr - minAddr);
    const kcc = new Uint8Array(numBytes);
    // bytes 0..15: name
    [...'KCIDE'].forEach((c, i) => {
        kcc[i] = c.charCodeAt(0);
    });
    // byte 16: num_addr
    kcc[16] = withExecAddr ? 3 : 2;
    // bytes 17, 18: load_addr_l, load_addr_h
    kcc[17] = minAddr & 0xFF;
    kcc[18] = (minAddr & 0xFF00) >> 8;
    // bytes 19, 20: end_addr_l, end_addr_h
    kcc[19] = maxAddr & 0xFF;
    kcc[20] = (maxAddr & 0xFF00) >> 8;
    // bytes 21, 22: exec_addr_l, exec_addr_h
    kcc[21] = execAddr & 0xFF;
    kcc[22] = (execAddr & 0xFF00) >> 8;

    // fill rest with data
    appendHexData(kcc, minAddr, kccHeaderSize, lines);
    return kcc;
}

export function hexToPRG(hex: string) {
    const lines = hex.split('\n');
    const { minAddr, maxAddr } = findMinMaxAddr(lines);
    const prgHeaderSize = 2;
    const numBytes = prgHeaderSize + (maxAddr - minAddr);
    const prg = new Uint8Array(numBytes);
    // 2 byte header is start address in little endian
    prg[0] = minAddr & 0xFF;
    prg[1] = (minAddr & 0xFF00) >> 8;
    appendHexData(prg, minAddr, prgHeaderSize, lines);
    return prg;
}
