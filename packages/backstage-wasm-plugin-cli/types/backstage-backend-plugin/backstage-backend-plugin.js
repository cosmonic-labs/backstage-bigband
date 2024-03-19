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

function throwUninitialized() {
  throw new Error('Wasm uninitialized use `await $init` first');
}

const utf8Decoder = new TextDecoder();

let exports0;
let memory0;

function getRoutes() {
  if (!_initialized) throwUninitialized();
  const ret = exports0['backstage:plugins/backstage-backend-plugin#get-routes']();
  let variant4;
  switch (dataView(memory0).getUint8(ret + 0, true)) {
    case 0: {
      var len2 = dataView(memory0).getInt32(ret + 8, true);
      var base2 = dataView(memory0).getInt32(ret + 4, true);
      var result2 = [];
      for (let i = 0; i < len2; i++) {
        const base = base2 + i * 16;
        var ptr0 = dataView(memory0).getInt32(base + 0, true);
        var len0 = dataView(memory0).getInt32(base + 4, true);
        var result0 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr0, len0));
        var ptr1 = dataView(memory0).getInt32(base + 8, true);
        var len1 = dataView(memory0).getInt32(base + 12, true);
        var result1 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr1, len1));
        result2.push({
          method: result0,
          path: result1,
        });
      }
      variant4= {
        tag: 'ok',
        val: result2
      };
      break;
    }
    case 1: {
      var ptr3 = dataView(memory0).getInt32(ret + 4, true);
      var len3 = dataView(memory0).getInt32(ret + 8, true);
      var result3 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr3, len3));
      variant4= {
        tag: 'err',
        val: result3
      };
      break;
    }
    default: {
      throw new TypeError('invalid variant discriminant for expected');
    }
  }
  if (variant4.tag === 'err') {
    throw new ComponentError(variant4.val);
  }
  return variant4.val;
}

let _initialized = false;
export const $init = (async() => {
  const module0 = base64Compile('AGFzbQEAAAABDQJgAAF/YAR/f39/AX8DAwIAAQUDAQAAB1EDNWJhY2tzdGFnZTpwbHVnaW5zL2JhY2tzdGFnZS1iYWNrZW5kLXBsdWdpbiNnZXQtcm91dGVzAAAGbWVtb3J5AgAMY2FiaV9yZWFsbG9jAAEKCQIDAAALAwAACwAvCXByb2R1Y2VycwEMcHJvY2Vzc2VkLWJ5AQ13aXQtY29tcG9uZW50BzAuMjAxLjA');
  ({ exports: exports0 } = await instantiateCore(await module0));
  memory0 = exports0.memory;
  _initialized = true;
})();
const backstageBackendPlugin = {
  getRoutes: getRoutes,
  
};

export { backstageBackendPlugin,  }