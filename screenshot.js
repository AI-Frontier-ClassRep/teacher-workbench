const name = location.hash.slice(1);
if (["prep", "design", "slides", "images", "simulation"].includes(name)) {
  const screenshot = document.getElementById("screenshot");
  screenshot.src = "assets/mac-" + name + ".webp";
  screenshot.hidden = false;
  document.getElementById("back").hidden = true;
}
