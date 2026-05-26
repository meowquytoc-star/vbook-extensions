load('config.js');

function execute() {
    return Response.success([
        { name: "Boy Love", link: BASE_URL + '/the-loai/boy-love', cover: '' },
        { name: "Yaoi", link: BASE_URL + '/the-loai/yaoi', cover: '' },
        { name: "Lãng Mạn", link: BASE_URL + '/the-loai/lang-man', cover: '' },
        { name: "ABO", link: BASE_URL + '/the-loai/abo', cover: '' },
        { name: "Người Lớn (18+)", link: BASE_URL + '/the-loai/nguoi-lon', cover: '' },
        { name: "Manhwa", link: BASE_URL + '/the-loai/manhwa', cover: '' },
        { name: "Manga", link: BASE_URL + '/the-loai/manga', cover: '' },
        { name: "Webtoon", link: BASE_URL + '/the-loai/webtoon', cover: '' },
        { name: "Truyện Màu", link: BASE_URL + '/the-loai/truyen-mau', cover: '' },
        { name: "Huyền Huyễn", link: BASE_URL + '/the-loai/huyen-huyen', cover: '' },
        { name: "Hài Hước", link: BASE_URL + '/the-loai/hai-huoc', cover: '' },
        { name: "Truyện Ngắn", link: BASE_URL + '/the-loai/truyen-ngan', cover: '' }
    ]);
}
