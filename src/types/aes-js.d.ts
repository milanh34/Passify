declare module 'aes-js' {
  export namespace utils {
    namespace utf8 {
      function toBytes(text: string): number[];
      function fromBytes(bytes: number[] | Uint8Array): string;
    }
    namespace hex {
      function toBytes(hex: string): number[];
      function fromBytes(bytes: number[] | Uint8Array): string;
    }
  }


  export class Counter {
    constructor(initialValue: number[] | Uint8Array);
  }


  export namespace ModeOfOperation {
    class ctr {
      constructor(key: number[] | Uint8Array, counter: Counter);
      encrypt(plaintext: number[] | Uint8Array): Uint8Array;
      decrypt(ciphertext: number[] | Uint8Array): Uint8Array;
    }
    class cbc {
      constructor(key: number[] | Uint8Array, iv: number[] | Uint8Array);
      encrypt(plaintext: number[] | Uint8Array): Uint8Array;
      decrypt(ciphertext: number[] | Uint8Array): Uint8Array;
    }
    class cfb {
      constructor(key: number[] | Uint8Array, iv: number[] | Uint8Array, segmentSize?: number);
      encrypt(plaintext: number[] | Uint8Array): Uint8Array;
      decrypt(ciphertext: number[] | Uint8Array): Uint8Array;
    }
    class ofb {
      constructor(key: number[] | Uint8Array, iv: number[] | Uint8Array);
      encrypt(plaintext: number[] | Uint8Array): Uint8Array;
      decrypt(ciphertext: number[] | Uint8Array): Uint8Array;
    }
    class ecb {
      constructor(key: number[] | Uint8Array);
      encrypt(plaintext: number[] | Uint8Array): Uint8Array;
      decrypt(ciphertext: number[] | Uint8Array): Uint8Array;
    }
  }


  export function padding_pkcs7_pad(data: number[] | Uint8Array): Uint8Array;
  export function padding_pkcs7_strip(data: number[] | Uint8Array): Uint8Array;
}
