/**
 * 客户端持久存储
 */
Ext.apply(divo, {
	save : function(name, value) {
		divo.setCookie(name, value)
	},
	find : function(name) {
		return divo.getCookie(name)
	},
	remove : function(name,domain) {
		divo.delCookie(name,domain)
	},
	//private
	setCookie : function(name, value) {
		var Days = 365 * 10
		var exp = new Date()
		exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000)
		document.cookie = name + "=" + escape(value) + ";expires="
				+ exp.toGMTString()
	},
	//private
	getCookie : function(name) {
		var arr = document.cookie.match(new RegExp("(^| )" + name
				+ "=([^;]*)(;|$)"))
		if (arr != null)
			return unescape(arr[2])
		return null
	},
	//private
	delCookie : function(name,domain) {
		var exp = new Date()
		exp.setTime(exp.getTime() - 10000)
		var cval = divo.getCookie(name)
		if (!cval) return
		if (!domain)
			document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString()
		else	
			document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString() +";domain="+domain
	}
	
})

// EOP
