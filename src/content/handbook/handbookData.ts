export interface HandbookSection {
  id: string;
  title: string;
  content: string;
  category: string;
  icon?: string;
}

export const HANDBOOK_DATA: HandbookSection[] = [
  {
    id: 'loi-mo-dau',
    title: 'Lời mở đầu',
    category: 'Cẩm nang chăm sóc sức khoẻ tinh thần',
    icon: 'MessageSquare',
    content: `
# Cẩm Nang Sức Khỏe Tinh Thần: Trạm Sạc Cảm Xúc Tuổi THPT

**Chào bạn, người đang bước vào khoảng thời gian rực rỡ nhất!**

Tuổi cấp 3 (15 - 18 tuổi) là những năm tháng rực rỡ, thanh xuân nhất, nhưng cũng là lúc chúng ta phải đối mặt với vô vàn những áp lực không tên. Từ chuyện bài vở, thi cử, kỳ vọng của gia đình, cho đến những rắc rối tuổi ẩm ương hay cảm thấy mình thật nhỏ bé giữa thế giới mạng xã hội rộng lớn.

![Sức khỏe tâm thần là gì?](/assets/Hình%201.png)

Được thiết kế để trở thành một người bạn đồng hành bí mật, bất cứ khi nào bạn cảm thấy mệt mỏi, bối rối hay dường như cạn kiệt năng lượng, hãy mở cuốn cẩm nang này ra. Đây sẽ là "trạm sạc" giúp bạn thấu hiểu những "chuyển động" bên trong mình, từ đó tìm lại sự cân bằng và bước tiếp thật vững vàng!
`
  },
  {
    id: 'chuyen-tuoi-moi-lon',
    title: 'Chuyện tuổi mới lớn',
    category: 'Cẩm nang chăm sóc sức khoẻ tinh thần',
    icon: 'Heart',
    content: `
# Chuyện Tuổi Mới Lớn: Hiểu "Chuyển Động" Bên Trong Mình

Bước vào trường THPT, bạn có nhận thấy cơ thể, suy nghĩ và cả cảm xúc của mình đang thay đổi một cách chóng mặt không? Đừng lo lắng, bởi giai đoạn này quá trình phát triển tâm sinh lý diễn ra rất mạnh mẽ. Hãy cùng "bắt mạch" những thay đổi đó nhé:

### Khám phá "Cái tôi" đang lớn

![Khám phá cái tôi đang lớn](/assets/Hình%202.png)

Giai đoạn này, quá trình [tự ý thức](#tooltip:Quá_trình_cá_nhân_tự_nhận_thức_về_khả_năng,_ngoại_hình_và_vị_trí_của_mình,_đi_kèm_với_nhu_cầu_tự_đánh_giá_và_mong_muốn_tự_khẳng_định_bản_thân) đang bùng nổ mạnh mẽ. Bạn để ý nhiều hơn đến ngoại hình, trăn trở về vị trí của mình trong tập thể và khao khát chứng tỏ sự độc lập. Vì quá nhạy cảm với đánh giá của người khác, bạn rất dễ "cường điệu hóa" bản thân: lúc thì tự tin thái quá, lúc lại thu mình tự ti chỉ vì một lời chê bai nhỏ.

> 👉 **Mách nhỏ với bạn:** Hãy cứ bình tĩnh! Việc "cái tôi" đôi lúc bấp bênh là điều hoàn toàn bình thường trên hành trình trưởng thành.

### Tình bạn "sống chết có nhau"

![Best friend forever](/assets/Hình%203.png)

Lên cấp 3, nhu cầu kết bạn của bạn chuyển từ "số lượng" sang "chất lượng" với đòi hỏi rất cao về sự chân thành và tin tưởng tuyệt đối. Vì cảm xúc lứa tuổi này rất mãnh liệt, bạn thường hay "lý tưởng hóa" tình bạn, dẫn đến việc rất dễ bị tổn thương sâu sắc chỉ bởi một xích mích nhỏ. Tuy nhiên, bù lại, những tình bạn chân chính vượt qua được thử thách ở lứa tuổi này thường vô cùng gắn bó và có thể kéo dài đến suốt cuộc đời.

### Những rung động "cộp mác" tuổi học trò

![Ngại hết cả capy - I'm a chill guy](/assets/Hình%205.png)

Những rung động lôi cuốn đầu đời thường đến rất vô tư, trong trẻo và nảy sinh từ chính sự đồng điệu hay cảm phục lẫn nhau. Tình cảm tuổi học trò thường rất trong trắng, tươi sáng, hồn nhiên và chân thành. Thay vì mạnh dạn bộc lộ, bạn thường có xu hướng cất giấu những cảm xúc e thẹn ấy làm "bí mật" của riêng mình.

> 👉 **Mách nhỏ cho bạn:** Tình cảm này có thể là động lực tuyệt vời để cả hai cùng hoàn thiện bản thân nếu bạn biết cách cân bằng. Đừng để sự xao xuyến lấn át khiến bạn mất tập trung hay xao nhãng học hành. Hãy giữ gìn những rung động ấy thật trong sáng và biến chúng thành "trạm sạc" năng lượng tích cực để hoàn thiện bản thân mỗi ngày!

### Áp lực tương lai và "Thế giới ảo"

![Áp lực tương lai](/assets/Hình%206.png)
tuổi THPT là giai đoạn bạn liên tục trăn trở với những câu hỏi lớn: *"Mình là ai?", "Sẽ làm nghề gì?", "Nên thi trường nào?"*. Nhu cầu định hướng tương lai này vừa là động lực thôi thúc bạn nỗ lực học tập, nhưng cũng vô tình tạo ra áp lực lớn khi các quyết định của bạn đang bị chi phối bởi quá nhiều yếu tố từ kỳ vọng của cha mẹ đến quan niệm xã hội. Không chỉ vậy, "thế giới ảo" cũng mang đến những gánh nặng vô hình. Hội chứng [FOMO](#tooltip:Hội_chứng_sợ_bị_bỏ_lỡ) khiến bạn dễ rơi vào bẫy so sánh, cảm thấy tự ti và thua kém khi liên tục chứng kiến những thành tích khủng hay cuộc sống lung linh của bạn bè. Nếu kéo dài, sự căng thẳng này có thể dẫn đến kiệt sức, làm tăng nguy cơ nghiện Internet và các chứng trầm cảm.

> Hãy luôn nhớ rằng: Mạng xã hội chỉ là một lát cắt hoàn hảo nhất mà người ta lựa chọn để khoe ra; bạn có một quỹ đạo phát triển của riêng mình và không việc gì phải chạy đua với "story" của bất kỳ ai!
`
  },
  {
    id: 'nhan-dien-may-den',
    title: 'Nhận diện 3 "đám mây đen"',
    category: 'Cẩm nang chăm sóc sức khoẻ tinh thần',
    icon: 'CloudRain',
    content: `
# Nhận Diện 3 "Đám Mây Đen" Trong Tâm Trí

Tuổi thanh xuân không phải lúc nào cũng ngập tràn ánh nắng. Sẽ có những ngày tâm trí bạn bị che khuất bởi những "đám mây đen" mang tên áp lực, lo âu hay nỗi buồn vô cớ. Việc gọi tên chính xác những cảm xúc này là bước đầu tiên để bạn dọn dẹp bầu trời tâm trí của mình.

### 🌩️ Stress khi điểm số và "cyberbullying" bủa vây

![Stress bủa vây](/assets/Hình%207.png)

**Nguồn gốc cơn áp lực:** Ở lứa tuổi này, bạn đang phải gánh trên vai rất nhiều kỳ vọng. Những áp lực này thường đến từ:
- Lịch học dày đặc cùng những kỳ thi chuyển cấp, thi đại học vô cùng căng thẳng.
- Sự kỳ vọng quá lớn và mong mỏi thành tích từ phía cha mẹ.
- Các mối quan hệ xã hội phức tạp. Đặc biệt, bạn có thể phải đối mặt với những xích mích, sự tẩy chay, hay các hành vi [Cyberbullying](#tooltip:Bắt_nạt_trực_tuyến_-_Hành_vi_cố_ý_sử_dụng_công_nghệ_số_để_nhắn_tin_quấy_rối,_đe_dọa,_bôi_nhọ_danh_dự_hoặc_làm_nhục_người_khác_một_cách_lặp_đi_lặp_lại).

**Dấu hiệu cơ thể báo động:** Stress không chỉ nằm trong suy nghĩ mà nó "tấn công" trực tiếp lên cơ thể bạn. Khi bị căng thẳng quá mức, bạn sẽ gặp phải các tình trạng:

![Cơ thể báo động](/assets/Hình%208.png)

- Thường xuyên cảm thấy nhức đầu, đau mỏi vai gáy.
- Cơ thể luôn trong trạng thái mệt mỏi, rã rời, không còn sức lực.
- Rất dễ mất bình tĩnh và cáu gắt vô cớ. Nếu bạn thấy mình hay nổi nóng hoặc thường xuyên cãi nhau với người lớn dù chỉ là những chuyện cực kỳ nhỏ nhặt, đó chính là lúc "trạm sạc" của bạn đang chớp nháy báo động đỏ!

### ⏱️ Rối loạn lo âu: Khi nỗi sợ bị "phóng đại"

![Rối loạn lo âu](/assets/Hình%209.png)

**Nhận diện "kẻ phóng đại":**
Cảm thấy lo lắng trước một kỳ thi là phản ứng tâm lý hoàn toàn bình thường. Tuyệt nhiên, nếu nỗi lo ấy vượt khỏi tầm kiểm soát và trở thành sự sợ hãi dai dẳng, đó có thể là [Rối loạn lo âu](#tooltip:Tình_trạng_lo_lắng,_sợ_hãi_quá_mức_và_dai_dẳng_về_những_viễn_cảnh_chưa_xảy_ra_trong_tương_lai,_khiến_cơ_thể_luôn_trong_trạng_thái_báo_động_giả). Tình trạng này xảy ra khi tâm trí bạn bị mắc kẹt ở tương lai, liên tục "tự tiên đoán" những viễn cảnh tồi tệ dựa trên trải nghiệm buồn trong quá khứ. Nó khiến bạn luôn bồn chồn, căng thẳng, cảnh giác cao độ và làm vắt kiệt mọi cảm xúc của bạn ở hiện tại.

**Cơ thể lên tiếng:** Nỗi sợ hãi phóng đại này khiến cơ thể bạn luôn trong trạng thái "báo động giả". Tâm lý bất ổn sẽ lập tức chuyển hóa thành các triệu chứng thể chất như:

![Cơ thể lên tiếng](/assets/Hình%2010.png)

- Nhịp tim đập nhanh, đánh trống ngực, bồn chồn đứng ngồi không yên.
- Thường xuyên bị căng cơ, chuột rút hoặc đau nhức dạ dày do hệ thần kinh bị kích thích.
- Nhức đầu dai dẳng và mệt mỏi cạn kiệt sức lực.
- Khi cả thể chất lẫn tinh thần đều bị vắt kiệt, hệ quả tất yếu là bạn sẽ dần sống thu mình, trở nên rụt rè, phụ thuộc và né tránh mọi tương tác xã hội.

### 🌧️ Trầm cảm tuổi học đường: Không chỉ đơn giản là "nỗi buồn"

![Trầm cảm](/assets/Hình%2011.png)

**Nhận diện "hố đen" cảm xúc:**
Ai cũng có những ngày tồi tệ, nhưng nếu cảm giác buồn bã, trống rỗng cứ bám riết lấy bạn một cách dai dẳng, đó có thể là [Trầm cảm](#tooltip:Rối_loạn_sức_khỏe_tâm_thần_đặc_trưng_bởi_cảm_giác_buồn_bã,_trống_rỗng_kéo_dài,_cạn_kiệt_năng_lượng_và_mất_hứng_thú_hoàn_toàn_với_những_hoạt_động_từng_yêu_thích). Điểm đặc trưng nhất của "hố đen" này là nó khiến bạn gần như "đóng băng" cảm xúc, đánh mất hoàn toàn niềm vui với những sở thích cũ, làm đình trệ cả việc học tập lẫn sinh hoạt thường ngày.

**Biểu hiện cần lưu ý:** Tình trạng này làm "sập nguồn" hệ thống của bạn qua các dấu hiệu cảnh báo:

![Biểu hiện trầm cảm](/assets/Hình%2012.png)
- **Cạn kiệt năng lượng:** Luôn cảm thấy mệt rã rời, không còn chút sức lực nào để làm những việc đơn giản nhất.
- **Rối loạn ăn - ngủ:** Mất ngủ triền miên hoặc ngủ li bì; chán ăn hoặc ăn uống mất kiểm soát dẫn đến thay đổi cân nặng.
- **Tự cô lập:** Có xu hướng thu mình lại, xa lánh gia đình, bạn bè và chỉ muốn ở một mình.
- **Suy nghĩ tiêu cực:** Trí nhớ giảm sút, khó tập trung, luôn thấy bản thân vô giá trị và đầy tội lỗi. Ở mức độ nghiêm trọng, nó có thể đẩy bạn đến việc lạm dụng Internet, có các hành vi liều lĩnh, hay thậm chí là lặp đi lặp lại suy nghĩ muốn từ bỏ cuộc sống.

> 💡 **Lưu ý từ Trạm An:** Mọi "đám mây đen" đều có thể tan đi nếu bạn nhận diện đúng và dũng cảm tìm kiếm sự giúp đỡ kịp thời. Hãy cùng kéo xuống Phần kế tiếp để mở khóa những "bí kíp" F5 lại bản thân nhé!
`
  },
  {
    id: 'bi-kip-f5',
    title: 'Bí kíp "F5" bản thân',
    category: 'Cẩm nang chăm sóc sức khoẻ tinh thần',
    icon: 'Zap',
    content: `
# Bí Kíp "F5" Bản Thân - Chiến Thắng Áp Lực

Khi những "đám mây đen" của sự căng thẳng, lo âu hay chán nản kéo đến, đừng vội đầu hàng! Dưới đây là những công cụ đã được khoa học chứng minh giúp bạn "hack" lại não bộ và lấy lại sự cân bằng.

### 🔴 "Nút Dừng Khẩn Cấp" (Sơ cứu cảm xúc tại chỗ)
Khi bạn cảm thấy hoảng loạn tột độ (ví dụ: tim đập thình thịch trước giờ thi, hoặc quá căng thẳng vì mạng xã hội), hãy áp dụng ngay các thủ thuật "cắt đuôi" cơn hoảng loạn này:

**🧊 [Chiến thuật Nước lạnh - TIPP](#tooltip:Bộ_4_kỹ_năng_sơ_cứu_cảm_xúc_cấp_tốc_trong_tâm_lý_học_bao_gồm:_Thay_đổi_nhiệt_độ,_Vận_động_mạnh,_Thở_nhịp_nhàng_và_Thư_giãn_cơ_bắp)**:
Hãy hít một hơi thật sâu và úp mặt vào một chậu nước lạnh (hoặc áp túi chườm/khăn lạnh lên vùng mắt và má) trong khoảng 15-30 giây. Hành động này sẽ "đánh lừa" não bộ kích hoạt **[phản xạ lặn](#tooltip:Mammalian_dive_reflex_-_Phản_xạ_tự_nhiên_của_cơ_thể_khi_tiếp_xúc_với_nước_lạnh,_giúp_làm_chậm_nhịp_tim_và_thư_giãn_thần_kinh_ngay_lập_tức)**, giúp làm dịu nhanh chóng hệ thần kinh đang bị kích động quá mức.

![Chiến thuật Nước lạnh - TIPP](/assets/Chiến%20thuật%20Nước%20lạnh%20-%20TIPP.png)

**✋ Quy tắc 5-4-3-2-1 - Kéo bản thân về thực tại:**
Hãy áp dụng kỹ thuật **[Grounding](#tooltip:Kỹ_thuật_tiếp_đất,_giúp_đưa_tâm_trí_thoát_khỏi_những_viễn_cảnh_hoảng_loạn_do_não_bộ_tự_vẽ_ra_để_quay_về_với_không_gian_hiện_tại)** bằng cách đếm và gọi tên lần lượt:
- 👀 5 thứ bạn có thể nhìn thấy.
- 🖐️ 4 thứ bạn có thể chạm vào.
- 👂 3 âm thanh bạn đang nghe thấy.
- 👃 2 mùi hương bạn có thể ngửi được.
- 👅 1 thứ bạn có thể nếm được.

![Quy tắc 5-4-3-2-1](/assets/Quy%20tắc%205-4-3-2-1%20-%20Kéo%20bản%20thân%20về%20thực%20tại.png)

**🌬️ Nhịp thở 4-7-8 (Liều thuốc an thần tự nhiên):**
- Hít vào từ từ qua mũi trong **4 giây**.
- Nín thở, giữ hơi lại trong **7 giây**.
- Thở ra mạnh dần qua miệng trong **8 giây** (tạo ra tiếng "whoosh").
*(Lặp lại vòng lặp này 3-4 lần, nhịp thở này hoạt động như một công cụ "massage" xoa dịu hệ thần kinh cực kỳ hiệu quả.)*

![Nhịp thở 4-7-8](/assets/Nhịp%20thở%204-7-8%20(Liều%20thuốc%20an%20thần%20tự%20nhiên).png)

### 🧩 "Bắt Lỗi" Suy Nghĩ: Ngừng phóng đại nỗi sợ
Rất nhiều áp lực chúng ta phải gánh chịu không đến từ thực tế, mà đến từ việc não bộ đang tự "thảm họa hóa", tưởng tượng ra những viễn cảnh tồi tệ nhất (Ví dụ: "Mình làm bài kiểm tra tệ quá, mình sẽ trượt đại học và cuộc đời thế là chấm hết!"). Để thoát khỏi cái bẫy tâm lý này, hãy áp dụng ngay **[Mô hình 3C](#tooltip:Kỹ_thuật_tái_cấu_trúc_nhận_thức_giúp_ngừng_thảm_kịch_hóa_vấn_đề_qua_3_bước:_Bắt_lấy_suy_nghĩ_tiêu_cực_-_Kiểm_tra_tính_thực_tế_-_Thay_đổi_thành_suy_nghĩ_tích_cực_hơn)**:

![Bắt Lỗi Suy Nghĩ](/assets/Bắt%20Lỗi_%20Suy%20Nghĩ_%20Ngừng%20phóng%20đại%20nỗi%20sợ.png)

1. **Bước 1: Bắt lấy nó (Catch it)** - Nhận diện ngay khoảnh khắc đầu óc bạn bắt đầu xuất hiện những luồng suy nghĩ tiêu cực, tự ti hoặc đang tự đổ lỗi cho bản thân.
2. **Bước 2: Kiểm tra nó (Check it)** - Đừng vội tin vào những suy nghĩ đáng sợ đó. Hãy đóng vai một "thám tử" và tự chất vấn tâm trí mình: "Viễn cảnh tồi tệ nhất có thể xảy ra là gì? Viễn cảnh tốt nhất là gì? Và khả năng thực tế nhất dễ xảy ra là gì?".
3. **Bước 3: Thay đổi nó (Change it)** - Chủ động thay thế suy nghĩ thảm họa bằng một góc nhìn thực tế, công bằng và bao dung hơn với chính mình. (Ví dụ: "Điểm kém lần này đúng là buồn thật, nhưng nó không quyết định cả cuộc đời mình. Mình sẽ cố gắng ôn tập để gỡ điểm ở bài sau").

### 🔋 Sạc Lại Động Lực: Vượt qua sự chán nản, mệt mỏi
Khi bị bủa vây bởi căng thẳng hoặc trầm cảm kéo dài, cơ thể bạn sẽ tự động bật chế độ "sập nguồn" và chẳng muốn làm bất cứ việc gì cả. Nhưng có một bí mật tâm lý bạn cần biết:
> **"Hành động tạo ra động lực, chứ không phải đợi có động lực mới hành động."**

- 🎁 **Chiến thuật "Tự thưởng" (Hệ thống phần thưởng tự thân):** Hãy chia nhỏ việc học thành các mục tiêu ngắn hạn và tự gắn cho nó một phần thưởng cụ thể. Việc biết trước có phần thưởng thiết thực đang chờ đợi ở vạch đích sẽ giúp bạn đánh lừa bộ não, thay thế dopamine ảo từ mạng xã hội bằng dopamine thực tế.
![Chiến thuật Tự thưởng](/assets/Chiến%20thuật%20_Tự%20thưởng_%20(Hệ%20thống%20phần%20thưởng%20tự%20thân).png)

- ⚖️ **Quy tắc "Thành tựu & Niềm vui":** Hãy thiết kế thời gian biểu của bạn đan xen nhịp nhàng giữa những việc tạo ra **Sự thành tựu** (như giải xong bài tập Toán) và những việc mang lại **Niềm vui** (như nghe nhạc, trò chuyện).
![Quy tắc Thành tựu và Niềm vui](/assets/QUY%20TẮC%20_THÀNH%20TỰU%20&%20NIỀM%20VUI_%20(Chiến%20thuật%20_Kẹp%20Thịt_).png)

- 📈 **Chiến thuật "Đi từ dễ đến khó":** Hãy ưu tiên "xử lý" những nhiệm vụ dễ nhằn nhất trước để tạo "đà" tâm lý vô cùng vững chắc.
![Chiến thuật đi từ dễ đến khó](/assets/CHIẾN%20THUẬT%20_ĐI%20TỪ%20DỄ%20ĐẾN%20KHÓ_%20(Tạo%20đà%20tâm%20lý).png)

### 🏃 Yêu Thương Cơ Thể: Chìa khóa vàng cho tâm trạng
![Tam giác sức khỏe](/assets/Tam%20giác%20sức%20khỏe.png)
- 🏃‍♂️ **Vận động đánh bay áp lực:** Các hoạt động thể chất giúp giải phóng **[Endorphin](#tooltip:Hormone_hạnh_phúc_tự_nhiên)**, "đốt cháy" hormone áp lực.
- 🥗 **Thực phẩm "chữa lành" não bộ:** Nhâm nhi Socola đen ([Serotonin](#tooltip:Hormone_giúp_điều_chỉnh_tâm_trạng,_mang_lại_cảm_giác_thư_giãn)), rau xanh, các loại hạt và Omega-3.
- 🛌 **Sức mạnh "tẩy rửa" của giấc ngủ:** Hãy cố gắng thiết lập thói quen đi ngủ đúng giờ. Giấc ngủ giúp não bộ "làm sạch" những ký ức căng thẳng và sạc đầy lại năng lượng.
`
  },
  {
    id: 'len-tieng-khi-can',
    title: 'Lên tiếng khi cần',
    category: 'Cẩm nang chăm sóc sức khoẻ tinh thần',
    icon: 'Mic',
    content: `
# Lên Tiếng Khi Cần - Bạn Không Đơn Độc!

Khi đối mặt với [áp lực học tập](#tooltip:Academic_stress_-_Trạng_thái_căng_thẳng_quá_mức_do_khối_lượng_bài_vở,_kỳ_vọng_thành_tích_và_định_hướng_thi_cử) hoặc những "đám mây đen" tâm lý, việc tìm kiếm sự trợ giúp không phải là biểu hiện của sự yếu đuối. Ngược lại, chủ động kết nối với mạng lưới hỗ trợ xung quanh (Gia đình - Nhà trường - Xã hội) là một chiến lược ứng phó tích cực, giúp bạn nhanh chóng khôi phục sự cân bằng và bảo vệ [sức khỏe tâm thần](#tooltip:Trạng_thái_ổn_định_về_mặt_tâm_lý,_nơi_bạn_nhận_thức_được_giá_trị_bản_thân,_có_thể_đối_phó_với_các_căng_thẳng_thông_thường_và_duy_trì_việc_học_tập_hiệu_quả) của chính mình.
`
  },
  {
    id: 'goc-go-roi',
    title: 'Góc gỡ rối (Q&A)',
    category: 'Cẩm nang chăm sóc sức khoẻ tinh thần',
    icon: 'HelpCircle',
    content: `
# Góc Gỡ Rối (Q&A)

**Hỏi: Làm sao để cai nghiện lướt TikTok khi đang ôn thi? Mình cứ cầm điện thoại lên là lướt mất mấy tiếng đồng hồ không dứt ra được!**
> **Đáp:** Đừng quá tự trách mình, thuật toán của TikTok vốn được thiết kế để liên tục kích thích não bộ tiết ra dopamine. Để bứt phá, bạn có thể:
> - **Tạo lực cản vật lý:** Xóa ứng dụng, đổi mật khẩu khó nhớ, hoặc để điện thoại ở phòng khác khi học.
> - **Chiến thuật "Khởi đầu 5 phút" & Pomodoro:** Cam kết học 25 phút rồi nghỉ 5 phút (tuyệt đối không lướt mạng xã hội lúc nghỉ).
> - **Thiết lập phần thưởng tự thân:** Đặt mục tiêu ngắn hạn và tự thưởng (xem phim, ăn ngon) để lấy dopamine thực tế.

**Hỏi: Em phải làm gì khi bị bạn bè nói xấu, bôi nhọ trên Facebook? Em cảm thấy rất tổn thương và không thể tập trung học được.**
> **Đáp:** Bị bắt nạt trực tuyến là trải nghiệm tồi tệ. Tuyệt đối không tức giận đáp trả trên mạng. Hãy:
> - **Lưu trữ bằng chứng:** Chụp màn hình, lưu link.
> - **Kích hoạt "khiên bảo vệ":** Chặn (Block), Hạn chế (Restrict) hoặc Báo cáo (Report) tài khoản ác ý.
> - **Tuyệt đối không chịu đựng một mình:** Chia sẻ với bạn thân, cha mẹ, hoặc giáo viên. Hành vi vu khống hoàn toàn có thể bị xử lý.
> - **Tạm thời "Detox" mạng xã hội:** Ngừng đọc bình luận tiêu cực và dành thời gian chăm sóc sức khỏe tinh thần.
`
  },
  {
    id: 'danh-ba-lien-he',
    title: 'Danh bạ liên hệ',
    category: 'Cẩm nang chăm sóc sức khoẻ tinh thần',
    icon: 'PhoneCall',
    content: `
# Danh bạ liên hệ (Hãy Lưu Lại Ngay!)

Khi bầu trời tâm trí bạn kéo đến những "đám mây đen" lớn và bạn cần một chiếc phao cứu sinh, đừng ngần ngại gọi đến các số sau. Tìm kiếm sự giúp đỡ là biểu hiện của sự dũng cảm!

#### 🏫 Hỗ trợ tại trường học và địa phương (TP. Đà Nẵng)
- **Phòng Tham vấn tâm lý học đường của trường bạn** – Trạm SOS thân thuộc ngay tại trường học, cam kết bảo mật.
- **Bệnh viện Tâm thần Đà Nẵng** (193 Nguyễn Lương Bằng, Quận Liên Chiểu, TP. Đà Nẵng): Nơi có đội ngũ bác sĩ hỗ trợ thăm khám chuyên sâu.

#### 📞 Các đường dây nóng hỗ trợ Quốc Gia (Miễn phí và Trực tuyến)
- **Tổng đài Quốc gia bảo vệ Trẻ em: 111** (Hoạt động 24/7, miễn phí). Hỗ trợ về bạo lực học đường, xâm hại, bắt nạt trực tuyến...
- **Đường dây nóng Ngày Mai: 096 306 1414** (13:00 - 20:30 từ Thứ Tư đến Chủ Nhật). Dự án phi lợi nhuận cung cấp sơ cứu tâm lý.
- **BlueBlue Hotline: 1900 9204 (bấm phím 3)**. Kênh tư vấn tâm lý miễn phí dành cho thanh thiếu niên.
- **Cấp cứu Trầm cảm / Cấp cứu Y tế: 1900 1267** hoặc **115**. Cấp cứu khẩn cấp 24/7 khi có nguy cơ đe dọa sự an toàn của bản thân.
`
  },
  {
    id: 'goc-dong-hanh',
    title: 'Góc đồng hành: Dành riêng cho cha mẹ',
    category: 'Cẩm nang chăm sóc sức khoẻ tinh thần',
    icon: 'Users',
    content: `
Làm cha mẹ của một cô cậu học trò cấp 3 chưa bao giờ là điều dễ dàng. Đôi khi ba mẹ sẽ sốc khi đứa con ngoan ngoãn bỗng trở nên bướng bỉnh. Đừng quá lo lắng, con đang trải qua quá trình chuyển giao tâm sinh lý rất mạnh mẽ. Hãy cùng "Trạm An" giải mã và đồng hành cùng con!

<details>
<summary>1. Tuổi "Ẩm ương": Con đang nghĩ gì?</summary>

<div className="px-6 pb-6 text-gray-600 border-t border-brand-primary/5 pt-4 leading-relaxed">

Đặc trưng lớn nhất của lứa tuổi này chính là **"cảm giác mình là người lớn"**. Con khao khát được độc lập, tự khẳng định mình và mong mỏi được ba mẹ đối xử bình đẳng.

Nếu ba mẹ vẫn giữ cách giám sát gắt gao như lúc nhỏ, con rất dễ nảy sinh tâm lý chống đối công khai (cãi lại) hoặc ngấm ngầm (né tránh). Cộng thêm khoảng cách thế hệ 18-20 năm, những xung đột nhỏ trong gia đình là điều hoàn toàn bình thường và có thể giải quyết được bằng sự thấu hiểu.

</div>

</details>

<details>
<summary>2. Ba kiểu làm cha mẹ: Đâu là lựa chọn tốt nhất?</summary>

<div className="px-6 pb-6 text-gray-600 border-t border-brand-primary/5 pt-4 leading-relaxed">

Theo các nghiên cứu tâm lý học, cách chúng ta giáo dục sẽ ảnh hưởng trực tiếp đến hành vi của trẻ:

- ❌ **Kiểu 1: Cha mẹ độc đoán (Áp đặt, khắt khe)**
  Là kiểu cha mẹ luôn khống chế và bắt con phải làm theo ý mình.
  **Hậu quả:** Cách giáo dục này thường khiến trẻ trở nên thụ động, chống đối ngầm, dễ mang tâm lý lo âu, bất an và thiếu hụt các kỹ năng giao tiếp xã hội.

- ❌ **Kiểu 2: Cha mẹ dễ dãi (Thờ ơ hoặc nuông chiều)**
  Là kiểu cha mẹ bỏ mặc, ít quan tâm hoặc ngược lại là quá nuông chiều, đáp ứng mọi yêu cầu của con mà không đặt ra giới hạn nào.
  **Hậu quả:** Trẻ lớn lên dễ trở nên ích kỷ, kém cỏi trong ứng xử, thiếu tính tự chủ và không biết cách độc lập giải quyết vấn đề.

- ✅ **Kiểu 3: Cha mẹ quyền uy (Khuyên dùng)**
  Đây là mẫu cha mẹ tuyệt vời nhất! Ba mẹ khuyến khích con cái độc lập nhưng **vẫn thiết lập những giới hạn rõ ràng**. Ba mẹ luôn sẵn sàng lắng nghe, trao đổi thoải mái và bày tỏ tình cảm với con.
  **Kết quả:** Trẻ được nuôi dạy theo cách này thường rất tự tin, có kỹ năng giao tiếp tốt, tin cậy gia đình và ít gặp phải các hành vi tiêu cực hay vấn đề tâm lý.

</div>

</details>

<details>
<summary>💡 BÍ KÍP BỎ TÚI CHO BA MẸ</summary>

<div className="px-6 pb-6 text-gray-600 border-t border-brand-primary/5 pt-4 leading-relaxed">

Khi uốn nắn và giáo dục con, ba mẹ hãy nhớ quy tắc:

#### 🤝 Bộ đôi 2H: Đi từ thấu hiểu đến đồng hành

Để làm bạn được với con ở tuổi teen, ba mẹ cần bắt đầu từ việc điều chỉnh góc nhìn của chính mình:

![Ranh Giới Bọc Bằng Yêu Thương](/assets/Gemini_Generated_Image_ht8pemht8pemht8p.png)

- **H - Hiểu rõ (Thấu hiểu tâm lý):** Thay vì áp đặt lăng kính của người lớn, ba mẹ hãy thử đặt mình vào thế giới của con. Hiểu rằng sự "bướng bỉnh" hay khép kín đôi khi chỉ là cách con thể hiện khao khát được độc lập và mong mỏi được người lớn tôn trọng. Khi ba mẹ thực sự hiểu rõ những áp lực học tập và những rắc rối tuổi mới lớn mà con đang gánh vác, sự bực dọc sẽ nhường chỗ cho sự bao dung.
- **H - Hợp tác (Cùng con giải quyết):** Đừng làm thay con mọi việc (nuông chiều), cũng đừng ép con phải làm theo ý mình (độc đoán). Hãy xem con như một "người cộng sự" đang trong giai đoạn tập làm người trưởng thành. Khi có vấn đề phát sinh, ba mẹ hãy cùng con ngồi lại thảo luận, lắng nghe ý kiến của con và cùng nhau tìm ra giải pháp.


#### 💖 Bộ đôi 2N: Ranh giới của yêu thương

Nhiều ba mẹ nhầm tưởng thấu hiểu là phải chiều chuộng con vô điều kiện. Sự thật là con cái lớn lên rất cần những "cột mốc" để biết đâu là giới hạn an toàn:

- **N - Nghiêm khắc (Thiết lập quy tắc):** Yêu thương tự do không đồng nghĩa với sự dễ dãi. Ba mẹ cần cùng con thiết lập những "đường ranh giới" rõ ràng về kỷ luật, giờ giấc, cách ứng xử và trách nhiệm của bản thân. Sự nghiêm khắc ở đây không phải là đòn roi hay la mắng, mà là sự kiên định giữ vững các nguyên tắc đã thỏa thuận từ trước.
- **N - Ngọt dịu (Thấu cảm và chia sẻ):** Sự kiên định với luật lệ chỉ thực sự phát huy tác dụng khi được bao bọc trong tình yêu thương. Đó là một tông giọng nhẹ nhàng khi góp ý, là cái ôm ấm áp khi con thất bại, là sự kiên nhẫn không phán xét khi con lỡ mắc sai lầm. Sự ngọt dịu giúp con hiểu rằng: *"Dù ba mẹ có nghiêm khắc với hành vi của con, thì tình yêu ba mẹ dành cho con vẫn không bao giờ thay đổi."*

![Từ Đối Đầu Đến Đồng Hành](/assets/Gemini_Generated_Image_krs2c8krs2c8krs2.png)

</div>

</details>

<details>
<summary>3. Bắt tay cùng "Trạm SOS" (Phòng Tham vấn học đường)</summary>

<div className="px-6 pb-6 text-gray-600 border-t border-brand-primary/5 pt-4 leading-relaxed">

Mọi khó khăn của học sinh cần sự phối hợp nhịp nhàng từ cả ba môi trường: **Gia đình – Nhà trường – Cộng đồng**.

Ba mẹ đừng ngần ngại liên hệ với Phòng Tham vấn tâm lý của trường! Các chuyên viên tham vấn sẽ là chiếc cầu nối vững chắc, giúp gia đình và nhà trường cùng trợ giúp, giải quyết các vấn đề của con em mình một cách toàn diện nhất.

![Trạm An](/assets/Gemini_Generated_Image_ic7ypxic7ypxic7y.png)

</div>

</details>
`
  },
  {
    id: 'tai-lieu-tham-khao',
    title: 'Tài liệu tham khảo',
    category: 'Cẩm nang chăm sóc sức khoẻ tinh thần',
    icon: 'BookOpen',
    content: `
# Danh Mục Tài Liệu Tham Khảo

### I. Nền tảng Tâm lý học & Tham vấn học đường
1. American Psychiatric Association. (2022). *Diagnostic and statistical manual of mental disorders* (5th ed., text rev.).
2. Chẩn, H. V. (2023). *Bài giảng Thiết kế và quản trị phòng tham vấn học đường (Bài 1 & 2: Mô hình, phương pháp trợ giúp và can thiệp)* [PowerPoint slides]. Khoa Công tác xã hội, Trường Đại học Khoa học Xã hội và Nhân văn - ĐHQG-HCM.
3. Dean1665. (n.d.). *PSYRE - Ứng dụng tư vấn tâm lí học đường*. [Link](https://dean1665.vn/svs2023/y-te-cham-soc-suc-khoe-cong-nghe-lam-dep/psyre-ung-dung-tu-van-tam-li-hoc-duong-160.html)
4. Lee, J. A. B. (2001). *The empowerment approach to social work practice: Building the beloved community*. Columbia University Press.
5. Lê Văn Hồng, Lê Ngọc Lan, & Nguyễn Văn Thàng. (1995). *Tâm lí học lứa tuổi và sư phạm*. Hà Nội.
6. Nash, M., Munford, R., & O’Donoghue, K. (2005). *Social work theories in action*. Jessica Kingsley Publishers.
7. Saleebey, D. (1992). *The strengths perspective in social work practice*. Longman.
8. Welch, M., & Sheridan, S. M. (1995). *Educational partnerships: Serving students at risk*. Harcourt Brace College Publishers. (Các nguồn từ Đại học Cần Thơ, Trường Nguyễn Siêu, THPT Hưng Đạo, THPT Khoa học Giáo dục đã được gộp chung vì đều là ví dụ minh họa về phòng/trung tâm tham vấn)

### II. Sức khỏe tinh thần & Các Kỹ thuật tâm lý học (Trầm cảm, Stress, Liệu pháp CBT/DBT)
9. Berries AI. (n.d.). *Behavioral activation activities: A practical guide for therapists and clients*. [Link](https://heyberries.com/blog/articles/behavioral-activation-activities)
10. Centre for Clinical Interventions (CCI). (n.d.). *Behavioural strategies for managing depression*. [Link](https://www.cci.health.wa.gov.au/~/media/CCI/Consumer-Modules/Back-from-The-Bluez/Back-from-the-Bluez---02---Behavioural-Strategies.pdf)
11. Cleveland Clinic. (2022). *How to do the 4-7-8 breathing exercise*. [Link](https://health.clevelandclinic.org/4-7-8-breathing)
12. Dialectical Behavior Therapy. (n.d.). *TIPP: DBT skills, worksheets, videos, exercises*. [Link](https://dialecticalbehaviortherapy.com/distress-tolerance/tipp/)
13. Guy-Evans, O. (2025). *How to stop catastrophic thinking*. Simply Psychology. [Link](https://www.simplypsychology.org/how-to-stop-catastrophic-thinking.html)
14. Lines for Life. (n.d.). *Grounding techniques*. [Link](https://www.linesforlife.org/grounding-techniques/)
15. MyCPR NOW. (n.d.). *Mental first aid: Handling stress in emergency situations*. [Link](https://cprcertificationnow.com/blogs/mycpr-now-blog/mental-first-aid-handling-stress-in-emergency-situations)
16. Smith, S. (2018). *5-4-3-2-1 coping technique for anxiety*. URMC Rochester Behavioral Health Partners. [Link](https://www.urmc.rochester.edu/behavioral-health-partners/bhp-blog/april-2018/5-4-3-2-1-coping-technique-for-anxiety)
17. Stanborough, R. J. (2023). *Cognitive restructuring: Techniques and examples*. Healthline. [Link](https://www.healthline.com/health/cognitive-restructuring)

### III. Lối sống, Dinh dưỡng & Vận động
18. IWC. (2024). *7 Foods to Boost your 'Happy Hormones'*. [Link](https://www.iwc.org.au/blog/7-foods-to-boost-your-happy-hormones)
19. Lewis, B. (2026). *How sleep, nutrition & exercise affect your mood*. Beata Lewis MD. [Link](https://drlewis.com/sleep-nutrition-exercise-mood/)
20. Mayo Clinic. (n.d.). *Foods that can boost your mood*. [Link](https://communityhealth.mayoclinic.org/featured-stories/mood-boosting-foods)

### IV. Mạng xã hội, Áp lực mạng & Bắt nạt trực tuyến
21. Công ty Luật TNHH Duy Hưng. (2020). *Bị nói xấu, đặt điều vu khống lên mạng xã hội*. [Link](https://luatduyhung.com/bi-noi-xau-dat-dieu-vu-khong-len-mang-xa-hoi/)
22. Meta. (n.d.). *Bí quyết ngăn chặn hành vi bắt nạt*. Trung tâm an toàn của Meta. [Link](https://www.meta.com/vi-vn/safety/topics/bullying-harassment/prevention/)
23. Trường Đại học Văn Hiến. (2025). *Phòng chống bắt nạt trên mạng xã hội*. Trung tâm Tham vấn Tâm lý. [Link](https://thamvantamly.vhu.edu.vn/vi/suc-khoe-tinh-than/phong-chong-bat-nat-tren-mang-xa-hoi)
24. Vietcetera. (n.d.). *Phương pháp cai nghiện TikTok tới từ chính TikTok*. [Link](https://vietcetera.com/vn/phuong-phap-cai-nghien-tiktok-toi-tu-chinh-tiktok)
25. Vinmec. (2024). *Làm thế nào để cai nghiện mạng xã hội?*. [Link](https://www.vinmec.com/vie/bai-viet/lam-nao-de-cai-nghien-mang-xa-hoi-vi)

### V. Danh bạ khẩn cấp & Hotline hỗ trợ
26. Bệnh viện Tâm thần Thành phố Cần Thơ. (n.d.). *Liên hệ*. [Link](https://bvtamthanct.vn/lien-he/)
27. Đặng Thùy Linh. (2026). *Chuyên gia tư vấn tâm lý miễn phí*. Bệnh viện Lê Lợi. [Link](https://benhvienleloi.com.vn/chuyen-gia-tu-van-tam-ly-mien-phi.html)
28. Kế toán Anpha. (n.d.). *Danh sách hotline, số điện thoại đường dây nóng ở Việt Nam*. [Link](https://ketoananpha.vn/danh-sach-cac-duong-day-nong-o-viet-nam.html)
29. Tổng đài 111. (n.d.). *Tổng đài bảo vệ trẻ em 111*. [Link](https://tongdai111.vn/)
30. Trang Min. (2021). *5 địa chỉ tham vấn tâm lý online trong mùa giãn cách*. Vietcetera. [Link](https://vietcetera.com/vn/5-dia-chi-tham-van-tam-ly-online-trong-mua-gian-cach)
`
  },
  {
    id: 'cam-nang-moi-truong-hoc-duong',
    title: 'Đang cập nhật...',
    category: 'Cẩm nang xây dựng môi trường học đường thân thiện với sức khỏe tâm thần của học sinh THPT',
    icon: 'Lock',
    content: `
# Cẩm nang xây dựng môi trường học đường thân thiện

**Cẩm nang này đang trong quá trình cập nhật!**

Vui lòng quay lại sau!
`
  }
];

