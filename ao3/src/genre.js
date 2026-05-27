function execute() {
    return Response.success([
        { title: "Slash (M/M)",      input: "https://archiveofourown.org/works?work_search[relationship_ids][]=9&view_adult=true",   script: 'gen.js' },
        { title: "Femslash (F/F)",   input: "https://archiveofourown.org/works?work_search[relationship_ids][]=116&view_adult=true", script: 'gen.js' },
        { title: "Het (M/F)",        input: "https://archiveofourown.org/works?work_search[relationship_ids][]=22&view_adult=true",  script: 'gen.js' },
        { title: "Gen",              input: "https://archiveofourown.org/works?work_search[relationship_ids][]=21&view_adult=true",  script: 'gen.js' },
        { title: "Explicit",         input: "https://archiveofourown.org/works?work_search[rating_ids][]=13&view_adult=true",        script: 'gen.js' },
        { title: "Mature",           input: "https://archiveofourown.org/works?work_search[rating_ids][]=12&view_adult=true",        script: 'gen.js' },
        { title: "Teen & Up",        input: "https://archiveofourown.org/works?work_search[rating_ids][]=10&view_adult=true",        script: 'gen.js' },
        { title: "K-Pop",            input: "https://archiveofourown.org/works?work_search[fandom_ids][]=784&view_adult=true",       script: 'gen.js' },
        { title: "Anime & Manga",    input: "https://archiveofourown.org/works?work_search[sort_column]=revised_at&view_adult=true", script: 'gen.js' }
    ]);
}
