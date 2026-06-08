function execute() {
    return Response.success([
        { title: "Manhwa (Mới cập nhật)", input: "https://teamsany.com/manhwa/",           script: 'gen.js' },
        { title: "BoyLove / BL",          input: "https://teamsany.com/genre/boylove/",    script: 'gen.js' },
        { title: "Yaoi",                  input: "https://teamsany.com/genre/yaoi/",       script: 'gen.js' },
        { title: "Omegaverse",            input: "https://teamsany.com/genre/omegaverse/", script: 'gen.js' },
        { title: "Romance",               input: "https://teamsany.com/genre/romance/",    script: 'gen.js' },
        { title: "Comedy",                input: "https://teamsany.com/genre/comedy/",     script: 'gen.js' },
        { title: "Sany Team",             input: "https://teamsany.com/genre/sany-team/",  script: 'gen.js' }
    ]);
}
