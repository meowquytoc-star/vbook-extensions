load('config.js');

function execute() {
    return Response.success([
        { title: "Slash (M/M)",      input: BASE_URL + "/works?work_search[relationship_ids][]=9&view_adult=true",   script: 'gen.js' },
        { title: "Femslash (F/F)",   input: BASE_URL + "/works?work_search[relationship_ids][]=116&view_adult=true", script: 'gen.js' },
        { title: "Het (M/F)",        input: BASE_URL + "/works?work_search[relationship_ids][]=22&view_adult=true",  script: 'gen.js' },
        { title: "Gen",              input: BASE_URL + "/works?work_search[relationship_ids][]=21&view_adult=true",  script: 'gen.js' },
        { title: "Explicit",         input: BASE_URL + "/works?work_search[rating_ids][]=13&view_adult=true",        script: 'gen.js' },
        { title: "Mature",           input: BASE_URL + "/works?work_search[rating_ids][]=12&view_adult=true",        script: 'gen.js' },
        { title: "Teen & Up",        input: BASE_URL + "/works?work_search[rating_ids][]=10&view_adult=true",        script: 'gen.js' },
        { title: "K-Pop",            input: BASE_URL + "/works?work_search[fandom_ids][]=784&view_adult=true",       script: 'gen.js' },
        { title: "Anime & Manga",    input: BASE_URL + "/works?work_search[sort_column]=revised_at&view_adult=true", script: 'gen.js' }
    ]);
}
