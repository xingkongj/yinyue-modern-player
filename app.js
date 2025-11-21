const body = document.body
const themeToggle = document.getElementById('themeToggle')
const fileInput = document.getElementById('fileInput')
const dirSelect = document.getElementById('dirSelect')
const dirLabel = document.getElementById('dirLabel')
const audio = document.getElementById('audio')
const playBtn = document.getElementById('play')
const playIcon = document.getElementById('playIcon')
const pauseIcon = document.getElementById('pauseIcon')
const prevBtn = document.getElementById('prev')
const nextBtn = document.getElementById('next')
const rewindBtn = document.getElementById('rewind')
const forwardBtn = document.getElementById('forward')
const trackTitle = document.getElementById('trackTitle')
const trackMeta = document.getElementById('trackMeta')
const currentTimeEl = document.getElementById('currentTime')
const durationEl = document.getElementById('duration')
const progressBar = document.getElementById('progressBar')
const progressFill = document.getElementById('progressFill')
const progressGlow = document.getElementById('progressGlow')
const playlistEl = document.getElementById('playlist')
const visualizer = document.getElementById('visualizer')
const knob = document.getElementById('knob')
const knobIndicator = knob.querySelector('.knob-indicator')
const volumeValue = document.getElementById('volumeValue')

let ctx
let analyser
let sourceNode
let rafId
let tracks = []
let currentIndex = -1
let draggingProgress = false
let knobDragging = false
let dirHandle = null

function formatTime(s) {
  if (!isFinite(s)) return '00:00'
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`
}

function setPlayState(playing) {
  if (playing) { playIcon.style.display = 'none'; pauseIcon.style.display = 'block' }
  else { playIcon.style.display = 'block'; pauseIcon.style.display = 'none' }
}

function renderPlaylist() {
  playlistEl.innerHTML = ''
  tracks.forEach((t, i) => {
    const li = document.createElement('li')
    li.className = 'playlist-item' + (i === currentIndex ? ' active' : '')
    const play = document.createElement('button')
    play.className = 'playlist-btn'
    play.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>'
    const title = document.createElement('div')
    title.className = 'playlist-title'
    title.textContent = t.title || '未知标题'
    const meta = document.createElement('div')
    meta.className = 'playlist-meta'
    meta.textContent = t.meta || ''
    const right = document.createElement('div')
    right.style.display = 'flex'
    right.style.gap = '8px'
    right.appendChild(play)
    const wrap = document.createElement('div')
    wrap.style.display = 'grid'
    wrap.style.gap = '2px'
    wrap.appendChild(title)
    wrap.appendChild(meta)
    li.appendChild(wrap)
    li.appendChild(right)
    li.addEventListener('click', () => selectTrack(i))
    play.addEventListener('click', (e) => { e.stopPropagation(); selectTrack(i); togglePlay() })
    playlistEl.appendChild(li)
  })
}

function selectTrack(i) {
  currentIndex = i
  const t = tracks[i]
  audio.src = t.url
  trackTitle.textContent = t.title || '未命名歌曲'
  trackMeta.textContent = t.meta || ''
  renderPlaylist()
}

function togglePlay() {
  if (!audio.src) return
  if (audio.paused) audio.play(); else audio.pause()
}

function prev() {
  if (tracks.length === 0) return
  const i = currentIndex <= 0 ? tracks.length - 1 : currentIndex - 1
  selectTrack(i)
  audio.play()
}

function next() {
  if (tracks.length === 0) return
  const i = currentIndex >= tracks.length - 1 ? 0 : currentIndex + 1
  selectTrack(i)
  audio.play()
}

function rewind() {
  if (!audio.src) return
  audio.currentTime = Math.max(0, audio.currentTime - 10)
}

function forward() {
  if (!audio.src) return
  audio.currentTime = Math.min(audio.duration || audio.currentTime + 10, audio.currentTime + 10)
}

function updateProgress() {
  const c = audio.currentTime || 0
  const d = audio.duration || 0
  const p = d ? c / d : 0
  progressFill.style.width = `${p * 100}%`
  currentTimeEl.textContent = formatTime(c)
  durationEl.textContent = formatTime(d)
}

function initAudioGraph() {
  if (ctx) return
  ctx = new AudioContext()
  analyser = ctx.createAnalyser()
  analyser.fftSize = 2048
  sourceNode = ctx.createMediaElementSource(audio)
  sourceNode.connect(analyser)
  analyser.connect(ctx.destination)
}

function drawVisualizer() {
  const c = visualizer
  const g = c.getContext('2d')
  const w = c.width = c.clientWidth
  const h = c.height = c.clientHeight
  const buf = new Uint8Array(analyser.frequencyBinCount)
  g.clearRect(0,0,w,h)
  analyser.getByteFrequencyData(buf)
  const bars = 64
  const step = Math.floor(buf.length / bars)
  for (let i = 0; i < bars; i++) {
    const v = buf[i * step] / 255
    const bh = v * h
    const x = (i / bars) * w
    const bw = w / bars - 4
    const grad = g.createLinearGradient(x, h - bh, x, h)
    grad.addColorStop(0, '#22D3EE')
    grad.addColorStop(0.5, '#7A5CFA')
    grad.addColorStop(1, '#4D7CFE')
    g.fillStyle = grad
    g.fillRect(x + 2, h - bh, bw, bh)
    g.fillStyle = 'rgba(255,255,255,0.25)'
    g.beginPath()
    g.arc(x + bw / 2 + 2, h - bh, 2 + v * 3, 0, Math.PI * 2)
    g.fill()
  }
}

function animate() {
  if (!ctx || audio.paused) { cancelAnimationFrame(rafId); body.style.filter = 'none'; return }
  drawVisualizer()
  const buf = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteFrequencyData(buf)
  let sum = 0
  for (let i = 0; i < buf.length; i++) sum += buf[i]
  const energy = sum / (buf.length * 255)
  const b = 1 + energy * 0.12
  const s = 1 + energy * 0.08
  body.style.filter = `brightness(${b}) saturate(${s})`
  rafId = requestAnimationFrame(animate)
}

function setVolumeFromAngle(a) {
  const min = -135
  const max = 135
  const clamped = Math.max(min, Math.min(max, a))
  const ratio = (clamped - min) / (max - min)
  audio.volume = ratio
  knobIndicator.style.transform = `translate(-50%, -100%) rotate(${clamped}deg)`
  volumeValue.textContent = Math.round(ratio * 100)
}

function angleFromEvent(e) {
  const rect = knob.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - cx
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - cy
  let deg = Math.atan2(y, x) * 180 / Math.PI + 90
  if (deg > 180) deg -= 360
  if (deg < -180) deg += 360
  return deg
}

async function pickDirectory() {
  if (!window.showDirectoryPicker) { dirLabel.textContent = '浏览器不支持目录选择'; return }
  try {
    dirHandle = await window.showDirectoryPicker()
    const p = await dirHandle.requestPermission({ mode: 'readwrite' })
    if (p !== 'granted') { dirLabel.textContent = '未授予写入权限'; return }
    dirLabel.textContent = '已选择目录'
    await loadDirTracks()
  } catch {}
}

function sanitizeName(name) {
  return name.replace(/[\\/:*?"<>|]/g, '_')
}

async function saveToDir(file) {
  if (!dirHandle) return null
  const ext = file.name.split('.').pop()
  const base = file.name.slice(0, -(ext.length + 1))
  const name = sanitizeName(`${base}-${Date.now()}.${ext}`)
  const fh = await dirHandle.getFileHandle(name, { create: true })
  const w = await fh.createWritable()
  await w.write(await file.arrayBuffer())
  await w.close()
  const saved = await fh.getFile()
  const url = URL.createObjectURL(saved)
  return { url, name, size: saved.size }
}

async function loadDirTracks() {
  if (!dirHandle) return
  try {
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file' && /\.(mp3|aac|wav)$/i.test(entry.name)) {
        const f = await entry.getFile()
        const url = URL.createObjectURL(f)
        tracks.push({ title: entry.name, url, meta: `${(f.size/1024/1024).toFixed(2)} MB` })
      }
    }
    renderPlaylist()
    playlistEl.scrollTo({ top: playlistEl.scrollHeight, behavior: 'smooth' })
  } catch {}
}

themeToggle.addEventListener('click', () => {
  const mode = body.getAttribute('data-theme') === 'light' ? null : 'light'
  if (mode) body.setAttribute('data-theme', mode)
  else body.removeAttribute('data-theme')
})

playBtn.addEventListener('click', togglePlay)
prevBtn.addEventListener('click', prev)
nextBtn.addEventListener('click', next)
rewindBtn.addEventListener('click', rewind)
forwardBtn.addEventListener('click', forward)

audio.addEventListener('play', () => { setPlayState(true); initAudioGraph(); animate() })
audio.addEventListener('pause', () => { setPlayState(false) })
audio.addEventListener('timeupdate', updateProgress)
audio.addEventListener('loadedmetadata', updateProgress)
audio.addEventListener('ended', next)

progressBar.addEventListener('mousedown', e => { draggingProgress = true; seek(e) })
window.addEventListener('mousemove', e => { if (draggingProgress) seek(e) })
window.addEventListener('mouseup', () => { draggingProgress = false })

function seek(e) {
  const rect = progressBar.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, ((e.clientX - rect.left) / rect.width)))
  if (!isFinite(audio.duration)) return
  audio.currentTime = ratio * audio.duration
}

knob.addEventListener('mousedown', e => { knobDragging = true; setVolumeFromAngle(angleFromEvent(e)) })
window.addEventListener('mousemove', e => { if (knobDragging) setVolumeFromAngle(angleFromEvent(e)) })
window.addEventListener('mouseup', () => { knobDragging = false })
knob.addEventListener('touchstart', e => { knobDragging = true; setVolumeFromAngle(angleFromEvent(e)) }, { passive: true })
window.addEventListener('touchmove', e => { if (knobDragging) setVolumeFromAngle(angleFromEvent(e)) }, { passive: true })
window.addEventListener('touchend', () => { knobDragging = false })

fileInput.addEventListener('change', async e => {
  const f = e.target.files[0]
  if (!f) return
  let stored = null
  try { stored = await saveToDir(f) } catch {}
  const url = stored?.url || URL.createObjectURL(f)
  const metaSize = stored?.size || f.size
  const item = { title: f.name, url, meta: `${(metaSize/1024/1024).toFixed(2)} MB` }
  tracks.push(item)
  if (currentIndex === -1) { selectTrack(tracks.length - 1) } else { renderPlaylist() }
  playlistEl.scrollTo({ top: playlistEl.scrollHeight, behavior: 'smooth' })
})

document.addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); togglePlay() }
  if (e.code === 'ArrowRight') forward()
  if (e.code === 'ArrowLeft') rewind()
  if (e.code === 'ArrowUp') setVolumeFromAngle(135)
  if (e.code === 'ArrowDown') setVolumeFromAngle(-135)
})

function init() {
  tracks = []
  renderPlaylist()
  setVolumeFromAngle(0)
  updateProgress()
}

init()

dirSelect.addEventListener('click', pickDirectory)
