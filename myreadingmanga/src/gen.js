load('config.js');

function imageAttrFromEl(e) {
    return e.attr("data-original") || e.attr("data-src") || e.attr("data-lazy-src") || e.attr("src") || "";
}

function postItem(article) {
    // Title link
    let linkEl = article.select(
        "h2.entry-title a, h1.entry-title a, .entry-title a, " +
        ".post-title a, h2 a[rel='bookmark'], h2 a"
    ).first();
    if (!linkEl) return null;

    let link = normalizeUrl(linkEl.attr("href") || "");
    if (!isStoryUrl(link)) return null;

    let name = cleanText(linkEl.attr("title") || linkEl.text());
    if (!name) return null;

    // Cover image — wp-post-image, post thumbnail, or first img
    let imgEl = article.select(
        "img.wp-post-image, .post-thumbnail img, .entry-thumbnail img, " +
        "img.attachment-post-thumbnail, .post-image img, img"
    ).first();
    let cover = "";
    if (imgEl) {
        cover = normalizeImage(imageAttrFromEl(imgEl));
    }
    // Fallback to og:image within the card if no img found
    if (!cover) {
        let meta = article.select("meta[property='og:image']").first();
        if (meta) cover = normalizeImage(meta.attr("content") || "");
    }

    // Short description — last chapter label or first tag
    let desc = cleanText(
        article.select(".entry-meta, .post-meta, .entry-date, time").first()
            ? article.select(".entry-meta, .post-meta, .entry-date, time").first().text()
            : ""
    );

    return { name: name, link: link, cover: cover, description: desc, host: BASE_URL };
}

function collectByCards(doc) {
    let data = [];
    let seen = {};
    doc.select("article.post, article.hentry, div.post-item, li.post-item, .blog-entry").forEach(function(e) {
        let item = postItem(e);
        if (item && !seen[item.link]) {
            seen[item.link] = true;
            data.push(item);
        }
    });
    return data;
}

function collectByLinks(doc) {
    let data = [];
    let seen = {};
    doc.select("a[href]").forEach(function(e) {
        let href = e.attr("href");
        if (!isStoryUrl(href)) return;
        let link = normalizeUrl(href);
        if (seen[link]) return;
        let name = cleanText(e.attr("title") || e.text());
        if (!name || /^(next|prev|»|«|\d+)$/i.test(name)) return;
        seen[link] = true;
        data.push({ name: name, link: link, cover: "", description: "", host: BASE_URL });
    });
    return data;
}

function execute(url, page) {
    let doc = getDoc(listPageUrl(url, page));
    if (!doc) return null;

    let data = collectByCards(doc);
    if (data.length === 0) data = collectByLinks(doc);

    return Response.success(data, nextPage(doc));
}
