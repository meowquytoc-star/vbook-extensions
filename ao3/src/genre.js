load('config.js');

function execute() {
    return Response.success([
        { name: "Slash (M/M)", link: BASE_URL + "/works?work_search[sort_column]=revised_at&work_search[relationship_ids][]=9", cover: "" },
        { name: "Femslash (F/F)", link: BASE_URL + "/works?work_search[sort_column]=revised_at&work_search[relationship_ids][]=116", cover: "" },
        { name: "Het (M/F)", link: BASE_URL + "/works?work_search[sort_column]=revised_at&work_search[relationship_ids][]=22", cover: "" },
        { name: "Gen", link: BASE_URL + "/works?work_search[sort_column]=revised_at&work_search[relationship_ids][]=21", cover: "" },
        { name: "Multi", link: BASE_URL + "/works?work_search[sort_column]=revised_at&work_search[relationship_ids][]=2246", cover: "" },
        { name: "Explicit", link: BASE_URL + "/works?work_search[sort_column]=revised_at&work_search[rating_ids][]=13", cover: "" },
        { name: "Mature", link: BASE_URL + "/works?work_search[sort_column]=revised_at&work_search[rating_ids][]=12", cover: "" },
        { name: "Teen & Up", link: BASE_URL + "/works?work_search[sort_column]=revised_at&work_search[rating_ids][]=10", cover: "" },
        { name: "General Audiences", link: BASE_URL + "/works?work_search[sort_column]=revised_at&work_search[rating_ids][]=10", cover: "" },
        { name: "Anime & Manga Fandoms", link: BASE_URL + "/media/Anime%20*a*%20Manga/fandoms", cover: "" },
        { name: "K-Pop / Music Groups", link: BASE_URL + "/media/Music%20*a*%20Bands/fandoms", cover: "" },
        { name: "All Fandoms", link: BASE_URL + "/media", cover: "" }
    ]);
}
