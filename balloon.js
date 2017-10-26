var Balloon = function (arg) {
	var t0 = 0;
	var t = 0;
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
	var light = [];
	var water = [];
	var pt = [];
	var cnt_bg1 = 30;
	var bal_cnt = 0;
	var bal_cmb = 0;
	var bal_max = 0;
	var bal_rank = 1;
	var mvflag = 4;
	var sv = 1;
	var randflag = false;
	var ft = 0;
	var p = null;
	var state = 0;
	var score = 0;
	var loaded = 0;
	var in_l = 0;
	var in_r = 0;
	var in_f = 0;
	var spcnt = 0;
	var bgcol = ['#ff00ff','#00ffff','#ffff00'];
	var sp_name = ['bal'];
	var sp = [];
	var D = 16;
	var level = 1;
	var hi = [];

	var obj = function (base) {
		var th = {};
		th.age = 0;
		th.size = base.size || D;
		th.x = base.x || 0;
		th.y = base.y || 0;
		th.v = base.v || 0;
		th.theta = base.theta || 0;
		th.isout = function () {
			return th.x < off_x_min
				|| th.x > off_x_max
				|| th.y < off_y_min
				|| th.y > off_y_max;
		};
		th.tick0 = function () {
			if (mvflag === 4) th.x += th.v;
			if (mvflag === 6) th.x -= th.v;
			if (mvflag === 8) th.y -= th.v;
			if (mvflag === 2) th.y += th.v;
		};
		return th;
	};

	//background stars
	var bg1 = function (base) {
		var th = obj(base);
		th.v = sv*(0.3+Math.random()*0.5);
		th.size = 2;
		th.tick = function () {
			th.age++;
			th.tick0();
			return th.age;
		};
		return th;
	};

	//fragment
	var bg2 = function (base) {
		var th = obj(base);
		th.v = 1+Math.random()*3;
		th.theta = Math.random() * Math.PI*4/3 + Math.PI*5/6;
		th.size = 4;
		th.tick = function () {
			if (th.v < 0) th.v = 0;
			th.x += th.v * Math.cos(th.theta)+p.vx/2;
			th.y += th.v * Math.sin(th.theta)+0.1*th.age;
			th.age++;
			return th.age;
		};
		th.isout = function () {
			return th.age > base.life;
		};
		return th;
	};

	var point = function (base) {
		var th = obj(base);
		th.v = base.v || sv;
		th.text = base.text;
		th.tick = function () {
			th.y += -1;
			th.age++;
			th.tick0();
			return th.age;
		};
		th.isout = function () {
			return th.age > 30;
		};
		return th;
	};

	var balloon = function (base) {
		var th = obj(base);
		th.v = sv;
		th.active = 1;
		th.tick = function() {
			th.age++;
			th.tick0();
			return th.age;
		};
		th.banged = function () {
			return th.active != 1;
		};
		return th;
	};

	var lightning = function (base) {
		var th = obj(base);
		th.type = base.type;
		th.v = sv;
		th.tick = function() {
			th.tick0();
			th.age++;
			return th.age;
		};
		return th;
	};

	var player = function (base) {
		var th = obj(base);
		th.life = base.life || 1;
		th.lived = -1e4;
		th.vx = base.vx || 0;
		th.vy = base.vy || 1;
		th.acc = 0;
		th.forward = 1;
		th.tick = function () {
			if (th.checkifdead() >= 3) return th.age;
			th.age++;
			if (th.checkifdead() == 0) th.lived++;
			th.vy += 0.20;
			if (th.vy > 2.8) th.vy = 2.8;
			if (in_f > 0) {
				th.vx += (in_r - in_l)*(th.acc > 4 ? 0.20:0.24);
				if (th.vx > 2.8) th.vx = 2.8;
				if (th.vx < -2.8) th.vx = -2.8;
			}
			if (th.acc < 4) {
				th.vy -= 0.40;
			} else if (th.acc < 8 || in_f >0) {
				th.vy -= 0.32;
			}
			if (th.vy < -2.8) th.vy = -2.8;
			th.x += th.vx;
			th.y += th.vy;
			if (th.x <= th.size / 2) th.x = th.size / 2;
			if (th.y <= th.size / 2) th.y = th.size / 2;
			if (th.x > w - th.size / 2) th.x = w - th.size / 2;
			if (th.y > h - th.size / 2) th.y = h - th.size / 2;
			th.acc++;
			return th.age;
		};
		th.checkifdead = function () {
			if (state == 2 && th.age - th.lived >= 60) return 3;
			if (state == 1 && th.life <= 0) return 1;
			if (state == 2 && th.age - th.lived < 60) return 2;
			return 0;
		};
		return th;
z	};

	this.init = function () {
		lighttable = dcd(lighttable0);
		state = 0;
		init0();
	};

	var init0 = function () {
		light = [];
		water = [];
		bg = [];
		frag = [];
		bal = [];
		pt = [];
		score = bal_cnt = bal_cmb = bal_max = spcnt = 0;
		bal_rank = 1;
		randflag = false;
		level = 1;
		p = player({x: w/2, y: h/2, vy: -3});
		if (loaded == 0) {
			arg.document.getElementById("c1").style.visibility = 'hidden';
			for (var i = 0; i < sp_name.length; i++) {
				sp[i] = new Image();
				sp[i].src = sp_name[i]+".gif";
			}
			ctx[1].font = "12px Consolas";
			loaded = 1;
		}
		for (var i = 0; i < cnt_bg1; i++) bg[i] = bg1({x:Math.random()*w, y:Math.random() * h});
		for (var i = 0; i < w/D+2; i++) {
			water[water.length] = lightning({type: "W", x: D*i+8, y: 20.5*D});
			water[water.length] = lightning({type: "W", x: D*i+8, y: 21.5*D});
		}
		draw();
	};

	this.tick = function () {
		p.tick();
		if (state == 0) {draw();return;}
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

		if (randflag) {
			if (t > 300) {
				randflag = false;
				t = 0;
				return;
			}
		} else {
			var tmp = Math.floor(t/D);
			if (tmp > lighttable.length - 1) {
				//randflag = true;
				t = 0;
				tmp = 0;
				//return;
			}
			if (spcnt === 0) {
				var str = lighttable[tmp].split("");
				for (var i = 0; i < str.length; i++) {
					if (str[i] == "L") {
						light[light.length] = lightning({type: str[i], x: -D/2, y:D*i+D/2});
					} else if (str[i] == "W") {
						water[water.length] = lightning({type: str[i], x: -D/2, y:D*i+D/2});
					} else if (str[i] == "B") {
						bal[bal.length] = balloon({x: -D/2, y:D*i+D/2});
					}
				}
			}
		}
		for (var i = 0; i < bal.length;) {
			bal[i].tick();
			if (bal[i].isout()) {
				bal_cmb = 0;
			}
			if (bal[i].isout() || bal[i].banged()) bal.splice(i,1);
			else i++;
		}
		for (var i = 0; i < light.length;) {
			light[i].tick();
			if (light[i].isout()) light.splice(i,1);
			else i++;
		}
		for (var i = 0; i < water.length;) {
			water[i].tick();
			if (water[i].isout()) water.splice(i,1);
			else i++;
		}
		if (state == 1) check_collision();
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
		for (var i = 0; i < pt.length;) {
			pt[i].tick();
			if (pt[i].isout()) pt.splice(i, 1);
			else i++;
		}
		t++;
		if (state == 1 && ++t0%13 == 0) score += 10;
		if (++spcnt == D) spcnt = 0;
		draw();
	};

	var check_collision = function () {
		for (var i = 0; i < light.length; i++) {
			if (Math.abs(light[i].x - p.x) < 8 && Math.abs(light[i].y - p.y) < 8  && --p.life < 0) break;
		}
		for (var i = 0; i < water.length; i++) {
			if (Math.abs(water[i].x - p.x) < 8 && Math.abs(water[i].y - p.y) < 8  && --p.life < 0) break;
		}
		for (var i = 0; i < bal.length; i++) {
			if (Math.abs(bal[i].x-p.x) < (D+2) && Math.abs(bal[i].y-p.y) < (D+2)) {
				bal[i].active = 0;
				var tmp = 500+200*(bal_rank-1);
				bal_cmb++;
				bal_cnt++;
				if (bal_cmb > 0 && bal_cmb % 20 == 0) tmp = 2000*bal_rank++;
				score += tmp;
				if (bal_max < bal_cmb) bal_max = bal_cmb;
				pt[pt.length] = point({x:bal[i].x, y:bal[i].y, text:tmp});
			}
		}
		if (state == 1 && p.life <= 0) {
			for (var i = 0; i < 60; i++) {
				frag[frag.length] = bg2({x: p.x, y: p.y, v: 3, life: 61});
			}
			if (bal_max >= 20) {
				score += bal_max*bal_rank*100;
				pt[pt.length] = point({x:p.x, y:p.y-20, v:0, text:"+"+bal_max*200});
			}
		}
	};

	var draw = function () {
		ctx[1].beginPath();
		ctx[1].fillStyle = "#000000";
		if (state == 0 || state == 3) ctx[1].globalAlpha = 0.3;
		ctx[1].fillRect(0, 0, w, h);
		if (state != 0 && state != 3) ctx[1].globalAlpha = 1;
		for (var i = 0; i < bg.length;i++) {
			ctx[1].fillStyle = bgcol[i % bgcol.length];
			ctx[1].fillRect(bg[i].x-bg[i].size, bg[i].y-bg[i].size, bg[i].size, bg[i].size);
		}
		var ttt = Math.floor(t/10)%4;
		for (var i = 0; i < bal.length; i++) {
			if (ttt == 0) {
				ctx[1].drawImage(sp[0], 0*D, 0, bal[i].size, bal[i].size, bal[i].x-bal[i].size/2, bal[i].y-bal[i].size/2, bal[i].size, bal[i].size);
			} else if (ttt == 1 || ttt == 3) {
				ctx[1].drawImage(sp[0], 1*D, 0, bal[i].size, bal[i].size, bal[i].x-bal[i].size/2, bal[i].y-bal[i].size/2, bal[i].size, bal[i].size);
			} else {
				ctx[1].save();
				ctx[1].scale(-1, 1);
				ctx[1].drawImage(sp[0], 0*D, 0, bal[i].size, bal[i].size, (bal[i].x+bal[i].size/2)*-1, bal[i].y-bal[i].size/2, bal[i].size, bal[i].size);
				ctx[1].restore();
			}
		}
		ctx[1].fillStyle = "#ffffff";
		var tt = Math.floor(t/3)%2;
		for (var i = 0; i < light.length;i++) {
			ctx[1].drawImage(sp[0], (2+tt)*D, 0, light[i].size, light[i].size, light[i].x-light[i].size/2,light[i].y-light[i].size/2,light[i].size,light[i].size);
		}
		for (var i = 0; i < frag.length;i++) {
			ctx[1].fillRect(frag[i].x - frag[i].size/2, frag[i].y - frag[i].size/2, frag[i].size, frag[i].size);
		}
		if (state == 1) {
			if (p.forward == 1) {
				ctx[1].drawImage(sp[0],4*D,0,p.size,p.size,p.x-p.size/2,p.y-p.size/2,p.size,p.size);
			} else {
				ctx[1].save();
				ctx[1].scale(-1,1);
				ctx[1].drawImage(sp[0],4*D,0,p.size,p.size,(p.x+p.size/2)*-1,p.y-p.size/2,p.size,p.size);
				ctx[1].restore();
			}
		}
		for (var i = 0; i < water.length;i++) {
			ctx[1].drawImage(sp[0], 5*D, 0, water[i].size, water[i].size, water[i].x-water[i].size/2,water[i].y-water[i].size/2,water[i].size,water[i].size);
		}
		ctx[1].fillStyle = "yellow";
		for (var i = 0; i < pt.length; i++) {
			ctx[1].fillText(pt[i].text, pt[i].x-D, pt[i].y);
		}
		if (state == 0 || state == 3) ctx[1].globalAlpha = 1;
		if (state == 3) {
			ctx[1].fillText("GAME  OVER",200, h/2-15);
			ctx[1].fillText("PLEASE TRY AGAIN", 185, h/2+15);
		} else if (state == 0) {
			ctx[1].fillText("JS BALLOON TRIP", 185, h/2-15);
			ctx[1].fillText("HIT 'Z' KEY TO START NEW GAME", 150, h/2+15);
		}
		ctx[1].fillStyle = "#ffffff";
		ctx[1].fillText("SCORE", 5,15);
		ctx[1].fillText(score, 80, 15);
		ctx[1].fillText("BALLOON", 5, 28);
		ctx[1].fillText(bal_cnt, 80, 28);
		ctx[1].fillText("MAX-COMBO  " + bal_max, w-110, 15);
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
			p.forward = 1;
		} else if (cd == 39) {
			in_r = val;
			p.forward = 0;
		} else if (cd == 90) {
			in_f = val;
			if (state == 0 && val == 1) {
				state = 1;
				t = t0 = 0;
				init0();
			} else if (state == 1) {
				if (val == 1) p.acc = 0;
			} else if (state == 3 && val == 1) {
				state = 0;
			}
		}
	};

	var dcd = function (arr) {
		var in1 = arr.split("Z");
		var ret = [];
		for (var i=0; i<in1.length;i++) {
			var str = "";
			var in2 = in1[i].split("");
			for (var j=0;j<in2.length;j++) {
				var a = in2[j];
				str+=a;
				if (in2[j+1] < "0" || in2[j+1] > "9") continue;
				var n = in2[++j];
				if (in2[j+1] >= "0" && in2[j+1] <="9") n+=in2[++j];	
				for (var k=0;k<n-1;k++)str+=a;
			}
			ret.push(str);
		}
		return ret;
	};

	var lighttable = [];
	var lighttable0 = "S3LS3BS7LS4W2ZS2LSLS9LSLS3W2ZS3LS11LS4W2ZS20W2ZS9LS7BS2W2ZLS3BS3LSLS9W2ZSLS7LS10W2ZS2LS13LS3W2ZS2LS12LS4W2ZS3L2S6BS2LS5W2ZS6LS7LS5W2ZS9BS3LS6W2ZS2BS10LS6W2ZS20W2ZSLS7LS7LS2W2ZLSLS5LSLS5LSLSW2ZSLS7LS7LS2W2ZS5BS14W2ZS20W2ZS4LS7LS3BS3W2ZS3LSLS5LSLS6W2ZS4LS7LS7W2ZS17LS2W2ZS16LSLSW2ZS5BS2LS3BS4LS2W2ZSLS18W2ZLSLS17W2ZSLS10LS7W2ZS6LS4LSLS6W2ZS5LSLS4LS7W2ZBS5LS11LSW2ZS14BS2LSLW2ZS6BS11LSW2ZS11BS8W2ZS20W2ZS5LS5LS8W2ZS5LS6LS7W2ZS4LS6BS8W2ZS2L2S12LS3W2ZS20W2ZLS9LS9W2ZS6LS13W2ZS14LS5W2ZS2BS5BS4LSLS4W2ZS20W2ZS2LS17W2ZS6LS13W2ZS7LS7LS4W2ZS7LS5BS2LS3W2ZSLS6LS3BS3LS3W2ZS2LS5LS6LS4W2ZS3LS4LS5LS5W2ZS9LS8LSW2ZSBS18W2ZS8BS6BS4W2ZLS5LS10LS2W2ZS5LS5LS6LSW2ZS19LW2ZS4LS15W2ZS19LW2ZLSLS5LS11W2ZSLS15LS2W2ZS10BS9W2ZS7LS7BS4W2ZSBS18W2ZS13LS6W2ZBS2LS16W2ZS8LS4LS6W2ZS20W2ZSBS13LS4W2ZS6LS13W2ZLS16BS2W2ZS3BS5LS10W2ZS10LS8LW2ZS3LS16W2ZS20W2ZS19LW2ZS17BSLW2ZS19LW2ZS17BSLW2ZS19LW2ZS17BSLW2ZS19LW2ZS17BSLW2ZS19LW2ZS20W2ZS20W2ZS20W2ZS20W2ZS20W2ZS20W2ZS10LS9W2ZS8BSLSBS7W2ZS10LS9W2ZS8BSLSBS7W2ZS10LS9W2ZS8BSLSBS7W2ZS10LS9W2ZS8BSLSBS7W2ZS10LS9W2ZS20W2ZS20W2ZS20W2ZS20W2ZS20W2ZS20W2ZS20W2ZLS19W2ZLSBS17W2ZLS19W2ZLSBS17W2ZLS19W2ZLSBS17W2ZLS19W2ZLS19W2ZLBS18W2ZLBS18W2ZS20W2ZS20W2ZS20W2ZS20W2ZLS17LSW2ZSLS13BSLS2W2ZSLS13BSLS2W2ZS2LS13LS3W2ZS3LS12LS3W2ZS4LS10LS4W2ZS4LS8L2S5W2ZS5LS6LS7W2ZS6LS4LS8W2ZSLS14LS3W2ZS2LS12LS4W2ZS2LS11LS5W2ZS3L2S7L2S3BSLW2ZSBS4LS3L2S4BS2LW2ZS2BS4L3S5BS3LW2ZLS2BS14LSW2ZSLS15LS2W2ZS2LS13LS3W2ZS3L2S11LS3W2ZS5LSLSLS4LS5W2ZS8LS4LS6W2ZS20W2ZS20W2ZS20W2ZS20W2ZS20W2ZS20W2ZS20W2ZS20W2ZS6BS2LS2BS7W2ZS5BS2LSLS2BS6W2ZS4BS2LSLSLS2BS5W2ZS3BS2LSLSLSLS2BS4W2ZS5LSLSLSLSLS6W2ZS4LSLSLSLSLSLS5W2ZS4LSLSLSLSLSLS5W2ZS5LSLSLSLSLS6W2ZS3BS2LSLSLSLS2BS4W2ZS4BS2LSLSLS2BS5W2ZS5BS2LSLS2BS6W2ZS6BS2LS2BS7W2ZS20W2ZS20W2ZS20W2ZLS19W2ZS20W2ZS2LS5LS11W2ZS15LS4W2ZS20W2ZLS9LS9W2ZS4LS15W2ZS17LS2W2ZS7BS12W2ZS12LS7W2ZS2LS17W2ZS6LS13W2ZS20W2ZS2BS11LS2BS2W2ZLS19W2ZS9LS10W2ZS17LS2W2ZS4LS15W2ZS13LS6W2ZS20W2ZLS19W2ZS20W2ZS15LS4W2ZS9LS10W2ZS4LS15W2ZS20W2ZS2BS13BS3W2ZLS12LS4LSW2ZS2BS5LS8BS2W2ZS20W2ZSBS16BSW2ZS3LS16W2ZS15LS4W2ZS10LS9W2ZS20W2ZS20W2ZS20W2ZLS2BS13BS2W2ZS20W2ZLS19W2ZS3BS13BS2W2ZLS19W2ZS20W2ZLS2BS13BS2W2ZS20W2ZLS19W2ZS3BS13BS2W2ZLS19W2ZS20W2ZLS2BS13BS2W2ZS20W2ZLS19W2ZS3BS13BS2W2ZLS19W2ZS20W2ZLS2BS13BS2W2ZS20W2ZLS19W2ZS3BS13BS2W2ZLS19W2ZS20W2ZLS2BS13BS2W2ZS20W2ZLS19W2ZS3BS13BS2W2ZLS19W2ZS20W2ZLS2BS13BS2W2ZS20W2ZLS19W2ZS3BS13BS2W2ZLS19W2ZS20W2ZLS2BS13BS2W2ZS20W2ZLS19W2ZS3BS13BS2W2ZLS19W2ZS20W2ZS3BS13BS2W2ZS20W2ZS20W2ZS20W2ZS20W2ZS20W2ZS20W2ZS20W2ZS20W2ZS20W2ZS20W2ZS20W2ZS20W2";
};
