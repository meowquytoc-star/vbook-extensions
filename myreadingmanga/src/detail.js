load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return null;

    // Title
    let name = firstText(doc, [
        "h1.entry-title",
        "h1.post-title",
        ".post-title h1",
        "header h1",
        "h1"
    ]);
    if (!name) {
        // Fallback: og:title meta
        let og = doc.select("meta[property='og:title']").first();
        if (og) name = cleanText(og.attr("content"));
    }
    if (!name) return Response.error("Could not find manga information.");

    // Cover: prefer og:image, then first content image
    let cover = "";
    let ogImg = doc.select("meta[property='og:image']").first();
    if (ogImg) cover = ogImg.attr("content") || "";

    if (!cover) {
        let imgEl = doc.select(
            ".entry-content img:first-of-type, .post-content img:first-of-type, " +
            "img.wp-post-image, .post-thumbnail img, article img"
        ).first();
        if (imgEl) {
            cover = imgEl.attr("data-original") || imgEl.attr("data-src") ||
                    imgEl.attr("data-lazy-src") || imgEl.attr("src") || "";
        }
    }
    cover = normalizeImage(cover);

    // Tags → genres list
    let genres = [];
    let seen = {};
    doc.select("a[rel='tag'], .entry-tags a, .post-tags a, .tags-links a, span.tags-links a").forEach(function(e) {
        let href = e.attr("href") || "";
        let title = cleanText(e.text());
        if (!title || seen[title]) return;
        seen[title] = true;
        genres.push({ title: title, input: normalizeUrl(href), script: "gen.js" });
    });

    // Author: try meta, then look for an "artist" or "circle" tag pattern in the title slug
    let author = "";
    let authorMeta = doc.select("meta[name='author'], meta[property='article:author']").first();
    if (authorMeta) author = cleanText(authorMeta.attr("content"));

    // Many myreadingmanga posts start with "Artist - Title" — extract from h1 if possible
    if (!author) {
        // Pattern: "Artist Name - Title (language)"
        let m = /^(.+?)\s*[-–]\s*.+$/i.exec(name);
        if (m && m[1].length < 40) author = m[1].trim();
    }

    // Build detail string from tags
    let tagNames = [];
    doc.select("a[rel='tag'], .entry-tags a, .tags-links a").forEach(function(e) {
        tagNames.push(cleanText(e.text()));
    });
    let detail = "";
    if (tagNames.length > 0) detail = "<b>Tags:</b> " + tagNames.join(", ");

    let dateEl = doc.select("time.entry-date, time.published, time[datetime], .post-date").first();
    if (dateEl) {
        let d = dateEl.attr("datetime") || cleanText(dateEl.text());
        if (d) detail += (detail ? "<br>" : "") + "<b>Posted:</b> " + d;
    }

    return Response.success({
        name: name,
        cover: cover,
        host: BASE_URL,
        author: author,
        description: "",
        detail: detail,
        ongoing: false,
        genres: genres
    });
}
