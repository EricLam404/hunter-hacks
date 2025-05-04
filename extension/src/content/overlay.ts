const imageUrl = chrome.runtime.getURL("assets/eye.png");

const img = document.createElement("img");
img.src = imageUrl;
img.alt = "Study Helper";
img.style.position = "fixed";
img.style.top = "5px";
img.style.right = "20px";
img.style.width = "100px";
img.style.zIndex = "999999999";
img.style.pointerEvents = "none";
img.style.transform = "scale(1.5)";
img.style.transformOrigin = "top right";
document.body.appendChild(img);
