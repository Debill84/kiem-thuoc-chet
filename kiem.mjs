#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════════════════════
// CÁI GÁC "THƯỚC NÀO CŨNG PHẢI ĐƯỢC GỌI" — bản DÙNG CHUNG cho mọi kho của nhà.
//
// 🩸 BỆNH NÓ CHỮA — "thước có mà không ai cầm"
//   Kho mọc thêm bài kiểm theo thời gian, nhưng cái CỔNG (npm test / npm run build và
//   `.github/workflows/`) thì đứng yên. Kết quả: bài kiểm nằm trong kho, chưa từng chạy lần nào.
//   Đo thật 31/07/2026: `hidental-site` có 9 thước ~700 phép đo — **0 cái từng chạy trên máy gác**
//   (thư mục workflow TRỐNG). `santapocket-site` có `test:e2e:hanh-vi` là GATE-theo-thiết-kế mà
//   không lệnh nào gọi. `fidesholding-site`/`sugagroup-site` mỗi kho 2 thước chết.
//
// 🚫 VÌ SAO KHÔNG VÁ BẰNG DANH SÁCH
//   "Liệt kê 3 cái thước vào npm test rồi thôi" thì bệnh quay lại: danh sách đứng yên, kho mọc
//   thêm thước, cái thứ tư chết y hệt mà đèn vẫn xanh. Đã trả giá đúng như vậy ở `suga-backend-kit`
//   ngày 26/07 rồi 30/07. ⇒ Phải vá bằng CÁI GÁC. Tệp này là cái gác.
//
// 🏠 VÌ SAO NẰM Ở KHO CÔNG KHAI RIÊNG (Bill chốt 31/07/2026)
//   Bản đầu viết tay trong `hidental-site`. Đem sang 3 kho nữa = **chép tay 4 bản** — đúng thứ
//   Bill đã phê bình ("có bộ kit chung mà không xài lại, đi tự dựng"). Kho này CÔNG KHAI nên CI
//   kéo được **không cần chìa**, y như `Debill84/site-guard` đang làm.
//
// ═══════════════════════════════════════════════════════════════════════════════════════════
// LUẬT — mỗi lệnh npm tên khớp `mauThuoc` (mặc định `^(kiem|test)`) phải rơi vào ĐÚNG MỘT ô:
//   (a) CỔNG gọi tới được (đi theo chuỗi `npm run …`, đệ quy), HOẶC
//   (b) nằm trong bảng MIỄN TRỪ **kèm thứ đang chặn nó** — và miễn trừ phải TỰ HẾT HẠN.
//
//   ① thước không ở ô nào                         → ĐỎ (thước chết)
//   ② miễn trừ cho lệnh đã mất                    → ĐỎ (miễn trừ chết)
//   ③ miễn trừ mà cổng đã gọi được rồi            → ĐỎ (gỡ miễn trừ ra)
//   ④ lệnh trỏ vào tệp không tồn tại              → ĐỎ (lệnh trỏ vào hư không)
//   ⑤ `goiChan`: đi bộ require/import từ thước mà KHÔNG còn thấy gói bị chặn → ĐỎ (hết cớ)
//   ⑥ `tepChan`: tệp-chặn NAY ĐÃ CÓ              → ĐỎ (hết cớ, kéo vào cổng đi)
//   ⑦ `buocCiChan`: bước CI đó NAY ĐÃ CÓ         → ĐỎ (hết cớ, kéo vào cổng đi)
//   ⑧ CỔNG không được máy gác gọi                → ĐỎ (cổng nằm ngoài `.github/workflows/`)
//
// ⑧ là bệnh TẦNG HAI, đo được 31/07 ở `santapocket-site`: mọi thước đều nằm trong `npm run build`
//   (nên ①→⑦ đều xanh) nhưng `ci.yml` **liệt kê tay từng thước và không hề gọi `npm run build`**
//   ⇒ thước mới thêm vào build vẫn không ai chạy. Gác được ô (a) mà không gác cái cổng thì vô ích.
//
// ═══════════════════════════════════════════════════════════════════════════════════════════
// KHAI BÁO — đặt trong `package.json` của kho được soi, khoá `kiemThuocChet`:
//
//   "kiemThuocChet": {
//     "goc": ["test"],                     // lệnh CỔNG (mặc định ["test"]); santapocket là ["build"]
//     "mauThuoc": "^(kiem|test)",          // tuỳ chọn — cái gì tính là "thước"
//     "mienTru": {
//       "kiem-seo":              { "goiChan": "@debill84/cms", "vi": "cần chìa kho riêng" },
//       "test:e2e:pixel":        { "tepChan": "e2e/**/*-linux.png", "vi": "chưa có ảnh chuẩn Linux" },
//       "test:e2e:hanh-vi":      { "buocCiChan": "playwright install", "vi": "CI chưa cài trình duyệt" },
//       "test:e2e:pixel:update": { "congCu": true, "vi": "không phải thước — lệnh cập ảnh chuẩn" }
//     }
//   }
//
// ⚠️ `congCu` là ô DUY NHẤT không tự hết hạn (nó là lời khai của người, không phải phép đo).
//    Nên nó vẫn phải chịu ② (lệnh còn tồn tại) và ③ (không được nằm trong cổng).
//
//   npx kiem-thuoc-chet             # soi kho ở thư mục đang đứng
//   npx kiem-thuoc-chet --tu-kiem   # tự kiểm BỘ LUẬT (đối chứng ÂM + DƯƠNG) — thước cũng phải bị đo
// ═══════════════════════════════════════════════════════════════════════════════════════════
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';

const BO_QUA_THU_MUC = new Set(['node_modules', '.git', 'test-results', 'playwright-report', 'dist', 'build', '_raw']);

// ── Đọc khai báo ────────────────────────────────────────────────────────────────────────────
function docKho(goc) {
  const duong = join(goc, 'package.json');
  if (!existsSync(duong)) throw new Error(`Không thấy package.json ở ${goc}`);
  const pkg = JSON.parse(readFileSync(duong, 'utf8'));
  const khai = pkg.kiemThuocChet ?? {};
  return {
    scripts: pkg.scripts ?? {},
    goc: khai.goc?.length ? khai.goc : ['test'],
    mauThuoc: new RegExp(khai.mauThuoc ?? '^(kiem|test)'),
    mienTru: khai.mienTru ?? {},
  };
}

// ── Đi theo chuỗi `npm run …` ───────────────────────────────────────────────────────────────
/** Từ thân một lệnh npm, moi ra các lệnh `npm run X` mà nó gọi tiếp. */
export function goiTiep(lenh) {
  return [...String(lenh).matchAll(/npm run (?:--silent )?([\w:.-]+)/g)].map((m) => m[1]);
}

/** Tập lệnh mà CỔNG với tới được (đệ quy, chống lặp vòng). */
export function vetTuGoc(scripts, tenGoc) {
  const toi = new Set();
  const hangDoi = tenGoc.filter((t) => scripts[t]);
  while (hangDoi.length) {
    const ten = hangDoi.shift();
    if (toi.has(ten) || !scripts[ten]) continue;
    toi.add(ten);
    hangDoi.push(...goiTiep(scripts[ten]));
  }
  return toi;
}

/** Tệp mà một lệnh npm chạy tới (`node scripts/abc.mjs …` → `scripts/abc.mjs`). */
export function tepCuaLenh(lenh) {
  const m = String(lenh).match(/node\s+([\w./:-]+\.[cm]?js)/);
  return m ? m[1] : null;
}

/**
 * Đi bộ theo `require`/`import` từ một tệp, gom tên GÓI NGOÀI gặp được.
 * Chỉ đi theo đường tương đối (mã của mình), không chui vào node_modules.
 *
 * 🌉 `require\w*\(` chứ KHÔNG phải `require\(`: kho ESM phải bắc cầu sang gói CommonJS bằng
 *    `const require_ = createRequire(import.meta.url)` rồi gọi `require_('./lib/admin.cjs')`.
 *    Bản đầu chỉ bắt đúng chữ `require(` ⇒ ĐỨT CẦU ngay ở `server.js` ⇒ kêu oan "4 miễn trừ hết
 *    hiệu lực" trong khi cả 4 thước đó vẫn kẹt nguyên. **Chuông kêu oan còn hại hơn chuông không
 *    kêu** — vá THƯỚC, đừng vá bên bị đo.
 *
 * 🖥️ Có nhắc `server.js` trong thân thì coi như đi qua đó luôn — thước dựng máy chủ bằng
 *    `spawn(process.execPath, ['server.js'])`, gói bị chặn nằm ở NHÁNH ĐÓ chứ không nằm trong thước.
 */
export function goiNgoai(tepGoc, gocKho, sau = 6) {
  const thay = new Set();
  const daDi = new Set();
  const di = (duong, con) => {
    if (con < 0 || daDi.has(duong) || !existsSync(duong) || statSync(duong).isDirectory()) return;
    daDi.add(duong);
    const than = readFileSync(duong, 'utf8');
    for (const m of than.matchAll(/(?:\brequire\w*\(|(?:import|from)\s+)['"]([^'"]+)['"]/g)) {
      const ten = m[1];
      if (ten.startsWith('node:')) continue;
      if (ten.startsWith('.')) {
        const ke = resolve(dirname(duong), ten);
        for (const d of ['', '.mjs', '.cjs', '.js']) di(ke + d, con - 1);
      } else thay.add(ten);
    }
    if (/['"]server\.js['"]/.test(than)) di(join(gocKho, 'server.js'), con - 1);
  };
  di(tepGoc, sau);
  return thay;
}

// ── Tìm tệp theo mẫu glob (tự viết — gói này CỐ Ý không có phụ thuộc nào) ────────────────────
/** `e2e/**\/*-linux.png` → RegExp. Chỉ hiểu `**` và `*`, đủ dùng và đoán được. */
export function mauSangRegex(mau) {
  const thoat = mau.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const than = thoat
    .replace(/\*\*\//g, ' ')       // `**/` = không hoặc nhiều tầng thư mục
    .replace(/\*/g, '[^/]*')
    .replace(/ /g, '(?:[^/]*/)*');
  return new RegExp(`^${than}$`);
}

/** Có tệp nào trong kho khớp mẫu không? (dừng ngay khi thấy cái đầu tiên) */
export function coTepKhop(gocKho, mau) {
  const re = mauSangRegex(mau);
  const di = (thuMuc) => {
    let muc;
    try { muc = readdirSync(thuMuc, { withFileTypes: true }); } catch { return false; }
    for (const m of muc) {
      if (m.isDirectory()) {
        if (BO_QUA_THU_MUC.has(m.name)) continue;
        if (di(join(thuMuc, m.name))) return true;
      } else if (re.test(relative(gocKho, join(thuMuc, m.name)).split(sep).join('/'))) return true;
    }
    return false;
  };
  return di(gocKho);
}

// ── Đọc mọi tệp workflow của máy gác ────────────────────────────────────────────────────────
export function thanMayGac(gocKho) {
  const thuMuc = join(gocKho, '.github', 'workflows');
  if (!existsSync(thuMuc)) return null;                    // null = KHÔNG có máy gác nào
  let tep;
  try { tep = readdirSync(thuMuc).filter((t) => /\.ya?ml$/i.test(t)); } catch { return null; }
  if (!tep.length) return null;
  return tep.map((t) => readFileSync(join(thuMuc, t), 'utf8')).join('\n');
}

/** Máy gác có gọi lệnh cổng này không? `test` chấp nhận cả `npm test` lẫn `npm run test`. */
export function mayGacCoGoi(than, tenGoc) {
  if (tenGoc === 'test' && /\bnpm\s+test\b/.test(than)) return true;
  return new RegExp(`npm run (?:--silent )?${tenGoc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(than);
}

// ═══ CHẤM ═══════════════════════════════════════════════════════════════════════════════════
/** Trả về danh sách lời than (rỗng = xanh). `doTep:false` để tự-kiểm bộ luật trên `scripts` giả. */
export function cham({ scripts, goc, mauThuoc, mienTru }, gocKho, { doTep = true } = {}) {
  const than = [];
  const laThuoc = (t) => mauThuoc.test(t);
  const thuoc = Object.keys(scripts).filter(laThuoc).filter((t) => !goc.includes(t));
  const daGoi = vetTuGoc(scripts, goc);

  for (const g of goc) {
    if (!scripts[g]) than.push(`KHÔNG có lệnh cổng \`${g}\` — cổng không có gì để bấm`);
  }

  for (const t of thuoc) {
    const trongCong = daGoi.has(t);
    const mt = mienTru[t];
    if (!trongCong && !mt) than.push(`① THƯỚC CHẾT: \`${t}\` không ai gọi, cũng không khai miễn trừ`);
    if (trongCong && mt) than.push(`③ MIỄN TRỪ THỪA: \`${t}\` đã chạy trong cổng rồi — gỡ khỏi bảng \`mienTru\``);
  }
  for (const [t, mt] of Object.entries(mienTru)) {
    if (!scripts[t]) than.push(`② MIỄN TRỪ CHẾT: bảng còn giữ \`${t}\` mà package.json không còn lệnh đó`);
    // Phép này thuần CẤU HÌNH (không đọc tệp) nên phải nằm TRƯỚC chỗ thoát sớm — bản đầu để nó
    // dưới khối `doTep` ⇒ ca tự-kiểm "miễn trừ không khai cớ" không bao giờ chạy tới. Chính bộ
    // tự kiểm bắt được, đúng bài "thước tự nó cũng là một thứ phải đem ra đo".
    if (!mt.goiChan && !mt.tepChan && !mt.buocCiChan && !mt.congCu) {
      than.push(`MIỄN TRỪ KHÔNG CÓ CỚ: \`${t}\` phải khai một trong \`goiChan\`/\`tepChan\`/\`buocCiChan\`/\`congCu\``);
    }
  }
  if (!doTep) return than;

  // ⑧ CỔNG có được máy gác bấm không
  const gac = thanMayGac(gocKho);
  if (gac === null) {
    than.push('⑧ KHÔNG CÓ MÁY GÁC: `.github/workflows/` trống — mọi thước chỉ chạy khi có người nhớ ra');
  } else {
    for (const g of goc) {
      if (!mayGacCoGoi(gac, g)) {
        than.push(`⑧ CỔNG NẰM NGOÀI MÁY GÁC: không workflow nào gọi \`npm run ${g}\` — thước mới thêm vào cổng vẫn không ai chạy`);
      }
    }
  }

  for (const t of thuoc) {
    const tep = tepCuaLenh(scripts[t]);
    const mt = mienTru[t];
    if (tep) {
      const duong = join(gocKho, tep);
      if (!existsSync(duong)) { than.push(`④ TRỎ VÀO HƯ KHÔNG: \`${t}\` → \`${tep}\` không tồn tại`); continue; }
      // ⑤ lý do "gói chặn" còn đúng không
      if (mt?.goiChan && !goiNgoai(duong, gocKho).has(mt.goiChan)) {
        than.push(`⑤ MIỄN TRỪ HẾT HIỆU LỰC: \`${t}\` khai kẹt vì \`${mt.goiChan}\` nhưng đi bộ require KHÔNG còn thấy gói đó — kéo vào cổng đi`);
      }
    } else if (mt?.goiChan) {
      than.push(`⑤ KHÔNG KIỂM ĐƯỢC CỚ: \`${t}\` khai kẹt vì \`${mt.goiChan}\` nhưng lệnh không chạy tệp \`node …\` nào để đi bộ — đổi sang \`tepChan\`/\`buocCiChan\``);
    }
    // ⑥ lý do "tệp chặn" còn đúng không
    if (mt?.tepChan && coTepKhop(gocKho, mt.tepChan)) {
      than.push(`⑥ MIỄN TRỪ HẾT HIỆU LỰC: \`${t}\` khai kẹt vì thiếu \`${mt.tepChan}\` — nay tệp đó ĐÃ CÓ, kéo vào cổng đi`);
    }
    // ⑦ lý do "bước CI chặn" còn đúng không
    if (mt?.buocCiChan && gac && gac.includes(mt.buocCiChan)) {
      than.push(`⑦ MIỄN TRỪ HẾT HIỆU LỰC: \`${t}\` khai kẹt vì máy gác chưa có \`${mt.buocCiChan}\` — nay ĐÃ CÓ, kéo vào cổng đi`);
    }
  }
  return than;
}

// ═══ TỰ KIỂM BỘ LUẬT ════════════════════════════════════════════════════════════════════════
// "Thước xanh sau khi vá không nói lên gì; thước đỏ khi đục mới nói."
function tuKiem() {
  const R = (m) => ({ scripts: {}, goc: ['test'], mauThuoc: /^(kiem|test)/, mienTru: {}, ...m });
  const ca = [
    ['DƯƠNG ① — thước mới thêm mà không ai gọi',
      R({ scripts: { test: 'npm run kiem-a', 'kiem-a': 'node a.mjs', 'kiem-moi-toanh': 'node x.mjs' } }), true],
    ['DƯƠNG — không có lệnh cổng',
      R({ scripts: { 'kiem-a': 'node a.mjs' } }), true],
    ['DƯƠNG ② — miễn trừ cho lệnh đã bị xoá',
      R({ scripts: { test: 'echo ok' }, mienTru: { 'kiem-da-xoa': { congCu: true } } }), true],
    ['DƯƠNG ③ — miễn trừ thừa (thước kẹt lại nằm trong cổng)',
      R({ scripts: { test: 'npm run kiem-a', 'kiem-a': 'node a.mjs' }, mienTru: { 'kiem-a': { congCu: true } } }), true],
    ['ÂM — chuỗi lồng 2 tầng vẫn phải XANH',
      R({ scripts: { test: 'npm run tang2', tang2: 'npm run kiem-a', 'kiem-a': 'node a.mjs' } }), false],
    ['ÂM — cổng tên khác `test` (santapocket dùng `build`)',
      R({ scripts: { build: 'npm run test:html', 'test:html': 'node t.js' }, goc: ['build'] }), false],
    ['ÂM — lệnh KHÔNG khớp mẫu thước thì kệ nó',
      R({ scripts: { test: 'echo ok', 'con-mat:soi': 'con-mat-soi' } }), false],
    ['DƯƠNG — miễn trừ không khai cớ nào',
      R({ scripts: { test: 'echo ok', 'kiem-a': 'node kiem.mjs' }, mienTru: { 'kiem-a': { vi: 'lười' } } }), true],
  ];

  const caGlob = [
    ['GLOB — `e2e/**/*-linux.png` khớp tệp lồng sâu', () => mauSangRegex('e2e/**/*-linux.png').test('e2e/pixel/a.spec.ts-snapshots/x-linux.png'), true],
    ['GLOB — `e2e/**/*-linux.png` khớp cả khi KHÔNG lồng', () => mauSangRegex('e2e/**/*-linux.png').test('e2e/x-linux.png'), true],
    ['GLOB — không khớp bản darwin', () => mauSangRegex('e2e/**/*-linux.png').test('e2e/pixel/x-darwin.png'), false],
    ['GLOB — không khớp ngoài thư mục e2e', () => mauSangRegex('e2e/**/*-linux.png').test('assets/x-linux.png'), false],
    ['MÁY GÁC — `npm test` tính là gọi cổng `test`', () => mayGacCoGoi('        run: npm test\n', 'test'), true],
    ['MÁY GÁC — `npm run build` tính là gọi cổng `build`', () => mayGacCoGoi('run: npm run build\n', 'build'), true],
    ['MÁY GÁC — liệt kê tay từng thước KHÔNG tính là gọi cổng `build`', () => mayGacCoGoi('run: npm run test:html\nrun: npm run test:seo\n', 'build'), false],
    ['ĐI TIẾP — moi được lệnh có dấu hai chấm', () => goiTiep('npm run test:e2e:hanh-vi && npm run kiem').join(','), 'test:e2e:hanh-vi,kiem'],
  ];

  let hong = 0;
  for (const [ten, do_, mong] of caGlob) {
    const thuc = do_();
    const dat = thuc === mong;
    console.log(`${dat ? '  ✅' : '  ❌'} ${ten}${dat ? '' : ` → được ${JSON.stringify(thuc)}, mong ${JSON.stringify(mong)}`}`);
    if (!dat) hong++;
  }
  for (const [ten, khai, phaiDo] of ca) {
    const than = cham(khai, process.cwd(), { doTep: false });
    const dat = phaiDo ? than.length > 0 : than.length === 0;
    console.log(`${dat ? '  ✅' : '  ❌'} ${ten}${dat ? '' : ` → ${JSON.stringify(than)}`}`);
    if (!dat) hong++;
  }
  const tong = ca.length + caGlob.length;
  console.log(hong ? `\n❌ bộ luật hỏng ${hong}/${tong}` : `\n✅ bộ luật tự kiểm đạt ${tong}/${tong}`);
  return hong ? 1 : 0;
}

// ═══ CHẠY ═══════════════════════════════════════════════════════════════════════════════════
function chay(argv) {
  if (argv.includes('--tu-kiem')) return tuKiem();

  const i = argv.indexOf('--kho');
  const gocKho = resolve(i >= 0 ? argv[i + 1] : process.cwd());
  const khai = docKho(gocKho);
  const than = cham(khai, gocKho);

  const thuoc = Object.keys(khai.scripts).filter((t) => khai.mauThuoc.test(t)).filter((t) => !khai.goc.includes(t));
  const daGoi = vetTuGoc(khai.scripts, khai.goc);
  const chayDuoc = thuoc.filter((t) => daGoi.has(t));

  console.log(`🔎 ${thuoc.length} thước — cổng \`${khai.goc.join('` + `')}\` bấm ${chayDuoc.length}, khai miễn trừ ${Object.keys(khai.mienTru).length}`);
  for (const t of thuoc) {
    const mt = khai.mienTru[t];
    const co = mt?.goiChan ? `gói \`${mt.goiChan}\`` : mt?.tepChan ? `thiếu \`${mt.tepChan}\`` : mt?.buocCiChan ? `CI chưa có \`${mt.buocCiChan}\`` : mt?.congCu ? 'không phải thước' : '';
    console.log(`  ${daGoi.has(t) ? '✅ chạy trên cổng' : '⏸️  kẹt          '} ${t}${mt ? `  ← ${co}${mt.vi ? ` · ${mt.vi}` : ''}` : ''}`);
  }
  if (than.length) {
    console.log('\n' + than.map((d) => `  ❌ ${d}`).join('\n'));
    console.log(`\n❌ ${than.length} lỗi — xem LUẬT ở đầu \`kiem.mjs\` của @suga/kiem-thuoc-chet`);
    return 1;
  }
  console.log('\n✅ không thước nào chết: mỗi thước hoặc nằm trên cổng, hoặc khai rõ thứ đang chặn — và cổng có máy gác bấm');
  return 0;
}

// Chỉ chạy khi được gọi thẳng, không chạy khi bị `import` (tệp test dùng lại các hàm trên).
const laChayThang = process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname);
if (laChayThang) process.exit(chay(process.argv.slice(2)));
