load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load chapter.");

    let data = [];
    let seen = {};

    doc.select('.reading-content img, .page-break img, .wp-manga-chapter-img').forEach(function(e) {
        let src = e.attr('data-src') || e.attr('data-lazy-src') || e.attr('data-original') || e.attr('src') || '';
        src = src.trim();
        if (src.startsWith('//')) src = 'https:' + src;
        if (!src || seen[src]) return;
        if (/^data:/.test(src)) return;
        seen[src] = true;
        data.push({ link: src });
    });

    if (data.length === 0) return Response.error("No images found. Chapter may be protected.");
    return Response.success(data);
}
