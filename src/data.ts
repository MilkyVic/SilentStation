export interface HandbookSection {
  id: string;
  title: string;
  content: string;
  category: string;
  icon?: string;
}

export const HANDBOOK_DATA: HandbookSection[] = [
  // Cẩm nang chăm sóc sức khỏe tinh thần
  {
    id: 'mental-health-care',
    title: 'Chăm sóc sức khỏe tinh thần',
    category: 'Cẩm nang chăm sóc sức khỏe tinh thần',
    content: `
# Cẩm nang chăm sóc sức khỏe tinh thần

Sức khỏe tinh thần cũng quan trọng như sức khỏe thể chất. Dưới đây là những cách giúp bạn duy trì tâm trí khỏe mạnh:

### 1. Lắng nghe bản thân
Hãy dành thời gian mỗi ngày để tự hỏi: "Hôm nay mình cảm thấy thế nào?". Việc gọi tên cảm xúc giúp bạn hiểu rõ hơn về tình trạng của mình.

### 2. Thiết lập ranh giới lành mạnh
Biết cách nói "Không" với những yêu cầu quá tải. Bảo vệ thời gian nghỉ ngơi của bạn là bảo vệ sự cân bằng tinh thần.

### 3. Kết nối xã hội
Chia sẻ tâm sự với người thân, bạn bè hoặc chuyên gia tâm lý. Sự kết nối giúp giảm bớt cảm giác cô đơn và áp lực.
`,
    icon: 'Heart'
  },
  {
    id: 'stress-management',
    title: 'Quản lý căng thẳng',
    category: 'Cẩm nang chăm sóc sức khỏe tinh thần',
    content: '# Quản lý căng thẳng\n\nCăng thẳng là một phần của cuộc sống, nhưng quản lý nó là chìa khóa để hạnh phúc.',
    icon: 'Zap'
  },
  {
    id: 'self-love',
    title: 'Yêu thương bản thân',
    category: 'Cẩm nang chăm sóc sức khỏe tinh thần',
    content: '# Yêu thương bản thân\n\nHãy đối xử với bản thân như cách bạn đối xử với người bạn thân nhất.',
    icon: 'Heart'
  },

  // Cẩm nang xây dựng môi trường học đường thân thiện với sức khỏe tinh thần
  {
    id: 'school-environment',
    title: 'Môi trường học đường thân thiện',
    category: 'Cẩm nang xây dựng môi trường học đường thân thiện với sức khỏe tinh thần',
    content: `
# Xây dựng môi trường học đường thân thiện với sức khỏe tinh thần

Trường học không chỉ là nơi học kiến thức mà còn là nơi nuôi dưỡng tâm hồn.

### 1. Sự thấu hiểu từ giáo viên
Giáo viên cần được trang bị kiến thức về tâm lý học đường để nhận biết sớm các dấu hiệu bất ổn ở học sinh.

### 2. Phòng tham vấn tâm lý
Mỗi trường học nên có một không gian an toàn, riêng tư để học sinh có thể tìm đến khi gặp khó khăn.
`,
    icon: 'School'
  },
  {
    id: 'anti-bullying',
    title: 'Phòng chống bạo lực học đường',
    category: 'Cẩm nang xây dựng môi trường học đường thân thiện với sức khỏe tinh thần',
    content: '# Phòng chống bạo lực học đường\n\nXây dựng văn hóa tôn trọng và thấu hiểu.',
    icon: 'Info'
  },
  {
    id: 'student-clubs',
    title: 'Câu lạc bộ sinh viên',
    category: 'Cẩm nang xây dựng môi trường học đường thân thiện với sức khỏe tinh thần',
    content: '# Câu lạc bộ sinh viên\n\nNơi kết nối đam mê và phát triển kỹ năng.',
    icon: 'Users'
  }
];
