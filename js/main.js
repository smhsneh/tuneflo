import { fetchSongs, fallbackSongs } from "./utils.js";
import { createVisualizer } from "./visualizer.js";

const titleEl = document.getElementById("songTitle");
const artistEl = document.getElementById("songArtist");

const playImg = document.querySelector('img[alt="Play"]');
const prevImg = document.querySelector('img[alt="Previous"]');
const nextImg = document.querySelector('img[alt="Next"]');

const playBtn = playImg.parentElement;
const prevBtn = prevImg.parentElement;
const nextBtn = nextImg.parentElement;

const moodBtns = document.querySelectorAll("section button");

const vinyl = document.getElementById("vinyl");
const vinylGlow = document.getElementById("vinylGlow");

const ws = createVisualizer();

let playlist = [];
let current = 0;

let vinylSpin = gsap.to(vinyl, {
  rotate: 360,
  duration: 4,
  ease: "linear",
  repeat: -1,
  paused: true,
});

let glowPulse = gsap.to(vinylGlow, {
  scale: 1.2,
  opacity: 0.3,
  duration: 2,
  yoyo: true,
  repeat: -1,
  ease: "sine.inOut",
  paused: true,
});

function updateUI(track) {
  titleEl.textContent = track.title;
  artistEl.textContent = track.artist;
}

function loadTrack(i, autoplay = false) {
  current = i;
  const track = playlist[current];

  updateUI(track);
  ws.load(track.previewUrl);

  ws.un("ready");
  ws.once("ready", () => {
    if (autoplay) {
      ws.play();
      playImg.src = "assets/icons/pause.png";
      vinylSpin.play();
      glowPulse.play();
    } else {
      playImg.src = "assets/icons/play.png";
      vinylSpin.pause();
      glowPulse.pause();
    }
  });

  ws.un("finish");
  ws.on("finish", () => nextTrack());
}

function playPause() {
  ws.playPause();

  setTimeout(() => {
    if (ws.isPlaying()) {
      playImg.src = "assets/icons/pause.png";
      vinylSpin.play();
      glowPulse.play();
    } else {
      playImg.src = "assets/icons/play.png";
      vinylSpin.pause();
      glowPulse.pause();
    }
  }, 80);
}

function nextTrack() {
  current = (current + 1) % playlist.length;
  loadTrack(current, true);
}

function prevTrack() {
  current = (current - 1 + playlist.length) % playlist.length;
  loadTrack(current, true);
}

async function loadMood(mood) {
  gsap.to("main", { opacity: 0, duration: 0.3 });

  gsap.to("#bgImage", { opacity: 0.3, duration: 0.3 });

  titleEl.textContent = "loading…";
  artistEl.textContent = "";

  const term =
    mood === "chill" ? "ambient" : mood === "energetic" ? "electronic" : "80s";

  let songs = await fetchSongs(term);
  if (!songs.length) songs = fallbackSongs();

  playlist = songs;
  current = 0;
  const bg = document.getElementById("bgImage");

  if (mood === "chill") {
    bg.style.backgroundImage = "url('assets/bg/chill.jpg')";
  } else if (mood === "energetic") {
    bg.style.backgroundImage = "url('assets/bg/energetic.jpg')";
  } else {
    bg.style.backgroundImage = "url('assets/bg/retro.jpg')";
  }
  gsap.to("#bgImage", { opacity: 1, duration: 0.6 });

  setTimeout(() => {
    loadTrack(0, false);

    gsap.to("main", { opacity: 1, duration: 0.4 });
  }, 300);
}

playBtn.onclick = playPause;
nextBtn.onclick = nextTrack;
prevBtn.onclick = prevTrack;

moodBtns.forEach(
  (btn) => (btn.onclick = () => loadMood(btn.textContent.trim().toLowerCase()))
);

loadMood("retro");

const dustCanvas = document.getElementById("dustCanvas");
const ctx = dustCanvas.getContext("2d");

function resizeDust() {
  dustCanvas.width = window.innerWidth;
  dustCanvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeDust);
resizeDust();

const particles = Array.from({ length: 40 }).map(() => ({
  x: Math.random() * dustCanvas.width,
  y: Math.random() * dustCanvas.height,
  size: Math.random() * 2 + 1,
  speedX: Math.random() * 0.2 - 0.1,
  speedY: Math.random() * 0.2 - 0.1,
  opacity: Math.random() * 0.4 + 0.2,
}));

function drawDust() {
  ctx.clearRect(0, 0, dustCanvas.width, dustCanvas.height);

  particles.forEach((p) => {
    p.x += p.speedX;
    p.y += p.speedY;

    if (p.x < 0) p.x = dustCanvas.width;
    if (p.x > dustCanvas.width) p.x = 0;
    if (p.y < 0) p.y = dustCanvas.height;
    if (p.y > dustCanvas.height) p.y = 0;

    ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(drawDust);
}
drawDust();

const volumeSlider = document.getElementById("volumeSlider");

if (volumeSlider && ws.setVolume) {
  ws.setVolume(0.8);

  volumeSlider.addEventListener("input", (e) => {
    ws.setVolume(parseFloat(e.target.value));
  });
}
