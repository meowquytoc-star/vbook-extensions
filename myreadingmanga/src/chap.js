load('config.js');

function validImage(url) {
    if (!url) return false;
    if (url.indexOf("data:image") === 0) return false;
    if (/\/favicon|\/logo|\/icon|gravatar\.com|pixel\.gif|1x1|spacer/i.test(url)) return false;
    if (/\/ads?\/|\/banner|\/placeholder|loading\.gif/i.test(url)) return false;
    // Must contain a common image extension or be from a media/uploads path
    if (!/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url)) {
        if (!/\/(wp-content\/uploads|media|content|images)\//i.test(url)) return false;
    }
    return true;
}

function imageAttr(e) {
    let srcset = e.attr("data-srcset") || e.attr("srcset");
    if (srcset) {
        // Pick largest from srcset: last entry or first entry
        let parts = srcset.split(",");
        let best = cleanText(parts[parts.length - 1].trim().split(" ")[0]);
        if (best) return best;
    }
    return e.attr("data-original") || e.attr("data-src") || e.attr("data-lazy-src") ||
           e.attr("data-url") || e.attr("src") || "";
}

function imageHeaders(referer) {
    return {
        'Referer': referer || BASE_URL + '/',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36'
    };
}

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load page.");

    let data = [];
    let seen = {};

    // Primary: images inside the post content area
    doc.select(
        ".entry-content img, .post-content img, .post-body img, " +
        "#content .post img, article.post .entry-content img"
    ).forEach(function(e) {
        let src = imageAttr(e);
        if (!src) return;
        src = normalizeImage(src);
        if (!validImage(src) || seen[src]) return;
        seen[src] = true;
        data.push({ link: src, headers: imageHeaders(url) });
    });

    // Fallback 1: any image inside the article
    if (data.length === 0) {
        doc.select("article img, .post img").forEach(function(e) {
            let src = imageAttr(e);
            if (!src) return;
            src = normalizeImage(src);
            if (!validImage(src) || seen[src]) return;
            seen[src] = true;
            data.push({ link: src, headers: imageHeaders(url) });
        });
    }

    // Fallback 2: regex scan for WordPress uploads URLs in page HTML
    if (data.length === 0) {
        let html = "";
        try { html = doc.html(); } catch (e) {}
        let regex = /(https?:\/\/[^\s"'<>]+?\/wp-content\/uploads\/[^\s"'<>]+?\.(?:jpg|jpeg|png|webp))/ig;
        let match;
        while ((match = regex.exec(html)) !== null) {
            let src = match[1];
            // Skip thumbnails — prefer original sizes
            if (/-\d+x\d+\.(jpg|jpeg|png|webp)$/i.test(src)) continue;
            if (seen[src]) continue;
            seen[src] = true;
            data.push({ link: src, headers: imageHeaders(url) });
        }
    }

    if (data.length === 0) return Response.error("No images found on this page.");
    return Response.success(data);
}
