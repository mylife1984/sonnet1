Ext.ns("divo.home")

divo.home = function() {

	return {
		clearRememberUserInfo : function() {
			var user_remember = divo.utils.base64.encode("user_remember")
			var user_loginName = divo.utils.base64.encode("user_loginName")
			var user_password  = divo.utils.base64.encode("user_password")
			divo.remove(user_remember)
			divo.remove(user_loginName)
			divo.remove(user_password)
		},
		clearAuthInfo : function() {
			divo.remove(divo.TOKEN_KEY)
			divo.remove(divo.AUTH_KEY)
		}
	} 

}()
// EOP

