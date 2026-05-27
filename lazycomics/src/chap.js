load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load chapter.");

    let data = [];
    let seen = {};

    // Images are stored in JS variables on the page, not in img tags.
    // Regex-scan the raw HTML for all chapter image URLs.
    let html = '';
    try { html = doc.html(); } catch(e) {}
    let re = /(https?:\/\/[^\s"'<>]*fastcomic[^\s"'<>]*\.(?:webp|jpg|jpeg|png|gif))/ig;
    let m;
    while ((m = re.exec(html)) !== null) {
        let src = m[1];
        if (seen[src]) continue;
        seen[src] = true;
        data.push({ link: src });
    }

    if (data.length === 0) return Response.error("No images found.");
    return Response.success(data);
}
