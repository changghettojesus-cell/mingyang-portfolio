
(() => {
  const $ = selector => document.querySelector(selector);
  const all = selector => [...document.querySelectorAll(selector)];
  const roles = {
    meituan: { en:"Product Manager Intern", zh:"产品经理实习生" },
    amazon: { en:"Product Sales & Op", zh:"产品销售与运营" }
  };
  const dates = {
    polyu: "2022.09-2026.06", cuhk: "2026.09-2027.07",
    amazon: "2026.11-2027.05"
  };
  const courses = {
    cuhk: {
      en:["AI Algorithms","Computer Vision","Machine Intelligence","Advanced Artificial Intelligence","Mechanical Design"],
      zh:["AI 智能算法","计算机视觉","机器智能","高级人工智能","机械设计"]
    },
    polyu: {
      en:["Deep Learning","AI & Data Analysis","Large Language Models","Signal Processing","Marketing"],
      zh:["深度学习","人工智能与数据分析","AI 大模型","信号处理","市场营销"]
    }
  };
  const polyuEducation = {
    secondary: { en:"Secondary Major in Innovation and Entrepreneurship", zh:"第二主修：创新与创业" },
    summary: { en:"GPA 3.5/4.3 · Top 5% in Major.", zh:"GPA 3.5/4.3 · 专业排名前 5%。" }
  };
  const demoPhotos = {
    "tech-hill": { photo: "tech-hill-interface.png" },
    amazon: {
      photo: "amazon-reception.jpg",
      alt: { en:"Reception desk at Amazon HQ2 in Arlington", zh:"亚马逊阿灵顿第二总部前台" },
      photoCaption: { en:"Amazon HQ2, Arlington · Illustrative photo", zh:"亚马逊阿灵顿第二总部 · 示意配图" },
      photoCredit: "Lucas Jackson / Amazon"
    }
  };
  const data = new Map(window.bayEntries.map(entry => {
    const date = dates[entry.id];
    return [entry.id, {
      ...entry,
      ...(entry.id === "polyu" ? polyuEducation : {}),
      ...demoPhotos[entry.id],
      date: date ? { en: date, zh: date } : entry.date,
      role: roles[entry.id] ?? entry.role
    }];
  }));
  const stops = ["polyu","parkincare","tech-hill","brainco","g2000","meituan","cuhk","amazon"].map(id => data.get(id));
  const years = ["2022","2024","2024","2026","2026","2026","2026","2026"];
  const assets = "./assets/";
  const labels = {
    skip:["Skip to content","跳到正文"], about:["About","关于"], journey:["Journey","轨迹"], work:["Work","作品"], life:["Life","生活"],
    name:["Mingyang Chang","常明阳"],
    position:["Product Manager","产品经理"],
    education:["Education","教育"], experience:["Experience","经历"], focus:["Focus","方向"],
    focusLine:["AI-Native & AI-Empowered · User Insights · Commercial-Minded","AI 原生与 AI 赋能 · 用户洞察 · 商业思维"],
    email:["Email ↗","邮箱 ↗"], scroll:["Explore the journey","向下探索"], mapTitle:["Greater Bay Area","粤港澳大湾区"],
    scrollOrTap:["Scroll or select a stop","滚动或选择站点"], learnMore:["Learn more","了解更多"],
    workTitle:["Selected work","精选作品"], lifeTitle:["Outside work","工作之外"],
    lifeIntro:["Bookshops, unfamiliar streets and good meals along the way.","旧书店、陌生街巷，还有路上的好味道。"], top:["Back to top ↑","回到顶部 ↑"],
    keyCourses:["Key Courses","主要课程"],
    hkSource:["© Hong Kong SAR Government · HAD · DATA.GOV.HK","© 香港特区政府民政事务总署 · DATA.GOV.HK"],
    szSource:["© OpenStreetMap contributors","© OpenStreetMap 贡献者"],
    region:["Hong Kong / Shenzhen","香港 / 深圳"], hk:["Hong Kong","香港"], sz:["Shenzhen","深圳"], previous:["Previous stop","上一站"], next:["Next stop","下一站"]
  };
  const logos = { polyu:"polyu-logo.png", cuhk:"cuhk-logo.jpg" };
  const career = [
    ["tech-hill", "2024.10-2025.04", assets + "tech-hill-logo.png"],
    ["brainco", "2026.01-2026.04", assets + "brainco-logo.webp"],
    ["meituan", "2026.04-2026.08", assets + "meituan-logo.png"],
    ["amazon", dates.amazon, "amazon-logo.png"]
  ];
  const life = [
    ["life-bookshop.jpg","A bookshop stop","在旧书店停一停"],
    ["life-sunset.jpg","The sea at sundown","日落时分的海"],
    ["life-train.jpg","A city from the platform","站台上的城市一角"],
    ["life-mural.jpg","A mural found on a walk","散步遇见的壁画"],
    ["life-table.jpg","Something worth sharing","值得分享的一餐"],
    ["life-seaside.jpg","Time by the water","海边慢一点"]
  ];
  const points = $(".map-points");
  const ticks = $(".map-ticks");
  const track = $(".track");
  const journey = $(".journey");
  const canvas = $("#bay-map");
  const ctx = canvas.getContext("2d");
  const mapScreen = $(".map-screen");
  const caption = $(".journey-caption");
  const mapControls = $(".map-controls");
  const panel = $(".stop");
  let lang = "en";
  try { if (localStorage.getItem("mingyang-about-language") === "zh") lang = "zh"; } catch { /* 本地文件可直接预览。 */ }
  const t = key => labels[key][lang === "en" ? 0 : 1];
  const local = value => value?.[lang] ?? "";
  const target = entry => "#stop-" + entry.id;
  const detailId = entry => "detail-" + entry.id;
  const locationText = entry => local(entry.venue) + " · " + local(entry.address);

  const controls = stops.map((entry,index) => {
    const anchor = document.createElement("div");
    anchor.id = target(entry).slice(1);
    track.append(anchor);
    const pin = document.createElement("a");
    pin.className = "pin";
    pin.href = target(entry);
    pin.textContent = index + 1;
    points.append(pin);
    const tick = document.createElement("a");
    tick.href = target(entry);
    ticks.append(tick);
    return { anchor, pin, tick };
  });

  function media(entry, small = false) {
    const file = entry.image || logos[entry.id];
    const src = entry.photo || (file && assets + file);
    if (!src) return "";
    const cls = entry.fit === "contain" ? "contain" : logos[entry.id] ? "logo" : "";
    return '<img class="' + cls + '" src="' + src + '" alt="' + (entry.alt ? local(entry.alt) : local(entry.name)) + '"' + (small ? "" : ' loading="lazy"') + '>';
  }

  function renderStatic() {
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
    document.title = lang === "en" ? "Mingyang Chang · About" : "关于常明阳";
    $(".portrait img").alt = lang === "en" ? "Portrait of Mingyang Chang" : "常明阳的肖像";
    const button = $(".language");
    button.textContent = lang === "en" ? "中文" : "EN";
    button.setAttribute("aria-label", lang === "en" ? "切换至中文" : "Switch to English");
    all("[data-text]").forEach(node => { node.textContent = t(node.dataset.text); });
    all("[data-step]").forEach(button => button.setAttribute("aria-label", t(button.dataset.step === "-1" ? "previous" : "next")));
    $(".schools").innerHTML = ["cuhk","polyu"].map(id => {
      const entry = data.get(id);
      return '<a class="school-row" href="' + target(entry) + '">' +
        '<img class="school-mark" src="' + assets + logos[id] + '" alt="">' +
        '<span class="school-info"><b>' + local(entry.name) + '</b><span>' + local(entry.role) +
        '</span></span><small>' + local(entry.date) + '</small></a>';
    }).join("");
    $(".career-links").innerHTML = career.map(([id, date, logo]) => {
      const entry = data.get(id);
      const role = local(entry.role).split(" · ")[0].replace(/ Intern$|实习生$/u, "");
      return '<a href="' + target(entry) + '"><span class="career-company">' +
        '<span class="career-mark ' + id + '"><img src="' + logo + '" alt=""></span>' +
        '<b' + (id === "amazon" ? ' class="visually-hidden"' : "") + '>' + local(entry.short) + '</b></span><strong>' + role +
        '</strong><small class="career-date">' + date + '</small></a>';
    }).join("");
    $(".work-scenes").innerHTML = ["meituan","brainco","tech-hill","g2000","parkincare","amazon"]
      .map(id => renderExperience(data.get(id))).join("");
    $(".education-scenes").innerHTML = ["cuhk","polyu"]
      .map(id => renderExperience(data.get(id))).join("");
    $(".gallery").innerHTML = life.map(([file,en,zh]) => {
      const caption = lang === "en" ? en : zh;
      return '<figure><img src="' + assets + file + '" alt="' + caption +
        '" loading="lazy"><figcaption>' + caption + '</figcaption></figure>';
    }).join("");
    controls.forEach(({pin,tick},index) => {
      pin.setAttribute("aria-label", local(stops[index].name));
      tick.textContent = local(stops[index].short);
      tick.setAttribute("aria-label", local(stops[index].name) + ", " + local(stops[index].date));
    });
  }

  function renderExperience(entry) {
    const bullets = local(entry.points);
    const keyCourses = courses[entry.id]?.[lang];
    const image = media(entry);
    const photoCaption = local(entry.photoCaption || entry.alt) + (entry.photoCredit ? ' · ' + entry.photoCredit : '');
    const title = local(entry.type === "education" ? entry.name : entry.title);
    return '<article class="work-scene' + (image ? '' : ' text-scene') + '" id="' + detailId(entry) +
      '" tabindex="-1" aria-labelledby="' + detailId(entry) + '-title"><div><p class="eyebrow">' +
      local(entry.type === "education" ? entry.title : entry.name) + '</p><h3 id="' + detailId(entry) + '-title">' +
      title + '</h3><p class="dates">' + local(entry.role) + ' · ' + local(entry.date) +
      (entry.status ? ' · ' + local(entry.status) : '') + '</p>' +
      (entry.secondary ? '<p class="dates">' + local(entry.secondary) + '</p>' : '') +
      '<p>' + local(entry.summary) + '</p>' +
      (bullets ? '<ul>' + bullets.map(line => '<li>' + line + '</li>').join("") + '</ul>' : '') +
      (keyCourses ? '<div class="key-courses"><h4>' + t("keyCourses") + '</h4><ul>' +
        keyCourses.map(course => '<li>' + course + '</li>').join("") + '</ul></div>' : '') +
      '<p class="detail-location">' + locationText(entry) + '</p></div>' +
      (image ? '<figure>' + image + (photoCaption ? '<figcaption>' + photoCaption + '</figcaption>' : '') + '</figure>' : '') +
      '</article>';
  }

  let active = -1;
  let routeFrame;
  let routeStart = 0;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  function renderStop(index) {
    const entry = stops[index];
    const district = districtSets.find(group => group.city === entry.city)?.items
      .find(item => item.zh.replace(/区$/u,"") === stopDistricts[index]);
    panel.dataset.entry = entry.id;
    $(".stop-media").innerHTML = media(entry,true);
    $(".stop-copy").innerHTML = '<p class="stop-meta">' + t(entry.city) + (district ? " · " + district[lang] : "") +
      ' · ' + local(entry.date) + (entry.status ? ' · ' + local(entry.status) : '') +
      '</p><h3 id="stop-title">' + local(entry.short) + '</h3><p class="stop-role">' + local(entry.role) + '</p>' +
      (entry.secondary ? '<p class="stop-role secondary-major">' + local(entry.secondary) + '</p>' : '') +
      '<div class="stop-description"><p>' + local(entry.summary) + '</p><p class="stop-location">' +
      locationText(entry) + '</p>' +
      (entry.photoCaption ? '<p class="stop-photo-caption">' + local(entry.photoCaption) + '</p>' : '') +
      '</div><a class="stop-more" href="#' + detailId(entry) + '" aria-label="' +
      t("learnMore") + ' · ' + local(entry.name) + '">' + t("learnMore") + '<span aria-hidden="true"> ↓</span></a>';
    panel.scrollTop = 0;
    $(".year").textContent = years[index];
    $(".step-city").textContent = t(entry.city);
    $("[data-step='-1']").disabled = index === 0;
    $("[data-step='1']").disabled = index === stops.length - 1;
    controls.forEach(({pin,tick},item) => {
      [pin,tick].forEach(node => {
        if (item === index) node.setAttribute("aria-current","step");
        else node.removeAttribute("aria-current");
      });
    });
    const changed = active !== index;
    active = index;
    if (changed && !reduceMotion.matches) {
      cancelAnimationFrame(routeFrame);
      routeStart = performance.now();
      animateRoute();
    } else {
      drawMap();
    }
  }

  function animateRoute() {
    drawMap();
    if (performance.now() - routeStart < 430) routeFrame = requestAnimationFrame(animateRoute);
  }


  const districtSets = [
    { city: "sz", items: window.shenzhenDistricts ?? [] },
    { city: "hk", items: window.hongKongDistricts ?? [] }
  ];
  const districtColors = [
    ["#2d2820", "#28241f", "#332b23", "#2b2821"],
    ["#2b2b23", "#272820", "#2e2d25", "#292a23"]
  ];
  const stopDistricts = ["九龙城","湾仔","深水埗","南山","葵青","龙华","沙田","南山"];
  const extent = [113.69,22.13,114.66,22.88];
  const districtNames = ["九龙城","湾仔","深水埗","南山","葵青","龙华","沙田"];
  let baseMap = null;
  let labelsKey = "";
  function mapProjection(width, height) {
    const mobile = width <= 600;
    const left = mobile ? 7 : width * .34;
    const right = width - (mobile ? 7 : width * .045);
    const compact = mobile && height <= 690;
    const top = compact ? caption.offsetTop + caption.offsetHeight + 12 : mobile ? 128 : height * .135;
    const bottom = compact ? Math.max(top + 92,panel.offsetTop - 22) :
      Math.max(top + 120,mobile ? height - Math.max(218,height * .32) : height * .85);
    const [west, south, east, north] = extent;
    const centerLon = (west + east) / 2;
    const centerLat = (south + north) / 2;
    const cosLat = Math.cos(centerLat * Math.PI / 180);
    const scale = Math.min((right-left)/((east-west)*cosLat), (bottom-top)/(north-south));
    return {
      mobile, left, right, top, bottom,
      x: lon => (left+right)/2 + (lon-centerLon)*scale*cosLat,
      y: lat => (top+bottom)/2 - (lat-centerLat)*scale
    };
  }

  function districtPaths(projection) {
    const { x, y } = projection;
    function makePath(polygons) {
      const path = new Path2D();
      for (const polygon of polygons) {
        for (const ring of polygon) {
          ring.forEach(([lon,lat],index) => {
            if (index === 0) path.moveTo(x(lon),y(lat));
            else path.lineTo(x(lon),y(lat));
          });
          path.closePath();
        }
      }
      return path;
    }
    return {
      land: makePath(window.bayLand),
      hongKongLand: makePath(window.hongKongLand ?? []),
      districts: districtSets.flatMap(({city, items}, group) => items.map((district,index) => ({
        ...district, city, path:makePath(district.polygons), color:districtColors[group][index%4]
      })))
    };
  }

  function drawBasemap(width, height, ratio, projection) {
    const { left, right, top, bottom } = projection;
    const key = [width,height,ratio,active,top,bottom,left,right].join(":");
    if (baseMap?.key === key) return baseMap;
    const geometryKey = [width,height,top,bottom,left,right].join(":");
    const geometry = baseMap?.geometryKey === geometryKey ? baseMap.geometry : districtPaths(projection);
    const bitmap = document.createElement("canvas");
    bitmap.width = canvas.width;
    bitmap.height = canvas.height;
    const layer = bitmap.getContext("2d");
    layer.scale(ratio,ratio);


    layer.save();
    layer.beginPath();
    layer.rect(left-18,top-21,right-left+36,bottom-top+42);
    layer.clip();
    layer.fillStyle = "#221e18";
    layer.strokeStyle = "#655845";
    layer.lineWidth = .8;
    layer.fill(geometry.land,"evenodd");
    layer.stroke(geometry.land);
    const hasHongKongCoast = Boolean(window.hongKongLand?.length);
    if (hasHongKongCoast) {
      layer.globalCompositeOperation = "destination-out";
      layer.fillStyle = "#000";
      for (const district of geometry.districts) {
        if (district.city === "hk") layer.fill(district.path,"evenodd");
      }
      layer.globalCompositeOperation = "source-over";
      layer.fillStyle = "#24241d";
      layer.fill(geometry.hongKongLand,"evenodd");
    }
    for (const district of geometry.districts) {
      layer.save();
      if (district.city === "hk" && hasHongKongCoast) layer.clip(geometry.hongKongLand,"evenodd");
      layer.fillStyle = district.color;
      layer.fill(district.path,"evenodd");
      layer.strokeStyle = "#9b896e";
      layer.lineWidth = .9;
      layer.stroke(district.path);
      layer.restore();
    }
    const highlight = geometry.districts.find(district => district.zh.replace(/区$/u,"") === stopDistricts[active]);
    if (highlight) {
      layer.save();
      if (highlight.city === "hk" && hasHongKongCoast) layer.clip(geometry.hongKongLand,"evenodd");
      layer.fillStyle = "#d098543f";
      layer.strokeStyle = "#b78a5c";
      layer.lineWidth = 1.15;
      layer.fill(highlight.path,"evenodd");
      layer.stroke(highlight.path);
      layer.restore();
    }
    if (hasHongKongCoast) {
      layer.strokeStyle = "#7d715d";
      layer.lineWidth = .7;
      layer.stroke(geometry.hongKongLand);
    }

    // 保留海岸与区界细节，柔化地图视口边缘。
    const edges = [
      [left-18,0,left+22,0,left-18,0,40,height],
      [right+18,0,right-18,0,right-18,0,36,height],
      [0,top-21,0,top+17,0,top-21,width,38],
      [0,bottom+21,0,bottom-18,0,bottom-18,width,39]
    ];
    layer.globalCompositeOperation = "destination-out";
    for (const [a,b,c,d,ex,ey,ew,eh] of edges) {
      const fade = layer.createLinearGradient(a,b,c,d);
      fade.addColorStop(0,"#000");
      fade.addColorStop(1,"#0000");
      layer.fillStyle = fade;
      layer.fillRect(ex,ey,ew,eh);
    }
    layer.restore();
    baseMap = { key, geometryKey, geometry, bitmap };
    return baseMap;
  }

  const labelOffsets = [[0,0]];
  for (let radius = 4; radius <= 48; radius += 4) {
    const count = Math.ceil(radius * Math.PI / 3);
    for (let index = 0; index < count; index++) {
      const angle = index * 2 * Math.PI / count;
      labelOffsets.push([radius * Math.cos(angle),radius * Math.sin(angle)]);
    }
  }
  const labelContext = document.createElement("canvas").getContext("2d");

  function showMapLabels(projection, geometry, pins) {
    const { x, y, left, right, top, bottom } = projection;
    const occupied = pins.map(([px,py]) => [px-19,py-19,px+19,py+19]);
    const labels = [...geometry.districts]
      .sort((a,b) => Number(districtNames.includes(b.zh.replace(/区$/u,""))) - Number(districtNames.includes(a.zh.replace(/区$/u,""))));
    labels.push({ center:[113.81,22.405], en:"Pearl River Estuary", zh:"珠江口" });

    const layer = $(".map-labels");
    const nodes = labels.map(district => {
      const label = document.createElement("span");
      label.className = "place " + (district.path ? "district" : "water");
      label.textContent = district[lang];
      label.style.visibility = "hidden";
      return label;
    });
    layer.replaceChildren(...nodes);
    const sizes = nodes.map(node => node.getBoundingClientRect());

    function fitsLand(district, px, py, halfWidth, halfHeight) {
      if (!district.path) return true;
      for (const row of [-1,0,1]) {
        for (const column of [-1,-.5,0,.5,1]) {
          const sx = px + column * halfWidth;
          const sy = py + row * halfHeight;
          if (!labelContext.isPointInPath(district.path,sx,sy,"evenodd")) return false;
          if (district.city === "hk" && window.hongKongLand?.length &&
              !labelContext.isPointInPath(geometry.hongKongLand,sx,sy,"evenodd")) return false;
        }
      }
      return true;
    }

    for (const [index,district] of labels.entries()) {
      const { center } = district;
      const node = nodes[index];
      const { width, height } = sizes[index];
      const originX = x(center[0]);
      const originY = y(center[1]);
      const offsets = district.path ? labelOffsets : [[0,0]];
      const findPosition = padding => offsets.find(([dx,dy]) => {
        const px = originX + dx;
        const py = originY + dy;
        const halfWidth = width / 2 + 2.5;
        const halfHeight = height / 2 + 2.5;
        const rect = [px-halfWidth,py-halfHeight,px+halfWidth,py+halfHeight];
        if (rect[0] < left || rect[2] > right || rect[1] < top-5 || rect[3] > bottom+9 ||
            occupied.some(([a,b,c,d]) => rect[0]<c && rect[2]>a && rect[1]<d && rect[3]>b)) return false;
        if (!fitsLand(district,px,py,halfWidth+padding,halfHeight+padding)) return false;
        occupied.push(rect);
        return true;
      });
      const position = findPosition(projection.mobile ? 3 : 9) ?? findPosition(0);
      if (!position) {
        node.remove();
        continue;
      }
      node.style.left = (originX + position[0]) + "px";
      node.style.top = (originY + position[1]) + "px";
      node.style.visibility = "";
    }
  }

  function drawMap() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height || active < 0) return;
    const ratio = Math.min(devicePixelRatio || 1,2);
    const pixelWidth = Math.round(width * ratio);
    const pixelHeight = Math.round(height * ratio);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    ctx.setTransform(ratio,0,0,ratio,0,0);
    ctx.clearRect(0,0,width,height);
    mapScreen.style.setProperty("--caption-end",caption.offsetTop + caption.offsetHeight + 10 + "px");
    mapScreen.style.setProperty("--controls-top",mapControls.offsetTop + "px");
    const projection = mapProjection(width,height);
    const { x, y, mobile } = projection;
    const { bitmap, geometry } = drawBasemap(width,height,ratio,projection);
    ctx.drawImage(bitmap,0,0,width,height);
    const knots = stops.map(({coords}) => [x(coords[0]),y(coords[1])]);
    if (!mobile) {
      const [px,py] = knots[active];
      const startX = panel.offsetLeft + panel.offsetWidth;
      const startY = panel.offsetTop + panel.offsetHeight / 2;
      if (px > startX + 30) {
        ctx.beginPath();
        ctx.moveTo(startX,startY);
        ctx.lineTo(startX+19,startY);
        ctx.lineTo(px-20,py);
        ctx.lineTo(px,py);
        ctx.strokeStyle = "#a9917566";
        ctx.lineWidth = .8;
        ctx.stroke();
      }
    }
    for (let index=1; index<=active; index++) {
      const [a,b] = knots[index-1];
      const [c,d] = knots[index];
      const bend = Math.min(34, Math.hypot(c-a,d-b)*.2);
      ctx.beginPath();
      ctx.moveTo(a,b);
      const controlX = (a+c)/2+bend;
      const controlY = (b+d)/2-bend;
      const elapsed = Math.min(1, (performance.now() - routeStart) / 430);
      const fraction = index === active && routeStart && !reduceMotion.matches ? 1-(1-elapsed)**3 : 1;
      const middleX = a + (controlX-a)*fraction;
      const middleY = b + (controlY-b)*fraction;
      const otherX = controlX + (c-controlX)*fraction;
      const otherY = controlY + (d-controlY)*fraction;
      ctx.quadraticCurveTo(middleX,middleY,middleX+(otherX-middleX)*fraction,middleY+(otherY-middleY)*fraction);
      ctx.strokeStyle = index === active ? "#e8ac68" : "#aa7959a8";
      ctx.lineWidth = index === active ? 1.8 : 1;
      if (index === active) {
        ctx.shadowColor = "#ec9e51";
        ctx.shadowBlur = 9;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    const boxes = [];
    controls.forEach(({pin},index) => {
      const [px,py] = knots[index];
      const [dx,dy] = mobile ? stops[index].mobileOffset : stops[index].offset;
      const bx = px + dx * (mobile ? .88 : .8);
      const by = py + dy * (mobile ? .85 : .8);
      pin.style.left = bx + "px";
      pin.style.top = by + "px";
      pin.style.zIndex = index === active ? 2 : 1;
      boxes.push([bx,by]);
      ctx.strokeStyle = index === active ? "#e8ac68" : "#826f59";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px,py);
      ctx.lineTo(bx,by);
      ctx.stroke();
      ctx.fillStyle = index <= active ? "#e8ac68" : "#a18c72";
      ctx.beginPath();
      ctx.arc(px,py,index === active ? 4 : 2,0,Math.PI*2);
      ctx.fill();
    });
    const nextLabelsKey = [width,height,lang,projection.left,projection.top,projection.bottom].join(":");
    if (labelsKey !== nextLabelsKey) {
      showMapLabels(projection,geometry,boxes);
      labelsKey = nextLabelsKey;
    }
  }
  let frame;
  function syncScroll() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const total = document.documentElement.scrollHeight - innerHeight;
      $(".progress i").style.width = (total > 0 ? scrollY/total*100 : 0) + "%";
      const currentChapter = all(".chapter").filter(section => section.getBoundingClientRect().top <= innerHeight*.35).at(-1);
      all("[data-nav]").forEach(link => {
        if (link.dataset.nav === currentChapter?.id) link.setAttribute("aria-current","location");
        else link.removeAttribute("aria-current");
      });
      const stepHeight = controls[0].anchor.offsetHeight;
      const index = Math.max(0,Math.min(stops.length-1,Math.floor((12 - journey.getBoundingClientRect().top)/stepHeight)));
      if (index !== active) renderStop(index);
    });
  }

  $(".language").addEventListener("click", () => {
    lang = lang === "en" ? "zh" : "en";
    try { localStorage.setItem("mingyang-about-language",lang); } catch { /* 本地文件仍可切换。 */ }
    const detail = location.hash.startsWith("#detail-") ? location.hash : "";
    renderStatic();
    renderStop(Math.max(0,active));
    if (detail) document.getElementById(detail.slice(1))?.scrollIntoView({ behavior:"instant" });
    syncScroll();
  });
  all("[data-step]").forEach(button => button.addEventListener("click", () => {
    controls[active + Number(button.dataset.step)]?.tick.click();
  }));
  window.addEventListener("scroll",syncScroll,{passive:true});
  window.addEventListener("resize", () => { drawMap(); syncScroll(); });
  renderStatic();
  const initial = stops.findIndex(entry => target(entry) === location.hash);
  renderStop(Math.max(0,initial));
  syncScroll();
})();
