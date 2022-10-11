const cryptic_auth = (function (undefined) {
	let self = {};
	// Sha256 implementation by: https://github.com/geraintluff/sha256
	let sha256 = function sha256(ascii) {
		"use strict";
		function rightRotate(value, amount) {
			return (value>>>amount) | (value<<(32 - amount));
		};
		
		let mathPow = Math.pow;
		let maxWord = mathPow(2, 32);
		let lengthProperty = 'length';
		let i, j; // Used as a counter across the whole file
		let result = '';

		let words = [];
		let asciiBitLength = ascii[lengthProperty]*8;
		
		//* caching results is optional - remove/add slash from front of this line to toggle
		// Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
		// (we actually calculate the first 64, but extra values are just ignored)
		let hash = sha256.h = sha256.h || [];
		// Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
		let k = sha256.k = sha256.k || [];
		let primeCounter = k[lengthProperty];
		/*/
		let hash = [], k = [];
		let primeCounter = 0;
		//*/

		let isComposite = {};
		for (let candidate = 2; primeCounter < 64; candidate++) {
			if (!isComposite[candidate]) {
				for (i = 0; i < 313; i += candidate) {
					isComposite[i] = candidate;
				}
				hash[primeCounter] = (mathPow(candidate, .5)*maxWord)|0;
				k[primeCounter++] = (mathPow(candidate, 1/3)*maxWord)|0;
			}
		}
		
		ascii += '\x80'; // Append '1' bit (plus zero padding)
		while (ascii[lengthProperty]%64 - 56) ascii += '\x00'; // More zero padding
		for (i = 0; i < ascii[lengthProperty]; i++) {
			j = ascii.charCodeAt(i);
			if (j>>8) return; // ASCII check: only accept characters in range 0-255
			words[i>>2] |= j << ((3 - i)%4)*8;
		}
		words[words[lengthProperty]] = ((asciiBitLength/maxWord)|0);
		words[words[lengthProperty]] = (asciiBitLength)
		
		// process each chunk
		for (j = 0; j < words[lengthProperty];) {
			let w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
			let oldHash = hash;
			// This is now the "working hash", often labelled as variables a...g
			// (we have to truncate as well, otherwise extra entries at the end accumulate
			hash = hash.slice(0, 8);
			
			for (i = 0; i < 64; i++) {
				let i2 = i + j;
				// Expand the message into 64 words
				// Used below if 
				let w15 = w[i - 15], w2 = w[i - 2];

				// Iterate
				let a = hash[0], e = hash[4];
				let temp1 = hash[7]
					+ (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
					+ ((e&hash[5])^((~e)&hash[6])) // ch
					+ k[i]
					// Expand the message schedule if needed
					+ (w[i] = (i < 16) ? w[i] : (
							w[i - 16]
							+ (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15>>>3)) // s0
							+ w[i - 7]
							+ (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2>>>10)) // s1
						)|0
					);
				// This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
				let temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) // S0
					+ ((a&hash[1])^(a&hash[2])^(hash[1]&hash[2])); // maj
				
				hash = [(temp1 + temp2)|0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
				hash[4] = (hash[4] + temp1)|0;
			}
			
			for (i = 0; i < 8; i++) {
				hash[i] = (hash[i] + oldHash[i])|0;
			}
		}
		
		for (i = 0; i < 8; i++) {
			for (j = 3; j + 1; j--) {
				let b = (hash[i]>>(j*8))&255;
				result += ((b < 16) ? 0 : '') + b.toString(16);
			}
		}
		return result;
	};

	function pos_mod(a,b){
		let res = a.mod(b);
		return res.greater(0) ? res : res.add(b);
	}

	function inverse_mod(a, m){
		"use strict";
		if( a.lesser(0) || m.lesserOrEquals(a)){
			a = pos_mod(a,m);
		}

		let c = a;
		let d = m;
		let uc = new bigInt(1);
		let vc = new bigInt(0);
		let ud = new bigInt(0);
		let vd = new bigInt(1);
		let q, _uc, _vc;
		let tmp;

		while(c.notEquals(0)){
			tmp = d.divmod(c);
			d = c;
			q = tmp.quotient;
			c = tmp.remainder;
			_uc = ud.minus(q.multiply(uc));
			_vc = vd.minus(q.multiply(vc));
			ud = uc;
			vd = vc;
			uc = _uc;
			vc = _vc;
		}

		if(d.notEquals(1)) throw("d should === 1");

		if(ud > 0){
			return ud;
		}else{
			return ud.plus(m);
		}
	}

	function point(x, y, order=undefined){
		let self = this;

		self.x = x;
		self.y = y;
		self.order = order;

		self.equal = function(other){
			return self.x === other.x && self.y === other.y;
		}

		self.add = function(other){
			if(other.equal(INFINITY)){
				return self;
			}
			if(self.equal(INFINITY)){
				return other;
			}
			if(self.x.equals(other.x)){
				if (pos_mod(self.y.add(other.y), selected_curve["p"]).equals(0)){
					return INFINITY;
				}else{
					return self.double();
				}
			}

			let p = selected_curve["p"];
			let l = pos_mod(((other.y.minus(self.y)).multiply(inverse_mod(other.x.minus(self.x), p))), p)

			let x3 = pos_mod(l.multiply(l).minus(self.x).minus(other.x),p);
			let y3 = pos_mod(l.multiply(self.x.minus(x3)).minus(self.y),p);
			return new point(x3, y3);
		}

		self.mul = function(other){
			"use strict";
			let leftmost_bit = function(x){
			if(!x.greater(0)) throw("Error x >= 0");
					let result = new bigInt(1);
				while(result.lesserOrEquals(x)){
					result = result.multiply(2);
				}
				return result.divide(2);
			}

			let e = other;
			if(self.order !== undefined){
				e = pos_mod(e,self.order);
			}
			if(e.equals(0)){
				return INFINITY;
			}
			if(self.equal(INFINITY)){
				return INFINITY;
			}

			let e3 = e.multiply(3);
			let negative_self = new point(self.x, self.y.multiply(-1), self.order);
			let i = leftmost_bit(e3).divide(2);
			let result = self;

			while(i.greater(1)){
				result = result.double();
				if (((e3.and(i)).notEquals(0)) && ((e.and(i))).equals(0)){
					result = result.add(self);
				}
				if (e3.and(i).equals(0) && (e.and(i)).notEquals(0)){
					result = result.add(negative_self);
				}
				i = i.divide(2);
			}

			return result	
		}

		self.double = function(){
			"use strict";
			if(self.equal(INFINITY)){
				return INFINITY;
			}

			let p = selected_curve["p"];
			let a = selected_curve["a"];

			let l = pos_mod(((self.x.multiply(3).multiply(self.x).add(a)).multiply(inverse_mod(self.y.multiply(2), p))),p);
			let x3 = pos_mod((l.multiply(l).minus(self.x.multiply(2))),p);
			let y3 = pos_mod(l.multiply(self.x.minus(x3)).minus(self.y),p);

			return new point(x3, y3);
		}

		self.toString = function(){
			return self.x+","+self.y;
		}
	}
	let alphabet = "0123456789abcdefghijklmnopqrstuvwxyz`~!@#$%^&*()_+-={}|[]:;,>.?/";

	function digest(input){
		return new bigInt(sha256(input).substring(0,32), 16);
	}

	self.get_secret_key = function(password){
		return new bigInt(sha256(password), 16);
	}

	self.get_public_key = function(secret_key){
		let pub_k = selected_curve.generator.mul(secret_key);

		return pub_k.x.toString(16)+","+pub_k.y.toString(16);
	}

	self.sign_message = function(secret_key, message){
		"use strict";
		let digest_num = digest(message);
		let random_num = new Uint16Array(32);
		crypto.getRandomValues(random_num);
		let random_k = new bigInt(Array.prototype.map.call(random_num, x => ('00' + x.toString(16)).slice(-2)).join(''), 16);

		let s, r;
		do{
			let n = selected_curve["order"]
			let k = pos_mod(random_k, n);
			let p1 = selected_curve["generator"].mul(k);
			r = pos_mod(p1.x,n);
			s = pos_mod(inverse_mod(k, n).multiply(pos_mod(digest_num.plus(secret_key.multiply(r)),n)),n);

		}while(r.equals(0) || s.equals(0));
		return r.toString(16)+","+s.toString(16);
	}

	self.verify_message = function(public_key, message, signature){
		"use strict";
		let digest_num = digest(message);
		let sig = signature.split(',');
		let r = new bigInt(sig[0], 16);
		let s = new bigInt(sig[1], 16);

		let G = selected_curve["generator"];
		let n = selected_curve["order"];
		if(r.lesser(1) || r.greater(n.minus(1))){
			return false;
		}
		if(s.lesser(1) || s.greater(n.minus(1))){
			return false;
		}
		let c = inverse_mod(s, n);
		let u1 = pos_mod((digest_num.multiply(c)),n);
		let u2 = pos_mod((r.multiply(c)),n);
		let pkey = public_key.split(','); 
		let xy = G.mul(u1).add(new point(new bigInt(pkey[0], 16), new bigInt(pkey[1], 16)).mul(u2));
		let v = pos_mod(xy.x, n);
		return v.equals(r);
	}

	let INFINITY = new point(undefined, undefined);

	/* Secp256k1 aka the BitCoin curve */
	let selected_curve = {
		"p": new bigInt("fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f", 16), 
		"a": new bigInt("0000000000000000000000000000000000000000000000000000000000000000", 16), 
		"order": new bigInt("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", 16), 
		"generator": new point(
			new bigInt("79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798", 16),
			new bigInt("483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8", 16), 
			new bigInt("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", 16))
	}
	return self;
})();
