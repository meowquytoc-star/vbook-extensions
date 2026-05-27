load('config.js');

function execute() {
    return Response.success([
        { title: "Recently Updated", input: BASE_URL + "/works?work_search[sort_column]=revised_at&work_search[sort_direction]=desc&view_adult=true",    script: 'gen.js' },
        { title: "Most Kudos",       input: BASE_URL + "/works?work_search[sort_column]=kudos_count&work_search[sort_direction]=desc&view_adult=true",     script: 'gen.js' },
        { title: "Most Bookmarks",   input: BASE_URL + "/works?work_search[sort_column]=bookmarks_count&work_search[sort_direction]=desc&view_adult=true", script: 'gen.js' },
        { title: "Newest Works",     input: BASE_URL + "/works?work_search[sort_column]=created_at&work_search[sort_direction]=desc&view_adult=true",      script: 'gen.js' },
        { title: "Explicit",         input: BASE_URL + "/works?work_search[rating_ids][]=13&view_adult=true",                                              script: 'gen.js' },
        { title: "Mature",           input: BASE_URL + "/works?work_search[rating_ids][]=12&view_adult=true",                                              script: 'gen.js' },
        { title: "Slash (M/M)",      input: BASE_URL + "/works?work_search[relationship_ids][]=9&view_adult=true",                                         script: 'gen.js' },
        { title: "Femslash (F/F)",   input: BASE_URL + "/works?work_search[relationship_ids][]=116&view_adult=true",                                       script: 'gen.js' }
    ]);
}
