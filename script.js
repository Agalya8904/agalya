// birthday animation: balloons + confetti + greeting
document.addEventListener('DOMContentLoaded', () => {
	const btn = document.getElementById('celebrate-btn');
	const balloonStage = document.getElementById('balloon-stage');
	const canvas = document.getElementById('confetti-canvas');
	const ctx = canvas.getContext && canvas.getContext('2d');

	// resize canvas
	function fitCanvas(){
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	fitCanvas();
	window.addEventListener('resize', fitCanvas);

	// --- Confetti implementation (canvas) ---
	const confettiColors = ['#ff4d4f','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899'];

		function random(min, max){ return Math.random()*(max-min)+min }

		class Particle{
			constructor(x,y,ctx,shape){
				this.x = x; this.y = y; this.ctx = ctx;
				this.size = random(6,12);
				this.color = confettiColors[Math.floor(random(0,confettiColors.length))];
				this.rotation = random(0,360);
				this.speedX = random(-4,4);
				this.speedY = random(-8,-2);
				this.gravity = 0.18 + Math.random()*0.06;
				this.drag = 0.995;
				this.tilt = random(-0.2,0.2);
				this.life = 80 + Math.floor(random(0,60));
				this.age = 0;
				this.shape = shape || 'rect';
			}
			update(){
				this.x += this.speedX;
				this.y += this.speedY;
				this.speedY += this.gravity;
				this.speedX *= this.drag;
				this.rotation += 6 * this.tilt;
				this.age++;
			}
			draw(){
				const c = this.ctx;
				c.save();
				c.translate(this.x,this.y);
				c.rotate(this.rotation * Math.PI/180);
				c.fillStyle = this.color;
				if(this.shape === 'heart'){
					// draw a small heart path centered at 0,0
					const s = this.size;
					c.beginPath();
					const topCurveHeight = s * 0.3;
					c.moveTo(0, topCurveHeight);
					// left half
					c.bezierCurveTo(0, topCurveHeight - s*0.6, -s, topCurveHeight - s*0.6, -s, topCurveHeight);
					c.bezierCurveTo(-s, topCurveHeight + s*0.6, 0, topCurveHeight + s*1.1, 0, topCurveHeight + s*1.6);
					// right half
					c.bezierCurveTo(0, topCurveHeight + s*1.1, s, topCurveHeight + s*0.6, s, topCurveHeight);
					c.bezierCurveTo(s, topCurveHeight - s*0.6, 0, topCurveHeight - s*0.6, 0, topCurveHeight);
					c.closePath();
					c.fill();
				} else {
					c.fillRect(-this.size/2, -this.size/2, this.size, this.size*0.6);
				}
				c.restore();
			}
			alive(){ return this.age < this.life && this.y < canvas.height + 50 }
		}

	let particles = [];
	let confettiRunning = false;

		function emitConfetti(x,y,count=40, shapeChance=0.15){
			if(!ctx) return;
			for(let i=0;i<count;i++){
				const shape = Math.random() < shapeChance ? 'heart' : 'rect';
				particles.push(new Particle(x + random(-20,20), y + random(-20,20), ctx, shape));
			}
			if(!confettiRunning) runConfetti();
		}

	function runConfetti(){
		confettiRunning = true;
		function frame(){
			ctx.clearRect(0,0,canvas.width,canvas.height);
			particles.forEach(p=>{ p.update(); p.draw(); });
			particles = particles.filter(p=>p.alive());
			if(particles.length>0) requestAnimationFrame(frame);
			else confettiRunning = false;
		}
		requestAnimationFrame(frame);
	}

	// --- Balloons ---
	const balloonColors = ['red','yellow','green','blue','purple'];

		function createBalloon(leftPercent){
			const el = document.createElement('div');
			// sometimes make heart-shaped balloon
			const makeHeart = Math.random() < 0.35;
			if(makeHeart){
				el.className = 'balloon heart ' + balloonColors[Math.floor(random(0,balloonColors.length))];
				// create a small element to complete the heart center piece
				const mid = document.createElement('span');
				el.appendChild(mid);
			} else {
				el.className = 'balloon ' + balloonColors[Math.floor(random(0,balloonColors.length))];
			}
			el.style.left = leftPercent + 'vw';
			// random scale
			const scale = random(0.8,1.3);
			el.style.width = (56*scale) + 'px';
			el.style.height = (72*scale) + 'px';
			const duration = 8 + random(4,10); // seconds
			const delay = random(0,2);
			el.style.animation = `floatUp ${duration}s linear ${delay}s forwards`;
			balloonStage.appendChild(el);
			// remove after animation ends to keep DOM small
			setTimeout(()=> el.remove(), (duration+delay)*1000 + 500);
		}

	function launchBalloons(amount=8){
		const used = [];
		for(let i=0;i<amount;i++){
			const left = random(6,94);
			createBalloon(left);
		}
	}

	// Tie button: when clicked send both balloons and confetti and reveal a message animation
	btn.addEventListener('click', () => {
		// small visual feedback
		btn.disabled = true;
		btn.style.transform = 'scale(.98)';
		setTimeout(()=>{ btn.style.transform = ''; btn.disabled = false }, 900);

		const rect = btn.getBoundingClientRect();
		const cx = rect.left + rect.width/2;
		const cy = rect.top + rect.height/2;

		// confetti burst from button and from top center (some hearts included)
		emitConfetti(cx, cy, 60, 0.25);
		emitConfetti(window.innerWidth/2, window.innerHeight/3, 40, 0.2);

		// launch a few waves of balloons
		for(let wave=0; wave<3; wave++){
			setTimeout(()=> launchBalloons(6), wave*800);
		}

			// gentle repeated confetti while balloons rise (include hearts sometimes)
		let bursts = 0;
		const burstInterval = setInterval(()=>{
				emitConfetti(random(60,window.innerWidth-60), random(60,window.innerHeight/2), 30, 0.18);
			bursts++;
			if(bursts>6) clearInterval(burstInterval);
		}, 700);

		// animate greeting message: temporary pulse and text change
			const msg = document.getElementById('card-message');
			const nameInput = document.getElementById('name-input');
			const live = document.getElementById('live');
			const name = nameInput && nameInput.value.trim();
			if(name){
				msg.textContent = `Happy Birthday, ${name}! 💖 May your year be filled with love.`;
				if(live) live.textContent = `Sent a birthday wish to ${name}`;
			} else {
				msg.textContent = 'May your year ahead be bright and wonderful! 💖';
				if(live) live.textContent = 'Sent a loving birthday wish.';
			}
			msg.style.transition = 'transform .35s ease, opacity .6s ease';
			msg.style.transform = 'translateY(-6px) scale(1.02)';
			msg.style.opacity = '1';
			setTimeout(()=> msg.style.transform = '', 900);
			// revert text after a bit
			setTimeout(()=>{
				msg.textContent = name ? `Wishing you a day filled with love, joy, and cake.` : 'Wishing you a day filled with love, joy, and cake.';
				if(live) live.textContent = '';
			}, 7000);
	});

	// provide an initial gentle animation to invite click
	(function pulseButton(){
		btn.animate([{transform:'scale(1)'},{transform:'scale(1.03)'},{transform:'scale(1)'}],{duration:2500,iterations:Infinity,easing:'ease-in-out'});
	})();

	// keyboard accessibility: Enter/Space triggers
	btn.addEventListener('keyup', (e)=>{ if(e.key === 'Enter' || e.key === ' ') btn.click(); });

});


