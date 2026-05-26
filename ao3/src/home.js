load('config.js');

function execute() {
    return Response.success([
        { name: "Recently Updated", link: BASE_URL + "/works?work_search[sort_column]=revised_at&work_search[sort_direction]=desc", cover: "" },
        { name: "Most Kudos", link: BASE_URL + "/works?work_search[sort_column]=kudos_count&work_search[sort_direction]=desc", cover: "" },
        { name: "Most Bookmarks", link: BASE_URL + "/works?work_search[sort_column]=bookmarks_count&work_search[sort_direction]=desc", cover: "" },
        { name: "Most Comments", link: BASE_URL + "/works?work_search[sort_column]=comments_count&work_search[sort_direction]=desc", cover: "" },
        { name: "Newest Works", link: BASE_URL + "/works?work_search[sort_column]=created_at&work_search[sort_direction]=desc", cover: "" },
        { name: "Anime & Manga", link: BASE_URL + "/media/Anime%20*a*%20Manga/fandoms", cover: "" },
        { name: "Books & Literature", link: BASE_URL + "/media/Books%20*a*%20Literature/fandoms", cover: "" },
        { name: "Movies", link: BASE_URL + "/media/Movies/fandoms", cover: "" },
        { name: "TV Shows", link: BASE_URL + "/media/TV%20Shows/fandoms", cover: "" },
        { name: "Video Games", link: BASE_URL + "/media/Video%20Games/fandoms", cover: "" },
        { name: "Celebrities", link: BASE_URL + "/media/Celebrities%20*a*%20Real%20People/fandoms", cover: "" },
        { name: "Music", link: BASE_URL + "/media/Music%20*a*%20Bands/fandoms", cover: "" }
    ]);
}
