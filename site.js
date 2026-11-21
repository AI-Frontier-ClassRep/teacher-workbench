"use strict";

const scenes = {
  prep: {
    format: "Word 备课单", title: "先把这一课想透。",
    description: "围绕课题梳理教材与学情，推演学生可能遇到的困难，把课堂追问和活动安排写进一份可编辑的备课单。",
    samples: [["prep", "备课思路示例"]]
  },
  design: {
    format: "Word 教学设计", title: "从备课单写到教案。",
    description: "拖入已有的备课单，或说说自己的教学思路。继续细化目标、活动与评价，生成可修改的教学设计文档。",
    samples: [["designFront", "教学设计示例一"], ["designBack", "教学设计示例二"]]
  },
  slides: {
    format: "PowerPoint 课件", title: "按你的讲法排课件。",
    description: "从教学设计出发，组织页面、提问与图示，生成可继续编辑的课件。打开下方示例，可以查看课堂页面的排版与图示。",
    samples: [["slideOne", "课件示例一"], ["slideTwo", "课件示例二"], ["slideThree", "课件示例三"]]
  },
  images: {
    format: "教学配图", title: "把教材情境画出来。",
    description: "选定课文段落、实验现象或课堂活动，描述要让学生看见的细节，再生成和教材内容相符的配图。",
    samples: [["imageMain", "课文情境"], ["imageTop", "实验观察"], ["imageBottom", "课堂活动"]]
  },
  simulation: {
    format: "离线 HTML 实验", title: "把实验交给学生操作。",
    description: "描述实验和想观察的现象，生成可交互的仿真。把 HTML 文件带进课堂，调整参数、观察变化，再一起讨论。",
    samples: [["simulation", "实验装置示例"]]
  }
};

const tabs = [...document.querySelectorAll("[data-scene]")];
const panel = document.getElementById("studio-content");
const viewer = document.getElementById("viewer");
const fullImage = document.getElementById("viewer-image");
const originalLink = document.createElement("a");
originalLink.target = "_blank";
originalLink.rel = "noopener";
originalLink.textContent = "打开原图查看细节 ↗";
document.querySelector(".viewer-body").append(originalLink);

function sampleButton([file, label], multiple) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "sample";
  button.dataset.preview = "assets/example-" + file + ".webp";
  button.dataset.title = label;
  button.setAttribute("aria-label", "放大" + label);
  const image = document.createElement("img");
  image.src = button.dataset.preview;
  image.alt = "";
  const caption = document.createElement("span");
  caption.textContent = multiple ? label : "查看示例 ↗";
  button.append(image, caption);
  return button;
}

function showScene(tab) {
  const id = tab.dataset.scene;
  const scene = scenes[id];
  const label = tab.textContent.trim();
  for (const item of tabs) {
    item.setAttribute("aria-selected", String(item === tab));
    item.tabIndex = item === tab ? 0 : -1;
  }
  panel.setAttribute("aria-labelledby", tab.id);
  document.getElementById("screen-label").textContent = label;
  document.getElementById("format").textContent = scene.format;
  document.getElementById("scene-title").textContent = scene.title;
  document.getElementById("scene-desc").textContent = scene.description;
  const screen = document.getElementById("screen");
  screen.src = "assets/mac-" + id + ".webp";
  screen.alt = label + "桌面实机界面";
  const expand = document.getElementById("real-screen");
  expand.dataset.preview = screen.getAttribute("src");
  expand.dataset.scenePreview = id;
  expand.dataset.title = label + " · 桌面实机";
  expand.setAttribute("aria-label", "放大" + label + "实机截图");
  const samples = document.getElementById("sample-list");
  const multiple = scene.samples.length > 1;
  samples.classList.toggle("multi", multiple);
  samples.replaceChildren(...scene.samples.map(sample => sampleButton(sample, multiple)));
}

tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => showScene(tab));
  tab.addEventListener("keydown", event => {
    const next = { ArrowLeft: (i + tabs.length - 1) % tabs.length, ArrowRight: (i + 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    showScene(tabs[next]);
    tabs[next].focus();
  });
});

document.addEventListener("click", event => {
  const trigger = event.target.closest("[data-preview]");
  if (!trigger) return;
  const isQR = trigger.hasAttribute("data-qr");
  const { preview, title, scenePreview } = trigger.dataset;
  document.getElementById("viewer-title").textContent = title;
  fullImage.src = preview;
  fullImage.alt = title;
  fullImage.classList.toggle("screenshot-crop", Boolean(scenePreview));
  viewer.dataset.mode = isQR ? "qr" : "image";
  document.getElementById("save-card").hidden = !isQR;
  originalLink.hidden = isQR;
  originalLink.href = scenePreview ? "screenshot.html#" + scenePreview : preview;
  originalLink.textContent = scenePreview ? "在新标签页查看实机截图 ↗" : "打开原图查看细节 ↗";
  viewer.showModal();
  document.getElementById("viewer-close").focus();
});
document.getElementById("viewer-close").addEventListener("click", () => viewer.close());
viewer.addEventListener("click", event => { if (event.target === viewer) viewer.close(); });

document.getElementById("copy-id").addEventListener("click", async () => {
  const number = document.getElementById("profile-id");
  const status = document.getElementById("copy-status");
  try {
    await navigator.clipboard.writeText(number.textContent);
    status.textContent = "已复制";
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(number);
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = "号码已选中，可复制";
  }
});

const heroFilm = document.getElementById("hero-film");
const motionControl = document.getElementById("motion-control");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

function syncMotionControl() {
  motionControl.textContent = heroFilm.paused ? "播放动画" : "暂停动画";
}

function requestPlayback() {
  heroFilm.play().catch(() => {
    // Autoplay can be blocked on mobile. The poster and play button stay available.
    syncMotionControl();
  });
}

function applyMotionPreference() {
  if (motionPreference.matches) {
    heroFilm.pause();
    heroFilm.hidden = true;
    motionControl.hidden = true;
    return;
  }
  if (heroFilm.error) return;
  if (!heroFilm.hasAttribute("src")) heroFilm.src = heroFilm.dataset.src;
  heroFilm.hidden = false;
  motionControl.hidden = false;
  requestPlayback();
}

heroFilm.addEventListener("playing", () => {
  if (motionPreference.matches) {
    heroFilm.pause();
    return;
  }
  heroFilm.hidden = false;
  syncMotionControl();
});
heroFilm.addEventListener("pause", syncMotionControl);
heroFilm.addEventListener("error", () => {
  heroFilm.hidden = true;
  motionControl.hidden = true;
});
motionControl.addEventListener("click", () => {
  if (heroFilm.paused) requestPlayback();
  else heroFilm.pause();
});
motionPreference.addEventListener("change", applyMotionPreference);
applyMotionPreference();
