# @suga/kiem-thuoc-chet

**Cái gác "thước nào cũng phải được gọi".** Bắt cảnh kho có bài kiểm mà **không lệnh nào chạy tới** —
và bắt cả cảnh **cổng có mà máy gác không bấm**.

> Kho **CÔNG KHAI** để CI của mọi kho kéo về được **không cần chìa**, y như `Debill84/site-guard`.
> **0 phụ thuộc** (có chốt CI canh) ⇒ kéo về ~5 giây.

---

## Bệnh nó chữa

Kho mọc thêm bài kiểm theo thời gian, nhưng **cổng đứng yên**. Bài kiểm nằm trong kho, chưa từng chạy.

Đo thật ngày 31/07/2026:

| Kho | Thước | Thực tế |
|---|---|---|
| `hidental-site` | 9 (~700 phép đo) | **0 cái từng chạy trên máy gác** — thư mục workflow TRỐNG |
| `santapocket-site` | 7 | `test:e2e:hanh-vi` là GATE-theo-thiết-kế mà không lệnh nào gọi |
| `fidesholding-site` | 3 | 2 chết |
| `sugagroup-site` | 3 | 2 chết |

**Vá bằng danh sách thì bệnh quay lại**: liệt kê 3 cái thước vào `npm test` rồi thôi ⇒ danh sách
đứng yên, kho mọc thêm thước, cái thứ tư chết y hệt mà đèn vẫn xanh. Đã trả giá đúng vậy ở
`suga-backend-kit` ngày 26/07 rồi 30/07. ⇒ Phải vá bằng **cái gác**.

---

## Luật

Mỗi lệnh npm tên khớp `mauThuoc` (mặc định `^(kiem|test)`) phải rơi vào **đúng một** ô:

- **(a)** CỔNG gọi tới được (đi theo chuỗi `npm run …`, **đệ quy**), hoặc
- **(b)** nằm trong bảng **miễn trừ** — kèm **thứ đang chặn nó**.

Và miễn trừ phải **TỰ HẾT HẠN**, không được là tấm khiên mục:

| # | Đỏ khi |
|---|---|
| ① | thước không ở ô nào (**thước chết**) |
| ② | miễn trừ cho lệnh đã bị xoá (**miễn trừ chết**) |
| ③ | miễn trừ mà cổng đã gọi được rồi (**gỡ miễn trừ ra**) |
| ④ | lệnh trỏ vào tệp không tồn tại |
| ⑤ | `goiChan`: đi bộ require/import từ thước mà **không còn thấy** gói bị chặn |
| ⑥ | `tepChan`: tệp-chặn **nay đã có** |
| ⑦ | `buocCiChan`: bước CI đó **nay đã có** |
| ⑧ | **CỔNG không được máy gác gọi** |
| ⑨ | **TỆP thước không lệnh nào trên cổng nhắc tới** (*tệp thước mồ côi*) — cần khai `tepThuoc` |
| ⑩ | khai `tepThuoc` mà quét ra **0 tệp** (mẫu sai / thư mục đã dời) |

### ⑧ là bệnh tầng hai

Đo được 31/07 ở `santapocket-site`: mọi thước đều nằm trong `npm run build` (nên ①→⑦ đều xanh)
nhưng `ci.yml` **liệt kê tay từng thước và không hề gọi `npm run build`** ⇒ thước mới thêm vào
cổng vẫn không ai chạy. **Gác được ô (a) mà không gác cái cổng thì vô ích.**

### ⑨ là bệnh tầng ba — đơn vị bị gác tụt xuống một nấc

Đo được 03/08 ở `suga-finance`: ①→⑧ gác **LỆNH npm**, nhưng kho đó nối **42 tệp thước** bằng `&&`
**bên trong một lệnh**:

```json
"test:logic": "node db/test/a_test.ts && node db/test/b_test.ts && … (42 tệp)"
```

Rút một đoạn ra khỏi chuỗi thì tệp vẫn nằm trong kho, **không lệnh nào gọi, không ai kêu** — đúng
con bệnh cả kho này sinh ra để chặn, chỉ tụt xuống một tầng đơn vị. Hôm khai luật này kho đó đang
**42/42** tệp đều được cắm, tức là **kỷ luật đang giữ, chưa phải cái gác đang giữ** — mà kỷ luật
thì không ai đo được.

⑩ đi kèm **bắt buộc**: quét ra 0 tệp thì ⑨ **xanh vì không đo được**, không phải vì sạch. Hai thứ
đó nhìn từ ngoài giống hệt nhau.

> ⑨/⑩ **ngủ** nếu kho không khai `tepThuoc`. Cố ý: 5 kho đang ghim gói này, nâng tag lên mà tự
> dưng đỏ thêm thì người ta **gỡ cái gác** chứ không đi vá.

---

## Cắm vào một kho

**1. Khai phụ thuộc** (ghim theo tag — đừng để trôi):

```json
"devDependencies": {
  "@suga/kiem-thuoc-chet": "github:Debill84/kiem-thuoc-chet#v1.1.0"
}
```

**2. Nối vào cổng** — cho nó chạy **đầu tiên**, vì nó rẻ nhất và nó gác chính cái cổng:

```json
"scripts": {
  "kiem-thuoc-chet": "kiem-thuoc-chet",
  "test": "npm run kiem-thuoc-chet && …"
}
```

**3. Khai bảng miễn trừ** trong `package.json`:

```json
"kiemThuocChet": {
  "goc": ["test"],
  "mauThuoc": "^(kiem|test)",
  "tepThuoc": ["db/test/**/*_test.ts"],
  "mienTru": {
    "kiem-seo":              { "goiChan": "@debill84/cms",      "vi": "dựng server thật, cần chìa kho riêng" },
    "test:e2e:pixel":        { "tepChan": "e2e/**/*-linux.png", "vi": "chưa commit ảnh chuẩn Linux" },
    "test:e2e:hanh-vi":      { "buocCiChan": "playwright install", "vi": "máy gác chưa cài trình duyệt" },
    "test:e2e:pixel:update": { "congCu": true,                  "vi": "không phải thước — lệnh cập ảnh chuẩn" },
    "db/test/_khuon.ts":     { "congCu": true,                  "vi": "khuôn dùng chung, không phải thước" }
  }
}
```

`tepThuoc` **tuỳ chọn** — khai thì bật ⑨/⑩, không khai thì hai luật đó ngủ.

🔑 Khoá `mienTru` **có dấu `/`** được hiểu là **đường dẫn tệp** (miễn trừ cho ⑨); không có `/` thì
là **tên lệnh npm**. Tên lệnh npm không chứa `/` nên hai loại không đụng nhau — và **cả hai đều
chịu ②**: lệnh phải còn trong `scripts`, tệp phải còn khớp `tepThuoc`.

| Ô | Nghĩa | Tự hết hạn khi |
|---|---|---|
| `goiChan` | kẹt vì một **gói** chưa cài được (kho riêng, cần chìa) | thước không còn require gói đó |
| `tepChan` | kẹt vì **thiếu một tệp** (ảnh chuẩn, dữ liệu mẫu) | tệp đó xuất hiện |
| `buocCiChan` | kẹt vì **máy gác thiếu một bước** (cài trình duyệt…) | chuỗi đó xuất hiện trong `.github/workflows/` |
| `congCu` | **không phải thước** — là lệnh tiện ích / khuôn dùng chung | *(không tự hết hạn — vẫn chịu ② và ③)* |

**4. Máy gác kéo gói về** (kho nào **không** chạy `npm ci` được vì vướng gói riêng):

```yaml
- name: Lấy cái gác dùng chung (tarball tag, KHÔNG cần chìa)
  run: |
    GIT_SSH_COMMAND=/usr/bin/false npm i --no-save --prefix /tmp/gac \
      "https://github.com/Debill84/kiem-thuoc-chet/archive/refs/tags/v1.1.0.tar.gz"
    mkdir -p node_modules && cp -R /tmp/gac/node_modules/. node_modules/
```

> `GIT_SSH_COMMAND=/usr/bin/false`: ai vô tình đổi sang `git+ssh` thì **đỏ ngay** chứ không treo.

---

## Chạy

```bash
npx kiem-thuoc-chet              # soi kho ở thư mục đang đứng
npx kiem-thuoc-chet --kho ../x   # soi kho khác
npx kiem-thuoc-chet --tu-kiem    # tự kiểm BỘ LUẬT (32 ca, đối chứng ÂM + DƯƠNG)
```

`--tu-kiem` là phần **bắt buộc đọc**: *thước xanh sau khi vá không nói lên gì; thước đỏ khi đục
mới nói.* **Ba** lỗi thật bị bắt ngay trong lúc dựng — cả ba đều là **xanh giả**:

1. Phép "miễn trừ không khai cớ" nằm **sau chỗ thoát sớm** ⇒ không bao giờ chạy. *(bộ tự kiểm bắt)*
2. 🩸 Gọi qua **symlink `.bin`** thì cái gác **im lặng thoát 0** — `process.argv[1]` là đường
   symlink còn `import.meta.url` là đường thật. Trên máy gác trông y hệt "đã chạy và xanh".
   Chạy `node kiem.mjs` **không bao giờ** lòi ra loại này. *(bắt được vì đã gọi thử qua đúng đường
   CI sẽ gọi — nay có chốt CI canh riêng.)*
3. 🩸 Luật ⑧ **tìm chữ trong cả tệp** ⇒ **gỡ hẳn bước chạy thật khỏi máy gác mà vẫn xanh**.
   Phải đục **hai lần** mới hết: lần 1 nó đọc trúng chữ trong **dòng chú thích**; vá xong vẫn xanh
   vì lần 2 nó đọc trúng chữ trong **tên bước** (`- name: npm test`). Nay chỉ đọc phần lệnh trong
   khối `run:`. *(bắt được nhờ bảng đục lỗ ở `hidental-site`; nếu tin đèn xanh thì đã ship.)*
   👉 **Thước tìm-chữ-trong-cả-tệp gần như luôn rộng hơn ý mình.**

> 👉 Bài học chung: **đo cái thước bằng đúng đường mà người ta sẽ dùng nó**, đừng đo bằng đường
> tiện tay nhất — và **đục cho nó đỏ**, đèn xanh không chứng minh gì.

---

## Giới hạn ĐÃ BIẾT (ghi ra để khỏi tưởng nó gác hết)

- **Mẫu thước mặc định `^(kiem|test)` không bắt `con-mat:soi` / `con-mat:lai`** (bộ mắt của nhà,
  `@suga-co/e2e-kit`). 3 kho đang có 2 lệnh đó mà cổng không gọi. Cố ý chưa nới mặc định — nới là
  đỏ 3 kho cùng lúc, phải có đợt riêng để quyết wire hay miễn trừ. Kho nào muốn gác luôn thì khai
  `"mauThuoc": "^(kiem|test|con-mat)"`.
- **⑨ đo THÔ: "tên tệp có xuất hiện trong thân lệnh không"** — không phân tích chuỗi `&&`,
  vì người ta nối thước bằng đủ kiểu (`&&`, `;`, `for`, `xargs`, biến shell). Hệ quả: một tệp được
  nhắc trong lệnh nhưng ở nhánh **không bao giờ chạy tới** thì ⑨ vẫn cho qua. Cố ý sai về phía
  **cho qua** — chuông kêu oan thì người ta tháo chuông.
- **Chỉ đọc `package.json` + `.github/workflows/`.** Thước gọi bằng đường khác (Railway hook,
  `.command` trên Desktop, cron) thì nó không thấy.
- **`congCu` là lời khai của người, không phải phép đo** — ô duy nhất không tự hết hạn.
