/* =========================================================
   Công cụ chuẩn hoá ảnh thẻ 260x325
   Sản phẩm: Nguyễn Minh Khôi — Tân sinh viên PCCU
   Xử lý 100% trên trình duyệt, không upload máy chủ
   ========================================================= */
(function () {
  'use strict';

  var W = 260, H = 325, R = W / H;

  var drop  = document.getElementById('drop');
  var file  = document.getElementById('file');
  var work  = document.getElementById('work');
  var cv    = document.getElementById('out');
  var ctx   = cv.getContext('2d');
  var stats = document.getElementById('stats');

  var img = null;
  var defaults = { b: 100, c: 100, s: 100, z: 100, px: 0, py: 0, flip: 'none', bg: '#ffffff' };
  var params = Object.assign({}, defaults);

  function $(id) { return document.getElementById(id); }

  function load(src) {
    img = new Image();
    img.onload = function () {
      work.classList.remove('hidden');
      render();
    };
    img.src = src;
  }

  function read(f) {
    var r = new FileReader();
    r.onload = function () { load(r.result); };
    r.readAsDataURL(f);
  }

  // ----- Crop cover 4:5, không stretch -----
  function render() {
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = params.bg;
    ctx.fillRect(0, 0, W, H);

    var ir = img.width / img.height;
    var sw, sh;
    if (ir > R) { sh = img.height; sw = sh * R; }
    else        { sw = img.width;  sh = sw / R; }

    var cx = img.width / 2  + params.px / 100 * sw;
    var cy = img.height / 2 + params.py / 100 * sh;
    var cw = sw / (params.z / 100);
    var ch = sh / (params.z / 100);

    // giới hạn vùng crop trong ảnh gốc
    var cx0 = Math.min(Math.max(cx - cw / 2, 0), img.width  - cw);
    var cy0 = Math.min(Math.max(cy - ch / 2, 0), img.height - ch);

    if (params.flip === 'h') { ctx.translate(W, 0); ctx.scale(-1, 1); }

    ctx.filter = 'brightness(' + params.b + '%) contrast(' + params.c + '%) saturate(' + params.s + '%)';
    ctx.drawImage(img, cx0, cy0, cw, ch, 0, 0, W, H);
    ctx.restore();
    ctx.filter = 'none';

    stats.textContent = 'Nguồn: ' + img.width + '×' + img.height +
      'px → Xuất: ' + W + '×' + H + 'px · tỉ lệ 4:5 · JPEG 92%';
  }

  // ----- Bindings -----
  function bind(id, key) {
    $(id).oninput = function (e) {
      params[key] = +e.target.value;
      syncVals();
      render();
    };
  }

  function syncVals() {
    $('vB').textContent = params.b + '%';
    $('vC').textContent = params.c + '%';
    $('vS').textContent = params.s + '%';
    $('vZ').textContent = params.z + '%';
    $('vP').textContent = params.px + ' / ' + params.py;
  }

  bind('bright', 'b');
  bind('contrast', 'c');
  bind('sat', 's');
  bind('zoom', 'z');
  bind('px', 'px');
  bind('py', 'py');

  $('flip').onchange = function (e) { params.flip = e.target.value; render(); };
  $('bg').oninput    = function (e) { params.bg = e.target.value; render(); };

  $('reset').onclick = function () {
    params = Object.assign({}, defaults);
    ['bright', 'contrast', 'sat', 'zoom'].forEach(function (i) { $(i).value = 100; });
    $('px').value = 0; $('py').value = 0;
    $('flip').value = 'none'; $('bg').value = '#ffffff';
    syncVals();
    render();
  };

  $('again').onclick = function () {
    work.classList.add('hidden');
    file.value = '';
    file.click();
  };

  $('dl').onclick = function () {
    cv.toBlob(function (b) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = 'anh-the-260x325.jpg';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    }, 'image/jpeg', 0.92);
  };

  // ----- Sự kiện kéo thả / chọn file -----
  drop.onclick = function () { file.click(); };
  drop.ondragover  = function (e) { e.preventDefault(); drop.classList.add('drag'); };
  drop.ondragleave = function () { drop.classList.remove('drag'); };
  drop.ondrop = function (e) {
    e.preventDefault();
    drop.classList.remove('drag');
    if (e.dataTransfer.files[0]) read(e.dataTransfer.files[0]);
  };
  file.onchange = function () { if (file.files[0]) read(file.files[0]); };
})();
