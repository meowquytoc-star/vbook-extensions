load('config.js');

// Cucumbermanga dùng plugin "wp-manga-chapter-images-protection":
// chapter_data = JSON {ct, iv, s} - AES-256-CBC + EVP_BytesToKey (MD5)
// passphrase = wpmangaprotectornonce
// Plaintext = JSON string of array of image URLs

// ─── Hex decode ─────────────────────────────────────────────
function hexToBytes(h) {
    var b = [];
    for (var i = 0; i < h.length; i += 2) {
        b.push(parseInt(h.substr(i, 2), 16));
    }
    return b;
}

// ─── Base64 decode → byte array ─────────────────────────────
var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function b64ToBytes(s) {
    s = s.replace(/[^A-Za-z0-9+/=]/g, '');
    var b = [], i, c1, c2, c3, c4;
    for (i = 0; i < s.length; i += 4) {
        c1 = B64.indexOf(s.charAt(i));
        c2 = B64.indexOf(s.charAt(i + 1));
        c3 = B64.indexOf(s.charAt(i + 2));
        c4 = B64.indexOf(s.charAt(i + 3));
        b.push((c1 << 2) | (c2 >> 4));
        if (s.charAt(i + 2) !== '=') b.push(((c2 & 15) << 4) | (c3 >> 2));
        if (s.charAt(i + 3) !== '=') b.push(((c3 & 3) << 6) | c4);
    }
    return b;
}

// ─── UTF-8 string → byte array ──────────────────────────────
function strToBytes(s) {
    var b = [];
    for (var i = 0; i < s.length; i++) {
        var c = s.charCodeAt(i);
        if (c < 0x80) b.push(c);
        else if (c < 0x800) { b.push(0xC0 | (c >> 6)); b.push(0x80 | (c & 0x3F)); }
        else { b.push(0xE0 | (c >> 12)); b.push(0x80 | ((c >> 6) & 0x3F)); b.push(0x80 | (c & 0x3F)); }
    }
    return b;
}

// ─── byte array → UTF-8 string ──────────────────────────────
function bytesToStr(b) {
    var s = '', i = 0;
    while (i < b.length) {
        var c = b[i++];
        if (c < 0x80) s += String.fromCharCode(c);
        else if (c < 0xE0) s += String.fromCharCode(((c & 0x1F) << 6) | (b[i++] & 0x3F));
        else { var c2 = b[i++]; var c3 = b[i++]; s += String.fromCharCode(((c & 0x0F) << 12) | ((c2 & 0x3F) << 6) | (c3 & 0x3F)); }
    }
    return s;
}

// ─── MD5 implementation (RFC 1321) ──────────────────────────
function md5(input) {
    function add32(a, b) { return (a + b) & 0xFFFFFFFF; }
    function rol(n, c) { return ((n << c) | (n >>> (32 - c))) & 0xFFFFFFFF; }
    function ff(a, b, c, d, x, s, t) { return add32(rol(add32(add32(a, (b & c) | (~b & d)), add32(x, t)), s), b); }
    function gg(a, b, c, d, x, s, t) { return add32(rol(add32(add32(a, (b & d) | (c & ~d)), add32(x, t)), s), b); }
    function hh(a, b, c, d, x, s, t) { return add32(rol(add32(add32(a, b ^ c ^ d), add32(x, t)), s), b); }
    function ii(a, b, c, d, x, s, t) { return add32(rol(add32(add32(a, c ^ (b | ~d)), add32(x, t)), s), b); }

    var msg = input.slice();
    var bitLen = msg.length * 8;
    msg.push(0x80);
    while (msg.length % 64 !== 56) msg.push(0);
    // Length in bits as 64-bit little-endian (split lo/hi to avoid JS shift mask)
    var lo = bitLen >>> 0;
    var hi = Math.floor(bitLen / 0x100000000) >>> 0;
    for (var k = 0; k < 4; k++) msg.push((lo >>> (8 * k)) & 0xFF);
    for (var k = 0; k < 4; k++) msg.push((hi >>> (8 * k)) & 0xFF);

    var a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;

    for (var i = 0; i < msg.length; i += 64) {
        var X = [];
        for (var j = 0; j < 16; j++) {
            X[j] = msg[i + j * 4] | (msg[i + j * 4 + 1] << 8) |
                   (msg[i + j * 4 + 2] << 16) | (msg[i + j * 4 + 3] << 24);
        }
        var aa = a, bb = b, cc = c, dd = d;

        a = ff(a, b, c, d, X[0],  7, 0xD76AA478); d = ff(d, a, b, c, X[1], 12, 0xE8C7B756);
        c = ff(c, d, a, b, X[2], 17, 0x242070DB); b = ff(b, c, d, a, X[3], 22, 0xC1BDCEEE);
        a = ff(a, b, c, d, X[4],  7, 0xF57C0FAF); d = ff(d, a, b, c, X[5], 12, 0x4787C62A);
        c = ff(c, d, a, b, X[6], 17, 0xA8304613); b = ff(b, c, d, a, X[7], 22, 0xFD469501);
        a = ff(a, b, c, d, X[8],  7, 0x698098D8); d = ff(d, a, b, c, X[9], 12, 0x8B44F7AF);
        c = ff(c, d, a, b, X[10],17, 0xFFFF5BB1); b = ff(b, c, d, a, X[11],22, 0x895CD7BE);
        a = ff(a, b, c, d, X[12], 7, 0x6B901122); d = ff(d, a, b, c, X[13],12, 0xFD987193);
        c = ff(c, d, a, b, X[14],17, 0xA679438E); b = ff(b, c, d, a, X[15],22, 0x49B40821);

        a = gg(a, b, c, d, X[1],  5, 0xF61E2562); d = gg(d, a, b, c, X[6],  9, 0xC040B340);
        c = gg(c, d, a, b, X[11],14, 0x265E5A51); b = gg(b, c, d, a, X[0], 20, 0xE9B6C7AA);
        a = gg(a, b, c, d, X[5],  5, 0xD62F105D); d = gg(d, a, b, c, X[10], 9, 0x02441453);
        c = gg(c, d, a, b, X[15],14, 0xD8A1E681); b = gg(b, c, d, a, X[4], 20, 0xE7D3FBC8);
        a = gg(a, b, c, d, X[9],  5, 0x21E1CDE6); d = gg(d, a, b, c, X[14], 9, 0xC33707D6);
        c = gg(c, d, a, b, X[3], 14, 0xF4D50D87); b = gg(b, c, d, a, X[8], 20, 0x455A14ED);
        a = gg(a, b, c, d, X[13], 5, 0xA9E3E905); d = gg(d, a, b, c, X[2],  9, 0xFCEFA3F8);
        c = gg(c, d, a, b, X[7], 14, 0x676F02D9); b = gg(b, c, d, a, X[12],20, 0x8D2A4C8A);

        a = hh(a, b, c, d, X[5],  4, 0xFFFA3942); d = hh(d, a, b, c, X[8], 11, 0x8771F681);
        c = hh(c, d, a, b, X[11],16, 0x6D9D6122); b = hh(b, c, d, a, X[14],23, 0xFDE5380C);
        a = hh(a, b, c, d, X[1],  4, 0xA4BEEA44); d = hh(d, a, b, c, X[4], 11, 0x4BDECFA9);
        c = hh(c, d, a, b, X[7], 16, 0xF6BB4B60); b = hh(b, c, d, a, X[10],23, 0xBEBFBC70);
        a = hh(a, b, c, d, X[13], 4, 0x289B7EC6); d = hh(d, a, b, c, X[0], 11, 0xEAA127FA);
        c = hh(c, d, a, b, X[3], 16, 0xD4EF3085); b = hh(b, c, d, a, X[6], 23, 0x04881D05);
        a = hh(a, b, c, d, X[9],  4, 0xD9D4D039); d = hh(d, a, b, c, X[12],11, 0xE6DB99E5);
        c = hh(c, d, a, b, X[15],16, 0x1FA27CF8); b = hh(b, c, d, a, X[2], 23, 0xC4AC5665);

        a = ii(a, b, c, d, X[0],  6, 0xF4292244); d = ii(d, a, b, c, X[7], 10, 0x432AFF97);
        c = ii(c, d, a, b, X[14],15, 0xAB9423A7); b = ii(b, c, d, a, X[5], 21, 0xFC93A039);
        a = ii(a, b, c, d, X[12], 6, 0x655B59C3); d = ii(d, a, b, c, X[3], 10, 0x8F0CCC92);
        c = ii(c, d, a, b, X[10],15, 0xFFEFF47D); b = ii(b, c, d, a, X[1], 21, 0x85845DD1);
        a = ii(a, b, c, d, X[8],  6, 0x6FA87E4F); d = ii(d, a, b, c, X[15],10, 0xFE2CE6E0);
        c = ii(c, d, a, b, X[6], 15, 0xA3014314); b = ii(b, c, d, a, X[13],21, 0x4E0811A1);
        a = ii(a, b, c, d, X[4],  6, 0xF7537E82); d = ii(d, a, b, c, X[11],10, 0xBD3AF235);
        c = ii(c, d, a, b, X[2], 15, 0x2AD7D2BB); b = ii(b, c, d, a, X[9], 21, 0xEB86D391);

        a = add32(a, aa); b = add32(b, bb); c = add32(c, cc); d = add32(d, dd);
    }

    var out = [];
    [a, b, c, d].forEach(function (n) {
        out.push(n & 0xFF, (n >>> 8) & 0xFF, (n >>> 16) & 0xFF, (n >>> 24) & 0xFF);
    });
    return out;
}

// ─── EVP_BytesToKey (OpenSSL-style key+iv derivation with MD5) ─
function evpBytesToKey(password, salt, keyLen) {
    var derived = [], prev = [];
    while (derived.length < keyLen) {
        prev = md5(prev.concat(password).concat(salt));
        derived = derived.concat(prev);
    }
    return derived.slice(0, keyLen);
}

// ─── AES-256 decryption (block-level) ──────────────────────
// Rijndael S-box + inverse S-box + round constants
var AES_SBOX = [99,124,119,123,242,107,111,197,48,1,103,43,254,215,171,118,202,130,201,125,250,89,71,240,173,212,162,175,156,164,114,192,183,253,147,38,54,63,247,204,52,165,229,241,113,216,49,21,4,199,35,195,24,150,5,154,7,18,128,226,235,39,178,117,9,131,44,26,27,110,90,160,82,59,214,179,41,227,47,132,83,209,0,237,32,252,177,91,106,203,190,57,74,76,88,207,208,239,170,251,67,77,51,133,69,249,2,127,80,60,159,168,81,163,64,143,146,157,56,245,188,182,218,33,16,255,243,210,205,12,19,236,95,151,68,23,196,167,126,61,100,93,25,115,96,129,79,220,34,42,144,136,70,238,184,20,222,94,11,219,224,50,58,10,73,6,36,92,194,211,172,98,145,149,228,121,231,200,55,109,141,213,78,169,108,86,244,234,101,122,174,8,186,120,37,46,28,166,180,198,232,221,116,31,75,189,139,138,112,62,181,102,72,3,246,14,97,53,87,185,134,193,29,158,225,248,152,17,105,217,142,148,155,30,135,233,206,85,40,223,140,161,137,13,191,230,66,104,65,153,45,15,176,84,187,22];
var AES_INV_SBOX = [82,9,106,213,48,54,165,56,191,64,163,158,129,243,215,251,124,227,57,130,155,47,255,135,52,142,67,68,196,222,233,203,84,123,148,50,166,194,35,61,238,76,149,11,66,250,195,78,8,46,161,102,40,217,36,178,118,91,162,73,109,139,209,37,114,248,246,100,134,104,152,22,212,164,92,204,93,101,182,146,108,112,72,80,253,237,185,218,94,21,70,87,167,141,157,132,144,216,171,0,140,188,211,10,247,228,88,5,184,179,69,6,208,44,30,143,202,63,15,2,193,175,189,3,1,19,138,107,58,145,17,65,79,103,220,234,151,242,207,206,240,180,230,115,150,172,116,34,231,173,53,133,226,249,55,232,28,117,223,110,71,241,26,113,29,41,197,137,111,183,98,14,170,24,190,27,252,86,62,75,198,210,121,32,154,219,131,214,89,16,236,229,122,239,168,159,77,174,61,224,176,156,229,15,18,38,150,159,232,21,118,35,135,229,28,53,193,127,17,114,15,178,148,87,201,131,90,108,77,182,153,73,71,242];
var AES_RCON = [0,1,2,4,8,16,32,64,128,27,54];

// Re-derive AES_INV_SBOX cleanly (the literal above might have typo — compute from AES_SBOX)
(function () {
    var inv = new Array(256);
    for (var i = 0; i < 256; i++) inv[AES_SBOX[i]] = i;
    AES_INV_SBOX = inv;
})();

function aesKeyExpansion(key) {
    // key length 32 bytes (AES-256), produces 60 words (240 bytes total)
    var w = [];
    var Nk = 8, Nr = 14;
    for (var i = 0; i < Nk; i++) {
        w[i] = [key[4*i], key[4*i+1], key[4*i+2], key[4*i+3]];
    }
    for (var ii = Nk; ii < 4 * (Nr + 1); ii++) {
        var t = w[ii - 1].slice();
        if (ii % Nk === 0) {
            t = [AES_SBOX[t[1]] ^ AES_RCON[ii / Nk], AES_SBOX[t[2]], AES_SBOX[t[3]], AES_SBOX[t[0]]];
        } else if (Nk > 6 && ii % Nk === 4) {
            t = [AES_SBOX[t[0]], AES_SBOX[t[1]], AES_SBOX[t[2]], AES_SBOX[t[3]]];
        }
        w[ii] = [w[ii - Nk][0] ^ t[0], w[ii - Nk][1] ^ t[1], w[ii - Nk][2] ^ t[2], w[ii - Nk][3] ^ t[3]];
    }
    return w;
}

function gmul(a, b) {
    var p = 0;
    for (var i = 0; i < 8; i++) {
        if (b & 1) p ^= a;
        var hi = a & 0x80;
        a = (a << 1) & 0xFF;
        if (hi) a ^= 0x1B;
        b >>= 1;
    }
    return p & 0xFF;
}

function aesDecryptBlock(input, w) {
    var Nr = 14;
    // State as column-major 4x4
    var s = [[input[0], input[4], input[8],  input[12]],
             [input[1], input[5], input[9],  input[13]],
             [input[2], input[6], input[10], input[14]],
             [input[3], input[7], input[11], input[15]]];

    function addRoundKey(round) {
        for (var c = 0; c < 4; c++) {
            var wk = w[round * 4 + c];
            for (var r = 0; r < 4; r++) s[r][c] ^= wk[r];
        }
    }
    function invSubBytes() {
        for (var r = 0; r < 4; r++)
            for (var c = 0; c < 4; c++) s[r][c] = AES_INV_SBOX[s[r][c]];
    }
    function invShiftRows() {
        var t;
        // row 1: shift right by 1
        t = s[1][3]; s[1][3] = s[1][2]; s[1][2] = s[1][1]; s[1][1] = s[1][0]; s[1][0] = t;
        // row 2: shift right by 2
        t = s[2][0]; s[2][0] = s[2][2]; s[2][2] = t; t = s[2][1]; s[2][1] = s[2][3]; s[2][3] = t;
        // row 3: shift right by 3
        t = s[3][0]; s[3][0] = s[3][1]; s[3][1] = s[3][2]; s[3][2] = s[3][3]; s[3][3] = t;
    }
    function invMixColumns() {
        for (var c = 0; c < 4; c++) {
            var a0 = s[0][c], a1 = s[1][c], a2 = s[2][c], a3 = s[3][c];
            s[0][c] = gmul(a0,14) ^ gmul(a1,11) ^ gmul(a2,13) ^ gmul(a3, 9);
            s[1][c] = gmul(a0, 9) ^ gmul(a1,14) ^ gmul(a2,11) ^ gmul(a3,13);
            s[2][c] = gmul(a0,13) ^ gmul(a1, 9) ^ gmul(a2,14) ^ gmul(a3,11);
            s[3][c] = gmul(a0,11) ^ gmul(a1,13) ^ gmul(a2, 9) ^ gmul(a3,14);
        }
    }

    addRoundKey(Nr);
    for (var rd = Nr - 1; rd >= 1; rd--) {
        invShiftRows();
        invSubBytes();
        addRoundKey(rd);
        invMixColumns();
    }
    invShiftRows();
    invSubBytes();
    addRoundKey(0);

    var out = [];
    for (var c2 = 0; c2 < 4; c2++)
        for (var r2 = 0; r2 < 4; r2++) out.push(s[r2][c2]);
    return out;
}

function aesCbcDecrypt(ct, key, iv) {
    var w = aesKeyExpansion(key);
    var out = [];
    var prev = iv.slice();
    for (var i = 0; i < ct.length; i += 16) {
        var block = ct.slice(i, i + 16);
        var dec = aesDecryptBlock(block, w);
        for (var j = 0; j < 16; j++) out.push(dec[j] ^ prev[j]);
        prev = block;
    }
    // PKCS7 unpad
    var pad = out[out.length - 1];
    if (pad > 0 && pad <= 16) out = out.slice(0, out.length - pad);
    return out;
}

// ─── Main decryption entry ─────────────────────────────────
function decryptChapterData(chapterDataStr, nonce) {
    var data;
    try { data = JSON.parse(chapterDataStr); } catch (e) { return null; }
    if (!data.ct || !data.iv || !data.s) return null;

    var salt = hexToBytes(data.s);
    var iv = hexToBytes(data.iv);
    var ct = b64ToBytes(data.ct);
    var key = evpBytesToKey(strToBytes(nonce), salt, 32);

    var plain = aesCbcDecrypt(ct, key, iv);
    var plainStr = bytesToStr(plain);

    // First parse: JSON string of JSON string (outer "stringified" the inner)
    try {
        var inner = JSON.parse(plainStr);
        var arr = (typeof inner === 'string') ? JSON.parse(inner) : inner;
        if (Array.isArray(arr)) return arr;
    } catch (e) {}
    return null;
}

// ─── Extract chapter_data + nonce from page HTML text ──────
function extractProtectorData(htmlText) {
    if (!htmlText) return null;
    var m1 = htmlText.match(/var\s+chapter_data\s*=\s*'([^']+)'/);
    var m2 = htmlText.match(/var\s+wpmangaprotectornonce\s*=\s*'([^']+)'/);
    if (!m1 || !m2) return null;
    // Unescape backslash-escapes (e.g. \/)
    var data = m1[1].replace(/\\\//g, '/').replace(/\\\\/g, '\\');
    return { data: data, nonce: m2[1] };
}

// ─── Fallback: plain inline images (older Madara versions) ──
var IMG_SELECTORS = '.reading-content img, .page-break img, .wp-manga-chapter-img, .text-left img, .entry-content img';
var VALID_EXT = /\.(webp|jpg|jpeg|png|gif|avif)(?:[?#]|$)/i;
function pushImg(arr, seen, src) {
    if (!src) return;
    src = ('' + src).trim();
    if (src.startsWith('//')) src = 'https:' + src;
    if (seen[src] || /^data:/.test(src)) return;
    if (!VALID_EXT.test(src)) return;
    seen[src] = true;
    arr.push({ link: src });
}

function execute(url) {
    // Need both DOM (for fallback) and raw HTML text (for protector data)
    var doc = getDoc(url);
    if (!doc) return Response.error("Cannot load chapter.");

    var rawHtml = '';
    try { rawHtml = doc.html(); } catch (e) {}

    // Strategy A: decrypt protected chapter_data
    var prot = extractProtectorData(rawHtml);
    if (prot) {
        var urls = decryptChapterData(prot.data, prot.nonce);
        if (urls && urls.length > 0) {
            var data = [];
            var seen = {};
            for (var i = 0; i < urls.length; i++) pushImg(data, seen, urls[i]);
            if (data.length > 0) return Response.success(data);
        }
    }

    // Strategy B: inline images (Madara unprotected)
    var data2 = [];
    var seen2 = {};
    doc.select(IMG_SELECTORS).forEach(function (e) {
        pushImg(data2, seen2, imgSrc(e));
    });
    if (data2.length === 0) {
        doc.select('img').forEach(function (e) {
            var src = imgSrc(e);
            if (/\/(uploads|wp-content|chapter|manga|images)\//i.test(src)) {
                pushImg(data2, seen2, src);
            }
        });
    }
    if (data2.length === 0) {
        var re = /(https?:\/\/[^\s"'<>]+\/(?:uploads|wp-content|chapter|manga|images)[^\s"'<>]*\.(?:webp|jpg|jpeg|png|gif|avif)(?:[?#][^\s"'<>]*)?)/ig;
        var m;
        while ((m = re.exec(rawHtml)) !== null) pushImg(data2, seen2, m[1]);
    }

    if (data2.length === 0) return Response.error("No images found. Chapter may be protected — decrypt failed.");
    return Response.success(data2);
}
