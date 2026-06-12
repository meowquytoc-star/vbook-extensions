load('config.js');

// Selector ưu tiên: chính xác container ảnh chap (tránh icon UI lẫn)
const PRIMARY_SELECTORS = [
    '#manga-images img',
    '.manga-images-container img',
    'img.manga-image',
    'img.manga-img',
    'img.manga-canvas'
].join(', ');

// Fallback rộng hơn (cho chapter page format cũ)
const FALLBACK_SELECTORS = [
    '.reading-content img', '.page-break img', '.chapter-content img',
    '#content img', '.comic-reader img', '.reader-area img', '.reader img'
].join(', ');

const VALID_EXT = /\.(webp|jpg|jpeg|png|gif|avif)(?:[?#]|$)/i;
// Loại icon UI của lazycomics + asset chung của site
const EXCLUDE_PATH = /\/anime\/assets\/images\/|\/icons?\/|\/site\//i;

function isChapterImg(src) {
    if (!src) return false;
    src = ('' + src).trim();
    if (/^data:/.test(src)) return false;
    if (!VALID_EXT.test(src)) return false;
    if (EXCLUDE_PATH.test(src)) return false;
    return true;
}

function pushImg(arr, seen, src) {
    if (!isChapterImg(src)) return;
    src = ('' + src).trim();
    if (seen[src]) return;
    seen[src] = true;
    arr.push({ link: src });
}

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load chapter.");

    let data = [];
    let seen = {};

    // Strategy A: container chính xác cho chap ảnh
    doc.select(PRIMARY_SELECTORS).forEach(function (e) {
        pushImg(data, seen, imgSrc(e));
    });

    // Strategy B: selector fallback (format cũ)
    if (data.length === 0) {
        doc.select(FALLBACK_SELECTORS).forEach(function (e) {
            pushImg(data, seen, imgSrc(e));
        });
    }

    // Strategy C: mọi img có path uploads/storage
    if (data.length === 0) {
        doc.select('img').forEach(function (e) {
            let src = imgSrc(e);
            if (/\/(uploads|images|chapter|chap|storage)\//i.test(src)) {
                pushImg(data, seen, src);
            }
        });
    }

    // Strategy D: regex toàn HTML
    if (data.length === 0) {
        let html = '';
        try { html = doc.html(); } catch (e) {}
        let re = /(https?:\/\/[^\s"'<>]+\/(?:uploads|images|chapter|chap|storage)[^\s"'<>]*\.(?:webp|jpg|jpeg|png|gif|avif)(?:[?#][^\s"'<>]*)?)/ig;
        let m;
        while ((m = re.exec(html)) !== null) pushImg(data, seen, m[1]);
    }

    if (data.length === 0) {
        let html = '';
        try { html = doc.html(); } catch (e) {}
        let re = /(https?:\/\/[^\s"'<>]*(?:fastcomic|lazycomics)[^\s"'<>]*\.(?:webp|jpg|jpeg|png|gif|avif)(?:[?#][^\s"'<>]*)?)/ig;
        let m;
        while ((m = re.exec(html)) !== null) pushImg(data, seen, m[1]);
    }

    if (data.length === 0) return Response.error("No images found.");
    return Response.success(data);
}
