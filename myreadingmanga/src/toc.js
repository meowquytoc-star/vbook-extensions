load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return null;

    let chapters = [];
    let seen = {};

    // Some myreadingmanga posts link to separate part pages within the content
    // e.g. "[Part 1]", "[Part 2]" or "Chapter 1", "Chapter 2"
    doc.select(".entry-content a[href], .post-content a[href]").forEach(function(e) {
        let href = e.attr("href") || "";
        if (!href) return;
        let link = normalizeUrl(href);

        // Only internal story links
        if (!link.includes("myreadingmanga.info")) return;
        if (!isStoryUrl(link) || link === normalizeUrl(url)) return;
        if (seen[link]) return;

        let text = cleanText(e.text());
        // Skip navigation text and long prose
        if (!text || text.length > 60 || /^(click|here|read more|continue)/i.test(text)) return;
        // Only keep links that look like chapter/part labels
        if (!/part|chapter|chap|ch\.|episode|ep\.|vol|\d/i.test(text)) return;

        seen[link] = true;
        chapters.push({ name: text, url: link, host: BASE_URL });
    });

    // Default: each post is itself a single readable chapter
    if (chapters.length === 0) {
        let title = firstText(doc, ["h1.entry-title", "h1.post-title", "h1"]);
        chapters.push({
            name: title || "Read",
            url: normalizeUrl(url),
            host: BASE_URL
        });
    }

    return Response.success(chapters);
}
