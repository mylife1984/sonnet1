/**
 * 个人信息保存和恢复
 */
Ext.apply(divo, {
	/**
	 * 保存个人信息。
	 * 
	 * data数据格式举例：
	 * {
	 *		userId : 1,
	 *		msgCode : 'pp',
	 *		msgValue : 'vv'
	 *	}
	 */
	saveProfile : function(data,async) {
		if (!data.userId) return
		
		Ext.Ajax.request({
			async : async?async:false,
			url : "/myprofile/"+data.userId,
			method : 'POST',
			jsonData : {msg_code: data.msgCode, msg_value: data.msgValue},
			success : function(response, options) {
				var resp = Ext.decode(response.responseText);
				if (!resp.success) {
					divo.say(resp.errors.reason)
				}
			}
			//failure : function(response, options) {
			//	divo.showError(response.responseText);
			//}
		});
	},
	saveProfileAsync : function(data) {
		this.saveProfile(data,true)
	},
	/**
	 * 恢复保存的个人信息值
	 * 
	 * 返回值数据格式举例：{msgValue:'1'}
	 */
	restoreProfile : function(callback, userId, msgCode) {
		Ext.Ajax.request({
			scope : this,
			async : false,
			url : "/myprofile/"+userId+"/"+msgCode,
			method : 'GET',
			success : function(response, options) {
				var resp = Ext.decode(response.responseText);
				if (resp.success) {
					callback({msgValue:resp.data.msg_value})
				} else {
					callback(null)
				}
			},
			failure : function(response, options) {
				callback(null)
			}
		});
	}

})
// EOP
