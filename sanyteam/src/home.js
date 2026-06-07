function execute() {
    return Response.success([
        { title: "Mới Cập Nhật",   input: "https://sanyteam.org/truyen-moi-cap-nhat", script: 'gen.js' },
        { title: "Đã Hoàn Thành",  input: "https://sanyteam.org/truyen-da-hoan",      script: 'gen.js' },
        { title: "BoyLove / BL",   input: "https://sanyteam.org/the-loai/boylove",    script: 'gen.js' },
        { title: "Yaoi",           input: "https://sanyteam.org/the-loai/yaoi",       script: 'gen.js' },
        { title: "Manhwa",         input: "https://sanyteam.org/the-loai/manhwa",     script: 'gen.js' },
        { title: "18+",            input: "https://sanyteam.org/the-loai/18",         script: 'gen.js' }
    ]);
}
