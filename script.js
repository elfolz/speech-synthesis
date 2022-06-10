var isCat = false
var audioEnabled = false
var synth = new SpeechSynthesisUtterance()
var persona = document.querySelector('figure')
var imgSize

function refreshPosition(x, y) {
	let centerWidth = document.documentElement.clientWidth / 2
	let marginBottom = (document.documentElement.clientHeight - (persona.offsetTop + persona.clientHeight)) / 2
	let centerHeight = persona.offsetTop + (persona.clientHeight / 2) + marginBottom
	if (x < 0) x = centerWidth
	if (y < 0) y = centerHeight
	let posX = (x - centerWidth) / centerWidth
	let posY = (y - centerHeight) / centerHeight
	posX = posX != 0 ? posX * 30 : 0
	posY = posY != 0 ? posY * 30 : 0
	let perspective = imgSize
	document.documentElement.style.setProperty('--y-angle', `${posX}deg`)
	document.documentElement.style.setProperty('--x-angle', `${posY * -1}deg`)
	document.documentElement.style.setProperty('--z-angle', `${posX}deg`)
	document.documentElement.style.setProperty('--perspective', `${perspective}px`)
}
function resize() {
	imgSize = Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight) / 2
	let mouthSize = Math.round(imgSize * 0.08)
	if (mouthSize % 2 != 0) mouthSize++
	document.documentElement.style.setProperty('--size', `${imgSize}px`)
	document.documentElement.style.setProperty('--mouth-size', `${mouthSize}px`)
}
function setupVoice(text) {
	speechSynthesis.cancel()
	let actors = ['Microsoft Mark', 'Microsoft Guy', 'Google UK English Male']
	if (/iphone|ipad|macos/i.test(navigator.appVersion)) actors.push('Daniel')
	let voice = speechSynthesis.getVoices().find(el => {
		let byName = new RegExp(`(${actors.join('|')})`, 'i').test(el.name.toLocaleLowerCase())
		let byLocal = el?.localService && el?.lang?.replace('_', '-').toLocaleLowerCase() == 'en-us'
		return byName || byLocal
	})
	if (!voice) return setTimeout(() => setupVoice(text), 100)
	synth.lang = voice?.lang ?? 'en-US'
	synth.voice = voice
	synth.text = text
	if (isCat) synth.pitch = 2
	speechSynthesis.speak(synth)
}
persona.onclick = e => {
	e.stopPropagation()
	document.documentElement.style.setProperty('cursor', 'wait')
	persona.classList.add('loading')
	fetch('https://litipsum.com/api/dracula/1')
	.then(response => {
		return response.text()
	})
	.then(response => {
		setupVoice(response)
	})
	.catch(error => {
		alert(error ?? 'Error')
	})
	.finally(() => {
		document.documentElement.style.removeProperty('cursor')
		persona.classList.remove('loading')
	})
}
synth.onboundary = e => {
	let vowel = e?.utterance?.text?.substr(e?.charIndex)?.match(/[aeiou]/)
	if (vowel) persona.classList.add(vowel[0])
	setTimeout(() => persona.classList.remove(vowel[0]), 250)
}
synth.onstart = () => {
	if (/edg/i.test(navigator.appVersion) && (/windows/i.test(navigator.appVersion) || /android/i.test(navigator.appVersion)) ) return
	persona.classList.add('speaking')
}
synth.onresume = () => {
	if (/edg/i.test(navigator.appVersion) && (/windows/i.test(navigator.appVersion) || /android/i.test(navigator.appVersion)) ) return
	persona.classList.add('speaking')
}
synth.onend = () => {
	persona.classList.remove('speaking')
}
synth.onpause = () => {
	persona.classList.remove('speaking')
}
synth.onerror = () => {
	speechSynthesis.cancel()
	persona.classList.remove('speaking')
}
window.onpagehide = () => {
	speechSynthesis.cancel()
}
window.onresize = () => {
	resize()
}
window.onclick = () => {
	speechSynthesis.cancel()
	persona.classList.remove('speaking')
}
window.onmousemove = e => {
	refreshPosition(e.pageX, e.pageY)
}
document.onmouseleave = () => {
	refreshPosition(-1, -1)
}
document.ontouchend = () => {
	refreshPosition(-1, -1)
}
document.ontouchmove = e => {
	refreshPosition(e.targetTouches[0].clientX, e.targetTouches[0].clientY)
}
document.onclick = () => {
	if (audioEnabled) return
	synth.text = ''
	synth.volume = 0
	speechSynthesis.speak(synth)
	audioEnabled = true
	synth.volume = 1
}
document.onreadystatechange = () => {
	if (document.readyState != 'complete') return
	let params = new URLSearchParams(location.search.substring(1))
	if (params.get('cat')) {
		persona.classList.add('cat')
		persona.style.setProperty('--mouth-top', '39%')
		persona.style.setProperty('--lips-color', '#aaa671')
		persona.children[0].src = 'cat-body.png'
		let nose = document.createElement('img')
		nose.src = 'cat-nose.png'
		nose.style.setProperty('position', 'absolute')
		nose.style.setProperty('left', 0)
		nose.style.setProperty('z-index', 3)
		persona.appendChild(nose)
		isCat = true
	}
	persona.classList.add('show')
	resize()
}