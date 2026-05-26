load('config.js');

function execute() {
    return Response.success([
        { title: "Latest Updates",  input: "/",                         script: "gen.js" },
        { title: "Popular",         input: "/?orderby=popular",          script: "gen.js" },
        { title: "Yaoi",            input: "/tag/yaoi/",                 script: "gen.js" },
        { title: "Bara",            input: "/tag/bara/",                 script: "gen.js" },
        { title: "English",         input: "/tag/english/",              script: "gen.js" },
        { title: "Japanese",        input: "/tag/japanese/",             script: "gen.js" },
        { title: "Chinese",         input: "/tag/chinese/",              script: "gen.js" },
        { title: "Korean",          input: "/tag/korean/",               script: "gen.js" },
        { title: "Completed",       input: "/tag/complete/",             script: "gen.js" },
        { title: "Shotacon",        input: "/tag/shotacon/",             script: "gen.js" },
        { title: "Furry",           input: "/tag/furry/",                script: "gen.js" },
        { title: "Uncensored",      input: "/tag/uncensored/",           script: "gen.js" }
    ]);
}
