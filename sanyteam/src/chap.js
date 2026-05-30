load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load chapter.");

    let data = [];
    let seen = {};

    doc.select('img.manga-image').forEach(function(e) {
        let src = e.attr('src') || e.attr('data-src') || e.attr('data-lazy-src') || '';
        src = src.trim();
        if (src.startsWith('//')) src = 'https:' + src;
        if (!src || seen[src] || /^data:/.test(src)) return;
        seen[src] = true;
        data.push({ link: src, header: { 'Referer': url } });
    });

    if (data.length === 0) return Response.error("No images found.");
    return Response.success(data);
}
