load('config.js');

function execute() {
    return Response.success([
        { name: "Mới cập nhật", link: BASE_URL + '/vi/68/truyen-ngon-tinh-sac-gioi/', cover: '' },
        { name: "Ngôn Tình", link: BASE_URL + '/vi/64/truyen-tieu-thuyet-ngon-tinh/', cover: '' },
        { name: "Nữ Cường", link: BASE_URL + '/vi/66/truyen-ngon-tinh-nu-cuong/', cover: '' },
        { name: "Tổng Tài", link: BASE_URL + '/vi/67/truyen-ngon-tinh-tong-tai/', cover: '' },
        { name: "Sắc Giới (18+)", link: BASE_URL + '/vi/68/truyen-ngon-tinh-sac-gioi/', cover: '' },
        { name: "Status Hay", link: BASE_URL + '/vi/10986/status-hay-ve-cuoc-song/', cover: '' }
    ]);
}
