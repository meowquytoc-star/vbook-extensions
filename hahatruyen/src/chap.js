load('config.js');

function execute(url) {
    let doc = getDoc(url);
    if (!doc) return Response.error("Cannot load chapter.");

    let contentEl = doc.select('#tctcontent').first();
    if (!contentEl) return Response.error("No chapter content found.");

    let lines = [];
    contentEl.select('p').forEach(function(el) {
        let text = cleanText(el.text());
        if (text) lines.push(text);
    });

    if (lines.length === 0) {
        let raw = cleanText(contentEl.text());
        if (raw) lines.push(raw);
    }

    if (lines.length === 0) return Response.error("Chapter appears empty.");
    return Response.success(lines.join('\n\n'));
}
