/**
 * 修改登录密码表单
 */
divo.home.ChangePasswordForm = Ext.extend(Ext.form.FormPanel, {
	userId : null,
	userName : null,
	firstChangePassword : null,
	passwordTimeout : null,
	bySite : null,
	initComponent : function() {
		this.user = this.getAppContext().user
		
		var msg = "修改登录密码"
		if (this.firstChangePassword) {
			if (this.passwordTimeout)
		   		msg = '现密码已经过期，请设置新登录密码'
		   	else	
		   		msg = '设置新登录密码'
		}
		
		Ext.apply(this, {
			//baseCls : "x-plain",
			labelWidth : 150,
			defaultType : "textfield",
			labelAlign : "right",
			autoScroll : true,
			bodyStyle : "padding:10px",
			items : [new divo.form.FormIntro({
	            style   : 'margin:0px 0 10px 0;',
	            label   : msg,
	            text    : "密码长度必须大于6位，可以由英文字母、阿拉伯数字等组成，区分大小写。"
        	}),{
				fieldLabel : "现密码",
				name : "password",
				inputType : "password",
				width : 150
        	},{
				fieldLabel : "新密码",
				name : "new_password",
				inputType : "password",
				width : 150
			}, {
				fieldLabel : "再次输入新密码",
				inputType : "password",
				name : "new_password2",
				width : 150
			}]
		})

		divo.home.ChangePasswordForm.superclass.initComponent.call(this)
	},
	afterRender : function() {
		divo.home.ChangePasswordForm.superclass.afterRender.call(this)
		var f = function() {
   			divo.utils.CapsLock.init()
			this.initFocus()
		}
		f.defer(100,this)
	},
	//public
	initFocus : function() {
		var f = this.getForm().findField("password")
		f.focus.defer(100, f)
	},
	// public
	save : function(callbackOnSuccess) {
		var item = this.getForm().getObjectValues()
		this.getEl().mask('', 'x-mask-loading')
		var url = "/users/" + this.userId + "/password"

		var f = function() {
			Ext.Ajax.request({
				scope : this,
				url : url,
				method : 'PUT',
				jsonData : item,
				success : function(response, options) {
					var resp = Ext.decode(response.responseText)
					this.getEl().unmask()
					
					if (!resp.success) {
						this.say(resp.errors.reason)
					} else {
						var up = divo.utils.base64.encode(this.userName + ':'
								+ options.jsonData.new_password)
						Ext.Ajax.defaultHeaders.Authorization = up
						var authKey = divo.AUTH_KEY;
						divo.save(authKey,up)
						this.say("新密码已经保存")
						divo.home.clearRememberUserInfo(this.bySite)
						callbackOnSuccess.call()
					}
				},
				failure : function(response, options) {
					this.getEl().unmask()
				    this.alert(response.responseText)
				}
			})
		}
		f.defer(100,this,[item])
	}
})

Ext.reg("divo.home.ChangePasswordForm", divo.home.ChangePasswordForm)
// EOP
