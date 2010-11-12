/* --------- 扩展 JavaScript String 类 ------------- */
String.prototype.ltrim = function() {
	return this.replace(/(^\s*)/g, "");
}
String.prototype.rtrim = function() {
	return this.replace(/(\s*$)/g, "");
}
String.prototype.trim = function() {
	var re = /^\s+|\s+$/g;
	return function() {
		return this.replace(re, "");
	};
}();
String.prototype.ellipse = function(maxLength){
    if(this.length > maxLength){
        return this.substr(0, maxLength-3) + '...';
    }
    return this;
};

/**
 * String.pad(length: Integer, [substring: String = " "], [type: Integer = 0]):
 * String type: 0 = left, 1 = right and 2 = both sides
 */
String.prototype.pad = function(l, s, t) {
	return s || (s = " "), (l -= this.length) > 0 ? (s = new Array(Math.ceil(l
			/ s.length)
			+ 1).join(s)).substr(0, t = !t ? l : t == 1 ? 0 : Math.ceil(l / 2))
			+ this + s.substr(0, l - t) : this;
} // Thanks: http://snippets.dzone.com/posts/show/900

String.prototype.startsWith = function(s) {
	return this.indexOf(s) == 0;
}
String.prototype.endsWith = function(str) {
	return (this.match(str + "$") == str)
}
//Thanks: http://www.moon-soft.com/doc/38917.htm
String.prototype.getHzLength = function(){
	var arr = this.match(/[^\x00-\xff]/ig)
	return this.length+(arr==null?0:arr.length)
}
//Thanks: http://topic.csdn.net/t/20020419/14/660320.html
String.prototype.brkLine = function(charlen) {

	s = ""
	l = 0;
	p = 0;
	for (i = 0; i < this.length; i++) {
		a = this.charAt(i);
		s += a;
		if (p != 0) {
			if (a == ">")
				p = 0;
		} else {
			if (a != "<") {

				if (!/^[\x00-\xff]/.test(a))
					l++;
				l++;

				if (l >= charlen) {
					s += "<br />";
					l = 0;
				}
			} else if (this.substr(i, 4).toLowerCase() == "<br />") {
				s += "br>";
				i += 4;
				l = 0;
			} else
				p = 1;

		}
	}
	return s;
};
String.prototype.ellipse = function(maxLength,showDots){
    if(this.getHzLength() > maxLength){
		var s = this.brkLine(maxLength)
		return s.split('<br />')[0]+(showDots==undefined?'...':'')
    }
    return this;
};

//EOP
