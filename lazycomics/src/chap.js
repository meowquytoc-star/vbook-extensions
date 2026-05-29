load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load chapter.");

    let data = [];
    let seen = {};

    // Try standard img tags first (reading content area)
    doc.select('.reading-content img, .page-break img, .chapter-content img, #content img, .comic-reader img').forEach(function(e) {
        let src = e.attr('data-src') || e.attr('data-lazy-src') || e.attr('data-original') || e.attr('src') || '';
        src = src.trim();
        if (!src || seen[src] || /^data:/.test(src)) return;
        if (!/\.(webp|jpg|jpeg|png|gif)/i.test(src)) return;
        seen[src] = true;
        data.push({ link: src });
    });

    // Fallback: regex scan HTML for CDN image URLs
    if (data.length === 0) {
        let html = '';
        try { html = doc.html(); } catch(e) {}
        let re = /(https?:\/\/[^\s"'<>]+\/(?:uploads|images|chapter|chap|storage)[^\s"'<>]*\.(?:webp|jpg|jpeg|png|gif)(?:[?#][^\s"'<>]*)?)/ig;
        let m;
        while ((m = re.exec(html)) !== null) {
            let src = m[1];
            if (seen[src]) continue;
            seen[src] = true;
            data.push({ link: src });
        }
    }

    // Last resort: known CDN patterns (fastcomic, storage)
    if (data.length === 0) {
        let html = '';
        try { html = doc.html(); } catch(e) {}
        let re2 = /(https?:\/\/[^\s"'<>]*(?:fastcomic|lazycomics)[^\s"'<>]*\.(?:webp|jpg|jpeg|png|gif)(?:[?#][^\s"'<>]*)?)/ig;
        let m2;
        while ((m2 = re2.exec(html)) !== null) {
            let src = m2[1];
            if (seen[src]) continue;
            seen[src] = true;
            data.push({ link: src });
        }
    }

    if (data.length === 0) return Response.error("No images found.");
    return Response.success(data);
}
