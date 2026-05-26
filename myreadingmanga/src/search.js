load('config.js');

function imageAttrFromEl(e) {
    return e.attr("data-original") || e.attr("data-src") || e.attr("data-lazy-src") || e.attr("src") || "";
}

function postItem(article) {
    let linkEl = article.select(
        "h2.entry-title a, h1.entry-title a, .entry-title a, .post-title a, h2 a"
    ).first();
    if (!linkEl) return null;

    let link = normalizeUrl(linkEl.attr("href") || "");
    if (!isStoryUrl(link)) return null;

    let name = cleanText(linkEl.attr("title") || linkEl.text());
    if (!name) return null;

    let imgEl = article.select(
        "img.wp-post-image, .post-thumbnail img, .entry-thumbnail img, img"
    ).first();
    let cover = imgEl ? normalizeImage(imageAttrFromEl(imgEl)) : "";

    return { name: name, link: link, cover: cover, description: "", host: BASE_URL };
}

function searchUrl(key, page) {
    let url = BASE_URL + "/?s=" + encodeURIComponent(key);
    if (page && page !== "1" && page !== 1) url += "&paged=" + page;
    return url;
}

function execute(key, page) {
    // If page is a full URL (subsequent pages from nextPage()), use it directly
    let url = ("" + (page || "")).match(/^https?:\/\//)
        ? ("" + page)
        : searchUrl(key, page);

    let doc = getDoc(url);
    if (!doc) return null;

    let data = [];
    let seen = {};

    doc.select("article.post, article.hentry, div.post-item").forEach(function(e) {
        let item = postItem(e);
        if (item && !seen[item.link]) {
            seen[item.link] = true;
            data.push(item);
        }
    });

    // Fallback
    if (data.length === 0) {
        doc.select("a[href]").forEach(function(e) {
            let href = e.attr("href");
            if (!isStoryUrl(href)) return;
            let link = normalizeUrl(href);
            if (seen[link]) return;
            let name = cleanText(e.attr("title") || e.text());
            if (!name) return;
            seen[link] = true;
            data.push({ name: name, link: link, cover: "", description: "", host: BASE_URL });
        });
    }

    return Response.success(data, nextPage(doc));
}
