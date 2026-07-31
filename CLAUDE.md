# CLAUDE.md — kiem-thuoc-chet

Kho **CÔNG KHAI** chứa cái gác dùng chung `@suga/kiem-thuoc-chet`: *thước nào trong kho cũng phải
được cổng gọi, hoặc khai rõ thứ đang chặn — và miễn trừ phải TỰ HẾT HẠN.*

🧠 **Bộ nhớ:** nhóm `Memories/_Chung/` (mảnh `luat-tai-dung-co-san-ma-khong-no-29-07.md`,
`bai-kiem-canh-dung-doan-chay.md`). Tủ gốc + luật làm việc đã nạp từ `~/Work/CLAUDE.md`.

## 3 luật của kho này (đừng phá)

1. **0 phụ thuộc.** Có chốt CI canh. Thêm một gói là mọi CI đang kéo bằng tarball phải cài thêm cả
   cây ⇒ chậm, có khi cần chìa ⇒ mất đúng lý do gói này tồn tại.
2. **CÔNG KHAI.** Repo private thì CI của 4 kho kia phải có chìa mới kéo được — mà cả 4 kho hiện
   **không có secret Actions nào** (đo 31/07: `gh secret list` rỗng cả 4).
3. **Đổi luật thì phải thêm ca vào `--tu-kiem`,** có cả đối chứng ÂM lẫn DƯƠNG. Kho này là cái gác
   của nhà — nó xanh giả thì cả 4 kho kia xanh giả theo.

## Ai đang dùng

`hidental-site` · `santapocket-site` · `fidesholding-site` · `sugagroup-site` — ghim theo **tag**.
Đổi tag ở `package.json` của kho nào thì phải đổi kèm URL tarball trong `ci.yml` của kho đó, kẻo
máy gác đo bản khác bản chạy dưới máy.

## Chạy

```bash
npm test                      # tự kiểm bộ luật (16 ca) + tự soi chính kho này
node kiem.mjs --tu-kiem       # chỉ tự kiểm bộ luật
node kiem.mjs --kho ../hidental-site   # soi một kho khác
```
