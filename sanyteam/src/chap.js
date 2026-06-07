load('config.js');

const IMG_SELECTORS = 'img.manga-image, .reading-content img, .chapter-content img, .reader img';
const VALID_EXT = /\.(webp|jpg|jpeg|png|gif|avif)(?:[?#]|$)/i;

function pushImg(arr, seen, src, referer) {
    if (!src) return;
    src = ('' + src).trim();
    if (src.startsWith('//')) src = 'https:' + src;
    if (seen[src] || /^data:/.test(src)) return;
    if (!VALID_EXT.test(src)) return;
    seen[src] = true;
    arr.push({ link: src, header: { 'Referer': referer } });
}

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load chapter.");

    let data = [];
    let seen = {};

    doc.select(IMG_SELECTORS).forEach(function (e) {
        pushImg(data, seen, imgSrc(e), url);
    });

    if (data.length === 0) {
        doc.select('img').forEach(function (e) {
            let src = imgSrc(e);
            if (/\/(uploads|chapter|chap|images|storage)\//i.test(src)) {
                pushImg(data, seen, src, url);
            }
        });
    }

    if (data.length === 0) {
        let html = '';
        try { html = doc.html(); } catch (e) {}
        let re = /(https?:\/\/[^\s"'<>]+\/(?:uploads|chapter|chap|images|storage)[^\s"'<>]*\.(?:webp|jpg|jpeg|png|gif|avif)(?:[?#][^\s"'<>]*)?)/ig;
        let m;
        while ((m = re.exec(html)) !== null) pushImg(data, seen, m[1], url);
    }

    if (data.length === 0) return Response.error("No images found.");
    return Response.success(data);
}
