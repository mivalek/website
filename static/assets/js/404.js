document.getElementById("background").classList.add("scaled");
const lol = document.getElementById("lol");
lol.style.top = Math.round(Math.random() * 100) + 100 + "px";
lol.style.left = Math.round(Math.random() * 100) + 10 + "px";
let rotX = Math.round(Math.random() * 100);
let rotY = Math.round(Math.random() * 100);
let rotZ = Math.round(Math.random() * 100);
let transZ = 0;

let deltaX = 1,
    deltaY = 1,
    rotate = (Math.random() > 0.5) * 2 - 1;
setInterval(() => {
    const screen = document.getElementById("body").getBoundingClientRect();
    const lolRect = lol.getBoundingClientRect();
    if (lolRect.x + lolRect.width >= screen.width) {
        deltaX = -1;
        rotate *= -1;
    }
    if (lolRect.y + lolRect.height >= screen.height) {
        deltaY = -1;
        rotate *= -1;
    }
    if (lolRect.x <= 0) {
        deltaX = 1;
        rotate *= -1;
    }
    if (lolRect.y <= 0) {
        deltaY = 1;
        rotate *= -1;
    }
    lol.style.top = +lol.style.top.replace("px", "") + deltaY + "px";
    lol.style.left = +lol.style.left.replace("px", "") + deltaX + "px";
    rotX += rotate / 3;
    rotY += rotate / 2;
    rotZ += rotate;
    transZ += deltaY / 2;
    lol.style.transform = `rotateY(${rotY}deg) rotateZ(${rotZ}deg) translateZ(${transZ}px)`;
}, 20);
