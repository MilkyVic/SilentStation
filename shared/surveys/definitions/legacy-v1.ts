// Immutable historical definition; never relabel stored responses.
import type {Definition} from "../contracts.js";
export const LEGACY_V1_DEFINITION: Definition = {
  "version": "student-mental-health-v1-draft",
  "consentVersion": "survey-consent-v1-draft",
  "sections": [
    {
      "id": "A",
      "title": "Thông tin cá nhân và gia đình",
      "instruction": "Không ghi họ tên, tài khoản hoặc thông tin liên hệ. Em có thể bỏ qua bất kỳ câu nào."
    },
    {
      "id": "B",
      "title": "Điểm mạnh và khó khăn · SDQ-25",
      "instruction": "Trả lời theo những sự việc diễn ra trong vòng 6 tháng trở lại đây."
    },
    {
      "id": "C",
      "title": "Các biểu hiện · PHQ-A",
      "instruction": "Trả lời theo trải nghiệm trong 2 tuần vừa qua. Em không cần trả lời nếu chưa sẵn sàng."
    },
    {
      "id": "D",
      "title": "Các biểu hiện lo âu · GAD-7",
      "instruction": "Trong 2 tuần vừa qua, em cảm thấy khó chịu bởi mỗi vấn đề trong bao nhiêu ngày?"
    },
    {
      "id": "E",
      "title": "Suy nghĩ và hành vi · SBQ-R",
      "instruction": "Chọn một phương án phù hợp; em luôn có thể bỏ qua hoặc dừng lại. Nếu đang không an toàn, hãy tìm người lớn đáng tin cậy ngay."
    },
    {
      "id": "F",
      "title": "Lối sống",
      "instruction": "Trả lời theo thói quen thực tế. Nếu không hiểu hoặc không muốn trả lời, em có thể bỏ qua."
    },
    {
      "id": "G",
      "title": "Kiến thức sức khỏe tâm thần",
      "instruction": "Chọn Đúng, Sai hoặc Không biết. Không biết khác với bỏ qua câu hỏi."
    },
    {
      "id": "H",
      "title": "Thái độ",
      "instruction": "Chọn mức đồng ý từ 1 đến 7 phù hợp với suy nghĩ của em."
    },
    {
      "id": "I",
      "title": "Tự chăm sóc và tìm kiếm sự trợ giúp",
      "instruction": "K có nghĩa là em chưa rõ khả năng của mình; đây là một lựa chọn hợp lệ."
    },
    {
      "id": "J",
      "title": "Rào cản và nhu cầu hỗ trợ",
      "instruction": "Các câu tự luận không bắt buộc. Không ghi chi tiết có thể nhận diện em hoặc người khác."
    }
  ],
  "questions": [
    {
      "code": "A.birthYear",
      "section": "A",
      "label": "A1. Năm sinh của em",
      "kind": "integer",
      "min": 1900,
      "max": 2100
    },
    {
      "code": "A.gender",
      "section": "A",
      "label": "A2. Giới tính",
      "kind": "single",
      "options": [
        {
          "value": "1",
          "label": "Nam"
        },
        {
          "value": "2",
          "label": "Nữ"
        }
      ]
    },
    {
      "code": "A.grade",
      "section": "A",
      "label": "A3. Đang học lớp",
      "kind": "single",
      "options": [
        {
          "value": "6",
          "label": "6"
        },
        {
          "value": "7",
          "label": "7"
        },
        {
          "value": "8",
          "label": "8"
        },
        {
          "value": "9",
          "label": "9"
        },
        {
          "value": "10",
          "label": "10"
        },
        {
          "value": "11",
          "label": "11"
        },
        {
          "value": "12",
          "label": "12"
        }
      ]
    },
    {
      "code": "A.schoolType",
      "section": "A",
      "label": "A4. Cấp trường",
      "kind": "single",
      "options": [
        {
          "value": "1",
          "label": "THCS"
        },
        {
          "value": "2",
          "label": "THPT"
        }
      ]
    },
    {
      "code": "A.screenTime",
      "section": "A",
      "label": "A5. Trong 7 ngày qua, trung bình mỗi ngày em sử dụng thiết bị có màn hình (điện thoại, máy tính bảng, máy tính, ti vi…) ngoài thời gian học khoảng bao lâu? Tính cả thời gian xem video, chơi trò chơi, dùng mạng xã hội hoặc nhắn tin. Nếu dùng hai thiết bị cùng lúc, chỉ tính khoảng thời gian đó một lần.",
      "kind": "single",
      "options": [
        {
          "value": "0",
          "label": "Không sử dụng"
        },
        {
          "value": "1",
          "label": "Dưới 2 giờ"
        },
        {
          "value": "2",
          "label": "Từ 2 đến dưới 4 giờ"
        },
        {
          "value": "3",
          "label": "Từ 4 giờ trở lên"
        }
      ]
    },
    {
      "code": "A.father.age",
      "section": "A",
      "label": "Tuổi của bố",
      "kind": "integer",
      "min": 1,
      "max": 120
    },
    {
      "code": "A.father.educationLevel",
      "section": "A",
      "label": "Trình độ học vấn của bố",
      "kind": "single",
      "options": [
        {
          "value": "1",
          "label": "Chưa tốt nghiệp THPT"
        },
        {
          "value": "2",
          "label": "Tốt nghiệp THPT"
        },
        {
          "value": "3",
          "label": "Cao đẳng – đại học"
        },
        {
          "value": "4",
          "label": "Thạc sĩ – Tiến sĩ"
        }
      ]
    },
    {
      "code": "A.mother.age",
      "section": "A",
      "label": "Tuổi của mẹ",
      "kind": "integer",
      "min": 1,
      "max": 120
    },
    {
      "code": "A.mother.educationLevel",
      "section": "A",
      "label": "Trình độ học vấn của mẹ",
      "kind": "single",
      "options": [
        {
          "value": "1",
          "label": "Chưa tốt nghiệp THPT"
        },
        {
          "value": "2",
          "label": "Tốt nghiệp THPT"
        },
        {
          "value": "3",
          "label": "Cao đẳng – đại học"
        },
        {
          "value": "4",
          "label": "Thạc sĩ – Tiến sĩ"
        }
      ]
    },
    {
      "code": "B.1",
      "section": "B",
      "label": "Em cố gắng đối xử tốt với người khác. Em quan tâm đến cảm giác của họ.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.2",
      "section": "B",
      "label": "Em bồn chồn, không thể ngồi yên lâu.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.3",
      "section": "B",
      "label": "Em rất hay bị đau đầu, đau bụng và ốm.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.4",
      "section": "B",
      "label": "Em thường chia sẻ với các bạn khác, ví dụ trò chơi, đồ ăn và sách.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.5",
      "section": "B",
      "label": "Em rất tức giận và hay mất bình tĩnh.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.6",
      "section": "B",
      "label": "Em muốn ở một mình hơn là ở với những bạn bằng tuổi.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.7",
      "section": "B",
      "label": "Em thường làm theo yêu cầu của người lớn.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.8",
      "section": "B",
      "label": "Em cảm thấy nhiều lo lắng.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.9",
      "section": "B",
      "label": "Em thường giúp khi ai đó bị thương tổn, buồn bực hoặc ốm.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.10",
      "section": "B",
      "label": "Em thường xuyên đứng ngồi không yên, vặn vẹo, loay hoay.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.11",
      "section": "B",
      "label": "Em có ít nhất 1 người bạn tốt.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.12",
      "section": "B",
      "label": "Em thường đánh nhau với những trẻ khác hoặc bắt nạt họ.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.13",
      "section": "B",
      "label": "Em thường không vui, buồn rầu hoặc sắp khóc.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.14",
      "section": "B",
      "label": "Những trẻ bằng tuổi em thường yêu mến em.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.15",
      "section": "B",
      "label": "Em dễ bị sao nhãng, rất khó tập trung.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.16",
      "section": "B",
      "label": "Em lo lắng trong các tình huống mới. Em dễ mất sự tự tin.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.17",
      "section": "B",
      "label": "Em thường tốt bụng với những trẻ nhỏ hơn em.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.18",
      "section": "B",
      "label": "Em thường dối trá và lừa gạt.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.19",
      "section": "B",
      "label": "Em bị những trẻ khác bắt nạt hoặc chế diễu.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.20",
      "section": "B",
      "label": "Em thường tình nguyện giúp người khác (cha mẹ, thầy cô giáo và trẻ khác).",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.21",
      "section": "B",
      "label": "Em suy nghĩ trước khi hành động.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.22",
      "section": "B",
      "label": "Em lấy đồ không phải của em ở nhà, ở trường và nơi khác.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.23",
      "section": "B",
      "label": "Em dễ hòa hợp với người lớn hơn là các bạn cùng tuổi.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.24",
      "section": "B",
      "label": "Em có nhiều nỗi sợ, dễ sợ hãi.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "B.25",
      "section": "B",
      "label": "Em hoàn thành công việc em làm. Em có khả năng chú ý tốt.",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không đúng"
        },
        {
          "value": 1,
          "label": "Đúng một phần"
        },
        {
          "value": 2,
          "label": "Chắc chắn đúng"
        }
      ]
    },
    {
      "code": "C.1",
      "section": "C",
      "label": "Cảm thấy buồn bã, chán nản, cáu kỉnh hoặc tuyệt vọng?",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không có ngày nào"
        },
        {
          "value": 1,
          "label": "Một vài ngày"
        },
        {
          "value": 2,
          "label": "Hơn nửa số ngày"
        },
        {
          "value": 3,
          "label": "Gần như mỗi ngày"
        }
      ]
    },
    {
      "code": "C.2",
      "section": "C",
      "label": "Mất hứng thú hoặc không còn thấy vui khi làm các việc từng yêu thích",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không có ngày nào"
        },
        {
          "value": 1,
          "label": "Một vài ngày"
        },
        {
          "value": 2,
          "label": "Hơn nửa số ngày"
        },
        {
          "value": 3,
          "label": "Gần như mỗi ngày"
        }
      ]
    },
    {
      "code": "C.3",
      "section": "C",
      "label": "Khó ngủ, ngủ không ngon giấc hoặc ngủ quá nhiều?",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không có ngày nào"
        },
        {
          "value": 1,
          "label": "Một vài ngày"
        },
        {
          "value": 2,
          "label": "Hơn nửa số ngày"
        },
        {
          "value": 3,
          "label": "Gần như mỗi ngày"
        }
      ]
    },
    {
      "code": "C.4",
      "section": "C",
      "label": "Ăn kém, sụt cân hoặc ăn quá nhiều",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không có ngày nào"
        },
        {
          "value": 1,
          "label": "Một vài ngày"
        },
        {
          "value": 2,
          "label": "Hơn nửa số ngày"
        },
        {
          "value": 3,
          "label": "Gần như mỗi ngày"
        }
      ]
    },
    {
      "code": "C.5",
      "section": "C",
      "label": "Cảm thấy mệt mỏi, thiếu năng lượng",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không có ngày nào"
        },
        {
          "value": 1,
          "label": "Một vài ngày"
        },
        {
          "value": 2,
          "label": "Hơn nửa số ngày"
        },
        {
          "value": 3,
          "label": "Gần như mỗi ngày"
        }
      ]
    },
    {
      "code": "C.6",
      "section": "C",
      "label": "Cảm thấy tồi tệ về bản thân - hoặc cảm thấy mình là kẻ thất bại, hay đã khiến bản thân hoặc gia đình thất vọng",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không có ngày nào"
        },
        {
          "value": 1,
          "label": "Một vài ngày"
        },
        {
          "value": 2,
          "label": "Hơn nửa số ngày"
        },
        {
          "value": 3,
          "label": "Gần như mỗi ngày"
        }
      ]
    },
    {
      "code": "C.7",
      "section": "C",
      "label": "Khó tập trung vào những việc như học hành, đọc sách hoặc xem TV",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không có ngày nào"
        },
        {
          "value": 1,
          "label": "Một vài ngày"
        },
        {
          "value": 2,
          "label": "Hơn nửa số ngày"
        },
        {
          "value": 3,
          "label": "Gần như mỗi ngày"
        }
      ]
    },
    {
      "code": "C.8",
      "section": "C",
      "label": "Cử động hoặc nói chậm đến mức người khác có thể nhận ra? Hoặc ngược lại - quá bồn chồn hoặc bứt rứt đến mức cử động nhiều hơn bình thường?",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không có ngày nào"
        },
        {
          "value": 1,
          "label": "Một vài ngày"
        },
        {
          "value": 2,
          "label": "Hơn nửa số ngày"
        },
        {
          "value": 3,
          "label": "Gần như mỗi ngày"
        }
      ]
    },
    {
      "code": "C.9",
      "section": "C",
      "label": "Có suy nghĩ rằng bạn sẽ tốt hơn nếu chết đi, hoặc nghĩ đến việc làm tổn thương bản thân theo cách nào đó",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không có ngày nào"
        },
        {
          "value": 1,
          "label": "Một vài ngày"
        },
        {
          "value": 2,
          "label": "Hơn nửa số ngày"
        },
        {
          "value": 3,
          "label": "Gần như mỗi ngày"
        }
      ]
    },
    {
      "code": "C.c10SadMostDays",
      "section": "C",
      "label": "Trong 1 năm qua, em có cảm thấy buồn hoặc chán nản hầu hết các ngày, ngay cả khi thỉnh thoảng em vẫn cảm thấy ổn không?",
      "kind": "single",
      "options": [
        {
          "value": "co",
          "label": "Có"
        },
        {
          "value": "khong",
          "label": "Không"
        }
      ]
    },
    {
      "code": "C.c11Difficulty",
      "section": "C",
      "label": "C11. Nếu em đang gặp bất kỳ vấn đề nào được liệt kê trong biểu mẫu này, những vấn đề đó đã khiến em gặp khó khăn như thế nào trong việc học tập, chăm sóc bản thân ở nhà hoặc hoà hợp với người khác?",
      "kind": "single",
      "options": [
        {
          "value": "none",
          "label": "Không khó khăn"
        },
        {
          "value": "somewhat",
          "label": "Hơi khó khăn"
        },
        {
          "value": "very",
          "label": "Khá khó khăn"
        },
        {
          "value": "extreme",
          "label": "Cực kỳ khó khăn"
        }
      ]
    },
    {
      "code": "C.c12SuicideAttemptLifetime",
      "section": "C",
      "label": "Em đã bao giờ, trong suốt cuộc đời mình, cố gắng tự sát hoặc thực hiện hành vi tự sát chưa?",
      "kind": "single",
      "options": [
        {
          "value": "co",
          "label": "Có"
        },
        {
          "value": "khong",
          "label": "Không"
        }
      ]
    },
    {
      "code": "D.1",
      "section": "D",
      "label": "Cảm giác hồi hộp, lo lắng hoặc cáu kỉnh",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không bao giờ"
        },
        {
          "value": 1,
          "label": "Vài ngày"
        },
        {
          "value": 2,
          "label": "Hơn một nửa số ngày"
        },
        {
          "value": 3,
          "label": "Gần như hàng ngày"
        }
      ]
    },
    {
      "code": "D.2",
      "section": "D",
      "label": "Không thể dừng hoặc kiểm soát được việc lo lắng",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không bao giờ"
        },
        {
          "value": 1,
          "label": "Vài ngày"
        },
        {
          "value": 2,
          "label": "Hơn một nửa số ngày"
        },
        {
          "value": 3,
          "label": "Gần như hàng ngày"
        }
      ]
    },
    {
      "code": "D.3",
      "section": "D",
      "label": "Lo lắng quá nhiều về những điều khác nhau",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không bao giờ"
        },
        {
          "value": 1,
          "label": "Vài ngày"
        },
        {
          "value": 2,
          "label": "Hơn một nửa số ngày"
        },
        {
          "value": 3,
          "label": "Gần như hàng ngày"
        }
      ]
    },
    {
      "code": "D.4",
      "section": "D",
      "label": "Không thể thư giãn được",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không bao giờ"
        },
        {
          "value": 1,
          "label": "Vài ngày"
        },
        {
          "value": 2,
          "label": "Hơn một nửa số ngày"
        },
        {
          "value": 3,
          "label": "Gần như hàng ngày"
        }
      ]
    },
    {
      "code": "D.5",
      "section": "D",
      "label": "Cảm thấy bồn chồn đến mức mà khó có thể ngồi yên một chỗ",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không bao giờ"
        },
        {
          "value": 1,
          "label": "Vài ngày"
        },
        {
          "value": 2,
          "label": "Hơn một nửa số ngày"
        },
        {
          "value": 3,
          "label": "Gần như hàng ngày"
        }
      ]
    },
    {
      "code": "D.6",
      "section": "D",
      "label": "Trở nên dễ bực mình hoặc cáu kỉnh",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không bao giờ"
        },
        {
          "value": 1,
          "label": "Vài ngày"
        },
        {
          "value": 2,
          "label": "Hơn một nửa số ngày"
        },
        {
          "value": 3,
          "label": "Gần như hàng ngày"
        }
      ]
    },
    {
      "code": "D.7",
      "section": "D",
      "label": "Cảm thấy sợ như thể có một điều gì đó khủng khiếp có thể xảy ra",
      "kind": "single",
      "options": [
        {
          "value": 0,
          "label": "Không bao giờ"
        },
        {
          "value": 1,
          "label": "Vài ngày"
        },
        {
          "value": 2,
          "label": "Hơn một nửa số ngày"
        },
        {
          "value": 3,
          "label": "Gần như hàng ngày"
        }
      ]
    },
    {
      "code": "E.e1",
      "section": "E",
      "label": "E1. Em đã bao giờ nghĩ đến việc tự sát hoặc đã cố gắng tự sát chưa?",
      "kind": "single",
      "options": [
        {
          "value": "1",
          "label": "Không bao giờ."
        },
        {
          "value": "2",
          "label": "Đó chỉ là một suy nghĩ thoáng qua."
        },
        {
          "value": "3a",
          "label": "Em đã từng có kế hoạch tự sát ít nhất một lần nhưng không cố gắng thực hiện."
        },
        {
          "value": "3b",
          "label": "Em đã từng có kế hoạch tự sát ít nhất một lần và thực sự muốn chết."
        },
        {
          "value": "4a",
          "label": "Em đã cố gắng tự sát nhưng không muốn chết."
        },
        {
          "value": "4b",
          "label": "Em đã cố gắng tự sát và thực sự hy vọng mình sẽ chết."
        }
      ]
    },
    {
      "code": "E.e2",
      "section": "E",
      "label": "E2. Trong 12 tháng qua, em đã nghĩ đến việc tự sát thường xuyên như thế nào?",
      "kind": "single",
      "options": [
        {
          "value": "1",
          "label": "Không bao giờ."
        },
        {
          "value": "2",
          "label": "Hiếm khi (1 lần)."
        },
        {
          "value": "3",
          "label": "Thỉnh thoảng (2 lần)."
        },
        {
          "value": "4",
          "label": "Thường xuyên (3–4 lần)."
        },
        {
          "value": "5",
          "label": "Rất thường xuyên (5 lần trở lên)."
        }
      ]
    },
    {
      "code": "E.e3",
      "section": "E",
      "label": "E3. Em đã bao giờ nói với ai đó rằng em sẽ tự sát hoặc có thể sẽ làm điều đó chưa?",
      "kind": "single",
      "options": [
        {
          "value": "1",
          "label": "Không."
        },
        {
          "value": "2a",
          "label": "Có, một lần, nhưng em thực sự không muốn chết."
        },
        {
          "value": "2b",
          "label": "Có, một lần, và em thực sự muốn chết."
        },
        {
          "value": "3a",
          "label": "Có, hơn một lần, nhưng em không muốn làm điều đó."
        },
        {
          "value": "3b",
          "label": "Có, hơn một lần, và em thực sự muốn làm điều đó."
        }
      ]
    },
    {
      "code": "E.e4",
      "section": "E",
      "label": "E4. Em nghĩ khả năng một ngày nào đó em sẽ cố gắng tự sát là như thế nào?",
      "kind": "single",
      "options": [
        {
          "value": "0",
          "label": "Không bao giờ."
        },
        {
          "value": "1",
          "label": "Hoàn toàn không có khả năng."
        },
        {
          "value": "2",
          "label": "Khá ít khả năng xảy ra."
        },
        {
          "value": "3",
          "label": "Ít khả năng xảy ra."
        },
        {
          "value": "4",
          "label": "Có khả năng xảy ra."
        },
        {
          "value": "5",
          "label": "Khá có khả năng xảy ra."
        },
        {
          "value": "6",
          "label": "Rất có khả năng xảy ra."
        }
      ]
    },
    {
      "code": "F.1",
      "section": "F",
      "label": "Em dành thời gian trò chuyện với các thành viên trong gia đình.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.2",
      "section": "F",
      "label": "Em dành thời gian cùng gia đình tham gia các hoạt động vận động.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.3",
      "section": "F",
      "label": "Em đến gặp nhân viên y tế trường học hoặc bác sĩ khi cảm thấy không khỏe.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.4",
      "section": "F",
      "label": "Em tham gia hoạt động thể chất cường độ mạnh từ 20 phút trở lên, 3 ngày mỗi tuần.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.5",
      "section": "F",
      "label": "Em ngủ từ 6 đến 8 giờ mỗi đêm.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.6",
      "section": "F",
      "label": "Em chúc mừng người khác khi họ làm tốt một việc nào đó.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.7",
      "section": "F",
      "label": "Em tránh đồ ngọt hoặc những thực phẩm chứa nhiều đường.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.8",
      "section": "F",
      "label": "Em đọc các bài viết về chủ đề sức khỏe.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.9",
      "section": "F",
      "label": "Em trò chuyện với người khác về niềm tin tôn giáo hoặc tâm linh của mình.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.10",
      "section": "F",
      "label": "Em chọn sữa ít béo hoặc các sản phẩm từ sữa ít béo.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.11",
      "section": "F",
      "label": "Em dành thời gian thư giãn mỗi ngày.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.12",
      "section": "F",
      "label": "Em cố gắng chú ý đến cảm xúc của người khác.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.13",
      "section": "F",
      "label": "Em có ăn sáng hàng ngày",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.14",
      "section": "F",
      "label": "Em hỏi bác sĩ hoặc điều dưỡng để hiểu rõ những hướng dẫn của họ.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.15",
      "section": "F",
      "label": "Em cảm nhận có một sức mạnh siêu việt dẫn dắt cuộc sống của mình.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.16",
      "section": "F",
      "label": "Em tham gia các hoạt động giải trí hoặc thể thao.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.17",
      "section": "F",
      "label": "Em chấp nhận những điều trong cuộc sống mà mình không thể thay đổi.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.18",
      "section": "F",
      "label": "Em cảm thấy hào hứng về tương lai.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.19",
      "section": "F",
      "label": "Em dành thời gian ở bên những người bạn thân.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.20",
      "section": "F",
      "label": "Em tham gia một nhóm có cùng niềm tin tôn giáo hoặc tâm linh với mình.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.21",
      "section": "F",
      "label": "Em ăn từ 2 đến 4 khẩu phần trái cây mỗi ngày.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.22",
      "section": "F",
      "label": "Em tham gia các chương trình giúp phòng ngừa các vấn đề sức khỏe và nâng cao sức khỏe.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.23",
      "section": "F",
      "label": "Em hài lòng về bản thân.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.24",
      "section": "F",
      "label": "Em ăn từ 3 đến 5 khẩu phần rau mỗi ngày.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.25",
      "section": "F",
      "label": "Em dành thời gian cho bản thân để làm điều mình thích.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.26",
      "section": "F",
      "label": "Em cố gắng đạt được những mục tiêu quan trọng trong cuộc sống.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.27",
      "section": "F",
      "label": "Em đi bộ hoặc tham gia các hoạt động vận động khác trong thời gian rảnh.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.28",
      "section": "F",
      "label": "Em mong chờ mỗi ngày mới.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.29",
      "section": "F",
      "label": "Em tham gia những hoạt động giúp bản thân phát triển về tâm linh.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.30",
      "section": "F",
      "label": "Em ăn đa dạng các loại thịt (gà, cá, bò, lợn).",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.31",
      "section": "F",
      "label": "Em giải quyết mâu thuẫn bằng cách trao đổi thay vì đánh nhau.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.32",
      "section": "F",
      "label": "Em chơi các trò chơi vận động với bạn bè.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.33",
      "section": "F",
      "label": "Khi cần, em tìm sự hướng dẫn từ người làm công tác tham vấn tâm lý ở trường.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.34",
      "section": "F",
      "label": "Em hỏi bác sĩ hoặc điều dưỡng về cách cải thiện sức khỏe của mình.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.35",
      "section": "F",
      "label": "Khi bắt đầu ngủ, em cố gắng nghĩ đến những điều dễ chịu.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.36",
      "section": "F",
      "label": "Em dành thời gian cầu nguyện hoặc thiền.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.37",
      "section": "F",
      "label": "Em dành thêm công sức để giúp đỡ người khác.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.38",
      "section": "F",
      "label": "Em đặt ra những mục tiêu mà mình có thể đạt được.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.39",
      "section": "F",
      "label": "Em cảm thấy hài lòng về bản thân khi làm tốt một việc nào đó.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.40",
      "section": "F",
      "label": "Em tập thể dục đến mức tim đập nhanh và đổ mồ hôi.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.41",
      "section": "F",
      "label": "Em dựa vào niềm tin tôn giáo hoặc tâm linh để định hướng những việc mình làm.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.42",
      "section": "F",
      "label": "Em uống từ 6 cốc nước trở lên mỗi ngày.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.43",
      "section": "F",
      "label": "Em trao đổi với một người thân thiết về những vấn đề mình gặp phải để tìm cách giải quyết.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "F.44",
      "section": "F",
      "label": "Em tránh những hành vi gây hại cho sức khỏe.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Không bao giờ"
        },
        {
          "value": 2,
          "label": "Thỉnh thoảng"
        },
        {
          "value": 3,
          "label": "Thường xuyên"
        },
        {
          "value": 4,
          "label": "Luôn luôn"
        }
      ]
    },
    {
      "code": "G.1",
      "section": "G",
      "label": "Sức khỏe tâm thần và các rối loạn tâm thần đều liên quan đến não bộ và cách não hoạt động.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.2",
      "section": "G",
      "label": "Một người có rối loạn tâm thần vẫn có thể có sức khỏe tâm thần tốt.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.3",
      "section": "G",
      "label": "Não có thể ảnh hưởng đến hoạt động của cơ thể, nhưng cơ thể không thể ảnh hưởng đến hoạt động của não.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.4",
      "section": "G",
      "label": "Thùy trán (phần não ở phía trước) tiếp tục phát triển cho đến khoảng 25 tuổi.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.5",
      "section": "G",
      "label": "Suy nghĩ, truyền tín hiệu và điều khiển hành vi là ba trong số các chức năng của não.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.6",
      "section": "G",
      "label": "Tâm trạng của mỗi người có thể tự nhiên thay đổi, lúc vui hơn, lúc buồn hơn.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.7",
      "section": "G",
      "label": "Não giúp điều khiển hoạt động của tim, phổi và các ngón tay.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.8",
      "section": "G",
      "label": "Cả vấn đề về gen và tình trạng nhiễm trùng đều có thể làm não bị bệnh và hoạt động không bình thường.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.9",
      "section": "G",
      "label": "Các triệu chứng của rối loạn tâm thần là do não hoạt động bất thường.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.10",
      "section": "G",
      "label": "Người có rối loạn tâm thần thường có hành vi bạo lực.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.11",
      "section": "G",
      "label": "Khi được điều trị, phần lớn người có rối loạn tâm thần sẽ khỏe lên và duy trì được tình trạng đó.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.12",
      "section": "G",
      "label": "Người mắc tâm thần phân liệt thường có nhiều nhân cách khác nhau.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.13",
      "section": "G",
      "label": "Dùng vitamin và tập thiền là những cách điều trị hiệu quả cho phần lớn rối loạn tâm thần.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.14",
      "section": "G",
      "label": "Trầm cảm và rối loạn lưỡng cực là hai ví dụ về rối loạn khí sắc (rối loạn tâm trạng).",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.15",
      "section": "G",
      "label": "Rối loạn lo âu xảy ra khi não nhận thấy có nguy hiểm, chẳng hạn như khi bị chó tấn công.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.16",
      "section": "G",
      "label": "Rối loạn hoảng sợ thường bắt đầu ở tuổi vị thành niên.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.17",
      "section": "G",
      "label": "Cơn hoảng sợ xuất hiện đột ngột và thường kéo dài từ một ngày trở lên.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.18",
      "section": "G",
      "label": "Rối loạn tăng động giảm chú ý có ba biểu hiện chính là khó tập trung, tăng động và trầm cảm.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.19",
      "section": "G",
      "label": "Tự tử ở người trẻ chủ yếu liên quan đến việc bị bắt nạt và ít liên quan đến rối loạn tâm thần.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.20",
      "section": "G",
      "label": "Hành vi tự làm tổn thương bản thân đôi khi có thể vô tình dẫn đến tử vong.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.21",
      "section": "G",
      "label": "Điều trị rối loạn tâm thần nhằm giảm triệu chứng, giúp người bệnh lấy lại khả năng sinh hoạt và hỗ trợ quá trình hồi phục.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.22",
      "section": "G",
      "label": "Người có rối loạn lo âu xã hội lo sợ quá mức và thiếu căn cứ rằng mình sẽ làm điều khiến bản thân xấu hổ hoặc bối rối.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.23",
      "section": "G",
      "label": "Chán ăn tâm thần là một rối loạn ăn uống có thể dẫn đến tử vong.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.24",
      "section": "G",
      "label": "Một chức năng quan trọng của não là giúp con người thích nghi với môi trường xung quanh.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.25",
      "section": "G",
      "label": "Rối loạn tâm thần thường bắt đầu do những căng thẳng trong cuộc sống hằng ngày.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.26",
      "section": "G",
      "label": "Loạn thần là tình trạng suy nghĩ và cảm nhận bị xáo trộn đến mức người đó mất liên hệ với thực tế.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.27",
      "section": "G",
      "label": "Hoang tưởng và ảo giác là những triệu chứng chính của tâm thần phân liệt.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "G.28",
      "section": "G",
      "label": "Mọi rối loạn tâm thần đều nên được điều trị bằng thuốc.",
      "kind": "single",
      "options": [
        {
          "value": "dung",
          "label": "Đúng"
        },
        {
          "value": "sai",
          "label": "Sai"
        },
        {
          "value": "khong_biet",
          "label": "Không biết"
        }
      ]
    },
    {
      "code": "H.1",
      "section": "H",
      "label": "Có thể dễ dàng nhận ra một người có rối loạn tâm thần vì họ thường cư xử khác thường.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Hoàn toàn không đồng ý"
        },
        {
          "value": 2,
          "label": "Không đồng ý"
        },
        {
          "value": 3,
          "label": "Hơi không đồng ý"
        },
        {
          "value": 4,
          "label": "Trung tính"
        },
        {
          "value": 5,
          "label": "Hơi đồng ý"
        },
        {
          "value": 6,
          "label": "Đồng ý"
        },
        {
          "value": 7,
          "label": "Hoàn toàn đồng ý"
        }
      ]
    },
    {
      "code": "H.2",
      "section": "H",
      "label": "Người có rối loạn tâm thần không nên được bỏ phiếu trong các cuộc bầu cử.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Hoàn toàn không đồng ý"
        },
        {
          "value": 2,
          "label": "Không đồng ý"
        },
        {
          "value": 3,
          "label": "Hơi không đồng ý"
        },
        {
          "value": 4,
          "label": "Trung tính"
        },
        {
          "value": 5,
          "label": "Hơi đồng ý"
        },
        {
          "value": 6,
          "label": "Đồng ý"
        },
        {
          "value": 7,
          "label": "Hoàn toàn đồng ý"
        }
      ]
    },
    {
      "code": "H.3",
      "section": "H",
      "label": "Phần lớn người có rối loạn tâm thần nguy hiểm và có hành vi bạo lực.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Hoàn toàn không đồng ý"
        },
        {
          "value": 2,
          "label": "Không đồng ý"
        },
        {
          "value": 3,
          "label": "Hơi không đồng ý"
        },
        {
          "value": 4,
          "label": "Trung tính"
        },
        {
          "value": 5,
          "label": "Hơi đồng ý"
        },
        {
          "value": 6,
          "label": "Đồng ý"
        },
        {
          "value": 7,
          "label": "Hoàn toàn đồng ý"
        }
      ]
    },
    {
      "code": "H.4",
      "section": "H",
      "label": "Phần lớn người có rối loạn tâm thần có thể có công việc tốt và sống thành công, có ý nghĩa.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Hoàn toàn không đồng ý"
        },
        {
          "value": 2,
          "label": "Không đồng ý"
        },
        {
          "value": 3,
          "label": "Hơi không đồng ý"
        },
        {
          "value": 4,
          "label": "Trung tính"
        },
        {
          "value": 5,
          "label": "Hơi đồng ý"
        },
        {
          "value": 6,
          "label": "Đồng ý"
        },
        {
          "value": 7,
          "label": "Hoàn toàn đồng ý"
        }
      ]
    },
    {
      "code": "H.5",
      "section": "H",
      "label": "Em sẵn lòng học cùng trường với một người có rối loạn tâm thần.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Hoàn toàn không đồng ý"
        },
        {
          "value": 2,
          "label": "Không đồng ý"
        },
        {
          "value": 3,
          "label": "Hơi không đồng ý"
        },
        {
          "value": 4,
          "label": "Trung tính"
        },
        {
          "value": 5,
          "label": "Hơi đồng ý"
        },
        {
          "value": 6,
          "label": "Đồng ý"
        },
        {
          "value": 7,
          "label": "Hoàn toàn đồng ý"
        }
      ]
    },
    {
      "code": "H.6",
      "section": "H",
      "label": "Em sẽ vui nếu có một người bạn thân có rối loạn tâm thần.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Hoàn toàn không đồng ý"
        },
        {
          "value": 2,
          "label": "Không đồng ý"
        },
        {
          "value": 3,
          "label": "Hơi không đồng ý"
        },
        {
          "value": 4,
          "label": "Trung tính"
        },
        {
          "value": 5,
          "label": "Hơi đồng ý"
        },
        {
          "value": 6,
          "label": "Đồng ý"
        },
        {
          "value": 7,
          "label": "Hoàn toàn đồng ý"
        }
      ]
    },
    {
      "code": "H.7",
      "section": "H",
      "label": "Rối loạn tâm thần thường là hậu quả của cách nuôi dạy con không phù hợp hoặc môi trường gia đình không tốt.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Hoàn toàn không đồng ý"
        },
        {
          "value": 2,
          "label": "Không đồng ý"
        },
        {
          "value": 3,
          "label": "Hơi không đồng ý"
        },
        {
          "value": 4,
          "label": "Trung tính"
        },
        {
          "value": 5,
          "label": "Hơi đồng ý"
        },
        {
          "value": 6,
          "label": "Đồng ý"
        },
        {
          "value": 7,
          "label": "Hoàn toàn đồng ý"
        }
      ]
    },
    {
      "code": "H.8",
      "section": "H",
      "label": "Tình trạng của người có rối loạn tâm thần sẽ không khá lên.",
      "kind": "single",
      "options": [
        {
          "value": 1,
          "label": "Hoàn toàn không đồng ý"
        },
        {
          "value": 2,
          "label": "Không đồng ý"
        },
        {
          "value": 3,
          "label": "Hơi không đồng ý"
        },
        {
          "value": 4,
          "label": "Trung tính"
        },
        {
          "value": 5,
          "label": "Hơi đồng ý"
        },
        {
          "value": 6,
          "label": "Đồng ý"
        },
        {
          "value": 7,
          "label": "Hoàn toàn đồng ý"
        }
      ]
    },
    {
      "code": "I.1",
      "section": "I",
      "label": "Nhận ra khi cảm xúc của mình thay đổi theo hướng khó chịu, như buồn, lo lắng hoặc dễ cáu hơn.",
      "kind": "single",
      "options": [
        {
          "value": "1",
          "label": "Em chưa biết cách"
        },
        {
          "value": "2",
          "label": "Thực hiện được một phần"
        },
        {
          "value": "3",
          "label": "Thực hiện được nhưng còn lúng túng"
        },
        {
          "value": "4",
          "label": "Thực hiện được mỗi khi cần"
        },
        {
          "value": "K",
          "label": "Em chưa rõ"
        }
      ]
    },
    {
      "code": "I.2",
      "section": "I",
      "label": "Xác định điều đang khiến mình căng thẳng hoặc khó chịu.",
      "kind": "single",
      "options": [
        {
          "value": "1",
          "label": "Em chưa biết cách"
        },
        {
          "value": "2",
          "label": "Thực hiện được một phần"
        },
        {
          "value": "3",
          "label": "Thực hiện được nhưng còn lúng túng"
        },
        {
          "value": "4",
          "label": "Thực hiện được mỗi khi cần"
        },
        {
          "value": "K",
          "label": "Em chưa rõ"
        }
      ]
    },
    {
      "code": "I.3",
      "section": "I",
      "label": "Nhận ra khi khó khăn về tinh thần bắt đầu ảnh hưởng đến việc học hoặc sinh hoạt của mình.",
      "kind": "single",
      "options": [
        {
          "value": "1",
          "label": "Em chưa biết cách"
        },
        {
          "value": "2",
          "label": "Thực hiện được một phần"
        },
        {
          "value": "3",
          "label": "Thực hiện được nhưng còn lúng túng"
        },
        {
          "value": "4",
          "label": "Thực hiện được mỗi khi cần"
        },
        {
          "value": "K",
          "label": "Em chưa rõ"
        }
      ]
    },
    {
      "code": "I.4",
      "section": "I",
      "label": "Chọn một việc có thể làm thường xuyên để giữ tinh thần khỏe mạnh, kể cả khi mình không gặp khó khăn.",
      "kind": "single",
      "options": [
        {
          "value": "1",
          "label": "Em chưa biết cách"
        },
        {
          "value": "2",
          "label": "Thực hiện được một phần"
        },
        {
          "value": "3",
          "label": "Thực hiện được nhưng còn lúng túng"
        },
        {
          "value": "4",
          "label": "Thực hiện được mỗi khi cần"
        },
        {
          "value": "K",
          "label": "Em chưa rõ"
        }
      ]
    },
    {
      "code": "I.5",
      "section": "I",
      "label": "Chọn một cách giúp mình bình tĩnh mà không gây hại cho bản thân hoặc người khác.",
      "kind": "single",
      "options": [
        {
          "value": "1",
          "label": "Em chưa biết cách"
        },
        {
          "value": "2",
          "label": "Thực hiện được một phần"
        },
        {
          "value": "3",
          "label": "Thực hiện được nhưng còn lúng túng"
        },
        {
          "value": "4",
          "label": "Thực hiện được mỗi khi cần"
        },
        {
          "value": "K",
          "label": "Em chưa rõ"
        }
      ]
    },
    {
      "code": "I.6",
      "section": "I",
      "label": "Lập một kế hoạch đơn giản cho việc chăm sóc tinh thần của mình, trong đó xác định rõ sẽ làm gì và khi nào làm.",
      "kind": "single",
      "options": [
        {
          "value": "1",
          "label": "Em chưa biết cách"
        },
        {
          "value": "2",
          "label": "Thực hiện được một phần"
        },
        {
          "value": "3",
          "label": "Thực hiện được nhưng còn lúng túng"
        },
        {
          "value": "4",
          "label": "Thực hiện được mỗi khi cần"
        },
        {
          "value": "K",
          "label": "Em chưa rõ"
        }
      ]
    },
    {
      "code": "I.7",
      "section": "I",
      "label": "Thực hiện việc chăm sóc tinh thần mình đã dự định.",
      "kind": "single",
      "options": [
        {
          "value": "1",
          "label": "Em chưa biết cách"
        },
        {
          "value": "2",
          "label": "Thực hiện được một phần"
        },
        {
          "value": "3",
          "label": "Thực hiện được nhưng còn lúng túng"
        },
        {
          "value": "4",
          "label": "Thực hiện được mỗi khi cần"
        },
        {
          "value": "K",
          "label": "Em chưa rõ"
        }
      ]
    },
    {
      "code": "I.8",
      "section": "I",
      "label": "Nhận xét cách chăm sóc đã thử có giúp ích cho mình hay không.",
      "kind": "single",
      "options": [
        {
          "value": "1",
          "label": "Em chưa biết cách"
        },
        {
          "value": "2",
          "label": "Thực hiện được một phần"
        },
        {
          "value": "3",
          "label": "Thực hiện được nhưng còn lúng túng"
        },
        {
          "value": "4",
          "label": "Thực hiện được mỗi khi cần"
        },
        {
          "value": "K",
          "label": "Em chưa rõ"
        }
      ]
    },
    {
      "code": "I.9",
      "section": "I",
      "label": "Chọn bước tiếp theo khi cách chăm sóc đã thử chưa giúp ích.",
      "kind": "single",
      "options": [
        {
          "value": "1",
          "label": "Em chưa biết cách"
        },
        {
          "value": "2",
          "label": "Thực hiện được một phần"
        },
        {
          "value": "3",
          "label": "Thực hiện được nhưng còn lúng túng"
        },
        {
          "value": "4",
          "label": "Thực hiện được mỗi khi cần"
        },
        {
          "value": "K",
          "label": "Em chưa rõ"
        }
      ]
    },
    {
      "code": "I.10",
      "section": "I",
      "label": "Chọn một người đáng tin cậy để nhờ giúp đỡ khi gặp khó khăn về tinh thần.",
      "kind": "single",
      "options": [
        {
          "value": "1",
          "label": "Em chưa biết cách"
        },
        {
          "value": "2",
          "label": "Thực hiện được một phần"
        },
        {
          "value": "3",
          "label": "Thực hiện được nhưng còn lúng túng"
        },
        {
          "value": "4",
          "label": "Thực hiện được mỗi khi cần"
        },
        {
          "value": "K",
          "label": "Em chưa rõ"
        }
      ]
    },
    {
      "code": "I.11",
      "section": "I",
      "label": "Nói cho người hỗ trợ hiểu mình đang gặp khó khăn gì.",
      "kind": "single",
      "options": [
        {
          "value": "1",
          "label": "Em chưa biết cách"
        },
        {
          "value": "2",
          "label": "Thực hiện được một phần"
        },
        {
          "value": "3",
          "label": "Thực hiện được nhưng còn lúng túng"
        },
        {
          "value": "4",
          "label": "Thực hiện được mỗi khi cần"
        },
        {
          "value": "K",
          "label": "Em chưa rõ"
        }
      ]
    },
    {
      "code": "I.12",
      "section": "I",
      "label": "Xác định bước đầu tiên để tiếp cận người hỗ trợ chuyên môn về sức khỏe tâm thần, kể cả nhờ người lớn kết nối.",
      "kind": "single",
      "options": [
        {
          "value": "1",
          "label": "Em chưa biết cách"
        },
        {
          "value": "2",
          "label": "Thực hiện được một phần"
        },
        {
          "value": "3",
          "label": "Thực hiện được nhưng còn lúng túng"
        },
        {
          "value": "4",
          "label": "Thực hiện được mỗi khi cần"
        },
        {
          "value": "K",
          "label": "Em chưa rõ"
        }
      ]
    },
    {
      "code": "I.i2SelfCareActions",
      "section": "I",
      "label": "Trong 6 tháng qua, em đã làm những việc gì để giữ tinh thần khỏe mạnh hoặc giúp mình cảm thấy dễ chịu hơn khi buồn, lo lắng hay căng thẳng? Em có thể kể một ví dụ cụ thể.",
      "kind": "text"
    },
    {
      "code": "I.i3HelpSeekingExperience",
      "section": "I",
      "label": "Trong 6 tháng qua, khi gặp khó khăn về tinh thần, em đã tìm đến ai hoặc nguồn hỗ trợ nào để được giúp đỡ? Em đã liên hệ hoặc chia sẻ bằng cách nào?",
      "kind": "text"
    },
    {
      "code": "J.1",
      "section": "J",
      "label": "Khi muốn làm một việc giúp tinh thần mình tốt hơn, em gặp khó khăn gì?",
      "kind": "text"
    },
    {
      "code": "J.2",
      "section": "J",
      "label": "Điều gì khiến em ngần ngại chia sẻ hoặc khó tìm được người giúp đỡ khi gặp khó khăn về tinh thần?",
      "kind": "text"
    },
    {
      "code": "J.3",
      "section": "J",
      "label": "Em muốn được hướng dẫn thêm điều gì để chăm sóc tinh thần tốt hơn? Điều nào cần nhất với em?",
      "kind": "text"
    },
    {
      "code": "J.4",
      "section": "J",
      "label": "Em mong gia đình hoặc nhà trường hỗ trợ điều gì? Em muốn nhận sự hỗ trợ đó bằng cách nào?",
      "kind": "text"
    }
  ]
};
