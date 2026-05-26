load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load chapter.");

    let data = [];
    let seen = {};

    doc.select('img[src*="imgdualeo"], img[data-src*="imgdualeo"]').forEach(function(e) {
        let src = e.attr('src') || e.attr('data-src') || '';
        if (src.startsWith('//')) src = 'https:' + src;
        if (!src || seen[src]) return;
        if (!/\.(jpg|jpeg|png|webp|gif)/i.test(src)) return;
        seen[src] = true;
        data.push({ link: src });
    });

    if (data.length === 0) {
        doc.select('.reading-content img, #chapter-content img, .chapter-img img').forEach(function(e) {
            let src = e.attr('src') || e.attr('data-src') || e.attr('data-lazy-src') || '';
            if (src.startsWith('//')) src = 'https:' + src;
            if (!src || seen[src]) return;
            if (!/\.(jpg|jpeg|png|webp|gif)/i.test(src)) return;
            seen[src] = true;
            data.push({ link: src });
        });
    }

    if (data.length === 0) return Response.error("No images found.");
    return Response.success(data);
}
