load('config.js');

function fallbackGenres() {
    let items = [
        ["Action",          "/tag/action/"],
        ["Bara",            "/tag/bara/"],
        ["BL",              "/tag/bl/"],
        ["Chinese",         "/tag/chinese/"],
        ["Comedy",          "/tag/comedy/"],
        ["Complete",        "/tag/complete/"],
        ["Drama",           "/tag/drama/"],
        ["English",         "/tag/english/"],
        ["Fantasy",         "/tag/fantasy/"],
        ["Furry",           "/tag/furry/"],
        ["Historical",      "/tag/historical/"],
        ["Horror",          "/tag/horror/"],
        ["Japanese",        "/tag/japanese/"],
        ["Korean",          "/tag/korean/"],
        ["Mature",          "/tag/mature/"],
        ["Mystery",         "/tag/mystery/"],
        ["Romance",         "/tag/romance/"],
        ["Sci-Fi",          "/tag/sci-fi/"],
        ["School Life",     "/tag/school-life/"],
        ["Shotacon",        "/tag/shotacon/"],
        ["Shounen Ai",      "/tag/shounen-ai/"],
        ["Slice of Life",   "/tag/slice-of-life/"],
        ["Supernatural",    "/tag/supernatural/"],
        ["Uncensored",      "/tag/uncensored/"],
        ["Yaoi",            "/tag/yaoi/"]
    ];
    return items.map(function(i) {
        return { title: i[0], input: normalizeUrl(i[1]), script: "gen.js" };
    });
}

function execute() {
    let doc = getDoc(BASE_URL + "/");
    if (!doc) return Response.success(fallbackGenres());

    let genres = [];
    let seen = {};

    // WordPress tag cloud or tag widgets in sidebar
    doc.select(
        ".widget_tag_cloud a, .tagcloud a, .widget-tags a, " +
        ".sidebar a[href*='/tag/'], footer a[href*='/tag/']"
    ).forEach(function(e) {
        let href = e.attr("href") || "";
        if (!href.includes("/tag/")) return;
        let title = cleanText(e.text());
        if (!title || seen[href]) return;
        seen[href] = true;
        genres.push({ title: title, input: normalizeUrl(href), script: "gen.js" });
    });

    if (genres.length === 0) genres = fallbackGenres();
    return Response.success(genres);
}
