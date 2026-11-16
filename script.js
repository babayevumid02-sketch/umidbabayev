/* ==========================================================================
   Ümid Babayev — Fitness Trainer Naxçıvan
   script.js
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 1. Header scroll halı ---------- */
  var header = $('#header');
  var toTop  = $('#toTop');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    if (toTop)  toTop.classList.toggle('show', y > 600);
    spy();
  }

  /* ---------- 2. Mobil menyu ---------- */
  var burger = $('#burger');
  var nav    = $('#nav');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Menyunu bağla' : 'Menyunu aç');
    });

    $$('#nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('open')) return;
      if (nav.contains(e.target) || burger.contains(e.target)) return;
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  }

  /* ---------- 3. Scroll-spy (aktiv bölmə) ---------- */
  var navLinks = $$('#nav a[href^="#"]');
  var sections = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  function spy() {
    if (!sections.length) return;
    var pos = (window.pageYOffset || document.documentElement.scrollTop) + 140;
    var currentId = '';
    sections.forEach(function (sec) {
      if (sec.offsetTop <= pos) currentId = sec.id;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + currentId);
    });
  }

  /* ---------- 4. Rəqəm sayğacı ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var dur = 1400;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  var counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          animateCount(en.target);
          cObs.unobserve(en.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cObs.observe(c); });
  } else {
    counters.forEach(function (c) { c.textContent = c.getAttribute('data-count'); });
  }

  /* ---------- 5. Görünmə animasiyası ---------- */
  var revealTargets = $$('.section-title, .section-lead, .card, .champ, .cert-list li, .club, .contact-card, .about-copy, .about-media, .stat, .faq-item');
  revealTargets.forEach(function (el) { el.classList.add('reveal'); });

  if ('IntersectionObserver' in window) {
    var rObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en, i) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { el.classList.add('in'); }, Math.min(i * 45, 260));
        rObs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(function (el) { rObs.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 6. Qalereya + Lightbox ---------- */
  var items = $$('#gallery .g-item img');
  var lb      = $('#lightbox');
  var lbImg   = $('#lbImg');
  var lbClose = $('#lbClose');
  var lbPrev  = $('#lbPrev');
  var lbNext  = $('#lbNext');
  var index = 0;

  function openLb(i) {
    if (!lb || !items.length) return;
    index = (i + items.length) % items.length;
    var src = items[index].getAttribute('src');
    lbImg.setAttribute('src', src);
    lbImg.setAttribute('alt', items[index].getAttribute('alt') || '');
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    if (lbClose) lbClose.focus();
  }

  function closeLb() {
    if (!lb) return;
    lb.hidden = true;
    document.body.style.overflow = '';
    if (items[index]) items[index].focus({ preventScroll: true });
  }

  items.forEach(function (img, i) {
    var fig = img.closest('.g-item');
    if (!fig) return;
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('role', 'button');
    fig.setAttribute('aria-label', 'Şəkli böyüt: ' + (img.getAttribute('alt') || ''));
    fig.addEventListener('click', function () { openLb(i); });
    fig.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(i); }
    });
  });

  if (lbClose) lbClose.addEventListener('click', closeLb);
  if (lbPrev)  lbPrev.addEventListener('click', function (e) { e.stopPropagation(); openLb(index - 1); });
  if (lbNext)  lbNext.addEventListener('click', function (e) { e.stopPropagation(); openLb(index + 1); });

  if (lb) {
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });

    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') openLb(index - 1);
      else if (e.key === 'ArrowRight') openLb(index + 1);
    });

    /* Swipe (mobil) */
    var startX = null;
    lb.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 55) openLb(dx < 0 ? index + 1 : index - 1);
      startX = null;
    }, { passive: true });
  }

  /* ---------- 7. Yuxarı qalx ---------- */
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 8. Cari il ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 9. FAQ: bir anda bir açıq ---------- */
  var faqItems = $$('.faq-item');
  faqItems.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      faqItems.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ---------- 10. Rəsmi analitika (GA4) — ölçmə ID-ni əlavə edin ----------
  var GA_ID = ''; // məs: 'G-XXXXXXXXXX'
  if (GA_ID) { ... }
  ------------------------------------------------------------------------- */

  /* ---------- 11. Çoxdilli dəstək (AZ / RU / EN) ---------- */
  var I18N = {
    az: {
      whatsapp: "WhatsApp",
      nav_about: "Haqqında", nav_services: "Xidmətlər", nav_certs: "Sertifikatlar",
      nav_results: "Nəticələr", nav_exp: "İş təcrübəsi", nav_contact: "Əlaqə",
      teacher_of_year: "İlin müəllimi",
      hero_eyebrow: "Naxçıvan · Azərbaycan",
      hero_title: 'Naxçıvanda <span class="accent">Fitness Trainer</span> və Bodibildinq Məşqçisi',
      hero_lead: 'Salam, mən <strong>Ümid Babayev</strong>. Fitness və Bodibildinq Federasiyasının Naxçıvan üzrə regional direktoru, I dərəcəli idman ustası və beynəlxalq sertifikatlı personal trainer. Fərdi məşq, onlayn proqram, qidalanma və müsabiqə hazırlığı ilə hədəfinizə elmi yanaşma ilə çıxarıram.',
      hero_cta: "WhatsApp ilə məşqə yazıl",
      hero_secondary: "Nəticələrə bax",
      hero_point1: "5 Pro Card idmançısının müəllimi",
      hero_point2: "2 Avropa · 5 Azərbaycan çempionu",
      hero_point3: "10 Avrasiya / Asiya çempionu",
      stat1: "Pro Card idmançı", stat2: "Çempion tələbə",
      stat3: "Beynəlxalq sertifikat", stat4: "İş təcrübəsi olan klub",
      about_tag: "Haqqında", about_title: "Ümid Babayev kimdir?",
      about_p1: '<strong>Ümid Babayev</strong> — Fitness və Bodibildinq Federasiyasının <strong>Naxçıvan üzrə regional direktoru</strong>, <strong>I dərəcəli idman ustası</strong> və <em>Fitness Akademi «Master Class»</em> işinin ustasıdır. Fəaliyyətini Naxçıvanda fərdi məşq, onlayn koçluq və müsabiqə hazırlığı üzərində qurub.',
      about_p2: 'NASM, ASN, EREPS, INBA, Gentestdiet, AZFBF, ФББР və TVGFBF kimi nüfuzlu təşkilatların beynəlxalq sertifikatlarını <strong>fərqlənmə ilə</strong> tamamlayıb. 2023, 2024, 2025 və 2026-cı illərdə «İlin müəllimi» mükafatına layiq görülüb.',
      chip1: "Regional Direktor", chip2: "I dərəcəli idman ustası", chip3: "Personal Trainer",
      chip4: "Nutrigenetik analiz", chip5: "Müsabiqə hazırlığı", chip6: "Master Class təlimçisi",
      awards_tag: "Mükafatlar", awards_title: "Nailiyyətlər və mükafatlar",
      award2023_h: "İlin uğuru", award2024_h: "Beynəlxalq Altın Zirvə",
      award_p: "«İlin müəllimi» mükafatçısı.",
      champ1: "Pro Card-lı pro idmançı", champ2: "Avropa çempionu",
      champ3: "Naxçıvan çempionu", champ4: "Azərbaycan çempionu",
      champ5: "Avrasiya / Asiya çempionu",
      services_tag: "Xidmətlər", services_title: "Məşq və koçluq xidmətləri — Naxçıvan & onlayn",
      srv1_h: "Fərdi (PT) məşq — Naxçıvan",
      srv1_p: "Trenajor zalında birə-bir məşq: düzgün texnika, biomexanika, zədədən qorunma və mütəmadi ölçmələr.",
      srv2_h: "Onlayn məşq proqramı",
      srv2_p: "Fərdi hazırlanmış həftəlik plan, video-analiz və həftəlik nəzarət. Naxçıvandan kənarda olanlar üçün.",
      srv3_h: "Fərdi qidalanma planı",
      srv3_p: "Kilo idarəsi + nutrigenetik analiz (Gentestdiet) və NASM Nutrition Level 4 metodikası əsasında.",
      srv4_h: "Arıqlama & formalaşdırma",
      srv4_p: "Yağ yandırma, əzələ yığımı və bədən kompozisiyasının elmi yanaşma ilə dəyişdirilməsi.",
      srv5_h: "Müsabiqə hazırlığı",
      srv5_p: "Bodibildinq və fitness yarışlarına tam hazırlıq: peak week, posinqa, səhnə taktikası.",
      srv6_h: "Master Class / məşqçi təlimi",
      srv6_p: "Məşqçilər üçün beynəlxalq akreditasiyalı təlim proqramları və nəzəri-praktik seminarlar.",
      cert_tag: "Təhsil & Sertifikatlar", cert_title: "Beynəlxalq sertifikatlar və ixtisaslar",
      cert1: 'Fitness və Bodibildinq Federasiyasının <strong>Naxçıvan üzrə regional direktoru</strong>',
      cert2: '<strong>I dərəcəli idman ustası</strong>',
      cert3: 'Fitness Akademi «Master Class» işinin ustası',
      cert4: '<strong>EREPS</strong> «Master Class» — fərqlənmə ilə beynəlxalq professional personal trainer',
      cert5: '<strong>National Academy of Sports Medicine (NASM)</strong> təhsili — fərqlənmə ilə',
      cert6: '<strong>American Society for Nutrition (ASN)</strong> təhsili — fərqlənmə ilə',
      cert7: '«NASM» Record of Completion Association Nutrition <strong>Level 4</strong> — fərqlənmə ilə',
      cert8: '<strong>Gentestdiet</strong> kişiyə özəl kilo yönetimi + Nutrigenetik analiz — fərqlənmə ilə',
      cert9: '<strong>AZFBF</strong> Azərbaycan Fitness və Bodibildinq Federasiyası peşəkar məşqçisi — fərqlənmə ilə',
      cert10: '<strong>ФББР</strong> Rusiya Fitness və Bodibildinq Federasiyasının beynəlxalq akreditasiyalı məşqçisi — fərqlənmə ilə',
      cert11: '<strong>TVGFBF</strong> Türkiyə Fitness və Bodibildinq Federasiyasının 3-cü qədəməli məşqçisi',
      cert12: '<strong>INBA</strong> Natural Bodibildinq Federasiyası peşəkar məşqçisi — fərqlənmə ilə',
      cert13: '<strong>ADVENTURE Academy</strong> beynəlxalq dərəcəli rəsmi təlimçi diplomu',
      cert14: '«Fiziki Tərbiyə Müəllimləri Birliyi» Müəllimlər İdman Assosiasiyası tərəfindən üzv olaraq yüksək nəticə ilə təsdiqlənib',
      cert15: '<strong>VP Fitness Consulting</strong> (Rusiya) məşqçilikdə son mərhələ — fərqlənmə ilə',
      cert16: '<strong>İmpulse</strong> biotexnika, biomexanika və farmakologiya üzrə ilkin mərhələ — fərqlənmə ilə',
      cert_note: "Bütün sertifikatlar rəsmi sənədlərlə təsdiqlənir və tələb olunarsa təqdim edilir.",
      gallery_tag: "Tələbələr və Nəticələr", gallery_title: "Tələbələrim və real nəticələr",
      gallery_lead: "Naxçıvanda və onlayn formatda çalışdığım tələbələrin məşq prosesi, çempionat nəticələri və bədən transformasiyaları. Şəkillərə klikləyərək böyük ölçüdə baxa bilərsiniz.",
      tab_personal: "Şəxsi şəkillər", tab_results: "Tələbə nəticələri",
      exp_tag: "İş təcrübəsi", exp_title: "Çalışdığım idman klubları və fitness zalları",
      exp_lead: "Azərbaycan, Türkiyə və Rusiyada 40-dan çox nüfuzlu klub və fitness mərkəzində məşqçilik təcrübəsi.",
      faq_tag: "FAQ", faq_title: "Tez-tez verilən suallar",
      faq1_q: "Naxçıvanda fitness trainer kimdir?",
      faq1_a: 'Naxçıvanda peşəkar fitness trainer <strong>Ümid Babayev</strong>-dir. O, Fitness və Bodibildinq Federasiyasının Naxçıvan üzrə regional direktoru, I dərəcəli idman ustası və NASM, ASN, EREPS, INBA, AZFBF kimi beynəlxalq sertifikatlara sahib personal trainer-dir.',
      faq2_q: "Naxçıvanda personal trainer xidməti necə alınır?",
      faq2_a: 'Saytın sağ aşağı küncündəki WhatsApp ikonuna klikləyərək və ya <strong>060 600 66 99</strong> nömrəsinə yazaraq birbaşa əlaqə saxlaya bilərsiniz. İlk konsultasiyadan sonra sizə uyğun məşq və qidalanma planı hazırlanır.',
      faq3_q: "Onlayn məşq proqramı almaq mümkündürmü?",
      faq3_a: "Bəli. Naxçıvanda olmayan müştərilər üçün onlayn fərdi məşq proqramı, video-analiz, həftəlik nəzarət və qidalanma planı təqdim olunur.",
      faq4_q: "Müsabiqəyə hazırlıq üçün kimə müraciət edim?",
      faq4_a: 'Ümid Babayev <strong>5 Pro Card idmançısı, 2 Avropa, 5 Azərbaycan, 4 Naxçıvan və 10 Avrasiya/Asiya çempionunun</strong> müəllimidir. Bodibildinq və fitness müsabiqələrinə peşəkar hazırlıq üçün müraciət edə bilərsiniz.',
      faq5_q: "Arıqlama və əzələ yığımı proqramı varmı?",
      faq5_a: 'Bəli. Fərdi kilo idarəsi, <strong>nutrigenetik analiz (Gentestdiet)</strong> və NASM Nutrition Level 4 metodikası əsasında arıqlama, yağ yandırma və əzələ yığımı proqramları hazırlanır.',
      faq6_q: "Məşqlər hansı dillərdə aparılır?",
      faq6_a: "Məşqlər Azərbaycan, Türk və Rus dillərində aparılır.",
      contact_tag: "Əlaqə", contact_title: "Məşqlərə qoşulmaq üçün əlaqə saxla",
      contact_lead: "Ən sürətli yol — WhatsApp. Mesaj yazın, sizə uyğun proqramı birlikdə seçək.",
      wa_label: "WhatsApp", wa_action: "Birbaşa yaz →", view_profile: "Profilə bax →",
      cta_q: "Məşqlərə qoşulmaq istəyirsiniz?",
      cta_a: "WhatsApp-a yazın — Naxçıvanda fərdi məşq və onlayn proqram üçün ilk konsultasiya ödənişsizdir.",
      wa_write: "WhatsApp yaz",
      footer_sub: "Fitness Trainer & Bodibildinq Məşqçisi · Naxçıvan, Azərbaycan",
      copyright: '© <span id="year">2026</span> Ümid Babayev. Bütün hüquqlar qorunur.'
    },
    ru: {
      whatsapp: "WhatsApp",
      nav_about: "О нас", nav_services: "Услуги", nav_certs: "Сертификаты",
      nav_results: "Результаты", nav_exp: "Опыт работы", nav_contact: "Контакты",
      teacher_of_year: "Учитель года",
      hero_eyebrow: "Нахчыван · Азербайджан",
      hero_title: 'Фитнес-тренер и бодибилдинг-мастер в <span class="accent">Нахчыване</span>',
      hero_lead: 'Здравствуйте, я <strong>Умид Бабаев</strong>. Региональный директор Федерации фитнеса и бодибилдинга по Нахчывану, мастер спорта I степени и международный сертифицированный персональный тренер. Помогаю достичь цели научным подходом: персональные тренировки, онлайн-программы, питание и подготовка к соревнованиям.',
      hero_cta: "Записаться на тренировку в WhatsApp",
      hero_secondary: "Смотреть результаты",
      hero_point1: "Тренер 5 спортсменов Pro Card",
      hero_point2: "2 Чемпиона Европы · 5 Чемпионов Азербайджана",
      hero_point3: "10 Чемпионов Евразии / Азии",
      stat1: "Спортсмен Pro Card", stat2: "Чемпионов-учеников",
      stat3: "Международных сертификатов", stat4: "Клубов с опытом работы",
      about_tag: "О нас", about_title: "Кто такой Умид Бабаев?",
      about_p1: '<strong>Умид Бабаев</strong> — региональный директор Федерации фитнеса и бодибилдинга по <strong>Нахчывану</strong>, <strong>мастер спорта I степени</strong> и мастер дела <em>Фитнес-академии «Мастер Класс»</em>. Деятельность строится на персональных тренировках, онлайн-коучинге и подготовке к соревнованиям в Нахчыване.',
      about_p2: 'Завершил с отличием международные сертификаты таких авторитетных организаций, как NASM, ASN, EREPS, INBA, Gentestdiet, AZFBF, ФББР и TVGFBF. В 2023, 2024, 2025 и 2026 годах награждён премией «Учитель года».',
      chip1: "Региональный директор", chip2: "Мастер спорта I степени", chip3: "Персональный тренер",
      chip4: "Нутригенетический анализ", chip5: "Подготовка к соревнованиям", chip6: "Преподаватель Master Class",
      awards_tag: "Награды", awards_title: "Достижения и награды",
      award2023_h: "Успех года", award2024_h: "Международный золотой саммит",
      award_p: "Лауреат премии «Учитель года».",
      champ1: "Профессионал Pro Card", champ2: "Чемпион Европы",
      champ3: "Чемпион Нахчывана", champ4: "Чемпион Азербайджана",
      champ5: "Чемпион Евразии / Азии",
      services_tag: "Услуги", services_title: "Тренировки и коучинг — Нахчыван и онлайн",
      srv1_h: "Персональные (PT) тренировки — Нахчыван",
      srv1_p: "Индивидуальные тренировки в тренажёрном зале: правильная техника, биомеханика, профилактика травм и регулярные замеры.",
      srv2_h: "Программа онлайн-тренировок",
      srv2_p: "Индивидуально составленный недельный план, видеоанализ и еженедельный контроль. Для тех, кто находится за пределами Нахчывана.",
      srv3_h: "Персональный план питания",
      srv3_p: "Управление весом + нутригенетический анализ (Gentestdiet) и методология NASM Nutrition Level 4.",
      srv4_h: "Сушка и формирование",
      srv4_p: "Сжигание жира, набор мышечной массы и изменение состава тела научным подходом.",
      srv5_h: "Подготовка к соревнованиям",
      srv5_p: "Полная подготовка к соревнованиям по бодибилдингу и фитнесу: пик-неделя, позирование, сценическая тактика.",
      srv6_h: "Мастер-класс / обучение тренеров",
      srv6_p: "Международные аккредитованные программы обучения и теоретико-практические семинары для тренеров.",
      cert_tag: "Образование и сертификаты", cert_title: "Международные сертификаты и квалификации",
      cert1: '<strong>Региональный директор по Нахчывану</strong> Федерации фитнеса и бодибилдинга',
      cert2: '<strong>Мастер спорта I степени</strong>',
      cert3: 'Мастер дела Фитнес-академии «Мастер Класс»',
      cert4: '<strong>EREPS</strong> «Мастер Класс» — международный профессиональный персональный тренер с отличием',
      cert5: 'Образование <strong>National Academy of Sports Medicine (NASM)</strong> — с отличием',
      cert6: 'Образование <strong>American Society for Nutrition (ASN)</strong> — с отличием',
      cert7: '«NASM» Record of Completion Association Nutrition <strong>Level 4</strong> — с отличием',
      cert8: '<strong>Gentestdiet</strong> персональное управление весом + нутригенетический анализ — с отличием',
      cert9: '<strong>AZFBF</strong> профессиональный тренер Федерации фитнеса и бодибилдинга Азербайджана — с отличием',
      cert10: '<strong>ФББР</strong> международный аккредитованный тренер Федерации фитнеса и бодибилдинга России — с отличием',
      cert11: '<strong>TVGFBF</strong> тренер третьей ступени Федерации фитнеса и бодибилдинга Турции',
      cert12: '<strong>INBA</strong> профессиональный тренер Федерации натурального бодибилдинга — с отличием',
      cert13: '<strong>ADVENTURE Academy</strong> диплом официального инструктора международного уровня',
      cert14: 'Подтверждён членом Ассоциации учителей физкультуры с высоким результатом',
      cert15: '<strong>VP Fitness Consulting</strong> (Россия) последняя ступень тренерского мастерства — с отличием',
      cert16: '<strong>Импульс</strong> первая ступень по биотехнике, биомеханике и фармакологии — с отличием',
      cert_note: "Все сертификаты подтверждены официальными документами и предоставляются по запросу.",
      gallery_tag: "Ученики и результаты", gallery_title: "Мои ученики и реальные результаты",
      gallery_lead: "Процесс тренировок, результаты чемпионатов и трансформации тела учеников, с которыми я работаю в Нахчыване и онлайн. Нажмите на фото, чтобы посмотреть в большом размере.",
      tab_personal: "Личные фото", tab_results: "Результаты учеников",
      exp_tag: "Опыт работы", exp_title: "Спортивные клубы и фитнес-залы, где я работал",
      exp_lead: "Опыт тренерской работы в более чем 40 престижных клубах и фитнес-центрах Азербайджана, Турции и России.",
      faq_tag: "FAQ", faq_title: "Часто задаваемые вопросы",
      faq1_q: "Кто такой фитнес-тренер в Нахчыване?",
      faq1_a: 'Профессиональный фитнес-тренер в Нахчыване — <strong>Умид Бабаев</strong>. Он региональный директор Федерации фитнеса и бодибилдинга по Нахчывану, мастер спорта I степени и персональный тренер с международными сертификатами NASM, ASN, EREPS, INBA, AZFBF.',
      faq2_q: "Как получить услугу персонального тренера в Нахчыване?",
      faq2_a: 'Вы можете связаться напрямую, нажав на иконку WhatsApp в правом нижнем углу сайта или написав на номер <strong>060 600 66 99</strong>. После первой консультации для вас составят подходящий план тренировок и питания.',
      faq3_q: "Можно ли купить программу онлайн-тренировок?",
      faq3_a: "Да. Для клиентов, не находящихся в Нахчыване, предлагаются индивидуальные программы онлайн-тренировок, видеоанализ, еженедельный контроль и план питания.",
      faq4_q: "К кому обратиться для подготовки к соревнованиям?",
      faq4_a: 'Умид Бабаев — тренер <strong>5 спортсменов Pro Card, 2 чемпионов Европы, 5 чемпионов Азербайджана, 4 чемпионов Нахчывана и 10 чемпионов Евразии/Азии</strong>. Вы можете обратиться за профессиональной подготовкой к соревнованиям по бодибилдингу и фитнесу.',
      faq5_q: "Есть ли программа сушки и набора мышечной массы?",
      faq5_a: 'Да. На основе персонального управления весом, <strong>нутригенетического анализа (Gentestdiet)</strong> и методологии NASM Nutrition Level 4 составляются программы сушки, сжигания жира и набора мышечной массы.',
      faq6_q: "На каких языках проводятся тренировки?",
      faq6_a: "Тренировки проводятся на азербайджанском, турецком и русском языках.",
      contact_tag: "Контакты", contact_title: "Свяжитесь, чтобы присоединиться к тренировкам",
      contact_lead: "Самый быстрый способ — WhatsApp. Напишите сообщение, и мы вместе выберем подходящую программу.",
      wa_label: "WhatsApp", wa_action: "Написать напрямую →", view_profile: "Посмотреть профиль →",
      cta_q: "Хотите присоединиться к тренировкам?",
      cta_a: "Напишите в WhatsApp — первая консультация по персональным тренировкам в Нахчыване и онлайн-программам бесплатна.",
      wa_write: "Написать в WhatsApp",
      footer_sub: "Фитнес-тренер и бодибилдинг-мастер · Нахчыван, Азербайджан",
      copyright: '© <span id="year">2026</span> Умид Бабаев. Все права защищены.'
    },
    en: {
      whatsapp: "WhatsApp",
      nav_about: "About", nav_services: "Services", nav_certs: "Certificates",
      nav_results: "Results", nav_exp: "Experience", nav_contact: "Contact",
      teacher_of_year: "Teacher of the Year",
      hero_eyebrow: "Nakhchivan · Azerbaijan",
      hero_title: 'Fitness Trainer & Bodybuilding Coach in <span class="accent">Nakhchivan</span>',
      hero_lead: 'Hello, I am <strong>Umid Babayev</strong>. Regional Director of the Fitness and Bodybuilding Federation for Nakhchivan, Master of Sports I degree and an internationally certified personal trainer. I help you reach your goals with a scientific approach: personal training, online programs, nutrition and competition preparation.',
      hero_cta: "Sign up for training via WhatsApp",
      hero_secondary: "View results",
      hero_point1: "Coach of 5 Pro Card athletes",
      hero_point2: "2 European · 5 Azerbaijani champions",
      hero_point3: "10 Eurasian / Asian champions",
      stat1: "Pro Card athletes", stat2: "Champion students",
      stat3: "International certificates", stat4: "Clubs with work experience",
      about_tag: "About", about_title: "Who is Umid Babayev?",
      about_p1: '<strong>Umid Babayev</strong> is the <strong>Regional Director of the Fitness and Bodybuilding Federation for Nakhchivan</strong>, <strong>Master of Sports I degree</strong> and a master of his craft at the <em>Fitness Academy “Master Class”</em>. He focuses on personal training, online coaching and competition preparation in Nakhchivan.',
      about_p2: 'He completed international certifications with distinction from prestigious organizations such as NASM, ASN, EREPS, INBA, Gentestdiet, AZFBF, ФББР and TVGFBF. Awarded the “Teacher of the Year” prize in 2023, 2024, 2025 and 2026.',
      chip1: "Regional Director", chip2: "Master of Sports I degree", chip3: "Personal Trainer",
      chip4: "Nutrigenetic analysis", chip5: "Competition prep", chip6: "Master Class instructor",
      awards_tag: "Awards", awards_title: "Achievements and awards",
      award2023_h: "Success of the Year", award2024_h: "International Golden Summit",
      award_p: "“Teacher of the Year” award winner.",
      champ1: "Pro Card professional athlete", champ2: "European champion",
      champ3: "Nakhchivan champion", champ4: "Azerbaijan champion",
      champ5: "Eurasian / Asian champion",
      services_tag: "Services", services_title: "Training & coaching services — Nakhchivan & online",
      srv1_h: "Personal (PT) training — Nakhchivan",
      srv1_p: "One-on-one training in the gym: proper technique, biomechanics, injury prevention and regular measurements.",
      srv2_h: "Online training program",
      srv2_p: "Individually designed weekly plan, video analysis and weekly check-ins. For those outside Nakhchivan.",
      srv3_h: "Personal nutrition plan",
      srv3_p: "Weight management + nutrigenetic analysis (Gentestdiet) and NASM Nutrition Level 4 methodology.",
      srv4_h: "Cutting & shaping",
      srv4_p: "Fat burning, muscle building and body recomposition with a scientific approach.",
      srv5_h: "Competition preparation",
      srv5_p: "Full prep for bodybuilding and fitness competitions: peak week, posing, stage tactics.",
      srv6_h: "Master Class / trainer education",
      srv6_p: "Internationally accredited training programs and theory-practice seminars for coaches.",
      cert_tag: "Education & Certificates", cert_title: "International certificates and qualifications",
      cert1: '<strong>Regional Director for Nakhchivan</strong> of the Fitness and Bodybuilding Federation',
      cert2: '<strong>Master of Sports I degree</strong>',
      cert3: 'Master of the Fitness Academy “Master Class”',
      cert4: '<strong>EREPS</strong> “Master Class” — international professional personal trainer with distinction',
      cert5: '<strong>National Academy of Sports Medicine (NASM)</strong> education — with distinction',
      cert6: '<strong>American Society for Nutrition (ASN)</strong> education — with distinction',
      cert7: '“NASM” Record of Completion Association Nutrition <strong>Level 4</strong> — with distinction',
      cert8: '<strong>Gentestdiet</strong> personalized weight management + Nutrigenetic analysis — with distinction',
      cert9: '<strong>AZFBF</strong> professional coach of the Azerbaijan Fitness and Bodybuilding Federation — with distinction',
      cert10: '<strong>ФББР</strong> internationally accredited coach of the Russian Fitness and Bodybuilding Federation — with distinction',
      cert11: '<strong>TVGFBF</strong> 3rd-degree coach of the Turkish Fitness and Bodybuilding Federation',
      cert12: '<strong>INBA</strong> professional coach of the Natural Bodybuilding Federation — with distinction',
      cert13: '<strong>ADVENTURE Academy</strong> international-level official instructor diploma',
      cert14: 'Confirmed as a member of the Physical Education Teachers Association with high distinction',
      cert15: '<strong>VP Fitness Consulting</strong> (Russia) final stage of coaching — with distinction',
      cert16: '<strong>Impulse</strong> initial stage in biotechnology, biomechanics and pharmacology — with distinction',
      cert_note: "All certificates are confirmed by official documents and provided upon request.",
      gallery_tag: "Students & Results", gallery_title: "My students and real results",
      gallery_lead: "Training process, championship results and body transformations of students I work with in Nakhchivan and online. Click on photos to view in full size.",
      tab_personal: "Personal photos", tab_results: "Student results",
      exp_tag: "Experience", exp_title: "Sports clubs and gyms I have worked at",
      exp_lead: "Coaching experience at more than 40 prestigious clubs and fitness centers in Azerbaijan, Turkey and Russia.",
      faq_tag: "FAQ", faq_title: "Frequently asked questions",
      faq1_q: "Who is a fitness trainer in Nakhchivan?",
      faq1_a: 'The professional fitness trainer in Nakhchivan is <strong>Umid Babayev</strong>. He is the Regional Director of the Fitness and Bodybuilding Federation for Nakhchivan, Master of Sports I degree and a personal trainer with international certificates from NASM, ASN, EREPS, INBA, AZFBF.',
      faq2_q: "How do I get a personal trainer service in Nakhchivan?",
      faq2_a: 'You can contact directly by clicking the WhatsApp icon in the bottom-right corner of the site or by texting <strong>060 600 66 99</strong>. After the first consultation, a suitable training and nutrition plan will be prepared for you.',
      faq3_q: "Is it possible to get an online training program?",
      faq3_a: "Yes. For clients outside Nakhchivan, online personal training programs, video analysis, weekly check-ins and nutrition plans are offered.",
      faq4_q: "Who should I contact for competition preparation?",
      faq4_a: 'Umid Babayev is the coach of <strong>5 Pro Card athletes, 2 European, 5 Azerbaijani, 4 Nakhchivan and 10 Eurasian/Asian champions</strong>. You can contact him for professional preparation for bodybuilding and fitness competitions.',
      faq5_q: "Is there a cutting and muscle-building program?",
      faq5_a: 'Yes. Based on personal weight management, <strong>nutrigenetic analysis (Gentestdiet)</strong> and NASM Nutrition Level 4 methodology, cutting, fat-burning and muscle-building programs are prepared.',
      faq6_q: "In which languages are the training sessions conducted?",
      faq6_a: "Training sessions are conducted in Azerbaijani, Turkish and Russian.",
      contact_tag: "Contact", contact_title: "Get in touch to join the training",
      contact_lead: "The fastest way is WhatsApp. Send a message and we will choose the right program together.",
      wa_label: "WhatsApp", wa_action: "Message directly →", view_profile: "View profile →",
      cta_q: "Want to join the training?",
      cta_a: "Text on WhatsApp — the first consultation for personal training in Nakhchivan and online programs is free.",
      wa_write: "Message on WhatsApp",
      footer_sub: "Fitness Trainer & Bodybuilding Coach · Nakhchivan, Azerbaijan",
      copyright: '© <span id="year">2026</span> Umid Babayev. All rights reserved.'
    }
  };

  function applyLang(lang) {
    if (!I18N[lang]) lang = 'az';
    var dict = I18N[lang];
    $$('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (dict[key] != null) el.innerHTML = dict[key];
    });
    document.documentElement.lang = lang === 'az' ? 'az' : (lang === 'ru' ? 'ru' : 'en');
    var y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  var langSelect = $('#langSelect');
  var langMenu   = $('#langMenu');
  var langCurrent= $('#langCurrent');
  var savedLang = null;
  try { savedLang = localStorage.getItem('ub_lang'); } catch (e) {}
  if (savedLang && I18N[savedLang]) {
    applyLang(savedLang);
    setLangUI(savedLang);
  }

  function setLangUI(lang) {
    if (!I18N[lang]) lang = 'az';
    if (langCurrent) langCurrent.textContent = lang.toUpperCase();
    $$('.lang-option').forEach(function (o) {
      var active = o.getAttribute('data-lang') === lang;
      o.classList.toggle('active', active);
      o.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function closeLangMenu() {
    if (!langSelect || !langMenu) return;
    langSelect.setAttribute('aria-expanded', 'false');
    langMenu.hidden = true;
  }

  if (langSelect && langMenu) {
    langSelect.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = langSelect.getAttribute('aria-expanded') === 'true';
      langSelect.setAttribute('aria-expanded', open ? 'false' : 'true');
      langMenu.hidden = open;
    });

    $$('.lang-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        var lang = opt.getAttribute('data-lang');
        applyLang(lang);
        setLangUI(lang);
        closeLangMenu();
        try { localStorage.setItem('ub_lang', lang); } catch (e) {}
      });
    });

    document.addEventListener('click', function (e) {
      if (!langSelect.contains(e.target) && !langMenu.contains(e.target)) closeLangMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLangMenu();
    });
  }

  /* ---------- 12. Slayder naviqasiyası (prev/next) ---------- */
  function slideBy(track, dir) {
    var item = track.querySelector('.g-item');
    if (!item) return;
    var step = item.getBoundingClientRect().width + 12;
    track.scrollBy({ left: dir * step * 2, behavior: 'smooth' });
  }
  $$('.slider-wrap').forEach(function (wrap) {
    var track = wrap.querySelector('.slide-track');
    var prev = wrap.querySelector('.slide-prev');
    var next = wrap.querySelector('.slide-next');
    if (prev) prev.addEventListener('click', function () { slideBy(track, -1); });
    if (next) next.addEventListener('click', function () { slideBy(track, 1); });
  });

  /* ---------- Init ---------- */
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', spy);
  onScroll();
})();
