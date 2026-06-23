// DuelingBook Overflow - Main Injected Script
// Receives settings from loader.js and initializes features

let DBO_SETTINGS = null;

// Listen for settings from loader.js
window.addEventListener("message", function (event) {
	if (event.source !== window) return;
	if (event.data.type && event.data.type === "DBO_SETTINGS_UPDATE") {
		DBO_SETTINGS = event.data.settings;
		startLoops(event.data.data);
	}
});

let loopsStarted = false;
function startLoops(data) {
	if (loopsStarted) return;
	loopsStarted = true;

	const goatCards = data.goatCards || [];
	const edisonCards = data.edisonCards || [];
	const extensionId = data.extensionId || "mphadhpdhcdiihbfpfomdngjlckhllpo"; // Fallback ID
	const extensionBaseUrl = data.extensionBaseUrl || ("chrome-extension://" + extensionId + "/");

	// 1. Blitz (100ms)
	// Runs repeatedly as requested by user ("works constantly")
	setInterval(blitzInjectFunction, 100);

	// 2. Fast (100ms)
	let fastTimestamp = 0;
	setInterval(() => {
		fastTimestamp += 0.1;
		let bSecond = false;
		if (fastTimestamp >= 1.0) {
			fastTimestamp = 0.0;
			bSecond = true;
		}
		if (DBO_SETTINGS) {
			fastInjectFunction(DBO_SETTINGS.cardLogging, bSecond);
		}
	}, 100);

	// 3. Main Slow Injection (4.5s)
	const mainLoop = () => {
		if (!DBO_SETTINGS) return;
		const s = DBO_SETTINGS;

		// Pass empty array for negate_icon_blob as it seems unused/empty in original
		injectFunction(
			extensionId,
			s.unlockCardMechanics,
			s.lowAnimations,
			s.silentCommands,
			s.birdUI,
			s.psctColors,
			s.cardLogging,
			goatCards,
			edisonCards,
			[],
			s.skipIntro,
			s.skipIntro,
			s.autoConnect,
			extensionBaseUrl
		);
	};

	setInterval(mainLoop, 4500);
	mainLoop(); // Run immediately
}
function blitzInjectFunction() {
	if (typeof actionsQueue === "undefined")
		return;

	if (typeof window.DBO_waitingForAction === "undefined")
		window.DBO_waitingForAction = false;

	if (typeof window.DBO_waitingForActionOrViewing === "undefined")
		window.DBO_waitingForActionOrViewing = false;


	if (window.DBO_waitingForAction) {
		if (actionsQueue.length > 0)
			window.DBO_waitingForAction = false;
	}

	if (window.DBO_waitingForActionOrViewing) {
		if (typeof window.DBO_waitingForActionOrViewingTimer === "undefined") {
			window.DBO_waitingForActionOrViewingTimer = 1000;
		}

		window.DBO_waitingForActionOrViewingTimer -= 100;;

		if (actionsQueue.length > 0 || viewing || DBO_waitingForActionOrViewingTimer <= 0) {
			window.DBO_waitingForActionOrViewing = false;
			window.DBO_waitingForActionOrViewingTimer = undefined;
		}


	}

	if (mobile && duelist && window.DBO_lastActionsQueueLength != 0 && actionsQueue.length == 0) {
		DBO_swapCardMenuForPlayer(player1);

	}

	// #############################################################################
	// #                                                                           #
	// # FEATURE: ACTION QUEUE MONITORING (blitzInjectFunction)                   #
	// #                                                                           #
	// # Handles ultra-responsive UI features:                                     #
	// # - Monitors Duelingbook's actionsQueue for game events                    #
	// # - Manages waiting states for action synchronization                       #
	// # - Handles mobile card menu swapping                                       #
	// #                                                                           #
	// #############################################################################

	window.DBO_lastActionsQueueLength = actionsQueue.length;
}
function fastInjectFunction(cardLogging, bSecond) {
	if (typeof duelist !== "undefined" && duelist) {
		// Reset GY warnings on simultaneous draw
		if (actionsQueue.indexOf(simultaneousDraw) >= 0) {
			window.GYwarning = [];
		}
	}
}
function injectFunction(extensionId, unlockCardMechanics, lowAnimations, silentCommands, birdUI, psctColors, cardLogging, goatCards, edisonCards, negate_icon_blob, skipIntro, autoConnect, extensionBaseUrl) {
	//	let DBO_blob = new Blob([negate_icon_blob[0].text], {type: negate_icon_blob[0].type});

	// ─────────────────────────────────────────────────────────────────────────
	// AUTO LOGIN / SKIP INTRO
	// ─────────────────────────────────────────────────────────────────────────
	if (!window.DBO_LandingHandlersInitialized) {
		window.DBO_LandingHandlersInitialized = true;

		// Listen for manual logout/exit to prevent auto-connect loop
		// selectors: .logout_btn (Logout), #main_exit_btn (Exit to Main Menu)
		const preventAutoConnect = () => {
			sessionStorage.setItem('DBO_preventAutoConnect', 'true');
		};

		// Delegate event listener since buttons might not exist yet
		document.addEventListener('click', function (e) {
			if (e.target.matches('.logout_btn, .logout_btn *, #main_exit_btn, #main_exit_btn *')) {
				preventAutoConnect();
			}
		});

		setInterval(() => {
			const skipBtn = document.getElementById('skip_intro_btn');
			const duelBtn = document.getElementById('duel_btn');

			// Skip Intro
			if (skipIntro && skipBtn && skipBtn.style.display !== 'none') {
				skipBtn.click();
			}

			// Auto Connect (Click Duel Button)
			// Wait until Skip button is gone (intro finished or skipped)
			if (autoConnect && duelBtn && (!skipBtn || skipBtn.style.display === 'none') && duelBtn.offsetParent !== null) {
				if (!sessionStorage.getItem('DBO_preventAutoConnect')) {
					duelBtn.click();
				}
			}
		}, 40);
	}

	// ─────────────────────────────────────────────────────────────────────────
	// INITIALIZATION: Parse settings and set up global variables
	// ─────────────────────────────────────────────────────────────────────────

	// LOW ANIMATIONS: Speed up TweenMax global timescale for better performance
	if (lowAnimations && typeof TweenMax !== 'undefined' && typeof TweenMax.globalTimeScale === 'function') {
		TweenMax.globalTimeScale(2);
	}

	// LOW ANIMATIONS: Override zone selection to remove flashing animations
	if (lowAnimations) {
		window.startChooseMonsterZones = function () {
			if (player1.m1 == null) $('#m1_select').show();
			if (player1.m2 == null) $('#m2_select').show();
			if (player1.m3 == null) $('#m3_select').show();
			if (!duel_links && !speed && !rush) {
				if (player1.m4 == null) $('#m4_select').show();
				if (player1.m5 == null) $('#m5_select').show();
			}
		};

		window.startChooseSpellZones = function () {
			if (player1.s1 == null) $('#s1_select').show();
			if (player1.s2 == null) $('#s2_select').show();
			if (player1.s3 == null) $('#s3_select').show();
			if (!duel_links && !speed && !rush) {
				if (player1.s4 == null) $('#s4_select').show();
				if (player1.s5 == null) $('#s5_select').show();
			}
		};

		// Inject CSS to force static animations on movieclip elements
		var style = document.createElement("style");
		style.innerHTML = `
			.movieclip {
				animation: none !important;
				transition: none !important;
				-webkit-animation: none !important;
				-moz-animation: none !important;
				-o-animation: none !important;
				-ms-animation: none !important;
			}
		`;
		document.head.appendChild(style);
	}

	// BIRD UI: Widen content to allow clicking side buttons
	if (birdUI) {
		$('.db_content').css('width', '1485px');
	}



	let DBO_psctBold, DBO_psctConditionColor, DBO_psctCostColor, DBO_psctLockColor, DBO_psctEffectColor;

	console.log(psctColors)
	DBO_psctBold = psctColors[0];
	DBO_psctConditionColor = psctColors[1];
	DBO_psctCostColor = psctColors[2];
	DBO_psctLockColor = psctColors[3];
	DBO_psctEffectColor = psctColors[4];

	DBO_extensionId = extensionId;
	window.DBO_extensionBaseUrl = extensionBaseUrl || ("chrome-extension://" + extensionId + "/");

	// Injected DBO_ReadFile helper
	window.DBO_ReadFile = function (_path, _cb) {
		fetch(_path).then(r => r.text()).then(t => _cb(t)).catch(e => console.error(e));
	};

	if (typeof DBO_FusionSentThisTurn === "undefined")
		DBO_FusionSentThisTurn = false;

	window.onfocus = function () {
		activateE(0);
	}

	if (typeof window.jQuery === "undefined")
		return;

	window.DBO_constComboDelimiter = "&#*$^%*&#^$*%&#";

	if (typeof window.DBO_waitingForSendAction === "undefined")
		window.DBO_waitingForSendAction = 0;

	if (typeof Mexp === "undefined" && document.readyState == "complete") {
		!function (e, t) { "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : (e = "undefined" != typeof globalThis ? globalThis : e || self).Mexp = t() }(this, (function () { "use strict"; function e() { return e = Object.assign ? Object.assign.bind() : function (e) { for (var t = 1; t < arguments.length; t++) { var n = arguments[t]; for (var a in n) Object.prototype.hasOwnProperty.call(n, a) && (e[a] = n[a]) } return e }, e.apply(this, arguments) } var t, n = { 0: 11, 1: 0, 2: 3, 3: 0, 4: 0, 5: 0, 6: 0, 7: 11, 8: 11, 9: 1, 10: 10, 11: 0, 12: 11, 13: 0, 14: -1 }; function a(e, t) { for (var n = 0; n < e.length; n++)e[n] += t; return e } !function (e) { e[e.FUNCTION_WITH_ONE_ARG = 0] = "FUNCTION_WITH_ONE_ARG", e[e.NUMBER = 1] = "NUMBER", e[e.BINARY_OPERATOR_HIGH_PRECENDENCE = 2] = "BINARY_OPERATOR_HIGH_PRECENDENCE", e[e.CONSTANT = 3] = "CONSTANT", e[e.OPENING_PARENTHESIS = 4] = "OPENING_PARENTHESIS", e[e.CLOSING_PARENTHESIS = 5] = "CLOSING_PARENTHESIS", e[e.DECIMAL = 6] = "DECIMAL", e[e.POSTFIX_FUNCTION_WITH_ONE_ARG = 7] = "POSTFIX_FUNCTION_WITH_ONE_ARG", e[e.FUNCTION_WITH_N_ARGS = 8] = "FUNCTION_WITH_N_ARGS", e[e.BINARY_OPERATOR_LOW_PRECENDENCE = 9] = "BINARY_OPERATOR_LOW_PRECENDENCE", e[e.BINARY_OPERATOR_PERMUTATION = 10] = "BINARY_OPERATOR_PERMUTATION", e[e.COMMA = 11] = "COMMA", e[e.EVALUATED_FUNCTION = 12] = "EVALUATED_FUNCTION", e[e.EVALUATED_FUNCTION_PARAMETER = 13] = "EVALUATED_FUNCTION_PARAMETER", e[e.SPACE = 14] = "SPACE" }(t || (t = {})); var o = { 0: !0, 1: !0, 3: !0, 4: !0, 6: !0, 8: !0, 9: !0, 12: !0, 13: !0, 14: !0 }, h = { 0: !0, 1: !0, 2: !0, 3: !0, 4: !0, 5: !0, 6: !0, 7: !0, 8: !0, 9: !0, 10: !0, 11: !0, 12: !0, 13: !0 }, r = { 0: !0, 3: !0, 4: !0, 8: !0, 12: !0, 13: !0 }, u = {}, s = { 0: !0, 1: !0, 3: !0, 4: !0, 6: !0, 8: !0, 12: !0, 13: !0 }, p = { 1: !0 }, i = [[], ["1", "2", "3", "7", "8", "9", "4", "5", "6", "+", "-", "*", "/", "(", ")", "^", "!", "P", "C", "e", "0", ".", ",", "n", " ", "&"], ["pi", "ln", "Pi"], ["sin", "cos", "tan", "Del", "int", "Mod", "log", "pow"], ["asin", "acos", "atan", "cosh", "root", "tanh", "sinh"], ["acosh", "atanh", "asinh", "Sigma"]]; function l(e, t, n, a) { for (var o = 0; o < a; o++)if (e[n + o] !== t[o]) return !1; return !0 } function v(e) { for (var a = 0; a < e.length; a++) { var o = e[a].token.length, h = -1; e[a].type === t.FUNCTION_WITH_N_ARGS && void 0 === e[a].numberOfArguments && (e[a].numberOfArguments = 2), i[o] = i[o] || []; for (var r = 0; r < i[o].length; r++)if (e[a].token === i[o][r]) { h = f(i[o][r], this.tokens); break } -1 === h ? (this.tokens.push(e[a]), e[a].precedence = n[e[a].type], i.length <= e[a].token.length && (i[e[a].token.length] = []), i[e[a].token.length].push(e[a].token)) : (this.tokens[h] = e[a], e[a].precedence = n[e[a].type]) } } function f(e, t) { for (var n = 0; n < t.length; n++)if (t[n].token === e) return n; return -1 } var y = function (e, t) { var n, v = { value: this.math.changeSign, type: 0, precedence: 1, show: "-" }, y = { value: ")", show: ")", type: 5, precedence: 0 }, c = { value: "(", type: 4, precedence: 0, show: "(" }, w = [c], m = [], E = e, g = o, N = 0, d = u, A = ""; void 0 !== t && this.addToken(t); var k = function (e, t) { for (var n, a, o, h = [], r = t.length, u = 0; u < r; u++)if (!(u < r - 1 && " " === t[u] && " " === t[u + 1])) { for (n = "", a = t.length - u > i.length - 2 ? i.length - 1 : t.length - u; a > 0; a--)if (void 0 !== i[a]) for (o = 0; o < i[a].length; o++)l(t, i[a][o], u, a) && (n = i[a][o], o = i[a].length, a = 0); if (u += n.length - 1, "" === n) throw new Error("Can't understand after " + t.slice(u)); h.push(e.tokens[f(n, e.tokens)]) } return h }(this, E); for (n = 0; n < k.length; n++) { var M = k[n]; if (14 !== M.type) { var O, T = M.token, _ = M.type, I = M.value, P = M.precedence, R = M.show, C = w[w.length - 1]; for (O = m.length; O-- && 0 === m[O];)if (-1 !== [0, 2, 3, 4, 5, 9, 10, 11, 12, 13].indexOf(_)) { if (!0 !== g[_]) throw new Error(T + " is not allowed after " + A); w.push(y), g = h, d = s, m.pop() } if (!0 !== g[_]) throw new Error(T + " is not allowed after " + A); !0 === d[_] && (_ = 2, I = this.math.mul, R = "&times;", P = 3, n -= 1); var S = { value: I, type: _, precedence: P, show: R, numberOfArguments: M.numberOfArguments }; if (0 === _) g = o, d = u, a(m, 2), w.push(S), 4 !== k[n + 1].type && (w.push(c), m.push(2)); else if (1 === _) 1 === C.type ? (C.value += I, a(m, 1)) : w.push(S), g = h, d = r; else if (2 === _) g = o, d = u, a(m, 2), w.push(S); else if (3 === _) w.push(S), g = h, d = s; else if (4 === _) a(m, 1), N++, g = o, d = u, w.push(S); else if (5 === _) { if (!N) throw new Error("Closing parenthesis are more than opening one, wait What!!!"); N--, g = h, d = s, w.push(S), a(m, 1) } else if (6 === _) { if (C.hasDec) throw new Error("Two decimals are not allowed in one number"); 1 !== C.type && (C = { show: "0", value: 0, type: 1, precedence: 0 }, w.push(C)), g = p, a(m, 1), d = u, C.value += I, C.hasDec = !0 } else 7 === _ && (g = h, d = s, a(m, 1), w.push(S)); 8 === _ ? (g = o, d = u, a(m, M.numberOfArguments + 2), w.push(S), 4 !== k[n + 1].type && (w.push(c), m.push(M.numberOfArguments + 2))) : 9 === _ ? (9 === C.type ? C.value === this.math.add ? (C.value = I, C.show = R, a(m, 1)) : C.value === this.math.sub && "-" === R && (C.value = this.math.add, C.show = "+", a(m, 1)) : 5 !== C.type && 7 !== C.type && 1 !== C.type && 3 !== C.type && 13 !== C.type ? "-" === T && (g = o, d = u, a(m, 2).push(2), w.push(v), w.push(c)) : (w.push(S), a(m, 2)), g = o, d = u) : 10 === _ ? (g = o, d = u, a(m, 2), w.push(S)) : 11 === _ ? (g = o, d = u, w.push(S)) : 12 === _ ? (g = o, d = u, a(m, 6), w.push(S), 4 !== k[n + 1].type && (w.push(c), m.push(6))) : 13 === _ && (g = h, d = s, w.push(S)), a(m, -1), A = T } else if (n > 0 && n < k.length - 1 && 1 === k[n + 1].type && (1 === k[n - 1].type || 6 === k[n - 1].type)) throw new Error("Unexpected Space") } for (O = m.length; O--;)w.push(y); if (!0 !== g[5]) throw new Error("complete the expression"); for (; N--;)w.push(y); return w.push(y), w }; function c(e) { for (var t, n, a, o = [], h = -1, r = -1, u = [{ value: "(", type: 4, precedence: 0, show: "(" }], s = 1; s < e.length; s++)if (1 === e[s].type || 3 === e[s].type || 13 === e[s].type) 1 === e[s].type && (e[s].value = Number(e[s].value)), o.push(e[s]); else if (4 === e[s].type) u.push(e[s]); else if (5 === e[s].type) for (; 4 !== (null == (p = n = u.pop()) ? void 0 : p.type);) { var p; n && o.push(n) } else if (11 === e[s].type) { for (; 4 !== (null == (i = n = u.pop()) ? void 0 : i.type);) { var i; n && o.push(n) } u.push(n) } else { r = (t = e[s]).precedence, h = (a = u[u.length - 1]).precedence; var l = "Math.pow" == a.value && "Math.pow" == t.value; if (r > h) u.push(t); else { for (; h >= r && !l || l && r < h;)n = u.pop(), a = u[u.length - 1], n && o.push(n), h = a.precedence, l = "Math.pow" == t.value && "Math.pow" == a.value; u.push(t) } } return o } function w(e, t) { (t = t || {}).PI = Math.PI, t.E = Math.E; for (var n, a, o, h = [], r = void 0 !== t.n, u = 0; u < e.length; u++)if (1 === e[u].type) h.push({ value: e[u].value, type: 1 }); else if (3 === e[u].type) h.push({ value: t[e[u].value], type: 1 }); else if (0 === e[u].type) { var s = h[h.length - 1]; Array.isArray(s) ? s.push(e[u]) : s.value = e[u].value(s.value) } else if (7 === e[u].type) { var p = h[h.length - 1]; Array.isArray(p) ? p.push(e[u]) : p.value = e[u].value(p.value) } else if (8 === e[u].type) { for (var i = [], l = 0; l < e[u].numberOfArguments; l++) { var v = h.pop(); v && i.push(v.value) } h.push({ type: 1, value: e[u].value.apply(e[u], i.reverse()) }) } else if (10 === e[u].type) n = h.pop(), a = h.pop(), Array.isArray(a) ? ((a = a.concat(n)).push(e[u]), h.push(a)) : Array.isArray(n) ? (n.unshift(a), n.push(e[u]), h.push(n)) : h.push({ type: 1, value: e[u].value(a.value, n.value) }); else if (2 === e[u].type || 9 === e[u].type) n = h.pop(), a = h.pop(), Array.isArray(a) ? ((a = a.concat(n)).push(e[u]), h.push(a)) : Array.isArray(n) ? (n.unshift(a), n.push(e[u]), h.push(n)) : h.push({ type: 1, value: e[u].value(a.value, n.value) }); else if (12 === e[u].type) { n = h.pop(); var f = void 0; f = !Array.isArray(n) && n ? [n] : n || [], a = h.pop(), o = h.pop(), h.push({ type: 1, value: e[u].value(o.value, a.value, f) }) } else 13 === e[u].type && (r ? h.push({ value: t[e[u].value], type: 3 }) : h.push([e[u]])); if (h.length > 1) throw new Error("Uncaught Syntax error"); return parseFloat(h[0].value.toFixed(15)) } var m = function () { function t() { var t; this.toPostfix = c, this.addToken = v, this.lex = y, this.postfixEval = w, this.math = (t = this, { isDegree: !0, acos: function (e) { return t.math.isDegree ? 180 / Math.PI * Math.acos(e) : Math.acos(e) }, add: function (e, t) { return e + t }, asin: function (e) { return t.math.isDegree ? 180 / Math.PI * Math.asin(e) : Math.asin(e) }, atan: function (e) { return t.math.isDegree ? 180 / Math.PI * Math.atan(e) : Math.atan(e) }, acosh: function (e) { return Math.log(e + Math.sqrt(e * e - 1)) }, asinh: function (e) { return Math.log(e + Math.sqrt(e * e + 1)) }, atanh: function (e) { return Math.log((1 + e) / (1 - e)) }, C: function (e, n) { var a = 1, o = e - n, h = n; h < o && (h = o, o = n); for (var r = h + 1; r <= e; r++)a *= r; var u = t.math.fact(o); return "NaN" === u ? "NaN" : a / u }, changeSign: function (e) { return -e }, cos: function (e) { return t.math.isDegree && (e = t.math.toRadian(e)), Math.cos(e) }, cosh: function (e) { return (Math.pow(Math.E, e) + Math.pow(Math.E, -1 * e)) / 2 }, div: function (e, t) { return e / t }, fact: function (e) { if (e % 1 != 0) return "NaN"; for (var t = 1, n = 2; n <= e; n++)t *= n; return t }, inverse: function (e) { return 1 / e }, log: function (e) { return Math.log(e) / Math.log(10) }, mod: function (e, t) { return e % t }, mul: function (e, t) { return e * t }, P: function (e, t) { for (var n = 1, a = Math.floor(e) - Math.floor(t) + 1; a <= Math.floor(e); a++)n *= a; return n }, Pi: function (e, n, a) { for (var o = 1, h = e; h <= n; h++)o *= Number(t.postfixEval(a, { n: h })); return o }, pow10x: function (e) { for (var t = 1; e--;)t *= 10; return t }, sigma: function (e, n, a) { for (var o = 0, h = e; h <= n; h++)o += Number(t.postfixEval(a, { n: h })); return o }, sin: function (e) { return t.math.isDegree && (e = t.math.toRadian(e)), Math.sin(e) }, sinh: function (e) { return (Math.pow(Math.E, e) - Math.pow(Math.E, -1 * e)) / 2 }, sub: function (e, t) { return e - t }, tan: function (e) { return t.math.isDegree && (e = t.math.toRadian(e)), Math.tan(e) }, tanh: function (e) { return t.math.sinh(e) / t.math.cosh(e) }, toRadian: function (e) { return e * Math.PI / 180 }, and: function (e, t) { return e & t } }), this.tokens = function (t) { return [{ token: "sin", show: "sin", type: 0, value: t.math.sin }, { token: "cos", show: "cos", type: 0, value: t.math.cos }, { token: "tan", show: "tan", type: 0, value: t.math.tan }, { token: "pi", show: "&pi;", type: 3, value: "PI" }, { token: "(", show: "(", type: 4, value: "(" }, { token: ")", show: ")", type: 5, value: ")" }, { token: "P", show: "P", type: 10, value: t.math.P }, { token: "C", show: "C", type: 10, value: t.math.C }, { token: " ", show: " ", type: 14, value: " ".anchor }, { token: "asin", show: "asin", type: 0, value: t.math.asin }, { token: "acos", show: "acos", type: 0, value: t.math.acos }, { token: "atan", show: "atan", type: 0, value: t.math.atan }, { token: "7", show: "7", type: 1, value: "7" }, { token: "8", show: "8", type: 1, value: "8" }, { token: "9", show: "9", type: 1, value: "9" }, { token: "int", show: "Int", type: 0, value: Math.floor }, { token: "cosh", show: "cosh", type: 0, value: t.math.cosh }, { token: "acosh", show: "acosh", type: 0, value: t.math.acosh }, { token: "ln", show: " ln", type: 0, value: Math.log }, { token: "^", show: "^", type: 10, value: Math.pow }, { token: "root", show: "root", type: 0, value: Math.sqrt }, { token: "4", show: "4", type: 1, value: "4" }, { token: "5", show: "5", type: 1, value: "5" }, { token: "6", show: "6", type: 1, value: "6" }, { token: "/", show: "&divide;", type: 2, value: t.math.div }, { token: "!", show: "!", type: 7, value: t.math.fact }, { token: "tanh", show: "tanh", type: 0, value: t.math.tanh }, { token: "atanh", show: "atanh", type: 0, value: t.math.atanh }, { token: "Mod", show: " Mod ", type: 2, value: t.math.mod }, { token: "1", show: "1", type: 1, value: "1" }, { token: "2", show: "2", type: 1, value: "2" }, { token: "3", show: "3", type: 1, value: "3" }, { token: "*", show: "&times;", type: 2, value: t.math.mul }, { token: "sinh", show: "sinh", type: 0, value: t.math.sinh }, { token: "asinh", show: "asinh", type: 0, value: t.math.asinh }, { token: "e", show: "e", type: 3, value: "E" }, { token: "log", show: " log", type: 0, value: t.math.log }, { token: "0", show: "0", type: 1, value: "0" }, { token: ".", show: ".", type: 6, value: "." }, { token: "+", show: "+", type: 9, value: t.math.add }, { token: "-", show: "-", type: 9, value: t.math.sub }, { token: ",", show: ",", type: 11, value: "," }, { token: "Sigma", show: "&Sigma;", type: 12, value: t.math.sigma }, { token: "n", show: "n", type: 13, value: "n" }, { token: "Pi", show: "&Pi;", type: 12, value: t.math.Pi }, { token: "pow", show: "pow", type: 8, value: Math.pow, numberOfArguments: 2 }, { token: "&", show: "&", type: 9, value: t.math.and }].map((function (t) { return e({}, t, { precedence: n[t.type] }) })) }(this) } return t.prototype.eval = function (e, t, n) { return this.postfixEval(this.toPostfix(this.lex(e, t)), n) }, t }(); return m.TOKEN_TYPES = t, m.tokenTypes = t, m }));
	}

	if (typeof KeyPressing === "undefined" && document.readyState == "complete") {
		// Key pressing detector. What is this black magic? How does it even work?
	}

	// ─────────────────────────────────────────────────────────────────────────
	// GLOBAL SETTINGS: Set up window-level feature flags
	// ─────────────────────────────────────────────────────────────────────────

	window.DBO_unlockCardMechanics = unlockCardMechanics;
	window.DBO_silentCommands = silentCommands;
	window.DBO_EdisonCardpool = edisonCards;
	window.DBO_GoatCardpool = goatCards;

	window.DBO_FuncDoNothing = function () {
		return;
	}

	window.DBO_ActionQueueDoNothing = function () {
		return;
	}

	if (typeof DBO_checkHeartbeat !== "undefined")
		console.log("Beat");

	// Start of events related to enabling passive events without preventDefault error.
	window.addDragging0 = function (element, parent, start_function, end_function) {
		if (!parent) {
			parent = element;
		}
		element.mousedown(function handle_mousedown(e) {
			// Prevents unwanted errors...
			//e.preventDefault(); // prevents unwanted text selection
			updateMouse(e);
			if (start_function) {
				start_function();
			}
			var dragXOffset = mouseXScaled - parseInt(parent.css("left"));
			var dragYOffset = mouseYScaled - parseInt(parent.css("top"));
			$('html').mousemove(function (e) {
				updateMouse(e);
				TweenMax.to(parent, 0, { left: mouseXScaled - dragXOffset, top: mouseYScaled - dragYOffset });
			});
			$('html').mouseup(function (e) {
				$('html').off("mousemove");
				$('html').off("mouseup");
				if (end_function) {
					end_function();
				}
			});
		});
	}
	// End of events related to enabling passive events without preventDefault error.

	if (typeof window.DBO_keys === "undefined")
		window.DBO_keys = {};

	// ─────────────────────────────────────────────────────────────────────────
	// KEYBOARD EVENTS: Key press handling
	// ─────────────────────────────────────────────────────────────────────────

	window.DBO_OnKeyDown = function (evt) {
		DBO_keys[evt.keyCode] = true;
	}

	window.DBO_OnKeyPressed = function (evt) {
		DBO_keys[evt.keyCode] = false;

		if (DBO_unlockCardMechanics && duelist) {
			// ESC
			if (evt.keyCode == 27) {
				if (viewing) {
					$("#view .exit_btn").mouseup();
				}

				hideSelectZones();
			}
		}
	}





	// Focus on page center.
	if (window.scrollX != 0 || window.scrollY != 0) {
		window.scroll(0, 0);
	}

	// ─────────────────────────────────────────────────────────────────────────
	// BIRD UI: Left-click card interaction mode
	// Settings: birdUI - adjusts swfWidth for field sizing
	// ─────────────────────────────────────────────────────────────────────────

	swfWidth = 0x400;

	if (typeof my_profile_data === 'undefined') {
		window.my_profile_data = null;
	}


	if (typeof window.DBO_waitingForAction === 'undefined') {
		window.DBO_waitingForAction = false;
	}

	window.DBO_showDuelNSFW = function () {
		$(this).siblings('.nsfw').css("opacity", 0);
		$(this).siblings('.nsfw').hide();
		$(this).hide();

		switch (this) {
			case $('#avatar1 .nsfw_btn')[0]:
				if (typeof window.oldSleeves1 !== 'undefined') {
					player1.sleeve = window.oldSleeves1;
					window.oldSleeves1 = undefined;
					loadSleeves(player1);
				}
				break;

			case $('#avatar2 .nsfw_btn')[0]:
				if (typeof window.oldSleeves2 !== 'undefined') {
					player2.sleeve = window.oldSleeves2;
					window.oldSleeves2 = undefined;
					loadSleeves(player2);
				}
				break;

			case $('#avatar3 .nsfw_btn')[0]:
				if (typeof window.oldSleeves3 !== 'undefined') {
					player3.sleeve = window.oldSleeves3;
					window.oldSleeves3 = undefined;
					loadSleeves(player3);
				}
				break;

			case $('#avatar4 .nsfw_btn')[0]:
				if (typeof window.oldSleeves4 !== 'undefined') {
					player4.sleeve = window.oldSleeves4;
					window.oldSleeves4 = undefined;
					loadSleeves(player4);
				}
				break;
		}


	}

	if (typeof window.GYwarning === 'undefined') {
		window.GYwarning = [];
	}

	window.DBO_startTurnE = function () {
		if (awaiting_start_turn) {
			return;
		}

		let DBO_count = 0;

		if (DBO_FusionSentThisTurn == true) {
			for (let abc = 0; abc < player1.grave_arr.length; abc++) {
				if (DBO_IsCardEcclesiaLike(player1.grave_arr[abc])) {
					window.GYwarning.push(player1.grave_arr[abc]);
				}
			}

			DBO_FusionSentThisTurn = false;
		}

		if (window.GYwarning.length > 0) {
			// Remove duplicates. This doesn't appear to like using the original variable.
			let dummy_arr = [];
			dummy_arr = [...new Map(GYwarning.map((m) => [m.data("cardfront").data("name"), m])).values()];
			GYwarning = [].concat(dummy_arr);

			let DBO_msg = "You have End Phase GY effects:<br>"
			let DBO_max = 5;

			let Unique_arr = [];
			for (let abc = 0; abc < window.GYwarning.length; abc++) {
				if (DBO_count == DBO_max)
					break;

				else if (isIn(window.GYwarning[abc], player1.grave_arr) == -1)
					continue;

				else if (Unique_arr.indexOf(window.GYwarning[abc].data("id")) >= 0)
					continue;

				DBO_msg = DBO_msg + window.GYwarning[abc].data("cardfront").data("name") + "<br>"
				DBO_count++;
				Unique_arr.push(window.GYwarning[abc].data("id"));
			}

			if (DBO_count > 0) {
				getConfirmation2("GY Warning", DBO_msg, undefined, undefined, undefined, true);
			}
		}

		if (DBO_count == 0) {
			Send({ "action": "Duel", "play": "Start turn", "draw": $('#auto_draw_cb').is(":checked") });
		}


		window.GYwarning = [];
	}

	window.DBO_endTurnE = function () {

		let DBO_count = 0;

		if (DBO_FusionSentThisTurn == true) {
			for (let abc = 0; abc < player1.grave_arr.length; abc++) {
				if (DBO_IsCardEcclesiaLike(player1.grave_arr[abc])) {
					window.GYwarning.push(player1.grave_arr[abc]);
				}
			}

			DBO_FusionSentThisTurn = false;
		}

		if (window.GYwarning.length > 0) {
			let DBO_msg = "You have End Phase GY effects:<br>"
			let DBO_max = 5;

			let Unique_arr = [];

			for (let abc = 0; abc < window.GYwarning.length; abc++) {
				if (DBO_count == DBO_max)
					break;

				else if (isIn(window.GYwarning[abc], player1.grave_arr) == -1)
					continue;

				else if (Unique_arr.indexOf(window.GYwarning[abc].data("id")) >= 0)
					continue;

				DBO_msg = DBO_msg + window.GYwarning[abc].data("cardfront").data("name") + "<br>"
				DBO_count++;
				Unique_arr.push(window.GYwarning[abc].data("id"));
			}


			if (DBO_count > 0) {
				getConfirmation("GY Warning", DBO_msg, undefined, undefined, true);
			}
		}

		if (DBO_count == 0) {
			Send({ "action": "Duel", "play": "End turn" });
		}

		window.GYwarning = [];
	}

	window.toGY = function (player, data) {
		console.time("DBO_Test");
		var card = removeCard(player, data);
		if (!card) {
			card = removeFromBanished(player.opponent, data);
		}

		console.timeEnd("DBO_Test");
		console.time("DBO_Test2");
		updateController(card.data("owner"), card);
		card.data("cardfront").reinitialize(data.card);
		card.data("face_down", false);
		$('#field').append(card);

		card.data("owner").grave_arr.unshift(card);
		console.timeEnd("DBO_Test2");
		console.time("DBO_Test3");
		TweenMax.to(card, easeSeconds, {
			left: card.data("owner").graveX, top: card.data("owner").graveY, scale: 0.1485, rotation: card.data("owner").rot, rotationY: ABOUT_ZERO, ease: Linear.easeNone, onComplete: function () {

				console.timeEnd("DBO_Test3");
				console.time("DBO_Test4");
				shiftGrave(card.data("owner"));
				endAction();

				console.timeEnd("DBO_Test4");
			}
		});
		playSound(Move);

		if (card.data("owner") == player1 && card && card.data("cardfront") && card.data("cardfront").data("effect").search(/During the End Phase, if this card is in the GY because it was sent there this turn:/i) != -1) {
			window.GYwarning.push(card)
		}

		if (card.data("owner") == player1 && card && card.data("cardfront") && card.data("cardfront").data("monster_color") == "Fusion") {
			window.DBO_FusionSentThisTurn = true;
		}
	}

	window.mill = function (player, data) {
		var card = removeTopCardFromDeck(player);
		updateController(card.data("owner"), card);
		card.data("cardfront").reinitialize(data.card);
		$('#field').append(card);

		card.data("owner").grave_arr.unshift(card);
		TweenMax.to(card, easeSecondsBanish, {
			left: card.data("owner").graveX, top: card.data("owner").graveY, rotation: card.data("owner").rot, rotationY: ABOUT_ZERO, ease: Linear.easeNone, onComplete: function () {
				shiftGrave(card.data("owner"));
				endAction();
			}
		});
		playSound(Move);

		if (card.data("owner") == player1 && card && card.data("cardfront").data("effect").search(/During the End Phase, if this card is in the GY because it was sent there this turn:/i) != -1) {
			window.GYwarning.push(card)
		}
	}

	window.DBO_hideDuelNSFW = function () {
		if (solo && this == $('#avatar2 .rating')[0]) {
			return;
		}
		$(this).siblings('.nsfw').css("opacity", 1);
		$(this).siblings('.nsfw').show();
		$(this).siblings('.nsfw_btn').show();
		$(this).siblings('.nsfw_btn').val("Show Image");

		switch (this) {
			case $('#avatar1 .rating')[0]:
				if (typeof window.oldSleeves1 === 'undefined') {
					window.oldSleeves1 = player1.sleeve;
					player1.sleeve = '1.jpg';
					loadSleeves(player1)
				}
				break;

			case $('#avatar2 .rating')[0]:
				if (typeof window.oldSleeves2 === 'undefined') {
					window.oldSleeves2 = player2.sleeve;
					player2.sleeve = '1.jpg';
					loadSleeves(player2)
				}
				break;

			case $('#avatar3 .rating')[0]:
				if (typeof window.oldSleeves3 === 'undefined') {
					window.oldSleeves3 = player3.sleeve;
					player3.sleeve = '1.jpg';
					loadSleeves(player3)
				}
				break;

			case $('#avatar4 .rating')[0]:
				if (typeof window.oldSleeves4 === 'undefined') {
					window.oldSleeves4 = player4.sleeve;
					player4.sleeve = '1.jpg';
					loadSleeves(player4)
				}
				break;
		}
	}


	window.drawCard = function (player, data) {
		if (data.username == username && $('#mulligan_btn').length == 1) {
			$('#mulligan_btn').hide();
			$('#draw_btn').show();
		}
		var card = removeTopCardFromDeck(player);
		player.hand_arr.push(card);
		determineHandPosition(player);
		organizeHand(player);
		card.data("cardfront").reinitialize(data.card);
		var rotY = 180 + ABOUT_ZERO;
		if ((show_cards && player == Player1()) || (show_cards == 2)) {
			rotY = ABOUT_ZERO;
		}
		TweenMax.to(card, easeSeconds, {
			left: handDestination, top: player.handY, scale: 0.25, rotation: player.rot, rotationY: rotY, ease: Linear.easeNone, onComplete: function () {
				endAction();
			}
		});
		$('#duel .cards').append(card);

		playSound(DrawSound);

	}

	// leaveDuel duelLeave duelOver
	window.exitDueling = function () {

		$('#field').hide();
		$('#duel .card').detach();
		$('.all_good').hide();
		recycleCards();
		removeFieldSpellPic();

		// Dev here.

		DBO_lastCardAction = undefined;


	}

	if (typeof window.DBO_originalStartDuel === "undefined" && typeof window.startDuel !== "undefined" && typeof window.initPlayers !== "undefined" && typeof window.duelChatLoaded !== "undefined") {
		Function.prototype.clone = function () {
			var that = this;
			var temp = function temporary() { return that.apply(this, arguments); };
			for (var key in this) {
				if (this.hasOwnProperty(key)) {
					temp[key] = this[key];
				}
			}
			return temp;
		};

		console.log("If this appears more than twice, insane issues");

		window.DBO_originalStartDuel = window.startDuel.clone();
		window.DBO_originalInitPlayers = window.initPlayers.clone();
		window.DBO_originalDuelChatLoaded = window.duelChatLoaded.clone();

		window.startDuel = function (data) {
			DBO_startDuelPre(data);

			DBO_originalStartDuel(data);

			DBO_startDuelPost(data);
		}

		window.initPlayers = function (data) {
			DBO_startDuelInitPlayersPre(data);

			DBO_originalInitPlayers(data);

			DBO_startDuelInitPlayersPost(data);

		}

		window.duelChatLoaded = function (data) {
			DBO_originalDuelChatLoaded(data);

			DBO_OnDuelChatLoaded(data);
		}
	}

	// Too early to addLine here.
	window.DBO_startDuelPre = function (data) {
		let DBO_list = document.querySelectorAll("div")

		for (let abc = 0; abc < DBO_list.length; abc++) {
			if (!DBO_list[abc].id.startsWith("Imperm_Column_Real"))
				continue;

			$(DBO_list[abc]).remove();
		}

		$("#target_select").remove();
		$("#atk_position_select").remove();
		$("#def_position_select").remove();
		$("#bottom_deck_select").remove();
		$("#overlay_select").remove();

		window.DBO_RealImpermColumns = [false, false, false, false, false];

		window.DBO_preErratas = false;

		if (!data.links) {
			getConfirmation("Play with Edison's pre-erratas?", "", DBO_preErratasYes);
		}
	}

	// Too early to addLine here.
	window.DBO_startDuelPost = function (data) {
		// Music removed - no longer playing sounds

		DBO_comboPlayIndex = undefined;

		console.log("Start Dull");
		console.log(data);
	}

	window.DBO_startDuelInitPlayersPre = function (data) {

	}

	// You may addLine unless "DBO_OnDuelChatLoaded" gets called a few moments later.
	window.DBO_startDuelInitPlayersPost = function (data) {
		if (DBO_keys[17]) {
			DBO_addColoredLine("FF0000", "DB Unlock here, I think your CTRL button bugged. Try pressing it");
		}
	}

	window.DBO_OnDuelChatLoaded = function (data) {

		if (duelist) {
			DBO_swapCardMenuForPlayer(player1);
		}
		if (DBO_keys[17]) {
			DBO_addColoredLine("FF0000", "DB Unlock here, I think your CTRL button bugged. Try pressing it");
		}
	}
	window.DBO_preErratasYes = function () {
		window.DBO_preErratas = true;
	}
	window.updateLifePoints = function (player, data) {
		var wid = 0;
		prev_life = player.lifepoints;
		life_amount = data.amount;
		player.lifepoints = data.life;
		if (player.lifepoints < 0) {
			player.lifepoints = 0;
		}
		wid = 154 - player.lifepoints / lifepointMax * 154;
		if (player.lifepoints >= lifepointMax) {
			wid = 0;
		}
		var word = " lost ";
		var points = -data.amount;
		if (data.amount > 0) {
			word = " gained ";
			points = data.amount;
		}
		var animation;
		var life_bar = isPlayer2(player.username) ? $('#lifepoints2') : $('#lifepoints1');
		var lifepoints_tween = TweenMax.to(life_bar.find('.black_bar'), 1, {
			width: wid, ease: Expo.easeOut, onComplete: function () {
				clearInterval(animation);
				life_bar.find('.life_txt').text(player.lifepoints);
				addLine(escapeHTML(player.username) + word + points + " LP");
				if (player.lifepoints <= 0) {
					playSound(LifePointsEnd);
				}
				endAction();
			}
		});
		animation = setInterval(function () {
			life_bar.find('.life_txt').text(prev_life + Math.floor(lifepoints_tween.progress() * life_amount));
		}, 42);
		playSound(LifePoints);
	}

	window.playSound = function (sound, reset) {
		if (reset !== false) {
			reset = true;
		}
		try {
			if (typeof (sound) == "string") {
				for (var i = 0; i < audio_arr.length; i++) {
					if (audio_arr[i].getAttribute("src") == sound) {
						sound = audio_arr[i];
						break;
					}
				}
				if (i == audio_arr.length) {
					sound = new Audio(sound);
					//sound.attr("playsinline", "playsinline");
				}
			}
			var s = sound;
			if (!sound.paused) {
				s = sound.cloneNode();
			}
			if ($('#cross').is(":visible")) {
				s.volume = 0;
			}
			else {
				s.volume = 0.35;
			}
			if (reset) {
				s.currentTime = 0;
			}
			else {
				sound.play();
				return;
			}
			s.play();
			audio_arr.push(s);
		}
		catch (err) {
			console.error(err);
		}
	}

	// Music playback functions removed - replaced with empty stubs
	window.DBO_tryStartMusicAsync = async function (bForceContinue) {
		// Music feature removed - do nothing
	}
	window.DBO_tryStartMusic = function (bForceContinue) {
		// Music feature removed - do nothing
	}


	window.Negate = function (str) {
		let obj = $('<div class="counter"></div>');

		if (str) {
			obj.attr("id", str);
		}
		var content = $('<div class="content"></div>');
		var background = $('<img class="background" src="' + IMAGES_START + 'svg/forbidden.svg" />');
		var glow = $('<img class="glow" src="' + IMAGES_START + 'svg/counter_glow.svg" />');
		glow.hide();

		var total_txt = $('<span class="total_txt">1</span>');

		content.append(background);
		content.append(glow);
		obj.append(content);
		obj.append(total_txt);

		obj.mouseover(function () {
			glow.show();
		});
		obj.mouseout(function () {
			glow.hide();
		});
		return obj;
	}

	window.DBO_createNegateButton = function () {
		return;

		if ($("#counter_btn").length > 0) {
			if ($("#negate_btn").length == 0) {

				$('html > head').append($(`<style>
					#m1_negate
					{
						left: 347.5px;
						top: 374px;
					}
					#m2_negate 
					{
						left: 440.5px;
						top: 374px;
					}
					#m3_negate 
					{
						left: 533.5px;
						top: 374px;
					}
					#m4_negate 
					{
						left: 626.5px;
						top: 374px;
					}
					#m5_negate 
					{
						left: 719.5px;
						top: 374px;
					}
					#s1_negate 
					{
						left: 347.5px;
						top: 467px;
					}
					#s2_negate 
					{
						left: 440.5px;
						top: 467px;
					}
					#s3_negate 
					{
						left: 533.5px;
						top: 467px;
					}
					#s4_negate 
					{
						left: 626.5px;
						top: 467px;
					}
					#s5_negate 
					{
						left: 719.5px;
						top: 467px;
					}
					#field_spell_negate 
					{
						left: 235.5px;
						top: 327.5px;
					}
					#pendulum_left_negate 
					{
						left: 265.5px;
						top: 420.5px;
					}
					#pendulum_right_negate 
					{
						left: 796.5px;
						top: 420.5px;
					}
					#opp_m1_negate 
					{
						left: 694px;
						top: 147px;
					}
					#opp_m2_negate 
					{
						left: 601px;
						top: 147px;
					}
					#opp_m3_negate 
					{
						left: 508px;
						top: 147px;
					}
					#opp_m4_negate 
					{
						left: 414px;
						top: 147px;
					}
					#opp_m5_negate 
					{
						left: 323px;
						top: 147px;
					}
					#opp_s1_negate 
					{
						left: 694px;
						top: 40.5px;
					}
					#opp_s2_negate 
					{
						left: 601px;
						top: 40.5px;
					}
					#opp_s3_negate 
					{
						left: 508px;
						top: 40.5px;
					}
					#opp_s4_negate 
					{
						left: 414px;
						top: 40.5px;
					}
					#opp_s5_negate 
					{
						left: 323px;
						top: 40.5px;
					}
					#opp_field_spell_negate 
					{
						left: 790px;
						top: 180.5px;
					}
					#opp_pendulum_left_negate 
					{
						left: 774.5px;
						top: 87px;
					}
					#opp_pendulum_right_negate 
					{
						left: 242.5px;
						top: 87px;
					}
					#left_link_negate 
					{
						left: 415px;
						top: 238px;
					}
					#right_link_negate 
					{
						left: 626.5px;
						top: 280.5px;
					}
					#skill_card_negate 
					{
						left: 745px !important;
						top: 280.5px;
					}
					#opp_skill_card_negate
					{
						left: 295px !important;
						top: 238px;
					}</style>`));

				$("#duel #field_content").append($(
					`<div class="negate ui-draggable ui-draggable-handle" id="negate_btn" style="cursor: pointer; pointer-events: auto; width: 23px; height: 25px; top: 435px; left: 240px;">
				<div class="content"><img class="background" src="https://images.duelingbook.com/svg/forbidden.svg" style="width: 23px; height: 25px;">
				<img class="glow" src="https://images.duelingbook.com/svg/counter_glow.svg" style="display: none;">
				</div><span class="total_txt" style="display: none;">1</span></div>`));


				window.negate_btn = $("#negate_btn");

				window.negate = new Negate();

				negate.find('.glow').detach();
				negate.find('.total_txt').hide();

				window.m1_negate = new Negate("m1_negate");
				window.m2_negate = new Negate("m2_negate");
				window.m3_negate = new Negate("m3_negate");
				window.m4_negate = new Negate("m4_negate");
				window.m5_negate = new Negate("m5_negate");
				window.s1_negate = new Negate("s1_negate");
				window.s2_negate = new Negate("s2_negate");
				window.s3_negate = new Negate("s3_negate");
				window.s4_negate = new Negate("s4_negate");
				window.s5_negate = new Negate("s5_negate");
				window.field_spell_negate = new Negate("field_spell_negate");
				window.pendulum_left_negate = new Negate("pendulum_left_negate");
				window.pendulum_right_negate = new Negate("pendulum_right_negate");
				window.opp_m1_negate = new Negate("opp_m1_negate");
				window.opp_m2_negate = new Negate("opp_m2_negate");
				window.opp_m3_negate = new Negate("opp_m3_negate");
				window.opp_m4_negate = new Negate("opp_m4_negate");
				window.opp_m5_negate = new Negate("opp_m5_negate");
				window.opp_s1_negate = new Negate("opp_s1_negate");
				window.opp_s2_negate = new Negate("opp_s2_negate");
				window.opp_s3_negate = new Negate("opp_s3_negate");
				window.opp_s4_negate = new Negate("opp_s4_negate");
				window.opp_s5_negate = new Negate("opp_s5_negate");
				window.opp_field_spell_negate = new Negate("opp_field_spell_negate");
				window.opp_pendulum_left_negate = new Negate("opp_pendulum_left_negate");
				window.opp_pendulum_right_negate = new Negate("opp_pendulum_right_negate");
				window.left_link_negate = new Negate("left_link_negate");
				window.right_link_negate = new Negate("right_link_negate");
				window.skill_card_negate = new Negate("skill_card_negate");
				window.opp_skill_card_negate = new Negate("opp_skill_card_negate");

				window.negates = [m1_negate, m2_negate, m3_negate, m4_negate, m5_negate, s1_negate, s2_negate, s3_negate, s4_negate, s5_negate, pendulum_left_negate, pendulum_right_negate, field_spell_negate, opp_m1_negate, opp_m2_negate, opp_m3_negate, opp_m4_negate, opp_m5_negate, opp_s1_negate, opp_s2_negate, opp_s3_negate, opp_s4_negate, opp_s5_negate, opp_pendulum_left_negate, opp_pendulum_right_negate, opp_field_spell_negate, left_link_negate, right_link_negate, skill_card_negate, opp_skill_card_negate];

				$("#duel #duel_content.duel_frame").append($(`<div id = "negates"></div>`));

				negates.forEach(function (e, i) {
					$('#negates').append(e);
					e.hide();
				});

			}

			// Destroy requires draggable functionality, set up a dummy for instant destroy when created for the first time.

			negates.forEach(function (e, i) {
				e.draggable()
				e.draggable("destroy")

				addNegateDragging(e);
			});

			negate_btn.draggable()
			negate_btn.draggable("destroy")
			addNegateDragging(negate_btn);

			if (typeof window.removedNegateCardId === "undefined")
				window.removedNegateCardId = 0;
		}
	}

	window.addNegateDragging = function (el) {
		el.css("cursor", "pointer");
		el.draggable({
			"scroll": false,
			"start": function (e, ui) {
				removedNegateCardId = 0;
				var cards;
				if (rush) {
					cards = [player1.m1, player1.m2, player1.m3, player1.s1, player1.s2, player1.s3, player1.fieldSpell, player2.m1, player2.m2, player2.m3, player2.s1, player2.s2, player2.s3, player2.fieldSpell];
				}
				else if (speed) {
					cards = [player1.m1, player1.m2, player1.m3, player1.s1, player1.s2, player1.s3, player1.fieldSpell, player1.skillCard, player2.m1, player2.m2, player2.m3, player2.s1, player2.s2, player2.s3, player2.fieldSpell, player2.skillCard];
				}
				else if (links) {
					cards = [player1.m1, player1.m2, player1.m3, player1.m4, player1.m5, player1.s1, player1.s2, player1.s3, player1.s4, player1.s5, player1.fieldSpell, player2.m1, player2.m2, player2.m3, player2.m4, player2.m5, player2.s1, player2.s2, player2.s3, player2.s4, player2.s5, player2.fieldSpell, linkLeft, linkRight];
				}
				else {
					cards = [player1.m1, player1.m2, player1.m3, player1.m4, player1.m5, player1.s1, player1.s2, player1.s3, player1.s4, player1.s5, player1.pendulumLeft, player1.pendulumRight, player1.fieldSpell, player2.m1, player2.m2, player2.m3, player2.m4, player2.m5, player2.s1, player2.s2, player2.s3, player2.s4, player2.s5, player2.pendulumLeft, player2.pendulumRight, player2.fieldSpell];
				}
				for (var i = 0; i < negates.length; i++) {
					if (this == negates[i][0]) {
						cards[i].data("negations", ~~cards[i].data("negations") - 1);
						removedNegateCardId = cards[i].data("id");
						updateNegates();
					}
				}
				$('#viewing').append(negate);
				//if (start_function) {
				//	start_function(e, $(ui));
				//}
				updateMouse(e);
				dragXOffset = mouseXScaled - parseInt($(this).css("left"));
				dragYOffset = mouseYScaled - parseInt($(this).css("top"));
			},
			"helper": function (e, ui) {
				return negate;
			},
			"drag": function (e, ui) {
				updateMouse(e);
				ui.position = { "left": mouseXScaled - dragXOffset, "top": mouseYScaled - dragYOffset };
			},
			"stop": function (e, ui) {
				var addingNegate = false;
				negate.detach();
				var cards;
				if (rush) {
					cards = [player1.m1, player1.m2, player1.m3, player1.s1, player1.s2, player1.s3, player1.fieldSpell, player2.m1, player2.m2, player2.m3, player2.s1, player2.s2, player2.s3, player2.fieldSpell];
				}
				else if (speed) {
					cards = [player1.m1, player1.m2, player1.m3, player1.s1, player1.s2, player1.s3, player1.fieldSpell, player1.skillCard, player2.m1, player2.m2, player2.m3, player2.s1, player2.s2, player2.s3, player2.fieldSpell, player2.skillCard];
				}
				else if (links) {
					cards = [player1.m1, player1.m2, player1.m3, player1.m4, player1.m5, player1.s1, player1.s2, player1.s3, player1.s4, player1.s5, player1.fieldSpell, player2.m1, player2.m2, player2.m3, player2.m4, player2.m5, player2.s1, player2.s2, player2.s3, player2.s4, player2.s5, player2.fieldSpell, linkLeft, linkRight];
				}
				else {
					cards = [player1.m1, player1.m2, player1.m3, player1.m4, player1.m5, player1.s1, player1.s2, player1.s3, player1.s4, player1.s5, player1.pendulumLeft, player1.pendulumRight, player1.fieldSpell, player2.m1, player2.m2, player2.m3, player2.m4, player2.m5, player2.s1, player2.s2, player2.s3, player2.s4, player2.s5, player2.pendulumLeft, player2.pendulumRight, player2.fieldSpell];
				}
				for (var i = 0; i < cards.length; i++) {
					if (cards[i]) {
						if (!cards[i].data("face_down")) {
							if (inBounds(cards[i].find('.content:first'))) {
								cards[i].data("negations", ~~cards[i].data("negations") + 1);
								updateNegates();
								removedNegateCardId = 0;
								return;
							}
						}
					}
				}
				//if (end_function) {
				//	end_function(e, $(ui));
				//}
			}
		});
	}

	window.updateCounters = function () {
		if (!duel_active)
			return;

		updateNegates();
		var cards;
		if (rush) {
			cards = [player1.m1, player1.m2, player1.m3, player1.s1, player1.s2, player1.s3, player1.fieldSpell, player2.m1, player2.m2, player2.m3, player2.s1, player2.s2, player2.s3, player2.fieldSpell];
		}
		else if (speed) {
			cards = [player1.m1, player1.m2, player1.m3, player1.s1, player1.s2, player1.s3, player1.fieldSpell, player1.skillCard, player2.m1, player2.m2, player2.m3, player2.s1, player2.s2, player2.s3, player2.fieldSpell, player2.skillCard];
		}
		else if (links) {
			cards = [player1.m1, player1.m2, player1.m3, player1.m4, player1.m5, player1.s1, player1.s2, player1.s3, player1.s4, player1.s5, player1.fieldSpell, player2.m1, player2.m2, player2.m3, player2.m4, player2.m5, player2.s1, player2.s2, player2.s3, player2.s4, player2.s5, player2.fieldSpell, linkLeft, linkRight];
		}
		else {
			cards = [player1.m1, player1.m2, player1.m3, player1.m4, player1.m5, player1.s1, player1.s2, player1.s3, player1.s4, player1.s5, player1.pendulumLeft, player1.pendulumRight, player1.fieldSpell, player2.m1, player2.m2, player2.m3, player2.m4, player2.m5, player2.s1, player2.s2, player2.s3, player2.s4, player2.s5, player2.pendulumLeft, player2.pendulumRight, player2.fieldSpell];
		}
		for (var i = 0; i < counters.length; i++) {
			if (cards[i]) {
				if (~~cards[i].data("counters") > 0 && !TweenMax.isTweening(cards[i])) {
					counters[i].show();
					counters[i].find('.total_txt').text(cards[i].data("counters"));
					if (linkLeft && cards[i][0] == linkLeft[0]) {
						if (cards[i].data("controller") == player1 || cards[i].data("controller") == player3) {
							counters[i].css("left", 440.45);
							counters[i].css("top", 315.5);
						}
						else {
							counters[i].css("left", 414.8);
							counters[i].css("top", 272.9);
						}
					}
					else if (linkRight && cards[i][0] == linkRight[0]) {
						if (cards[i].data("controller") == player1 || cards[i].data("controller") == player3) {
							counters[i].css("left", 626.45);
							counters[i].css("top", 315.5);
						}
						else {
							counters[i].css("left", 600.8);
							counters[i].css("top", 272.9);
						}
					}
				}
				else {
					counters[i].hide();
				}
			}
			else {
				counters[i].hide();
			}
		}
		updateStats();
	}
	window.updateNegates = function () {
		DBO_createNegateButton();

		if (typeof negates === "undefined")
			return;

		var cards;
		if (rush) {
			cards = [player1.m1, player1.m2, player1.m3, player1.s1, player1.s2, player1.s3, player1.fieldSpell, player2.m1, player2.m2, player2.m3, player2.s1, player2.s2, player2.s3, player2.fieldSpell];
		}
		else if (speed) {
			cards = [player1.m1, player1.m2, player1.m3, player1.s1, player1.s2, player1.s3, player1.fieldSpell, player1.skillCard, player2.m1, player2.m2, player2.m3, player2.s1, player2.s2, player2.s3, player2.fieldSpell, player2.skillCard];
		}
		else if (links) {
			cards = [player1.m1, player1.m2, player1.m3, player1.m4, player1.m5, player1.s1, player1.s2, player1.s3, player1.s4, player1.s5, player1.fieldSpell, player2.m1, player2.m2, player2.m3, player2.m4, player2.m5, player2.s1, player2.s2, player2.s3, player2.s4, player2.s5, player2.fieldSpell, linkLeft, linkRight];
		}
		else {
			cards = [player1.m1, player1.m2, player1.m3, player1.m4, player1.m5, player1.s1, player1.s2, player1.s3, player1.s4, player1.s5, player1.pendulumLeft, player1.pendulumRight, player1.fieldSpell, player2.m1, player2.m2, player2.m3, player2.m4, player2.m5, player2.s1, player2.s2, player2.s3, player2.s4, player2.s5, player2.pendulumLeft, player2.pendulumRight, player2.fieldSpell];
		}
		for (var i = 0; i < negates.length; i++) {
			if (cards[i]) {
				if (~~cards[i].data("negations") > 0 && !TweenMax.isTweening(cards[i])) {
					negates[i].show();
					negates[i].find('.total_txt').text(cards[i].data("negations"));
					if (linkLeft && cards[i][0] == linkLeft[0]) {
						if (cards[i].data("controller") == player1 || cards[i].data("controller") == player3) {
							negates[i].css("left", 440.45);
							negates[i].css("top", 315.5);
						}
						else {
							negates[i].css("left", 414.8);
							negates[i].css("top", 272.9);
						}
					}
					else if (linkRight && cards[i][0] == linkRight[0]) {
						if (cards[i].data("controller") == player1 || cards[i].data("controller") == player3) {
							negates[i].css("left", 626.45);
							negates[i].css("top", 315.5);
						}
						else {
							negates[i].css("left", 600.8);
							negates[i].css("top", 272.9);
						}
					}
				}
				else {
					negates[i].hide();
				}
			}
			else {
				negates[i].hide();
			}
		}
		updateStats();
	}

	window.DBO_createEditStatsButtons = function () {
		// Edit stats on replays.
		if (typeof getInput === "function" && typeof addButton === "function" && typeof hideDisplayBoxes === "function" && $("#input").length == 0) {

			console.log("Test");

			$(document.body).append($(`<div id="input">
				<span class="title_txt">Choose new ATK:</span>
				<div class="body_txt selectable">x = old ATK, y = current ATK</div>
				<input class="input_txt" type="text">
				<div class="ok_btn">
					<img src="https://images.duelingbook.com/svg/ok_btn_up.svg" alt="OK">
				</div>
				<div class="cancel_btn">
					<img src="https://images.duelingbook.com/svg/cancel_btn_up.svg" alt="Cancel">
				</div>
			</div>`));

			addButton($('#input .ok_btn'), inputOK);
			addButton($('#input .cancel_btn'), cancelCallback);

			hideDisplayBoxes();

			$('html > head').append($(`<style>input
			{
				writing-mode: horizontal-tb !important;
				font-style: ;
				font-variant-ligatures: ;
				font-variant-caps: ;
				font-variant-numeric: ;
				font-variant-east-asian: ;
				font-variant-alternates: ;
				font-weight: ;
				font-stretch: ;
				font-size: ;
				font-family: ;
				font-optical-sizing: ;
				font-kerning: ;
				font-feature-settings: ;
				font-variation-settings: ;
				text-rendering: auto;
				color: fieldtext;
				letter-spacing: normal;
				word-spacing: normal;
				line-height: normal;
				text-transform: none;
				text-indent: 0px;
				text-shadow: none;
				display: inline-block;
				text-align: start;
				appearance: auto;
				-webkit-rtl-ordering: logical;
				cursor: text;
				background-color: field;
				margin: 0em;
				padding: 1px 2px;
				border-width: 2px;
				border-style: inset;
				border-color: -internal-light-dark(rgb(118, 118, 118), rgb(133, 133, 133));
				border-image: initial;
			}</style>`));

			$('html > head').append($(`<style>#msg, #confirm, #confirm2, #input, #combo
			{
				left: 212px;
				top: 170px;
				width: 600px;
				height: 300px;
				font-family: "Arial Rounded MT Bold";
				background-image: url('https://images.duelingbook.com/svg/msg_background.svg');
				background-size: contain;
				z-index: 45;
			}</style>`));

			$('html > head').append($(`<style>.textinput
			{
				font-family: "Arial";
				font-size: 12px !important;
				padding-left: 3.5px;
				background-color: white;
				border-left: 1px solid #C9CBCC;
				border-top: 1px solid #6D6F70;
				border-right: 1px solid #C9CBCC;
				border-bottom: 1px solid #D3D5D6;
				font-weight: normal;
				line-height: 20px;
				pointer-events: none;
				color: black;
			}</style>`));

			$('#input .input_txt').on('input', function () {
				var regex = $(this).data("regex");
				if ($(this).val().match(regex)) {
					$(this).val($(this).val().replace(regex, ""));
				}
			});

			$('textarea').on('input blur', function () {
				$(this).text($(this).val());
			});
			$('.textarea').addClass("selectable");
			$('input').click(function () { // for super_cb
				$(this).focus();
			});
		}
		let DBO_globalList = document.querySelectorAll("DBO")

		for (let abc = 0; abc < DBO_globalList.length; abc++) {
			let objId = DBO_globalList[abc].id;

			if (objId.startsWith("DBO_new_")) {
				$(DBO_globalList[abc]).off("mouseup");
				$(DBO_globalList[abc]).mouseup(DBO_EditCardStatsMenu);
			}
		}
	}

	DBO_createNegateButton();
	DBO_createEditStatsButtons();

	window.DBO_mouseLeaveE = function () {
		var card = $(this).parent();

		if (summoning_card) {
			if (DBO_findSelectZones()) {
				previewCard(summoning_card);
			}
		}
	}

	window.DBO_getCardRotY = function (card) {
		let rotY = null;

		if (typeof card.data("controller") === "undefined")
			return;

		if (isIn(card, card.data("controller").hand_arr) >= 0) {
			rotY = 180;

			if ((isPlayer1(card.data("controller").username) && show_cards == 1) || show_cards == 2 || card.data("face_up") || viewing == "Opponent's Hand") {
				rotY = 0;
			}
		}
		// "To opponent's hand" :D
		else if (isIn(card, card.data("controller").opponent.hand_arr) >= 0) {
			rotY = 180;

			// Being the card's owner is not enough when it's in the opponent's hand...
			if (show_cards == 2 || card.data("face_up") || viewing == "Opponent's Hand") {
				rotY = 0;
			}
		}
		else if (isIn(card, player1.main_arr) < 0 && isIn(card, player1.opponent.main_arr) < 0 && isIn(card, player1.extra_arr) < 0 && isIn(card, player1.opponent.extra_arr) < 0) {
			rotY = 0;

			if (card.data("face_down")) {
				rotY = 180;
			}
		}

		return rotY;
	}
	window.DBO_contextMenuE = function () {
		if (!DBO_unlockCardMechanics)
			return;

		else if (!duelist)
			return;

		event.preventDefault();

		var card = $(this).parent();

		// Should not work for things in your hand...
		if (isIn(card, player1.hand_arr) >= 0)
			return;

		if (isIn(card, player1.opponent.hand_arr) >= 0) {
			let arr = player1.opponent.hand_arr.slice();

			if (arr.length >= 2) {
				getConfirmation("Randomly target a card in their hand?", "", DBO_snipeHandYes);
			}

			return;
		}
		if (!card.data("face_down")) {
			switch (card.data("cardfront").data("name")) {
				case "Book of Eclipse":
					// Find on field, if not, find in GY / banished.
					if (DBO_findCardByIdReal(card.data("id"))) {
						getConfirmation("Set all of your monsters?", "You can right click this card in the GY to flip them back.", DBO_FlipAllYes);
					}
					else {
						getConfirmation("Flip back all of your monsters?", "", DBO_UnflipAllYes);
					}
					break;

				case "Floowandereeze and the Dreaming Town":
					getConfirmation("Set all of your monsters?", "", DBO_FlipAllYes);
					break;

				case "Nibiru, the Primal Being":
					window.DBO_nibiruCard = card;
					getConfirmation("Tribute all of your monsters?", "This will force you to say how much ATK/DEF you tributed.", DBO_NibiruYes);
					break;


				case "Card Destruction":
					getConfirmation("Replace hand?", "Discard hand, draw hand.", DBO_CardDestructionYes);
					break;

				case "Trickstar Reincarnation":
					if (card.data("controller").username != player1.username) {
						getConfirmation("Replace hand?", "Banish hand, draw hand.", DBO_TrickstarReincarnationYes);
					}
					break;

				case "Morphing Jar":
					getConfirmation("Refill hand?", "Discard hand, draw 5.", DBO_MorphingJarYes);
					break;

				case "Morphing Jar #2":
					getConfirmation("Resolve effect?", "Send Jar to GY if it was destroyed.<br>It will shuffle your field to deck & excavate.<br>This may ilegally SS some monsters.", DBO_MorphingJarNumberTwoYes, null, true);
					break;

				case "Divine Arsenal AA-ZEUS - Sky Thunder":
					window.DBO_zeusCard = card;

					getConfirmation("Send all cards to the GY?", "", DBO_ZeusYes);
					break;

				case "Last Turn":
				case "Chaos Emperor Dragon - Envoy of the End":
				case "Witch's Strike":
					getConfirmation("Send all cards in hand and field to the GY?", "", DBO_WitchStrikeYes);
					break;
				case "Black Rose Dragon":
				case "Final Destiny":
				case "Ojama Delta Hurricane!!":
					getConfirmation("Send all cards to the GY?", "", DBO_OjamaDeltaYes);
					break;

				case "Raigeki":
				case "Dark Hole":
				case "Cyber Jar":
				case "Torrential Tribute":
				case "Giant Trap Hole":
				case "Time Wizard":
					getConfirmation("Send all monsters to the GY?", "", DBO_RaigekiYes);
					break;

				// In GY only
				case "Elemental HERO Absolute Zero":
				case "Prank-Kids Battle Butler":
				case "Mirrorjade the Iceblade Dragon":
				case "Volcanic Scattershot":
					if (DBO_findCardByIdReal(card.data("id"))) {

					}
					else {
						getConfirmation("Send all monsters to the GY?", "", DBO_RaigekiYes);
					}
					break;

				case "Harpie's Feather Duster":
				case "Heavy Storm":
				case "Malevolent Catastrophe":
					getConfirmation("Send all backrow to the GY?", "", DBO_DusterYes);
					break;

				case "Fiber Jar":
					window.DBO_fiberCard = card;

					getConfirmation("Resolve Fiber Jar?", "This will make a lot of actions at once.", DBO_FiberJarYes);
					break;

				case "Upstart Goblin":
				case "Snatch Steal":
					if (card.data("controller").username != player1.username) {
						getConfirmation("Gain 1000 LP?", ".", DBO_UpstartGoblinYes);
					}
					break;

				default:

					if (DBO_IsCardExchangeOfSpirit(card)) {
						getConfirmation("Swap Deck with GY?", "This will make a lot of actions at once.", DBO_ExchangeSpiritYes);
					}
					break;
			}


			return;
		}

		let opponentST = [];
		let opponentMonsters = [];

		let bST = false;
		let bMonster = false;


		for (let abc = 1; abc <= 5; abc++) {
			if (player1.opponent["m" + abc] == null)
				continue;

			if (player1.opponent["m" + abc].data("id") == card.data("id"))
				bMonster = true;

			if (player1.opponent["m" + abc].data("face_down"))
				opponentMonsters.push(player1.opponent["m" + abc])
		}
		for (let abc = 1; abc <= 5; abc++) {
			if (player1.opponent["s" + abc] == null)
				continue;

			if (player1.opponent["s" + abc].data("id") == card.data("id"))
				bST = true;

			if (player1.opponent["s" + abc].data("face_down"))
				opponentST.push(player1.opponent["s" + abc])
		}


		let DBO_arr = [];

		// I right clicked a face-down backrow.
		if (bST) {

			let arr = opponentST;


			// right clicked a face-down backrow while opponent has 2+ backrow.
			if (arr.length >= 2) {
				DBO_arr.push("Randomly target a backrow?");
			}

			DBO_arr.push("Write note on selected card?");
		}
		// I right clicked a face-down monster.
		else if (bMonster) {
			let arr = opponentMonsters;

			// right clicked a face-down monsters while opponent has 2+ monsters.
			if (arr.length >= 2) {
				DBO_arr.push("Randomly target a set monster?");
			}

			DBO_arr.push("Write note on this card");
		}
		// Should never happen but still...
		else
			return;

		window.DBO_rightClickCard = card;

		getComboBox("What do you want to do?", "", DBO_arr, 0, DBO_rightClickOpponentCardYes);
	}

	window.DBO_clickE = function () {
		// Mouse scroll or right click? Cringe :(
		if (event.which != 1)
			return;

		else if (!DBO_unlockCardMechanics)
			return;

		else if (!duelist)
			return;

		var card = $(this).parent();

		if (card.data("controller") != player1) {
			if (isIn(card, player1.opponent.grave_arr) < 0 && isIn(card, player1.opponent.banished_arr) < 0)
				return;
		}

		else if (card.hasClass("xyzmaterial") && !viewing)
			return;

		let originalCard = card;


		// CTRL is pressed
		if (DBO_keys[17]) {
			if (typeof DBO_lastCardAction !== "undefined") {
				let DBO_checked = $('#choose_zones_cb').prop("checked")

				$('#choose_zones_cb').checked(false)

				cardMenuClicked(card, DBO_lastCardAction);

				$('#choose_zones_cb').checked(DBO_checked);
			}
			return;
		}
		if (card.data("fake_card") && viewing == "DBO Xyz Materials") {
			if (typeof DBO_lastXyzCard === "undefined")
				return;

			let substitute = DBO_findSubstitute(card, DBO_lastXyzCard.data("xyz_arr"));

			if (substitute != null) {
				originalCard = card;
				card = substitute;
			}
			else {
				return;
			}
		}


		if (summoning_play == "DBO Move") {
			if (summoning_card && summoning_card.data("id") == card.data("id")) {

				var rotY = 180;

				if (DBO_isRotFacedown(getRotationY(card[0]))) {
					rotY = 0;
				}

				//TweenMax.set(card, {rotationY:rotY, ease:Linear.easeNone});
				TweenMax.set(originalCard, { rotationY: rotY, ease: Linear.easeNone });
				TweenMax.set(card, { rotationY: rotY, ease: Linear.easeNone });
			}
			// As much as I'd love to return the original summoning_card to flipped, I need to do it for all cardMenuClicked.
			//else
		}

		cardMenuClicked(card, "DBO Move");
	}

	window.DBO_editStatsYes = function () {
		if (typeof window.DBO_editCard === "undefined")
			return;

		else if (typeof window.DBO_editCard.data === "undefined")
			return;

		else if (typeof window.DBO_editCard.data("cardfront") === "undefined")
			return

		let card = window.DBO_editCard;

		let originalStat = window.DBO_editStat.replace("DBO_new_", "");
		let stat = $('#input .input_txt').val();

		if (stat.length == 0)
			stat = card.data("cardfront").data(originalStat);

		else {
			let oldStat = card.data("cardfront").data(originalStat);

			if (typeof oldStat === "undefined")
				oldStat = 0;

			let currentStat = card.data("cardfront").data(window.DBO_editStat);

			if (typeof currentStat === "undefined")
				currentStat = oldStat;

			stat = DBO_ExprEval(stat, oldStat, currentStat);
		}
		if (stat < 0) {
			errorE(`${originalStat.toUpperCase()} cannot be lower than 0!`);
			return;
		}

		else if (stat > 99999) {
			errorE(`${originalStat.toUpperCase()} cannot be higher than 99999!`);
			return;
		}

		card.data("cardfront").data(window.DBO_editStat, stat.toString());

		updateStats();
	}

	window.DBO_UnexcavateYes = function () {
		for (let abc = 0; abc < window.DBO_excavatedArr.length; abc++) {
			if (window.DBO_excavatedArr[abc].data("face_down") || isIn(window.DBO_excavatedArr[abc], player1.banished_arr) < 0) {

				window.DBO_excavatedArr.splice(abc, 1);
				abc--;
			}
		}
		let DBO_val = $('#combo .combo_cb').val();

		for (let abc = 0; abc < window.DBO_excavatedArr.length; abc++) {

			if (DBO_val == "Top Deck")
				cardMenuClicked(window.DBO_excavatedArr[abc], "To T Deck");

			else if (DBO_val == "Bottom Deck")
				cardMenuClicked(window.DBO_excavatedArr[abc], "To B Deck");

			else if (DBO_val == "GY")
				cardMenuClicked(window.DBO_excavatedArr[abc], "To GY");
		}

		window.DBO_excavatedArr.length = 0;
	}

	window.DBO_NibiruYes = function () {
		if (typeof window.DBO_nibiruCard === "undefined")
			return;

		else if (typeof window.DBO_nibiruCard.data === "undefined")
			return;

		else if (typeof window.DBO_nibiruCard.data("cardfront") === "undefined")
			return

		DBO_CheckPlayerZones(true);

		let totalATK = 0;
		let totalDEF = 0;

		let foundToken = false;
		let foundTrapMonster = false;
		let foundAny = false;


		for (let abc = 0; abc < DBO_Player1MonsterZones.length; abc++) {
			let card = DBO_Player1MonsterZones[abc].card;

			if (card.data("face_down"))
				continue;

			else if (window.DBO_nibiruCard.data("id") == card.data("id"))
				continue;

			foundAny = true;

			if (card.data("cardfront").data("monster_color") == "Token") {
				foundToken = true;
				cardMenuClicked(card, "To GY");
				continue;
			}

			else if (card.data("cardfront").data("card_type") != "Monster") {
				foundTrapMonster = true;
				cardMenuClicked(card, "To GY");
				continue;
			}

			let atk = parseInt(card.data("cardfront").data("atk"));
			let def = parseInt(card.data("cardfront").data("def"));

			// For ?/? ATK/DEF.
			if (!isNaN(atk)) {
				totalATK += atk;
			}

			// For ?/? ATK/DEF and for Link Monsters.
			if (!isNaN(def)) {
				totalDEF += def;
			}
			cardMenuClicked(card, "To GY");
		}

		if (!foundAny) {
			return;
		}

		Send({ "action": "Duel", "play": "Duel message", "message": `I have tributed ${totalATK}/${totalDEF} ATK/DEF worth of monsters.`, "html": ~~0 });

		if (foundToken) {
			Send({ "action": "Duel", "play": "Duel message", "message": `I did not calculate the tokens for this.`, "html": ~~0 });
		}

		if (foundTrapMonster) {
			Send({ "action": "Duel", "play": "Duel message", "message": `I did not calculate the trap monsters for this.`, "html": ~~0 });
		}
	}

	window.DBO_CardDestructionYes = function () {
		if (player1.main_arr.length < player1.hand_arr.length)
			return;

		let count = 0;

		for (let abc = 0; abc < player1.hand_arr.length; abc++) {
			cardMenuClicked(player1.hand_arr[abc], "To GY");
			count++;
		}

		for (let abc = 0; abc < count; abc++) {
			cardMenuClicked(player1.main_arr[abc], "Draw card");
		}
	}

	window.DBO_TrickstarReincarnationYes = function () {
		if (player1.main_arr.length < player1.hand_arr.length)
			return;

		let count = 0;

		for (let abc = 0; abc < player1.hand_arr.length; abc++) {
			cardMenuClicked(player1.hand_arr[abc], "Banish");
			count++;
		}

		for (let abc = 0; abc < count; abc++) {
			cardMenuClicked(player1.main_arr[abc], "Draw card");
		}
	}

	window.DBO_MorphingJarYes = function () {
		if (player1.main_arr.length < 5)
			return;

		for (let abc = 0; abc < player1.hand_arr.length; abc++) {
			cardMenuClicked(player1.hand_arr[abc], "To GY");
		}

		for (let abc = 0; abc < 5; abc++) {
			cardMenuClicked(player1.main_arr[abc], "Draw card");
		}
	}

	window.DBO_MorphingJarNumberTwoYes = function () {
		if (window.DBO_excavatedArr.length > 0)
			return;

		let amountSent = 0;

		window.DBO_waitingForAction = true;

		DBO_CheckPlayerZones(true);

		//TweenMax.globalTimeScale(3);

		for (let abc = 0; abc < DBO_Player1MonsterZones.length; abc++) {
			let card = DBO_Player1MonsterZones[abc].card;

			if (isExtraDeckCard(card))
				cardMenuClicked(card, "To ED");

			else {
				cardMenuClicked(card, "To T Deck");

				// Traps don't count...
				if (card.data("cardfront").data("card_type") == "Monster" && card.data("owner") == player1) {
					amountSent++;
				}
			}
		}

		cardMenuClicked(new Card(), "Shuffle deck");

		let jarInterval = setInterval(function () {
			if (amountSent == 0) {
				clearInterval(jarInterval)
				window.DBO_excavatedArr = [];

				//TweenMax.globalTimeScale(1);
				return;
			}

			if (actionsQueue.length <= 0 && !window.DBO_waitingForAction) {
				if (window.DBO_excavatedArr.length == 0) {
					for (let abc = 0; abc < amountSent; abc++) {
						let DBO_card = player1.main_arr[abc];

						cardMenuClicked(DBO_card, "Banish");
						window.DBO_waitingForAction = true;
						window.DBO_excavatedArr.push(DBO_card);

					}
				}
				else {
					for (let abc = 0; abc < window.DBO_excavatedArr.length; abc++) {
						let DBO_card = window.DBO_excavatedArr[abc];

						if (DBO_card.data("cardfront").data("card_type") == "Monster") {

							amountSent--;

							if (DBO_card.data("cardfront").data("level") <= 4) {
								let DBO_checked = $('#choose_zones_cb').prop("checked")

								$('#choose_zones_cb').checked(false)

								cardMenuClicked(DBO_card, "SS DEF");

								$('#choose_zones_cb').checked(DBO_checked);
							}
							else {
								cardMenuClicked(DBO_card, "To GY");
							}
						}
						else {
							cardMenuClicked(DBO_card, "To GY");
						}
					}

					window.DBO_excavatedArr = [];
					window.DBO_waitingForAction = false;
				}
			}
		}, 50);
	}

	window.DBO_ZeusYes = function () {
		if (typeof window.DBO_zeusCard === "undefined")
			return;

		else if (typeof window.DBO_zeusCard.data === "undefined")
			return;

		else if (typeof window.DBO_zeusCard.data("cardfront") === "undefined")
			return

		DBO_CheckPlayerZones(true);

		for (let abc = 0; abc < DBO_Player1Field.length; abc++) {
			let card = DBO_Player1Field[abc].card;


			if (window.DBO_zeusCard.data("id") == card.data("id"))
				continue;

			cardMenuClicked(card, "To GY");
		}
	}

	window.DBO_WitchStrikeYes = function () {
		DBO_CheckPlayerZones(true);

		for (let abc = 0; abc < DBO_Player1Field.length; abc++) {
			let card = DBO_Player1Field[abc].card;

			cardMenuClicked(card, "To GY");
		}

		for (let abc = 0; abc < player1.hand_arr.length; abc++) {
			let card = player1.hand_arr[abc];

			cardMenuClicked(card, "To GY");
		}
	}
	window.DBO_OjamaDeltaYes = function () {
		DBO_CheckPlayerZones(true);

		for (let abc = 0; abc < DBO_Player1Field.length; abc++) {
			let card = DBO_Player1Field[abc].card;

			cardMenuClicked(card, "To GY");
		}
	}

	window.DBO_RaigekiYes = function () {
		DBO_CheckPlayerZones();

		for (let abc = 0; abc < DBO_Player1MonsterZones.length; abc++) {
			let card = DBO_Player1MonsterZones[abc].card;


			if (card == null)
				continue;

			cardMenuClicked(card, "To GY");
		}
	}

	window.DBO_DusterYes = function () {
		DBO_CheckPlayerZones();

		for (let abc = 0; abc < DBO_Player1STZones.length; abc++) {
			let card = DBO_Player1STZones[abc].card;


			if (card == null)
				continue;

			cardMenuClicked(card, "To GY");
		}
	}

	window.DBO_FlipAllYes = function () {
		DBO_CheckPlayerZones();

		for (let abc = 0; abc < DBO_Player1MonsterZones.length; abc++) {
			let card = DBO_Player1MonsterZones[abc].card;

			if (card == null)
				continue;

			else if (card.data("face_down"))
				continue;

			cardMenuClicked(card, "Set monster");
		}
	}

	window.DBO_UnflipAllYes = function () {
		DBO_CheckPlayerZones();

		for (let abc = 0; abc < DBO_Player1MonsterZones.length; abc++) {
			let card = DBO_Player1MonsterZones[abc].card;

			if (card == null)
				continue;

			else if (!card.data("face_down"))
				continue;

			cardMenuClicked(card, "Flip");
		}
	}
	window.DBO_snipeHandYes = function () {
		let arr = player1.opponent.hand_arr.slice();

		if (arr.length >= 2) {
			cardMenuClicked(arr[DBO_getRandomInt(0, arr.length - 1)], "Target");
		}
	}

	window.DBO_rightClickOpponentCardYes = function () {
		let DBO_val = $('#combo .combo_cb').val();

		if (DBO_val.startsWith("Randomly target")) {
			if (DBO_val.search(/backrow/i) >= 0) {
				DBO_snipeBackrowYes();
			}
			else {
				DBO_snipeMonstersYes();
			}
		}
		else {
			getInput("Write a note on the card:", "", "", 32, DBO_writeNoteOnCardYes, /[^ -~●]/g);
		}
	}


	window.DBO_writeNoteOnCardYes = function () {
		if (typeof window.DBO_rightClickCard === "undefined")
			return;

		else if (typeof window.DBO_rightClickCard.data === "undefined")
			return;

		else if (typeof window.DBO_rightClickCard.data("cardfront") === "undefined")
			return


		let card = window.DBO_rightClickCard;

		let DBO_val = $('#input .input_txt').val();

		let zone = DBO_getCardZone(card);

		let points = getPointsByZone(player2, zone);

		DBO_GenerateImpermColumn(card, points, false, DBO_val);
	}
	window.DBO_snipeBackrowYes = function () {
		let opponentST = [];

		for (let abc = 1; abc <= 5; abc++) {
			if (player1.opponent["s" + abc] != null && player1.opponent["s" + abc].data("face_down"))
				opponentST.push(player1.opponent["s" + abc])
		}

		let arr = opponentST;

		if (arr.length >= 2) {
			cardMenuClicked(arr[DBO_getRandomInt(0, arr.length - 1)], "Target");
		}
	}

	window.DBO_snipeMonstersYes = function () {
		let opponentMonsters = [];

		for (let abc = 1; abc <= 5; abc++) {
			if (player1.opponent["m" + abc] != null && player1.opponent["m" + abc].data("face_down"))
				opponentMonsters.push(player1.opponent["m" + abc])
		}

		let arr = opponentMonsters;

		if (arr.length >= 2) {
			cardMenuClicked(arr[DBO_getRandomInt(0, arr.length - 1)], "Target");
		}
	}

	window.addLine = function (str) {
		if (conceal) {
			return;
		}
		saveDuelVSP();
		$('#duel .cout_txt').append('<b>' + escapeHTML(str) + '</b><br>');
		restoreDuelVSP();

		let DBO_phrase = escapeHTML(player1.username) + " has called a judge";

		if (duelist && str == DBO_phrase) {
			let DBO_judgesOnline = online_users_data.filter(function (a) { return a.admin; }).length;

			if (DBO_judgesOnline == 0) {
				DBO_addColoredLine("FF0000", "DB Unlock here, no judges online. Here's the replay URL:");

				let DBO_url = URL_START + 'replay?id=' + (duelist ? userId + "-" : "") + duelId;

				DBO_addHTMLLine(`<b><a href="${DBO_url}" target="_blank">${DBO_url}</a></b>`);
				DBO_addColoredLine("000000", "--------------------------------------");
				DBO_addHTMLLine(`<b><a href="https://forum.duelingbook.com/posting.php?mode=post&f=7" target="_blank">Press here to report them in the forums</a></b>`);
			}
		}
	}

	window.DBO_addColoredLine = function (color, str) {
		if (typeof str === "undefined") {
			console.log("Developer error: DBO_addColoredLine excepted 2 arguments, found 1");
		}
		if (conceal) {
			return;
		}
		saveDuelVSP();
		let messageToSend = `<b><DBO style="color: #${color};">${escapeHTML(str)}</b></DBO><br>`;
		$('#duel .cout_txt').append(messageToSend);
		restoreDuelVSP();
	}

	window.DBO_addHTMLLine = function (str) {
		if (conceal) {
			return;
		}
		saveDuelVSP();
		let messageToSend = `${str}<br>`;
		$('#duel .cout_txt').append(messageToSend);
		restoreDuelVSP();
	}

	window.duelChatPrint = function (data) {
		saveDuelVSP();
		var color = "#0000FF";
		if (data.color) {
			color = "#" + data.color;
		}
		if (player1.username == data.username || player3 && player3.username == data.username) {
			if (color == "#0000FF") {
				color = "#FF0000";
			}
		}
		if (!data.html) {
			data.message = escapeHTMLWithLinks(data.message);
		}
		if (conceal) {
			switch (data.username) {
				case player1.username:
					data.username = "Red";
					break;
				case player2.username:
					data.username = "Blue";
					break;
				case player3.username:
				case player4.username:
					data.username = "Partner";
					break;
			}
			switch (data.color) {
				case "009900":
				case "707070":
				case "CC9900":
				case "660099":
					data.username = "Admin";
					break;
			}
		}
		else if (streaming) {
			data.username = censor(data.username);
			data.message = censor(data.message);
		}

		if (mobile) {
			let messageToSend = `<b><font color="` + color + `">` + escapeHTML(data.username) + `: </font><DBO style="margin: 0; -webkit-text-fill-color: green; font-size: 1.5em">` + data.message + `</b></DBO><br>`;
			$('#duel .cout_txt').append(messageToSend);
		}
		else {
			$('#duel .cout_txt').append('<b><font color="' + color + '">' + escapeHTML(data.username) + ": </font></b><font>" + data.message + '</font><br>');
		}
		restoreDuelVSP();
	}
	// With outline.
	window.DBO_addColoredLine2 = function (color, str) {
		if (typeof str === "undefined") {
			console.log("Developer error: DBO_addColoredLine2 excepted 2 arguments, found 1");
		}
		if (conceal) {
			return;
		}
		saveDuelVSP();

		let messageToSend = `<b><DBO style="color: #${color}; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">${escapeHTML(str)}</b></DBO><br>`;
		$('#duel .cout_txt').append(messageToSend);
		restoreDuelVSP();
	}

	window.DBO_exitViewing = function (e, b) {
		window.DBO_waitingForActionOrViewing = false;

		if ($("#ed_select").length > 0) {
			$("#ed_select").hide();
			ed_select.stop();
		}

		DBO_GenerateTrueAllCardsArray();

		if (viewing == "Deck") {
			window.DBO_DigString = undefined;
		}
		if (viewing == "Opponent's Hand" && cardLogging) {
			DBO_LastOpponentHand = [];

			for (let abc = 0; abc < player1.opponent.hand_arr.length; abc++) {
				DBO_LastOpponentHand.push(player1.opponent.hand_arr[abc]);
			}

			getConfirmation("Log Opponent's Hand?", "", DBO_LogHandYes);
		}

		if (e && duelist && viewing == "Deck (Picking 4 Cards)" && player1.temp_arr.length > 0) {
			Send({ "action": "Duel", "play": next_callback, "cards": player1.temp_arr });

		}
		if (duelist && viewing) {
			Send({ "action": "Duel", "play": b ? "Stop viewing 2" : "Stop viewing", "viewing": viewing });
			player1.temp_arr = [];
		}
		if (viewing == "Xyz Materials") {
			updateAllXyzMaterials(player1);
		}
		removeCardMenu();
		viewing = "";
		$('#view .title_txt').text("");
		$('#view > .content').scrollTop(0);
		$('#view').hide();
		shiftDecks();

		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}

	}

	window.DBO_LogHandYes = function () {
		addLine("==============================")

		for (let abc = 0; abc < player1.opponent.hand_arr.length; abc++) {
			let cardName = player1.opponent.hand_arr[abc].data("cardfront").data("name");

			if (cardName.length > 27)
				cardName = cardName.slice(0, 27);

			DBO_addCardHoverLine('<font color="0000FF">' + quote(cardName) + "</font>", player1.opponent.hand_arr[abc]);
		}

		addLine("==============================")
	}

	window.previewFront = function (cardfront) {
		if (preview.data("id") == 0) {
			preview.data("id", -1);
		}
		//if (preview.data("id") == cardfront.data("id") && preview.is(":visible")) {
		if (preview.data("id") == cardfront.data("id") && preview.is(":visible") && preview.find('.pic').attr("scr") != cardfront.find('.pic').attr("scr")) {
			return;
		}



		preview.find('.skillback').detach();
		showPreview(); // moved from below because setCardName

		preview.copyCard(cardfront);

		let DBO_blackImage = IMAGES_START + "black.jpg";

		if (preview.find('.pic').attr("src") == DBO_blackImage) {
			console.log("Bog check");
			preview.find('.pic').attr("src", cardfront.data("pic"));
		}

		DBO_newEffect = undefined;
		DBO_newLevelName = undefined;
		DBO_newLevel = undefined;
		DBO_newPendulumScaleEffectName = undefined;
		DBO_newPendulumMonsterEffectName = undefined;

		if (typeof DBO_OnGetCardVisualsPost !== "undefined") {
			DBO_OnGetCardVisualsPost(cardfront, preview);
		}

		// Dev here, adding URL to the card.
		removeButton(preview, DBO_openPreviewURL);
		addButton(preview, DBO_openPreviewURL);

		//if (~~cardfront.data("pendulum") > 0) {

		let levelStr = "<b>LEVEL: </b>";

		if (cardfront.data("monster_color") == "Xyz")
			levelStr = "<b>RANK: </b>";

		if (typeof DBO_newLevelName !== "undefined") {
			levelStr = DBO_newLevelName;
		}

		let levelStrLinebreak = "<br>";

		if (levelStr.length <= 0)
			levelStrLinebreak = "";

		let cardLevel = cardfront.data("level");

		if (typeof DBO_newLevel !== "undefined") {
			if (typeof DBO_newLevel !== "string")
				DBO_newLevel = DBO_newLevel.toString();

			cardLevel = DBO_newLevel;
		}

		let previewHTML = "";

		if (cardfront.data("pendulum")) {
			let scaleEffectName = "<b>Pendulum Effect:</b>"
			let monsterEffectName = "<b>Monster Effect:</b>"

			if (typeof DBO_newPendulumScaleEffectName !== "undefined") {
				scaleEffectName = DBO_newPendulumScaleEffectName;
			}

			if (typeof DBO_newPendulumMonsterEffectName !== "undefined") {
				monsterEffectName = DBO_newPendulumMonsterEffectName;
			}
			previewHTML = previewHTML.concat(levelStr + "<b>" + cardLevel + "</b>" + levelStrLinebreak + scaleEffectName + "<br>" + DBO_MakePSCTColorOnEffect(cardfront, cardfront.data("name"), escapeHTML(cardfront.data("pendulum_effect"))) + '<br><br>' + monsterEffectName + "<br>");

			if (cardfront.data("monster_color") == "Normal") {

				if (typeof DBO_newEffect !== "undefined") {
					previewHTML = previewHTML.concat("<i>" + escapeHTML(DBO_newEffect) + "</i>");
				}
				else {
					previewHTML = previewHTML.concat("<i>" + escapeHTML(cardfront.data("effect")) + "</i>");
				}
			} else {
				if (typeof DBO_newEffect !== "undefined") {
					previewHTML = previewHTML.concat(DBO_MakePSCTColorOnEffect(cardfront, cardfront.data("name"), escapeHTML(DBO_newEffect)));
				}
				else {
					previewHTML = previewHTML.concat(DBO_MakePSCTColorOnEffect(cardfront, cardfront.data("name"), escapeHTML(cardfront.data("effect"))));
				}
			}
		}
		else if (cardfront.data("rush") && cardfront.data("monster_color") != "Normal") {
			if (typeof DBO_newEffect !== "undefined") {
				previewHTML = previewHTML.concat(escapeHTML(DBO_newEffect).replace('[Requirement]', '<b>[Requirement]</b>').replace('<br>[Effect]', '<br><b>[Effect]</b>').replace('<br>[Continuous Effect]', '<br><b>[Continuous Effect]</b>').replace('<br>[Multi-Choice Effect]', '<br><b>[Multi-Choice Effect]</b>').replace('[REQUIREMENT]', '<b>[REQUIREMENT]</b>').replace('<br>[EFFECT]', '<br><b>[EFFECT]</b>').replace('<br>[CONTINUOUS EFFECT]', '<br><b>[CONTINUOUS EFFECT]</b>').replace('<br>[MULTI-CHOICE EFFECT]', '<br><b>[MULTI-CHOICE EFFECT]</b>'));
			}
			else {
				previewHTML = previewHTML.concat(escapeHTML(cardfront.data("effect")).replace('[Requirement]', '<b>[Requirement]</b>').replace('<br>[Effect]', '<br><b>[Effect]</b>').replace('<br>[Continuous Effect]', '<br><b>[Continuous Effect]</b>').replace('<br>[Multi-Choice Effect]', '<br><b>[Multi-Choice Effect]</b>').replace('[REQUIREMENT]', '<b>[REQUIREMENT]</b>').replace('<br>[EFFECT]', '<br><b>[EFFECT]</b>').replace('<br>[CONTINUOUS EFFECT]', '<br><b>[CONTINUOUS EFFECT]</b>').replace('<br>[MULTI-CHOICE EFFECT]', '<br><b>[MULTI-CHOICE EFFECT]</b>'));
			}
		}
		else {
			if (cardfront.data("monster_color") == "Normal") {
				if (typeof DBO_newEffect !== "undefined") {
					previewHTML = previewHTML.concat(levelStr + "<b>" + cardLevel + "</b>" + levelStrLinebreak + "<i>" + escapeHTML(DBO_newEffect) + "</i>");
				}
				else {
					previewHTML = previewHTML.concat(levelStr + "<b>" + cardLevel + "</b>" + levelStrLinebreak + "<i>" + escapeHTML(cardfront.data("effect")) + "</i>");
				}
			}
			else if (cardfront.data("level") > 0 && cardfront.data("monster_color") != "Link") {
				if (typeof DBO_newEffect !== "undefined") {
					previewHTML = previewHTML.concat(levelStr + "<b>" + cardLevel + "</b>" + levelStrLinebreak + DBO_MakePSCTColorOnEffect(cardfront, cardfront.data("name"), escapeHTML(DBO_newEffect)));
				}
				else {
					previewHTML = previewHTML.concat(levelStr + "<b>" + cardLevel + "</b>" + levelStrLinebreak + DBO_MakePSCTColorOnEffect(cardfront, cardfront.data("name"), escapeHTML(cardfront.data("effect"))));
				}
			}
			else if (cardfront.data("card_type") == "Skill") {
				if (typeof DBO_newEffect !== "undefined") {
					previewHTML = previewHTML.concat(escapeHTML(cardfront.data("pendulum_effect")) + "<br><br>" + escapeHTML(DBO_newEffect));
				}
				else {
					previewHTML = previewHTML.concat(escapeHTML(cardfront.data("pendulum_effect")) + "<br><br>" + escapeHTML(cardfront.data("effect")));
				}
			}
			else {
				if (typeof DBO_newEffect !== "undefined") {
					previewHTML = previewHTML.concat(DBO_MakePSCTColorOnEffect(cardfront, cardfront.data("name"), escapeHTML(DBO_newEffect)));
				}
				else {
					previewHTML = previewHTML.concat(DBO_MakePSCTColorOnEffect(cardfront, cardfront.data("name"), escapeHTML(cardfront.data("effect"))));
				}
			}
		}

		preview_txt.html(previewHTML);

		if (cardfront.data("name") == "Note Token") {
			let messageToSend = `<b><DBO style="margin: 0; -webkit-text-fill-color: green; font-size: 1.8em">` + cardfront.data("effect") + `</b></DBO>`;
			preview_txt.html(messageToSend);
		}

		if (typeof DBO_newEffect !== "undefined") {
			preview.find(".effect_txt").html(escapeHTML(DBO_newEffect));
		}


		DBO_newEffect = undefined;
		DBO_newLevelName = undefined;
		DBO_newLevel = undefined;
		DBO_newPendulumScaleEffectName = undefined;
		DBO_newPendulumMonsterEffectName = undefined;

		console.log(cardfront);
	}

	window.DBO_MakePSCTColorOnEffect = function (cardfront, name, text) {
		if (window.DBO_preErratas && !cardfront.data("custom")) {
			let obj = DBO_EdisonPreErratas.find(o => o.name === name);

			if (obj) {
				text = `<b>PRE ERRATA</b><br>${obj.effect}`;
			}
		}

		return DBO_MakePSCTColorOnEffect2(text);
	}

	window.DBO_MakePSCTColorOnEffect2 = function (text) {
		if (!DBO_psctBold) return text;
		// Fixes text.replaceAll('&quot;', '"'); and text = text.replaceAll('&amp;', '&'); and friends.

		text = decodeHtmlStr(text);
		// 0 = nothing. 1 = cost. 2 = condition.
		let stateActive = 0;

		let stateColors = []


		if (DBO_psctBold) {
			stateColors.push(`</DBO>`)
			stateColors.push(`<DBO style="color:${DBO_psctCostColor};">`)
			stateColors.push(`<DBO style="color:${DBO_psctConditionColor};">`)
		}
		else {
			stateColors.push(`</DBO>`)
			stateColors.push(`<DBO style="color:${DBO_psctCostColor};">`)
			stateColors.push(`<DBO style="color:${DBO_psctConditionColor};">`)
		}

		let newText = [];

		for (let abc = text.length; abc >= 0; abc--) {
			newText.push(text[abc])

			if (stateActive != 0 && (abc == 0 || (text[abc - 1] == "." && text[abc] == ")") || text[abc] == "]" || text[abc] == ">" || (text[abc] == "." && text[abc + 1] == " ") || (text[abc] == ":" && !DBO_IsCharacterInQuotes(text, abc)) || text[abc] == ";" || DBO_isUltraSpecialCharacter(text[abc]))) {
				if (abc == 0) {
					if (text[abc] == ">" || (text[abc] == "." && text[abc + 1] == " ") || text[abc] == ":" || text[abc] == ";" || DBO_isUltraSpecialCharacter(text[abc])) {
						newText.length = newText.length - 1
						newText.push(stateColors[stateActive])
						newText.push(text[abc])
					}
					else
						newText.push(stateColors[stateActive])
				}

				else {
					newText.length = newText.length - 1
					newText.push(stateColors[stateActive])
					newText.push(text[abc])
				}

				stateActive = 0;
			}
			if (text[abc] == ";" && !DBO_IsCharacterInQuotes(text, abc)) {
				newText.push(stateColors[0])
				stateActive = 1
			}

			else if (text[abc] == ":" && !DBO_IsCharacterInQuotes(text, abc)) {
				newText.push(stateColors[0])
				stateActive = 2
			}
		}

		let finalText = DBO_MakePSCTColorOnLockEffect(newText.reverse().join(""));

		return finalText;
	}

	String.prototype.insert = function (index, string) {
		if (index > 0) {
			return this.substring(0, index) + string + this.substring(index, this.length);
		}

		return string + this;
	}

	window.DBO_MakePSCTColorOnLockEffect = function (text) {
		if (!DBO_psctBold) return text;
		// 0 = nothing. 1 = lock
		let stateActive = 0;

		let positionsFormatting = [];

		let old_text = text.concat("");

		text = text.toLowerCase();

		let effects = [];

		effects.push("you can only Normal or Special Summon once");
		effects.push("you can only Special Summon from the Extra Deck once");
		effects.push("you cannot activate Spell Cards");
		effects.push("you cannot activate Trap Cards");
		effects.push("you cannot Special Summon monsters");
		effects.push("you cannot Pendulum Summon monsters");
		effects.push("You cannot activate monster effects");
		effects.push("you cannot use monsters as Fusion Material");
		effects.push("you cannot use monsters as Synchro Material");
		effects.push("you cannot use monsters as Xyz Material");
		effects.push("you cannot use monsters as Link Material");
		effects.push("You cannot Special Summon monsters from the Extra Deck, except Fusion Monsters");
		effects.push("You cannot Special Summon monsters from the Extra Deck, except Synchro Monsters");
		effects.push("You cannot Special Summon monsters from the Extra Deck, except Xyz Monsters");
		effects.push("You cannot Special Summon monsters from the Extra Deck, except Link Monsters");
		effects.push("you cannot Special Summon monsters");

		// Dumbass Rampant Rampager...
		effects.push("you cannot Special Summon");
		effects.push("you cannot Special Summon monsters from the Extra Deck");
		effects.push("you cannot Normal or Special Summon monsters");
		effects.push("you cannot Normal Summon/Set or Special Summon monsters");
		effects.push("you cannot Normal Summon/Set");

		let appendedStatements = [];

		appendedStatements.push(" after this card resolves, ");
		appendedStatements.push(" during the turn you activate this card");
		appendedStatements.push("During the turn you activate this card, ");
		appendedStatements.push(" for the rest of this turn");
		appendedStatements.push("for the rest of this turn ");
		appendedStatements.push("for the rest of this turn, ");
		appendedStatements.push("For the rest of this turn after this card resolves, ");
		appendedStatements.push(" for the rest of this turn after this card resolves");
		appendedStatements.push(" the turn you activate this effect");
		appendedStatements.push(" the turn you activate this card");
		appendedStatements.push("the turn you activate this effect, ");
		appendedStatements.push("the turn you activate either of this card's effects ");
		appendedStatements.push(" the turn you activate either of this card's effects");

		appendedStatements.push("the turn you activate this card, ");
		//You cannot Normal Summon/Set


		let effects_v2 = [];
		let trueEffects = [];

		for (let abc = 0; abc < effects.length; abc++) {
			for (let def = 0; def < appendedStatements.length; def++) {
				effects_v2.push(effects[abc].concat(appendedStatements[def].toLowerCase()));
				effects_v2.push(appendedStatements[def].toLowerCase().concat(effects[abc]));
				effects_v2.push(effects[abc]);
			}
		}

		for (let abc = 0; abc < effects_v2.length; abc++) {
			trueEffects.push(effects_v2[abc].concat(",").toLowerCase());
			trueEffects.push(effects_v2[abc].concat(".").toLowerCase());
			trueEffects.push(effects_v2[abc].toLowerCase());
		}

		DBO_DebugArr = trueEffects;

		for (let abc = 0; abc < trueEffects.length; abc++) {
			let position = -1;

			while ((position = text.indexOf(trueEffects[abc], position + 1)) != -1) {
				positionsFormatting.push({ format: `<DBO style="color:${DBO_psctLockColor};">`, position: position });
				positionsFormatting.push({ format: `</DBO>`, position: position + trueEffects[abc].length });
			}
		}

		positionsFormatting.sort((a, b) => {
			return b.position - a.position;
		});

		for (let abc = 0; abc < positionsFormatting.length; abc++) {
			old_text = old_text.insert(positionsFormatting[abc].position, positionsFormatting[abc].format);
		}

		return old_text;


	}
	window.decodeHtmlStr = function (str) {
		let DBO_temp = document.createElement("textarea");
		DBO_temp.innerHTML = str;

		return DBO_temp.value;
	};

	window.DBO_isUltraSpecialCharacter = function (charac) {
		// Space is included in chars.

		let csgoConsole = "`"
		let chars = `1234567890 ~${csgoConsole}!#$%^&*+_=-()[]\';,./{}|":<>? ☆★ “”‟`

		if (RegExp(/^\p{L}/, 'u').test(charac))
			return false;

		else if (chars.indexOf(charac) == -1)
			return true;

		return false;

	}

	// This hard thing is solved by going right / left and checking if the amount of quotes to that direction are odd / even.
	window.DBO_IsCharacterInQuotes = function (str, index) {
		let count = 0;
		for (let i = index; i < str.length; i++) {
			if (str[i] == `"` || str[i] == `“` || str[i] == `”` || str[i] == `‟`)
				count++;

			if (str[i] == `'` && str[i + 1] == `'`)
				count++;

			if (str[i] == `’` && str[i + 1] == `’`)
				count++;
		}

		return count % 2 == 1
	}

	window.DBO_openPreviewURL = function () {
		if (!preview || !preview.data("id"))
			return;

		window.open('https://www.duelingbook.com/card?id=' + preview.data("id"));
	}

	window.DBO_AreSelectMenussEqual = function (select1, select2) {
		if (select1.length !== select2.length) {
			return false;
		}

		for (let i = 0; i < select1.length; i++) {
			if (select1.options[i].text !== select2.options[i].text || select1.options[i].value !== select2.options[i].value) {
				return false;
			}
		}

		return true;
	}

	window.enterM1E = function () {
		if (currentPhase != "DP" && currentPhase != "SP") {
			Send({ "action": "Duel", "play": "Enter M1" });
			return;
		}


		let serpentFound = false;
		let treebornFound = false;

		for (let abc = 0; abc < player1.grave_arr.length; abc++) {
			if (player1.grave_arr[abc].data("cardfront").data("name") == "Sinister Serpent") {
				serpentFound = true;
				break;
			}

			if (player1.grave_arr[abc].data("cardfront").data("name") == "Treeborn Frog") {
				treebornFound = true;
				break;
			}
		}

		let playerST = [];

		for (let abc = 1; abc <= 5; abc++) {
			if (player1["s" + abc] != null)
				playerST.push(player1["s" + abc])
		}

		if (playerST.length > 0) {
			treebornFound = false;
		}

		DBO_CheckPlayerZones(true);

		if (DBO_Player1MonsterZones.find(o => o.card.data("cardfront").data("name") === "Treeborn Frog")) {
			treebornFound = false;
		}

		if (serpentFound) {
			if (currentPhase == "DP") {
				enterSPE();
			}

			getConfirmation2("Take Sinister Serpent before MP1?", "", DBO_SinisterYes, DBO_SinisterNo);
		}
		else if (treebornFound) {
			if (currentPhase == "DP") {
				enterSPE();
			}

			getConfirmation2("SS Treeborn Frog before MP1?", "", DBO_TreebornYes, DBO_TreebornNo);
		}
		else {
			Send({ "action": "Duel", "play": "Enter M1" });
		}
	}

	window.DBO_SinisterYes = function () {


		for (let abc = 0; abc < player1.grave_arr.length; abc++) {
			if (player1.grave_arr[abc].data("cardfront").data("name") == "Sinister Serpent") {
				cardMenuClicked(player1.grave_arr[abc], "To hand");
				break;
			}
		}

		Send({ "action": "Duel", "play": "Enter M1" });
	}

	window.DBO_SinisterNo = function () {
		Send({ "action": "Duel", "play": "Enter M1" });
	}

	window.DBO_TreebornYes = function () {
		let playerST = [];

		for (let abc = 1; abc <= 5; abc++) {
			if (player1["s" + abc] != null)
				playerST.push(player1["s" + abc])
		}

		if (playerST.length > 0) {
			Send({ "action": "Duel", "play": "Enter M1" });
			return;
		}

		for (let abc = 0; abc < player1.grave_arr.length; abc++) {
			if (player1.grave_arr[abc].data("cardfront").data("name") == "Treeborn Frog") {
				let DBO_checked = $('#choose_zones_cb').prop("checked");

				$('#choose_zones_cb').checked(false);
				cardMenuClicked(player1.grave_arr[abc], "SS DEF");
				$('#choose_zones_cb').checked(DBO_checked);

				break;
			}
		}



	}

	window.DBO_TreebornNo = function () {
		Send({ "action": "Duel", "play": "Enter M1" });
	}

	window.DBO_ImportDeckE = function () {
		var options = ["File"];
		var custom = false;
		var rush = false;

		for (var i = 0; i < deck_filled_arr.length; i++) {
			if (deck_filled_arr[i].data("custom")) {
				custom = true;
			}
			if (deck_filled_arr[i].data("rush")) {
				rush = true;
			}
		}
		for (i = 0; i < side_filled_arr.length; i++) {
			if (side_filled_arr[i].data("custom")) {
				custom = true;
			}
			if (side_filled_arr[i].data("rush")) {
				rush = true;
			}
		}
		for (i = 0; i < extra_filled_arr.length; i++) {
			if (extra_filled_arr[i].data("custom")) {
				custom = true;
			}
			if (extra_filled_arr[i].data("rush")) {
				rush = true;
			}
		}

		if (!custom) {
			options.push("Clipboard List");
		}
		getComboBox("Import Deck", "For Clipboard import, use this example: https://ibb.co/7jZ4bS1", options, 0, DBO_ImportDeck);
		showDim();
	}

	window.DBO_ImportDeck = function () {
		if ($('#combo .combo_cb').val().indexOf("File") >= 0) {
			importDeck();
			return;
		}
		else if ($('#combo .combo_cb').val().indexOf("Clipboard List") >= 0) {
			DBO_ImportDeckFromList();
		}

	}

	window.DBO_ImportDeckFromList = async function () {

		let str = await navigator.clipboard.readText();

		var main_arr = [];
		var side_arr = [];
		var extra_arr = [];

		let cards = [];

		let import_arr = str.split("\n");

		for (let abc = 0; abc < import_arr.length; abc++) {
			if (import_arr[abc].charAt(0) != 1 && import_arr[abc].charAt(0) != 2 && import_arr[abc].charAt(0) != 3)
				continue;

			let count = import_arr[abc].charAt(0);

			if (import_arr[abc].charAt(1) == 'x' || import_arr[abc].charAt(1) == 'X') {
				import_arr[abc] = import_arr[abc].replace(import_arr[abc].charAt(1), "")
			}

			import_arr[abc] = import_arr[abc].replace(import_arr[abc].charAt(0), "")
			import_arr[abc] = import_arr[abc].trim()

			for (let dummy_value = 0; dummy_value < count; dummy_value++) {
				cards.push(import_arr[abc]);
			}
		}
		for (let abc = 0; abc < cards.length; abc++) {
			for (let i = 0; i < Cards.length; i++) {
				if (Cards[i].name_lowercase == cards[abc].toLowerCase()) {
					if (Cards[i].monster_color == "Fusion" || Cards[i].monster_color == "Synchro" || Cards[i].monster_color == "Xyz" || Cards[i].monster_color == "Link") {
						extra_arr.push(Cards[i].id);
						i = 9999999;
					}
					else {
						main_arr.push(Cards[i].id);
						i = 9999999;
					}
				}
			}
		}

		importedCards = { "main": main_arr, "side": side_arr, "extra": extra_arr };
		DBO_importDeckFromListB();
	}

	window.DBO_importDeckFromListB = function (str) {
		importedDeckName = "";
		getInput("Import Deck", "Enter a name for your new deck", importedDeckName, 20, DBO_importDeckFromListC, /[^ -~●]/g);
		showDim();
	}

	window.DBO_importDeckFromListC = function () {
		var name = $('#input .input_txt').val();
		if (name == "") {
			errorE("Deck name cannot be blank");
			importedCards = null;
			importedDeckName = null;
			return;
		}
		for (var i = 0; i < decks.length; i++) {
			if (decks[i].data.toLowerCase() == name.toLowerCase()) {
				errorE("Deck with name exists", importDeckE);
				showDim();
				return;
			}
		}
		Send({ "action": "Import deck", "cards": importedCards, "name": name });
		importedCards = null;
		importedDeckName = null;
		showDim();
	}

	$('#deck_constructor #import_btn').off("click")
	$('#deck_constructor #import_btn').click(DBO_ImportDeckE)


	window.DBO_findCardReal = function (arr, hand, grave, like, banished) {
		var cards = [player1.m1, player1.m2, player1.m3, player1.m4, player1.m5, player1.s1, player1.s2, player1.s3, player1.s4, player1.s5, player1.pendulumLeft, player1.pendulumRight, player1.fieldSpell, player2.m1, player2.m2, player2.m3, player2.m4, player2.m5, player2.s1, player2.s2, player2.s3, player2.s4, player2.s5, player2.pendulumLeft, player2.pendulumRight, player2.fieldSpell, linkLeft, linkRight, player1.skillCard, player2.skillCard];

		if (typeof banished !== "undefined" && banished) {
			for (var k = 0; k < player1.banished_arr.length; k++) {
				cards.push(player1.banished_arr[k]);
			}
		}
		if (hand) {
			for (var k = 0; k < player1.hand_arr.length; k++) {
				cards.push(player1.hand_arr[k]);
			}
		}
		if (grave) {
			for (k = 0; k < player1.grave_arr.length; k++) {
				cards.push(player1.grave_arr[k]);
			}
		}
		for (var i = 0; i < arr.length; i++) {
			for (var j = 0; j < cards.length; j++) {
				if (cards[j]) {
					if (cards[j].data("face_down")) { // Question
						continue;
					}
					//if (cards[j].data("cardfront").data("treated_as") == arr[i] && !cards[j].data("face_down")) {
					if (cards[j].data("cardfront").data("treated_as") == arr[i] || like && cards[j].data("cardfront").data("treated_as") && cards[j].data("cardfront").data("treated_as").indexOf(arr[i]) >= 0) {
						return true;
					}
				}
			}
		}
		return false;
	}

	// Card ID is fully unique, two copies of nibiru have different card IDs.
	// Card ID is found with card.data("id")
	window.DBO_findCardByIdReal = function (cardId, hand, grave, every) {
		var cards = [player1.m1, player1.m2, player1.m3, player1.m4, player1.m5, player1.s1, player1.s2, player1.s3, player1.s4, player1.s5, player1.pendulumLeft, player1.pendulumRight, player1.fieldSpell, player2.m1, player2.m2, player2.m3, player2.m4, player2.m5, player2.s1, player2.s2, player2.s3, player2.s4, player2.s5, player2.pendulumLeft, player2.pendulumRight, player2.fieldSpell, linkLeft, linkRight, player1.skillCard, player2.skillCard];

		if (every) {
			for (var k = 0; k < player1.all_cards_arr.length; k++) {
				cards.push(player1.all_cards_arr[k]);
			}
		}
		else {
			if (hand) {
				for (var k = 0; k < player1.hand_arr.length; k++) {
					cards.push(player1.hand_arr[k]);
				}
			}
			if (grave) {
				for (k = 0; k < player1.grave_arr.length; k++) {
					cards.push(player1.grave_arr[k]);
				}
			}
		}
		for (var j = 0; j < cards.length; j++) {
			if (cards[j]) {
				if (cards[j].data("face_down")) { // Question
					continue;
				}
				//if (cards[j].data("cardfront").data("treated_as") == arr[i] && !cards[j].data("face_down")) {
				if (cards[j].data("id") == cardId) {
					return true;
				}
			}
		}
		return false;
	}

	// Card ID is fully unique, two copies of nibiru have different card IDs.
	// Card ID is found with card.data("id")
	window.DBO_getCardByIdReal = function (cardId, hand, grave, every) {
		var cards = [player1.m1, player1.m2, player1.m3, player1.m4, player1.m5, player1.s1, player1.s2, player1.s3, player1.s4, player1.s5, player1.pendulumLeft, player1.pendulumRight, player1.fieldSpell, player2.m1, player2.m2, player2.m3, player2.m4, player2.m5, player2.s1, player2.s2, player2.s3, player2.s4, player2.s5, player2.pendulumLeft, player2.pendulumRight, player2.fieldSpell, linkLeft, linkRight, player1.skillCard, player2.skillCard];

		if (every) {
			for (var k = 0; k < player1.all_cards_arr.length; k++) {
				cards.push(player1.all_cards_arr[k]);
			}
		}
		else {
			if (hand) {
				for (var k = 0; k < player1.hand_arr.length; k++) {
					cards.push(player1.hand_arr[k]);
				}
			}
			if (grave) {
				for (k = 0; k < player1.grave_arr.length; k++) {
					cards.push(player1.grave_arr[k]);
				}
			}
		}
		for (var j = 0; j < cards.length; j++) {
			if (cards[j]) {

				//if (cards[j].data("cardfront").data("treated_as") == arr[i] && !cards[j].data("face_down")) {
				if (cards[j].data("id") == cardId) {
					return cards[j];
				}
			}
		}
		return null;
	}

	// Card ID is fully unique, two copies of nibiru have different card IDs.
	// Card ID is found with card.data("id")
	window.DBO_getCardByIdEverywhereReal = function (cardId) {
		let DBO_list = document.querySelectorAll("div")

		for (let abc = 0; abc < DBO_list.length; abc++) {
			let obj = $(DBO_list[abc]);

			if (obj.attr("class") != "card")
				continue;


			if ($(DBO_list[abc]).data("id") == cardId)
				return $(DBO_list[abc]);
		}
		return null;
	}

	window.findCard = function (arr, hand, grave, like) {
		if (DBO_unlockCardMechanics) {
			var no_question = true;
			var cards = [player1.m1, player1.m2, player1.m3, player1.m4, player1.m5, player1.s1, player1.s2, player1.s3, player1.s4, player1.s5, player1.pendulumLeft, player1.pendulumRight, player1.fieldSpell, player2.m1, player2.m2, player2.m3, player2.m4, player2.m5, player2.s1, player2.s2, player2.s3, player2.s4, player2.s5, player2.pendulumLeft, player2.pendulumRight, player2.fieldSpell, linkLeft, linkRight, player1.skillCard, player2.skillCard];
			if (hand) {
				for (var k = 0; k < player1.hand_arr.length; k++) {
					cards.push(player1.hand_arr[k]);
				}
			}
			if (grave) {
				for (k = 0; k < player1.grave_arr.length; k++) {
					cards.push(player1.grave_arr[k]);
				}
			}
			for (var i = 0; i < arr.length; i++) {
				if (arr[i] != "Question")
					continue;

				no_question = false;

				for (var j = 0; j < cards.length; j++) {
					if (cards[j]) {
						if (cards[j].data("face_down")) { // Question
							continue;
						}
						//if (cards[j].data("cardfront").data("treated_as") == arr[i] && !cards[j].data("face_down")) {
						if (cards[j].data("cardfront").data("treated_as") == arr[i] || like && cards[j].data("cardfront").data("treated_as") && cards[j].data("cardfront").data("treated_as").indexOf(arr[i]) >= 0) {
							return true;
						}
					}
				}
			}
			return no_question;
		}
		// Original function content.
		else {
			var cards = [player1.m1, player1.m2, player1.m3, player1.m4, player1.m5, player1.s1, player1.s2, player1.s3, player1.s4, player1.s5, player1.pendulumLeft, player1.pendulumRight, player1.fieldSpell, player2.m1, player2.m2, player2.m3, player2.m4, player2.m5, player2.s1, player2.s2, player2.s3, player2.s4, player2.s5, player2.pendulumLeft, player2.pendulumRight, player2.fieldSpell, linkLeft, linkRight, player1.skillCard, player2.skillCard];
			if (hand) {
				for (var k = 0; k < player1.hand_arr.length; k++) {
					cards.push(player1.hand_arr[k]);
				}
			}
			if (grave) {
				for (k = 0; k < player1.grave_arr.length; k++) {
					cards.push(player1.grave_arr[k]);
				}
			}
			for (var i = 0; i < arr.length; i++) {
				for (var j = 0; j < cards.length; j++) {
					if (cards[j]) {
						if (cards[j].data("face_down")) { // Question
							continue;
						}
						//if (cards[j].data("cardfront").data("treated_as") == arr[i] && !cards[j].data("face_down")) {
						if (cards[j].data("cardfront").data("treated_as") == arr[i] || like && cards[j].data("cardfront").data("treated_as") && cards[j].data("cardfront").data("treated_as").indexOf(arr[i]) >= 0) {
							return true;
						}
					}
				}
			}
			return false;
		}
	}


	window.Send = async function (data) {
		let DBO_message = "";

		if (data && data.message) {
			DBO_message = data.message;
		}

		if (data.action == "Duel" && (data.play == "Life points" || data.play == "Stop viewing")) {
			if (typeof DBO_recordCombo !== "undefined") {
				let card = undefined;
				let cardName = ""
				let play = data.play;
				let startZone = "";
				let endZone = "";
				let endCardName = "";

				if (card)
					cardName = card.data("cardfront").data("name");

				if (data.zone)
					endZone = data.zone;

				if (data.end_card)
					endCardName = data.end_card.data("cardfront").data("name");

				let wasFaceup = true;

				if (card) {
					wasFaceup = !card.data("face_down");
				}

				let DBO_arr = [];

				DBO_arr.play = play;

				if (data.amount)
					DBO_arr.cardName = data.amount;

				// play || wasFaceup || startZone || endZone || cardName || endCardName

				DBO_recordComboStr = DBO_recordComboStr + DBO_comboPlayArrayToStr(DBO_arr) + "\n";
			}
		}
		else if (data.action == "Duel" && data.play.indexOf("View") >= 0) {
			if (typeof DBO_recordCombo !== "undefined") {
				let cardId = data.card;
				let card = undefined;
				let cardName = ""
				let play = data.play;
				let startZone = "";
				let endZone = "";
				let endCardName = "";

				if (cardId) {
					card = DBO_getCardByIdReal(data.card, true, true, true);
					cardName = card.data("cardfront").data("name");

					let zone = DBO_getCardZone(card);

					if (zone)
						startZone = zone;
				}


				let DBO_arr = [];

				DBO_arr.play = play;
				DBO_arr.cardName = cardName;
				DBO_arr.startZone = startZone;

				// play || wasFaceup || startZone || endZone || cardName || endCardName

				DBO_recordComboStr = DBO_recordComboStr + DBO_comboPlayArrayToStr(DBO_arr) + "\n";
			}
		}
		if (data.action == "Duel" && DBO_isPlayCardPlay(data.play)) {
			if (typeof DBO_recordCombo !== "undefined") {
				let cardId = data.card;
				let card = undefined;
				let cardName = ""
				let play = data.play;
				let startZone = "";
				let endZone = "";
				let endCardName = "";

				if (cardId) {
					card = DBO_getCardByIdReal(data.card, true, true, true);
					cardName = card.data("cardfront").data("name");
				}

				if (data.start_card) {
					card = DBO_getCardByIdReal(data.start_card, true, true, true);
					cardName = card.data("cardfront").data("name");
				}
				if (data.zone)
					endZone = data.zone;

				let wasFaceup = true;

				if (typeof card !== "undefined") {
					if (data.end_card) {
						let end_card = DBO_getCardByIdReal(data.end_card, true, true, true);
						endCardName = end_card.data("cardfront").data("name");

						zone = DBO_getCardZone(card);

						if (zone)
							startZone = zone;

						else {
							if (isIn(card, player1.extra_arr) >= 0)
								startZone = "Extra Deck";

							else if (isIn(card, player1.grave_arr) >= 0)
								startZone = "GY";

							else if (isIn(card, player1.banished_arr) >= 0)
								startZone = "Banished";

						}

						zone = DBO_getCardZone(end_card);

						if (zone)
							endZone = zone;
					}

					else if (card.hasClass("xyzmaterial")) {
						let oldXyz = null;
						let xyzArr = [];

						DBO_CheckPlayerZones();

						for (let abc = 0; abc < window.DBO_Player1MonsterZones.length; abc++) {
							let found = false;
							let cardToTest = window.DBO_Player1MonsterZones[abc].card;
							let zoneToTest = window.DBO_Player1MonsterZones[abc].zoneName;

							if (cardToTest == null)
								continue;

							for (let def = 0; def < cardToTest.data("xyz_arr").length; def++) {
								if (cardToTest.data("xyz_arr")[def].data("id") == card.data("id")) {
									oldXyz = cardToTest;
									zone = zoneToTest;
								}
							}
						}

						if (oldXyz == null) {
							addLine(`Could not find which Xyz monster ${cardName} belongs to`);
							return;
						}

						endCardName = oldXyz.data("cardfront").data("name");

						zone = DBO_getCardZone(oldXyz);

						if (zone)
							startZone = zone;
					}
					else if (viewing) {
						startZone = "Viewing";
					}
					else if (isIn(card, player1.hand_arr) >= 0) {
						startZone = "Hand";
					}
					else if (isIn(card, player1.grave_arr) >= 0) {
						startZone = "GY";
					}
					else if (isIn(card, player1.banished_arr) >= 0) {
						startZone = "Banished";
					}
					else if (isIn(card, player1.extra_arr) >= 0) {
						startZone = "Extra Deck";
					}
					else {
						startZone = DBO_getCardZone(card);

						if (startZone == null)
							startZone = "";
					}

					wasFaceup = !card.data("face_down");
				}

				let DBO_arr = [];

				DBO_arr.play = play;
				DBO_arr.wasFaceup = wasFaceup;
				DBO_arr.startZone = startZone;
				DBO_arr.endZone = endZone;
				DBO_arr.cardName = cardName;
				DBO_arr.endCardName = endCardName;

				// play || wasFaceup || startZone || endZone || cardName || endCardName

				DBO_recordComboStr = DBO_recordComboStr + DBO_comboPlayArrayToStr(DBO_arr) + "\n";
			}
		}
		if (data.action == "Duel" && data.play.indexOf("Stop viewing") >= 0) {
			if (data.viewing.indexOf("Secret ") >= 0 || data.viewing == "DBO Xyz Materials")
				return;
		}
		else if (data.action == "Duel" && data.play == "Duel message") {
			if (actionsQueue.length > 0) {
				if (DBO_messageStartsWith(DBO_message, "/")) {
					setTimeout(function () {
						$("#duel .cin_txt").val(DBO_message);
					}, 50);

					return;
				}
				else {
					action = JSON.stringify(data, function (k, v) {
						if (v == null) {
							v = undefined;
						}
						return v;
					});
					resend();

					return;
				}
			}

			if (DBO_messageStartsWith(DBO_message, "/card") || DBO_messageStartsWith(DBO_message, "/find")) {
				if (DBO_messageStartsWith(DBO_message, "/card"))
					DBO_message = DBO_message.replace(/\/card/i, "")

				else if (DBO_messageStartsWith(DBO_message, "/find"))
					DBO_message = DBO_message.replace(/\/find/i, "")

				if (DBO_message.indexOf(" ") == 0)
					DBO_message = DBO_message.replace(" ", "")

				let str = DBO_message.toUpperCase();

				str = str.trim();

				if (str.length == 0)
					return;

				let cardNamesFound = [];
				let cardAbbrevFound = [];


				for (let abc = 0; abc < Cards.length; abc++) {
					if (Cards[abc].hidden)
						continue;

					let cardName = Cards[abc].name.toUpperCase();

					if (cardName.search(str) == -1) {
						// Try here to search by abbreviation, like MST --> Mystical Space Typhoon.

						let abbrev = cardName.replaceAll("'", "").match(/[\p{Alpha}\p{Nd}]+/gu)
							.reduce((previous, next) => previous + ((+next === 0 || parseInt(next)) ? parseInt(next) : next[0] || ''), '')
							.toUpperCase()

						if (abbrev.search(str) == -1)
							continue;

						if (cardAbbrevFound.indexOf(Cards[abc].name) == -1)
							cardAbbrevFound.push(Cards[abc].name);

						continue;
					}

					else if (cardNamesFound.indexOf(Cards[abc].name) != -1)
						continue;

					cardNamesFound.push(Cards[abc].name);
				}

				if (cardNamesFound.length > 15)
					DBO_addColoredLine("FF0000", "Error: Found over 15 cards with that name.");

				else {
					DBO_addColoredLine("00CCCC", `List of cards that contain "${str}":`);

					for (let abc = 0; abc < cardNamesFound.length; abc++) {
						let card = DBO_lookupCard(cardNamesFound[abc]);

						card.data("cardfront", card)
						DBO_addCardHoverLine('<font color="0000FF">' + quote(cardNamesFound[abc]) + "</font>", card);
					}

					for (let abc = 0; abc < cardAbbrevFound.length; abc++) {
						let card = DBO_lookupCard(cardAbbrevFound[abc]);

						card.data("cardfront", card)
						DBO_addCardHoverLine('<font color="FF0000">' + quote(cardAbbrevFound[abc]) + "</font>", card);
					}
				}

				return;
			}
			else if (DBO_messageStartsWith(DBO_message, "/help3") || DBO_messageStartsWith(DBO_message, "/cmds3")) {
				addLine("/rps ==> Randomly creates rock paper scissors selections.");
				addLine("/ld ==> Silently shows every Light and Dark in your GY.");
				addLine("/card Skill ==> Find's a card named Skill, or abbreviated Skill");
				addLine("/calc (10 + 10) * 20 ==> Silently calculates, prints result.");
				addLine("/calc2 (10 + 10) * 20 ==> calculates, forces you to say formula = result.");
				addLine("/rngdiscard ==> Tells opponent how it'll work, then shuffles your hand and banishes FD closest card to your Deck.");
				addLine("/note Nibiru is live ==> Silently writes 'Nibiru is live' in the chat.");
				addLine("/kg ==> Keep going button");
				addLine("/unext ==> Deprecated. Right click banish pile to unexcavate.");
				addLine("/unexb ==> Deprecated. Right click banish pile to unexcavate.");
				addLine("/unexg ==> Deprecated. Right click banish pile to unexcavate.");
				addLine("/snipe ==> Deprecated. In order to snipe face-down cards, right click them");
				addLine("/gy ==> Deprecated. In order to silently show a GY, right click it.");
				return;
			}
			else if (DBO_messageStartsWith(DBO_message, "/help2") || DBO_messageStartsWith(DBO_message, "/cmds2")) {
				DBO_addColoredLine("037F51", "DB Unlock Command List:");

				addLine("/ex5 ==> Excavate 5 cards");
				addLine("/excavate5 ==> Excavate 5 cards");
				addLine("/search Skill D ==> Add a card that has 'Skill D' in name from your deck");
				addLine("/dig Eldlixir*Golden Land ==> View deck for only cards with 'Eldlixir' or 'Golden Land' in name.");
				addLine("/pend <card name> ==> Conducts a pendulum mechanic with a given card in deck");
				addLine("/send Skill D ==> Mill a card that has 'Skill D' in name from your deck");
				addLine("/st Skill D ==> Places a card in S&T zone that has 'Skill D' in name from your deck");
				addLine("/ban Skill D ==> Banish a card that has 'Skill D' in name from your deck");
				addLine("/banfd Skill D ==> Banish a card face-down that has 'Skill D' in name from your deck");
				addLine("/atk Eldlich ==> SS in ATK a card that has 'Eldlich' in name from your deck");
				addLine("/def Eldlich ==> SS in DEF a card that has 'Eldlich' in name from your deck");

				DBO_message = DBO_message.substring(0, 5);

				DBO_addColoredLine("037F51", "For More Dueling Book Unlock commands, use " + DBO_message + "3");

				return;
			}
			// So it won't double down on both /help and /help2.
			else if (DBO_messageStartsWith(DBO_message, "/help") || DBO_messageStartsWith(DBO_message, "/cmds")) {
				DBO_addColoredLine("037F51", "Command List:");

				addLine("/drawx ==> Draw x cards");
				addLine("/millx ==> Mill x cards of your top deck");
				addLine("/banishx ==> Banish x cards of your top deck");
				addLine("/banishfdx ==> Banish x cards of your top deck, face-down");
				addLine("/discardhand ==> Discards your hand");
				addLine("/banishhand ==> Banishes your hand");
				addLine("/addx ==> Gain x LP");
				addLine("/subx ==> Lose x LP.");
				addLine("/half ==> Halve your LP");
				addLine("/pause ==> Pauses or Unpauses the game.");
				addLine("/unpause ==> Identical to /pause in every way.");
				DBO_addColoredLine("037F51", "For Dueling Book Unlock commands, use " + data.message + "2");

				return;
			}
			else if (DBO_messageStartsWith(DBO_message, "/dig")) {
				let msg = data.message;

				msg = msg.substring(4);

				if (msg.indexOf(' ') == 0)
					msg = msg.replace(" ", "");

				if (msg.length == 0) {
					addLine("Usage: /dig <cardName>")
					addLine("Usage 2: /dig <cardName*cardName2>")
				}
				else if (msg.length <= 1) {
					addLine("Error: Use 2+ characters of the name")
				}
				else {
					DBO_DigString = msg;

					cardMenuClicked(new Card(), "View deck");
				}

				return;
			}
			else if (DBO_messageStartsWith(DBO_message, "/ex")) {
				DBO_message = DBO_message.replace(/\/ex/i, "")

				if (DBO_messageStartsWith(DBO_message, "cavate"))
					DBO_message = DBO_message.replace(/cavate/i, "")

				if (isNaN(DBO_message))
					return;

				let num = parseInt(DBO_message);

				if (num > 9)
					return;

				if (num > player1.main_arr.length)
					return;

				for (let abc = 0; abc < num; abc++) {
					let DBO_card = player1.main_arr[abc];
					cardMenuClicked(DBO_card, "Banish");

					window.DBO_waitingForAction = true;
					window.DBO_excavatedArr.push(DBO_card);
				}

				return;
			}
			else if (DBO_messageStartsWith(DBO_message, "/unext") || DBO_messageStartsWith(DBO_message, "/unexb") || DBO_messageStartsWith(DBO_message, "/unexg")) {
				for (let abc = 0; abc < window.DBO_excavatedArr.length; abc++) {
					if (window.DBO_excavatedArr[abc].data("face_down") || isIn(window.DBO_excavatedArr[abc], player1.banished_arr) < 0) {

						window.DBO_excavatedArr.splice(abc, 1);
						abc--;
					}
				}
				for (let abc = 0; abc < window.DBO_excavatedArr.length; abc++) {
					if (DBO_messageStartsWith(DBO_message, "/unext"))
						cardMenuClicked(window.DBO_excavatedArr[abc], "To T Deck");

					else if (DBO_messageStartsWith(DBO_message, "/unexb"))
						cardMenuClicked(window.DBO_excavatedArr[abc], "To B Deck");

					else if (DBO_messageStartsWith(DBO_message, "/unexg"))
						cardMenuClicked(window.DBO_excavatedArr[abc], "To GY");
				}

				window.DBO_excavatedArr.length = 0;

				return;
			}
			else if (DBO_messageStartsWith(DBO_message, "/rps")) {
				let arr = ["Rock", "Paper", "Scissors"];

				addLine("Only you can see the random results:");

				for (let abc = 1; abc <= 5; abc++) {
					DBO_addColoredLine("FF0000", arr[DBO_getRandomInt(0, arr.length - 1)]);
				}

				return;
			}
			else if (DBO_messageStartsWith(DBO_message, "/gy")) {
				let count = 0;

				for (let abc = 0; abc < player1.opponent.grave_arr.length; abc++) {
					count++;
				}

				for (let abc = 0; abc < player1.grave_arr.length; abc++) {
					count++;
				}

				if (count == 0) {
					addLine("Graveyards are empty.");
					return;
				}

				addLine("==============================")

				for (let abc = 0; abc < player1.opponent.grave_arr.length; abc++) {
					let cardName = player1.opponent.grave_arr[abc].data("cardfront").data("name");

					if (cardName.length > 27)
						cardName = cardName.slice(0, 27);

					DBO_addCardHoverLine('<font color="0000FF">' + quote(cardName) + "</font>", player1.opponent.grave_arr[abc]);
				}

				for (let abc = 0; abc < player1.grave_arr.length; abc++) {
					let cardName = player1.grave_arr[abc].data("cardfront").data("name");

					if (cardName.length > 27)
						cardName = cardName.slice(0, 27);

					DBO_addCardHoverLine('<font color="FF0000">' + quote(cardName) + "</font>", player1.grave_arr[abc]);
				}

				addLine("==============================")
				return;
			}
			else if (DBO_messageStartsWith(DBO_message, "/ld") || DBO_messageStartsWith(DBO_message, "/light") || DBO_messageStartsWith(DBO_message, "/dark")) {
				let count = 0;

				for (let abc = 0; abc < player1.grave_arr.length; abc++) {
					if (player1.grave_arr[abc].data("cardfront").data("attribute") == "DARK") {
						count++;
					}
					else if (player1.grave_arr[abc].data("cardfront").data("attribute") == "LIGHT") {
						count++;
					}
				}

				if (count == 0) {
					addLine("Your GY has no light and dark monsters.");
					return;
				}

				addLine("==============================")

				for (let abc = 0; abc < player1.grave_arr.length; abc++) {
					let cardName = player1.grave_arr[abc].data("cardfront").data("name");

					if (cardName.length > 27)
						cardName = cardName.slice(0, 27);

					if (player1.grave_arr[abc].data("cardfront").data("attribute") == "DARK") {
						DBO_addCardHoverLine('<font color="68478D">' + quote(cardName) + "</font>", player1.grave_arr[abc]);
					}
					else if (player1.grave_arr[abc].data("cardfront").data("attribute") == "LIGHT") {
						DBO_addCardHoverLine('<font color="FFC200">' + quote(cardName) + "</font>", player1.grave_arr[abc]);
					}
				}
				addLine("==============================")
				return;
			}
			else if (DBO_messageStartsWith(DBO_message, "/calc2")) {
				DBO_message = DBO_message.replace(/\/calc2/i, "");

				let formula = DBO_message;

				// Remove all spaces, not necessary...
				DBO_message = DBO_message.replace(/ /gi, "");

				if (DBO_message.length == 0)
					return;

				let result = DBO_ExprEval(DBO_message);

				let messageToSend = `${formula} = ${result}`;

				Send({ "action": "Duel", "play": "Duel message", "message": messageToSend, "html": ~~0 });

				return;
			}
			else if (DBO_messageStartsWith(DBO_message, "/calc")) {
				DBO_message = DBO_message.replace(/\/calc/i, "");

				let formula = DBO_message;

				// Remove all spaces, not necessary...
				DBO_message = DBO_message.replace(/ /gi, "");

				if (DBO_message.length == 0)
					return;

				let result = DBO_ExprEval(DBO_message);

				let messageToSend = `${formula} = ${result}`;

				DBO_addColoredLine("037F51", messageToSend);

				return;
			}
			else if (DBO_messageStartsWith(DBO_message, "/note")) {

				DBO_message = DBO_message.replace(/\/note/i, "")

				if (DBO_message.indexOf(" ") == 0)
					DBO_message = DBO_message.replace(" ", "")

				let messageToSend = `Note: ${DBO_message}`;

				DBO_addColoredLine2("CCFF00", messageToSend);

				return;
			}
			else if (DBO_messageStartsWith(DBO_message, "/kg")) {
				if (player1.still_good || parseFloat($('#good_btn').css("opacity")) < 0.5) {
					Send({ "action": "Duel", "play": "Stop good" });
					$('#good_btn').css("opacity", 1);
				}
				else {
					$('html').off("mouseup");
					$('#good_btn').css("opacity", 0.4);
					$('#good_btn').data("holding", true);
					Send({ "action": "Duel", "play": "Good", "long": true });
				}

				return;
			}
			else if (DBO_messageStartsWith(DBO_message, "/record")) {
				DBO_message = DBO_message.replace(/\/record/i, "")

				if (DBO_message.indexOf(" ") == 0)
					DBO_message = DBO_message.replace(" ", "").trim();

				if (DBO_message.length == 0) {
					addLine("Usage: /record <comboName>")
					return;
				}

				addLine("Use /stoprecord in order to stop recording");
				addLine("Your chat is also being recorded. No green buttons and commands are recorded");
				addLine("Note: When interacting with a card not on field, the extension won't differentiate 2 cards with the same name");
				addLine("To delete a combo, record a combo with the same name on a custom card.");

				window.DBO_recordCombo = DBO_message;
				window.DBO_recordComboStr = "";

				return;
			}

			else if (DBO_messageStartsWith(DBO_message, "/stoprecord")) {
				if (DBO_recordComboStr.length == 0) {
					addLine("There was nothing to record.")
					return;
				}

				// Remove duplicates by case sensitive.
				for (let abc = 0; abc < localStorage.length; abc++) {
					let keyName = localStorage.key(abc);

					if (keyName.toLowerCase() == `DBO_combos_${DBO_recordCombo}`.toLowerCase())
						localStorage.removeItem(keyName);
				}

				localStorage.setItem(`DBO_combos_${DBO_recordCombo}`, DBO_recordComboStr);
				addLine("Successfully recorded the combo");

				window.DBO_recordCombo = undefined;
				window.DBO_recordComboStr = "";

				return;
			}
			else if (DBO_messageStartsWith(DBO_message, "/play")) {
				let DBO_arr = [];

				for (let abc = 0; abc < localStorage.length; abc++) {
					let keyName = localStorage.key(abc);

					if (!keyName.startsWith("DBO_combos_"))
						continue;

					let DBO_val = localStorage.getItem(keyName);

					let import_arr = DBO_val.split("\n");

					// Card Action || wasFaceup? || zoneName || cardName || endCardName


					// Check if the first part of the combo is doable.
					let DBO_firstPlay = DBO_comboPlayStrToArray(import_arr[0]);

					if (DBO_firstPlay.cardName.length == 0 || DBO_firstPlay.play == "Life points" || DBO_firstPlay.play.search(/view/i) >= 0 || DBO_firstPlay.play == "Draw card" || DBO_firstPlay.play == "Shuffle deck" || DBO_firstPlay.play == "Mill" || DBO_firstPlay.play == "Banish random ED card" || DBO_firstPlay.play == "Banish random ED card FD" || DBO_findCardReal([DBO_firstPlay.cardName], true, true, false, true)) {
						keyName = keyName.replace("DBO_combos_", "");

						DBO_arr.push(keyName);
					}
				}

				if (DBO_arr.length == 0) {
					addLine("Could not find any combos starting with the cards outside of your Deck");

					return;
				}

				// Enter is both accepting combo box and sending a command.
				setTimeout(function () {
					getComboBox("Which combo do you want to load?", "Stop the combo by loading another or ignoring the /next command.", DBO_arr, 0, DBO_playComboYes);
				}, 15);

				return;
			}
			else if (DBO_messageStartsWith(DBO_message, "/next")) {
				if (typeof DBO_comboPlayIndex === "undefined") {
					addLine("Combo is not loaded. Use /play to load a combo.");

					return;
				}
				else if (DBO_waitingForActionOrViewing || actionsQueue.length > 0) {
					setTimeout(function () {
						$("#duel .cin_txt").val(DBO_message);
					}, 50);

					return;
				}

				let currentPlay = DBO_comboArr[DBO_comboPlayIndex];

				let DBO_arr = DBO_comboPlayStrToArray(currentPlay);

				let DBO_legalCardsArr = [];

				if (DBO_arr.play.indexOf("SS") >= 0 || DBO_arr.play == "Normal Summon" || DBO_arr.play.indexOf("OL") >= 0 || DBO_arr.play == "Overlay" || DBO_arr.play == "To hand") {
					window.DBO_waitingForActionOrViewing = true;
				}
				if (DBO_arr.play == "Stop viewing") {
					DBO_exitViewing();
				}
				else if (DBO_arr.play == "Summon token") {
					window.DBO_waitingForActionOrViewing = true;

					Send({ "action": "Duel", "play": DBO_arr.play, "card": newDuelCard(), "zone": DBO_arr.endZone });
				}
				else if (DBO_arr.play == "Life points") {
					Send({ "action": "Duel", "play": DBO_arr.play, "amount": parseInt(DBO_arr.cardName) });
				}
				else if (DBO_arr.play == "Draw card" || DBO_arr.play == "Shuffle deck" || DBO_arr.play == "Mill" || DBO_arr.play == "Banish random ED card" || DBO_arr.play == "Banish random ED card FD") {
					window.DBO_waitingForActionOrViewing = true;

					cardMenuClicked(new Card(), DBO_arr.play);
				}
				else if (DBO_arr.play.indexOf("View") >= 0) {
					window.DBO_waitingForActionOrViewing = true;

					switch (DBO_arr.play) {
						case "View deck":
						case "View ED":
							cardMenuClicked(new Card(), DBO_arr.play)
							break;

						case "View GY":
							viewGY();
							break;

						case "View GY 2":
							viewGY2();
							break;

						case "View Banished":
							viewBanished();
							break;

						case "View Banished 2":
							viewBanished2();
							break;

						case "View materials":
							let card = getCardByZone(player1, DBO_arr.startZone);

							if (card) {
								viewMaterials(card);
							}
							break;
					}

				}
				else {
					let relevantArr = [];

					if (viewing) {
						$('#view > .content').find(".card").each(function (index) {
							relevantArr.push($(this));
						});
					}
					else {
						switch (DBO_arr.startZone) {

							case "Hand":
								relevantArr = player1.hand_arr;

								break;

							case "GY":
								relevantArr = player1.grave_arr;

								break;

							case "Banished":
								relevantArr = player1.banished_arr;

								break;

							case "Extra Deck":
								relevantArr = player1.extra_arr;

								break;

							default:

								if (DBO_arr.startZone.length > 0) {
									let targetCard = getCardByZone(player1, DBO_arr.startZone);


									relevantArr = [];


									if (targetCard != null) {
										relevantArr.push(targetCard);

										for (let def = 0; def < targetCard.data("xyz_arr").length; def++) {
											if (targetCard.data("xyz_arr")[def].data("cardfront").data("name") == DBO_arr.cardName) {
												relevantArr.push(targetCard.data("xyz_arr")[def]);
											}
										}
									}
								}
								break;
						}
					}

					switch (DBO_arr.endZone) {

						case "Hand":
							relevantArr = relevantArr.concat(player1.hand_arr);

							break;

						case "GY":
							relevantArr = relevantArr.concat(player1.grave_arr);

							break;

						case "Banished":
							relevantArr = relevantArr.concat(player1.banished_arr);

							break;

						case "Extra Deck":
							relevantArr = relevantArr.concat(player1.extra_arr);

							break;

						default:

							if (DBO_arr.endZone.length > 0) {
								let targetCard = getCardByZone(player1, DBO_arr.endZone);

								if (targetCard != null)
									relevantArr.push(targetCard);
							}
							break;
					}
					/*
					if(DBO_arr.play == "Overlay" || DBO_arr.play == "OL ATK" || DBO_arr.play == "OL DEF" || DBO_arr.play == "Attach")
					{
						DBO_CheckPlayerZones(true);
						
						for(let abc=0;abc < DBO_Player1MonsterZones.length;abc++)
						{
							let card = DBO_Player1MonsterZones[abc].card;
							
							relevantArr.push(card);
						}
						
						if(DBO_arr.play == "OL ATK" || DBO_arr.play == "OL DEF")
						{
							for(let abc=0;abc < player1.extra_arr.length;abc++)
							{
								let card = player1.extra_arr[abc];
							
								relevantArr.push(card);
							}
						}
						else if(DBO_arr.play == "Attach")
						{
							for(let abc=0;abc < player1.extra_arr.length;abc++)
							{
								let card = player1.extra_arr[abc];
							
								relevantArr.push(card);
							}
							
							for(let abc=0;abc < player1.extra_arr.length;abc++)
							{
								let card = player1.extra_arr[abc];
							
								relevantArr.push(card);
							}
						}
					}
					*/
					if (relevantArr.length > 0) {
						relevantArr = [].concat(relevantArr);


						DBO_legalCardsArr = [].concat(relevantArr);
					}
				}

				if (DBO_legalCardsArr.length > 0) {
					for (let abc = 0; abc < DBO_legalCardsArr.length; abc++) {
						if (isIn(DBO_legalCardsArr[abc], player1.extra_arr) < 0) {
							if ((DBO_arr.wasFaceup && DBO_legalCardsArr[abc].data("face_down")) || (!DBO_arr.wasFaceup && !DBO_legalCardsArr[abc].data("face_down")))
								continue;
						}

						if (DBO_legalCardsArr[abc].data("cardfront").data("name") == DBO_arr.cardName) {
							if (DBO_arr.play == "Overlay" || DBO_arr.play == "OL ATK" || DBO_arr.play == "OL DEF" || DBO_arr.play == "Attach") {

								let start_card = DBO_legalCardsArr[abc];
								let end_card = getCardByZone(player1, DBO_arr.endZone);

								Send({ "action": "Duel", "play": DBO_arr.play, "start_card": start_card.data("id"), "end_card": end_card.data("id") });

								break;
							}
							else {
								if (DBO_arr.endZone.length > 0) {
									Send({ "action": "Duel", "play": DBO_arr.play, "card": DBO_legalCardsArr[abc].data("id"), "zone": DBO_arr.endZone });
								}
								else {
									Send({ "action": "Duel", "play": DBO_arr.play, "card": DBO_legalCardsArr[abc].data("id") });
								}

								break;
							}
						}
					}
				}

				DBO_comboPlayIndex++;

				if (DBO_comboPlayIndex >= DBO_comboArr.length) {
					addLine("Reached end of combo");


					DBO_comboPlayIndex = undefined;


					return;
				}
				else {
					setTimeout(function () {
						$("#duel .cin_txt").val(DBO_message);
					}, 50);

				}

				return;
			}
			if (DBO_silentCommands) {
				let fakeData = {};
				fakeData.fake = true;
				fakeData.username = username;
				fakeData.play = "Duel message";
				fakeData.message = DBO_message;

				// fake duelResponse returns true if a command was consumed.
				let result = await duelResponse(fakeData);

				console.log(result)
				if (result) {
					console.log("This is a command")
					// Return immediately, don't send the action over to DB.
					return;
				}
			}
		}

		else if (data.action == "Duel" && data.play == "Quit duel") {
			window.DBO_preErratas = false;
			// Don't return, send the data to DB.
		}

		action = JSON.stringify(data, function (k, v) {
			if (v == null) {
				v = undefined;
			}
			return v;
		});
		resend();
	}

	window.DBO_isPlayCardPlay = function (play) {
		if (play == "Move" || play.indexOf("Reveal") >= 0 || play == "Declare" || play == "To GY" || play == "Normal Summon" || play.indexOf("SS ") >= 0 || play.indexOf("Set ") >= 0 || play.indexOf("Activate ") >= 0 || play.indexOf("Banish") >= 0 || play == "To hand" || play.indexOf("To ED") >= 0 || play.indexOf("To T Deck") >= 0 || play == "To B Deck" || play == "Overlay" || play.indexOf("OL ") >= 0 || play == "Attach" || play == "Remove Token" || play == "Summon token" || play == "Detach")
			return true;

		if (play == "Draw card" || play == "Shuffle deck" || play == "Mill" || play == "Banish random ED card" || play == "Banish random ED card FD")
			return true;

		return false;
	}
	window.DBO_playComboYes = function () {
		let comboStorage = localStorage.getItem(`DBO_combos_${$('#combo .combo_cb').val()}`);

		DBO_comboArr = comboStorage.split("\n");

		DBO_comboPlayIndex = 0;

		$("#duel .cin_txt").val("/next");

	}


	window.DBO_comboPlayStrToArray = function (comboPlay) {

		comboPlay = comboPlay.replace("\n", "");

		comboPlay = comboPlay.split(DBO_constComboDelimiter);

		let DBO_arr = [];

		DBO_arr.play = comboPlay[0];
		DBO_arr.wasFaceup = comboPlay[1];
		DBO_arr.startZone = comboPlay[2];
		DBO_arr.endZone = comboPlay[3]
		DBO_arr.cardName = comboPlay[4];
		DBO_arr.endCardName = comboPlay[5];

		if (!DBO_arr.play)
			DBO_arr.play = "";

		if (!DBO_arr.wasFaceup)
			DBO_arr.wasFaceup = 1;

		if (!DBO_arr.startZone)
			DBO_arr.startZone = "";

		if (!DBO_arr.endZone)
			DBO_arr.endZone = "";

		if (!DBO_arr.cardName)
			DBO_arr.cardName = "";

		if (!DBO_arr.endCardName)
			DBO_arr.endCardName = "";

		return DBO_arr;
	}

	window.DBO_comboPlayArrayToStr = function (comboArr) {
		if (!comboArr.play)
			comboArr.play = "";

		if (!comboArr.wasFaceup)
			comboArr.wasFaceup = 1;

		if (!comboArr.startZone)
			comboArr.startZone = "";

		if (!comboArr.endZone)
			comboArr.endZone = "";

		if (!comboArr.cardName)
			comboArr.cardName = "";

		if (!comboArr.endCardName)
			comboArr.endCardName = "";

		// play || wasFaceup || startZone || endZone || cardName || endCardName
		return `${comboArr.play}${DBO_constComboDelimiter}${comboArr.wasFaceup}${DBO_constComboDelimiter}${comboArr.startZone}${DBO_constComboDelimiter}${comboArr.endZone}${DBO_constComboDelimiter}${comboArr.cardName}${DBO_constComboDelimiter}${comboArr.endCardName}`;
	}
	window.showDeckMenu = function () {
		if (viewing) {
			//viewingE(viewing); // why should this be here?
			return;
		}
		if (!Duelist()) {
			return;
		}
		if (player1.main_arr.length == 0) {
			return;
		}
		if (automatic) {
			showDeckMenu2();
			return;
		}
		var menu = [];
		menu.push({ label: "Draw", data: "Draw card" });
		menu.push({ label: "Shuffle", data: "Shuffle deck" });
		menu.push({ label: "Mill", data: "Mill" });
		menu.push({ label: "Banish T.", data: "Banish" });
		menu.push({ label: "Banish FD", data: "Banish FD" });
		menu.push({ label: "View", data: "View deck" });
		if (!solo) {
			menu.push({ label: "Show", data: "Show deck" });
		}
		if (findCard(["Convulsion of Nature"]) || player1.deck_face_up) {
			menu.push({ label: "Flip Deck", data: "Flip deck" });
		}
		if (findCard(["Grave Lure"])) {
			menu.push({ label: "Turn Top Card FU", data: "Turn top card face-up" });
		}
		if (findCard(["Card of Fate"])) {
			menu.push({ label: "Card of Fate Effect", data: "Card of Fate effect" });
		}

		if (mobile) {
			return showMenu(player1.main_arr[0], menu);
		}

		showMenu(player1.main_arr[0], menu);

		if (duelist && player1.skill == "Aroma Strategy" || (duelist && player1.skill == "Prescience" && findCard(["Prescience"]) && (player2.lifepoints > player1.lifepoints * 2))) {
			previewFront(player1.main_arr[0].data("cardfront"));
		}
	}
	window.showExtraDeckMenu = function () {
		if (viewing != null && viewing != "") {
			//viewingE(viewing);
			return;
		}
		if (player1.extra_arr.length == 0) {
			return;
		}
		if (!Duelist()) {
			return;
		}
		var menu = [];
		menu.push({ label: "View", data: "View ED" });
		if (!solo && !automatic) {
			menu.push({ label: "Show", data: "Show ED" });
		}
		if (findCard(["Banquet of Millions"]) && countFaceDownExtraDeckCards(player1) >= 1) {
			menu.push({ label: "Banish random ED Card", data: "Banish random ED card" });
		}

		if (mobile) {
			return showMenu(player1.extra_arr[0], menu);;
		}

		showMenu(player1.extra_arr[0], menu);
	}

	window.DBO_cardMenuE = function () {
		var card = $(this).parent();

		let boundFunc = DBO_cardMenuE2.bind(this);

		return boundFunc(card);
	}

	window.DBO_cardMenuE2 = function (card, bMobileCheck) {
		if (!bMobileCheck) {
			if (summoning_play == "DBO Move") {
				menu_reason = "Bird Move";
				return;
			}
			else if (viewing == "Extra Deck" && $("#view").css("top") == "-20px") {
				menu_reason = "Bird Move Menu Too High";
				return;
			}
		}
		if (!DBO_unlockCardMechanics) {
			let boundFunc = cardMenuE.bind(this);
			boundFunc();
			return;
		}
		else if (!Duelist()) {
			menu_reason = "You are not a duelist";
			return;
		}

		if (typeof card.data("cardfront").data("effect") === "undefined") {
			menu_reason = "Card has no properties";
			return
		}
		if (automatic) {
			showEquips(card);
		}
		if (card.data("controller") != player1) {
			if (card.data("controller") == player3) {
				updateController(player1, card);
				updateOwner(player1, card);
			}
		}
		if (card == menu_card) {
			menu_reason = "card is menu_card";
			return;
		}
		if (!viewing) {
			if (!isPlayer1(card.data("controller").username)) {
				menu_reason = "You don't control this card";
				return;
			}
			if (isIn(card, player1.main_arr) >= 0) {
				menu_reason = "Card is in the Deck";
				return;
			}
			if (isIn(card, player1.extra_arr) >= 0) {
				menu_reason = "Card is in the Extra Deck";
				return;
			}
		}

		if (automatic) {
			cardMenuE2(card);
			return;
		}

		let originalCard = card;

		if (card.data("fake_card") && viewing == "DBO Xyz Materials") {
			if (typeof DBO_lastXyzCard === "undefined")
				return;

			let substitute = DBO_findSubstitute(card, DBO_lastXyzCard.data("xyz_arr"));

			if (substitute != null) {
				originalCard = card;
				card = substitute;
			}
			else {
				return;
			}
		}

		var menu = [];
		if (card.data("controller") != player1) {
			if (isIn(card, player1.opponent.grave_arr) >= 0 || isIn(card, player1.opponent.banished_arr) >= 0) {
				if (card.data("cardfront").data("card_type") == "Monster" && !card.data("face_down")) {
					if (hasAvailableMonsterZones(player1)) {
						menu.push({ label: "SS ATK", data: "SS ATK" });

						menu.push({ label: "SS DEF", data: "SS DEF" });
					}
				}

				if (isIn(card, player1.opponent.grave_arr) >= 0) {
					menu.push({ label: "Banish", data: "Banish" });

					// Dev here
					menu.push({ label: "Banish FD", data: "Banish FD" });
				}
				else if (!card.data("face_down")) {
					menu.push({ label: "To Grave", data: "To GY" });
					menu.push({ label: "Banish FD", data: "DBO Banish FD" });
				}
				menu.push({ label: "Target", data: "Target" });


				if (findCard(["Toadally Awesome"], true, true, true)) {
					if (card.data("cardfront").data("card_type") != "Monster") {
						if (hasAvailableSTZones(player1) && card.data("cardfront").data("type") != "Field") {
							menu.push({ label: "To S/T", data: "To ST" });
						}
						else if (player1.fieldSpell == null && card.data("cardfront").data("type") == "Field") {
							//menu.push({label:"Set",data:"Set Field Spell"});
							menu.push({ label: "Activate", data: "Activate Field Spell" });
						}
					}
				}

				if (hasXyzMonster(player1)) {
					menu.push({ label: "Attach", data: "Attach" });
				}
			}
			if ((viewing == "Opponent's Deck (partial)" || viewing == "Opponent's Deck (Top 3 Cards)" || viewing == "Opponent's Deck (Top 5 Cards)") && isIn(card, player1.opponent.main_arr) >= 0) {
				if (findCard(["Destiny HERO - Dominance", "Flower Cardian Peony with Butterfly", "Goddess Skuld's Oracle", "Millennium Necklace", "SPYRAL GEAR - Drone"])) {
					menu.push({ label: "To Top of Deck", data: "To T Deck 2" });
				}
				if (findCard(["Flower Cardian Peony with Butterfly"])) { // eh
					menu.push({ label: "To Bottom of Deck", data: "To B Deck 2" });
				}
				if (findCard(["Fairy Tail - Rochka"])) {
					menu.push({ label: "To Opponent's Hand", data: "To hand 2" });
				}
			}
		}
		else {

			// for attacking during opponent's battle phase.
			if (currentPhase == "BP" && (turn_player.username == username || isEitherTurnAttacker(card)) && !card.data("face_down") && isST(player1, card) && isPendulumAttacker(card)) {
				if (countMonsters(player2) > 0) {
					menu.push({ label: "Attack", data: "Attack" });
				}
				menu.push({ label: "Attack Directly", data: "Attack directly" });
			}
			else if (currentPhase == "BP" && (turn_player.username == username || isEitherTurnAttacker(card)) && !card.data("face_down") && isMonster(player1, card)) {
				if (card.data("inATK")) {
					if (countMonsters(player2) > 0) {
						menu.push({ label: "Attack", data: "Attack" });
					}
					menu.push({ label: "Attack Directly", data: "Attack directly" });
				}
				else {
					switch (card.data("cardfront").data("name")) {
						default:
							if (card.data("cardfront").data("effect").search(/This card can attack while in face-up Defense Position/i) == -1) {
								break;
							}
						case "Elemental HERO Rampart Blaster":
						case "Invoked Cocytus":
						case "Superheavy Samurai Beast Kyubi":
						case "Superheavy Samurai Big Benkei":
						case "Superheavy Samurai General Jade":
						case "Superheavy Samurai Ninja Sarutobi":
						case "Superheavy Samurai Ogre Shutendoji":
						case "Superheavy Samurai Stealth Ninja":
						case "Superheavy Samurai Steam Train King":
						case "Superheavy Samurai Swordmaster Musashi":
						case "Superheavy Samurai Wagon":
						case "Superheavy Samurai Warlord Susanowo":
						case "Total Defense Shogun":
							if (countMonsters(player2) > 0) {
								menu.push({ label: "Attack", data: "Attack" });
							}
							menu.push({ label: "Attack Directly", data: "Attack directly" });
					}
				}
			}

			if (isIn(card, player1.hand_arr) >= 0 || isIn(card, player1.grave_arr) >= 0) {
				if (card.data("cardfront").data("name") == "Thunder Dragon") {
					menu.push({ label: "Resolve Effect", data: "DBO Thunder Dragon" });
				}
			}
			if (isIn(card, player1.hand_arr) >= 0) {
				if (hasAvailableSTZones(player1) && card.data("cardfront").data("effect").search(/You can Set this card from your hand to your Spell/i) != -1) {
					menu.push({ label: "Set (To S/T)", data: "Set ST" });
				}
				if (card.data("cardfront").data("pendulum")) {
					if (links && (!player1.s1 || !player1.s5)) {
						menu.push({ label: "Activate", data: player1.s1 && !player1.s5 ? "Activate Pendulum Right" : (!player1.s1 && player1.s5 ? "Activate Pendulum Left" : "Activate Pendulum") });
					}
					else if (!links) {
						if (!player1.pendulumLeft) {
							menu.push({ label: "Activate Left", data: "Activate Pendulum Left" });
						}
						if (!player1.pendulumRight) {
							menu.push({ label: "Activate Right", data: "Activate Pendulum Right" });
						}
					}
				}
				if (card.data("cardfront").data("type") != "Field" && card.data("cardfront").data("card_type") != "Monster" && hasAvailableSTZones(player1)) {
					//if (card.data("cardfront").data("card_type") == "Spell" || (card.data("cardfront").data("name") == "Harpie's Feather Storm" && findCard(["Harpie Lady", "Harpie Queen", "Harpie Channeler", "Harpie Dancer"])) || card.data("cardfront").data("card_type") == "Trap" && card.data("cardfront").data("name").indexOf("Magical Musket") == 0 && findCard(["Magical Musket Mastermind Zakiel", "Magical Musketeer Calamity", "Magical Musketeer Caspar", "Magical Musketeer Doc", "Magical Musketeer Kidbrave", "Magical Musketeer Starfire", "Magical Musketeer Wild"])) {
					if (card.data("cardfront").data("card_type") == "Spell") {
						menu.push({ label: "Activate", data: "Activate ST" });
					}
					menu.push({ label: "Set", data: "Set ST" });
				}
				if (card.data("cardfront").data("type") == "Field" && !player1.fieldSpell) {
					menu.push({ label: "Activate", data: "Activate Field Spell" });
					menu.push({ label: "Set", data: "Set Field Spell" });
				}
				if (hasAvailableMonsterZones(player1)) {
					if (DBO_IsEaterOfMillions(card)) {
						if (countFaceDownExtraDeckCards(player1) >= 5) {
							menu.push({ label: "Banish first 5 ED", data: "Banish first 5 ED FD" });
						}
					}
					// Dev, we use else if to prevent normal summoning Eater of Millions.
					else if (card.data("cardfront").data("card_type") == "Monster") {
						menu.push({ label: "Normal Summon", data: "Normal Summon" });
						menu.push({ label: "Set", data: "Set monster" });
					}
					else if (findCard(["Magical Hats"])) {
						menu.push({ label: "Set to Monster Zone", data: "Set monster" });
					}

				}

				if (card.data("cardfront").data("name").search(/The Forbidden One/i) != -1) {
					let slots = [];
					for (let abc = 0; abc < 5; abc++) {
						slots[abc] = false;
					}

					for (let abc = 0; abc < player1.hand_arr.length; abc++) {
						if (player1.hand_arr[abc].data("cardfront").data("name") == "Exodia the Forbidden One")
							slots[0] = true;

						if (player1.hand_arr[abc].data("cardfront").data("name") == "Right Arm of the Forbidden One")
							slots[1] = true;

						if (player1.hand_arr[abc].data("cardfront").data("name") == "Left Arm of the Forbidden One")
							slots[2] = true;

						if (player1.hand_arr[abc].data("cardfront").data("name") == "Right Leg of the Forbidden One")
							slots[3] = true;

						if (player1.hand_arr[abc].data("cardfront").data("name") == "Left Leg of the Forbidden One")
							slots[4] = true;


					}

					if (slots.indexOf(false) == -1) {
						menu.push({ label: "Declare Victory", data: "DBO Declare Exodia" });
					}
				}
			}
			// Dev here, for Magical Hats.
			if (isIn(card, player1.banished_arr) >= 0 && hasAvailableMonsterZones(player1) && findCard(["Magical Hats"]) && card.data("cardfront").data("card_type") != "Monster") {
				menu.push({ label: "Set to Monster Zone", data: "Set monster" });
			}
			if (card.data("cardfront").data("monster_color") == "Xyz" && isIn(card, player1.extra_arr) >= 0 && countOverlayOptions(player1) >= 1) {
				menu.push({ label: "OL ATK", data: "OL ATK" });
				menu.push({ label: "OL DEF", data: "OL DEF" });
			}
			if ((hasAvailableMonsterZones(player1) || links && (!linkLeft || !linkRight) && isIn(card, player1.extra_arr) >= 0) && card.data("cardfront").data("card_type") == "Monster" && !card.hasClass("xyzmaterial") && !isMonster(player1, card) && !isST(player1, card)) {
				menu.push({ label: "S. Summon ATK", data: "SS ATK" });
				menu.push({ label: "S. Summon DEF", data: "SS DEF" });


				if (DBO_IsEaterOfMillions(card) && (isIn(card, player1.hand_arr) >= 0 || isIn(card, player1.extra_arr) >= 0)) {
					if (countFaceDownExtraDeckCards(player1) >= 5) {
						menu.push({ label: "Banish entire ED", data: "Banish entire ED FD" });
					}
				}
				else if (isIn(card, player1.hand_arr) >= 0 && card.data("cardfront").data("name") == "Mathmech Circular") {
					if (player1.main_arr.length >= 1) {
						menu.push({ label: "Mill Sigma", data: "DBO Mill Sigma" });
					}
				}
				// Because setting a main deck monster already exists
				if (isIn(card, player1.extra_arr) >= 0)
					menu.push({ label: "Set", data: "Set monster" });
			}
			else if (!card.data("face_down") && hasAvailableMonsterZones(player1) && !card.hasClass("xyzmaterial") && card.data("cardfront").data("effect").search(/Special Summon this card/i) != -1 && !isMonster(player1, card)) {
				menu.push({ label: "S. Summon ATK", data: "SS ATK" });
				menu.push({ label: "S. Summon DEF", data: "SS DEF" });
			}
			if (isIn(card, player1.grave_arr) >= 0) {
				if (card.data("cardfront").data("name") == "Invocation") {
					menu.push({ label: "Resolve GY Effect", data: "DBO Invocation GY" });
				}
			}
			if (card.data("cardfront").data("monster_color") == "Token") {
				menu.push({ label: "Remove", data: "Remove Token" });
				if (isMonster(player1, card)) {
					if (card.data("inDEF")) {
						menu.push({ label: "To ATK", data: "To ATK" });
					}
					else {
						menu.push({ label: "To DEF", data: "To DEF" });
					}
				}
				menu.push({ label: "Target", data: "Target" });
				menu.push({ label: "Move", data: "Move" });
			}
			else {
				if (isST(player1, card) && card.data("face_down")) {
					menu.push({ label: "Activate", data: "Activate ST" });
				}
				if (player1.fieldSpell && card[0] == player1.fieldSpell[0] && card.data("face_down")) {
					menu.push({ label: "Activate", data: "Activate Field Spell" });
				}
				if (isIn(card, player1.main_arr) >= 0) {
					//if (!player1.fieldSpell && card.data("cardfront").data("type") == "Field" && findCard(["Ancient Fairy Dragon", "Demise of the Land", "Dream Mirror Hypnagogia", "Galatea, the Orcust Automaton", "Ghostrick Renovation", "Last Resort", "Metaverse", "Pop-Up", "Triamid Dancer", "Triamid Hunter", "Triamid Master"])) {
					if (!player1.fieldSpell && card.data("cardfront").data("type") == "Field") {
						//menu.push({label:"Activate ",data:"Activate Field Spell"});
						menu.push({ label: "Activate", data: "Activate Field Spell" });
					}
				}
				if (isIn(card, player1.grave_arr) < 0 && !card.hasClass("xyzmaterial")) {
					menu.push({ label: "To Graveyard", data: "To GY" });
				}
				if (isIn(card, player1.hand_arr) < 0 && (!isExtraDeckCard(card) && isIn(card, player1.extra_arr) < 0)) {
					menu.push({ label: "To Hand", data: "To hand" });
				}
				if (!card.data("face_down")) {
					//if (isMonster(player1, card) || isST(player1, card) || player1.fieldSpell && card[0] == player1.fieldSpell[0] || player1.pendulumLeft && card[0] == player1.pendulumLeft[0] || player1.pendulumRight && card[0] == player1.pendulumRight[0]) {
					if (isMonster(player1, card) || isST(player1, card) || player1.fieldSpell && card[0] == player1.fieldSpell[0] || player1.pendulumLeft && card[0] == player1.pendulumLeft[0] || player1.pendulumRight && card[0] == player1.pendulumRight[0] || isIn(card, player1.grave_arr) >= 0 || isIn(card, player1.banished_arr) >= 0) {
						menu.push({ label: "Declare", data: "Declare" });
					}
				}
				if (!links && card.data("cardfront").data("pendulum") && isIn(card, player1.hand_arr) < 0) {
					if (!player1.pendulumLeft) {
						menu.push({ label: "Activate Left", data: "Activate Pendulum Left" });
					}
					if (!player1.pendulumRight) {
						menu.push({ label: "Activate Right", data: "Activate Pendulum Right" });
					}
				}
				if (isMonster(player1, card)) {
					if (card.data("inDEF")) {
						if (card.data("face_down")) {
							menu.push({ label: "Flip Summon", data: "Flip Summon" });
							menu.push({ label: "Flip", data: "Flip" });
						}
						else {
							menu.push({ label: "To ATK", data: "To ATK" });
						}
					}
					else {
						menu.push({ label: "To DEF", data: "To DEF" });
					}

					if (!card.data("face_down")) {
						menu.push({ label: "Set", data: "Set monster" });
					}
				}
				if (isST(player1, card) && !card.data("face_down")) {
					menu.push({ label: "Set", data: "Set ST" });
				}
				if (player1.fieldSpell && card[0] == player1.fieldSpell[0] && !card.data("face_down")) {
					menu.push({ label: "Set", data: "Set Field Spell" });
				}
				// Dev commented these 3 lines out:

				//if (isIn(card, player1.hand_arr) < 0 && isIn(card, player1.main_arr) < 0 && !isExtraDeckCard(card) && card.data("cardfront").data("monster_color") != "Token" && !card.hasClass("xyzmaterial")) {
				//menu.push({label:"To Hand",data:"To hand"});

				//}

				//if (card.hasClass("xyzmaterial")) {
				//	menu.push({label:"Detach",data:"Detach"});
				//}
				if (isIn(card, player1.banished_arr) < 0) {
					menu.push({ label: "Banish", data: "Banish" });
					if (findCard([
						"Black Luster Soldier - Envoy of the Evening Twilight",
						"Blue Duston",
						"Chaos Scepter Blast",
						"Eater of Millions",
						"Elemental HERO Nebula Neos",
						"Evening Twilight Knight",
						"Evenly Matched",
						"Banquet of Millions",
						"Gizmek Orochi, the Serpentron Sky Slasher",
						"Lightforce Sword",
						"Necro Fusion",
						"Network Trap Hole",
						"Number 89: Diablosis the Mind Hacker",
						"PSY-Frame Overload",
						"Small World",
						"Super Koi Koi",
						"Transmission Gear",
						"Treasure Panda",
						"Wind-Up Zenmaintenance",
						"Xyz Override"
						//], true) || isIn(card, player1.main_arr) >= 0 || card.data("face_down")) {
					], true) || isIn(card, player1.main_arr) >= 0 || isIn(card, player1.extra_arr) >= 0 || card.data("face_down")) {
						menu.push({ label: "Banish FD", data: "Banish FD" });
					}
				}
				if (isIn(card, player1.main_arr) < 0 && (!isExtraDeckCard(card) && isIn(card, player1.extra_arr) < 0)) {
					menu.push({ label: "To Top of Deck", data: "To T Deck" });

					if (isIn(card, player1.grave_arr) < 0 && isIn(card, player1.banished_arr) < 0 && card.data("cardfront").data("effect") && card.data("cardfront").data("effect").search(/Shuffle this card face-up into your Deck/i) >= 0) {
						menu.push({ label: "To Main Deck FU", data: "To T Deck FU" });
					}
				}
				if (player1.opponent == null) {
					player1.opponent = player2; // quick fix
				}
				if (isMonster(player1, card) && hasAvailableMonsterZones(player1.opponent)) {
					//menu.push({label:"Change Control",data:"Change control"});
				}
				if (isExtraDeckCard(card) && isIn(card, player1.extra_arr) < 0) {
					menu.push({ label: "To Extra Deck", data: "To ED" });
				}
				//if (card.data("cardfront").data("pendulum") && isIn(card, player1.extra_arr) < 0 && (isMonster(player1, card) || isST(player1, card) || card == player1.pendulumRight || card == player1.pendulumLeft)) {

				// Dev here, prevented extra deck from going to extra deck

				if (isIn(card, player1.extra_arr) < 0) {
					if (card.data("cardfront").data("pendulum") && isIn(card, player1.main_arr) < 0 && isIn(card, player1.hand_arr) < 0 && isIn(card, player1.extra_arr) < 0) { // i think you should be able to return it from the gy to the extra deck // 1-15-23 added extra_arr to list
						menu.push({ label: "To Extra Deck FU", data: "To ED FU" });
					}
					// Dev here, DB broke pendulum sneaking.
					//else if(isPendulumSneaker(card))
					//{
					//menu.push({label:"To Extra Deck FU",data:"DBO To ED FU"});
					//}
				}
				if (!isExtraDeckCard(card) && isIn(card, player1.main_arr) < 0 && !card.hasClass("xyzmaterial")) {


					//if (findEffect("bottom", true, true, true) && isIn(card, player1.extra_arr) < 0 || findCard(["Small World"])) {
					//if (findEffect("bottom", true, true, true) && isIn(card, player1.extra_arr) < 0) {


					if (allowToBottom || findEffect("bottom") || DBO_findCardReal(["Tearlament"], true, true, true) && isIn(card, player1.extra_arr) < 0) {
						menu.push({ label: "To Bottom of Deck", data: "To B Deck" });
					}
				}

				// Dev here, nobody will ever use this...
				//if (isIn(card, player1.main_arr) >= 0 && findCard(["Upside Down"])) {
				//menu.push({label:"To Bottom of Deck",data:"Upside Down effect 2"});
				//}






				//if (isMonster(player1, card) || isST(player1, card) || (player1.fieldSpell && card[0] == player1.fieldSpell[0]) || (player1.pendulumRight && card[0] == player1.pendulumRight[0]) || (player1.pendulumLeft && card[0] == player1.pendulumLeft[0])) {
				if (isIn(card, player1.hand_arr) < 0 && isIn(card, player1.main_arr) < 0 && isIn(card, player1.extra_arr) < 0) {
					menu.push({ label: "Target", data: "Target" });
				}



				if (isMonster(player1, card) || isST(player1, card) || (player1.fieldSpell && card[0] == player1.fieldSpell[0]) && !card.data("face_down")) {
					menu.push({ label: "Move", data: "Move" });
				}
				if (isMonster(player1, card) && countOverlayOptions(player1) > 1 && !card.data("face_down")) {
					menu.push({ label: "Overlay", data: "Overlay" });
				}
				if ((isIn(card, player1.hand_arr) >= 0 && card.data("cardfront").data("card_type") != "Spell") || isIn(card, player1.main_arr) >= 0 || isIn(card, player1.grave_arr) >= 0 || isIn(card, player1.banished_arr) >= 0) {
					//if (card.data("cardfront").type != "Field" && hasAvailableSTZones(player1)) {
					if (hasAvailableSTZones(player1)) {
						menu.push({ label: "To S/T", data: "To ST" });
					}
				}
				if (isIn(card, player1.hand_arr) >= 0) {
					menu.push({ label: "Declare", data: "Declare" }); // we'll need to enforce a minimum of v446
				}
				if (isIn(card, player1.hand_arr) >= 0 || isIn(card, player1.extra_arr) >= 0 || isIn(card, player1.main_arr) >= 0 && findCard(["Small World"])) {
					menu.push({ label: "Reveal", data: "Reveal" });
					if (card.data("face_up")) {
						menu.push({ label: "Stop Revealing", data: "Stop revealing" });
					}
					else if (card.data("cardfront").data("effect").includes("becomes revealed") || card.data("cardfront").data("effect").includes("remain revealed") || findCard(["Contract with Don Thousand"])) {
						menu.push({ label: "Stay Revealed", data: "Stay revealed" });
					}
				}
				// Dev here, for flipping banished cards
				if (isIn(card, player1.banished_arr) >= 0) {
					if (card.data("face_down")) {
						menu.push({ label: "Banish", data: "DBO Banish" });
					}
					else {
						menu.push({ label: "Banish FD", data: "DBO Banish FD" });
					}
				}
				if (isMonster(player1, card)) {
					if (card.data("cardfront").data("effect").startsWith("FLIP:") && DBO_findCardReal(["Nobleman of Crossout"])) {
						menu.push({ label: "Crossout Card", data: "DBO Crossout Card" });
					}
				}
				if (!card.data("face_down")) {
					if (isMonster(player1, card)) {

						let DBO_excavated = DBO_IsExcavator(card);

						if (DBO_excavated > 0) {
							menu.push({ label: "Excavate Top " + DBO_excavated, data: "DBO Excavate Top" });
						}

						DBO_excavated = DBO_IsFacedownExcavator(card);


						if (DBO_excavated > 0) {
							menu.push({ label: "Look at Top " + DBO_excavated, data: "DBO Facedown Excavate Top" });
						}

						if (DBO_IsCardAbleToPayHalfLP(card)) {
							menu.push({ label: "Pay Half LP", data: "DBO Pay Half LP" });
						}
						switch (card.data("cardfront").data("name")) {
							// Dev here.
							case "Magical Merchant":
								menu.push({ label: "Resolve Effect", data: "DBO Magical Merchant" });

								break;
							// End of Dev here
							case "SPYRAL GEAR - Drone":
								if (player1.opponent.main_arr.length >= 3) {
									menu.push({ label: "Look at cards", data: "Spyral event" });
								}
								break;
							case "Fairy Tail - Rochka":
								if (player1.main_arr.length >= 3) {
									menu.push({ label: "Resolve Effect", data: "Show top 3 cards" });
								}
								break;
							case "Destiny HERO - Dominance":
								if (player1.opponent.main_arr.length >= 5) {
									menu.push({ label: "Look at opponent cards", data: "Dominance event" });
								}
								break;
							case "Zolga the Prophet":
								if (player1.opponent.main_arr.length >= 1) {
									menu.push({ label: "Look at opponent cards", data: "Zolga event" });
								}
								break;
							case "Flower Cardian Peony with Butterfly":
								if (player1.opponent.main_arr.length >= 3) {
									menu.push({ label: "Look at cards", data: "Peony event" });
								}
								break;
							case "Aegaion the Sea Castrum":
								if (player1.opponent.extra_arr.length > 0) {
									menu.push({ label: "Resolve Effect", data: "Random extra event" });
								}
								break;
							case "Number 78: Number Archive":
								if (player1.extra_arr.length > 0) {
									menu.push({ label: "Resolve Effect", data: "Banish random ED card" });
								}
								break;
							case "Kozmo Tincan": // this card requires the remaining cards to go to the GY
							case "Noble Knight Borz": // this card requires the remaining cards to go to the GY
								if (player1.main_arr.length >= 3) {
									menu.push({ label: "Resolve Effect", data: "Tincan effect" });
								}
								break;
							case "Hi-Speedroid Rubber Band Shooter": // this card requires the remaining cards to go to the GY
								if (player1.main_arr.length >= 2) {
									menu.push({ label: "Resolve Effect", data: "Rubber Band effect" });
								}
								break;
							case "Rescue-ACE Turbulence":
								if (player1.main_arr.length >= 1) {
									menu.push({ label: "Resolve Effect", data: "Turbulence effect" });
								}
								break;
							case "Crowley, the First Propheseer":
							case "Power Tool Dragon":
							case "Machina Metalcruncher":
								if (player1.main_arr.length >= 3) {
									menu.push({ label: "Resolve Effect", data: "Crescent effect" });
								}
								break;
							case "Salamangreat Foxy":
								if (player1.main_arr.length >= 3) {
									menu.push({ label: "Banish 3 Cards", data: "Banish top 3 cards" });
								}
								break;
							case "Time Thief Redoer":
								if (player1.opponent.main_arr.length >= 1) {
									menu.push({ label: "Resolve Effect", data: "Redoer event" });
								}
								break;
							case "Necroface":
								if (player1.opponent.banished_arr.length >= 1 || player2.opponent.banished_arr.length >= 1) {
									menu.push({ label: "Resolve Effect", data: "Necroface event" });
								}
								break;
							case "Fiber Jar":
								menu.push({ label: "Resolve Effect", data: "Fiber effect" });
								break;
						}
						if (card.data("cardfront").data("id") == 10190) {
							if (player1.extra_arr.length >= 1) {
								menu.push({ label: "Banish Random Card", data: "Banish random ED card 2" });
							}
						}
					}
					if (isST(player1, card)) {
						let DBO_excavated = DBO_IsExcavator(card);

						if (DBO_excavated > 0) {
							menu.push({ label: "Excavate Top " + DBO_excavated, data: "DBO Excavate Top" });
						}

						DBO_excavated = DBO_IsFacedownExcavator(card);


						if (DBO_excavated > 0) {
							menu.push({ label: "Look at Top " + DBO_excavated, data: "DBO Facedown Excavate Top" });
						}

						if (card.data("cardfront").data("name") == "Pot of Desires" && player1.main_arr.length >= 12) {
							menu.push({ label: "Banish 10 Cards FD", data: "Banish top 10 cards FD" });
						}
						if (card.data("cardfront").data("name") == "Pot of Extravagance" && countFaceDownExtraDeckCards(player1) >= 3) {
							menu.push({ label: "Banish 3 ED Cards FD", data: "Banish 3 random ED cards FD" });
						}
						if (card.data("cardfront").data("name") == "Pot of Extravagance" && countFaceDownExtraDeckCards(player1) >= 6) {
							menu.push({ label: "Banish 6 ED Cards FD", data: "Banish 6 random ED cards FD" });
						}
						// Dev here
						if (card.data("cardfront").data("name") == "Pot of Prosperity") {
							if (countFaceDownExtraDeckCards(player1) >= 3)
								menu.push({ label: "Banish first 3 ED", data: "Banish first 3 ED FD Prosperity" });

							if (countFaceDownExtraDeckCards(player1) >= 6)
								menu.push({ label: "Banish first 6 ED", data: "Banish first 6 ED FD Prosperity" });
						}
						if (card.data("cardfront").data("name") == "Monster Gate" || card.data("cardfront").data("name") == "Reasoning") {
							menu.push({ label: "Resolve Effect", data: "DBO Reasoning Gate" });
						}
						if (card.data("cardfront").data("name") == "Toon Table of Contents") {
							menu.push({ label: "Resolve Effect", data: "DBO Toon Table" });
						}
						if (card.data("cardfront").data("name") == "Jack-In-The-Hand") {
							menu.push({ label: "Resolve Effect", data: "DBO Jack-In-The-Hand" });
						}

						//if (card.data("cardfront").data("name") == "Pot of Duality" && player1.main_arr.length >= 3) {
						//menu.push({label:"Banish 3 Cards",data:"Banish top 3 cards"});
						//}
						if (card.data("cardfront").data("name") == "That Grass Looks Greener" && player1.main_arr.length > player1.opponent.main_arr.length) {
							menu.push({ label: "Mill " + String(player1.main_arr.length - player1.opponent.main_arr.length), data: "Mill difference" });
						}
						if (card.data("cardfront").data("name") == "Pharaoh's Treasure") {
							menu.push({ label: "To Top of Deck face-up", data: "To T Deck FU" });
						}
						if (card.data("cardfront").data("id") == 11111 && player1.main_arr.length >= 3) {
							//menu.push({label:"Resolve Effect",data:"Crescent effect"});
						}
						if (card.data("cardfront").data("name") == "Spellbook Library of the Crescent" && player1.main_arr.length >= 3) {
							menu.push({ label: "Resolve Effect", data: "Crescent effect" });
						}
						if (card.data("cardfront").data("name") == "Bingo Machine, Go!!!" && player1.main_arr.length >= 3) {
							menu.push({ label: "Resolve Effect", data: "Crescent effect" });
						}
						if (card.data("cardfront").data("name") == "My Friend Purrely" && player1.main_arr.length >= 3) {
							menu.push({ label: "Resolve Effect", data: "Crescent effect" });
						}
						if (card.data("cardfront").data("name") == "Exchange") {
							//menu.push({label:"Resolve Effect",data:"Exchange event"});
						}
						if (card.data("cardfront").data("name") == "Goddess Skuld's Oracle" && player2.main_arr.length >= 3) {
							menu.push({ label: "Look at cards", data: "Oracle event" });
						}
						if (card.data("cardfront").data("name") == "You're in Danger!" && player1.main_arr.length >= 3) {
							menu.push({ label: "Resolve Effect", data: "Page-Flip effect" });
						}
						if (card.data("cardfront").data("name") == "Toon Page-Flip" && player1.main_arr.length >= 3) {
							menu.push({ label: "Resolve Effect", data: "Page-Flip effect" });
						}
						if (card.data("cardfront").data("name") == "Gold Pride - Start Your Engines!" && player1.main_arr.length >= 3) {
							menu.push({ label: "Resolve Effect", data: "Page-Flip effect" });
						}
						if (card.data("cardfront").data("name") == "Ancient Telescope" && player2.main_arr.length >= 1) {
							menu.push({ label: "Look at cards", data: "Telescope event" });
						}
						if (card.data("cardfront").data("name") == "Senri Eye") {
							menu.push({ label: "Look at cards", data: "Senri event" });
						}
						if (card.data("cardfront").data("name") == "Draw of Fate") {
							menu.push({ label: "Resolve Effect", data: "Fate effect" });
						}
						if (card.data("cardfront").data("name") == "Transmission Gear" && moderator >= 2) {
							//menu.push({label:"Resolve Effect",data:"Play RPS"});
						}
						if (card.data("cardfront").data("name") == "Fusion Guard") {
							menu.push({ label: "Resolve Effect", data: "Banish random Fusion card" });
						}
						if (card.data("cardfront").data("name") == "Upside Down" || card.data("id") == 13393) {
							menu.push({ label: "Resolve Effect", data: "Upside Down effect" });
						}
						if (card.data("cardfront").data("name") == "Magical Mallet" || card.data("cardfront").data("name") == "Reload") {
							menu.push({ label: "Replace Hand", data: "DBO Replace Hand" });
						}

						if (DBO_IsCardAbleToPayHalfLP(card)) {
							menu.push({ label: "Pay Half LP", data: "DBO Pay Half LP" });
						}
					}
					if (isIn(card, player1.grave_arr) >= 0 || isMonster(player1, card)) {
						if (card.data("cardfront").data("name") == "Lilith, Lady of Lament") {
							if (player1.main_arr.length >= 3 && hasAvailableSTZones(player1)) {
								menu.push({ label: "Resolve Effect", data: "Lilith effect" });
							}
						}
						if (card.data("cardfront").data("name") == "Super Quantal Fairy Alphan") {
							if (player1.main_arr.length >= 3 && hasAvailableSTZones(player1)) {
								menu.push({ label: "Resolve Effect", data: "Alphan effect" });
							}
						}
						if (card.data("cardfront").data("name") == "Gizmek Orochi, the Serpentron Sky Slasher") {
							if (player1.main_arr.length >= 8) {
								menu.push({ label: "Banish 8 Cards FD", data: "Banish top 8 cards FD" });
							}
						}
					}
					if (card.data("cardfront").data("name") == "Golden Castle of Stromberg" && player1.fieldSpell && card[0] == player1.fieldSpell[0] && player1.main_arr.length >= 10) {
						menu.push({ label: "Banish 10 Cards FD", data: "Banish top 10 cards FD" });
					}
					if (card.data("cardfront").data("name") == "Malefic World" && player1.fieldSpell && card[0] == player1.fieldSpell[0] && player1.main_arr.length >= 3) {
						menu.push({ label: "Resolve Effect", data: "Crescent effect" });
					}
					if (card.data("cardfront").data("name") == "Cynet Storm" && player1.fieldSpell && card[0] == player1.fieldSpell[0]) {
						menu.push({ label: "Resolve Effect", data: "Cynet Storm" });
					}
					if (card.data("cardfront").data("name") == "Numeron Network" && player1.fieldSpell && card[0] == player1.fieldSpell[0]) {
						menu.push({ label: "Summon 4 Gates", data: "DBO Numeron Network" });
					}
					if (card.data("cardfront").data("name") == "Runick Fountain" && player1.fieldSpell && card[0] == player1.fieldSpell[0]) {
						menu.push({ label: "Resolve Effect", data: "DBO Runick Fountain" });
					}
					if (card.data("cardfront").data("name") == "Prescience" && player1.opponent.main_arr.length > 0) {
						menu.push({ label: "Resolve Effect", data: "View top card 2" });
					}
				}
				if (card.data("cardfront").data("type") == "Field" && isIn(card, player1.main_arr) >= 0) {
					if (findCard(["Set Rotation"])) {
						if (player1.fieldSpell == null) {
							menu.push({ label: "Set", data: "Set Field Spell" });
						}
						if (player1.opponent.fieldSpell == null) {
							menu.push({ label: "Set to other side", data: "Set Field Spell 2" });
						}
					}
					if (findCard(["Dream Mirror Hypnagogia", "Valiants Vorld - Koenig Wissen", "Valiants Vorld - Shinrabansho"])) {
						if (player1.opponent.fieldSpell == null) {
							menu.push({ label: "Activate to other side", data: "Activate Field Spell 2" });
						}
					}
				}
				if (card.data("cardfront").data("name") == "Small World") {
					menu.push({ label: "Check Options", data: "Resolve Small World" });
				}

				if (DBO_IsCardAbleToShuffleToOpponentDeck(card)) {
					menu.push({ label: "To Opponent's Deck FU", data: "To T Deck 2 FU" });
				}
				else if (isIn(card, player1.main_arr) < 0 && isIn(card, player1.extra_arr) < 0 && isIn(card, player1.grave_arr) < 0) {
					menu.push({ label: "To Opponent's Hand", data: "To hand 2" });
				}

				let tokenCount = DBO_CountTokensCardCanSummon(card);

				// Negative token count = summon to opponent.
				// For now I'm not implementing it.
				if (tokenCount > 1) {
					menu.push({ label: `SS DEF ${tokenCount} Tokens`, data: `DBO SS Many Tokens` });
				}

				if (card.hasClass("xyzmaterial")) {
					menu = [];
					menu.push({ label: "Detach", data: "Detach" });
					menu.push({ label: "Banish", data: "Banish" });
					menu.push({ label: "Banish FD", data: "Banish FD" });
					menu.push({ label: "SS ATK", data: "SS ATK" });
					menu.push({ label: "SS DEF", data: "SS DEF" });
					menu.push({ label: "To Front", data: "DBO Xyz Material To Front" });
				}
				if ((viewing == "Deck (Picking 4 Cards)" || viewing == "Deck (Picking 3 Cards)" || viewing == "Deck (Picking 2 Cards)" || viewing == "Deck (Picking Card)") && (isIn(card, player1.main_arr) >= 0 || isIn(card, player1.opponent.main_arr) >= 0)) {
					menu = [];
					if (player1.temp_arr.indexOf(card.data("id")) < 0) {
						menu.push({ label: "Choose", data: "Choose card" });
					}
				}
				if (player1.skillCard && card[0] == player1.skillCard[0]) {
					menu = [];
					if (card.data("face_down")) {
						menu.push({ label: "Activate", data: "Activate Skill" });
					}
					else {
						menu.push({ label: "Set", data: "Set Skill" });
						if (card.data("cardfront").data("name") == "Millennium Necklace") {
							menu.push({ label: "Look at cards", data: "Necklace event" });
						}
						if (card.data("cardfront").data("name") == "Cyberdark Style") {
							menu.push({ label: "Resolve Effect", data: "Crescent effect" });
						}
					}
				}
				if (moderator >= 2 && isIn(card, player1.hand_arr) >= 0) {
					menu.push({ label: "Swap", data: "Swap" });
				}
			}

			if (hasXyzMonster(player1)) {
				if (isIn(card, player1.grave_arr) >= 0 || isIn(card, player1.banished_arr) >= 0) {
					menu.push({ label: "Attach", data: "Attach" });
				}
				else if ((isIn(card, player1.hand_arr) >= 0 || isIn(card, player1.main_arr) >= 0) && (card.data("cardfront").data("effect").search(/Attach this card/i) >= 0 || findEffect("attach 1 "))) {
					menu.push({ label: "Attach", data: "DBO Attach" });
				}
			}

			if (card.data("xyz_arr").length > 0) {
				menu.push({ label: "View Materials", data: "View materials" });
			}
		}

		if (mobile) {
			return showMenu(card, menu, originalCard);
		}

		showMenu(card, menu, originalCard);
	}


	window.joinDuelResponse = function (data) {
		var arr = $('#joinlist .cell');
		for (var i = 0; i < arr.length; i++) {
			if (arr.eq(i).data("username") == data.username) {
				console.log('returning');
				return;
			}
		}
		var cell = $(new Cell2(data.username + data.rating));
		if (data.rating.indexOf(" (Deck contains under 40 cards)") >= 0) {
			cell.find('span').html(escapeHTML(data.username) + data.rating.substring(0, data.rating.indexOf(" (Deck contains under 40 cards)")) + ' <font color="#FF0000">(Deck contains under 40 cards)</font>');
		}
		//else if (data.rating.indexOf(" (Bypassing card limits)") >= 0) {
		//	cell.find('span').html(escapeHTML(data.username) + data.rating.substring(0, data.rating.indexOf(" (Bypassing card limits)")) + ' <font color="#FF0000">(Bypassing card limits)</font>');
		//}
		else if (data.rating.indexOf(" (Unlimited)") >= 0) {
			cell.find('span').html(escapeHTML(data.username) + data.rating.substring(0, data.rating.indexOf(" (Unlimited)")) + ' <font color="#FF0000">(Unlimited)</font>');
		}
		else if (data.rating.indexOf(" (Expert)") >= 0) {
			cell.find('span').html(escapeHTML(data.username) + data.rating.substring(0, data.rating.indexOf(" (Expert)")) + ' <font color="#009900">(Expert)</font>');
		}
		cell.removeAttr("ondblclick");
		//cell.data("label", data.username + data.rating);
		cell.data("username", data.username);
		cell.click(function () {
			$('#hosting .accept_btn').disable(false);
			$('#hosting .reject_btn').disable(false);
		});
		$('#joinlist').append(cell);

		let DBO_players = $('#joinlist .cell').length;

		let DBO_title = (`(${DBO_players}) Duelingbook`)

		DBO_setTitle(DBO_title);

		if (DBO_players == 1)
			DBO_notifyOfPotentialDuel();

		window.DBO_cell = cell;

		if ($('#host .duel_note_txt').val().search(/instant accept/i) >= 0) {
			Send({ "action": "Accept user", "username": data.username });
			$('#joinlist').html("");
			showDim();
		}
	}

	window.setupHosting = function () {
		DBO_setTitle(`Duelingbook`);
		$('#host').hide();
		$('#hosting').show();
		$('#joining').hide();
		$('#joining_pool').hide();
		disablePools();
		decklist_cb.disable(true);
		$('#ar .format_cb').disable(true);
		$('#ar .rules_cb').disable(true);
		$('#ar .type_cb').disable(true);
		$('#ar .join_btn').disable(true);
		$('#hosting .accept_btn').disable(true);
		$('#hosting .reject_btn').disable(true);
		$('#joinlist').html("");
	}
	window.DBO_acceptUser = function () {
		var str = $('#joinlist .cell2.selected').data("username");
		if (!str) {
			return;
		}
		Send({ "action": "Accept user", "username": str });
		$('#joinlist').html("");
		showDim();
	}

	window.DBO_cancelDuel = function () {
		hosting = false;
		partner = null;
		setupHost();
		enablePools();
		removeJoinButton(username);
		DBO_setTitle(`Duelingbook`);
		Send({ "action": "Cancel duel" });
	}

	window.removeFromJoinlist = function (data) {
		$('#joinlist .cell').each(function () {
			if ($(this).data("username") == data.username) {
				$(this).remove();
				if ($('#joinlist .cell2.selected').length == 0) {
					$('#hosting .accept_btn').disable(true);
					$('#hosting .reject_btn').disable(true);
				}
				return false;
			}
		});

		let DBO_players = $('#joinlist .cell').length;

		let DBO_title = (`(${DBO_players}) Duelingbook`)

		DBO_setTitle(DBO_title);
	}

	window.DBO_setTitle = function (str) {
		// May be edited because DB uses some weird title system...
		document.title = str;
	}
	window.DBO_notifyOfPotentialDuel = async function () {
		playSound(ChatInbound);
		await DBO_delay(0.7);

		playSound(ChatOutbound);
		await DBO_delay(0.7);

		playSound(ChatInbound);
		await DBO_delay(0.7);

		playSound(ChatOutbound);
		await DBO_delay(0.7);
	}

	window.toDeck = function (player, data) {
		var rotY = 180 + ABOUT_ZERO;
		var revealing = true;
		var card = getFieldCard(player, data);
		if (card) {
			revealing = false;
			card = removeCard(player, data);
		}
		else {
			card = removeFromHand(player, data);
			if (card) {
				revealing = false;
			}
		}
		if (!card) {
			card = removeFromBanished(player, data, false);
		}
		if (!card) {
			card = removeCard(player, data);
		}
		if (!card) {
			card = removeFromDeck(player.opponent, data); // Opponent's Deck (partial)
		}
		if (card.data("face_down")) {
			revealing = false;
			card.data("face_down", false);
		}
		if (data.discreet) {
			revealing = false;
		}
		updateController(card.data("owner"), card);
		$('#field').append(card);
		if (data.play.indexOf("FU") >= 0) {
			card.data("face_up", true);
			rotY = ABOUT_ZERO;
		}
		if (data.play == "To B Deck") {
			if (revealing) {
				revealAndToBottomOfDeck(card.data("controller"), card, data);
				return;
			}
			else {
				card.data("owner").main_arr.push(card);

				if (!replay && player == player1) {
					DBO_AddCardToTrueDeck(card);
				}
				addDeckChildren(player);
			}
		}
		else if (data.play == "To B Deck 2") {
			player.opponent.main_arr.push(card);

			if (!replay && player.opponent == player1) {
				DBO_RemoveCardFromTrueDeck(card);
			}

			updateController(player.opponent, card);
		}
		else if (data.play.indexOf("To T Deck 2") == 0) {
			player.opponent.main_arr.unshift(card);

			if (!replay && player.opponent == player1) {
				DBO_AddCardToTrueDeck(card);
			}
			updateController(player.opponent, card);
			TweenMax.set(card, { "z": player.opponent.main_arr.length + 30 });
		}
		else {
			if (revealing) {
				revealAndToTopOfDeck(card.data("controller"), card, data);
				return;
			}
			else {
				card.data("owner").main_arr.unshift(card);

				if (!replay && player == player1) {
					DBO_AddCardToTrueDeck(card);
				}

				TweenMax.set(card, { "z": card.getDeckZ() });
			}
		}


		let cardsInteracted = [];

		let rotYOffset = -45;
		let rotZ = 0;
		let offsetX = 10;

		if (player == player1.opponent) {
			offsetX = -10;
			rotYOffset = 45;
		}

		let curSeconds = easeSeconds;

		if (data.play == "To B Deck") {
			var mX = 0;

			if (card.data("owner") != player1 || viewing.indexOf("Deck") == -1) {
				for (let abc = card.data("owner").main_arr.length - 1; abc > -1; abc--) {

					TweenMax.set(card.data("owner").main_arr[abc], { rotationZ: rotZ });
					TweenMax.to(card.data("owner").main_arr[abc], easeSeconds / 2, { rotationY: rotY + rotYOffset, rotleft: card.data("owner").deckX + offsetX + mX });

					cardsInteracted.push({ card: card.data("owner").main_arr[abc], mX: mX, rotY: rotY });

					mX += card.data("owner").mX;

				}

				curSeconds *= 2.5
			}
		}
		TweenMax.to(card, curSeconds, {
			left: card.data("controller").deckX, top: card.data("controller").deckY, scale: 0.1485, rotation: card.data("controller").rot, rotationY: rotY, ease: Linear.easeNone, onComplete: function () {

				for (let abc = 0; abc < cardsInteracted.length; abc++) {
					TweenMax.set(cardsInteracted[abc].card, { rotationZ: rotZ });
					TweenMax.set(cardsInteracted[abc].card, { rotationY: cardsInteracted[abc].rotY, rotationZ: rotZ, left: card.data("owner").deckX + cardsInteracted[abc].mX });
				}

				shiftDeck(card.data("controller"));

				if (viewing)
					updateViewing();

				endAction();
			}
		});
	}

	window.removeFromDeck = function (player, data) {
		for (var i = 0; i < player.main_arr.length; i++) {
			if (player.main_arr[i].data("id") == data.id) {
				console.log('found');
				var card = player.main_arr.splice(i, 1)[0];

				if (!replay && player == player1) {
					DBO_RemoveCardFromTrueDeck(card);
				}

				card.detach();
				card.data("face_up", false);
				$('#cid1_txt').text(Player1().main_arr.length);
				$('#cid2_txt').text(Player2().main_arr.length);
				updateViewing();
				return card;
			}
		}

		return null;
	}

	window.removeTopCardFromDeck = function (player) {
		var card = player.main_arr.splice(0, 1)[0];

		if (!replay && player == player1) {
			DBO_RemoveCardFromTrueDeck(card);
		}

		card.data("face_up", false);
		$('#cid1_txt').text(Player1().main_arr.length);
		$('#cid2_txt').text(Player2().main_arr.length);
		updateViewing();
		return card;
	}

	window.revealAndToTopOfDeck = function (player, card, data) {
		$('#duel .cards').append(card);
		TweenMax.set(card, { "z": card.getDeckZ() });
		card.data("cardfront").reinitialize(data.card);
		TweenMax.to(card, easeSeconds, {
			left: 512, top: 280, scale: 0.5, rotation: 0, rotationY: ABOUT_ZERO, onComplete: function () {
				previewCard(card);
				TweenMax.to(card, easeSeconds, {
					left: player.deckX, top: player.deckY, scale: 0.1485, rotation: player.rot, rotationY: 180 + ABOUT_ZERO, delay: 0.5, onStart: function () {
						player.main_arr.unshift(card);

						if (!replay && player == player1) {
							DBO_AddCardToTrueDeck(card);
						}
					}, onComplete: function () {
						shiftDeck(player);

						if (viewing)
							updateViewing();

						endAction();
					}
				});
			}
		});
		playSound(Reveal);
	}


	window.revealAndToBottomOfDeck = function (player, card, data) {
		let cardsInteracted = [];

		let rotYOffset = -45;
		let rotZ = 0;
		let offsetX = 10;

		if (card.data("owner") == player1.opponent) {
			offsetX = -10;
			rotYOffset = 45;
		}


		if (data.play == "To B Deck") {
			var mX = 0;

			if (card.data("owner") != player1 || viewing.indexOf("Deck") == -1) {
				for (let abc = card.data("owner").main_arr.length - 1; abc > -1; abc--) {
					// Dev here
					var rotY = 180 + ABOUT_ZERO;

					if (card.data("owner").main_arr[abc].data("face_up") || card.data("owner").deck_face_up) {
						if (card.data("owner").main_arr[abc].data("cardfront").data("initialized")) {
							rotY = ABOUT_ZERO;
						}
					}

					TweenMax.set(card.data("owner").main_arr[abc], { rotationZ: rotZ });
					TweenMax.to(card.data("owner").main_arr[abc], easeSeconds / 2, { rotationY: rotY + rotYOffset, rotationZ: rotZ, left: card.data("owner").deckX + offsetX + mX });

					cardsInteracted.push({ card: card.data("owner").main_arr[abc], mX: mX, rotY: rotY });

					mX += card.data("owner").mX;

				}
			}
		}

		$('#field').append(card);
		TweenMax.set(card, { "z": 0 });
		card.data("cardfront").reinitialize(data.card);
		TweenMax.to(card, easeSeconds, {
			left: 512, top: 280, scale: 0.5, rotation: 0, rotationY: ABOUT_ZERO, onComplete: function () {
				previewCard(card);
				TweenMax.to(card, easeSeconds, {
					left: player.deckX, top: player.deckY, scale: 0.1485, rotation: player.rot, rotationY: 180 + ABOUT_ZERO, delay: 0.5, onStart: function () {
						player.main_arr.push(card);

						if (!replay && player == player1) {
							DBO_AddCardToTrueDeck(card);
						}

						addDeckChildren(player);
					}, onComplete: function () {
						for (let abc = 0; abc < cardsInteracted.length; abc++) {
							TweenMax.set(cardsInteracted[abc].card, { rotationZ: rotZ });
							TweenMax.set(cardsInteracted[abc].card, { rotationY: cardsInteracted[abc].rotY, rotationZ: rotZ, left: card.data("owner").deckX + cardsInteracted[abc].mX });
						}

						shiftDeck(player);

						if (viewing)
							updateViewing();

						endAction();
					}
				});
			}
		});
		playSound(Reveal);
	}

	window.declare = function (player, data) {
		var spark_mc = createSVGAnimation(spark, "spark", 110, 110, 24, spark.json);
		var card = getDuelCard(data.id);
		card.data("cardfront").reinitialize(data.card);
		var isViewingCard = card.parent()[0] == $('#view > .content')[0];
		var grave_index = null;
		var banished_index = null;
		if (isViewingCard) {
			$('#spark').css("z-index", 16); // #view has z-index of 15
		}
		else {
			if (card.data("controller").grave_arr.indexOf(card) >= 0) {
				grave_index = card.data("controller").grave_arr.indexOf(card);
				card.data("controller").grave_arr.splice(grave_index, 1);
				card.data("controller").grave_arr.unshift(card);
				shiftGrave(card.data("controller"));
			}
			if (card.data("controller").banished_arr.indexOf(card) >= 0) {
				banished_index = card.data("controller").banished_arr.indexOf(card);
				card.data("controller").banished_arr.splice(banished_index, 1);
				card.data("controller").banished_arr.unshift(card);
				shiftBanished(card.data("controller"));
			}
		}

		if (card.data("cardfront").data("name").includes("Tearlament")) {
			allowToBottom = true;
		}

		var delay = 0;
		var _spark = $('#' + spark_mc.mc.id);

		if (card.data("controller").hand_arr.includes(card) && !(duelist && isPlayer1(player.username))) {
			$('#duel .cards').append(card);
			TweenMax.to(card, 0.5, { "rotationY": ABOUT_ZERO });
			delay = 0.4;
		}

		TweenMax.set(_spark, { "left": parseInt(card.css("left")), "top": parseInt(card.css("top")) });
		if (isViewingCard) {

			TweenMax.set(_spark, { "left": parseInt(card.css("left")) + 219 + 5, "top": parseInt(card.css("top")) + 58 + 32 - $('#view > .content').scrollTop() });
		}


		setTimeout(function () {
			TweenMax.to(_spark, 0.95, {
				onComplete: function () {
					spark_mc.stop();
					_spark.remove();
				}
			});
			spark_mc.play();
			playSound(Declare);
			delay = 0.2;
			if (card.data("controller").hand_arr.includes(card)) {
				delay = 0.4;
				previewCard(card);
				var rotY = 180 + ABOUT_ZERO;
				if ((show_cards && player == Player1()) || (show_cards == 2)) {
					rotY = ABOUT_ZERO;
				}
				TweenMax.to(card, 0.5, { "rotationY": rotY, "delay": 0.6 });
			}
			if (grave_index || banished_index) {
				delay = 0.6; // gives you time to see the card before it re-indexes itself
			}
			setTimeout(function () {

				if (grave_index != null) {
					card.data("controller").grave_arr.splice(0, 1);
					card.data("controller").grave_arr.splice(grave_index, 0, card);
					shiftGrave(card.data("controller"));
				}
				if (banished_index != null) {
					card.data("controller").banished_arr.splice(0, 1);
					card.data("controller").banished_arr.splice(banished_index, 0, card);
					shiftBanished(card.data("controller"));
				}

				//$('#spark').insertAfter($('#duel .cards'));
				$('#spark').css("z-index", 0); // #view has z-index of 15

				//if (!automatic) {
				//	endAction();
				//}

				setTimeout(function () {
					endAction();
				}, automatic ? 300 : 0);

			}, 300 + (delay * 1.5 * 1000));
		}, delay * 1000);
		if (data.name) {
			if (card && data.username != player1.username && card.data("controller").hand_arr.includes(card) && cardLogging) {
				DBO_addCardHoverLine(data.username + ' declared effect of <font color="0000FF">' + quote(data.card.name) + "</font>", card)
			}
			else {
				addLine(data.username + " declared effect of " + quote(data.name));
			}
		}
		else if (data.log) {
			var str = data.username + " " + data.log.public_log.replace("Declared", "declared");
			if (str.indexOf(" in ") >= 0) {
				str = str.substring(0, str.indexOf(" in "));
			}
			addLine(str);
		}
	}

	window.reveal = function (player, data) {
		var card = revealFromHand(player, data);
		if (!card) {
			card = revealFromExtra(player, data);
		}
		if (!card) {
			card = revealFromDeck(player, data);
		}

		if (card && data.username != player1.username && cardLogging) {
			DBO_addCardHoverLine(data.username + ' revealed <font color="0000FF">' + quote(data.card.name) + "</font>", card)
		}
	}

	window.toHand = function (player, data) {
		console.log(data);
		var card = removeFromDeck(player, data);

		// Don't care about non-deck, if card was removed from deck, it's in the deck.

		if (card && data.username != player1.username && cardLogging) {
			DBO_addCardHoverLine(data.username + ' added <font color="0000FF">' + quote(data.card.name) + "</font> from deck", card)
		}

		if (!card) {
			card = removeFromGY(player, data);
		}
		if (!card) {
			card = removeFromExtra(player, data);
		}
		if (!card) {
			card = removeFromHand(player, data); // Graceful Tear
			if (data.play == "To hand 2") {
				if (!card) {
					card = removeCard(player, data);
				}
				revealAndToHand(player, card, data);
				DBO_CheckIllegalThrust(card, data);
				return;
			}
		}
		if (card) {
			revealAndToHand(player, card, data);
			DBO_CheckIllegalThrust(card, data);
			return;
		}
		toHandFromBanished(player, data);
		toHandFromField(player, data);
	}

	window.Connect = function () {
		console.log('Connecting...');
		connection_success = false;
		connectTimer.start();
		try {
			websocket = new WebSocket(HOSTNAME);
			websocket.onopen = connectHandler;
			websocket.onmessage = DBO_handleData;
			websocket.onclose = socketClosedE;
			websocket.onerror = socketErrorE;

			//websocket.onclose = reconnectE;
			//websocket.onerror = reconnectE;

			//websocket.onclose = closedE;
			//websocket.onerror = closedE;
		}
		catch (e) {
			console.log(e);
			console.log('Failed to connect'); // happens when the server takes to long to finish the connecting process
		}
	}
	// This is when Dueling Book's server gives us data.
	window.DBO_handleData = function (e) {
		// For late loading the extension...
		DBO_handleData2(e);
	}

	window.DBO_handleData2 = function (e) {
		try {
			var data = JSON.parse(e.data);
		}
		catch (e) {
			errorE("Malformed server response");
			return;
		}

		if (window.DBO_debug && typeof data === "Object") {
			if (typeof window.DBO_debug == "string") {
				if (data.username == window.DBO_debug || data.username == player1.username)
					console.log(data);
			}
			else
				console.log(data);
		}

		if (typeof DBO_handleData3 !== "undefined") {
			DBO_handleData3(e);
		}

		if (data.action == "Load duels") {
			if (typeof DBO_waitingForSendAction !== "undefined")
				window.DBO_waitingForSendAction = 0;

			console.log("Load Duels Dev");

			// You are not 0, you cannot skip yourself
			for (let abc = 0; abc < online_users_data.length; abc++) {
				let user = structuredClone(online_users_data[abc]);
				let lastUser = structuredClone(online_users_data[abc - 1]);

				if (typeof user.admin === "undefined")
					user.admin = false;

				else
					user.admin = true;

				if (abc > 0) {
					if (typeof lastUser.admin === "undefined")
						lastUser.admin = false;

					else
						lastUser.admin = true;
				}

				// Check sortOnlineUsers() why this works
				if (!user.admin)
					continue;


				console.log(`Load profile of ${user.username}`);

				window.DBO_waitingForSendAction++;

				Send({ "action": "Load profile", "username": online_users_data[abc].username });
			}
		}
		if (data.action == "Load profile") {

			if (window.DBO_waitingForSendAction > 0) {
				window.DBO_waitingForSendAction--;

				if (data.duel <= 0)
					return;


				let DBO_JudgeText = "JUDGE";

				let DBO_formats = ["ar", "gr", "er"]

				for (let abc = 0; abc < DBO_formats.length; abc++) {
					let sp = getFormat(DBO_formats[abc])

					for (var i = 0; i < sp.find('.duelbutton').length; i++) {
						if (sp.find('.duelbutton').eq(i).find(".tcg_title").text() == DBO_JudgeText) {
							sp.find('.duelbutton').eq(i).find(".tcg_title").text("N/A")
						}
					}

					for (var i = 0; i < sp.find('.duelbutton').length; i++) {
						if (data.duel == sp.find('.duelbutton').eq(i).data("id")) {
							sp.find('.duelbutton').eq(i).find(".tcg_title").text("JUDGE")

							if (DBO_formats[abc] == "gr")
								sp.find('.duelbutton').eq(i).find(".note_txt").text("JUDGE (Goat)")

							else if (DBO_formats[abc] == "er")
								sp.find('.duelbutton').eq(i).find(".note_txt").text("JUDGE (Edison)")

							prependButtonToTop(sp.find('.duelbutton').eq(i), getFormat("ar"));
						}
					}
				}
				//DBO_createWatchButton(DBO_data);
				return;
			}
		}

		// Send the data to the original function, it is a garbage idea to edit the original function...
		handleData(e);
	}

	// Thanks Cody AI
	window.prependButtonToTop = function (newBtn, sp) {
		// Find the existing button if it's already there
		var existingBtn = sp.find('.duelbutton').filter(function () {
			return $(this).data('id') === newBtn.data('id');
		});

		// Use the existing button if found, otherwise use the new button
		var btnToUse = existingBtn.length ? existingBtn.detach() : newBtn;

		// Set the button's top position to 0
		btnToUse.css("top", 0);

		// Shift all existing buttons down
		sp.find('.duelbutton').each(function () {
			var currentTop = parseInt($(this).css("top"));
			$(this).css("top", currentTop + 50);
		});

		// Insert the button at the beginning
		sp.prepend(btnToUse);

		// Update scrolling if necessary
		if (sp.find('.duelbutton').length * 50 > 250) {
			sp.removeClass("unscrollable");
		}

		// Refresh text and apply filters
		if (btnToUse.hasClass("joinbutton")) {
			setText(btnToUse.find('.username_txt'));
		} else {
			setText(btnToUse.find('.title_txt'));
			setText(btnToUse.find('.title2_txt'));
		}
		setText(btnToUse.find('.note_txt'));
		if (!passesFilter(btnToUse)) {
			btnToUse.hide();
		}
	}

	// duelResponse is after DB saw our interaction. This is before that happens.
	window.cardMenuClicked = function (card, data, e) {
		console.log(data);
		if (data == "Cancel")
			return;

		if (summoning_card && (data != "DBO Move" || summoning_card.data("id") != card.data("id"))) {
			var rotY = DBO_getCardRotY(summoning_card);

			if (rotY != null && rotY != getRotationY(summoning_card[0])) {
				TweenMax.set(summoning_card, { rotationY: rotY, ease: Linear.easeNone });
			}
		}

		if (data == "DBO Move") {
			removeCardMenu();
			hideSelectZones(true);

			DBO_CheckPlayerZones(true);

			startChooseMonsterZones();

			if (links) {
				if (isExtraDeckCard(card) || ((card.data("cardfront").data("pendulum") && isIn(card, player1.hand_arr) < 0))) {
					$("#view").css("top", "-20px");

					startChooseExtraZones();
				}
			}

			startChooseSTZones();

			let fieldCards = [];

			for (let abc = 0; abc < DBO_Player1Field.length; abc++) {
				fieldCards.push(DBO_Player1Field[abc].card);
			}

			if (DBO_IsCardKaiju(card) || isIn(card, fieldCards) >= 0) {
				startChooseMonsterZones2();
			}

			startChooseFieldSpellZones();
			startChooseGYZone(card);
			startChooseBanishZone(card);
			startChooseDeckZone(card);
			startChooseHandZone(card);
			startChooseDeclareEffectZone(card);
			startChooseTargetZone(card);
			startChooseAtkPositionZone(card);
			startChooseDefPositionZone(card);
			startChooseBottomDeckZone(card);
			startChooseOverlayZone(card);
			startChooseExtraDeckZone(card);

			summoning_card = card;
			summoning_play = "DBO Move";

			// Stop don't go further!!!
			return;
		}
		if (viewing == "Secret Deck") {
			DBO_addColoredLine("FF0000", "Error: Cannot interact with cards in Secret Deck");
			return;
		}
		else if (card.data("fake_card") && viewing == "DBO Xyz Materials") {
			if (typeof DBO_lastXyzCard === "undefined")
				return;

			let substitute = DBO_findSubstitute(card, DBO_lastXyzCard.data("xyz_arr"));

			if (substitute != null) {
				cardMenuClicked(substitute, data, e);
			}

			return;
		}

		console.log('cardMenuClicked. data = ' + data);
		if (!$('#cig1_txt').is(":visible")) {
			return; // this prevents users from shuffling during simultaneousDraw
		}
		removeCardMenu();
		hideSelectZones();

		if (data == "DBO Pay Half LP") {
			DBO_exitViewing();


			let amountToGive = -1 * Math.ceil((player1.lifepoints / 2.0));
			Send({ "action": "Duel", "play": "Life points", "amount": amountToGive });
			return;
		}
		if (data == "DBO Crossout Card") {
			DBO_exitViewing();


			window.DBO_crossoutCard = card;

			getConfirmation("Crossout Card?", "This will banish all copies of this card from your Deck.", DBO_crossoutCardYes);
			return;
		}
		else if (data == "DBO SS Many Tokens") {
			DBO_exitViewing();

			let tokenCount = DBO_CountTokensCardCanSummon(card);

			if (tokenCount == 0)
				return;

			let toOpponent = false;

			if (tokenCount < 0) {
				toOpponent = true;

				tokenCount = -1 * tokenCount;
			}

			for (let abc = 0; abc < tokenCount; abc++) {
				Send({ "action": "Duel", "play": "Summon token", "card": newDuelCard() });
			}

			return;
		}
		else if (data == "DBO Replace Hand") {
			window.DBO_reloadCard = card;

			getConfirmation("Replace Hand?", "This will shuffle your hand to deck and draw that many cards.", DBO_ReplaceHandYes);
		}
		else if (data == "DBO Numeron Network") {
			getConfirmation("Summon 4 Gates?", "In attack position", DBO_NumeronNetworkYes);

			if (DBO_GenerateSecretExtraDeck() == null) {
				Send({ "action": "Duel", "play": "View ED" });

				let count = 50;

				let interval = setInterval(function () {
					count--;

					if (count == 0) {
						clearInterval(interval);
						return;
					}

					Send({ "action": "Duel", "play": "Stop viewing", "viewing": "Extra Deck" });
					DBO_exitViewing();
				}, 50);
			}

		}
		else if (data == "DBO Mill Sigma") {
			getConfirmation("Mill Sigma from Deck?", "The extension will view the deck and try to mill it.", DBO_MillSigmaYes);
		}
		else if (data == "DBO Invocation GY") {
			window.DBO_invocationCard = card;

			getConfirmation("Resolve GY Effect?", "", DBO_InvocationGYYes);
		}
		else if (data == "DBO Runick Fountain") {
			getConfirmation("Resolve effect?", "Bottom deck as many as possible, then draw same number of cards", DBO_RunickFountainYes);
		}
		else if (data == "Banish first 3 ED FD" || data == "Banish first 5 ED FD" || data == "Banish first 6 ED FD" || data == "Banish entire ED FD") {
			let banishMax;

			if (data.search("3") != -1)
				banishMax = 3;

			if (data.search("5") != -1)
				banishMax = 5;

			if (data.search("6") != -1)
				banishMax = 6;

			if (data.search("entire") != -1)
				banishMax = 9999;


			for (let abc = 0; abc < player1.all_cards_arr.length; abc++) {
				if (banishMax == 0)
					break;

				// Skip myself, this is because I made an eater of millions that banishes the rest of the ED.
				if (player1.all_cards_arr[abc].data("id") == card.data("id"))
					continue;

				if (isIn(player1.all_cards_arr[abc], player1.extra_arr) >= 0) {
					cardMenuClicked(player1.all_cards_arr[abc], "Banish FD");
					banishMax--;
				}
			}

			if (DBO_IsEaterOfMillions(card)) {
				cardMenuClicked(card, "SS ATK")
			}
			DBO_exitViewing();

			return;
		}

		else if (data == "Banish first 3 ED FD Prosperity" || data == "Banish first 6 ED FD Prosperity") {
			let banishLimit;
			let banishMax;

			if (data.search("3") != -1)
				banishMax = 3;

			if (data.search("6") != -1)
				banishMax = 6;

			banishLimit = banishMax;

			if (player1.extra_arr.length < banishMax)
				return;

			for (let abc = 0; abc < player1.all_cards_arr.length; abc++) {
				if (banishMax == 0)
					break;

				// Skip myself, this is because I made an eater of millions that banishes the rest of the ED.
				if (player1.all_cards_arr[abc].data("id") == card.data("id"))
					continue;

				if (isIn(player1.all_cards_arr[abc], player1.extra_arr) >= 0) {
					cardMenuClicked(player1.all_cards_arr[abc], "Banish FD");
					banishMax--;
				}
			}

			if (banishMax == 0) {
				window.DBO_excavateAmount = banishLimit;

				getConfirmation(`Excavate ${banishLimit} cards?`, "", DBO_excavateYes);
			}
			DBO_exitViewing();

			return;
		}

		else if (data == "DBO Banish") {
			cardMenuClicked(card, "To GY");
			cardMenuClicked(card, "Banish");
			DBO_exitViewing();

			return;
		}

		else if (data == "DBO Banish FD") {
			cardMenuClicked(card, "To GY");
			cardMenuClicked(card, "Banish FD");
			DBO_exitViewing();

			return;
		}

		else if (data == "DBO Excavate Top") {
			let DBO_excavated = DBO_IsExcavator(card);

			if (DBO_excavated <= player1.main_arr.length) {
				for (let abc = 0; abc < DBO_excavated; abc++) {
					let DBO_card = player1.main_arr[abc];
					cardMenuClicked(DBO_card, "Banish");
					window.DBO_excavatedArr.push(DBO_card);

				}
			}

			DBO_exitViewing();

			return;
		}

		else if (data == "DBO Facedown Excavate Top") {
			window.DBO_facedownExcavatorCard = card;

			getConfirmation(`Look at the top ${DBO_IsFacedownExcavator(card)} cards of your Deck?`, `You need either ${DBO_IsFacedownExcavator(card)} empty monster zones or ${DBO_IsFacedownExcavator(card)} empty backrow`, DBO_LookAtTopYes);

			DBO_exitViewing();

			return;
		}

		else if (data == "DBO Declare Exodia") {
			getConfirmation("Declare Victory?", "", DBO_DeclareVictoryYes);

			DBO_exitViewing();

			return;
		}

		else if (data == "DBO Xyz Material To Front") {
			window.DBO_XyzMaterial = card;

			getConfirmation("Bring Xyz Material to front?", "This will make a lot of actions at once.", DBO_XyzMaterialToFrontYes);

			DBO_exitViewing();

			return;
		}
		else if (data == "DBO To ED FU") {
			cardMenuClicked(card, "To T Deck");
			cardMenuClicked(card, "To ED FU");
		}
		else if (data == "DBO Banish ED Everything") {
			getConfirmation("Banish every card in your Extra Deck?", "To unbanish back, shuffle 1 card back and use the other option.", DBO_BanishEverythingEDYes);
		}
		else if (data == "DBO Unbanish ED Everything") {
			getConfirmation("Unbanish every face-up card to your Extra Deck?", "This includes cards banished in other ways...", DBO_UnbanishEverythingEDYes);
		}
		else if (data == "DBO Magical Merchant") {
			getConfirmation("Mill until you find a Spell / Trap?", "This will make a lot of actions at once.", DBO_MagicalMerchantYes);
		}
		else if (data == "DBO Reasoning Gate") {
			getConfirmation("Mill until you find a monster that can be Normal Summoned/Set?", "This will make a lot of actions at once.", DBO_ReasoningGateYes);
		}
		else if (data == "DBO Toon Table") {
			window.DBO_toonTableCard = card;

			getComboBox("Choose a card to add", "This will dump all copies first.", ["Toon World", "Toon Bookmark", "Toon Kingdom", "Let me choose"], 0, DBO_ToonTableYes);
		}
		else if (data == "DBO Thunder Dragon") {
			window.DBO_thunderDragonCard = card;

			if (isIn(card, player1.hand_arr) >= 0)
				getConfirmation("Discard your Thunder Dragon and add 2?", "", DBO_ThunderDragonYes);

			else
				getConfirmation("Add 2 Thunder Dragons?", "", DBO_ThunderDragonYes);
		}
		else if (data == "DBO Jack-In-The-Hand") {

			getComboBox("Small World", "Select a card in your Deck:", ["Alpha, Zeta, Gamma", "Robina, Eglen, Toccan", "Robina, Eglen, Stri"], 0, DBO_JackInTheHandYes);
		}
		else if (data == "DBO Attach") {
			olPlay = "DBO Attach";
			overlaying_card = card;
			if (countOverlayOptions(player1) == 0) {
				overlaying_card = null;
				return;
			}
			else if (countOverlayOptions(player1) == 1) {
				Send({ "action": "Duel", "play": "To GY", "card": overlaying_card.data("id") });
				Send({ "action": "Duel", "play": "Attach", "start_card": overlaying_card.data("id"), "end_card": getOnlyOverlayId(player1) });
				overlaying_card = null;
			}
			else {
				startOverlay(e);
				if (linkCardChosen(player1)) {
					DBO_exitViewing();
				}
			}
			return;
		}
		else if (data == "DBO View Materials") {
			DBO_lastXyzCard = card;

			viewingE("DBO Xyz Materials");
		}


		if (data == "Choose card") {
			player1.temp_arr.push(card.data("id"));
			if (player1.temp_arr.length == 4 && viewing == "Deck (Picking 4 Cards)" || player1.temp_arr.length == 3 && viewing == "Deck (Picking 3 Cards)" || player1.temp_arr.length == 2 && viewing == "Deck (Picking 2 Cards)" || player1.temp_arr.length == 1 && viewing == "Deck (Picking Card)") {
				Send({ "action": "Duel", "play": next_callback, "cards": player1.temp_arr });
				DBO_exitViewing();
			}
			return;
		}

		if (data.search("View") == -1) {
			window.DBO_lastCardAction = data;
		}

		if (data == "Remove Token" && card.data("cardfront").data("monster_color") != "Token")
			data = "To GY";

		if ((data == "To GY" || data == "Banish" || data == "Banish FD" || data == "To hand" || data.indexOf("To ED") >= 0 || data == "To T Deck" || data == "To B Deck" || data == "Overlay" || data.indexOf("OL ") >= 0 || data == "Attach") && card.data("cardfront").data("monster_color") == "Token")
			data = "Remove Token";


		if (DBO_keys[17]) {
			if (data.indexOf("To ED") >= 0 && !isExtraDeckCard(card)) {
				if (data != "To ED FU" && !card.data("cardfront").data("pendulum")) {
					data = "To T Deck";
				}
			}
			else if ((data == "To T Deck" || data == "To B Deck" || data == "To hand") && isExtraDeckCard(card)) {
				data = "To ED";
			}
			if (data.indexOf("SS ATK") >= 0 || data.indexOf("SS DEF") >= 0 || data == "Normal Summon" || data == "Summon token" || (data == "Set monster" && isIn(card, player1.hand_arr) >= 0)) {
				if (!hasAvailableMonsterZones(player1))
					return;
			}

			if (data == "Activate ST" || data == "Set ST" || data == "To ST") {
				if (!hasAvailableSTZones(player1))
					return;
			}
		}

		if (data == "Overlay" || data == "OL ATK" || data == "OL DEF" || data == "Attach") {
			olPlay = data;
			overlaying_card = card;
			if (countOverlayOptions(player1) == 0) {
				overlaying_card = null;
				return;
			}
			else if (countOverlayOptions(player1) == 1) {
				Send({ "action": "Duel", "play": olPlay, "start_card": overlaying_card.data("id"), "end_card": getOnlyOverlayId(player1) });
				overlaying_card = null;
			}
			else if (countOverlayOptions(player1) == 2 && data == "Overlay") {
				Send({ "action": "Duel", "play": olPlay, "start_card": overlaying_card.data("id"), "end_card": getOnlyOverlayId(player1) });
				overlaying_card = null;
			}
			else {

				// CTRL is pressed, probably bird UI is used.
				if (mobile || birdUI) {
					let e = {}

					e.stopPropagation = function () { };

					startOverlay(e);
				}
				else {
					startOverlay(e);
				}
				if (linkCardChosen(player1)) {
					DBO_exitViewing();
				}
			}
			return;
		}
		else if (data == "Attack") {
			attacking_card = card;
			if (countMonsters(Player2()) == 0) {
				return;
			}
			else if (countMonsters(Player2()) == 1) {
				Send({ "action": "Duel", "play": "Attack", "attacking_card": attacking_card.data("id"), "attacked_card": getOnlyAttackId(Player2()) });
				attacking_card = null;
			}
			else {
				startAttack(e);
			}
			return;
		}
		else if (data == "Show deck") {
			getConfirmation("Show Deck", "Are you sure you want to show your opponent your deck?", showDeck);
			return;
		}
		else if (data == "Show ED") {
			getConfirmation("Show Extra", "Are you sure you want to show your opponent your extra deck?", showExtra);
			return;
		}
		if (links && isIn(card, player1.extra_arr) >= 0 && (data == "SS ATK" || data == "SS DEF")) {
			if (!bothLinkCardsChosen(player1)) {
				if (!linkCardChosen(player1) || $('#choose_zones_cb').is(":checked")) {
					DBO_exitViewing();
					summoning_card = card;
					summoning_play = data;
					startChooseExtraZones();
					startChooseMonsterZones();
					return;
				}
			}
		}
		if (data == "Move") {
			summoning_card = card;
			summoning_play = data;
			startChooseMonsterZones();
			startChooseSTZones();

			// Dev here.
			//if (card.data("cardfront").data("type") == "Field") {
			startChooseFieldSpellZones();
			//}
			if (links) {
				startChooseExtraZones();
			}
			startChooseMonsterZones2();
			return;
		}
		if (data == "Activate Pendulum") {
			summoning_card = card;
			summoning_play = "Activate ST";
			$('#s1_select').show();
			s1_select.play();
			$('#s5_select').show();
			s5_select.play();
			return;
		}
		if (data == "Swap") {
			addAutoComplete($('#input .input_txt'), "card");
			getInput("Swap Card", "Enter the name of the new card:", "", 100, function () {
				removeAutoComplete($('#input .input_txt'));
				Send({ "action": "Duel", "play": "Swap", "card": card.data("id"), "name": $('#input .input_txt').val() });
			}, null, null, function () {
				removeAutoComplete($('#input .input_txt'));
			});
			return;
		}
		if (data == "Resolve Small World") {
			var arr = [];
			player1.hand_arr.forEach(function (e, i) {
				if (e.data("cardfront").data("card_type") == "Monster") {
					addIfNotExists(arr, e.data("cardfront").data("name"));
				}
			});
			getComboBox("Small World", "Select a card in your hand:", arr, 0, function () {
				Send({ "action": "Duel", "play": "Check Small World 1", "name": $('#combo .combo_cb').val() });
				showDim();
			});
			showDim();
			return;
		}

		if ($('#choose_zones_cb').is(":checked")) {
			if (data.indexOf("SS ATK") >= 0 || data.indexOf("SS DEF") >= 0 || data == "Normal Summon" || data == "Summon token" || (data == "Set monster" && isIn(card, player1.hand_arr) >= 0)) {
				if (links || countMonsters(player1) != 4) {
					summoning_card = card;
					summoning_play = data;
					startChooseMonsterZones();

					if (data.indexOf("SS ATK") >= 0 || data.indexOf("SS DEF") >= 0 || data == "Normal Summon" || (data == "Set monster" && isIn(card, player1.hand_arr) >= 0)) {
						if (DBO_unlockCardMechanics && DBO_IsCardKaiju(card)) {
							startChooseMonsterZones2();
						}
					}
					return;
				}
			}
			switch (data) {
				case "Activate ST":
				case "Set ST":
					if (player1.s1 && player1.s1[0] == card[0] || player1.s2 && player1.s2[0] == card[0] || player1.s3 && player1.s3[0] == card[0] || player1.s4 && player1.s4[0] == card[0] || player1.s5 && player1.s5[0] == card[0]) {
						break;
					}
				case "To ST":
					if (countSpells(player1) != 4) {
						summoning_card = card;
						summoning_play = data;
						startChooseSTZones();
						return;
					}
					break;
				case "Change control":
					summoning_card = card;
					summoning_play = data;
					startChooseMonsterZones2();
					return;
			}
		}
		$('#sword').hide();
		if (data == "Summon token") {
			awaiting_token = true;
		}
		if (data == "Lilith effect" || data == "Alphan effect") {
			DBO_exitViewing();
		}
		if (data == "Shuffle deck" && $('#avatar2 .status_txt').text().indexOf("Opponent's Hand") >= 0) {
			return;
		}
		if (data == "View materials") {
			viewing_card_with_materials = card;
			//viewing = "Xyz Materials";
			//$('#view .title_txt').text("Viewing Xyz Materials");
			//viewCards(card.data("xyz_arr"));
			viewingE("Xyz Materials");
			//return;
		}
		if (data == "Fiber effect") {
			getConfirmation2("Resolve Fiber Jar", "Return Fiber Jar as well?", function () {
				fiberEvent(card.data("id"), true);
			}, function () {
				fiberEvent(card.data("id"), false);
			});
			showDim();
			return;
		}
		Send({ "action": "Duel", "play": data, "card": card.data("id") });

		if (!paused) {
			if (data == "View deck" && seen_deck) {
				viewingE("Deck");
			}
			if (data == "View ED" && seen_extra) {
				if ($('#avatar2 .status_txt').text() != "Viewing Opponent's Extra Deck") {
					viewingE("Extra Deck");
				}
			}
		}
		if (data == "Upside Down effect 2") {
			DBO_exitViewing(null, true);
		}
	}

	window.startOverlay = function (e) {
		updateMouse(e);
		$('#overlay').show();
		$('body').mousemove(moveXyzTargetE);
		moveXyzTargetE(e);
		e.stopPropagation();
		$('body').click(DBO_checkOverlay);
	}
	window.checkOverlay = function (e) {
		DBO_checkOverlay(e);
	}

	// Avoid the notorious bug where replacing the function breaks .off
	if (typeof DBO_checkOverlay === "undefined") {
		window.DBO_checkOverlay = function (e) {
			if (olPlay == "DBO Attach") {
				olPlay = "Attach";
				Send({ "action": "Duel", "play": "To GY", "card": overlaying_card.data("id") });
			}
			updateMouse(e);
			$('body').off("click", DBO_checkOverlay);
			$('body').off("mousemove", moveXyzTargetE);
			$('#overlay').hide();
			if (player1.m1) {
				if (overlaying_card != player1.m1) {
					if (inBounds($('#m1_hidden'))) {
						overlayCard(player1.m1);
						return;
					}
				}
			}
			if (player1.m2) {
				if (overlaying_card != player1.m2) {
					if (inBounds($('#m2_hidden'))) {
						overlayCard(player1.m2);
						return;
					}
				}
			}
			if (player1.m3) {
				if (overlaying_card != player1.m3) {
					if (inBounds($('#m3_hidden'))) {
						overlayCard(player1.m3);
						return;
					}
				}
			}
			if (player1.m4) {
				if (overlaying_card != player1.m4) {
					if (inBounds($('#m4_hidden'))) {
						overlayCard(player1.m4);
						return;
					}
				}
			}
			if (player1.m5) {
				if (overlaying_card != player1.m5) {
					if (inBounds($('#m5_hidden'))) {
						overlayCard(player1.m5);
						return;
					}
				}
			}
			if (linkLeft) {
				if (overlaying_card != linkLeft && linkLeft.data("controller") == player1) {
					if (inBounds($('#link_left_hidden'))) {
						overlayCard(linkLeft);
						return;
					}
				}
			}
			if (linkRight) {
				if (overlaying_card != linkRight && linkRight.data("controller") == player1) {
					if (inBounds($('#link_right_hidden'))) {
						overlayCard(linkRight);
						return;
					}
				}
			}
			overlaying_card = null;
		}
	}

	window.hideSelectZones = function (dontRestore) {
		// This function should not exist in replays, and this function breaks replays.
		if ($("#m1_select").length == 0)
			return;

		DBO_hideZone('#m1_select');
		DBO_hideZone('#m2_select');
		DBO_hideZone('#m3_select');
		DBO_hideZone('#m4_select');
		DBO_hideZone('#m5_select');

		DBO_hideZone('#m1_select2');
		DBO_hideZone('#m2_select2');
		DBO_hideZone('#m3_select2');
		DBO_hideZone('#m4_select2');
		DBO_hideZone('#m5_select2');

		DBO_hideZone('#s1_select');
		DBO_hideZone('#s2_select');
		DBO_hideZone('#s3_select');
		DBO_hideZone('#s4_select');
		DBO_hideZone('#s5_select');

		DBO_hideZone('#field_spell1_select');
		DBO_hideZone('#field_spell2_select');

		DBO_hideZone('#link_left_select');
		DBO_hideZone('#link_right_select');


		DBO_hideZone('#hand_select');
		DBO_hideZone('#grave_select');
		DBO_hideZone('#banished_select');
		DBO_hideZone('#deck_select');
		DBO_hideZone('#ed_select');
		DBO_hideZone('#declare_effect_select');

		if (typeof DBO_target_card !== "undefined") {
			DBO_target_card.hide();

			let target = $('#target_select');

			target.hide();
		}

		if (typeof DBO_atk_position_card !== "undefined") {
			DBO_atk_position_card.hide();

			let target = $('#atk_position_select');

			target.hide();
		}

		if (typeof DBO_def_position_card !== "undefined") {
			DBO_def_position_card.hide();

			let target = $('#def_position_select');

			target.hide();
		}


		if (typeof DBO_bottom_deck_card !== "undefined") {
			DBO_bottom_deck_card.hide();

			let target = $('#bottom_deck_select');

			target.hide();
		}

		if (typeof DBO_overlay_card !== "undefined") {
			DBO_overlay_card.hide();

			let target = $('#overlay_select');

			target.hide();
		}


		if (summoning_card && !dontRestore) {
			console.log("Hide Select Zones");

			var rotY = DBO_getCardRotY(summoning_card);

			if (rotY != null && rotY != getRotationY(summoning_card[0])) {
				console.log("Houston we have a problem (if this message is spammed)");
				TweenMax.set(summoning_card, { rotationY: rotY, ease: Linear.easeNone });
			}
		}

		if (summoning_play == "DBO Move") {
			summoning_play = "";
		}


	}

	window.DBO_hideZone = function (jQueryName) {
		if ($(jQueryName).length > 0) {
			$(jQueryName).hide();

			if (typeof $(jQueryName).data("cycle") !== "undefined") {
				$(jQueryName).data("cycle").stop()
			}
		}
	}

	window.DBO_findSelectZones = function () {
		let DBO_list = $("#select_zones").children();

		for (let abc = 0; abc < DBO_list.length; abc++) {
			let obj = $(DBO_list[abc]);

			if (obj.is(":visible"))
				return true;
		}

		return false;
	}
	window.DBO_chooseZone = function (myself) {

		// ed_select for /pend
		let rotY = getRotationY(summoning_card[0]);

		if (summoning_play != "DBO Move" && myself[0] != $("#ed_select")[0] && !DBO_isPendulumScaleAttempt(summoning_card, rotY, myself[0])) {

			DBO_performChooseZone(myself[0]);
		}
		else {
			window.DBO_lastCardAction = undefined;

			// hideSelectZones will wipe our rotation and dreams.

			hideSelectZones();

			if (DBO_isPendulumScaleAttempt(summoning_card, rotY, myself[0])) {
				if (myself[0] == $("#s1_select")[0]) {
					Send({ "action": "Duel", "play": "Activate Pendulum Left", "card": summoning_card.data("id") });

					// Want to flip it obviously.
					window.DBO_lastCardAction = "Activate Pendulum Right";
				}
				else if (myself[0] == $("#s5_select")[0]) {
					Send({ "action": "Duel", "play": "Activate Pendulum Right", "card": summoning_card.data("id") });

					// Want to flip it obviously.
					window.DBO_lastCardAction = "Activate Pendulum Left";
				}
				return;

			}

			if (myself[0] == $("#ed_select")[0]) {
				let onlyFU = false;
				let onlyFD = false;

				if (isExtraDeckCard(summoning_card) && !(summoning_card.data("cardfront").data("pendulum") && isIn(summoning_card, player1.hand_arr) < 0 && isIn(summoning_card, player1.extra_arr) < 0)) {
					onlyFD = true;
				}

				if (!isExtraDeckCard(summoning_card) && (summoning_card.data("cardfront").data("pendulum") && isIn(summoning_card, player1.hand_arr) < 0 && isIn(summoning_card, player1.extra_arr) < 0)) {
					onlyFU = true;
				}

				if (!onlyFD && (DBO_isRotFaceup(rotY) || onlyFU)) {
					window.DBO_lastCardAction = "To ED FU";

					Send({ "action": "Duel", "play": "To ED FU", "card": summoning_card.data("id") });
				}
				else if (!onlyFU && (DBO_isRotFacedown(rotY) || onlyFD)) {
					window.DBO_lastCardAction = "To ED";

					Send({ "action": "Duel", "play": "To ED", "card": summoning_card.data("id") });
				}
				return;
			}
			else if (myself[0] == $("#grave_select")[0]) {
				if (summoning_card.data("cardfront").data("monster_color") == "Token") {
					window.DBO_lastCardAction = "Remove Token";

					Send({ "action": "Duel", "play": "Remove Token", "card": summoning_card.data("id") });
				}
				else if (summoning_card.hasClass("xyzmaterial")) {
					window.DBO_lastCardAction = "Detach";

					Send({ "action": "Duel", "play": "Detach", "card": summoning_card.data("id") });
				}
				else {
					window.DBO_lastCardAction = "To GY";

					Send({ "action": "Duel", "play": "To GY", "card": summoning_card.data("id") });
				}
			}
			else if (myself[0] == $("#banished_select")[0]) {
				if (summoning_card.data("cardfront").data("monster_color") == "Token") {
					window.DBO_lastCardAction = "Remove Token";

					Send({ "action": "Duel", "play": "Remove Token", "card": summoning_card.data("id") });
				}
				else if (DBO_isRotFaceup(rotY)) {
					window.DBO_lastCardAction = "Banish";

					Send({ "action": "Duel", "play": "Banish", "card": summoning_card.data("id") });
				}
				else if (DBO_isRotFacedown(rotY)) {
					window.DBO_lastCardAction = "Banish FD";

					Send({ "action": "Duel", "play": "Banish FD", "card": summoning_card.data("id") });
				}
			}
			else if (myself[0] == $("#deck_select")[0]) {
				if (summoning_card.data("cardfront").data("monster_color") == "Token") {
					window.DBO_lastCardAction = "Remove Token";

					Send({ "action": "Duel", "play": "Remove Token", "card": summoning_card.data("id") });
				}
				else {
					window.DBO_lastCardAction = "To T Deck";
					Send({ "action": "Duel", "play": "To T Deck", "card": summoning_card.data("id") });
				}
			}
			else if (myself[0] == $("#hand_select")[0]) {
				if (summoning_card.data("cardfront").data("monster_color") == "Token") {
					window.DBO_lastCardAction = "Remove Token";

					Send({ "action": "Duel", "play": "Remove Token", "card": summoning_card.data("id") });
				}
				else {
					window.DBO_lastCardAction = "To hand";

					Send({ "action": "Duel", "play": "To hand", "card": summoning_card.data("id") });
				}
			}
			else if (myself[0] == $("#declare_effect_select")[0]) {
				DBO_CheckPlayerZones(true);

				let fieldCards = [];

				for (let abc = 0; abc < DBO_Player1Field.length; abc++) {
					fieldCards.push(DBO_Player1Field[abc].card);
				}

				if (isIn(summoning_card, fieldCards) >= 0 && summoning_card.data("face_down")) {
					if (isMonster(player1, summoning_card))
						Send({ "action": "Duel", "play": "Flip", "card": summoning_card.data("id") });

					else
						Send({ "action": "Duel", "play": "Activate ST", "card": summoning_card.data("id") });
				}

				window.DBO_lastCardAction = "Declare";

				Send({ "action": "Duel", "play": "Declare", "card": summoning_card.data("id") });
			}
			else if (myself[0] == $("#target_select")[0]) {
				window.DBO_lastCardAction = "Target";

				Send({ "action": "Duel", "play": "Target", "card": summoning_card.data("id") });
				return;
			}
			else if (myself[0] == $("#atk_position_select")[0]) {
				if (isST(player1, summoning_card) || (player1.fieldSpell && player1.fieldSpell.data("id") == summoning_card.data("id"))) {
					if (summoning_card.data("face_down")) {
						window.DBO_lastCardAction = "Activate ST";

						Send({ "action": "Duel", "play": "Activate ST", "card": summoning_card.data("id") });
					}
					else {
						window.DBO_lastCardAction = "Set ST";

						Send({ "action": "Duel", "play": "Set ST", "card": summoning_card.data("id") });
					}
				}
				else if (DBO_isRotFaceup(rotY)) {
					window.DBO_lastCardAction = "To ATK";

					Send({ "action": "Duel", "play": "To ATK", "card": summoning_card.data("id") });
				}
				else if (DBO_isRotFacedown(rotY)) {
					window.DBO_lastCardAction = "Set ST";

					Send({ "action": "Duel", "play": "Set ST", "card": summoning_card.data("id") });
				}
			}
			else if (myself[0] == $("#def_position_select")[0]) {

				if (DBO_isRotFaceup(rotY)) {
					window.DBO_lastCardAction = "To DEF";

					Send({ "action": "Duel", "play": "To DEF", "card": summoning_card.data("id") });
				}
				else if (DBO_isRotFacedown(rotY)) {
					window.DBO_lastCardAction = "Set monster";

					Send({ "action": "Duel", "play": "Set monster", "card": summoning_card.data("id") });
				}
			}
			else if (myself[0] == $("#bottom_deck_select")[0]) {
				window.DBO_lastCardAction = "To B Deck";

				Send({ "action": "Duel", "play": "To B Deck", "card": summoning_card.data("id") });
			}
			else if (myself[0] == $("#overlay_select")[0]) {
				if (isIn(summoning_card, player1.grave_arr) >= 0 || isIn(summoning_card, player1.banished_arr) >= 0) {
					window.DBO_lastCardAction = "Attach";

					cardMenuClicked(summoning_card, "Attach");
				}
				else {
					window.DBO_lastCardAction = "Overlay";

					cardMenuClicked(summoning_card, "Overlay");
				}
			}
			else {
				DBO_CheckPlayerZones(true);

				let fieldCards = [];

				for (let abc = 0; abc < DBO_Player1Field.length; abc++) {
					fieldCards.push(DBO_Player1Field[abc].card);
				}

				if (isIn(summoning_card, fieldCards) >= 0) {

					if (DBO_isRotFaceup(rotY) && summoning_card.data("face_down")) {
						if (isST(player1, summoning_card)) {
							window.DBO_lastCardAction = "Activate ST";

							Send({ "action": "Duel", "play": "Activate ST", "card": summoning_card.data("id") });
						}
						else {
							window.DBO_lastCardAction = "Flip";

							Send({ "action": "Duel", "play": "Flip", "card": summoning_card.data("id") });
						}
					}
					else if (DBO_isRotFacedown(rotY) && !summoning_card.data("face_down")) {
						if (isST(player1, summoning_card)) {
							window.DBO_lastCardAction = "Set ST";

							Send({ "action": "Duel", "play": "Set ST", "card": summoning_card.data("id") });
						}
						else if (isMonster(player1, summoning_card)) {
							window.DBO_lastCardAction = "Set monster";

							Send({ "action": "Duel", "play": "Set monster", "card": summoning_card.data("id") });
						}
					}
					summoning_play = "Move";

					DBO_performChooseZone(myself[0]);
				}
				else {

					if (myself[0].id.search(/field_spell1/i) != -1) {
						if (DBO_isRotFaceup(rotY)) {
							Send({ "action": "Duel", "play": "Activate Field Spell", "card": summoning_card.data("id") });
						}
						else if (DBO_isRotFacedown(rotY)) {
							Send({ "action": "Duel", "play": "Set Field Spell", "card": summoning_card.data("id") });
						}
					}
					else if (myself[0].id.search(/field_spell2/i) != -1) {
						if (DBO_isRotFaceup(rotY)) {
							Send({ "action": "Duel", "play": "Activate Field Spell 2", "card": summoning_card.data("id") });
						}
						else if (DBO_isRotFacedown(rotY)) {
							Send({ "action": "Duel", "play": "Set Field Spell 2", "card": summoning_card.data("id") });
						}
					}

					if (myself[0].id.startsWith("m") || myself[0].id.startsWith("link_")) {
						if (DBO_isRotFaceup(rotY)) {
							if (summoning_card.data("cardfront").data("monster_color") == "Link") {
								summoning_play = "SS ATK";

								DBO_performChooseZone(myself[0]);

							}
							else {
								DBO_summoning_zone = DBO_getZone(myself[0]);

								getConfirmation2("Yes = ATK, No = DEF, Cancel = Abort", "", DBO_SummonATKYes, DBO_SummonDEFNo);
							}


						}
						else if (DBO_isRotFacedown(rotY)) {
							summoning_play = "Set monster";

							DBO_performChooseZone(myself[0]);
						}
					}
					else if (myself[0].id.startsWith("s")) {
						if (DBO_isRotFaceup(rotY)) {
							summoning_play = "Activate ST"

							DBO_performChooseZone(myself[0]);

						}
						else if (DBO_isRotFacedown(rotY)) {
							summoning_play = "Set ST";

							DBO_performChooseZone(myself[0]);
						}
					}
				}
			}

			removeMenuData();
		}
	}

	window.DBO_isPendulumScaleAttempt = function (card, rotY, myself) {
		if (myself.id != "s1_select" && myself.id != "s5_select")
			return false;

		else if (DBO_isRotFacedown(rotY))
			return false;

		else if (!card.data("cardfront").data("pendulum"))
			return false;

		return true;
	}
	window.DBO_SummonATKYes = function () {
		summoning_play = "SS ATK";
		DBO_actOnZone(DBO_summoning_zone);
	}

	window.DBO_SummonDEFNo = function () {
		summoning_play = "SS DEF";
		DBO_actOnZone(DBO_summoning_zone);
	}

	window.DBO_isRotFaceup = function (rotY) {
		return Math.abs(rotY - 0) < 5;
	}

	window.DBO_isRotFacedown = function (rotY) {
		return Math.abs(rotY - 180) < 5;
	}

	window.DBO_getCardZone = function (card) {
		DBO_CheckPlayerZones(true);

		for (let abc = 0; abc < DBO_Field.length; abc++) {
			if (DBO_Field[abc].card.data("id") == card.data("id")) {
				return DBO_Field[abc].zoneName;
			};
		}

		return null;
	}

	window.DBO_getZone = function (myself) {
		switch (myself) {
			case $('#m1_select')[0]:
				zone = "M-1";
				break;
			case $('#m2_select')[0]:
				zone = "M-2";
				break;
			case $('#m3_select')[0]:
				zone = "M-3";
				break;
			case $('#m4_select')[0]:
				zone = "M-4";
				break;
			case $('#m5_select')[0]:
				zone = "M-5";
				break;

			case $('#m1_select2')[0]:
				zone = "M2-1";
				break;
			case $('#m2_select2')[0]:
				zone = "M2-2";
				break;
			case $('#m3_select2')[0]:
				zone = "M2-3";
				break;
			case $('#m4_select2')[0]:
				zone = "M2-4";
				break;
			case $('#m5_select2')[0]:
				zone = "M2-5";
				break;

			case $('#s1_select')[0]:
				zone = "S-1";
				break;
			case $('#s2_select')[0]:
				zone = "S-2";
				break;
			case $('#s3_select')[0]:
				zone = "S-3";
				break;
			case $('#s4_select')[0]:
				zone = "S-4";
				break;
			case $('#s5_select')[0]:
				zone = "S-5";
				break;

			case $('#field_spell1_select')[0]:
				//zone = "Field Spell Zone";
				zone = "F-1";
				break;
			case $('#field_spell2_select')[0]:
				zone = "F-2";
				break;

			case $('#link_left_select')[0]:
				zone = "Left Extra Monster Zone";
				break;
			case $('#link_right_select')[0]:
				zone = "Right Extra Monster Zone";
				break;
		}

		return zone;
	}
	window.DBO_performChooseZone = function (myself) {
		var zone = DBO_getZone(myself);

		if (getZoneByName(player1, zone)) {
			return;
		}

		DBO_actOnZone(zone);

	}

	window.getZoneByName = function (player, str) {
		switch (str) {
			case "M-1":
				return player.m1;
			case "M-2":
				return player.m2;
			case "M-3":
				return player.m3;
			case "M-4":
				return player.m4;
			case "M-5":
				return player.m5;
			case "M2-1":
				return player.opponent.m1;
			case "M2-2":
				return player.opponent.m2;
			case "M2-3":
				return player.opponent.m3;
			case "M2-4":
				return player.opponent.m4;
			case "M2-5":
				return player.opponent.m5;
			case "S-1":
				return player.s1;
			case "S-2":
				return player.s2;
			case "S-3":
				return player.s3;
			case "S-4":
				return player.s4;
			case "S-5":
				return player.s5;
			case "F-1":
				return player.fieldSpell;
			case "F-2":
				return player.opponent.fieldSpell;
		}
		return null;
	}

	window.DBO_actOnZone = function (zone) {
		// For imperm column mechanics, keep in mind "zone" is unedited.
		let realZone = parseInt(zone.replace(/\D/g, ''));

		if (zone.startsWith("M") && !zone.startsWith("M-") && (summoning_play.indexOf("SS ATK") >= 0 || summoning_play.indexOf("SS DEF") >= 0 || summoning_play == "Normal Summon" || summoning_play == "Set monster")) {
			hideSelectZones();

			if (automatic && $('#duelmessage').is(":visible")) {
				hideDuelMessage();
			}
			else if (automatic) {
				$('#duel .cancel_btn').hide();
			}



			removeMenuData();

			let DBO_zone = null;

			if (!duel_links && linkLeft == null) {
				DBO_zone = "Left Extra Monster Zone"
			}
			else if (!duel_links && linkRight == null) {
				DBO_zone = "Right Extra Monster Zone";
			}
			else if (player1.m3 == null) {
				DBO_zone = "M-3";
			}
			else if (player1.m2 == null) {
				DBO_zone = "M-2";
			}
			else if (player1.m1 == null) {
				DBO_zone = "M-1";
			}
			else if (!duel_links && player1.m4 == null) {
				DBO_zone = "M-4";
			}
			else if (!duel_links && player1.m4 == null) {
				DBO_zone = "M-5";
			}

			if (DBO_zone == null) {
				DBO_zone = "M-3";
			}


			let DBO_monsterCard = player1.m3;

			let DBO_isFacedown = false;
			let DBO_isATK = false;

			if (DBO_monsterCard) {
				DBO_isFacedown = DBO_monsterCard.data("face_down");
				DBO_isATK = DBO_monsterCard.data("inATK");
			}

			if (DBO_monsterCard != null && DBO_zone == "M-3") {
				cardMenuClicked(DBO_monsterCard, "Banish FD");
			}


			Send({ "action": "Duel", "play": summoning_play, "card": summoning_card.data("id"), "zone": DBO_zone });

			Send({ "action": "Duel", "play": "Move", "card": summoning_card.data("id"), "zone": zone });

			if (DBO_monsterCard != null && DBO_zone == "M-3") {
				if (DBO_isFacedown) {
					window.DBO_lastCardAction = "Set monster";

					Send({ "action": "Duel", "play": "Set monster", "card": DBO_monsterCard.data("id") });
				}
				else {
					if (DBO_isATK) {
						window.DBO_lastCardAction = "SS ATK";

						Send({ "action": "Duel", "play": "SS ATK", "card": DBO_monsterCard.data("id") });
					}
					else {
						window.DBO_lastCardAction = "SS DEF";

						Send({ "action": "Duel", "play": "SS DEF", "card": DBO_monsterCard.data("id") });
					}
				}
			}

			return;

		}

		if (zone.startsWith("S-") && DBO_RealImpermColumns[realZone - 1] && (summoning_play == "Activate ST" || summoning_play == "To ST")) {
			hideSelectZones();

			if (automatic && $('#duelmessage').is(":visible")) {
				hideDuelMessage();
			}
			else if (automatic) {
				$('#duel .cancel_btn').hide();
			}



			removeMenuData();

			window.DBO_summoning_zone = zone;

			getConfirmation2("Imperm Column Detected!!!", "The extension believes this is an imperm column. Continue with the misplay?", DBO_ImpermMisplayYes);

			return;
		}

		hideSelectZones();
		window.DBO_lastCardAction = summoning_play;
		Send({ "action": "Duel", "play": summoning_play, "card": summoning_card.data("id"), "zone": zone });


		if (automatic && $('#duelmessage').is(":visible")) {
			hideDuelMessage();
		}
		else if (automatic) {
			$('#duel .cancel_btn').hide();
		}



		removeMenuData();
	}

	window.DBO_ImpermMisplayYes = function () {
		Send({ "action": "Duel", "play": summoning_play, "card": summoning_card.data("id"), "zone": DBO_summoning_zone });
	}
	window.DBO_excavateYes = function () {
		if (typeof window.DBO_excavateAmount === "undefined")
			return;

		let num = window.DBO_excavateAmount;

		if (num > 9)
			return;

		if (num > player1.main_arr.length)
			return;

		for (let abc = 0; abc < num; abc++) {
			let DBO_card = player1.main_arr[abc];
			cardMenuClicked(DBO_card, "Banish");

			window.DBO_waitingForAction = true;
			window.DBO_excavatedArr.push(DBO_card);
		}
	}
	window.DBO_DeclareVictoryYes = function () {
		let slots = [];
		for (let abc = 0; abc < 5; abc++) {
			slots[abc] = false;
		}

		for (let abc = 0; abc < player1.all_cards_arr.length; abc++) {
			if (isMonster(player1, player1.all_cards_arr[abc]) || isST(player1, player1.all_cards_arr[abc]) || (player1.fieldSpell && player1.fieldSpell[0] == player1.all_cards_arr[abc][0])) {
				if (player1.all_cards_arr[abc].data("face_down"))
					cardMenuClicked(player1.all_cards_arr[abc], "Banish FD");

				else
					cardMenuClicked(player1.all_cards_arr[abc], "To GY");
			}
		}

		for (let abc = 0; abc < player2.all_cards_arr.length; abc++) {
			if (isMonster(player2, player2.all_cards_arr[abc]) || isST(player2, player2.all_cards_arr[abc]) || (player1.fieldSpell && player1.fieldSpell[0] == player2.all_cards_arr[abc][0])) {
				if (player2.all_cards_arr[abc].data("face_down"))
					cardMenuClicked(player2.all_cards_arr[abc], "Banish FD");

				else
					cardMenuClicked(player2.all_cards_arr[abc], "To GY");
			}
		}

		let DBO_arr = [];

		for (let abc = 0; abc < player1.hand_arr.length; abc++) {
			if (player1.hand_arr[abc].data("cardfront").data("name") == "Exodia the Forbidden One") {
				DBO_arr.push(player1.hand_arr[abc]);
				Send({ "action": "Duel", "play": "Activate Field Spell", "card": player1.hand_arr[abc].data("id"), "zone": "F-1" });
			}

			if (player1.hand_arr[abc].data("cardfront").data("name") == "Right Arm of the Forbidden One") {
				DBO_arr.push(player1.hand_arr[abc]);
				Send({ "action": "Duel", "play": "Normal Summon", "card": player1.hand_arr[abc].data("id"), "zone": "M-2" });
			}

			if (player1.hand_arr[abc].data("cardfront").data("name") == "Left Arm of the Forbidden One") {
				DBO_arr.push(player1.hand_arr[abc]);
				Send({ "action": "Duel", "play": "Normal Summon", "card": player1.hand_arr[abc].data("id"), "zone": "M-4" });
			}

			if (player1.hand_arr[abc].data("cardfront").data("name") == "Right Leg of the Forbidden One") {
				DBO_arr.push(player1.hand_arr[abc]);
				Send({ "action": "Duel", "play": "To ST", "card": player1.hand_arr[abc].data("id"), "zone": "S-2" });
			}

			if (player1.hand_arr[abc].data("cardfront").data("name") == "Left Leg of the Forbidden One") {
				DBO_arr.push(player1.hand_arr[abc]);
				Send({ "action": "Duel", "play": "To ST", "card": player1.hand_arr[abc].data("id"), "zone": "S-4" });
			}
		}

		if (turn_player == player1) {
			if (currentPhase != "BP") {
				currentPhase = "BP";
				Send({ "action": "Duel", "play": "Enter BP" });
			}

			for (let abc = 0; abc < DBO_arr.length; abc++) {
				Send({ "action": "Duel", "play": "Attack directly", "card": DBO_arr[abc].data("id") });
			}
		}
	}

	window.DBO_XyzMaterialToFrontYes = function () {
		if (typeof window.DBO_XyzMaterial === "undefined")
			return;

		else if (typeof window.DBO_XyzMaterial.data === "undefined")
			return;

		else if (typeof window.DBO_XyzMaterial.hasClass("xyzmaterial") === "undefined")
			return;

		DBO_XyzMaterialToFront(window.DBO_XyzMaterial);
	}

	window.DBO_XyzMaterialToFront = function (card) {
		let newXyz = card;
		let zone = null;
		let oldXyz = null;
		let xyzArr = [];

		DBO_CheckPlayerZones();

		for (let abc = 0; abc < window.DBO_Player1MonsterZones.length; abc++) {
			let found = false;
			let cardToTest = window.DBO_Player1MonsterZones[abc].card;
			let zoneToTest = window.DBO_Player1MonsterZones[abc].zoneName;

			if (cardToTest == null)
				continue;

			for (let def = 0; def < cardToTest.data("xyz_arr").length; def++) {
				if (cardToTest.data("xyz_arr")[def].data("id") == card.data("id")) {
					oldXyz = cardToTest;
					zone = zoneToTest;
				}
			}
		}

		if (oldXyz == null) {
			return;
		}

		let inATK = false;

		if (oldXyz.data("inATK"))
			inATK = true;


		xyzArr = [].concat(oldXyz.data("xyz_arr"));

		Send({ "action": "Duel", "play": "To GY", "card": oldXyz.data("id") });



		if (inATK)
			Send({ "action": "Duel", "play": "SS ATK", "card": newXyz.data("id"), "zone": zone });

		else
			Send({ "action": "Duel", "play": "SS DEF", "card": newXyz.data("id"), "zone": zone });


		Send({ "action": "Duel", "play": "Attach", "start_card": oldXyz.data("id"), "end_card": newXyz.data("id") });

		for (let abc = 0; abc < xyzArr.length; abc++) {
			Send({ "action": "Duel", "play": "Attach", "start_card": xyzArr[abc].data("id"), "end_card": newXyz.data("id") });
		}
	}

	window.DBO_BanishEverythingEDYes = function () {
		for (let abc = 0; abc < player1.extra_arr.length; abc++) {
			cardMenuClicked(player1.extra_arr[abc], "Banish");
		}
	}

	window.DBO_UnbanishEverythingEDYes = function () {
		for (let abc = 0; abc < player1.banished_arr.length; abc++) {
			let card = player1.banished_arr[abc];

			if (!card.data("face_down") && isExtraDeckCard(card)) {
				cardMenuClicked(card, "To ED");
			}
		}
	}
	window.DBO_MagicalMerchantYes = function () {
		if (window.DBO_excavatedArr.length > 0)
			return;

		// Only make it true if we're making an action prior to the interval starting.
		window.DBO_waitingForAction = false;

		let merchantInterval = setInterval(function () {

			if (player1.main_arr.length == 0) {
				clearInterval(merchantInterval)
				window.DBO_excavatedArr = [];

				//TweenMax.globalTimeScale(1);
				return;
			}

			if (actionsQueue.length <= 0 && !window.DBO_waitingForAction) {
				if (window.DBO_excavatedArr.length == 0) {
					let DBO_card = player1.main_arr[0];
					cardMenuClicked(DBO_card, "Banish");
					window.DBO_waitingForAction = true;
					window.DBO_excavatedArr.push(DBO_card);
				}
				else {
					for (let abc = 0; abc < window.DBO_excavatedArr.length; abc++) {
						let DBO_card = window.DBO_excavatedArr[abc];

						if (DBO_card.data("cardfront").data("card_type") == "Monster") {
							cardMenuClicked(DBO_card, "To GY");
						}
						else {
							cardMenuClicked(DBO_card, "To hand");

							// Break the interval when it ends.
							clearInterval(merchantInterval);
						}
					}

					window.DBO_excavatedArr = [];
					window.DBO_waitingForAction = false;
				}
			}
		}, 50);
	}

	window.DBO_ReasoningGateYes = function () {
		if (window.DBO_excavatedArr.length > 0)
			return;

		// Only make it true if we're making an action prior to the interval starting.
		window.DBO_waitingForAction = false;

		let merchantInterval = setInterval(function () {

			if (player1.main_arr.length == 0) {
				clearInterval(merchantInterval)
				window.DBO_excavatedArr = [];

				//TweenMax.globalTimeScale(1);
				return;
			}

			if (actionsQueue.length <= 0 && !window.DBO_waitingForAction) {
				if (window.DBO_excavatedArr.length == 0) {
					let DBO_card = player1.main_arr[0];
					cardMenuClicked(DBO_card, "Banish");
					window.DBO_waitingForAction = true;
					window.DBO_excavatedArr.push(DBO_card);
				}
				else {
					for (let abc = 0; abc < window.DBO_excavatedArr.length; abc++) {
						let DBO_card = window.DBO_excavatedArr[abc];

						cardMenuClicked(DBO_card, "To GY");

						if ((DBO_card.data("cardfront").data("monster_color") == "Effect" || DBO_card.data("cardfront").data("monster_color") == "Normal") && !DBO_IsCardCannotBeNormalSummonedOrSet(DBO_card)) {
							// Break the interval when it ends.
							clearInterval(merchantInterval);
						}
					}

					window.DBO_excavatedArr = [];
					window.DBO_waitingForAction = false;
				}
			}
		}, 50);
	}

	window.DBO_ToonTableYes = async function () {
		if (typeof window.DBO_toonTableCard === "undefined")
			return;

		else if (typeof window.DBO_toonTableCard.data === "undefined")
			return;

		else if (typeof window.DBO_toonTableCard.data("cardfront") === "undefined")
			return;

		cardMenuClicked(DBO_toonTableCard, "To GY");

		let TToCName = "Toon Table of Contents"
		let DBO_val = $('#combo .combo_cb').val();

		let commandName = "/////search";

		let DBO_checked = $('#choose_zones_cb').prop("checked")

		$('#choose_zones_cb').checked(false)

		let card;

		let data = {};
		data.fake = true;
		data.username = username;
		data.play = "Duel message";
		data.message = `/////failtofind ${TToCName}`;

		await duelResponse(data);

		while (typeof DBO_duelResponseCardId !== "undefined") {
			data.fake = true;
			data.username = username;
			data.play = "Duel message";
			data.message = `${commandName} ${TToCName}`;

			await duelResponse(data);

			card = DBO_duelResponseCard;

			if (typeof card !== "undefined") {
				data.fake = true;
				data.username = username;
				data.play = "Duel message";
				data.message = `/////failtofind ${TToCName}`;

				await duelResponse(data);

				console.log(DBO_duelResponseCard)
				if (typeof DBO_duelResponseCard !== "undefined") {
					cardMenuClicked(card, "Activate ST")
					cardMenuClicked(card, "To GY")
				}
				else {
					break;
				}
			}
			else {
				break;
			}
		}

		if (DBO_val.search(/let me/i) < 0) {
			data.fake = true;
			data.username = username;
			data.play = "Duel message";
			data.message = `/////failtofind ${DBO_val}`;

			await duelResponse(data);

			console.log("Toon World:");
			console.log(DBO_duelResponseCard);

			console.log(data.message);

			if (typeof DBO_duelResponseCard !== "undefined") {
				if (typeof card !== "undefined") {
					cardMenuClicked(card, "Activate ST")
					cardMenuClicked(card, "To GY")
				}

				cardMenuClicked(DBO_duelResponseCard, "To hand");
			}
		}

		$('#choose_zones_cb').checked(DBO_checked);
	}
	window.DBO_ThunderDragonYes = async function () {
		if (typeof window.DBO_thunderDragonCard === "undefined")
			return;

		else if (typeof window.DBO_thunderDragonCard.data === "undefined")
			return;

		else if (typeof window.DBO_thunderDragonCard.data("cardfront") === "undefined")
			return;

		let card = window.DBO_thunderDragonCard;

		if (isIn(card, player1.hand_arr) >= 0) {
			cardMenuClicked(card, "To GY");
		}

		if (viewing) {
			DBO_exitViewing();
		}

		for (let abc = 0; abc < 2; abc++) {
			let data = {};
			data.fake = true;
			data.username = username;
			data.play = "Duel message";
			data.message = `/////search Thunder Dragon`;

			await duelResponse(data);
		}
	}

	window.DBO_LookAtTopYes = function () {

		if (typeof window.DBO_facedownExcavatorCard === "undefined")
			return;

		else if (typeof window.DBO_facedownExcavatorCard.data === "undefined")
			return;

		else if (typeof window.DBO_facedownExcavatorCard.data("cardfront") === "undefined")
			return

		let DBO_excavated = DBO_IsFacedownExcavator(DBO_facedownExcavatorCard);

		let monsterCount = countMonsters(player1);
		let stCount = countSpells(player1);

		if (monsterCount > DBO_excavated && stCount > DBO_excavated) {
			DBO_addColoredLine("FF0000", "Error: Not enough space on field.");
			return;
		}

		let commandName = "Set monster";

		if (monsterCount > DBO_excavated)
			commandName = "Set ST";

		let DBO_checked = $('#choose_zones_cb').prop("checked")

		$('#choose_zones_cb').checked(false)

		let DBO_cards = [];

		for (let abc = 0; abc < DBO_excavated; abc++) {
			DBO_cards.push(player1.main_arr[abc]);
		}

		for (let abc = 0; abc < DBO_cards.length; abc++) {
			cardMenuClicked(DBO_cards[abc], "Banish FD");
		}

		for (let abc = 0; abc < DBO_cards.length; abc++) {
			cardMenuClicked(DBO_cards[abc], commandName);
		}


		$('#choose_zones_cb').checked(DBO_checked);
	}
	window.DBO_JackInTheHandYes = function () {
		let monsterCount = countMonsters(player1);
		let stCount = countSpells(player1);

		if (monsterCount > 2 && stCount > 2) {
			DBO_addColoredLine("FF0000", "Error: Not enough space on field.");
			return;
		}


		let cardNamesToSummon = [];

		switch ($('#combo .combo_cb').val()) {
			case "Alpha, Zeta, Gamma":

				cardNamesToSummon.push("Drytron Alpha Thuban");
				cardNamesToSummon.push("Drytron Zeta Aldhibah");
				cardNamesToSummon.push("Drytron Gamma Eltanin");

				break;

			case "Robina, Eglen, Toccan":

				cardNamesToSummon.push("Floowandereeze & Robina");
				cardNamesToSummon.push("Floowandereeze & Eglen");
				cardNamesToSummon.push("Floowandereeze & Toccan");

				break;

			case "Robina, Eglen, Stri":

				cardNamesToSummon.push("Floowandereeze & Robina");
				cardNamesToSummon.push("Floowandereeze & Eglen");
				cardNamesToSummon.push("Floowandereeze & Stri");

				break;
		}

		cardNamesToSummon.sort(function (a, b) { return 0.5 - Math.random() });

		let commandName = "/////atk";

		if (monsterCount > 2)
			commandName = "/////st";

		let DBO_checked = $('#choose_zones_cb').prop("checked")

		$('#choose_zones_cb').checked(false)

		for (let abc = 0; abc < cardNamesToSummon.length; abc++) {
			let data = {};
			data.fake = true;
			data.username = username;
			data.play = "Duel message";
			data.message = `${commandName} ${cardNamesToSummon[abc]}`;

			duelResponse(data);
		}

		$('#choose_zones_cb').checked(DBO_checked);
	}
	window.startChooseMonsterZones = function () {
		console.log('startChooseMonsterZones');
		if (player1.m1 == null) {
			$('#m1_select').show();

			if (!mobile && !lowAnimations)
				$("#m1_select").data("cycle").play();
		}
		if (player1.m2 == null) {
			$('#m2_select').show();

			if (!mobile && !lowAnimations)
				$("#m2_select").data("cycle").play();
		}
		if (player1.m3 == null) {
			$('#m3_select').show();

			if (!mobile && !lowAnimations)
				$("#m3_select").data("cycle").play();
		}
		if (!duel_links && !speed && !rush) {
			if (player1.m4 == null) {
				$('#m4_select').show();

				if (!mobile && !lowAnimations)
					$("#m4_select").data("cycle").play();
			}
			if (player1.m5 == null) {
				$('#m5_select').show();

				if (!mobile && !lowAnimations)
					$("#m5_select").data("cycle").play();
			}
		}
	}

	window.startChooseMonsterZones2 = function () {
		if (player2.m1 == null) {
			$('#m1_select2').show();

			if (!mobile && !lowAnimations)
				$("#m1_select2").data("cycle").play();
		}
		if (player2.m2 == null) {
			$('#m2_select2').show();

			if (!mobile && !lowAnimations)
				$("#m2_select2").data("cycle").play();
		}
		if (player2.m3 == null) {
			$('#m3_select2').show();

			if (!mobile && !lowAnimations)
				$("#m3_select2").data("cycle").play();
		}
		if (!duel_links && !speed && !rush) {
			if (player2.m4 == null) {
				$('#m4_select2').show();

				if (!mobile && !lowAnimations)
					$("#m4_select2").data("cycle").play();
			}
			if (player2.m5 == null) {
				$('#m5_select2').show();

				if (!mobile && !lowAnimations)
					$("#m5_select2").data("cycle").play();
			}
		}
	}

	window.startChooseExtraZones = function () {
		if (linkLeft == null) {
			$('#link_left_select').show();

			if (!mobile && !lowAnimations)
				$("#link_left_select").data("cycle").play();
		}
		if (linkRight == null) {
			$('#link_right_select').show();

			if (!mobile && !lowAnimations)
				$("#link_right_select").data("cycle").play();
		}
	}

	window.startChooseSTZones = function () {
		if (player1.s1 == null) {
			$('#s1_select').show();

			if (!mobile && !lowAnimations)
				$("#s1_select").data("cycle").play();
		}
		if (player1.s2 == null) {
			$('#s2_select').show();

			if (!mobile && !lowAnimations)
				$("#s2_select").data("cycle").play();
		}
		if (player1.s3 == null) {
			$('#s3_select').show();

			if (!mobile && !lowAnimations)
				$("#s3_select").data("cycle").play();
		}
		if (!duel_links && !speed && !rush) {
			if (player1.s4 == null) {
				$('#s4_select').show();

				if (!mobile && !lowAnimations)
					$("#s4_select").data("cycle").play();
			}
			if (player1.s5 == null) {
				$('#s5_select').show();

				if (!mobile && !lowAnimations)
					$("#s5_select").data("cycle").play();
			}
		}
	}

	window.startChooseFieldSpellZones = function () {
		if (links) {
			$("#field_spell1_select").css("left", "221.5px")
			$("#field_spell1_select").css("top", "338px")

			$("#field_spell2_select").css("left", "753.495px")
			$("#field_spell2_select").css("top", "151.997px")
		}
		else {
			$("#field_spell1_select").css("left", "207px")
			$("#field_spell1_select").css("top", "292px")

			$("#field_spell2_select").css("left", "769px")
			$("#field_spell2_select").css("top", "198px")
		}

		if (player1.fieldSpell == null) {
			$('#field_spell1_select').show();

			if (!mobile && !lowAnimations)
				$("#field_spell1_select").data("cycle").play();
		}
		if (player2.fieldSpell == null) {
			$('#field_spell2_select').show();

			if (!mobile && !lowAnimations)
				$("#field_spell2_select").data("cycle").play();
		}
	}

	window.startChooseGYZone = function (card) {
		if (isIn(card, player1.grave_arr) >= 0)
			return false;

		if (links) {
			$("#grave_select").css("top", "337px");
			$("#grave_select").css("left", "754px");
		}
		else {
			$("#grave_select").css("top", "292px");
			$("#grave_select").css("left", "769px");
		}

		$('#grave_select').show();

		if (!mobile && !lowAnimations)
			$("#grave_select").data("cycle").play();

		return true;
	}

	window.startChooseBanishZone = function (card) {
		if (isIn(card, player1.banished_arr) >= 0)
			return false;

		if (links) {
			$("#banished_select").css("left", "769px");
		}
		else {
			$("#banished_select").css("left", "703px");
		}

		$('#banished_select').show();

		if (!mobile && !lowAnimations)
			$("#banished_select").data("cycle").play();

		return true;
	}

	window.startChooseDeckZone = function (card) {
		if (isExtraDeckCard(card) || isIn(card, player1.main_arr) >= 0 || card.hasClass("xyzmaterial"))
			return false;

		if (links) {
			$("#deck_select").css("top", "463px");
		}
		else {
			$("#deck_select").css("top", "485px");
		}

		$('#deck_select').show();

		if (!mobile && !lowAnimations)
			$("#deck_select").data("cycle").play();

		return true;
	}

	window.startChooseHandZone = function (card) {
		if (isExtraDeckCard(card) || isIn(card, player1.hand_arr) >= 0 || card.hasClass("xyzmaterial"))
			return false;

		$('#hand_select').show();

		if (!mobile && !lowAnimations)
			$("#hand_select").data("cycle").play();

		return true;
	}

	window.startChooseDeclareEffectZone = function (card) {
		// No extra effects unless face-up ( pendulum )
		if (isIn(card, player1.main_arr) >= 0 || (isIn(card, player1.extra_arr) >= 0 && card.data("face_down")) || card.hasClass("xyzmaterial"))
			return false;

		$('#declare_effect_select').show();

		if (!mobile && !lowAnimations)
			$("#declare_effect_select").data("cycle").play();

		return true;
	}

	window.startChooseTargetZone = function (card) {
		if (isIn(card, player1.main_arr) >= 0 || isIn(card, player1.hand_arr) >= 0 || isIn(card, player1.extra_arr) >= 0 || card.hasClass("xyzmaterial"))
			return false;

		let target = $('#target_select');

		if (target.length > 0 && typeof DBO_target_card !== "undefined") {
			DBO_target_card.show();

			TweenMax.to(target, 0, { left: parseInt(DBO_target_card.css("left")) - 10, top: parseInt(DBO_target_card.css("top")) - 10, rotation: getRotation(DBO_target_card[0]), scale: 0.72 });
			target.show();
			DBO_target_card.parent().append(target);

			return true;
		}

		return false;

	}

	window.startChooseAtkPositionZone = function (card) {
		if (!isMonster(player1, card) && !isST(player1, card) && (player1.fieldSpell && player1.fieldSpell.data("id") != card.data("id")))
			return false;

		let target = $('#atk_position_select');

		if (target.length > 0 && typeof DBO_atk_position_card !== "undefined") {

			if (isMonster(player1, card)) {
				DBO_atk_position_card.data("cardfront").data("name", "ATK Position Token");
				DBO_atk_position_card.data("cardfront").data("treated_as", "ATK Position Token");
				DBO_atk_position_card.data("cardfront").data("effect", "Press me to change a card to ATK position.");
				DBO_atk_position_card.data("cardfront").data("pic", DBO_atk_position_card.data("skins")[0]);

				if (DBO_atk_position_card.find('.pic').attr("src") != DBO_atk_position_card.data("skins")[0]) {
					DBO_atk_position_card.find('.pic').attr("src", DBO_atk_position_card.data("skins")[0]);
				}
			}
			else {
				let effect = "Press me to flip a card face-down";

				if (card.data("face_down")) {
					effect = "Press me to flip a card face-up";
				}

				DBO_atk_position_card.data("cardfront").data("name", "Flip card Token");
				DBO_atk_position_card.data("cardfront").data("treated_as", "Flip card Token");
				DBO_atk_position_card.data("cardfront").data("effect", effect);
				DBO_atk_position_card.data("cardfront").data("pic", DBO_atk_position_card.data("skins")[1]);

				if (DBO_atk_position_card.find('.pic').attr("src") != DBO_atk_position_card.data("skins")[1]) {
					DBO_atk_position_card.find('.pic').attr("src", DBO_atk_position_card.data("skins")[1]);
				}
			}

			DBO_atk_position_card.show();

			TweenMax.to(target, 0, { left: parseInt(DBO_atk_position_card.css("left")) - 10, top: parseInt(DBO_atk_position_card.css("top")) - 10, rotation: getRotation(DBO_atk_position_card[0]), scale: 0.72 });
			target.show();
			target.css("opacity", "0")
			DBO_atk_position_card.parent().append(target);

			return true;
		}

		return false;
	}

	window.startChooseDefPositionZone = function (card) {
		if (!isMonster(player1, card))
			return false;

		let target = $('#def_position_select');

		if (target.length > 0 && typeof DBO_def_position_card !== "undefined") {
			DBO_def_position_card.show();

			TweenMax.to(target, 0, { left: parseInt(DBO_def_position_card.css("left")) - 10, top: parseInt(DBO_def_position_card.css("top")) + 10, rotation: getRotation(DBO_def_position_card[0]), scale: 0.72 });
			target.show();
			target.css("opacity", "0")
			DBO_def_position_card.parent().append(target);

			return true;
		}

		return false;
	}

	window.startChooseBottomDeckZone = function (card) {
		if (isExtraDeckCard(card) || isIn(card, player1.main_arr) >= 0 || card.hasClass("xyzmaterial"))
			return false;

		else if ((!allowToBottom && !findEffect("bottom") && !DBO_findCardReal(["Tearlament"], true, true, true)) || isIn(card, player1.extra_arr) >= 0)
			return false;

		let target = $('#bottom_deck_select');

		if (target.length > 0 && typeof DBO_bottom_deck_card !== "undefined") {
			DBO_bottom_deck_card.show();

			TweenMax.to(target, 0, { left: parseInt(DBO_bottom_deck_card.css("left")) - 10, top: parseInt(DBO_bottom_deck_card.css("top")) - 10, rotation: getRotation(DBO_bottom_deck_card[0]), scale: 0.72 });
			target.show();
			target.css("opacity", "0")
			DBO_bottom_deck_card.parent().append(target);

			return true;
		}

		return false;
	}


	window.startChooseOverlayZone = function (card) {
		if (!hasXyzMonster(player1) || (isIn(card, player1.grave_arr) < 0 && isIn(card, player1.banished_arr) < 0)) {
			if (!isMonster(player1, card) || countOverlayOptions(player1) <= 1)
				return false;
		}
		if (card.data("cardfront").data("monster_color") == "Token")
			return false;

		let target = $('#overlay_select');

		if (target.length > 0 && typeof DBO_overlay_card !== "undefined") {
			DBO_overlay_card.show();

			TweenMax.to(target, 0, { left: parseInt(DBO_overlay_card.css("left")), top: parseInt(DBO_overlay_card.css("top")) + 30, rotation: getRotation(DBO_overlay_card[0]), scale: 0.5 });

			target.show();
			target.css("opacity", "0.8")
			DBO_overlay_card.parent().append(target);

			return true;
		}

		return false;
	}

	window.startChooseExtraDeckZone = function (card) {
		if (isIn(card, player1.extra_arr) >= 0)
			return false;

		if (links) {
			$("#ed_select").css("top", "461px");
		}
		else {
			$("#ed_select").css("top", "487px");
		}

		// ed face-up or ED FD.
		if (isExtraDeckCard(card) || (card.data("cardfront").data("pendulum") && isIn(card, player1.hand_arr) < 0)) {
			$('#ed_select').show();

			if (!mobile && !lowAnimations)
				$("#ed_select").data("cycle").play();

			return true;
		}

		return false;
	}

	if ($("#life_txt").length > 0)
		$("#life_txt").off("input")

	window.DBO_ExprEval = function (str, ecks, why, zed) {
		const mexp = new Mexp()

		let lastMulti = null;

		// Make sure it's not the user who made the blunder.
		for (let abc = str.length; abc >= 0; abc--) {
			if (lastMulti == null) {
				if (str[abc] == "*")
					lastMulti = abc;
			}
			else {
				// It's a number
				if (!isNaN(parseInt(str[abc]))) {
					lastMulti = null;
				}
				// Not a number & not a space = it's bad news...
				else if (str[abc] != " " && str[abc] != "x" && str[abc] != "y" && str[abc] != "z") {
					return mexp.eval(str);
				}
			}
		}

		if (typeof ecks !== "undefined")
			str = str.replaceAll("x", `*${ecks}`);

		if (typeof why !== "undefined")
			str = str.replaceAll("y", `*${why}`);

		if (typeof zed !== "undefined")
			str = str.replaceAll("z", `*${zed}`);

		lastMulti = null;

		let newStr = [];
		let removeSlots = [];

		for (let abc = str.length - 1; abc >= 0; abc--) {
			newStr.push(str[abc]);

			if (lastMulti == null) {
				if (str[abc] == "*")
					lastMulti = abc;
			}
			else {
				// It's a number
				if (!isNaN(parseInt(str[abc]))) {
					lastMulti = null;
				}
				// Not a number & not a space = it's bad news...
				else if (str[abc] != " ") {
					removeSlots.push(lastMulti);
					lastMulti = null;
				}
			}
		}

		newStr.reverse()

		// No need to reverse, as it already sorts highest to lowest to prevent messing with array size as we remove indexes.
		for (let abc = 0; abc < removeSlots.length; abc++) {
			newStr.splice(removeSlots[abc], 1);
		}

		if (newStr[0] == "*")
			newStr.splice(0, 1);

		let finalStr = newStr.join("")

		return mexp.eval(finalStr);
	}
	window.lifeEnterHandler = function () {
		if ($('#life_txt').val() == "") {
			return;
		}


		var amount = DBO_ExprEval($('#life_txt').val());

		if ($('#plus_btn').is(":visible") == false) {
			amount = amount * -1
		}

		$('#life_txt').val("");
		if (amount == 0) {
			return;
		}

		Send({ "action": "Duel", "play": "Life points", "amount": amount });
	}

	window.showMenu = function (card, dp, originalCard) {
		if (!dp) {
			menu_reason = "Menu has no data";
			return;
		}

		if (typeof originalCard === "undefined") {
			originalCard = card;
		}

		let isED = false;
		let wasAdded = false;

		for (let abc = 0; abc < dp.length; abc++) {
			if (dp[abc].data == "View ED")
				isED = true;

			if (dp[abc].data == "Banish random ED card FD")
				wasAdded = true;

			if (dp[abc].label == "Banish random ED Card")
				dp[abc].label = "Banish random";
		}

		if (isED && !wasAdded && DBO_unlockCardMechanics) {
			if (countFaceDownExtraDeckCards(player1) >= 1)
				dp.push({ label: "Banish random FD", data: "Banish random ED card FD" });

			if (DBO_findCardReal(["Banquet of Millions"])) {
				dp.push({ label: "Banish Everything", data: "DBO Banish ED Everything" });
				dp.push({ label: "Unbanish Everything", data: "DBO Unbanish ED Everything" });
			}
		}

		dp.reverse();

		if (mobile) {
			dp.push({ label: "Cancel", data: "Cancel" });
			return dp;
		}

		if (TweenMax.isTweening(originalCard)) {
			menu_reason = "Card is currently tweening";
			return;
		}
		if (menu_card && menu_card[0] == originalCard[0]) {
			menu_reason = "Card is menu_card 2";
			return;
		}
		if ($('#overlay').is(":visible")) {
			menu_reason = "overlay is visible";
			return;
		}
		if (!$('#cig1_txt').is(":visible")) {
			menu_reason = "Number of cards in GY is invisible";
			return;
		}
		if (menu_card) {
			if (getRotation(menu_card[0]) == -90 && inBounds(menu)) {
				menu_reason = "Card is rotated";
				return;
			}
			removeCardMenu();
		}
		if (isInYourHand(player1, originalCard)) {
			card.css("top", originalCard.data("controller").handY - 30);
			$('#blue_target').hide();
		}
		if (getScale(originalCard[0]) < 0.2) {
			for (var i = 0; i < dp.length; i++) {
				switch (dp[i].label) {
					case "S. Summon ATK":
						dp[i].label = "SS ATK";
						break;
					case "S. Summon DEF":
						dp[i].label = "SS DEF";
						break;
					case "To Graveyard":
						dp[i].label = "To Grave";
						break;
					case "To Top of Deck":
						dp[i].label = "To T. Deck";
						break;
					case "To Bottom of Deck":
						dp[i].label = "To B. Deck";
						break;
				}
			}
		}
		menu_card = originalCard;
		menu.find('#card_menu_content').html("");
		var scale = getScale(originalCard[0]);
		if (scale < 0) {
			scale = -scale;
		}
		var width = 400;
		var height = 580;
		var rotation = getRotation(originalCard[0]);
		if (rotation == 180) {
			rotation = 0;
		}
		if (rotation != 0) {
			width = 580;
			height = 400;
		}
		menu.css("width", width * scale);
		if (width * scale > 100) {
			console.log('menu is too wide');
			return;
		}
		var h = 0;
		var menu_height = 14;
		for (var i = 0; i < dp.length; i++) {
			if (automatic && dp[i].label == "Set ST") {
				dp[i].label = "Set";
			}
			var option = $('<div class="card_menu_btn"><div class="image"><img src="' + IMAGES_START + 'svg/card_menu_btn_up.svg" /></div><span class="card_menu_txt">' + dp[i].label + '</span></div>');
			option.data("data", dp[i].data);
			option.click(cardMenuClickE);
			option.css("width", width * scale);
			option.css("height", menu_height);
			option.find('.image').css("width", width);
			if (menu.hasClass("unloaded")) {
				option.find('.image img')[0].onload = function () {
					menu.removeClass("unloaded");
				};
			}
			var optionScaleY = 0.265;
			if (rotation != 0) {
				optionScaleY = 0.18;
			}
			TweenMax.to(option.find('.image'), 0, { scaleY: optionScaleY, scaleX: scale });
			$('body').append(option);
			var num = 14;
			if (option.find('.card_menu_txt')[0].scrollHeight > 15) {
				h += option.find('.card_menu_txt')[0].scrollHeight / num * menu_height;
				option.css("height", option.find('.card_menu_txt')[0].scrollHeight / num * menu_height);
				TweenMax.to(option.find('.image'), 0, { scaleY: optionScaleY * option.find('.card_menu_txt')[0].scrollHeight / num, scaleX: scale });
			}
			else {
				h += menu_height;
				option.find('.card_menu_txt').css("white-space", "nowrap");
			}
			addButton(option);
			switch (dp[i].label) {
				case "Activate ":
				case "Flip Deck":
				case "Turn Top Card FU":
				case "Banish 10 Cards FD":
				case "Banish 3 Cards":
				case "Banish 3 ED Cards FD":
				case "Banish 6 ED Cards FD":
				case "Banish random ED Card":
				case "Banish random":
				case "Banish random FD":
				case "Banish random ED Card FD":
				case "To Top of Deck face-up":
				case "To Opponent's Deck":
				case "Face-Down":
				case "Mill difference":
				case "Activate to other side":
				case "Set to your side":
				case "Set to other side":
				case "Resolve Effect":
				case "Look at cards":
				case "Set to Monster Zone":
				case "Draw Spell/Trap":
				case "Draw Spellcaster":
				case "Choose":
				case "To Opponent's Hand":
				case "Look at opponent cards":
				case "Card of Fate Effect":
				case "Banish Random Card":
				case "Banish 8 Cards FD":
				case "Stay Revealed":
				case "Stop Revealing":
				case "Check Small World":
				case "Check Options":

				// Dev here
				case "Declare Victory":
				case "Banish ED Card FD":
				case "To Main Deck FU":
				case "Banish first 3 ED":
				case "Banish first 5 ED":
				case "Banish first 6 ED":
				case "Banish entire ED":
				case "To Opponent's Deck":
				case "To Opponent's Deck FU":
				case "Swap Deck with GY":
				case "Pay Half LP":
				case "Crossout Card":
				case "Replace Hand":
				case "Banish Everything":
				case "Unbanish Everything":
				case "Summon 4 Gates":
				case "Resolve GY Effect":
				case "View materials":

					option.find('img').attr("src", IMAGES_START + "svg/card_menu_btn_up2.svg");
					break;
			}
			if (dp[i].label.indexOf("Mill ") >= 0) {
				option.find('img').attr("src", IMAGES_START + "svg/card_menu_btn_up2.svg");
			}

			// Dev here
			if (dp[i].label.indexOf("Excavate Top ") >= 0) {
				option.find('img').attr("src", IMAGES_START + "svg/card_menu_btn_up2.svg");
			}

			// Dev here
			if (dp[i].label.indexOf("Look at Top ") >= 0) {
				option.find('img').attr("src", IMAGES_START + "svg/card_menu_btn_up2.svg");
			}
			// Dev here
			if (dp[i].data == "DBO To ED FU")
				option.find('img').attr("src", IMAGES_START + "svg/card_menu_btn_up2.svg");

			// Dev here
			if (dp[i].data == "DBO Attach")
				option.find('img').attr("src", IMAGES_START + "svg/card_menu_btn_up2.svg");

			// Dev here.
			if (dp[i].data == "DBO SS Many Tokens")
				option.find('img').attr("src", IMAGES_START + "svg/card_menu_btn_up2.svg");

			menu.find('#card_menu_content').append(option);
		}
		$('#viewing').append(menu);





		menu.css("height", h);
		var left = parseInt(originalCard.css("left")) - scale * width / 2;
		var top = parseInt(originalCard.css("top")) - height * scale / 2 - h;
		if (menu_card.parent()[0] == $('#view > .content')[0]) {
			top += 15 + parseInt($("#view").css("top")) + 32 - $('#view > .content').scrollTop();
			left += parseInt($("#view").css("left")) + 5;
		}
		var startY = top + menu[0].scrollHeight;
		if (menu[0].scrollHeight > parseInt(originalCard.css("height")) * scale) {
			startY = top + parseInt(originalCard.css("height")) * scale;
		}
		//menu.css("top", top);
		menu.css("top", top + 1); // helps prevent unwanted menuOutE events
		menu.data("top", top + 1);
		menu.css("left", left);
		TweenMax.set(menu, { "scaleY": 1 });
		//TweenMax.set(menu, {"scaleY":isMonster(player1, menu_card) ? 2 : 2.5});
		TweenMax.fromTo(menu.find('#card_menu_content'), (0.03 * dp.length), { "top": h }, {
			"top": 0, ease: Linear.easeNone, onComplete: function () {
				var scaleY = 1;
				if (menu[0].getBoundingClientRect().y < -marginTop) {
					scaleY = (menu[0].scrollHeight + menu[0].getBoundingClientRect().y) / menu[0].scrollHeight;
					menu.css("top", top - menu[0].getBoundingClientRect().y);
					TweenMax.set(menu, { "scaleY": scaleY });
				}
			}
		});
	}


	if (typeof window.DBO_originalDuelResponse === "undefined" && typeof window.duelResponse !== "undefined") {
		Function.prototype.clone = function () {
			var that = this;
			var temp = function temporary() { return that.apply(this, arguments); };
			for (var key in this) {
				if (this.hasOwnProperty(key)) {
					temp[key] = this[key];
				}
			}
			return temp;
		};

		console.log("If this appears more than twice, insane issues");
		window.DBO_originalDuelResponse = window.duelResponse.clone();
	}

	window.shuffleDeck = function (player, data) {
		if (player.main_arr.length == 0) {
			return;
		}
		var total = 0;
		var cardX = parseInt(player.main_arr[0].css("left"));

		let DBO_delay = 42;


		var t = setInterval(function () {
			for (var i = 0; i < player.main_arr.length; i++) {
				var n1 = random(24);
				var n2 = -random(24);
				player.main_arr[i].css("left", cardX + (n1 + n2));
			}
			total++;
			if (total > 10) {
				clearInterval(t);
				updateIDs(player.main_arr, data.deck, data.prev);
				player.main_arr = shuffle(player, player.main_arr, data.deck);
				shiftDeck(player);
				endAction();
			}
		}, DBO_delay);
		playSound(ShuffleSound);
	}

	window.shuffleHand2 = function (player, data) {
		window.DBO_newHand = data.hand;
		window.DBO_waitingForAction = false;
		restoreHandCards();
		TweenMax.to(player.hand_arr, 0.25, {
			left: 485, ease: Linear.easeNone, onComplete: function () {
				updateIDs(player.hand_arr, data.hand, data.prev);
				player.hand_arr = shuffle(player, player.hand_arr, data.hand);
				organizeHand(player, true);
				setTimeout(function () { // testing
					endAction();
				}, 250);
			}
		});
		if (player.hand_arr.length > 1) {
			playSound(ShuffleHand);
		}
	}

	if (!replay) {
		window.duelResponse = async function (data) {
			if (!data.fake) {


				console.time("DuelResponse");

				DBO_originalDuelResponse(data);

				console.timeEnd("DuelResponse");
			}

			switch (data.play) {
				case "Start turn":
					{
						let players = [];
						players.push(player1);
						players.push(player2);

						if (tag_duel) {
							players.push(player3);
							players.push(player4);
						}

						for (let i = 0; i < players.length; i++) {
							for (let abc = 0; abc < players[i].all_cards_arr.length; abc++) {
								let card = players[i].all_cards_arr[abc];

								if (card && !isNaN(card.data("negations")) && card.data("negations") > 0) {
									card.data("negations", ~~card.data("negations") - 1);
								}
							}
						}

						updateNegates();

						if (duelist) {
							DBO_swapCardMenuForPlayer(player1);
						}

						window.DBO_FusionSentThisTurn = false;
					}
				case "Duel message":
					// Maybe add data.fake?
					if (duelist && data.username == username && data.message) {

						// Dev, check if this condition we're in prevents an opponent from being able to search for us.

						// if the index of a string is 0, that string starts the message.

						let DBO_message = data.message;

						if (DBO_messageStartsWith(DBO_message, "/randomdiscard") || DBO_messageStartsWith(DBO_message, "/rngdiscard")) {
							window.DBO_waitingForAction = true;

							let messageToSend = `I will shuffle my hand and banish the closest card to the deck as a random discard`;
							Send({ "action": "Duel", "play": "Duel message", "message": messageToSend, "html": ~~0 });

							messageToSend = `Approve this and it will be sent to GY as the discard`;
							Send({ "action": "Duel", "play": "Duel message", "message": messageToSend, "html": ~~0 });

							messageToSend = `Otherwise I'll add it to my hand and you will manually select.`;
							Send({ "action": "Duel", "play": "Duel message", "message": messageToSend, "html": ~~0 });


							cardMenuClicked(new Card(), "Shuffle hand");

							let randomDiscardInterval = setInterval(function () {
								if (!window.DBO_waitingForAction) {
									clearInterval(randomDiscardInterval)

									if (typeof window.DBO_newHand !== "undefined") {
										Send({ "action": "Duel", "play": "Banish FD", "card": DBO_newHand[DBO_newHand.length - 1] });
									}
									else {
										messageToSend = `The extension rarely has failed to find the closest card to my deck`;
										Send({ "action": "Duel", "play": "Duel message", "message": messageToSend, "html": ~~0 });

										messageToSend = `May I discard the closest card to my Deck?`;
										Send({ "action": "Duel", "play": "Duel message", "message": messageToSend, "html": ~~0 });
									}
									return;
								}
							}, 50);

							return true;
						}
						if (DBO_messageStartsWith(DBO_message, "/snipe")) {
							let opponentArr = [];
							let opponentHand = player1.opponent.hand_arr.slice();
							let opponentST = [];
							let opponentMonsters = [];

							for (let abc = 1; abc <= 5; abc++) {
								if (player1.opponent["m" + abc] != null && player1.opponent["m" + abc].data("face_down"))
									opponentMonsters.push(player1.opponent["m" + abc])
							}
							for (let abc = 1; abc <= 5; abc++) {
								if (player1.opponent["s" + abc] != null && player1.opponent["s" + abc].data("face_down"))
									opponentST.push(player1.opponent["s" + abc])
							}

							opponentArr.push(opponentHand)
							opponentArr.push(opponentST)
							opponentArr.push(opponentMonsters)

							DBO_snipeByArray(opponentArr);

							return true;

						}

						let noChoice = false;

						if (DBO_messageStartsWith(DBO_message, "/////")) {
							DBO_message = DBO_message.replace("/////", "/");
							noChoice = true;
						}

						if (!DBO_messageStartsWith(DBO_message, "/banish") && (DBO_messageStartsWith(DBO_message, "/search") || DBO_messageStartsWith(DBO_message, "/send") || DBO_messageStartsWith(DBO_message, "/ban") || DBO_messageStartsWith(DBO_message, "/atk") || DBO_messageStartsWith(DBO_message, "/def") || DBO_messageStartsWith(DBO_message, "/st") || DBO_messageStartsWith(DBO_message, "/pend") || DBO_messageStartsWith(DBO_message, "/failtofind"))) {
							let msg = data.message;

							if (DBO_messageStartsWith(msg, "/////")) {
								msg = msg.replace("/////", "/");
							}

							let cardClickAction = "To hand";
							let commandName = "/search";
							let finalLocation = player1.hand_arr;

							if (DBO_messageStartsWith(DBO_message, "/search")) {
								msg = msg.substring(7);

								if (msg.indexOf(' ') == 0)
									msg = msg.replace(" ", "");
							}


							else if (DBO_messageStartsWith(DBO_message, "/send")) {
								msg = msg.substring(5);

								if (msg.indexOf(' ') == 0)
									msg = msg.replace(" ", "");

								cardClickAction = "To GY";
								commandName = "/send";
								finalLocation = player1.grave_arr;
							}

							else if (DBO_messageStartsWith(DBO_message, "/ban")) {
								msg = msg.substring(4);

								if (msg.indexOf(' ') == 0)
									msg = msg.replace(" ", "");

								cardClickAction = "Banish";
								commandName = "/ban";
								finalLocation = player1.banished_arr;
							}

							else if (DBO_messageStartsWith(DBO_message, "/atk")) {
								msg = msg.substring(4);

								if (msg.indexOf(' ') == 0)
									msg = msg.replace(" ", "");

								cardClickAction = "SS ATK";
								commandName = "/atk";
								finalLocation = undefined;
							}

							else if (DBO_messageStartsWith(DBO_message, "/def")) {
								msg = msg.substring(4);

								if (msg.indexOf(' ') == 0)
									msg = msg.replace(" ", "");

								cardClickAction = "SS DEF";
								commandName = "/def";
								finalLocation = undefined;
							}

							else if (DBO_messageStartsWith(DBO_message, "/st")) {
								msg = msg.substring(3);

								if (msg.indexOf(' ') == 0)
									msg = msg.replace(" ", "");

								cardClickAction = "To ST";
								commandName = "/st";
								finalLocation = undefined;
							}

							else if (DBO_messageStartsWith(DBO_message, "/pend")) {
								msg = msg.substring(5);

								if (msg.indexOf(' ') == 0)
									msg = msg.replace(" ", "");

								cardClickAction = "Activate Pendulum";
								commandName = "/pend";
								finalLocation = undefined;
							}

							else if (DBO_messageStartsWith(DBO_message, "/failtofind")) {
								msg = msg.substring(11);

								if (msg.indexOf(' ') == 0)
									msg = msg.replace(" ", "");

								cardClickAction = null;
								commandName = "/failtofind";
								finalLocation = player1.main_arr;
							}

							// UnescapeHTML to fix issues with symbols "&" and """
							msg = DBO_UnescapeHTML(msg);


							window.DBO_duelResponseCardName = undefined;
							window.DBO_duelResponseCardId = undefined;
							window.DBO_duelResponseCard = undefined;

							if (msg.length == 0) {
								addLine("Usage: " + commandName + " <card name>")
							}
							else if (msg.length <= 2) {
								addLine("Error: Use 3+ characters of the name")
							}
							else {
								if (viewing != "Deck") {
									if (viewing) {
										DBO_exitViewing();
									}

									cardMenuClicked(new Card(), "View deck");
								}

								let cleared = false;

								while (!cleared) {
									await DBO_msDelay(50);

									if (viewing == "Deck") {
										cleared = true;

										let foundExact = false;

										let foundNames = [];
										let foundIndex = -1;

										for (let abc = 0; abc < player1.main_arr.length; abc++) {
											// If card click action is Activate Pendulum, only include pendulum monsters.
											if (player1.main_arr[abc].data("cardfront").data("name").toLowerCase().search(msg.toLowerCase()) != -1 && (cardClickAction != "Activate Pendulum" || player1.main_arr[abc].data("cardfront").data("pendulum"))) {
												if (player1.main_arr[abc].data("cardfront").data("name").toLowerCase() == msg.toLowerCase()) {
													foundExact = true;
													foundIndex = abc;
													foundNames = [];
													foundNames.push(player1.main_arr[abc].data("cardfront").data("name"));
													abc = 9999999;
												}
												else if (foundNames.indexOf(player1.main_arr[abc].data("cardfront").data("name")) == -1) {
													foundIndex = abc;
													foundNames.push(player1.main_arr[abc].data("cardfront").data("name"))
												}
											}
										}

										if (foundIndex == -1) {
											if (cardClickAction != null) {
												addLine(`Card "${msg}" was not found`);
											}
										}
										else if (foundNames.length >= 2 && foundNames.length <= 4) {
											if (cardClickAction != null) {
												addLine("Found multiple name matches:");
												for (let abc = 0; abc < foundNames.length; abc++) {
													addLine(foundNames[abc].toLowerCase().replace(msg.toLowerCase(), msg.toUpperCase()));
												}
											}
										}
										else if (foundNames.length >= 5) {
											if (cardClickAction != null) {
												addLine("Found 5+ cards with the same name as the search");
											}
										}
										else {
											if (cardClickAction != null) {
												if (cardClickAction == "Activate Pendulum") {
													summoning_card = player1.main_arr[foundIndex];
													summoning_play = "Activate ST";

													$('#s1_select').show();
													s1_select.play();

													$('#s5_select').show();
													s5_select.play();

													// Note to self: any cardMenuClicked hides this.

													startChooseExtraDeckZone(summoning_card);
												}
												else if (cardClickAction != "To ST") {
													let DBO_checked = $('#choose_zones_cb').prop("checked")

													if (noChoice) {
														$('#choose_zones_cb').checked(false)
													}

													cardMenuClicked(player1.main_arr[foundIndex], cardClickAction);

													if (noChoice) {
														$('#choose_zones_cb').checked(DBO_checked);
													}
												}
												else {
													let DBO_checked = $('#choose_zones_cb').prop("checked")

													if (noChoice) {
														$('#choose_zones_cb').checked(false)
													}

													if (player1.main_arr[foundIndex].data("cardfront").data("card_type") == "Spell" && player1.main_arr[foundIndex].data("cardfront").data("type") == "Field") {
														cardMenuClicked(player1.main_arr[foundIndex], "Activate Field Spell");
													}
													else {
														cardMenuClicked(player1.main_arr[foundIndex], cardClickAction);
													}

													if (noChoice) {
														$('#choose_zones_cb').checked(DBO_checked);
													}
												}
											}

											DBO_duelResponseCardName = player1.main_arr[foundIndex].data("cardfront").data("name");
										}
									}
								}

								if (cleared && cardClickAction != null) {
									DBO_waitingForAction = true;
								}

								while (DBO_waitingForAction || actionsQueue.length > 0) {
									await DBO_msDelay(15);
								}

								if (typeof finalLocation !== "undefined") {
									for (let abc = 0; abc < finalLocation.length; abc++) {
										if (finalLocation[abc].data("cardfront").data("name") == DBO_duelResponseCardName) {
											DBO_duelResponseCardId = finalLocation[abc].data("id");
											DBO_duelResponseCard = finalLocation[abc];

											break;
										}
									}
								}
							}
							return true;
						}
					}
					break;

				case "Done siding":
					playSound(Decided)
					break;

				case "Pick first":
					window.DBO_TrueDeckArr = [];
					window.DBO_TrueExtraDeckArr = [];
					window.DBO_DigString = undefined;
					break;

				case "End turn":

					let DBO_list = document.querySelectorAll("div")

					for (let abc = 0; abc < DBO_list.length; abc++) {
						if (!DBO_list[abc].id.startsWith("Imperm_Column_Real"))
							continue;

						$(DBO_list[abc]).remove();
					}

					window.DBO_RealImpermColumns = [false, false, false, false, false];

					break;
			}

			return false;
		}
	}

	window.DBO_UnescapeHTML = function (str) {
		if (!str) {
			return Str(str);
		}

		str = replaceAll(str, "&amp;", "&");
		str = replaceAll(str, "&lt;", "<");
		str = replaceAll(str, "&gt;", ">");
		str = replaceAll(str, "&quot;", '"'); // added 8/7/22 to help Small World parse Maxx "C"
		str = replaceAll(str, "&#39;", "'"); // added 7/16/23

		str = addBreaks(str)
		return str;
	}

	window.DBO_removeBreaks = function (str) {
		str = replaceAll(str, "<br>", "\n");
		return str;
	}

	window.activateFieldSpell = function (player, data) {
		var card = getFieldCard(player, data);
		if (!card) {
			card = removeCard(player, data);
			if (!card) {
				card = removeCard(player.opponent, data);
			}
		}
		card.data("cardfront").reinitialize(data.card);
		card.data("face_down", false);
		player.fieldSpell = card;
		if (tag_duel) {
			player.partner.fieldSpell = card;
		}
		updateController(player, card);
		$('#field').append(card);
		TweenMax.to(card, easeSecondsBanish, {
			left: player.fieldSpellX, top: player.fieldSpellY, scale: 0.1485, rotation: player.rot, rotationY: ABOUT_ZERO, ease: Linear.easeNone, onComplete: function () {
				setFieldSpellPic(player, card);

				if (viewing)
					updateViewing();

				endAction();
			}
		});
		playSound(Activate);

		checkPlayMDSound(card);

		DBO_CheckIllegalThrust(card, data);
	}

	window.activateFieldSpell2 = function (player, data) {
		var card = getFieldCard(player, data);
		if (!card) {
			card = removeCard(player, data);
		}
		card.data("cardfront").reinitialize(data.card);
		card.data("face_down", false);
		player.opponent.fieldSpell = card;
		if (tag_duel) {
			player.opponent.partner.fieldSpell = card;
		}
		updateController(player.opponent, card);
		$('#field').append(card);
		TweenMax.to(card, easeSecondsBanish, {
			left: player.opponent.fieldSpellX, top: player.opponent.fieldSpellY, scale: 0.1485, rotation: player.opponent.rot, rotationY: ABOUT_ZERO, ease: Linear.easeNone, onComplete: function () {
				setFieldSpellPic(player.opponent, card);

				if (viewing)
					updateViewing();

				endAction();
			}
		});
		playSound(Activate);
	}

	window.setFieldSpell = function (player, data) {
		var card = getFieldCard(player, data);
		if (!card) {
			card = removeCard(player, data);
			playSound(FaceDown);
		}
		else {
			playSound(Flip);
		}
		card.data("face_down", true);
		player.fieldSpell = card;
		if (tag_duel) {
			player.partner.fieldSpell = card;
		}
		$('#field').append(card);
		TweenMax.to(card, easeSeconds, {
			left: player.fieldSpellX, top: player.fieldSpellY, scale: 0.1485, rotation: player.rot, rotationY: 180 + ABOUT_ZERO, ease: Linear.easeNone, onComplete: function () {
				updateController(player, card);

				if (viewing)
					updateViewing();

				endAction();
			}
		});
		removeFieldSpellPic();

		DBO_CheckIllegalThrust(card, data);
	}

	window.setFieldSpell2 = function (player, data) {
		var card = removeCard(player, data);
		card.data("cardfront").reinitialize(data.card);
		card.data("face_down", true);
		player.opponent.fieldSpell = card;
		if (tag_duel) {
			player.opponent.partner.fieldSpell = card;
		}
		updateController(player.opponent, card);
		$('#field').append(card);
		TweenMax.to(card, easeSecondsBanish, {
			left: player.opponent.fieldSpellX, top: player.opponent.fieldSpellY, scale: 0.1485, rotation: player.opponent.rot, rotationY: 180 + ABOUT_ZERO, ease: Linear.easeNone, onComplete: function () {
				if (player.opponent.username == username) {
					updateController(player.opponent, card);
				}

				if (viewing)
					updateViewing();

				endAction();
			}
		});
		playSound(FaceDown);
	}

	window.normalSummon = function (player, data) {
		var card = removeFromHand(player, data);
		var points = getNextMonsterZone(player, card, data);
		card.data("inATK", true);
		card.data("inDEF", false);
		card.data("face_down", false);
		$('#field').append(card);
		card.data("cardfront").reinitialize(data.card);
		TweenMax.to(card, easeSeconds, {
			left: points[0], top: points[1], scale: 0.1485, rotation: player.rot, rotationY: ABOUT_ZERO, ease: Linear.easeNone, onComplete: function () {

				if (viewing)
					updateViewing();

				endAction();
			}
		});
		playSound(NormalSummon);

		checkPlayMDSound(card);


	}

	window.specialSummon = function (player, data, points, card, end) {
		if (end !== false) {
			end = true;
		}
		if (!card) {
			card = removeCard(player, data);
		}
		if (!card) {
			card = removeCard(player.opponent, data);
		}
		if (!points) {
			points = getNextMonsterZone(player, card, data);
		}
		var rot = player.rot;
		card.data("cardfront").reinitialize(data.card);
		if (data.play.indexOf("ATK") >= 0 || data.position == "Attack") {
			card.data("inATK", true);
			card.data("inDEF", false);
		}
		else {
			card.data("inATK", false);
			card.data("inDEF", true);
			rot = player.defRot;
		}
		var rotY = ABOUT_ZERO;
		card.data("face_down", false);
		//if (data.position == "Set") { // when is this possible?
		if (data.position == "Set" || data.position == "FD Defense") {
			rotY = 180;
			card.data("face_down", true);
		}
		$('#field').append(card);
		TweenMax.to(card, easeSeconds, {
			left: points[0], top: points[1], scale: 0.1485, rotation: rot, rotationY: ABOUT_ZERO, ease: Linear.easeNone, onComplete: function () {

				if (viewing)
					updateViewing();

				$('#ss_glow').show();
				$('#ss_spiral').show();
				TweenMax.to($('#ss_glow'), 0, { left: points[0], top: points[1] });
				TweenMax.to($('#ss_glow'), 0.7, { scale: 6, rotation: -250 });
				TweenMax.to($('#ss_glow'), 1, { alpha: 0 });
				TweenMax.to($('#ss_spiral'), 0, { left: points[0], top: points[1] });
				TweenMax.to($('#ss_spiral'), 0.7, { scale: 6, rotation: 250 });
				TweenMax.to($('#ss_spiral'), 1, {
					alpha: 0, onComplete: function () {
						resetSpecialSummon();
					}
				});
				playSound(SpecialSummon);
				if (end) {
					endAction();
				}
			}
		});

		checkPlayMDSound(card);
	}

	// Master Duel sound functions removed - replaced with empty stubs
	window.checkPlayMDSound = function (card) {
		// Sound feature removed - do nothing
	}

	window.DBO_playLimitedSound = async function () {
		// Sound feature removed - do nothing
	}
	window.DBO_playPogSound = async function () {
		// Sound feature removed - do nothing
	}
	window.playMDSoundByAttribute = async function (card, attribute, bIgnoreFieldSpell) {
		// Sound feature removed - do nothing
	}

	window.DBO_setFieldSpellPic = function (player, card) {
		if (card == null) {
			$('#field_spell_pic').attr("src", "");
			return;
		}

		if (card.data("face_down")) {
			return;
		}


		var id = card.data("cardfront").data("id");
		var src = card.find(".pic").attr("src")
		src = src.replace("/low-res/", "/card-pics/").replace("/small/", "/card-pics/");
		$("#field_spell_pic > img.top-left").attr("src", src);
		$("#field_spell_pic > img.bottom-right").attr("src", src);
	}

	//rotation WILL affect it
	//rotationY WILL affect it

	window.DBO_onCardHoverLine = function () {
		previewFront($(this).data("card").data("cardfront"));
	}
	window.DBO_addCardHoverLine = function (str, card) {
		if (conceal) {
			return;
		}
		saveDuelVSP();
		let DBO_txt = $('<b>' + str + '</b><br>')

		DBO_txt.data("card", card)
		DBO_txt.hover(DBO_onCardHoverLine);
		$('#duel .cout_txt').append(DBO_txt);
		restoreDuelVSP();
	}
	window.summonToken = function (player, data) {
		awaiting_token = false;
		var tokenNumber = data.token ? data.token : player.token;
		var token = newDuelCard();
		token.data("id", data.id);

		// Dev here, ATK & DEF being set allows you to edit stats by pressing them
		token.data("ATK", 0);
		token.data("DEF", 0);

		token.data("inATK", false);
		token.data("inDEF", true);
		token.data("face_down", false);
		token.data("controller", player);
		token.data("owner", player);
		//token.addChild(token.data("cardfront"));
		//token.removeChild(token.back_mc);
		//token.data("cardfront").data("doNotLoadImage", true);

		//token.data("cardfront").copyCard(player.token.data("cardfront"));
		token.data("cardfront").initializeFromData({
			"name": "Token",
			"treated_as": "Token",
			"effect": "This card can be used as any Token",
			"card_type": "Monster",
			"monster_color": "Token",
			'pic': (TOKEN_IDS['includes'](tokenNumber) ? CARD_TOKENS_START : TOKEN_START) + tokenNumber + '.jpg',
			// Dev here, setting ATK / DEF in order to enable stat editting by clicking them
			"atk": '0',
			"def": '0',
		});
		//token.data("cardfront").data("initialized", false); // Tokens DO cause problems otherwise, as seen at 644 in this replay 12889341


		//token.data("cardfront").setImage();
		player.all_cards_arr.push(token);

		var points = getNextMonsterZone(player, token, data);
		TweenMax.to(token, 0, { left: points[0], top: points[1], rotationY: ABOUT_ZERO, rotation: player.defRot, scale: 0.1485 });
		$('#field').append(token);
		token.onRotate(true);
		playSound(SpecialSummon);
		$('#ss_glow').show();
		$('#ss_spiral').show();
		TweenMax.to($('#ss_glow'), 0, { left: points[0], top: points[1] });
		TweenMax.to($('#ss_glow'), 0.7, { scale: 6, rotation: -250 });
		TweenMax.to($('#ss_glow'), 1, { alpha: 0 });
		TweenMax.to($('#ss_spiral'), 0, { left: points[0], top: points[1] });
		TweenMax.to($('#ss_spiral'), 0.7, { scale: 6, rotation: 250 });
		TweenMax.to($('#ss_spiral'), 1, {
			alpha: 0, onComplete: function () {
				resetSpecialSummon();
				if (duelist && player != Player1()) {
					token.addClass("target");
				}
				endAction();
			}
		});
	}



	window.setMonster = function (player, data) {
		var points;
		var card = getFieldCard(player, data);
		if (!card) {
			card = removeCard(player, data);
			points = getNextMonsterZone(player, card, data);
			playSound(FaceDown);
		}
		else {
			points = [parseInt(card.css("left")), parseInt(card.css("top"))];
			playSound(Flip);
		}


		if (data.log && !data.log.public_log.startsWith("Set card")) {
			if (card.data("controller") != player1) {
				// DBO_GenerateImpermColumn(card, points, false);
			}
		}

		card.data("inDEF", true);
		card.data("face_down", true);
		card.data("counters", 0);
		card.data("negations", 0);
		card.data("cardfront").reinitialize(data.card);
		$('#field').append(card);
		TweenMax.to(card, easeSeconds, {
			left: points[0], top: points[1], scale: 0.1485, rotation: player.defRot, rotationY: 180 + ABOUT_ZERO, ease: Linear.easeNone, onComplete: function () {
				//endAction(); // disabling because endAction is also called in updateXyzMaterials
			}
		});
		updateXyzMaterials(player, card);
	}

	window.setST = function (player, data) {
		if (data.zone == "F-1") {
			setFieldSpell(player, data);
			return;
		}

		var points;
		var card = getFieldCard(player, data);
		if (!card) {
			card = removeCard(player, data);
			points = getNextSTZone(player, card, data);
			playSound(FaceDown);
		}
		else {
			points = [parseInt(card.css("left")), parseInt(card.css("top"))];
			playSound(Flip);
		}



		if (data.log && !data.log.public_log.startsWith("Set card") && !data.log.public_log.startsWith("Set a card")) {
			if (card.data("controller") != player1) {
				// DBO_GenerateImpermColumn(card, points, false);
			}
		}
		card.data("face_down", true);
		card.data("cardfront").reinitialize(data.card);
		$('#field').append(card);
		TweenMax.to(card, easeSeconds, {
			left: points[0], top: points[1], scale: 0.1485, rotation: player.rot, rotationY: 180 + ABOUT_ZERO, ease: Linear.easeNone, onComplete: function () {

				if (viewing)
					updateViewing();

				endAction();
			}
		});
	}

	window.shiftGrave = function (player) {
		if (viewing.indexOf("Graveyard") >= 0 || viewing.indexOf("Secret ") >= 0 || viewing == "DBO Xyz Materials") {
			viewingE(viewing);
			return;
		}
		var gX = 0;
		var gY = 0;
		for (var i = player.grave_arr.length - 1; i > -1; i--) {
			TweenMax.to(player.grave_arr[i], 0, { rotationY: ABOUT_ZERO });
			player.grave_arr[i].css("left", player.graveX + gX);
			player.grave_arr[i].css("top", player.graveY + gY);
			TweenMax.to(player.grave_arr[i], 0, { scale: 0.1485, rotation: player.rot, alpha: 1 });
			gX += player.gX;
			gY += player.gY;
			$('#field').append(player.grave_arr[i]);
			if (i == 0) {
				//player.grave_arr[i].front_mc.autoLoad();
			}
		}
		$('#cig1_txt').text(Player1().grave_arr.length);
		$('#cig2_txt').text(Player2().grave_arr.length);
	}


	window.shiftBanished = function (player) {
		if (viewing == "Banished" || viewing == "Opponent's Banished" || viewing.indexOf("Secret ") >= 0 || viewing == "DBO Xyz Materials") {
			viewingE(viewing);
			return;
		}
		var bX = 0;
		for (var i = player.banished_arr.length - 1; i > -1; i--) {
			if (!player.banished_arr[i].data("face_down")) {
				TweenMax.to(player.banished_arr[i], 0, { rotationY: ABOUT_ZERO });
			}
			else {
				TweenMax.to(player.banished_arr[i], 0, { rotationY: 180 + ABOUT_ZERO });
			}
			player.banished_arr[i].css("left", player.banishedX + bX);
			player.banished_arr[i].css("top", player.banishedY);
			TweenMax.to(player.banished_arr[i], 0, { scale: 0.1485, rotation: player.rot, alpha: 1 });
			bX += player.bX;
			$('#field').append(player.banished_arr[i]);
		}
		$('#cib1_txt').text(Player1().banished_arr.length);
		$('#cib2_txt').text(Player2().banished_arr.length);
	}

	window.viewCards = function (arr, data) {
		console.log('viewCards');
		console.time("viewCards");
		console.log(arr);
		let content = $('#view > .content')[0];

		// Dev here, remove all cards from the previous menu.
		for (let abc = 0; abc < $('#view > .content').find(".card").length; abc++) {
			// Dev here, not easy to explain why [0] instead of [abc], probably because it changes the order immediately when removed.
			$('#view > .content').find(".card")[0].remove()
		}

		var permission = false;
		if (data) {
			if (data.permission) {
				permission = true;
			}
		}
		var viewingX = 43;
		var viewingY = 56;
		if (menu_card) {
			if (menu_card.parent()[0] == $('#view > .content')[0]) {
				removeCardMenu();
			}
			setTimeout(function () {
				if (TweenMax.isTweening(menu_card)) {
					removeCardMenu();
				}
			}, 5);
		}
		if (!$('#view').is(":visible")) {
			$('#view > .content').addClass("unscrollable");
		}
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].hasClass("xyzmaterial")) {
				// updateXyzMaterials is called frequently, causing Xyz Materials to line up. That tween keeps going long after this function executes. So, by killing those tweens, this function is what happens to those cards last.
				TweenMax.killTweensOf(arr[i]);
			}
			if (i == 16) {
				$('#view > .content').removeClass("unscrollable");
			}
			if (data && data.deck && data.deck[i] && viewing != "Secret Deck" && viewing != "DBO Xyz Materials") {
				arr[i].data("cardfront").reinitialize(data.deck[i]);
			}
			//if (viewing == "Opponent's Hand") {
			//	TweenMax.to(arr[i], 0, {rotationY:0});
			//}

			arr[i].css("left", viewingX);
			arr[i].css("top", viewingY); // Do not set these via tween
			TweenMax.to(arr[i], 0, { rotation: 0, scale: 0.1485, rotationY: ABOUT_ZERO });

			//arr[i].data("cardfront").autoLoad();
			if (duelist && arr[i].data("face_down") && player1.banished_arr.indexOf(arr[i]) >= 0 && !simple) {
				arr[i].showFaceDown();
			}
			// Dev here, added Secret Extra Deck to this statement.
			else if (!permission && arr[i].data("face_down") && viewing != "Extra Deck" && viewing != "Secret Extra Deck") {
				arr[i].showFaceDown();
			}
			else if (viewing.indexOf("Public Extra") >= 0 && (arr[i].data("face_down") || !arr[i].data("cardfront").data("pendulum"))) { // some non pendulum monsters were showing in the public extra deck when they shouldn't have, so i added this
				arr[i].showFaceDown();
			}
			//else if (!arr[i].data("cardfront").data("initialized")) {
			else if (arr[i].data("cardfront") && !arr[i].data("cardfront").data("initialized")) {
				arr[i].showFaceDown();
			}
			if (viewing == "Deck" || viewing == "Extra Deck") {
				//arr[i].onRotate(); // TweenMax rotationY:0 takes care of this
			}
			else if (permission) {
				arr[i].onRotate();
			}
			if (viewing == "Opponent's Extra Deck") {
				arr[i].data("cardfront").show();
			}
			viewingX += 70.5;
			if (viewingX > 536.5) {
				viewingX = 43;
				viewingY += 97;
			}

			$(arr[i]).css("display", "block");
			$('#view > .content').append(arr[i]);
		}


		if (viewing == "Extra Deck" && (duelFormat == "gr" || duelFormat == "gu")) {
			$('#view .expand_btn').show();
		}
		else {
			$('#view .expand_btn').hide();
		}


		$('#view').show();
		//$('#view > .content').scrollTop(0); // why was this here? it makes it jump back to the top every time you click a card menu button
		console.timeEnd("viewCards");
	}

	window.DBO_clearPreviousCardsFromContent = function (content) {
		// Dev here, remove old data from the menu.
		for (let abc = 0; abc < content.children.length; abc++) {
			if (content.children[abc].className == "card") {
				content.removeChild(content.children[abc]);
				continue;
			}
			if (content.children[abc].children.length > 0) {
				DBO_clearPreviousCardsFromContent(content.children[abc]);
			}
		}
	}
	window.updateViewing = function () {
		switch (viewing) {
			case "Deck":
				let arr = Player1().main_arr;
				let dummy;
				[arr, dummy] = DBO_CheckDigDeck(arr);
				viewCards(arr);
				break;

			case "Secret Deck":
				DBO_GenerateTrueAllCardsArray();

				viewCards(DBO_GenerateSecretDeck());
				break;
				break;
			case "Graveyard":
			case "Secret GY":
				viewCards(player1.grave_arr);
				break;
			case "Banished":
				viewCards(player1.banished_arr);
				break;
			case "Extra Deck":
				viewCards(Player1().extra_arr);
				break;
			case "Secret Extra Deck":
				if (DBO_GenerateSecretExtraDeck() == null) {
					setTimeout(function () { updateViewing() }, 50);
					return;
				}
				viewCards(DBO_GenerateSecretExtraDeck());
				break;
			case "Opponent's Public Extra Deck":
				viewCards(Player1().opponent.extra_arr);
				break;
			case "Opponent's Extra Deck":
				viewCards(Player1().opponent.extra_arr);
				break;
			case "Opponent's Deck":
				viewCards(Player1().opponent.main_arr);
				break;
			case "Opponent's Graveyard":
			case "Opponent's Secret GY":
				viewCards(player1.opponent.grave_arr);
				break;
			case "Opponent's Banished":
				viewCards(player1.opponent.banished_arr);
				break;
			case "Opponent's Hand":
				viewCards(Player1().opponent.hand_arr);
				break;
			case "Xyz Materials":
				viewCards(viewing_card_with_materials.data("xyz_arr"));
				break;
			case "DBO Xyz Materials":
				if (typeof DBO_lastXyzCard == undefined)
					return;

				viewCards(DBO_GenerateViewXyzMaterials());
				break;
		}
	}

	window.revealAndToExtra = function (player, card, data) {
		$('#duel .cards').append(card);
		TweenMax.set(card, { "z": 0 });
		card.data("cardfront").reinitialize(data.card);
		TweenMax.to(card, easeSeconds, {
			left: 512, top: 280, scale: 0.5, rotation: 0, rotationY: ABOUT_ZERO, onComplete: function () {
				previewCard(card);
				card.data("face_down", true);
				TweenMax.to(card, easeSeconds, {
					left: card.data("owner").extraX, top: card.data("owner").extraY, scale: 0.1485, rotation: card.data("owner").rot, rotationY: 180 + ABOUT_ZERO, delay: 0.5, onStart: function () {
						card.data("owner").extra_arr.push(card);
						addExtraChildren(card.data("owner"));

						// Dev here.
						updateViewing();

					}, onComplete: function () {
						shiftExtra(card.data("owner"));

						// Dev here.
						updateViewing();

						endAction();
					}
				});
			}
		});
		playSound(Reveal);
	}

	window.revealAndToExtraFU = function (player, card, data) {

		$('#duel .cards').append(card);
		TweenMax.set(card, { "z": card.getExtraZ() });
		card.data("cardfront").reinitialize(data.card);
		TweenMax.to(card, easeSeconds, {
			left: 512, top: 280, scale: 0.5, rotation: 0, rotationY: ABOUT_ZERO, onComplete: function () {

				previewCard(card);
				card.data("face_down", false);
				TweenMax.to(card, easeSeconds, {
					left: card.data("owner").extraX, top: card.data("owner").extraY, scale: 0.1485, rotation: card.data("owner").rot, rotationY: ABOUT_ZERO, delay: 0.5, onStart: function () {
						card.data("owner").extra_arr.unshift(card);

						// Dev here.
						updateViewing();
					}, onComplete: function () {
						shiftExtra(card.data("owner"));

						// Dev here.
						updateViewing();

						endAction();
					}
				});
			}
		});
		playSound(Reveal);
	}

	window.DBO_resizeViewingWindow = function () {
		// makes deck viewer lower in height to fit new menu options.
		$("#view").css("top", "80px");

		// Left is unchanged, this is to revert dragging.
		$("#view").css("left", "200px");

		$("#view").css("transform", "scale(1.0, 0.9)");
		// This equals:

		//$("#view .background").css("transform", "scale(1.0, 0.9)")
		//$("#view .content.scrollpane").css("transform", "scale(1.0, 0.9)")
		//$("#view .title_txt").css("transform", "scale(1.0, 0.9)")
		//$("#view .exit_btn").css("transform", "scale(1.0, 0.9)")
		//$("#view .expand_btn").css("transform", "scale(1.0, 0.9)")


		// Negate the changes
		$("#view .content.scrollpane").css("transform", "scale(1.0, 1.11111111111)")
		$("#view .title_txt").css("transform", "scale(1.0, 1.11111111111)")
		$("#view .exit_btn").css("transform", "scale(1.0, 1.11111111111)")
		$("#view .expand_btn").css("transform", "scale(1.0, 1.11111111111)")

		$("#view .content.scrollpane").css("height", "200px").css("top", "48px")
		$("#view .title_txt").css("top", "5px")
		$("#view .exit_btn").css("top", "5px")
		$("#view .expand_btn").css("top", "5px")
	}

	window.viewingE = function (str, data) {
		if (!str || str == "Paused Game") {
			return;
		}

		if (viewing.indexOf("Secret ") >= 0)
			str = viewing;

		var arr = [];

		DBO_GenerateTrueAllCardsArray();

		switch (str) {
			case "Deck":
				arr = Player1().main_arr;

				[arr, data] = DBO_CheckDigDeck(arr, data);
				break;
			case "Deck (Picking Card)":
			case "Deck (Picking 2 Cards)":
			case "Deck (Picking 3 Cards)":
			case "Deck (Picking 4 Cards)":
				arr = Player1().main_arr;
				break;
			case "Secret Deck":
				arr = DBO_GenerateSecretDeck();
				break;
			case "Graveyard":
			case "Secret GY":
				arr = player1.grave_arr;
				break;
			case "Banished":
				arr = player1.banished_arr;
				break;
			case "Extra Deck":
				arr = Player1().extra_arr;
				//arr = Player1().extra_arr.concat();
				//arr.push(?);
				break;
			case "Secret Extra Deck":
				arr = DBO_GenerateSecretExtraDeck();
				break;
			case "Host's Public Extra Deck":
				arr = Player1().extra_arr;
				break;
			case "Opponent's Banished":
				arr = player1.opponent.banished_arr;
				break;
			case "Opponent's Graveyard":
			case "Opponent's Secret GY":
				arr = player1.opponent.grave_arr;
				break;
			case "Opponent's Extra Deck":
			case "Opponent's Public Extra Deck":
				arr = Player1().opponent.extra_arr;
				break;
			case "Opponent's Hand":
				arr = Player1().opponent.hand_arr;
				break;
			case "Opponent's Deck":
				arr = Player1().opponent.main_arr;
				break;
			case "Opponent's Deck (partial)":
			case "Opponent's Deck (Top 3 Cards)":
				for (var i = 0; i < 3; i++) {
					arr.push(Player1().opponent.main_arr[i]);
				}
				break;
			case "Opponent's Deck (Top 5 Cards)":
				for (i = 0; i < 5; i++) {
					arr.push(Player1().opponent.main_arr[i]);
				}
				break;
			case "Opponent's Deck (Top 1 Cards)":
				for (i = 0; i < 1; i++) {
					arr.push(Player1().opponent.main_arr[i]);
				}
				break;
			case "Xyz Materials":
				arr = viewing_card_with_materials.data("xyz_arr");
				break;
			case "DBO Xyz Materials":
				if (typeof DBO_lastXyzCard == undefined)
					return;

				arr = DBO_GenerateViewXyzMaterials();

				break;
		}

		if (!viewing) {
			DBO_resizeViewingWindow();
		}
		viewing = str;

		if (viewing.indexOf("Secret ") < 0 && viewing != "DBO Xyz Materials") {
			$('#view .title_txt').text("Viewing " + str);

			if (Duelist()) {
				$('#status1 .status_txt').text("Viewing " + str);
			}
		}

		viewCards(arr, data);
	}

	window.DBO_CheckDigDeck = function (arr, data) {
		if (typeof window.DBO_DigString === "undefined") {
			return [arr, data];
		}

		window.DBO_DigString = window.DBO_DigString.toLowerCase();

		let digArray = window.DBO_DigString.split("*");

		let finalArr = [];
		let finalData = [].concat(data);
		finalData.deck = [];

		for (let abc = 0; abc < arr.length; abc++) {
			if (data && data.deck && data.deck[abc]) {
				arr[abc].data("cardfront").reinitialize(data.deck[abc]);
			}

			let card = arr[abc];

			let cardName = card.data("cardfront").data("name")

			if (typeof cardName === "undefined")
				continue;

			let lowerCardName = cardName.toLowerCase();

			for (let def = 0; def < digArray.length; def++) {
				if (lowerCardName.includes(digArray[def])) {
					finalArr.push(card);

					if (data && data.deck && data.deck[abc]) {
						finalData.deck.push(data.deck[abc]);
					}
					// Break.
					def = 99999999;
				}
			}
		}

		return [finalArr, finalData];
	}

	window.DBO_RemoveCardFromTrueDeck = function (card) {
		let deckInterval = setInterval(function () {
			// Be patient because DB is a bit broken regarding deck and cards being instantly removed from deck.
			if (actionsQueue.length > 0) {
				return;
			}

			// We can go, clear the interval and move.
			clearInterval(deckInterval);

			let found = true;

			for (let abc = 0; abc < DBO_TrueDeckArr.length; abc++) {
				if (DBO_TrueDeckArr[abc].data("cardfront").data("name") == card.data("cardfront").data("name")) {
					DBO_TrueDeckArr.splice(abc, 1);
					break;
				}
			}
		}, 50);
	}

	window.DBO_AddCardToTrueDeck = function (card) {
		let deckInterval = setInterval(function () {
			// Be patient because DB is a bit broken regarding deck and cards being instantly removed from deck.
			if (actionsQueue.length > 0) {
				return;
			}

			// We can go, clear the interval and move.
			clearInterval(deckInterval);

			let newCard = newDuelCard();

			newCard.data("cardfront").copyCard(card.data("cardfront"));

			DBO_TrueDeckArr.push(newCard);
		}, 50);
	}
	window.DBO_GenerateViewXyzMaterials = function () {
		let cards = [];

		for (let abc = 0; abc < DBO_lastXyzCard.data("xyz_arr").length; abc++) {
			let newCard = newDuelCard();

			newCard.data("cardfront").copyCard(DBO_lastXyzCard.data("xyz_arr")[abc].data("cardfront"));

			newCard.data("controller", player1);
			newCard.data("owner", player1);
			newCard.data("fake_card", true);

			cards.push(newCard);
		}

		return cards;

	}
	window.DBO_findSubstitute = function (card, arr) {

		for (let abc = 0; abc < arr.length; abc++) {
			let target_card = arr[abc];

			if (target_card.data("cardfront").data("name") == card.data("cardfront").data("name") && !target_card.data("fake_card")) {
				return target_card;
			}
		}

		return null;
	}
	window.DBO_GenerateSecretDeck = function () {
		if (DBO_TrueDeckArr.length != player1.main_arr.length) {
			return null;
		}

		return DBO_TrueDeckArr;
	}
	window.DBO_GenerateSecretExtraDeck = function () {
		let cards = [];

		DBO_CheckPlayerZones(true);


		let fieldCards = [];

		for (let abc = 0; abc < DBO_Player1Field.length; abc++) {
			fieldCards.push(DBO_Player1Field[abc].card);
		}

		for (let abc = 0; abc < window.DBO_TrueExtraDeckArr.length; abc++) {
			let card = window.DBO_TrueExtraDeckArr[abc];


			if (typeof card.data("cardfront") === "undefined")
				continue;

			else if (!isExtraDeckCard(card))
				continue;

			else if (card.data("controller") != player1)
				continue;

			else if (isIn(card, fieldCards) >= 0 || isIn(card, player1.hand_arr) >= 0 || isIn(card, player1.grave_arr) >= 0 || isIn(card, player1.banished_arr) >= 0)
				continue;

			cards.push(card);

		}

		if (cards.length != player1.extra_arr.length) {
			return null;
		}


		return cards;
	}

	window.DBO_GenerateTrueAllCardsArray = function () {
		if (viewing == "Deck" || viewing == "Secret Deck") {

			DBO_TrueDeckArr = [];

			for (let abc = 0; abc < player1.main_arr.length; abc++) {
				let newCard = newDuelCard();

				newCard.data("cardfront").copyCard(player1.main_arr[abc].data("cardfront"));

				DBO_TrueDeckArr.push(newCard);
			}
		}
		if (viewing == "Extra Deck" || viewing == "Secret Extra Deck") {
			DBO_TrueExtraDeckArr = [].concat(player1.extra_arr);
		}
	}
	window.DBO_SecretDeckYes = function () {
		if (viewing)
			return;

		else if (player1.main_arr.length <= 0)
			return;

		else if (DBO_GenerateSecretDeck() == null) {
			DBO_addColoredLine("FF0000", "ERROR: Could not generate secret Deck, as the extension couldn't log every card in your Deck.");
			return;
		}

		viewingE("Secret Deck");
	}

	window.DBO_SecretExtraDeckYes = function () {
		if (viewing)
			return;

		else if (player1.extra_arr.length <= 0)
			return;

		else if (DBO_GenerateSecretExtraDeck() == null) {
			DBO_addColoredLine("FF0000", "ERROR: Could not generate secret Extra Deck, as the extension couldn't log every card in your Extra Deck.");
			return;
		}

		viewingE("Secret Extra Deck");
	}
	window.DBO_SecretGYYes = function () {
		if (viewing)
			return;

		if (findCard(["Question"]))
			return;

		else if (player1.grave_arr.length <= 0)
			return;

		viewingE("Secret GY");
	}

	window.DBO_SecretOpponentGYYes = function () {
		if (viewing)
			return;

		if (findCard(["Question"]))
			return;

		else if (player1.opponent.grave_arr.length <= 0)
			return;

		viewingE("Opponent's Secret GY");
	}



	if (mobile) {
		if (typeof DBO_appendedCss === "undefined") {
			DBO_appendedCss = true;

			$('html > head').append($(`<style>
				body
				{
					overscroll-behavior-y: none;
				}
			</style>`));

			$('html > head').append($(`<style>
			html
			{
			min-width: $(swfWidth}px;
			min-height: $(swfHeight}px;
			}
			</style>`));
		}

		if (duelist) {
			if ($("#deck_hidden").length > 0) {
				let menu = showDeckMenu();

				if (typeof menu !== "undefined") {
					let previousMenu = $("#deck_hidden").find(".DBO_selectMenu");

					let DBO_selectMenu = $(`<select class="DBO_selectMenu">`)

					for (let def = 0; def < menu.length; def++) {
						DBO_selectMenu.append($('<option/>', {
							value: menu[def].data,
							text: menu[def].label
						}));
					}

					DBO_selectMenu.css("width", "65.65px");
					DBO_selectMenu.css("height", "93.79px");
					DBO_selectMenu.css("opacity", "0");
					DBO_selectMenu.css("z-index", 16); // #view has z-index of 15
					DBO_selectMenu.val("");

					DBO_selectMenu.change(function () {
						if (window.scrollX != 0 || window.scrollY != 0) {
							window.scroll(0, 0);
						}

						cardMenuClicked(player1.main_arr[0], $(this).val());
						$(this).val("");
					});

					if (previousMenu.length != 0 && DBO_AreSelectMenussEqual(DBO_selectMenu[0], previousMenu[0])) {

					}

					else {
						if (previousMenu.length != 0)
							previousMenu.remove();


						$("#deck_hidden").append(DBO_selectMenu);
					}
				}
			}

			if ($("#extra_hidden").length > 0) {
				let menu = showExtraDeckMenu();

				if (typeof menu !== "undefined") {
					let previousMenu = $("#extra_hidden").find(".DBO_selectMenu");

					let DBO_selectMenu = $(`<select class="DBO_selectMenu">`)

					for (let def = 0; def < menu.length; def++) {
						DBO_selectMenu.append($('<option/>', {
							value: menu[def].data,
							text: menu[def].label
						}));
					}

					DBO_selectMenu.css("width", "65.65px");
					DBO_selectMenu.css("height", "93.79px");
					DBO_selectMenu.css("opacity", "0");
					DBO_selectMenu.css("z-index", 16); // #view has z-index of 15
					DBO_selectMenu.val("");

					DBO_selectMenu.change(function () {
						if (window.scrollX != 0 || window.scrollY != 0) {
							window.scroll(0, 0);
						}

						cardMenuClicked(player1.extra_arr[0], $(this).val());
						$(this).val("");
					});

					if (previousMenu.length != 0 && DBO_AreSelectMenussEqual(DBO_selectMenu[0], previousMenu[0])) {

					}

					else {
						if (previousMenu.length != 0)
							previousMenu.remove();


						$("#extra_hidden").append(DBO_selectMenu);
					}
				}
			}
		}
	}
	// Not mobile
	else {
		if (birdUI && duelist) {
			$('#deck_hidden').off("click")
			$('#deck_hidden').click(function () { DBO_testDoubleClick("View deck") });

			$('#extra_hidden').off("click")
			$('#extra_hidden').click(function () { DBO_testDoubleClick("View ED") });
		}
	}

	//if($("#deck_hidden").length > 0)
	//{
	//		$("#deck_hidden").off("contextmenu");
	//$("#deck_hidden").contextmenu(function()
	//{
	//			if(!DBO_unlockCardMechanics)
	//return;
	//			
	//event.preventDefault();
	//			
	//getConfirmation("Secretly check your Deck?", "This will not shuffle it, and order is random.<br>It won't work unless you viewed Deck once this duel.", DBO_SecretDeckYes, undefined, true);
	//});
	//}

	window.DBO_testDoubleClick = function (command) {
		if (typeof clickCount === "undefined") {
			clickCount = 0;
		}
		clickCount++;

		if (clickCount === 1) {
			singleClickTimer = setTimeout(function () {
				clickCount = 0;
			}, 400);
		}
		else if (clickCount === 2) {
			clearTimeout(singleClickTimer);
			clickCount = 0;

			cardMenuClicked(new Card(), command);
		}
	}
	if ($("#extra_hidden").length > 0) {
		$("#extra_hidden").off("contextmenu");
		$("#extra_hidden").contextmenu(function () {
			if (!DBO_unlockCardMechanics)
				return;

			event.preventDefault();

			getConfirmation("Secretly check your Extra Deck?", "It won't work unless you viewed Extra Deck once this duel.", DBO_SecretExtraDeckYes, undefined, true);
		});
	}

	if ($("#banished_hidden").length > 0) {
		$("#banished_hidden").off("contextmenu");
		$("#banished_hidden").contextmenu(function () {
			if (!DBO_unlockCardMechanics)
				return;

			event.preventDefault();

			if (window.DBO_excavatedArr.length > 0) {
				getComboBox("Where to return excavated cards?", "", ["Top Deck", "Bottom Deck", "GY", "Banish"], 1, DBO_UnexcavateYes);
			}
		});
	}

	if ($("#grave_hidden").length > 0) {
		$("#grave_hidden").off("contextmenu");
		$("#grave_hidden").contextmenu(function () {
			if (!DBO_unlockCardMechanics)
				return;

			event.preventDefault();

			if (window.player1.grave_arr.length > 0) {
				getConfirmation("Secretly check your GY?", "", DBO_SecretGYYes);
			}
		});
	}

	if ($("#opp_grave_hidden").length > 0) {
		$("#opp_grave_hidden").off("contextmenu");
		$("#opp_grave_hidden").contextmenu(function () {
			if (!DBO_unlockCardMechanics)
				return;

			event.preventDefault();

			if (window.player1.opponent.grave_arr.length > 0) {
				getConfirmation("Secretly check your opponent's GY?", "", DBO_SecretOpponentGYYes);
			}
		});
	}

	window.isPendulumAttacker = function (card) {
		let effect = card.data("cardfront").data("pendulum_effect")

		if (typeof effect === 'undefined')
			return false;

		effect = effect.replaceAll("from your ", "")
		effect = effect.replaceAll("while in your ", "")

		if (effect.search(/This card can attack Pendulum/i) != -1)
			return true;

		return false;
	}

	window.isPendulumSneaker = function (card) {
		let effect = card.data("cardfront").data("effect")

		if (typeof effect === 'undefined')
			return false;

		effect = effect.replaceAll("face up", "face-up")
		effect = effect.replaceAll("this monster", "this card")
		effect = effect.replaceAll("to the", "to your")

		if (effect.search(/Add this card to your Extra Deck face-up/i) != -1)
			return true;

		return false;
	}

	window.isEitherTurnAttacker = function (card) {
		let effect = card.data("cardfront").data("effect")

		if (typeof effect === 'undefined')
			return false;

		if (isMonster(player1, card) && effect.search(/This card can attack during your opponent's battle phase/i) != -1)
			return true;

		else if (isST(player1, card) && isPendulumAttacker(card))
			return true;

		return false;
	}

	window.DBO_IsCardKaiju = function (card) {
		let effect = card.data("cardfront").data("effect");
		let effectV2 = effect;

		effect = effect.replaceAll("(", "");
		effect = effect.replaceAll(")", "");
		effect = effect.replaceAll("opponent's side of the field", "opponent's field");
		effect = effect.replaceAll("to your opponent's field", "to the opponent's field");

		effectV2 = effectV2.replaceAll("(", "");
		effectV2 = effectV2.replaceAll(")", "");
		effectV2 = effectV2.replaceAll("opponent's side of the field", "opponent's field");
		effectV2 = effectV2.replaceAll("to your opponent's field", "to the opponent's field");

		// Kaiju || Volcanic Queen & Lava Golem
		if (effect.search(/You can Special Summon this card from your hand to the opponent's field/i) >= 0 || effectV2.search(/Special Summoned from your hand to the opponent's field/i) >= 0) {
			return true;
		}


		// Surgical Striker - H.A.M.P.


		else if (effect.search(/you can Special Summon this card from your hand to either field/i) >= 0) {
			return true;
		}

		// Sphere mode.
		else if (effect.search(/Normal Summon to that side of the field/i) >= 0) {
			return true;
		}

		return false;
	}

	window.DBO_IsCardCannotBeNormalSummonedOrSet = function (card) {
		// Only effect monsters cannot be normal summoned or set.
		if (card.data("cardfront").data("monster_color") != "Effect")
			return false;

		let effect = card.data("cardfront").data("effect");
		let effectV2 = effect;

		effect = effect.replaceAll("/", "or");
		effect = effect.replaceAll("cant", "cannot");
		effect = effect.replaceAll(" ", "");

		if (effect.search(/cannotbenormalsummonedorset/i) >= 0) {
			return true;
		}

		return false;
	}
	window.DBO_IsCardAbleToShuffleToOpponentDeck = function (card) {
		let effect = card.data("cardfront").data("effect")

		if (typeof effect === 'undefined')
			return false;

		if (effect.search(/Shuffle this card face-up into your opponent's Deck/i) != -1)
			return true;


		// What's the distance between Special Summon and Tokens when testing if a card has:
		// "Shuffle x face-up in your opponent's Deck.

		let pos = -1;

		for (let abc = 0; abc < player1.all_cards_arr.length; abc++) {
			let pos = -1;

			if (isMonster(player1, player1.all_cards_arr[abc]) || isST(player1, player1.all_cards_arr[abc]) || (player1.fieldSpell && player1.fieldSpell[0] == player1.all_cards_arr[abc][0])) {
				if (player1.all_cards_arr[abc].data("face_down"))
					continue;

				while (pos < (pos = effect.search(/Shuffle /i, pos + 1))) {

					let relativePos = effect.search(/face-up in your opponent’s Deck/i, pos + 1);


					if (relativePos == -1)
						continue;

					else if (relativePos - pos < 35)
						return true;

				}
			}
		}


		return false;

	}

	window.DBO_IsEaterOfMillions = function (card) {
		if (card.data("cardfront").data("name") == "Eater of Millions")
			return true;

		else if (card.data("cardfront").data("name") == "Eater of Billions")
			return true;

		else if (card.data("cardfront").data("name") == "Eater of Trillions")
			return true;

		else if (card.data("cardfront").data("name") == "Eater of Quadrillions")
			return true;

		return false;
	}

	window.DBO_CountTokensCardCanSummon = function (card) {
		let effect = card.data("cardfront").data("effect");

		if (typeof effect === 'undefined')
			return 0;

		let pos = -1;

		let count = 0;
		// Search the term "Special Summon" as many times as possible in the card.

		if (effect.search("ATK") == -1 || effect.search("DEF") == -1 || effect.search("Level") == -1)
			return 0;

		while (pos < (pos = effect.search(/Special Summon/i, pos + 1))) {
			// What's the distance between Special Summon and Tokens when testing if a card has:
			// "Special Summon x/as many "Card Name Token/s"

			let relativePos = effect.search(/ Tokens"/i, pos + 1);

			if (relativePos == -1) {
				relativePos = effect.search(/ Token"/i, pos + 1);
			}


			if (relativePos == -1)
				continue;


			if (relativePos - pos < 50) {
				let relativePosNum2 = effect.search(/DEF /i, relativePos + 1);

				count = 1;

				let relativePosNum3 = effect.search(/ to your opponent/i, relativePosNum2);

				if (relativePosNum3 != -1) {
					if (relativePosNum3 - relativePosNum2 < 25) {
						count = -1;
					}
				}

				if (!isNaN(effect[pos + 15])) {
					count *= effect[pos + 15];
					break;
				}
				else if (pos + 15 == effect.search(/as many /i, pos + 15)) {
					let player = player1;

					let zonesAvailable = 0;

					if (count < 0)
						player = player1.opponent;

					if (player.m1 == null)
						zonesAvailable++;

					if (player.m2 == null)
						zonesAvailable++;

					if (player.m3 == null)
						zonesAvailable++;

					if (!speed && !rush) {
						if (player.m4 == null)
							zonesAvailable++;

						if (player.m5 == null)
							zonesAvailable++;
					}

					count *= zonesAvailable;
					break;
				}

				continue;
			}
		}

		return count;
	}

	window.DBO_IsCardExchangeOfSpirit = function (card) {
		let effect = card.data("cardfront").data("effect");

		if (typeof effect === 'undefined')
			return false;

		// /word/gi --> /word/Global ( all occurences ) case insensitive.
		effect = effect.replace(/graveyard/gi, "GY");

		if (effect.search(/each player swaps the cards in their GY with the cards in their deck/i) != -1 || effect.search(/swap the cards in your GY with the cards in your deck/i) != -1)
			return true;

		return false;


	}

	window.DBO_IsCardFloodgate = function (card) {
		// Replays...
		if (typeof DBO_MDDetailedCardpool === "undefined")
			return false;

		let obj = DBO_MDDetailedCardpool.find(o => o.id === card.data("cardfront").data("id"));

		if (!obj)
			return false;

		return obj.floodgate;
	}

	window.DBO_IsKonamiIdFloodgate = function (konamiId) {
		// Replays...
		if (typeof DBO_MDDetailedCardpool === "undefined")
			return false;

		let obj = DBO_MDDetailedCardpool.find(o => o.serial_number === konamiId);

		if (!obj)
			return false;

		return obj.floodgate;
	}


	window.DBO_IsKonamiIdHandtrap = function (konamiId) {
		// Replays...
		if (typeof DBO_MDDetailedCardpool === "undefined")
			return false;

		let obj = DBO_MDDetailedCardpool.find(o => o.serial_number === konamiId);

		if (!obj)
			return false;

		return obj.handtrap;
	}

	window.DBO_IsCardAbleToPayHalfLP = function (card) {
		let effect = card.data("cardfront").data("effect");

		if (typeof effect === 'undefined')
			return false;

		// /word/gi --> /word/Global ( all occurences ) case insensitive
		effect = effect.replace(/Life Points/gi, "LP");
		effect = effect.replace(/halve your LP/gi, "pay half your LP");
		effect = effect.replace(/pay half of your LP/gi, "pay half your LP");
		effect = effect.replace(/lose half your/gi, "pay half your");

		if (effect.search(/pay half your LP/i) != -1)
			return true;

		return false;


	}

	window.DBO_IsCardEcclesiaLike = function (card) {
		let effect = card.data("cardfront").data("effect");

		if (typeof effect === 'undefined')
			return false;

		// /word/gi --> /word/Global ( all occurences ) case insensitive
		effect = effect.replace(/You can /gi, "");
		effect = effect.replace(/Monster\(s\)/gi, "Monster");
		effect = effect.replace(/lose half your/gi, "pay half your");
		effect = effect.replace(/Set this card/gi, "Add this card");

		console.log(effect);
		if (effect.search(/During the End Phase, if a Fusion Monster was sent to your GY this turn: Add this card from the GY/i) != -1)
			return true;

		return false;


	}

	window.DBO_IsCardAbleToPayLP = function (card) {
		let effect = card.data("cardfront").data("effect");

		if (typeof effect === 'undefined')
			return false;

		// /word/gi --> /word/Global ( all occurences ) case insensitive
		effect = effect.replace(/Life Points/gi, "LP");
		effect = effect.replace(/by paying/gi, "Pay");

		const DBO_pattern = /Pay\s(\d+)\sLP/i;

		const DBO_match = effect.match(DBO_pattern);
		if (DBO_match) {
			return DBO_match[1];
		}

		return 0;


	}

	window.DBO_IsExcavator = function (card) {
		let effect = card.data("cardfront").data("effect");

		if (typeof effect === 'undefined')
			return false;

		if (effect.search(/excavate the top/i) != -1) {
			if (effect.search(/of your opponent's Deck/i) != -1 && (effect.search(/of your opponent's Deck/i) - effect.search(/excavate the top/i) < 15))
				return 0;

			// Cynet Storm
			if (effect.search(/your Extra Deck/i) != -1 && effect.search(/excavate the top/i) - effect.search(/your Extra Deck/i) < 10)
				return 0;

			// Could be anything, "excavate the top cards of your deck equal to number of rock monsters.
			if (effect.search(/excavate the top cards/i) != -1)
				return 0;

			if (effect.search(/excavate the top card /i) != -1)
				return 1;

			let pos = effect.search(/excavate the top/i);

			// Miss.
			if (isNaN(effect[pos + 17]))
				return 0;

			return effect[pos + 17];
		}

		return false;
	}

	window.DBO_IsFacedownExcavator = function (card) {
		return false;


		let effect = card.data("cardfront").data("effect");

		if (typeof effect === 'undefined')
			return false;

		if (effect.search(/look at the top/i) != -1) {
			if (effect.search(/of your opponent's Deck/i) != -1 && (effect.search(/of your opponent's Deck/i) - effect.search(/look at the top/i) < 15))
				return 0;

			// Cynet Storm
			if (effect.search(/your Extra Deck/i) != -1 && effect.search(/look at the top/i) - effect.search(/your Extra Deck/i) < 10)
				return 0;

			// Could be anything, "excavate the top cards of your deck equal to number of rock monsters.
			if (effect.search(/look at the top cards/i) != -1)
				return 0;

			if (effect.search(/look at the top card /i) != -1)
				return 1;

			let pos = effect.search(/look at the top/i);

			// Miss.
			if (isNaN(effect[pos + 16]))
				return 0;

			return effect[pos + 16];
		}

		return false;
	}

	window.DBO_CountSpellsInGY = function (player) {
		let spellCount = 0;

		for (let abc = 0; abc < player.grave_arr.length; abc++) {
			if (player.grave_arr[abc].data("cardfront").data("card_type") == "Spell") {
				spellCount++;
			}
		}
		return spellCount;
	}

	window.DBO_isCardOnField = function (card) {
		return isMonster(player1, card) || isST(player1, card) || player1.fieldSpell && card[0] == player1.fieldSpell[0] || player1.pendulumLeft && card[0] == player1.pendulumLeft[0] || player1.pendulumRight && card[0] == player1.pendulumRight[0];
	}
	window.DBO_messageStartsWith = function (DBO_str, DBO_substr) {

		let DBO_strToTest = DBO_str.toLowerCase();
		let DBO_substrToTest = DBO_substr.toLowerCase();

		if (DBO_strToTest.indexOf(DBO_substrToTest) == 0)
			return true;

		return false;
	}
	window.DBO_getRandomInt = function (min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * ((max + 1) - min) + min);
	}
	window.DBO_getRandomFloat = function (min, max) {
		return Math.random() * (max - min) + min;
	}
	window.DBO_snipeByArray = async function (opponentArr) {
		for (let abc = 0; abc < opponentArr.length; abc++) {
			let arr = opponentArr[abc];

			// Can't randomly snipe a single card...
			if (arr.length > 1) {
				cardMenuClicked(arr[DBO_getRandomInt(0, arr.length - 1)], "Target");

				await DBO_delay(3)
			}
		}
	}
	window.DBO_delay = function (n) {
		return new Promise(function (resolve) {
			setTimeout(resolve, n * 1000);
		});
	}
	window.DBO_msDelay = function (n) {
		return new Promise(function (resolve) {
			setTimeout(resolve, n);
		});
	}
	window.DBO_crossoutCardYes = async function () {
		if (typeof window.DBO_crossoutCard === "undefined")
			return;

		else if (typeof window.DBO_crossoutCard.data === "undefined")
			return;

		else if (typeof window.DBO_crossoutCard.data("cardfront") === "undefined")
			return;


		cardMenuClicked(DBO_crossoutCard, "Banish");

		let commandName = "/////ban";

		let card;

		let data = {};
		data.fake = true;
		data.username = username;
		data.play = "Duel message";
		data.message = `/////failtofind ${DBO_crossoutCard.data("cardfront").data("name")}`;

		await duelResponse(data);

		while (typeof DBO_duelResponseCardId !== "undefined") {
			data.fake = true;
			data.username = username;
			data.play = "Duel message";
			data.message = `${commandName} ${DBO_crossoutCard.data("cardfront").data("name")}`;

			await duelResponse(data);

			card = DBO_duelResponseCard;

			if (typeof card !== "undefined") {
				data.fake = true;
				data.username = username;
				data.play = "Duel message";
				data.message = `/////failtofind ${DBO_crossoutCard.data("cardfront").data("name")}`;

				await duelResponse(data);

				if (typeof DBO_duelResponseCard !== "undefined") {
					cardMenuClicked(card, "Banish");
				}
				else {
					break;
				}
			}
			else {
				break;
			}
		}
	}
	window.DBO_ReplaceHandYes = async function () {
		if (typeof window.DBO_reloadCard === "undefined")
			return;

		else if (typeof window.DBO_reloadCard.data === "undefined")
			return;

		else if (typeof window.DBO_reloadCard.data("cardfront") === "undefined")
			return;

		cardMenuClicked(DBO_reloadCard, "To GY");

		let count = player1.hand_arr.length;

		for (let abc = 0; abc < player1.hand_arr.length; abc++) {
			cardMenuClicked(player1.hand_arr[abc], "To T Deck");
		}

		cardMenuClicked(new Card(), "Shuffle deck");

		for (let abc = 0; abc < count; abc++) {
			// As tempting as it is to draw from the main_arr, it doesn't matter which cards you use as long as they are unique,
			// and using main_arr will break if the deck is less than the amount of cards to draw BEFORE SHUFFLING THE HAND TO THE DECK.
			// Using a fake card like new Card() will break and limit itself to 2 as the game thinks the player misclicked.
			cardMenuClicked(player1.all_cards_arr[abc], "Draw card")
		}
	}
	window.DBO_InvocationGYYes = async function () {
		if (typeof window.DBO_invocationCard === "undefined")
			return;

		else if (typeof window.DBO_invocationCard.data === "undefined")
			return;

		else if (typeof window.DBO_invocationCard.data("cardfront") === "undefined")
			return

		let aleister = null;

		for (let abc = 0; abc < player1.banished_arr.length; abc++) {
			if (!player1.banished_arr[abc].data("face_down") && player1.banished_arr[abc].data("cardfront").data("name") == "Aleister the Invoker")
				aleister = player1.banished_arr[abc];
		}

		if (aleister == null)
			return;

		cardMenuClicked(DBO_invocationCard, "To T Deck");
		cardMenuClicked(aleister, "To hand");
		cardMenuClicked(new Card(), "Shuffle deck");
	}
	window.DBO_MillSigmaYes = function () {
		let data = {};
		data.fake = true;
		data.username = username;
		data.play = "Duel message";
		data.message = "/send Mathmech Sigma";

		duelResponse(data);
	}
	window.DBO_RunickFountainYes = async function () {
		let limit = 3;
		let cardsFound = [];

		for (let abc = 0; abc < player1.grave_arr.length; abc++) {
			if (player1.grave_arr[abc].data("cardfront").data("card_type") != "Spell" || player1.grave_arr[abc].data("cardfront").data("type") != "Quick-Play")
				continue;

			else if (player1.grave_arr[abc].data("cardfront").data("name").search(/Runick/i) == -1)
				continue;

			cardsFound.push(player1.grave_arr[abc]);
		}

		if (cardsFound.length == 0)
			return;

		if (cardsFound.length > limit)
			cardsFound.length = limit;

		for (let abc = 0; abc < cardsFound.length; abc++) {
			cardMenuClicked(cardsFound[abc], "To B Deck");
		}

		for (let abc = 0; abc < cardsFound.length; abc++) {
			cardMenuClicked(cardsFound[abc], "Draw card");
		}
	}
	window.DBO_NumeronNetworkYes = async function () {
		let DBO_checked = $('#choose_zones_cb').prop("checked")

		$('#choose_zones_cb').checked(false)

		let cardsToSummon = [];
		for (let abc = 0; abc < player1.extra_arr.length; abc++) {
			switch (player1.extra_arr[abc].data("cardfront").data("name")) {
				case "Number 1: Numeron Gate Ekam":
				case "Number 2: Numeron Gate Dve":
				case "Number 3: Numeron Gate Trini":
				case "Number 4: Numeron Gate Catvari":
					cardsToSummon.push(player1.extra_arr[abc])
					break;
			}
		}

		// Remove duplicates. This doesn't appear to like using the original variable.
		let dummy_arr = [];
		dummy_arr = [...new Map(cardsToSummon.map((m) => [m.data("cardfront").data("name"), m])).values()];
		cardsToSummon = [].concat(dummy_arr);

		if (cardsToSummon.length < 4) {
			$('#choose_zones_cb').checked(DBO_checked);

			return;
		}

		let originalLinkRight = linkRight;
		let originalLinkLeft = linkLeft;

		let originalCountMonsters = countMonsters(player1);

		for (let abc = 0; abc < cardsToSummon.length; abc++) {
			if (originalCountMonsters < 5) {
				Send({ "action": "Duel", "play": "SS ATK", "card": cardsToSummon[abc].data("id") });
				originalCountMonsters++;
			}

			else {
				if (!originalLinkRight) {
					originalLinkRight = true;
					originalCountMonsters++;
					Send({ "action": "Duel", "play": "SS ATK", "card": cardsToSummon[abc].data("id"), "zone": "Right Extra Monster Zone" });
				}

				else if (!originalLinkLeft) {
					originalLinkLeft = true;
					originalCountMonsters++;
					Send({ "action": "Duel", "play": "SS ATK", "card": cardsToSummon[abc].data("id"), "zone": "Left Extra Monster Zone" });
				}
			}
		}

		$('#choose_zones_cb').checked(DBO_checked);
	}
	window.DBO_ExchangeSpiritYes = function () {
		if (actionsQueue.length > 10) {
			errorE("Cannot resolve Exchange of the Spirit while 10+ cards are flying around");
			return;
		}

		let DBO_checked = $('#choose_zones_cb').prop("checked")

		$('#choose_zones_cb').checked(false);

		let oldDeck = player1.main_arr.slice();
		let oldGY = player1.grave_arr.slice();

		for (let abc = 0; abc < oldDeck.length; abc++) {
			cardMenuClicked(oldDeck[abc], "Banish");
		}

		for (let abc = 0; abc < oldGY.length; abc++) {
			cardMenuClicked(oldGY[abc], "To ST");

			if (isExtraDeckCard(oldGY[abc]))
				cardMenuClicked(oldGY[abc], "To ED");

			else
				cardMenuClicked(oldGY[abc], "To T Deck");
		}

		for (let abc = 0; abc < oldDeck.length; abc++) {
			cardMenuClicked(oldDeck[abc], "To GY");
		}

		cardMenuClicked(new Card(), "Shuffle deck");
	}
	window.DBO_FiberJarYes = function () {
		if (typeof window.DBO_fiberCard === "undefined")
			return;

		else if (typeof window.DBO_fiberCard.data === "undefined")
			return;

		else if (typeof window.DBO_fiberCard.data("cardfront") === "undefined")
			return

		let jarInterval = setInterval(function () {
			// Be patient before we exceute, to avoid issues like interacting with already interacted cards.
			if (actionsQueue.length > 0) {
				return;
			}

			// We can go, clear the interval and move.
			clearInterval(jarInterval);

			let DBO_checked = $('#choose_zones_cb').prop("checked")

			$('#choose_zones_cb').checked(false);

			let treatAsGY = null;

			if (player1.s3 != null) {
				treatAsGY = player1.s3;
				cardMenuClicked(player1.s3, "To GY");
			}


			for (let abc = 0; abc < player1.all_cards_arr.length; abc++) {
				if (isIn(player1.all_cards_arr[abc], player1.extra_arr) >= 0)
					continue;

				else if (isIn(player1.all_cards_arr[abc], player1.banished_arr) >= 0)
					continue;

				else if (isIn(player1.all_cards_arr[abc], player1.main_arr) >= 0)
					continue;

				else if (player1.all_cards_arr[abc].data("id") == DBO_fiberCard.data("id"))
					continue;


				if (isIn(player1.all_cards_arr[abc], player1.grave_arr) >= 0 || treatAsGY == player1.all_cards_arr[abc]) {
					cardMenuClicked(player1.all_cards_arr[abc], "To ST");

					if (isExtraDeckCard(player1.all_cards_arr[abc]))
						cardMenuClicked(player1.all_cards_arr[abc], "To ED");

					else
						cardMenuClicked(player1.all_cards_arr[abc], "To T Deck");
				}
				else {
					if (isExtraDeckCard(player1.all_cards_arr[abc]))
						cardMenuClicked(player1.all_cards_arr[abc], "To ED");

					else
						cardMenuClicked(player1.all_cards_arr[abc], "To T Deck");
				}
			}

			for (let abc = 0; abc < player2.all_cards_arr.length; abc++) {
				// Cannot access opponent's decks, might as well check our own :D
				if (isIn(player2.all_cards_arr[abc], player1.extra_arr) >= 0)
					continue;

				else if (isIn(player2.all_cards_arr[abc], player2.banished_arr) >= 0)
					continue;

				// Cannot access opponent's decks, might as well check our own :D
				else if (isIn(player2.all_cards_arr[abc], player1.main_arr) >= 0)
					continue;

				else if (player2.all_cards_arr[abc].data("id") == DBO_fiberCard.data("id"))
					continue;

				if (isIn(player2.all_cards_arr[abc], player2.grave_arr) >= 0 || treatAsGY == player2.all_cards_arr[abc]) {
					cardMenuClicked(player2.all_cards_arr[abc], "To ST");

					if (isExtraDeckCard(player2.all_cards_arr[abc]))
						cardMenuClicked(player2.all_cards_arr[abc], "To ED");

					else
						cardMenuClicked(player2.all_cards_arr[abc], "To T Deck");
				}
				else {
					if (isExtraDeckCard(player2.all_cards_arr[abc]))
						cardMenuClicked(player2.all_cards_arr[abc], "To ED");

					else
						cardMenuClicked(player2.all_cards_arr[abc], "To T Deck");
				}
			}

			cardMenuClicked(DBO_fiberCard, "To ST");
			cardMenuClicked(DBO_fiberCard, "To T Deck");

			$('#choose_zones_cb').checked(DBO_checked)

			cardMenuClicked(new Card(), "Shuffle deck");

			DBO_addColoredLine("037F51", "Use /draw5 after your opponent shuffles everything.");
		}, 50);
	}

	window.DBO_UpstartGoblinYes = function () {
		Send({ "action": "Duel", "play": "Life points", "amount": 1000 });
	}

	if (typeof window.DBO_originalToST === "undefined" && typeof window.toST !== "undefined") {
		Function.prototype.clone = function () {
			var that = this;
			var temp = function temporary() { return that.apply(this, arguments); };
			for (var key in this) {
				if (this.hasOwnProperty(key)) {
					temp[key] = this[key];
				}
			}
			return temp;
		};


		window.DBO_originalToST = window.toST.clone();
	}

	window.toST = function (player, data) {
		DBO_originalToST(player, data);

		var card = getFieldCard(player, data);

		if (!card)
			return;

		DBO_CheckIllegalThrust(card, data);
	}
	window.activateST = function (player, data) {
		var points;
		var card = getFieldCard(player, data);
		if (!card) {
			card = removeCard(player, data);
			points = getNextSTZone(player, card, data);
		}
		else {
			points = [parseInt(card.css("left")), parseInt(card.css("top"))];
		}

		card.data("cardfront").reinitialize(data.card);
		card.data("inATK", true);
		card.data("inDEF", false);
		card.data("face_down", false);
		$('#field').append(card);
		TweenMax.to(card, easeSeconds, {
			left: points[0], top: points[1], scale: 0.1485, rotation: player.rot, rotationY: ABOUT_ZERO, ease: Linear.easeNone, onComplete: function () {

				if (viewing)
					updateViewing();

				endAction();
			}
		});

		let lpPay = DBO_IsCardAbleToPayLP(card);

		if (lpPay > 0 && player.username == player1.username) {
			showMinus();
			$('#life_txt').val(lpPay);
		}

		DBO_CheckIllegalThrust(card, data);

		playSound(Activate);

		if (potOfSwitch && (card.data("cardfront").data("name") == "Pot of Greed" || (card.data("cardfront").data("name") == "Sky Striker Mobilize - Engage!" && DBO_CountSpellsInGY(player) >= 3))) {
			DBO_playPogSound();
		}

		// For floogates.
		checkPlayMDSound(card);

		if (cardLogging && card.data("cardfront").data("card_type") == "Trap" && card.data("cardfront").data("effect").search(/if this card was Set before activation and is on the field at resolution, for the rest of this turn all other Spell\/Trap effects in this column are negated/i) != -1) {
			DBO_GenerateImpermColumn(card, points, true);
		}
		questionE(card);
	}

	window.DBO_CheckIllegalThrust = function (card, data) {
		console.log(data);
		if (data.log && data.log.public_log && data.log.public_log.search(/" from Deck/i) < 0)
			return;

		if (DBO_findCardReal(["Triple Tactics Thrust"])) {
			if (card.data("cardfront").data("type") == "Field" || card.data("cardfront").data("type") == "Continuous" || card.data("cardfront").data("type") == "Quick-Play" || card.data("cardfront").data("type") == "Counter") {
				DBO_addColoredLine(`FF0000`, `Make sure you didn't add ${card.data("cardfront").data("name")} with Thrust`);
			}
		}
	}
	// bReal decides if it's an imperm column or an indicator of any spell trap.
	window.DBO_GenerateImpermColumn = function (card, points, bReal, overrideSrcStr) {
		if (!cardLogging)
			return;

		if (typeof window.DBO_counter === "undefined")
			window.DBO_counter = 0;

		DBO_counter++;


		let impermColumn;

		let DBO_src = undefined;

		if (!overrideSrcStr) {
			if (bReal && card.data("cardfront").data("card_type") == "Trap" && card.data("cardfront").data("effect").search(/if this card was Set before activation and is on the field at resolution, for the rest of this turn all other Spell\/Trap effects in this column are negated/i) != -1) {
				DBO_CheckPlayerZones(true);

				for (let abc = 0; abc < DBO_STZones.length; abc++) {
					if (DBO_STZones[abc].card.data("id") == card.data("id")) {
						let realZone = DBO_STZones[abc].zone - 1;

						window.DBO_RealImpermColumns[realZone] = true;
						break;
					};
				}

				impermColumn = $(`<div id="Imperm_Column_Real${DBO_counter}"></div>`)
			}
			else {
				impermColumn = $(`<div id="Imperm_Column${DBO_counter}"></div>`)
			}

			DBO_src = CARD_IMAGES_START + card.data("cardfront").data("id") + '.jpg';
		}
		else {
			impermColumn = $(`<div id="Imperm_Column${DBO_counter}"></div>`)

			DBO_src = DBO_textToImage(overrideSrcStr);
		}

		impermColumn.css("z-index", 20);
		impermColumn.css("left", points[0] - 27);
		impermColumn.css("top", points[1] - 10);
		impermColumn.height(55);
		impermColumn.width(55);


		let impermColumnImage = $(`<img src="${DBO_src}"></img>`)

		impermColumnImage.attr("id", "Imperm_Column");
		impermColumnImage.css("opacity", 0.75);
		impermColumnImage.height(55);
		impermColumnImage.width(55);
		impermColumn.click(function () {
			let DBO_list = document.querySelectorAll("div")

			for (let abc = 0; abc < DBO_list.length; abc++) {
				if (!DBO_list[abc].id.startsWith("Imperm_Column"))
					continue;


				if ($(this).attr("className") != $(DBO_list[abc]).attr("className"))
					continue;

				$(DBO_list[abc]).remove();
			}
		});

		impermColumn.append(impermColumnImage);

		$("#field").append(impermColumn);

		if (!overrideSrcStr) {
			impermColumn.attr("className", card.data("cardfront").data("id"));

			let cardCopy = card.slice(0);

			impermColumn.data("card", cardCopy);
			impermColumn.hover(DBO_onCardHoverLine);
		}
		else {
			impermColumn.attr("className", 69420 + DBO_counter);

			let cardCopy = newDuelCard();

			cardCopy.data("id", DBO_funnyID++);

			cardCopy.data("cardfront").initializeFromData({
				"name": "Note Token",
				"treated_as": "Note Token",
				"effect": overrideSrcStr,
				"card_type": "Monster",
				"monster_color": "Token",
				"pic": DBO_src
			});

			impermColumn.data("card", cardCopy);
			impermColumn.hover(DBO_onCardHoverLine);
		}
	}

	window.DBO_textToImage = function (text) {
		let canvas = document.createElement("canvas");
		let context = canvas.getContext("2d");

		context.fillStyle = "white";
		context.fillRect(0, 0, 350, 350);

		context.fillStyle = "black";
		context.font = "42px MatrixRegularSmallCaps";

		let segments = [];
		segments = text.split(" ");

		// Bring back the spaces.
		for (let abc = 0; abc < segments.length; abc++) {
			segments[abc] = segments[abc] + " ";
		}

		if (segments.length > 1) {
			// Notice the limit where we loop until the second to last element, rather than until the last element.
			for (let abc = 0; abc < segments.length - 1; abc++) {

				if (segments[abc].length + segments[abc + 1].length <= 12) {
					segments[abc] = segments[abc] + segments[abc + 1];
					segments.splice(abc + 1, 1);
					// Return to the beginning.
					abc = 0;
				}
			}
		}

		let x = 15;
		let y = 30;

		for (let abc = 0; abc < segments.length; abc++) {
			context.fillText(segments[abc], x, y);

			y += 35;
		}

		let imageURL = canvas.toDataURL();

		return imageURL;
	}

	window.DBO_CheckPlayerZones = function (filterEmpty) {
		// Zone name is "normalized" to M-1 instead of M2-1 because you cannot place anything in opponent's S&T zones.
		window.DBO_Player1MonsterZones = [];
		window.DBO_Player1STZones = [];
		window.DBO_Player1Field = [];
		window.DBO_Player2MonsterZones = [];
		window.DBO_Player2STZones = [];
		window.DBO_Player2Field = [];
		window.DBO_MonsterZones = [];
		window.DBO_STZones = [];
		window.DBO_Field = [];


		DBO_Player1MonsterZones.push({ zone: 1, zoneName: "M-1", card: player1.m1 });
		DBO_Player1MonsterZones.push({ zone: 2, zoneName: "M-2", card: player1.m2 });
		DBO_Player1MonsterZones.push({ zone: 3, zoneName: "M-3", card: player1.m3 });
		DBO_Player1MonsterZones.push({ zone: 4, zoneName: "M-4", card: player1.m4 });
		DBO_Player1MonsterZones.push({ zone: 5, zoneName: "M-5", card: player1.m5 });

		if (linkLeft && linkLeft.data("controller") == player1) {
			DBO_Player1MonsterZones.push({ zone: 6, zoneName: "Left Extra Monster Zone", card: linkLeft });
		}
		else {
			DBO_Player1MonsterZones.push({ zone: 6, zoneName: "Left Extra Monster Zone", card: undefined });
		}

		if (linkRight && linkRight.data("controller") == player1) {
			DBO_Player1MonsterZones.push({ zone: 7, zoneName: "Right Extra Monster Zone", card: linkRight });
		}
		else {
			DBO_Player1MonsterZones.push({ zone: 7, zoneName: "Right Extra Monster Zone", card: undefined });
		}

		DBO_Player1STZones.push({ zone: 1, zoneName: "S-1", card: player1.s1 });
		DBO_Player1STZones.push({ zone: 2, zoneName: "S-2", card: player1.s2 });
		DBO_Player1STZones.push({ zone: 3, zoneName: "S-3", card: player1.s3 });
		DBO_Player1STZones.push({ zone: 4, zoneName: "S-4", card: player1.s4 });
		DBO_Player1STZones.push({ zone: 5, zoneName: "S-5", card: player1.s5 });
		DBO_Player1STZones.push({ zone: 6, zoneName: "F-1", card: player1.fieldSpell });



		DBO_Player2MonsterZones.push({ zone: 1, zoneName: "M-1", card: player2.m1 });
		DBO_Player2MonsterZones.push({ zone: 2, zoneName: "M-2", card: player2.m2 });
		DBO_Player2MonsterZones.push({ zone: 3, zoneName: "M-3", card: player2.m3 });
		DBO_Player2MonsterZones.push({ zone: 4, zoneName: "M-4", card: player2.m4 });
		DBO_Player2MonsterZones.push({ zone: 5, zoneName: "M-5", card: player2.m5 });

		if (linkLeft && linkLeft.data("controller") == player2) {
			DBO_Player2MonsterZones.push({ zone: 6, zoneName: "Left Extra Monster Zone", card: linkLeft });
		}
		else {
			DBO_Player2MonsterZones.push({ zone: 6, zoneName: "Left Extra Monster Zone", card: undefined });
		}

		if (linkRight && linkRight.data("controller") == player2) {
			DBO_Player2MonsterZones.push({ zone: 7, zoneName: "Right Extra Monster Zone", card: linkRight });
		}
		else {
			DBO_Player2MonsterZones.push({ zone: 7, zoneName: "Right Extra Monster Zone", card: undefined });
		}


		DBO_Player2STZones.push({ zone: 1, zoneName: "S-1", card: player2.s1 });
		DBO_Player2STZones.push({ zone: 2, zoneName: "S-2", card: player2.s2 });
		DBO_Player2STZones.push({ zone: 3, zoneName: "S-3", card: player2.s3 });
		DBO_Player2STZones.push({ zone: 4, zoneName: "S-4", card: player2.s4 });
		DBO_Player2STZones.push({ zone: 5, zoneName: "S-5", card: player2.s5 });
		DBO_Player2STZones.push({ zone: 6, zoneName: "F-1", card: player2.fieldSpell });

		DBO_Player1Field = [].concat(DBO_Player1MonsterZones, DBO_Player1STZones);
		DBO_Player2Field = [].concat(DBO_Player2MonsterZones, DBO_Player2STZones);

		DBO_MonsterZones = [].concat(DBO_Player1MonsterZones, DBO_Player2MonsterZones);
		DBO_STZones = [].concat(DBO_Player1STZones, DBO_Player2STZones);
		DBO_Field = [].concat(DBO_MonsterZones, DBO_STZones);

		if (filterEmpty) {
			window.DBO_Player1MonsterZones = window.DBO_Player1MonsterZones.filter(function (el) {
				return el.card != null;
			});
			window.DBO_Player1STZones = window.DBO_Player1STZones.filter(function (el) {
				return el.card != null;
			});
			window.DBO_Player1Field = window.DBO_Player1Field.filter(function (el) {
				return el.card != null;
			});
			window.DBO_Player2MonsterZones = window.DBO_Player2MonsterZones.filter(function (el) {
				return el.card != null;
			});
			window.DBO_Player2STZones = window.DBO_Player2STZones.filter(function (el) {
				return el.card != null;
			});
			window.DBO_Player2Field = window.DBO_Player2Field.filter(function (el) {
				return el.card != null;
			});
			window.DBO_MonsterZones = window.DBO_MonsterZones.filter(function (el) {
				return el.card != null;
			});
			window.DBO_STZones = window.DBO_STZones.filter(function (el) {
				return el.card != null;
			});
			window.DBO_Field = window.DBO_Field.filter(function (el) {
				return el.card != null;
			});
		}

	}
	window.DBO_cardPoolChanged = function () {
		for (let abc = 0; abc < $('#my_banlists .banlists2 .cardpool_sel')[0].length; abc++) {
			if ($('#my_banlists .banlists2 .cardpool_sel').val() == $('#my_banlists .banlists2 .cardpool_sel')[0][abc].value) {
				$('#my_banlists .banlists2 .cardpool_sel').selectedIndex(abc)
			}
		}

		if ($('#my_banlists .banlists2 .cardpool_sel').val() == "DBO_clipboard") {
			getConfirmation("Make sure you have a .conf list of EDO Pro in your clipboard.", "Important notes:<br>1. This won't delete existing cards<br>2. Slow PCs will freeze until done.", DBO_ClipboardBanlistYes, undefined, true);
			$('#my_banlists .banlists2 .cardpool_sel').selectedIndex(0);
		}
	}

	window.DBO_ClipboardBanlistYes = function () {
		DBO_ClipboardBanlistYesAsync();

	}

	window.DBO_ClipboardBanlistYesAsync = async function () {
		let str = await navigator.clipboard.readText();

		str = str.replaceAll("\r", "");
		let import_arr = str.split("\n");

		let cards = [];

		if (str.length == 0)
			return;

		if ($('#my_banlists .banlists2 .banlist_name_txt').val() == "") {
			errorE("Name is blank");
			return;
		}

		// Maybe it's changed in the meanwhile...
		let final_name = $('#my_banlists .banlists2 .banlist_name_txt').val()

		let optimizing_arr = [];

		for (let abc = 0; abc < import_arr.length; abc++) {
			let passcode = parseInt(import_arr[abc].substring(0, import_arr[abc].indexOf(" ")));

			let limit = parseInt(import_arr[abc].substring(import_arr[abc].indexOf(" "), import_arr[abc].length))

			// For inventory based cardpools
			if (limit > 3)
				limit = 3;

			// Not dealing with anime variants of cards...
			else if (limit == -1)
				continue;

			optimizing_arr[passcode] = limit;
		}

		let forbidden_arr = [];
		let limited_arr = [];
		let semi_limited_arr = [];
		let unlimited_arr = [];

		for (let abc = 0; abc < Cards.length; abc++) {
			// Dev here, this property breaks banlists and gives error "One or more cards are no longer available"		
			if (Cards[abc].hidden)
				continue;

			let passcode = parseInt(Cards[abc].serial_number);

			if (typeof Cards[abc].serial_number !== "undefined" && typeof optimizing_arr[passcode] !== "undefined") {
				let limit = optimizing_arr[passcode];

				if (limit != 0 && limit != 1 && limit != 2 && limit != 3)
					continue;

				switch (parseInt(limit)) {
					case 0:
						forbidden_arr.push({ name: Cards[abc].name, id: Cards[abc].id });
						break;

					case 1:
						limited_arr.push({ name: Cards[abc].name, id: Cards[abc].id });
						break;

					case 2:
						semi_limited_arr.push({ name: Cards[abc].name, id: Cards[abc].id });
						break;

					case 3:
						unlimited_arr.push({ name: Cards[abc].name, id: Cards[abc].id });
						break;
				}
			}
		}


		// Remove duplicates. This doesn't appear to like using the original variable.
		let dummy_arr = [];
		dummy_arr = [...new Map(forbidden_arr.map((m) => [m.name, m])).values()];
		forbidden_arr = [].concat(dummy_arr);

		// Remove duplicates. This doesn't appear to like using the original variable.
		dummy_arr = [];
		dummy_arr = [...new Map(limited_arr.map((m) => [m.name, m])).values()];
		limited_arr = [].concat(dummy_arr);

		// Remove duplicates. This doesn't appear to like using the original variable.
		dummy_arr = [];
		dummy_arr = [...new Map(semi_limited_arr.map((m) => [m.name, m])).values()];
		semi_limited_arr = [].concat(dummy_arr);

		// Remove duplicates. This doesn't appear to like using the original variable.
		dummy_arr = [];
		dummy_arr = [...new Map(unlimited_arr.map((m) => [m.name, m])).values()];
		unlimited_arr = [].concat(dummy_arr);

		for (let abc = 0; abc < forbidden_arr.length; abc++) {
			forbidden_arr[abc] = forbidden_arr[abc].id;
		}
		for (let abc = 0; abc < limited_arr.length; abc++) {
			limited_arr[abc] = limited_arr[abc].id;
		}

		for (let abc = 0; abc < semi_limited_arr.length; abc++) {
			semi_limited_arr[abc] = semi_limited_arr[abc].id;
		}

		for (let abc = 0; abc < unlimited_arr.length; abc++) {
			unlimited_arr[abc] = unlimited_arr[abc].id;
		}

		Send({
			"action": "Save banlist",
			"id": banlistId,
			"name": final_name,
			"extends": ~~$('.banlists2 .extends_sel').val(),
			//"official":~~$('.banlists2 .official_cb').is(":checked"),
			"cardpool": ~~$('.banlists2 .cardpool_sel').val(),
			"tcg": ~~$('.banlists2 .tcg_cb').is(":checked"),
			"ocg": ~~$('.banlists2 .ocg_cb').is(":checked"),
			"min": $('.banlists2 .min_date_cb').is(":checked") ? $('.banlists2 .min_date_dp').val() : null,
			"max": $('.banlists2 .max_date_cb').is(":checked") ? $('.banlists2 .max_date_dp').val() : null,
			"forbidden": {
				"cards": forbidden_arr,
			},
			"limited": {
				"cards": limited_arr,
			},
			"semi_limited": {
				"cards": semi_limited_arr,
			},
			"unlimited": {
				"cards": unlimited_arr,
			}
		});
		showDim();
		unsavedChanges = false;


		banlistBackE();
	}

	window.DBO_FastAddToBanlist = function (card, div) {
		if (div.parents('.banlist_sections').find('.cardfront').filter(function () {
			return $(this).data("id") == card.data("id");
		}).length > 0) {
			return;
		}

		var c = new CardFront();
		c.copyCard(card);
		div.append(c);
		c.setCardName();

	}
	window.DBO_DeckConstructorCardPoolChanged = async function () {
		let currentVal = $(`#search .custom_cb option[value='${$("#search .custom_cb").val()}']`)

		for (let abc = 0; abc < $("#search .combobox.proxy.unselectable").length; abc++) {
			if ($("#search .combobox.proxy.unselectable")[abc].previousSibling.className != "custom_cb")
				continue;

			$("#search .combobox.proxy.unselectable")[abc].innerHTML = $("#search .combobox.proxy.unselectable")[abc].innerHTML.replace($("#search .combobox.proxy.unselectable")[abc].textContent, currentVal.text())

		}

		if ($("#search .custom_cb").val() == "DBO From Clipboard") {
			if (typeof window.DBO_old_cards === "undefined") {
				window.DBO_old_cards = [].concat(Cards);
			}

			Cards.length = 0;

			let str = await navigator.clipboard.readText();

			if (str.length == 0)
				return;

			let import_arr = str.split("\n");

			let cards = [];

			let optimizing_arr = [];

			for (let abc = 0; abc < import_arr.length; abc++) {
				let passcode = parseInt(import_arr[abc].substring(0, import_arr[abc].indexOf(" ")));

				let limit = parseInt(import_arr[abc].substring(import_arr[abc].indexOf(" "), import_arr[abc].length))

				// For inventory based cardpools
				if (limit > 3)
					limit = 3;

				// Not dealing with anime variants of cards...
				else if (limit == -1)
					continue;

				optimizing_arr[passcode] = limit;
			}

			for (let abc = 0; abc < DBO_old_cards.length; abc++) {
				let passcode = parseInt(DBO_old_cards[abc].serial_number);

				if (typeof DBO_old_cards[abc].serial_number !== "undefined" && typeof optimizing_arr[passcode] !== "undefined") {
					let card = jQuery.extend({}, window.DBO_old_cards[abc]);

					card.tcg_limit = optimizing_arr[passcode];
					card.ocg_limit = optimizing_arr[passcode];

					Cards.push(card);
				}
			}
		}
		else if ($("#search .custom_cb").val() == "DBO Floodgates") {
			if (typeof window.DBO_old_cards === "undefined") {
				window.DBO_old_cards = [].concat(Cards);
			}

			let import_arr = [].concat(DBO_old_cards);

			Cards.length = 0;

			for (let abc = 0; abc < import_arr.length; abc++) {
				if (!DBO_IsKonamiIdFloodgate(import_arr[abc].serial_number))
					continue;

				Cards.push(import_arr[abc]);
			}
		}
		else if ($("#search .custom_cb").val() == "DBO Handtraps") {
			if (typeof window.DBO_old_cards === "undefined") {
				window.DBO_old_cards = [].concat(Cards);
			}

			let import_arr = [].concat(DBO_old_cards);

			Cards.length = 0;

			for (let abc = 0; abc < import_arr.length; abc++) {
				if (!DBO_IsKonamiIdHandtrap(import_arr[abc].serial_number))
					continue;

				Cards.push(import_arr[abc]);
			}
		}
		else if ($("#search .custom_cb").val() == "DBO Master Duel") {
			if (typeof window.DBO_old_cards === "undefined") {
				window.DBO_old_cards = [].concat(Cards);
			}

			Cards.length = 0;

			let import_arr = [].concat(DBO_MDCardpool);

			let cards = [];

			let optimizing_arr = [];

			for (let abc = 0; abc < import_arr.length; abc++) {
				let passcode = parseInt(import_arr[abc].substring(0, import_arr[abc].indexOf(" ")));

				let limit = parseInt(import_arr[abc].substring(import_arr[abc].indexOf(" "), import_arr[abc].length))

				// For inventory based cardpools
				if (limit > 3)
					limit = 3;

				// Not dealing with anime variants of cards...
				else if (limit == -1)
					continue;

				optimizing_arr[passcode] = limit;
			}

			for (let abc = 0; abc < DBO_old_cards.length; abc++) {
				let passcode = parseInt(DBO_old_cards[abc].serial_number);

				if (typeof DBO_old_cards[abc].serial_number !== "undefined" && typeof optimizing_arr[passcode] !== "undefined") {
					let card = jQuery.extend({}, window.DBO_old_cards[abc]);

					card.tcg_limit = optimizing_arr[passcode];
					card.ocg_limit = optimizing_arr[passcode];

					Cards.push(card);
				}
			}
		}
		else if ($("#search .custom_cb").val() == "DBO Goat Format") {
			if (typeof window.DBO_old_cards === "undefined") {
				window.DBO_old_cards = [].concat(Cards);
			}

			Cards.length = 0;

			let import_arr = [].concat(DBO_GoatCardpool);

			let cards = [];

			let optimizing_arr = [];

			for (let abc = 0; abc < import_arr.length; abc++) {
				let passcode = parseInt(import_arr[abc].substring(0, import_arr[abc].indexOf(" ")));

				let limit = parseInt(import_arr[abc].substring(import_arr[abc].indexOf(" "), import_arr[abc].length))

				// For inventory based cardpools
				if (limit > 3)
					limit = 3;

				// Not dealing with anime variants of cards...
				else if (limit == -1)
					continue;

				optimizing_arr[passcode] = limit;
			}

			for (let abc = 0; abc < DBO_old_cards.length; abc++) {
				let passcode = parseInt(DBO_old_cards[abc].serial_number);

				if (typeof DBO_old_cards[abc].serial_number !== "undefined" && typeof optimizing_arr[passcode] !== "undefined") {
					let card = jQuery.extend({}, window.DBO_old_cards[abc]);

					card.tcg_limit = optimizing_arr[passcode];
					card.ocg_limit = optimizing_arr[passcode];

					Cards.push(card);
				}
			}
		}
		else if ($("#search .custom_cb").val() == "DBO Edison Format") {
			if (typeof window.DBO_old_cards === "undefined") {
				window.DBO_old_cards = [].concat(Cards);
			}

			Cards.length = 0;

			let import_arr = [].concat(DBO_EdisonCardpool);

			let cards = [];

			let optimizing_arr = [];

			for (let abc = 0; abc < import_arr.length; abc++) {
				let passcode = parseInt(import_arr[abc].substring(0, import_arr[abc].indexOf(" ")));

				let limit = parseInt(import_arr[abc].substring(import_arr[abc].indexOf(" "), import_arr[abc].length))

				// For inventory based cardpools
				if (limit > 3)
					limit = 3;

				// Not dealing with anime variants of cards...
				else if (limit == -1)
					continue;

				optimizing_arr[passcode] = limit;
			}

			for (let abc = 0; abc < DBO_old_cards.length; abc++) {
				let passcode = parseInt(DBO_old_cards[abc].serial_number);

				if (typeof DBO_old_cards[abc].serial_number !== "undefined" && typeof optimizing_arr[passcode] !== "undefined") {
					let card = jQuery.extend({}, window.DBO_old_cards[abc]);

					card.tcg_limit = optimizing_arr[passcode];
					card.ocg_limit = optimizing_arr[passcode];

					Cards.push(card);
				}
			}
		}
		else {
			if (typeof window.DBO_old_cards !== "undefined") {
				Cards = [].concat(window.DBO_old_cards)
			}
		}

		DBO_DeckConstructorSetCardLimit();
	}


	window.exitDeckConstructor = function () {
		gotoMainMenu();
		deckCleanup();
		updateActive(false);

		if (typeof window.DBO_old_cards !== "undefined") {
			Cards = [].concat(window.DBO_old_cards)
		}
	}
	window.DBO_lookupCard = function (str) {
		if (!str) {
			return undefined;
		}
		var card = null;
		for (var i = 0; i < Cards.length; i++) {
			if (Cards[i] == null || Cards[i].name == null) {
				continue;
			}

			// Dev here, this property breaks banlists and gives error "One or more cards are no longer available"		
			if (Cards[i].hidden)
				continue;

			if (Cards[i].name.toLowerCase() == str.toLowerCase()) {
				card = Cards[i];
				break;
			}
			else if (Cards[i].name.toLowerCase().indexOf(str.toLowerCase()) >= 0) {
				card = Cards[i];
			}
		}
		if (card) {
			var cardfront = newCardFront();
			cardfront.initializeFromData(card);
			return cardfront;
		}

		return undefined;
	}

	if (typeof window.DBO_RealImpermColumns === "undefined") {
		window.DBO_RealImpermColumns = [false, false, false, false, false];
	}

	if (typeof window.DBO_TrueDeckArr === "undefined") {
		window.DBO_TrueDeckArr = [];
	}

	if (typeof window.DBO_TrueExtraDeckArr === "undefined") {
		window.DBO_TrueExtraDeckArr = [];
	}

	if (typeof window.DBO_EdisonPreErratas === "undefined") {
		window.DBO_EdisonPreErratas = [];

		DBO_ReadFile(window.DBO_extensionBaseUrl + "edison_pre_erratas.txt", function (data) {
			data = data.replaceAll("\r", "");

			let DBO_arr = data.split("\n");

			for (let abc = 0; abc < DBO_arr.length; abc++) {
				if (DBO_arr[abc][0] == ';' || DBO_arr[abc].length == 0)
					continue;


				// DO NOT EDIT OPTIMIZING_ARR OR IT WILL EDIT Cards[abc] ( I think )
				let obj = {};

				let splitted = DBO_arr[abc].split("```");


				if (!splitted[1])
					console.log(DBO_arr[abc]);

				obj.name = splitted[0];
				obj.effect = splitted[1].replaceAll("///n", "<br>");


				window.DBO_EdisonPreErratas.push(obj);
			}
		}, 'text');
	}







	window.DBO_onSelectMenu = function () {
		let myself = $(this);
		DBO_onSelectMenu2(myself);
	}

	window.DBO_onSelectMenu2 = function (myself) {
		let parentCard = DBO_getCardByIdReal(myself.attr("id"), true, true, true);

		if (parentCard != null) {
			setTimeout(function () {
				window.DBO_testCard = parentCard;
				menu_card = parentCard;

				let data = "".concat(myself.val());

				var option = $('<div class="card_menu_btn"></div>');
				option.data("data", data);
				option.click(cardMenuClickE);
				$('body').append(option);
				option.click();
				myself.val("");

				if (window.scrollX != 0 || window.scrollY != 0) {
					window.scroll(0, 0);
				}
			}, 15);
		}
	}

	window.DBO_swapCardMenuForPlayer = function (player) {
		for (let abc = 0; abc < player.all_cards_arr.length; abc++) {
			if (actionsQueue.length == 0) {
				// Cards in hand are kind of flipped.
				if (!summoning_card || summoning_card.data("id") != player.all_cards_arr[abc].data("id")) {
					let rotY = DBO_getCardRotY(player.all_cards_arr[abc])

					if (rotY != null && rotY != getRotationY(player.all_cards_arr[abc][0])) {
						console.log("Houston we have a problem (if this message is spammed)");
						TweenMax.set(player.all_cards_arr[abc], { rotationY: rotY, ease: Linear.easeNone });
					}
				}

			}
			if (player.all_cards_arr[abc] && typeof player.all_cards_arr[abc].data("negations") === "undefined") {
				player.all_cards_arr[abc].data("negations", 0);
			}
			player.all_cards_arr[abc].find('.content:first').off("mouseover");
			player.all_cards_arr[abc].find('.content:first').mouseover(DBO_cardMenuE);

			player.all_cards_arr[abc].find('.content:first').off("contextmenu");
			player.all_cards_arr[abc].find('.content:first').contextmenu(DBO_contextMenuE);

			// .off("click") ruins targetting.
			player.all_cards_arr[abc].find('.content:first').off("mousedown");

			if (birdUI) {
				player.all_cards_arr[abc].find('.content:first').mousedown(DBO_clickE);
			}


			player.all_cards_arr[abc].find('.content:first').off("mouseleave");
			player.all_cards_arr[abc].find('.content:first').mouseleave(menuOutE);
			player.all_cards_arr[abc].find('.content:first').mouseleave(DBO_mouseLeaveE);

			if (mobile && player.username == player1.username && DBO_unlockCardMechanics) {
				let menu = DBO_cardMenuE2(player.all_cards_arr[abc], true);

				if (typeof menu !== "undefined") {
					// menu[abc].data, menu[abc].label 

					let previousMenu = player.all_cards_arr[abc].find('.content:first').find(".DBO_selectMenu");

					let DBO_selectMenu = $(`<select class="DBO_selectMenu">`)

					for (let def = 0; def < menu.length; def++) {
						DBO_selectMenu.append($('<option/>', {
							value: menu[def].data,
							text: menu[def].label
						}));
					}

					DBO_selectMenu.css("width", "400px")
					DBO_selectMenu.css("height", "580px")
					DBO_selectMenu.css("opacity", "0")
					DBO_selectMenu.css("z-index", 16) // #view has z-index of 15
					DBO_selectMenu.val("");
					DBO_selectMenu.attr("id", player.all_cards_arr[abc].data("id"));

					if (previousMenu.length != 0 && DBO_AreSelectMenussEqual(DBO_selectMenu[0], previousMenu[0]) && DBO_selectMenu.attr("id") == previousMenu.attr("id")) {
						continue;
					}

					else {
						if (previousMenu.length != 0)
							previousMenu.remove();

						DBO_selectMenu.off("change");

						DBO_selectMenu.change(DBO_onSelectMenu);

						player.all_cards_arr[abc].find('.content:first').append(DBO_selectMenu);
					}
				}
				else if (isIn(player.all_cards_arr[abc], player.hand_arr) >= 0) {
					console.log(menu_reason);
				}
			}
		}
	}

	window.setLimits = function () {
		for (var i = 0; i < deck_arr.length; i++) {
			deck_arr[i].setLimit();
		}
		for (i = 0; i < side_arr.length; i++) {
			side_arr[i].setLimit();
		}
		for (i = 0; i < extra_arr.length; i++) {
			extra_arr[i].setLimit();
		}

		DBO_DeckConstructorCardPoolChanged();

	}
	window.DBO_DeckConstructorSetCardLimit = function () {
		// We're currently in https://www.duelingbook.com/deck?id=513 
		if (typeof master !== "undefined" && typeof card_id === "undefined") {
			return;
		}
		let arr = [];

		for (let abc = 0; abc < deck_arr.length; abc++) {
			deck_arr[abc].off("mouseenter");
			deck_arr[abc].off("mouseover");
			deck_arr[abc].mouseover(previewE);

			arr.push(deck_arr[abc])
		}

		for (let abc = 0; abc < side_arr.length; abc++) {
			side_arr[abc].off("mouseenter");
			side_arr[abc].off("mouseover");
			side_arr[abc].mouseover(previewE);

			arr.push(side_arr[abc]);
		}

		for (let abc = 0; abc < extra_arr.length; abc++) {
			extra_arr[abc].off("mouseenter");
			extra_arr[abc].off("mouseover");
			extra_arr[abc].mouseover(previewE);

			arr.push(extra_arr[abc]);
		}

		let optimizing_arr = [];

		for (let abc = 0; abc < Cards.length; abc++) {
			let passcode = Cards[abc].serial_number;

			let tcgLimit = Cards[abc].tcg_limit;
			let ocgLimit = Cards[abc].ocg_limit;

			// For inventory based cardpools
			if (tcgLimit > 3)
				tcgLimit = 3;

			// Not dealing with anime variants of cards...
			else if (tcgLimit == -1)
				continue;

			optimizing_arr[passcode] = { tcgLimit: tcgLimit, ocgLimit: ocgLimit };
		}

		for (let abc = 0; abc < arr.length; abc++) {
			let passcode = parseInt(arr[abc].data("serial_number"));

			if (arr[abc].data("custom")) {
				let cardfrontData = arr[abc];

				cardfrontData.setLimit($('#deck_constructor .ocg_limit_rb').is(":checked"));
			}
			else if (typeof arr[abc].data("serial_number") !== "undefined" && typeof optimizing_arr[passcode] !== "undefined") {
				let tcgLimit = optimizing_arr[passcode].tcgLimit;
				let ocgLimit = optimizing_arr[passcode].tcgLimit;

				if (tcgLimit != 0 && tcgLimit != 1 && tcgLimit != 2 && tcgLimit != 3)
					continue;

				let cardfrontData = arr[abc];

				if (typeof cardfrontData === "undefined")
					continue;

				let oldTcgLimit = cardfrontData.data("tcg_limit");
				let oldOcgLimit = cardfrontData.data("ocg_limit");

				if (oldTcgLimit == tcgLimit && oldOcgLimit == ocgLimit)
					continue;

				cardfrontData.data("tcg_limit", tcgLimit);
				cardfrontData.data("ocg_limit", ocgLimit);

				cardfrontData.setLimit($('#deck_constructor .ocg_limit_rb').is(":checked"));
			}
			else {
				let cardfrontData = arr[abc];

				if (typeof cardfrontData === "undefined")
					continue;

				let oldTcgLimit = cardfrontData.data("tcg_limit");
				let oldOcgLimit = cardfrontData.data("ocg_limit");

				if (oldTcgLimit == 0 && oldOcgLimit == 0)
					continue;

				cardfrontData.data("tcg_limit", 0);
				cardfrontData.data("ocg_limit", 0);

				cardfrontData.setLimit($('#deck_constructor .ocg_limit_rb').is(":checked"));
			}
		}
	}

	if (typeof DBO_swapCardMenuForPlayer == "function" && typeof Cards !== "undefined") {
		DBO_DeckConstructorSetCardLimit();

		if (duelist) {
			DBO_swapCardMenuForPlayer(player1);
			DBO_swapCardMenuForPlayer(player2);

			if (tag_duel) {
				DBO_swapCardMenuForPlayer(player3)
				DBO_swapCardMenuForPlayer(player4)
			}
		}
	}

	if (typeof duelist !== "undefined" && duelist) {
		$('#field_stats > span').css("pointer-events", "auto");

		$('#field_stats > span').off("click");
		$('#field_stats > span').click(editStatsE);

		DBO_GenerateTrueAllCardsArray();
	}

	window.editStatsE = function (e) {
		var edit_stats_card0;
		switch ($(this)[0]) {
			case hm1_txt:
				edit_stats_card0 = player1.m1;
				break;
			case hm2_txt:
				edit_stats_card0 = player1.m2;
				break;
			case hm3_txt:
				edit_stats_card0 = player1.m3;
				break;
			case hm4_txt:
				edit_stats_card0 = player1.m4;
				break;
			case hm5_txt:
				edit_stats_card0 = player1.m5;
				break;
			case om1_txt:
				edit_stats_card0 = player2.m1;
				break;
			case om2_txt:
				edit_stats_card0 = player2.m2;
				break;
			case om3_txt:
				edit_stats_card0 = player2.m3;
				break;
			case om4_txt:
				edit_stats_card0 = player2.m4;
				break;
			case om5_txt:
				edit_stats_card0 = player2.m5;
				break;
			case hl_txt:
				edit_stats_card0 = linkRight;
				break;
			case ol_txt:
				edit_stats_card0 = linkLeft;
				break;
			default:
				return;
		}
		if (!edit_stats_card0) {
			return;
		}
		var active_input = $('#input2 .atk_txt');
		if (edit_stats_card0 == edit_stats_card) {
			//active_input = edit_stats_card0.data("active_input");
		}
		edit_stats_card = edit_stats_card0;
		if (edit_stats_card.data("face_down")) {
			return;
		}
		hideDisplayBoxes();
		$('#input2').show();
		$('#input2 .body_txt').text("Editing stats for " + edit_stats_card.data("cardfront").data("name"));
		$('#input2 .atk_txt').val(edit_stats_card.data("new_atk") ?? edit_stats_card.data("cardfront").data("atk"));
		$('#input2 .def_txt').val(edit_stats_card.data("new_def") ?? edit_stats_card.data("cardfront").data("def"));
		active_input.focus();
		active_input.select();
		showDim();
	}

	if (typeof window.DBO_excavatedArr === 'undefined') {
		window.DBO_excavatedArr = [];
	}

	for (let abc = 0; abc < window.DBO_excavatedArr.length; abc++) {
		// DBO_waitingForAction is automatically set to false when an action is made, to guarantee while we call a banish request, that this won't.
		// won't eat the excavated cards before DB responds to the banish request.
		if (actionsQueue.length == 0 && !window.DBO_waitingForAction && (window.DBO_excavatedArr[abc].data("face_down") || isIn(window.DBO_excavatedArr[abc], player1.banished_arr) < 0)) {
			window.DBO_excavatedArr.splice(abc, 1);
			abc--;
		}
	}

	if (typeof duel_active !== "undefined" && duel_active && !duelist) {
		$('#draw_btn').disable(false);
		$('#draw_btn').val("View Replay");
		$('#draw_btn').show();
	}

	// If DBO_clipboard doesn't exist in select menu of the card pool in a tournament ban list
	if ($("#my_banlists .banlists2 .cardpool_sel option[value='DBO_clipboard']").length <= 0) {
		$('#my_banlists .banlists2 .cardpool_sel').append(new Option("Copy from clipboard", "DBO_clipboard"));
	}

	if ($('#my_banlists .banlists2 .cardpool_sel').length > 0) {
		$('#my_banlists .banlists2 .cardpool_sel').off("change");
		$('#my_banlists .banlists2 .cardpool_sel').change(DBO_cardPoolChanged);
	}


	if (!replay) {
		if (typeof removeButton !== 'undefined' && $('#view .exit_btn').length > 0) {
			removeButton($('#view .exit_btn'))

			$('#view .exit_btn').off("mouseup");
			$('#view .exit_btn').mouseup(DBO_exitViewing);

			$('#view .exit_btn').off("touchend");
			$('#view .exit_btn').on("touchend", DBO_exitViewing);

			$('#view .exit_btn').off("touchstart");

			// For clicking animation
			addButton($('#view .exit_btn'), DBO_FuncDoNothing);
		}

		if (typeof showAbilities !== 'undefined') {
			$('.uploader .ability_btn').off("touchend");
			$('.uploader .ability_btn').on("touchend", showAbilities);
		}

		if (typeof cancelDuel !== 'undefined') {
			$('#hosting .cancel_btn').off("click");
			$('#hosting .cancel_btn').click(DBO_cancelDuel);
			$('#hosting .cancel_btn').click(cancelDuel);
		}

		if (typeof rejectUser !== 'undefined') {
			$('#hosting .reject_btn').off("click");
			$('#hosting .reject_btn').click(rejectUser);
		}

		if (typeof acceptUser !== 'undefined') {
			$('#hosting .accept_btn').off("click");
			$('#hosting .accept_btn').click(DBO_acceptUser);
		}

		if (typeof acceptUser !== 'undefined') {
			$('#hosting .accept_btn').off("dblclick");
			$('#hosting #joinlist').dblclick(DBO_acceptUser);
		}
	}

	if ($("#search .custom_cb option[value='DBO Handtraps']").length == 0) {
		$("#search .custom_cb").append($('<option>', {
			text: "Handtraps",
			value: 'DBO Handtraps'
		}));
	}

	if ($("#search .custom_cb option[value='DBO Floodgates']").length == 0) {
		$("#search .custom_cb").append($('<option>', {
			text: "Floodgates",
			value: 'DBO Floodgates'
		}));
	}

	if ($("#search .custom_cb option[value='DBO Master Duel']").length == 0) {
		$("#search .custom_cb").append($('<option>', {
			text: "Master Duel",
			value: 'DBO Master Duel'
		}));
	}

	if ($("#search .custom_cb option[value='DBO From Clipboard']").length == 0) {
		$("#search .custom_cb").append($('<option>', {
			text: "From Clipboard",
			value: 'DBO From Clipboard'
		}));
	}

	if ($(".attrib_cb option[value='ICE']").length == 0) {
		$(".attrib_cb").append($('<option>', {
			text: "ICE",
			value: 'ICE'
		}));
	}

	if ($(".attrib_cb option[value='NATURE']").length == 0) {
		$(".attrib_cb").append($('<option>', {
			text: "NATURE",
			value: 'NATURE'
		}));
	}

	if ($(".attrib_cb option[value='ELECTRIC']").length == 0) {
		$(".attrib_cb").append($('<option>', {
			text: "ELECTRIC",
			value: 'ELECTRIC'
		}));
	}

	if ($(".attrib_cb option[value='METAL']").length == 0) {
		$(".attrib_cb").append($('<option>', {
			text: "METAL",
			value: 'METAL'
		}));
	}

	if ($('#avatar1 .nsfw_btn').length > 0) {
		$('#avatar1 .nsfw_btn').off("click");
		$('#avatar1 .nsfw_btn').click(DBO_showDuelNSFW);
	}

	if ($('#avatar2 .nsfw_btn').length > 0) {
		$('#avatar2 .nsfw_btn').off("click");
		$('#avatar2 .nsfw_btn').click(DBO_showDuelNSFW);
	}

	if ($('#avatar3 .nsfw_btn').length > 0) {
		$('#avatar3 .nsfw_btn').off("click");
		$('#avatar3 .nsfw_btn').click(DBO_showDuelNSFW);
	}

	if ($('#avatar4 .nsfw_btn').length > 0) {
		$('#avatar4 .nsfw_btn').off("click");
		$('#avatar4 .nsfw_btn').click(DBO_showDuelNSFW);
	}

	if ($('#avatar1 .rating').length > 0) {
		$('#avatar1 .rating').off("click");
		$('#avatar1 .rating').click(DBO_hideDuelNSFW);
	}

	if ($('#avatar2 .rating').length > 0) {
		$('#avatar2 .rating').off("click");
		$('#avatar2 .rating').click(DBO_hideDuelNSFW);
	}

	if ($('#avatar3 .rating').length > 0) {
		$('#avatar3 .rating').off("click");
		$('#avatar3 .rating').click(DBO_hideDuelNSFW);
	}

	if ($('#avatar4 .rating').length > 0) {
		$('#avatar4 .rating').off("click");
		$('#avatar4 .rating').click(DBO_hideDuelNSFW);
	}

	if ($('#end_turn').length > 0) {
		$('#end_turn').off("click");
		$('#end_turn').click(DBO_endTurnE);
	}

	if ($('#start_turn').length > 0) {
		$('#start_turn').off("click");
		$('#start_turn').click(DBO_startTurnE);
	}

	if ($('#search .custom_cb').length > 0) {
		$("#search .custom_cb").off("change");
		$("#search .custom_cb").change(DBO_DeckConstructorCardPoolChanged);
	}


	window.DBO_previewTargetE = function (e) {
		DBO_previewTargetE2(e, $(this))
	}

	window.DBO_previewTargetE2 = function (e, myself) {
		let card = DBO_getCardByIdEverywhereReal(myself.attr("className"));

		if (card == null)
			return;

		$('#preview_txt').text(card.data("cardfront").data("effect"));
		$('#preview_txt').show();

		preview.initializeFromData({
			"name": card.data("cardfront").data("name"),
			"treated_as": card.data("cardfront").data("name"),
			"effect": card.data("cardfront").data("effect"),
			"card_type": "Monster",
			"monster_color": "Token",
			"pic": card.data("cardfront").data("pic")
		});
		preview.clearLimit();
		preview.show();
	}

	window.DBO_funnyID = 69420;

	if ($("#duel #select_zones").length > 0 && $("#ed_select").length <= 0) {
		let ed_select = new MovieClip()

		$("#duel #select_zones").append($(`<div id="ed_select"></div>`)[0]);

		window.ed_select = loadSVGAnimation(ed_select, "ed_select", "zone_select2", 93, 93, 24, true);

		$("#ed_select").append(ed_select)

		// Update in real time if classic.
		//$("#ed_select").css("top", "461px")
		$("#ed_select").css("left", "203px")

		$("#ed_select").hide();
		//$("#ed_select").data("cycle").stop();
	}

	if ($("#duel #select_zones").length > 0 && $("#grave_select").length <= 0) {
		let grave_select = new MovieClip()

		$("#duel #select_zones").append($(`<div id="grave_select"></div>`)[0]);

		window.grave_select = loadSVGAnimation(grave_select, "grave_select", "zone_select2", 93, 93, 24, true);

		$("#grave_select").append(grave_select)

		// Update in real time if classic.
		//$("#grave_select").css("top", "337px")
		//$("#grave_select").css("left", "754px")


		$("#grave_select").hide();
		//$("#grave_select").data("cycle").stop();
	}

	if ($("#duel #select_zones").length > 0 && $("#banished_select").length <= 0) {
		let banished_select = new MovieClip()

		$("#duel #select_zones").append($(`<div id="banished_select"></div>`)[0]);

		window.banished_select = loadSVGAnimation(banished_select, "banished_select", "zone_select2", 93, 93, 24, true);

		$("#banished_select").append(banished_select)

		$("#banished_select").css("top", "245px")
		// Update in real time if classic.
		//$("#banished_select").css("left", "769px")


		$("#banished_select").hide();
		//$("#banished_select").data("cycle").stop();
	}
	if ($("#duel #select_zones").length > 0 && $("#deck_select").length <= 0) {
		let deck_select = new MovieClip()

		$("#duel #select_zones").append($(`<div id="deck_select"></div>`)[0]);

		window.deck_select = loadSVGAnimation(deck_select, "deck_select", "zone_select2", 93, 93, 24, true);

		$("#deck_select").append(deck_select)
		// Update in real time if classic.
		//$("#deck_select").css("top", "463px")
		$("#deck_select").css("left", "768px")

		$("#deck_select").hide();
		//$("#deck_select").data("cycle").stop();
	}
	if ($("#duel #select_zones").length > 0 && $("#hand_select").length <= 0) {
		let hand_select = new MovieClip()

		$("#duel #select_zones").append($(`<div id="hand_select"></div>`)[0]);

		window.hand_select = loadSVGAnimation(hand_select, "hand_select", "zone_select", 93, 93, 24, true);

		$("#hand_select").append(hand_select)

		$("#hand_select").css("top", "552px")
		$("#hand_select").css("left", "438px")
		$("#hand_select").css("z-index", "10")

		$("#hand_select").hide();
		//$("#hand_select").data("cycle").stop();
	}
	if ($("#duel #select_zones").length > 0 && $("#declare_effect_select").length <= 0) {
		let declare_effect_select = new MovieClip()

		$("#duel #select_zones").append($(`<div id="declare_effect_select"></div>`)[0]);

		window.declare_effect_select = loadSVGAnimation(declare_effect_select, "declare_effect_select", "zone_select", 93, 93, 24, true);

		$("#declare_effect_select").append(declare_effect_select)

		$("#declare_effect_select").css("top", "205px")
		$("#declare_effect_select").css("left", "45px")

		$("#declare_effect_select").hide();
		//$("#declare_effect_select").data("cycle").stop();
	}

	if ($("#duel #select_zones").length > 0 && $("#target_select").length <= 0 && duelist) {
		$('html > head').append($(`<style>
			#target_select
			{
				width: 450px;
				height: 630px;
				transform-origin: top left;
				pointer-events: auto;
			}
		</style>`));

		window.DBO_target_card = newDuelCard();

		DBO_target_card.data("id", DBO_funnyID++);

		DBO_target_card.data("cardfront").initializeFromData({
			"name": "Target Token",
			"treated_as": "Target Token",
			"effect": "Press me to target a card.",
			"card_type": "Monster",
			"monster_color": "Token",
			"pic": CARD_IMAGES_START + "10148" + ".jpg"
		});


		TweenMax.to(DBO_target_card, 0, { left: 1035, top: 42, rotationY: ABOUT_ZERO, rotation: player1.rot, scale: 0.1485 });
		$('#duel #select_zones').append(DBO_target_card[0]);

		$('#duel #select_zones').append($(`<div id="target_select"><img src="https://images.duelingbook.com/svg/red_target.svg"></img></div>`)[0]);

		let target = $('#target_select');
		target.css("left", parseInt(DBO_target_card.css("left")));
		target.css("top", parseInt(DBO_target_card.css("top")));
		TweenMax.to(target, 0, { rotation: getRotation(DBO_target_card[0]), scale: getScale(DBO_target_card[0]) });

		DBO_target_card.hide();
		target.hide();

		target.attr("className", DBO_target_card.data("id").toString());
		target.mouseenter(DBO_previewTargetE);
		target.mouseleave(DBO_mouseLeaveE);
	}
	else if (!duelist || typeof DBO_target_card === "undefined" || DBO_target_card.parent().length == 0) {
		if (typeof DBO_target_card !== "undefined") {
			DBO_target_card.remove();
		}

		$("#target_select").remove();
	}


	if ($("#duel #select_zones").length > 0 && $("#atk_position_select").length <= 0 && duelist) {
		$('html > head').append($(`<style>
			#atk_position_select
			{
				width: 450px;
				height: 630px;
				transform-origin: top left;
				pointer-events: auto;
			}
		</style>`));

		window.DBO_atk_position_card = newDuelCard();

		DBO_atk_position_card.data("id", DBO_funnyID++);

		// Changes between ST / monster
		DBO_atk_position_card.data("cardfront").initializeFromData({
			//"name":"ATK Position Token",
			//"treated_as":"ATK Position Token",
			//"effect":"Press me to change a card to ATK position.",
			"card_type": "Monster",
			"monster_color": "Token",
			//"pic":CARD_IMAGES_START + "2319" + ".jpg"
		});



		DBO_atk_position_card.data("skins", [new Image().src = CARD_IMAGES_START + "2319" + ".jpg", new Image().src = CARD_IMAGES_START + "2966" + ".jpg"]);


		TweenMax.to(DBO_atk_position_card, 0, { left: 1035, top: 137, rotationY: ABOUT_ZERO, rotation: player1.rot, scale: 0.1485 });
		$('#duel #select_zones').append(DBO_atk_position_card[0]);

		$('#duel #select_zones').append($(`<div id="atk_position_select"><img src="https://images.duelingbook.com/svg/red_target.svg"></img></div>`)[0]);

		let target = $('#atk_position_select');
		target.css("left", parseInt(DBO_atk_position_card.css("left")));
		target.css("top", parseInt(DBO_atk_position_card.css("top")));
		TweenMax.to(target, 0, { rotation: getRotation(DBO_atk_position_card[0]), scale: getScale(DBO_atk_position_card[0]) });

		DBO_atk_position_card.hide();
		target.hide();

		target.attr("className", DBO_atk_position_card.data("id").toString());
		target.mouseenter("mouseenter", DBO_previewTargetE);
		target.mouseleave(DBO_mouseLeaveE);
	}
	else if (!duelist || typeof DBO_atk_position_card === "undefined" || DBO_atk_position_card.parent().length == 0) {
		if (typeof DBO_atk_position_card !== "undefined") {
			DBO_atk_position_card.remove();
		}

		$("#atk_position_select").remove();
	}

	if ($("#duel #select_zones").length > 0 && $("#def_position_select").length <= 0 && duelist) {
		$('html > head').append($(`<style>
			#def_position_select
			{
				width: 450px;
				height: 630px;
				transform-origin: top left;
				pointer-events: auto;
			}
		</style>`));

		window.DBO_def_position_card = newDuelCard();

		DBO_def_position_card.data("id", DBO_funnyID++);

		DBO_def_position_card.data("cardfront").initializeFromData({
			"name": "DEF Position Token",
			"treated_as": "DEF Position Token",
			"effect": "Press me to change a card to DEF position",
			"card_type": "Monster",
			"monster_color": "Token",
			"pic": CARD_IMAGES_START + "405" + ".jpg"
		});


		TweenMax.to(DBO_def_position_card, 0, { left: 1035, top: 279, rotationY: ABOUT_ZERO, rotation: player1.defRot, scale: 0.1485 });
		$('#duel #select_zones').append(DBO_def_position_card[0]);

		$('#duel #select_zones').append($(`<div id="def_position_select"><img src="https://images.duelingbook.com/svg/red_target.svg"></img></div>`)[0]);

		let target = $('#def_position_select');
		target.css("left", parseInt(DBO_def_position_card.css("left")));
		target.css("top", parseInt(DBO_def_position_card.css("top")));
		TweenMax.to(target, 0, { rotation: getRotation(DBO_def_position_card[0]), scale: getScale(DBO_def_position_card[0]) });

		DBO_def_position_card.hide();
		target.hide();

		target.attr("className", DBO_def_position_card.data("id").toString());
		target.mouseenter("mouseenter", DBO_previewTargetE);
		target.mouseleave(DBO_mouseLeaveE);
	}
	else if (!duelist || typeof DBO_def_position_card === "undefined" || DBO_def_position_card.parent().length == 0) {
		if (typeof DBO_def_position_card !== "undefined") {
			DBO_def_position_card.remove();
		}

		$("#def_position_select").remove();
	}


	if ($("#duel #select_zones").length > 0 && $("#bottom_deck_select").length <= 0 && duelist) {
		$('html > head').append($(`<style>
			#bottom_deck_select
			{
				width: 450px;
				height: 630px;
				transform-origin: top left;
				pointer-events: auto;
			}
		</style>`));

		window.DBO_bottom_deck_card = newDuelCard();

		DBO_bottom_deck_card.data("id", DBO_funnyID++);

		DBO_bottom_deck_card.data("cardfront").initializeFromData({
			"name": "Bottom Deck Token",
			"treated_as": "Bottom Deck Token",
			"effect": "Press me to bottom deck a card",
			"card_type": "Monster",
			"monster_color": "Token",
			"pic": CARD_IMAGES_START + "12976" + ".jpg"
		});

		TweenMax.to(DBO_bottom_deck_card, 0, { left: 1035, top: 300, rotationY: ABOUT_ZERO, rotation: player1.rot, scale: 0.1485 });
		$('#duel #select_zones').append(DBO_bottom_deck_card[0]);

		$('#duel #select_zones').append($(`<div id="bottom_deck_select"><img src="https://images.duelingbook.com/svg/red_target.svg"></img></div>`)[0]);

		let target = $('#bottom_deck_select');
		target.css("left", parseInt(DBO_bottom_deck_card.css("left")));
		target.css("top", parseInt(DBO_bottom_deck_card.css("top")));
		TweenMax.to(target, 0, { rotation: getRotation(DBO_bottom_deck_card[0]), scale: getScale(DBO_bottom_deck_card[0]) });

		DBO_bottom_deck_card.hide();
		target.hide();

		target.attr("className", DBO_bottom_deck_card.data("id").toString());
		target.mouseenter("mouseenter", DBO_previewTargetE);
		target.mouseleave(DBO_mouseLeaveE);
	}
	else if (!duelist || typeof DBO_bottom_deck_card === "undefined" || DBO_bottom_deck_card.parent().length == 0) {
		if (typeof DBO_bottom_deck_card !== "undefined") {
			DBO_bottom_deck_card.remove();
		}

		$("#bottom_deck_select").remove();
	}

	if ($("#duel #select_zones").length > 0 && $("#overlay_select").length <= 0 && duelist) {
		$('html > head').append($(`<style>
			#overlay_select
			{
				width: 450px;
				height: 630px;
				transform-origin: top left;
				pointer-events: auto;
			}
		</style>`));

		window.DBO_overlay_card = newDuelCard();

		DBO_overlay_card.data("id", DBO_funnyID++);

		DBO_overlay_card.data("cardfront").initializeFromData({
			"name": "Overlay Token",
			"treated_as": "Overlay Token",
			"effect": "Press me to overlay a card.",
			"card_type": "Monster",
			"monster_color": "Token",
			"pic": CARD_IMAGES_START + "11089" + ".jpg"
		});


		TweenMax.to(DBO_overlay_card, 0, { left: 1035, top: 395, rotationY: ABOUT_ZERO, rotation: player1.rot, scale: 0.1485 });
		$('#duel #select_zones').append(DBO_overlay_card[0]);

		$('#duel #select_zones').append($(`<div id="overlay_select"><img src="https://images.duelingbook.com/svg/overlay.svg"></img></div>`)[0]);

		let target = $('#overlay_select');
		target.css("left", parseInt(DBO_overlay_card.css("left")));
		target.css("top", parseInt(DBO_overlay_card.css("top")));
		TweenMax.to(target, 0, { rotation: getRotation(DBO_overlay_card[0]), scale: getScale(DBO_overlay_card[0]) });

		DBO_overlay_card.hide();
		target.hide();

		target.attr("className", DBO_overlay_card.data("id").toString());
		target.mouseenter(DBO_previewTargetE);
		target.mouseleave(DBO_mouseLeaveE);
	}
	else if (!duelist || typeof DBO_overlay_card === "undefined" || DBO_overlay_card.parent().length == 0) {
		if (typeof DBO_overlay_card !== "undefined") {
			DBO_overlay_card.remove();
		}

		$("#target_select").remove();
	}

	if ($('#select_zones div').length > 0) {
		$('#select_zones div').off("click");
		$('#select_zones div').click(function () {
			// Timeout to fix exactly Overlay and nothing else.

			let myself = $(this);
			setTimeout(function () {
				let wasFaceup = !myself.data("face_down");

				DBO_chooseZone(myself);
			}, 15);
		});
	}

	if (typeof DBO_addedCTRLFix === "undefined") {
		DBO_addedCTRLFix = true;

		$('html').mousemove(function (e) {
			if (!e) e = window.event;

			if (e.ctrlKey) {
				DBO_keys[17] = true;
			}
			else {
				DBO_keys[17] = false;
			}
		});
	}

	// Code for dragging view deck & pressing keys on the document.
	if ($('#view').length > 0) {

		jQuery(document).off('keydown');
		jQuery(document).on('keydown', DBO_OnKeyDown);

		jQuery(document).off('keyup');
		jQuery(document).on('keyup', DBO_OnKeyPressed);

		if (!mobile) {
			$('#view').draggable({ distance: "75", cursor: "move", helper: "title_txt", cursorat: { top: "50" }, cancel: ".background,.exit_btn,.os-scrollbar,.content.scrollpane,.content,.card,.cardback,.cardfront,.DBO_selectMenu" });
		}

		$("#view .title_txt").css("cursor", "move")
	}

	// We're currently in https://www.duelingbook.com/card?id=513 
	if (typeof master !== "undefined" && typeof card_id !== "undefined") {
		if (typeof DBO_madePSCT === "undefined") {
			DBO_madePSCT = true;

			let nullName = "";

			let cardfront = my_card;

			let levelStr = "LEVEL: ";

			if (cardfront.data("monster_color") == "Xyz")
				levelStr = "RANK: ";


			if (cardfront.data("pendulum")) {
				preview_txt.html("<b>" + levelStr + cardfront.data("level") + "<br>" + "Pendulum Effect:</b><br>" + DBO_MakePSCTColorOnEffect(cardfront, nullName, escapeHTML(cardfront.data("pendulum_effect"))) + '<br><br>' + "<b>Monster Effect:</b><br>");
				if (cardfront.data("monster_color") == "Normal") {
					preview_txt.append("<i>" + escapeHTML(cardfront.data("effect")) + "</i>");
				} else {
					preview_txt.append(DBO_MakePSCTColorOnEffect(cardfront, nullName, escapeHTML(cardfront.data("effect"))));
				}
			}
			else if (cardfront.data("rush") && cardfront.data("monster_color") != "Normal") {
				preview_txt.html(escapeHTML(cardfront.data("effect")).replace('[Requirement]', '<b>[Requirement]</b>').replace('<br>[Effect]', '<br><b>[Effect]</b>').replace('<br>[Continuous Effect]', '<br><b>[Continuous Effect]</b>').replace('<br>[Multi-Choice Effect]', '<br><b>[Multi-Choice Effect]</b>').replace('[REQUIREMENT]', '<b>[REQUIREMENT]</b>').replace('<br>[EFFECT]', '<br><b>[EFFECT]</b>').replace('<br>[CONTINUOUS EFFECT]', '<br><b>[CONTINUOUS EFFECT]</b>').replace('<br>[MULTI-CHOICE EFFECT]', '<br><b>[MULTI-CHOICE EFFECT]</b>'));
			}
			else {
				if (cardfront.data("monster_color") == "Normal") {
					preview_txt.html("<b>" + levelStr + cardfront.data("level") + "</b><br>" + "<i>" + escapeHTML(cardfront.data("effect")) + "</i>");
				}
				else if (cardfront.data("level") > 0 && cardfront.data("monster_color") != "Link") {
					preview_txt.html("<b>" + levelStr + cardfront.data("level") + "</b><br>" + DBO_MakePSCTColorOnEffect(cardfront, nullName, escapeHTML(cardfront.data("effect"))));
				}
				else if (cardfront.data("card_type") == "Skill") {
					preview_txt.html(escapeHTML(cardfront.data("pendulum_effect")) + "<br><br>" + escapeHTML(cardfront.data("effect")));
				}
				else {
					preview_txt.html(DBO_MakePSCTColorOnEffect(cardfront, nullName, escapeHTML(cardfront.data("effect"))));
				}
			}
		}
	}

	// For creating fake cards as fake cards cannot be caught with swapCardMenu.
	window.newDuelCard = function (player) {
		var card = getRecycledCard();
		if (!card) {
			card = new Card();
		}
		if (automatic) {
			card.contextmenu(duelCardDownE);
		}
		card.off("mouseenter click");
		card.on("mouseenter click", previewE);
		if (duelist) {

			card.find('.content:first').mouseover(DBO_cardMenuE);
			card.find('.content:first').contextmenu(DBO_contextMenuE);

			if (birdUI) {
				card.find('.content:first').mousedown(DBO_clickE);
			}
			card.find('.content:first').mouseleave(DBO_mouseLeaveE);
			//card.find('.content:first').mouseleave(menuOutE);
		}
		card.find('.content:first').mouseleave(menuOutE);
		card.find('.cardfront').hide();

		if (admin || adjudicator) {
			if (!automatic) {
				card.addClass("target");

			}
		}
		card.click(targetCard);
		card.data("controller", player);
		card.data("owner", player);
		TweenMax.to(card, 0, { rotationY: 180 + ABOUT_ZERO, scale: 0.1485 });
		return card;
	}

}
