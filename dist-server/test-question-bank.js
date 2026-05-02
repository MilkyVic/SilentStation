const OPTIONS_LIKERT_1_5 = [
    { order: 1, label: 'Hoan toan khong dong y', score: 1 },
    { order: 2, label: 'Khong dong y', score: 2 },
    { order: 3, label: 'Binh thuong', score: 3 },
    { order: 4, label: 'Dong y', score: 4 },
    { order: 5, label: 'Hoan toan dong y', score: 5 },
];
const OPTIONS_SDQ_0_2 = [
    { order: 1, label: 'Khong dung', score: 0 },
    { order: 2, label: 'Dung 1 phan', score: 1 },
    { order: 3, label: 'Chac chan dung', score: 2 },
];
const OPTIONS_PHQ_GAD_0_3 = [
    { order: 1, label: 'Hoan toan khong', score: 0 },
    { order: 2, label: 'Voi vai ngay', score: 1 },
    { order: 3, label: 'Hon mot nua so ngay', score: 2 },
    { order: 4, label: 'Gan nhu moi ngay', score: 3 },
];
const OPTIONS_DASS_0_3 = [
    { order: 1, label: 'Khong dung voi toi chut nao', score: 0 },
    { order: 2, label: 'Dung mot phan, thinh thoang moi dung', score: 1 },
    { order: 3, label: 'Dung phan nhieu, phan lon thoi gian', score: 2 },
    { order: 4, label: 'Hoan toan dung voi toi, hau het thoi gian', score: 3 },
];
const OPTIONS_MBI_0_6 = [
    { order: 1, label: 'Khong bao gio', score: 0 },
    { order: 2, label: 'It khi (vai lan/nam)', score: 1 },
    { order: 3, label: 'Thinh thoang (moi thang mot lan)', score: 2 },
    { order: 4, label: 'Kha thuong xuyen (vai lan moi thang)', score: 3 },
    { order: 5, label: 'Thuong xuyen (hang tuan)', score: 4 },
    { order: 6, label: 'Rat thuong xuyen (vai lan/tuan)', score: 5 },
    { order: 7, label: 'Luon luon (moi ngay)', score: 6 },
];
const mtQuestions = [
    'Toi cam thay an toan khi hoc tap tai truong.',
    'Toi biet tim den ai trong truong khi gap nguy hiem.',
    'Khi xay ra xung dot giua hoc sinh, nha truong xu ly ro rang va cong bang.',
    'Giao vien thuong xuyen nhac nho va can thiep khi co hanh vi bao luc.',
    'Toi lo lang ve kha nang xay ra bao luc trong truong.',
    'Hoc sinh trong lop ton trong su khac biet cua nhau.',
    'Toi duoc doi xu cong bang nhu cac ban khac.',
    'Toi cam thay y kien cua minh duoc ton trong.',
    'Trong lop toi, hoc sinh thuong bi che gieu hoac xuc pham.',
    'Hoc sinh trong lop ton trong va khong xa lanh nhung ban gap kho khan tam ly.',
    'Giao vien quan tam den cam xuc cua hoc sinh.',
    'Khi hoc sinh bao cao su viec, giao vien lang nghe.',
    'Toi cam thay duoc giao vien bao ve khi gap van de o truong.',
    'Giao vien xu ly mau thuan giua hoc sinh mot cach cong bang.',
    'Toi biet truong co phong tham van hoac nguoi phu trach ho tro tam ly.',
    'Toi biet cach lien he khi can ho tro tam ly tai truong.',
    'Giao vien it quan tam den van de tinh than cua hoc sinh.',
    'Truong tao dieu kien cho hoc sinh tham gia hoat dong ngoai khoa.',
    'Hoat dong tap the giup toi cam thay gan bo voi lop/truong.',
    'Toi cam thay tu tin khi tham gia hoat dong cua truong.',
    'Muc do ap luc hoc tap hien nay la phu hop va khong qua suc.',
    'Toi cam thay truong chua tao du co hoi de hoc sinh phat trien toan dien.',
    'Toi co the nhan ra khi ban than dang cang thang hoac lo au.',
    'Toi co the nhan ra khi mot nguoi ban dang gap kho khan tinh than.',
    'Toi cam thay thoai mai khi chia se van de tam ly voi ban be.',
    'Toi cam thay thoai mai khi chia se voi giao vien.',
    'Toi biet ro thoi gian hoat dong cua phong tham van.',
];
const sdqQuestions = [
    'Ban co gang doi xu tot voi nguoi khac va quan tam den cam giac cua ho.',
    'Ban bon chon, khong the ngoi yen lau.',
    'Ban rat hay bi dau dau, dau bung hoac om.',
    'Ban thuong chia se voi cac ban khac (do choi, do an, sach vo).',
    'Ban rat tuc gian va hay mat binh tinh.',
    'Ban muon o mot minh hon la o voi nhung ban bang tuoi.',
    'Ban thuong lam theo yeu cau cua nguoi lon.',
    'Ban lo lang rat nhieu.',
    'Ban thuong giup khi ai do bi ton thuong, buon buc hoac om.',
    'Ban thuong dung ngoi khong yen, van veo, loay hoay.',
    'Ban co it nhat mot nguoi ban tot.',
    'Ban thuong danh nhau voi tre khac hoac bat nat ho.',
    'Ban thuong khong vui, buon rau hoac sap khoc.',
    'Nhung tre bang tuoi thuong yeu men ban.',
    'Ban de bi sao nhang va rat kho tap trung.',
    'Ban lo lang trong tinh huong moi va de mat tu tin.',
    'Ban thuong tot bung voi tre nho hon.',
    'Ban thuong doi tra va lua gat.',
    'Ban bi tre khac bat nat hoac che gieu.',
    'Ban thuong tinh nguyen giup nguoi khac.',
    'Ban suy nghi truoc khi hanh dong.',
    'Ban lay do khong phai cua ban o nha, o truong hoac noi khac.',
    'Ban de hoa hop voi nguoi lon hon cac ban cung tuoi.',
    'Ban co nhieu noi so, de so hai.',
    'Ban hoan thanh cong viec ban lam va chu tam vao cong viec.',
];
const phq9Questions = [
    'It hung thu hoac khong co niem vui trong viec lam moi thu.',
    'Cam thay buon ba, chan nan hoac tuyet vong.',
    'Kho ngu, ngu khong lau hoac ngu qua nhieu.',
    'Cam thay met moi hoac thieu nang luong.',
    'Chan an hoac an qua nhieu.',
    'Cam thay ban than toi te, that bai hoac that vong ve ban than/gia dinh.',
    'Kho tap trung vao mot viec nhu doc bao hoac xem tivi.',
    'Di chuyen/noi nang qua cham hoac nguoc lai qua bon chon.',
    'Nghi rang minh chet di se tot hon hoac tu lam dau ban than.',
];
const gad7Questions = [
    'Cam thay lo lang, bon chon hoac cang thang.',
    'Khong the ngung hoac kiem soat viec lo lang.',
    'Lo lang qua muc ve nhieu viec khac nhau.',
    'Kho thu gian.',
    'Bon chon den muc kho ngoi yen.',
    'De boi roi, de cau gat.',
    'Cam thay so hai nhu sap co dieu te hai xay ra.',
];
const dass21Questions = [
    'Toi thay kho ma thoai mai duoc.',
    'Toi bi kho mieng.',
    'Toi duong nhu chang co cam xuc tich cuc nao.',
    'Toi bi roi loan nhip tho (tho gap, kho tho du khong lam viec nang).',
    'Toi thay kho bat tay vao cong viec.',
    'Toi co xu huong phan ung thai qua voi moi tinh huong.',
    'Toi bi ra mo hoi (vi du mo hoi tay).',
    'Toi thay minh dang suy nghi qua nhieu.',
    'Toi lo lang ve tinh huong co the lam toi hoang so.',
    'Toi thay minh chang co gi de mong doi.',
    'Toi thay ban than de bi kich dong.',
    'Toi thay kho thu gian duoc.',
    'Toi cam thay chan nan, that vong.',
    'Toi khong chap nhan duoc viec co cai gi xen vao can tro cong viec.',
    'Toi thay minh gan nhu hoang loan.',
    'Toi khong thay hang hai voi bat ky viec gi nua.',
    'Toi cam thay minh chang dang lam nguoi.',
    'Toi thay minh kha de phat y, tu ai.',
    'Toi nghe ro nhip tim du chang lam viec gi ca.',
    'Toi hay so vo co.',
    'Toi thay cuoc song vo nghia.',
];
const mbi22Questions = [
    'Toi cam thay kiet que ve mat cam xuc vi cong viec cua minh.',
    'Toi cam thay met moi vao cuoi ngay lam viec.',
    'Toi cam thay met moi ngay khi thuc day va thay ngay moi qua dai.',
    'Toi co the de dang hieu duoc hanh dong cua dong nghiep/quan ly.',
    'Toi co cam giac minh cu xu lanh nhat voi mot so hoc sinh/dong nghiep/phu huynh.',
    'Lam viec ca ngay voi nhieu nguoi that cang thang doi voi toi.',
    'Toi cam thay minh co the ho tro hieu qua khi nguoi khac gap van de.',
    'Toi cam thay kiet suc vi cong viec cua minh.',
    'Toi cam thay rang toi anh huong tich cuc den nguoi khac qua cong viec.',
    'Toi da tro nen nhan tam hon voi moi nguoi ke tu khi bat dau cong viec nay.',
    'Toi so rang cong viec khien toi kho khan hon trong the hien cam xuc.',
    'Toi cam thay tran day nang luong.',
    'Toi cam thay nan long vi cong viec cua minh.',
    'Toi co cam giac rang toi lam viec qua vat va.',
    'Toi khong thuc su quan tam den nhung gi dang dien ra voi nhieu dong nghiep.',
    'Tiep xuc truc tiep voi moi nguoi tai noi lam viec qua cang thang.',
    'Toi thay de dang xay dung bau khong khi thoai mai trong cong viec.',
    'Toi cam thay duoc kich thich khi lam viec gan voi dong nghiep.',
    'Toi da dat duoc nhieu muc tieu xung dang trong cong viec.',
    'Toi cam thay nhu the toi da gang het suc va gio bo tay roi.',
    'Trong cong viec, toi rat thoai mai khi giai quyet van de tinh cam.',
    'Toi co cam giac rang dong nghiep do loi cho toi ve mot so van de cua ho.',
];
const makeQuestions = (items, options, subscaleResolver, reverseIndexes) => {
    const reverseSet = new Set(reverseIndexes || []);
    return items.map((text, idx) => ({
        order: idx + 1,
        text,
        subscale: subscaleResolver ? subscaleResolver(idx + 1) : undefined,
        isReverse: reverseSet.has(idx + 1),
        options: options.map((option) => ({ ...option })),
    }));
};
const resolveSdqSubscale = (index) => {
    if ([3, 8, 13, 16, 24].includes(index))
        return 'emotional';
    if ([5, 7, 12, 18, 22].includes(index))
        return 'conduct';
    if ([2, 10, 15, 21, 25].includes(index))
        return 'hyperactivity';
    if ([6, 11, 14, 19, 23].includes(index))
        return 'peer';
    return 'prosocial';
};
const resolveMtSubscale = (index) => {
    if (index <= 5)
        return 'safety';
    if (index <= 10)
        return 'respect';
    if (index <= 17)
        return 'support';
    if (index <= 22)
        return 'learning_env';
    return 'mental_health_awareness';
};
const resolveDassSubscale = (index) => {
    if ([1, 6, 8, 11, 12, 14, 18].includes(index))
        return 'stress';
    if ([2, 4, 7, 9, 15, 19, 20].includes(index))
        return 'anxiety';
    return 'depression';
};
const resolveMbiSubscale = (index) => {
    if ([1, 2, 3, 6, 8, 13, 14, 16, 20].includes(index))
        return 'EE';
    if ([5, 10, 11, 15, 22].includes(index))
        return 'DP';
    return 'PA';
};
export const SYSTEM_TEMPLATE_QUESTIONS = {
    '1': makeQuestions(phq9Questions, OPTIONS_PHQ_GAD_0_3),
    '2': makeQuestions(gad7Questions, OPTIONS_PHQ_GAD_0_3),
    '3': makeQuestions(sdqQuestions, OPTIONS_SDQ_0_2, resolveSdqSubscale, [7, 11, 14, 21, 25]),
    '4': makeQuestions(mtQuestions, OPTIONS_LIKERT_1_5, resolveMtSubscale, [5, 9, 17, 22]),
    '5': makeQuestions(dass21Questions, OPTIONS_DASS_0_3, resolveDassSubscale),
    '6': makeQuestions(mbi22Questions, OPTIONS_MBI_0_6, resolveMbiSubscale),
};
