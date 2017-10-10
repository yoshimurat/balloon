var Balloon = function (arg) {
	var t = 0;
	var t_cycle = 2160;
	var ctx = [arg.document.getElementById("c1").getContext("2d"), arg.document.getElementById("c2").getContext("2d")];
	var w = 480;
	var h = 360;
	var off = 20;
	var off_y_max = h+off;
	var off_y_min = 0-off;
	var off_x_max = w + off;
	var off_x_min = 0-off;
	var bal = [];
	var bg = [];
	var frag = [];
	var lightn = [];
	var cnt_bg1 = 30;
	var bal_cnt = 0;
	var bal_cmb = 0;
	var moveflag = true;
	var movev = 1;
	var randmove = false;
	var ft = 0;
	var p = null;
	var state = 0;
	var score = 0;
	var loaded = 0;
	var in_l = 0;
	var in_r = 0;
	var in_f = 0;
	var bgcol = ['#ff00ff','#00ffff','#ffff00'];
	var sp_name = ['sp0'];
	var sp = [];
	var D = 16;
	var level = 1;
	var hi = [];

	var obj = function (base) {
		var th = {};
		th.age = 0;
		th.size = base.size || D;
		th.core = base.core || 4;
		th.x = base.x || 0;
		th.y = base.y || 0;
		th.v = base.v || 0;
		th.dv = base.dv || 0;
		th.theta = base.theta || 0;
		th.dtheta = base.dtheta || 0;
		th.isout = function () {
			return th.x < off_x_min
				|| th.x > off_x_max
				|| th.y < off_y_min
				|| th.y > off_y_max;
		};
		return th;
	};

	//background stars
	var bg1 = function (base) {
		var th = obj(base);
		//th.x = Math.random() * w;
		th.v = Math.random() + 0.1;
		th.size = 2;
		th.tick = function () {
			th.age++;
			if (moveflag) th.x += th.v;
			return th.age;
		};
		return th;
	};

	//fragment
	var bg2 = function (base) {
		var th = obj(base);
		th.v = Math.random() * base.v;
		th.theta = Math.random() * Math.PI * 2 - Math.PI;
		th.size = 2;
		th.tick = function () {
			if (th.v < 0) th.v = 0;
			th.x += th.v * Math.cos(th.theta);
			th.y += th.v * Math.sin(th.theta);
			th.age++;
			return th.age;
		};
		th.isout = function () {
			return th.age > base.life;
		};
		return th;
	};

	var ballon = function (base) {
		var th = obj(base);
		th.tick = function() {
			if (moveflag) th.x += movev;
			th.age++;
			return th.age;
		};
		return th;
	};

	var lightning = function (base) {
		var th = obj(base);
		th.tick = function() {
			if (moveflag) th.x += movev;
			th.age++;
			return th.age;
		};
		return th;
	};

	var player = function (base) {
		var th = obj(base);
		th.life = base.life || 1;
		th.lived = -1e4;
		th.theta = Math.PI * 3 / 2;
		th.vx = 0;
		th.vy = 0;
		th.tick = function () {
			if (th.checkifdead() >= 3) return th.age;
			th.age++;
			if (th.checkifdead() == 0) th.lived++;
			th.vy += 0.1 ;
			if (th.vy > 2) th.vy = 2;
			if (in_f > 0) {
				th.vx += (in_r - in_l) * 0.08;
				if (th.vx > 1.6) th.vx = 1.6;
				if (th.vx < -1.6) th.vx = -1.6;
				th.vy -= 0.2;
				if (th.vy < -2) th.vy = -2;
			}
			th.x += th.vx;
			th.y += th.vy;
			if (th.x <= th.size / 2) th.x = th.size / 2;
			if (th.y <= th.size / 2) th.y = th.size / 2;
			if (th.x > w - th.size / 2) th.x = w - th.size / 2;
			if (th.y > h - th.size / 2) th.y = h - th.size / 2;
			return th.age;
		};
		th.checkifdead = function () {
			if (state == 2 && th.age - th.lived >= 60) return 3;
			if (state == 1 && th.life <= 0) return 1;
			if (state == 2 && th.age - th.lived < 60) return 2;
			return 0;
		};
		return th;
	};

	var bul = function (base) {
		var th = obj(base);
		th.life = base.life || 1;
		th.ty = base.ty || 0;
		th.py = base.py || 0;
		th.size = base.size || 0;
		th.tick = function () {
			th.v += th.dv;
			th.x += th.v * Math.cos(th.theta);
			th.y += th.v * Math.sin(th.theta);
			th.age ++;
			return th.age;
		};
		return th;
	};

	this.init = function () {
		state = 0;
		init0();
	};

	var init0 = function () {
//		alert(ene_table[0].split(""));
		ene = [];
		bg = [];
		frag = [];
		blt_e = [];
		score = 0;
		kas = 0;
		level = 1;
		p = player({x: (w - 2) / 2, y: h/2, vy: -4});
		if (loaded == 0) {
			arg.document.getElementById("c1").style.visibility = 'hidden';
			for (var i = 0; i < sp_name.length; i++) {
				sp[i] = new Image();
				sp[i].src = sp_name[i]+".png";
			}
			ctx[1].font = "12px Consolas";
			loaded = 1;
		}
		for (var i = 0; i < cnt_bg1; i++) bg[i] = bg1({x:Math.random()*w, y:Math.random() * h});
		draw();
	};

	this.tick = function () {
		p.tick();
		if (state == 3) return;
		var pd = p.checkifdead();
		if (pd == 1) {
			p.lived = p.age;
			state = 2;
		}
		if (state != 3 && pd ==3) {
			state = 3;
			draw();
			return;
		}

		if (state == 1) {
			if (randmove) {
				if (t > 300) {
					randmove = false;
					t = 0;
				}
			} else {
				if (ft == 0) {
					var tmp = Math.floor(t/D);
					if (tmp > ene_table.length - 1) {
						randmove = true;
						t = 0;
					}
					var str = ene_table[tmp].split("");
					for (var i = 0; i < str.length; i++) {
						if (str[i] == "1") {
							lightn[lightn.length] = lightning({x: -D/2, y:D*i+D/2});
						} else if (str[i] == "2") {
							bal[bal.length] = balloon({x: -D/2, y:D*i+D/2});
						}
					}
				}
			}

		}
		for (var i = 0; i < bal.length;) {
			bal[i].tick();
			if (bal[i].isout()) bal.splice(i,1);
			else i++;
		}
		for (var i = 0; i < lightn.length;) {
			lightn[i].tick();
			if (lightn[i].isout()) lightn.splice(i,1);
			else i++;
		}

		//check_collision();
		p.checkifdead();
		if (t % 10 == 1 && bg.length < cnt_bg1) {
			bg[bg.length] = bg1({y:Math.random()*h, x:-10});
		}
		for (var i = 0; i < bg.length;) {
			bg[i].tick();
			if (bg[i].isout()) bg.splice(i, 1);
			else i++;
		}
		for (var i = 0; i < frag.length;) {
			frag[i].tick();
			if (frag[i].isout()) frag.splice(i, 1);
			else i++;
		}
		draw();
		if (++ft == 16) ft = 0;
		if (t++ > t_cycle) {
			level++;
			t = 0;
		}
	};

	var check_collision = function () {
		for (var i = 0; i < ene.length; i++) {
			var buzzed = 0;
			if (Math.abs(ene[i].x - p.x) < 8 && Math.abs(ene[i].y - p.y) < 8) {
				if (p.life-- <= 0) break;
			}
		}
		var t_v = 0;
		var t_t = 0;
		for (var i = 0; i < lightn.length; i++) {
			if (Math.abs(lightn[i].x - p.x) < 16 && Math.abs(lightn[i].y - p.y) < 16) buzzed += 2*level;
			if (Math.abs(lightn[i].x - p.x) < 10 && Math.abs(lightn[i].y - p.y) < 10) buzzed += 2*level;
			if (Math.abs(lightn[i].x - p.x) < 6 && Math.abs(lightn[i].y - p.y) < 6) {
				if (p.life-- <= 0) break;
			}
		}
		if (state == 1 && p.life <= 0) {
			for (var i = 0; i < 100; i++) {
				frag[frag.length] = bg2({x: p.x, y: p.y, v: 3, life: 61});
			}
		}
		if (state == 1 && buzzed > 0) {
			frag[frag.length] = bg2({x: p.x, y: p.y, v: 4, life: 15});
			score += buzzed;
		}
	};

	var draw = function () {
		ctx[1].beginPath();
		ctx[1].fillStyle = "#000000";
		ctx[1].globalAlpha = 0.6;
		ctx[1].fillRect(0, 0, w, h);
		if (state == 1) {
			ctx[1].save();
			ctx[1].translate(p.x, p.y);
			ctx[1].rotate(p.theta);
			ctx[1].translate(-p.x, -p.y);
			ctx[1].drawImage(sp[0],0,0,p.size,p.size,p.x-p.size/2,p.y-p.size/2,p.size,p.size);
			ctx[1].restore();
		}
		for (var i = 0; i < bg.length;i++) {
			ctx[1].fillStyle = bgcol[i % bgcol.length];
			ctx[1].fillRect(bg[i].x - bg[i].size, bg[i].y - bg[i].size, bg[i].size, bg[i].size);
		}

		for (var i = 0; i < frag.length;i++) {
			ctx[1].fillStyle = "#ffffff";
			ctx[1].fillRect(frag[i].x - frag[i].size/2, frag[i].y - frag[i].size/2, frag[i].size, frag[i].size);
		}
		ctx[1].fillStyle = "#ffffff";
		for (var i = 0; i < lightn.length;i++) {
			ctx[1].drawImage(sp[0], 1 * D, 0, lightn[i].size, lightn[i].size, lightn[i].x-lightn[i].size/2,lightn[i].y-lightn[i].size/2,lightn[i].size,lightn[i].size);
		}

		ctx[1].fillStyle = "#ffffff";
		if (state == 3) {
			ctx[1].fillText("GAME OVER",145, h/2);
			ctx[1].fillText("hit '1' key to start new game", 100, h/2+25);
		} else if (state == 0) {
			ctx[1].fillText("BALLOON TRIP  hit 'Z' key to start new game", 120, 160);
		}

		ctx[1].fillText("SCORE", 5,15);
		ctx[1].fillText(score, 75, 15);
		ctx[1].fillText("BALLOON", 5, 30);
		ctx[1].fillText(bal_cnt, 75, 30);
		ctx[1].fillText("LEVEL  " + level, w-75, 15);
		ctx[1].fillText(lightn.length, w-75, 30);
		ctx[0].putImageData(ctx[1].getImageData(0,0,w,h),0,0);
	};

	this.kd = function (e) {
		mv(e.keyCode, 1);
	};

	this.ku = function (e) {
		mv(e.keyCode, 0);
	};

	var mv = function (cd,val) {
		if (cd == 37) {
			in_l = val;
		} else if (cd == 39) {
			in_r = val;
		} else if (cd == 90) {
			in_f = val;
			if (state == 0 && val == 1) {
				state = 1;
				t = 0;
				ft = 0;
				init0();
			} else if (state == 3 && val == 1) {
				state = 0;
			}
		}
	};

	var ene_table = [
		"001000100000100000011",
		"000000000000000000000",
		"110000000011000001011",
		"000000111000001110000"
		];

};
