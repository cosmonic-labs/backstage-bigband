const base64Compile = str => WebAssembly.compile(typeof Buffer !== 'undefined' ? Buffer.from(str, 'base64') : Uint8Array.from(atob(str), b => b.charCodeAt(0)));

class ComponentError extends Error {
  constructor (value) {
    const enumerable = typeof value !== 'string';
    super(enumerable ? `${String(value)} (see error.payload)` : value);
    Object.defineProperty(this, 'payload', { value, enumerable });
  }
}

let dv = new DataView(new ArrayBuffer());
const dataView = mem => dv.buffer === mem.buffer ? dv : dv = new DataView(mem.buffer);

const instantiateCore = WebAssembly.instantiate;

function throwInvalidBool() {
  throw new TypeError('invalid variant discriminant for bool');
}

const utf8Decoder = new TextDecoder();

let exports0;
let memory0;

function getNodeDeps() {
  const ret = exports0['backstage:plugins/frontend#get-node-deps']();
  let variant6;
  switch (dataView(memory0).getUint8(ret + 0, true)) {
    case 0: {
      var len4 = dataView(memory0).getInt32(ret + 8, true);
      var base4 = dataView(memory0).getInt32(ret + 4, true);
      var result4 = [];
      for (let i = 0; i < len4; i++) {
        const base = base4 + i * 24;
        var ptr0 = dataView(memory0).getInt32(base + 0, true);
        var len0 = dataView(memory0).getInt32(base + 4, true);
        var result0 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr0, len0));
        let variant2;
        switch (dataView(memory0).getUint8(base + 8, true)) {
          case 0: {
            variant2 = undefined;
            break;
          }
          case 1: {
            var ptr1 = dataView(memory0).getInt32(base + 12, true);
            var len1 = dataView(memory0).getInt32(base + 16, true);
            var result1 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr1, len1));
            variant2 = result1;
            break;
          }
          default: {
            throw new TypeError('invalid variant discriminant for option');
          }
        }
        var bool3 = dataView(memory0).getUint8(base + 20, true);
        result4.push({
          name: result0,
          version: variant2,
          dev: bool3 == 0 ? false : (bool3 == 1 ? true : throwInvalidBool()),
        });
      }
      variant6= {
        tag: 'ok',
        val: result4
      };
      break;
    }
    case 1: {
      var ptr5 = dataView(memory0).getInt32(ret + 4, true);
      var len5 = dataView(memory0).getInt32(ret + 8, true);
      var result5 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr5, len5));
      variant6= {
        tag: 'err',
        val: result5
      };
      break;
    }
    default: {
      throw new TypeError('invalid variant discriminant for expected');
    }
  }
  if (variant6.tag === 'err') {
    throw new ComponentError(variant6.val);
  }
  return variant6.val;
}

function getComponentFiles() {
  const ret = exports0['backstage:plugins/frontend#get-component-files']();
  let variant7;
  switch (dataView(memory0).getUint8(ret + 0, true)) {
    case 0: {
      var len5 = dataView(memory0).getInt32(ret + 8, true);
      var base5 = dataView(memory0).getInt32(ret + 4, true);
      var result5 = [];
      for (let i = 0; i < len5; i++) {
        const base = base5 + i * 32;
        var ptr0 = dataView(memory0).getInt32(base + 0, true);
        var len0 = dataView(memory0).getInt32(base + 4, true);
        var result0 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr0, len0));
        var bool1 = dataView(memory0).getUint8(base + 8, true);
        let variant3;
        switch (dataView(memory0).getUint8(base + 12, true)) {
          case 0: {
            variant3 = undefined;
            break;
          }
          case 1: {
            var ptr2 = dataView(memory0).getInt32(base + 16, true);
            var len2 = dataView(memory0).getInt32(base + 20, true);
            var result2 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr2, len2));
            variant3 = result2;
            break;
          }
          default: {
            throw new TypeError('invalid variant discriminant for option');
          }
        }
        var ptr4 = dataView(memory0).getInt32(base + 24, true);
        var len4 = dataView(memory0).getInt32(base + 28, true);
        var result4 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr4, len4));
        result5.push({
          path: result0,
          isRoot: bool1 == 0 ? false : (bool1 == 1 ? true : throwInvalidBool()),
          componentName: variant3,
          contents: result4,
        });
      }
      variant7= {
        tag: 'ok',
        val: result5
      };
      break;
    }
    case 1: {
      var ptr6 = dataView(memory0).getInt32(ret + 4, true);
      var len6 = dataView(memory0).getInt32(ret + 8, true);
      var result6 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr6, len6));
      variant7= {
        tag: 'err',
        val: result6
      };
      break;
    }
    default: {
      throw new TypeError('invalid variant discriminant for expected');
    }
  }
  if (variant7.tag === 'err') {
    throw new ComponentError(variant7.val);
  }
  return variant7.val;
}

const $init = (async() => {
  const module0 = base64Compile('AGFzbQEAAAABDQJgAAF/YAR/f39/AX8DBAMAAAEFAwEAAAd1BChiYWNrc3RhZ2U6cGx1Z2lucy9mcm9udGVuZCNnZXQtbm9kZS1kZXBzAAAuYmFja3N0YWdlOnBsdWdpbnMvZnJvbnRlbmQjZ2V0LWNvbXBvbmVudC1maWxlcwABBm1lbW9yeQIADGNhYmlfcmVhbGxvYwACCg0DAwAACwMAAAsDAAALAC4JcHJvZHVjZXJzAQxwcm9jZXNzZWQtYnkBDXdpdC1jb21wb25lbnQGMC4yMC4w');
  ({ exports: exports0 } = await instantiateCore(await module0));
  memory0 = exports0.memory;
})();

await $init;
const frontend = {
  getComponentFiles: getComponentFiles,
  getNodeDeps: getNodeDeps,
  
};

export { frontend,  }