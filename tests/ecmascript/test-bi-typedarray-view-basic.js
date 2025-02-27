/*
 *  Very basic view test.
 */

/*@include util-buffer.js@*/

/*===
basic view test
[object ArrayBuffer]
16
00000000000000000000000000000000
0000000000aa00005500000000000000
undefined undefined undefined -86 0 0 undefined
true 432
false undefined
false undefined undefined
false undefined undefined
0000000000c1c2c35500000000000000
-4
0000000000c1c2c3fc00000000000000
===*/

//  - The given byteOffset must be a multiple of the element size of the specific type, otherwise an exception is raised.
//  - ES2015 agrees: Section 22.2.1.4, Step 10: http://www.ecma-international.org/ecma-262/6.0/index.html#sec-%typedarray%-buffer-byteoffset-length

function basicViewTest() {
    var b = new ArrayBuffer(16);
    var v, v2;
    var i;

    print(Object.prototype.toString.call(b));
    print(b.byteLength);
    print(bufferToHex(b));

    // basic uint8 view
    v = new Uint8Array(b);
    v[5] = 0xaa;
    v[8] = 0x55;
    print(bufferToHex(v));

    // offsetted and limited view
    v = new Int8Array(b, 5, 3);
    // '1x' is not a valid index, or even a canonical numeric index string
    // 'Infinity' is not a valid index, but *is* a canonical numeric index string and has special [[Set]] handling
    // '-1' is not a valid index, but is a canonical numeric index string and has special [[Set]] handling
    // '3' is not a valid index, but is a canonical numeric index string and has special [[Set]] handling
    print(v['1x'], v['Infinity'], v[-1], v[0], v[1], v[2], v[3]);
    v['1x'] = 0x1b0;  // becomes a '1x' string property, not clamped because it's not an index property
    v['Infinity'] = 0x1b1;  // silently dropped by 'Set'
    v[-1] = 0x1c0;   // silently dropped by 'Set'
    v[0] = 0x1c1;
    v[1] = 0x1c2;
    v[2] = 0x1c3;
    v[3] = 0x1c4;  // silently dropped, out of view, does not become a concrete property
    print('1x' in v, v['1x']);
    print('Infinity' in v, v['Infinity']);
    print('-1' in v, v[-1], v['-1']);
    print('3' in v, v[3], v['3']);
    print(bufferToHex(v));

    // write signed from one view, read unsigned from another view, offsetted
    v = new Uint8Array(b, 4, 8);  // [4,11]
    v2 = new Int8Array(b, 6, 3);  // [6,8]
    v[4] = 0xfc;
    print(v2[2]);
    print(bufferToHex(v2));
}

try {
    print('basic view test');
    basicViewTest();
} catch (e) {
    print(e.stack || e);
}
