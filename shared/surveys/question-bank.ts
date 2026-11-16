/**
 * Full survey questions and metadata based on "Phiếu khảo sát sức khỏe tâm thần học sinh"
 */
export const SURVEY_METADATA = {
    title: 'Phiếu khảo sát sức khỏe tâm thần học sinh',
    subtitle: 'Dành cho học sinh các trường trung học',
    introduction: 'Lắng nghe bản thân, để biết mình cần gì 🌿\nKhảo sát này là dịp để em nhìn lại cảm xúc, những thói quen chăm sóc bản thân và sự hỗ trợ mà em mong muốn. Qua đó, em có thể hiểu mình hơn và nhận ra điều gì giúp mình cảm thấy khỏe khoắn, thoải mái hơn mỗi ngày.\nNhững chia sẻ của em cũng giúp chúng tôi xây dựng các hoạt động chăm sóc và đồng hành gần gũi hơn với nhu cầu của học sinh. Việc tham gia hoàn toàn tự nguyện và thông tin em chia sẻ sẽ được bảo mật.\nMời em dành ít phút cho chính mình nhé!',
    generalGuideline: 'Em hãy đọc hướng dẫn riêng của từng phần trước khi trả lời. Thời gian được hỏi và cách lựa chọn câu trả lời có thể khác nhau giữa các phần.',
    supportContact: {
        name: 'TS Lê Thị Lâm',
        phone: '0979153887',
        zalo: '0979153887',
        email: 'ltlam@ued.udn.vn',
        hotline: '111 (Tổng đài Quốc gia Bảo vệ Trẻ em - Miễn phí 24/7)',
        note: 'Nếu em có điều lo lắng, buồn phiền hoặc khó khăn muốn chia sẻ, em có thể liên hệ với người phụ trách để được lắng nghe và hướng dẫn tìm sự hỗ trợ phù hợp. Em có thể liên hệ dù đã trả lời hoặc chưa hoàn thành phiếu khảo sát. Khi nhắn tin, em chỉ cần cho biết em muốn được hỗ trợ và cách liên lạc thuận tiện với em; em chưa cần kể chi tiết nếu chưa sẵn sàng. Những điều em chia sẻ sẽ được giữ riêng tư.',
    },
};
export const SDQ_QUESTIONS: Array<{
    id: number;
    text: string;
}> = [
    { id: 1, text: 'Em cố gắng đối xử tốt với người khác. Em quan tâm đến cảm giác của họ.' },
    { id: 2, text: 'Em bồn chồn, không thể ngồi yên lâu.' },
    { id: 3, text: 'Em rất hay bị đau đầu, đau bụng và ốm.' },
    { id: 4, text: 'Em thường chia sẻ với các bạn khác, ví dụ trò chơi, đồ ăn và sách.' },
    { id: 5, text: 'Em rất tức giận và hay mất bình tĩnh.' },
    { id: 6, text: 'Em muốn ở một mình hơn là ở với những bạn bằng tuổi.' },
    { id: 7, text: 'Em thường làm theo yêu cầu của người lớn.' },
    { id: 8, text: 'Em cảm thấy nhiều lo lắng.' },
    { id: 9, text: 'Em thường giúp khi ai đó bị thương tổn, buồn bực hoặc ốm.' },
    { id: 10, text: 'Em thường xuyên đứng ngồi không yên, vặn vẹo, loay hoay.' },
    { id: 11, text: 'Em có ít nhất 1 người bạn tốt.' },
    { id: 12, text: 'Em thường đánh nhau với những trẻ khác hoặc bắt nạt họ.' },
    { id: 13, text: 'Em thường không vui, buồn rầu hoặc sắp khóc.' },
    { id: 14, text: 'Những trẻ bằng tuổi em thường yêu mến em.' },
    { id: 15, text: 'Em dễ bị sao nhãng, rất khó tập trung.' },
    { id: 16, text: 'Em lo lắng trong các tình huống mới. Em dễ mất sự tự tin.' },
    { id: 17, text: 'Em thường tốt bụng với những trẻ nhỏ hơn em.' },
    { id: 18, text: 'Em thường dối trá và lừa gạt.' },
    { id: 19, text: 'Em bị những trẻ khác bắt nạt hoặc chế diễu.' },
    { id: 20, text: 'Em thường tình nguyện giúp người khác (cha mẹ, thầy cô giáo và trẻ khác).' },
    { id: 21, text: 'Em suy nghĩ trước khi hành động.' },
    { id: 22, text: 'Em lấy đồ không phải của em ở nhà, ở trường và nơi khác.' },
    { id: 23, text: 'Em dễ hòa hợp với người lớn hơn là các bạn cùng tuổi.' },
    { id: 24, text: 'Em có nhiều nỗi sợ, dễ sợ hãi.' },
    { id: 25, text: 'Em hoàn thành công việc em làm. Em có khả năng chú ý tốt.' },
];
export const PHQA_QUESTIONS: Array<{
    id: number;
    text: string;
}> = [
    { id: 1, text: 'Cảm thấy buồn bã, chán nản, cáu kỉnh hoặc tuyệt vọng?' },
    { id: 2, text: 'Mất hứng thú hoặc không còn thấy vui khi làm các việc từng yêu thích' },
    { id: 3, text: 'Khó ngủ, ngủ không ngon giấc hoặc ngủ quá nhiều?' },
    { id: 4, text: 'Ăn kém, sụt cân hoặc ăn quá nhiều' },
    { id: 5, text: 'Cảm thấy mệt mỏi, thiếu năng lượng' },
    { id: 6, text: 'Cảm thấy tồi tệ về bản thân - hoặc cảm thấy mình là kẻ thất bại, hay đã khiến bản thân hoặc gia đình thất vọng' },
    { id: 7, text: 'Khó tập trung vào những việc như học hành, đọc sách hoặc xem TV' },
    { id: 8, text: 'Cử động hoặc nói chậm đến mức người khác có thể nhận ra? Hoặc ngược lại - quá bồn chồn hoặc bứt rứt đến mức cử động nhiều hơn bình thường?' },
    { id: 9, text: 'Có suy nghĩ rằng bạn sẽ tốt hơn nếu chết đi, hoặc nghĩ đến việc làm tổn thương bản thân theo cách nào đó' },
];
export const GAD7_QUESTIONS: Array<{
    id: number;
    text: string;
}> = [
    { id: 1, text: 'Cảm giác hồi hộp, lo lắng hoặc cáu kỉnh' },
    { id: 2, text: 'Không thể dừng hoặc kiểm soát được việc lo lắng' },
    { id: 3, text: 'Lo lắng quá nhiều về những điều khác nhau' },
    { id: 4, text: 'Không thể thư giãn được' },
    { id: 5, text: 'Cảm thấy bồn chồn đến mức mà khó có thể ngồi yên một chỗ' },
    { id: 6, text: 'Trở nên dễ bực mình hoặc cáu kỉnh' },
    { id: 7, text: 'Cảm thấy sợ như thể có một điều gì đó khủng khiếp có thể xảy ra' },
];
export const SBQR_QUESTIONS = {
    e1: {
        question: 'E1. Em đã bao giờ nghĩ đến việc tự sát hoặc đã cố gắng tự sát chưa?',
        options: [
            { code: '1', label: 'Không bao giờ.' },
            { code: '2', label: 'Đó chỉ là một suy nghĩ thoáng qua.' },
            { code: '3a', label: 'Em đã từng có kế hoạch tự sát ít nhất một lần nhưng không cố gắng thực hiện.' },
            { code: '3b', label: 'Em đã từng có kế hoạch tự sát ít nhất một lần và thực sự muốn chết.' },
            { code: '4a', label: 'Em đã cố gắng tự sát nhưng không muốn chết.' },
            { code: '4b', label: 'Em đã cố gắng tự sát và thực sự hy vọng mình sẽ chết.' },
        ],
    },
    e2: {
        question: 'E2. Trong 12 tháng qua, em đã nghĩ đến việc tự sát thường xuyên như thế nào?',
        options: [
            { code: '1', label: 'Không bao giờ.' },
            { code: '2', label: 'Hiếm khi (1 lần).' },
            { code: '3', label: 'Thỉnh thoảng (2 lần).' },
            { code: '4', label: 'Thường xuyên (3–4 lần).' },
            { code: '5', label: 'Rất thường xuyên (5 lần trở lên).' },
        ],
    },
    e3: {
        question: 'E3. Em đã bao giờ nói với ai đó rằng em sẽ tự sát hoặc có thể sẽ làm điều đó chưa?',
        options: [
            { code: '1', label: 'Không.' },
            { code: '2a', label: 'Có, một lần, nhưng em thực sự không muốn chết.' },
            { code: '2b', label: 'Có, một lần, và em thực sự muốn chết.' },
            { code: '3a', label: 'Có, hơn một lần, nhưng em không muốn làm điều đó.' },
            { code: '3b', label: 'Có, hơn một lần, và em thực sự muốn làm điều đó.' },
        ],
    },
    e4: {
        question: 'E4. Em nghĩ khả năng một ngày nào đó em sẽ cố gắng tự sát là như thế nào?',
        options: [
            { code: '0', label: 'Không bao giờ.' },
            { code: '1', label: 'Hoàn toàn không có khả năng.' },
            { code: '2', label: 'Khá ít khả năng xảy ra.' },
            { code: '3', label: 'Ít khả năng xảy ra.' },
            { code: '4', label: 'Có khả năng xảy ra.' },
            { code: '5', label: 'Khá có khả năng xảy ra.' },
            { code: '6', label: 'Rất có khả năng xảy ra.' },
        ],
    },
};
export const LIFESTYLE_QUESTIONS: Array<{
    id: number;
    text: string;
    category?: string;
}> = [
    { id: 1, text: 'Em dành thời gian trò chuyện với các thành viên trong gia đình.', category: 'Quan hệ gia đình' },
    { id: 2, text: 'Em dành thời gian cùng gia đình tham gia các hoạt động vận động.', category: 'Quan hệ gia đình' },
    { id: 3, text: 'Em đến gặp nhân viên y tế trường học hoặc bác sĩ khi cảm thấy không khỏe.', category: 'Chăm sóc sức khỏe' },
    { id: 4, text: 'Em tham gia hoạt động thể chất cường độ mạnh từ 20 phút trở lên, 3 ngày mỗi tuần.', category: 'Hoạt động thể chất' },
    { id: 5, text: 'Em ngủ từ 6 đến 8 giờ mỗi đêm.', category: 'Giấc ngủ & Nghỉ ngơi' },
    { id: 6, text: 'Em chúc mừng người khác khi họ làm tốt một việc nào đó.', category: 'Kỹ năng xã hội' },
    { id: 7, text: 'Em tránh đồ ngọt hoặc những thực phẩm chứa nhiều đường.', category: 'Dinh dưỡng' },
    { id: 8, text: 'Em đọc các bài viết về chủ đề sức khỏe.', category: 'Chăm sóc sức khỏe' },
    { id: 9, text: 'Em trò chuyện với người khác về niềm tin tôn giáo hoặc tâm linh của mình.', category: 'Tinh thần & Tâm linh' },
    { id: 10, text: 'Em chọn sữa ít béo hoặc các sản phẩm từ sữa ít béo.', category: 'Dinh dưỡng' },
    { id: 11, text: 'Em dành thời gian thư giãn mỗi ngày.', category: 'Giấc ngủ & Nghỉ ngơi' },
    { id: 12, text: 'Em cố gắng chú ý đến cảm xúc của người khác.', category: 'Kỹ năng xã hội' },
    { id: 13, text: 'Em có ăn sáng hàng ngày', category: 'Dinh dưỡng' },
    { id: 14, text: 'Em hỏi bác sĩ hoặc điều dưỡng để hiểu rõ những hướng dẫn của họ.', category: 'Chăm sóc sức khỏe' },
    { id: 15, text: 'Em cảm nhận có một sức mạnh siêu việt dẫn dắt cuộc sống của mình.', category: 'Tinh thần & Tâm linh' },
    { id: 16, text: 'Em tham gia các hoạt động giải trí hoặc thể thao.', category: 'Hoạt động thể chất' },
    { id: 17, text: 'Em chấp nhận những điều trong cuộc sống mà mình không thể thay đổi.', category: 'Cảm xúc & Tinh thần' },
    { id: 18, text: 'Em cảm thấy hào hứng về tương lai.', category: 'Cảm xúc & Tinh thần' },
    { id: 19, text: 'Em dành thời gian ở bên những người bạn thân.', category: 'Bạn bè' },
    { id: 20, text: 'Em tham gia một nhóm có cùng niềm tin tôn giáo hoặc tâm linh với mình.', category: 'Tinh thần & Tâm linh' },
    { id: 21, text: 'Em ăn từ 2 đến 4 khẩu phần trái cây mỗi ngày.', category: 'Dinh dưỡng' },
    { id: 22, text: 'Em tham gia các chương trình giúp phòng ngừa các vấn đề sức khỏe và nâng cao sức khỏe.', category: 'Chăm sóc sức khỏe' },
    { id: 23, text: 'Em hài lòng về bản thân.', category: 'Cảm xúc & Tinh thần' },
    { id: 24, text: 'Em ăn từ 3 đến 5 khẩu phần rau mỗi ngày.', category: 'Dinh dưỡng' },
    { id: 25, text: 'Em dành thời gian cho bản thân để làm điều mình thích.', category: 'Cảm xúc & Tinh thần' },
    { id: 26, text: 'Em cố gắng đạt được những mục tiêu quan trọng trong cuộc sống.', category: 'Mục tiêu & Động lực' },
    { id: 27, text: 'Em đi bộ hoặc tham gia các hoạt động vận động khác trong thời gian rảnh.', category: 'Hoạt động thể chất' },
    { id: 28, text: 'Em mong chờ mỗi ngày mới.', category: 'Cảm xúc & Tinh thần' },
    { id: 29, text: 'Em tham gia những hoạt động giúp bản thân phát triển về tâm linh.', category: 'Tinh thần & Tâm linh' },
    { id: 30, text: 'Em ăn đa dạng các loại thịt (gà, cá, bò, lợn).', category: 'Dinh dưỡng' },
    { id: 31, text: 'Em giải quyết mâu thuẫn bằng cách trao đổi thay vì đánh nhau.', category: 'Kỹ năng xã hội' },
    { id: 32, text: 'Em chơi các trò chơi vận động với bạn bè.', category: 'Hoạt động thể chất' },
    { id: 33, text: 'Khi cần, em tìm sự hướng dẫn từ người làm công tác tham vấn tâm lý ở trường.', category: 'Chăm sóc sức khỏe' },
    { id: 34, text: 'Em hỏi bác sĩ hoặc điều dưỡng về cách cải thiện sức khỏe của mình.', category: 'Chăm sóc sức khỏe' },
    { id: 35, text: 'Khi bắt đầu ngủ, em cố gắng nghĩ đến những điều dễ chịu.', category: 'Giấc ngủ & Nghỉ ngơi' },
    { id: 36, text: 'Em dành thời gian cầu nguyện hoặc thiền.', category: 'Tinh thần & Tâm linh' },
    { id: 37, text: 'Em dành thêm công sức để giúp đỡ người khác.', category: 'Kỹ năng xã hội' },
    { id: 38, text: 'Em đặt ra những mục tiêu mà mình có thể đạt được.', category: 'Mục tiêu & Động lực' },
    { id: 39, text: 'Em cảm thấy hài lòng về bản thân khi làm tốt một việc nào đó.', category: 'Cảm xúc & Tinh thần' },
    { id: 40, text: 'Em tập thể dục đến mức tim đập nhanh và đổ mồ hôi.', category: 'Hoạt động thể chất' },
    { id: 41, text: 'Em dựa vào niềm tin tôn giáo hoặc tâm linh để định hướng những việc mình làm.', category: 'Tinh thần & Tâm linh' },
    { id: 42, text: 'Em uống từ 6 cốc nước trở lên mỗi ngày.', category: 'Dinh dưỡng' },
    { id: 43, text: 'Em trao đổi với một người thân thiết về những vấn đề mình gặp phải để tìm cách giải quyết.', category: 'Kỹ năng xã hội' },
    { id: 44, text: 'Em tránh những hành vi gây hại cho sức khỏe.', category: 'Chăm sóc sức khỏe' },
];
export const KNOWLEDGE_QUESTIONS: Array<{
    id: number;
    text: string;
}> = [
    { id: 1, text: 'Sức khỏe tâm thần và các rối loạn tâm thần đều liên quan đến não bộ và cách não hoạt động.' },
    { id: 2, text: 'Một người có rối loạn tâm thần vẫn có thể có sức khỏe tâm thần tốt.' },
    { id: 3, text: 'Não có thể ảnh hưởng đến hoạt động của cơ thể, nhưng cơ thể không thể ảnh hưởng đến hoạt động của não.' },
    { id: 4, text: 'Thùy trán (phần não ở phía trước) tiếp tục phát triển cho đến khoảng 25 tuổi.' },
    { id: 5, text: 'Suy nghĩ, truyền tín hiệu và điều khiển hành vi là ba trong số các chức năng của não.' },
    { id: 6, text: 'Tâm trạng của mỗi người có thể tự nhiên thay đổi, lúc vui hơn, lúc buồn hơn.' },
    { id: 7, text: 'Não giúp điều khiển hoạt động của tim, phổi và các ngón tay.' },
    { id: 8, text: 'Cả vấn đề về gen và tình trạng nhiễm trùng đều có thể làm não bị bệnh và hoạt động không bình thường.' },
    { id: 9, text: 'Các triệu chứng của rối loạn tâm thần là do não hoạt động bất thường.' },
    { id: 10, text: 'Người có rối loạn tâm thần thường có hành vi bạo lực.' },
    { id: 11, text: 'Khi được điều trị, phần lớn người có rối loạn tâm thần sẽ khỏe lên và duy trì được tình trạng đó.' },
    { id: 12, text: 'Người mắc tâm thần phân liệt thường có nhiều nhân cách khác nhau.' },
    { id: 13, text: 'Dùng vitamin và tập thiền là những cách điều trị hiệu quả cho phần lớn rối loạn tâm thần.' },
    { id: 14, text: 'Trầm cảm và rối loạn lưỡng cực là hai ví dụ về rối loạn khí sắc (rối loạn tâm trạng).' },
    { id: 15, text: 'Rối loạn lo âu xảy ra khi não nhận thấy có nguy hiểm, chẳng hạn như khi bị chó tấn công.' },
    { id: 16, text: 'Rối loạn hoảng sợ thường bắt đầu ở tuổi vị thành niên.' },
    { id: 17, text: 'Cơn hoảng sợ xuất hiện đột ngột và thường kéo dài từ một ngày trở lên.' },
    { id: 18, text: 'Rối loạn tăng động giảm chú ý có ba biểu hiện chính là khó tập trung, tăng động và trầm cảm.' },
    { id: 19, text: 'Tự tử ở người trẻ chủ yếu liên quan đến việc bị bắt nạt và ít liên quan đến rối loạn tâm thần.' },
    { id: 20, text: 'Hành vi tự làm tổn thương bản thân đôi khi có thể vô tình dẫn đến tử vong.' },
    { id: 21, text: 'Điều trị rối loạn tâm thần nhằm giảm triệu chứng, giúp người bệnh lấy lại khả năng sinh hoạt và hỗ trợ quá trình hồi phục.' },
    { id: 22, text: 'Người có rối loạn lo âu xã hội lo sợ quá mức và thiếu căn cứ rằng mình sẽ làm điều khiến bản thân xấu hổ hoặc bối rối.' },
    { id: 23, text: 'Chán ăn tâm thần là một rối loạn ăn uống có thể dẫn đến tử vong.' },
    { id: 24, text: 'Một chức năng quan trọng của não là giúp con người thích nghi với môi trường xung quanh.' },
    { id: 25, text: 'Rối loạn tâm thần thường bắt đầu do những căng thẳng trong cuộc sống hằng ngày.' },
    { id: 26, text: 'Loạn thần là tình trạng suy nghĩ và cảm nhận bị xáo trộn đến mức người đó mất liên hệ với thực tế.' },
    { id: 27, text: 'Hoang tưởng và ảo giác là những triệu chứng chính của tâm thần phân liệt.' },
    { id: 28, text: 'Mọi rối loạn tâm thần đều nên được điều trị bằng thuốc.' },
];
export const ATTITUDE_QUESTIONS: Array<{
    id: number;
    text: string;
}> = [
    { id: 1, text: 'Có thể dễ dàng nhận ra một người có rối loạn tâm thần vì họ thường cư xử khác thường.' },
    { id: 2, text: 'Người có rối loạn tâm thần không nên được bỏ phiếu trong các cuộc bầu cử.' },
    { id: 3, text: 'Phần lớn người có rối loạn tâm thần nguy hiểm và có hành vi bạo lực.' },
    { id: 4, text: 'Phần lớn người có rối loạn tâm thần có thể có công việc tốt và sống thành công, có ý nghĩa.' },
    { id: 5, text: 'Em sẵn lòng học cùng trường với một người có rối loạn tâm thần.' },
    { id: 6, text: 'Em sẽ vui nếu có một người bạn thân có rối loạn tâm thần.' },
    { id: 7, text: 'Rối loạn tâm thần thường là hậu quả của cách nuôi dạy con không phù hợp hoặc môi trường gia đình không tốt.' },
    { id: 8, text: 'Tình trạng của người có rối loạn tâm thần sẽ không khá lên.' },
];
export const SELF_CARE_SKILLS: Array<{
    id: number;
    text: string;
}> = [
    { id: 1, text: 'Nhận ra khi cảm xúc của mình thay đổi theo hướng khó chịu, như buồn, lo lắng hoặc dễ cáu hơn.' },
    { id: 2, text: 'Xác định điều đang khiến mình căng thẳng hoặc khó chịu.' },
    { id: 3, text: 'Nhận ra khi khó khăn về tinh thần bắt đầu ảnh hưởng đến việc học hoặc sinh hoạt của mình.' },
    { id: 4, text: 'Chọn một việc có thể làm thường xuyên để giữ tinh thần khỏe mạnh, kể cả khi mình không gặp khó khăn.' },
    { id: 5, text: 'Chọn một cách giúp mình bình tĩnh mà không gây hại cho bản thân hoặc người khác.' },
    { id: 6, text: 'Lập một kế hoạch đơn giản cho việc chăm sóc tinh thần của mình, trong đó xác định rõ sẽ làm gì và khi nào làm.' },
    { id: 7, text: 'Thực hiện việc chăm sóc tinh thần mình đã dự định.' },
    { id: 8, text: 'Nhận xét cách chăm sóc đã thử có giúp ích cho mình hay không.' },
    { id: 9, text: 'Chọn bước tiếp theo khi cách chăm sóc đã thử chưa giúp ích.' },
    { id: 10, text: 'Chọn một người đáng tin cậy để nhờ giúp đỡ khi gặp khó khăn về tinh thần.' },
    { id: 11, text: 'Nói cho người hỗ trợ hiểu mình đang gặp khó khăn gì.' },
    { id: 12, text: 'Xác định bước đầu tiên để tiếp cận người hỗ trợ chuyên môn về sức khỏe tâm thần, kể cả nhờ người lớn kết nối.' },
];
export const SURVEY_SECTIONS = [
    { id: 'intro', title: 'Giới thiệu & Cam kết', label: 'Bắt đầu' },
    { id: 'sectionA', title: 'Thông tin cá nhân và gia đình', label: 'Phần A' },
    { id: 'sectionB', title: 'Thang đo SDQ - 25', label: 'Thang đo SDQ - 25' },
    { id: 'sectionC', title: 'Thang đo PHQ - A', label: 'Thang đo PHQ - A' },
    { id: 'sectionD', title: 'Thang đo GAD - 7', label: 'Thang đo GAD - 7' },
    { id: 'sectionE', title: 'Thang đo SBQ - R', label: 'Thang đo SBQ - R' },
    { id: 'sectionF', title: 'Thang đo Lối sống', label: 'Thang đo Lối sống' },
    { id: 'sectionG', title: 'Thang đo Kiến thức', label: 'Thang đo Kiến thức' },
    { id: 'sectionH', title: 'Thang đo Thái độ', label: 'Thang đo Thái độ' },
    { id: 'sectionI', title: 'Thang đo Kỹ năng tự chăm sóc', label: 'Thang đo Kỹ năng tự chăm sóc' },
    { id: 'sectionJ', title: 'Rào cản và nhu cầu hỗ trợ', label: 'Nhu cầu hỗ trợ' },
];
