/**
 * 用户初次登录修改密码窗口
 * 
 * 
 * --------------------------------------------------------------
 * 消息：
 * 初始密码设置完毕，显示主页
 * 
 * 消息名：     			
 * j.showHomepage   
 * 
 * 消息内容：
 * 无
 * --------------------------------------------------------------
 */
divo.home.ChangePasswordWindow = Ext.extend(Ext.Window, {
	userId : null,
	userName : null,
	userFullName : null,
	firstChangePassword : true,
	passwordTimeout : false,
	cancelAction : "destroy",
	closeAction : "destroy",
	bySite : false, //真表示会员中心调用本窗口
	initComponent : function() {
		var btns = [{
				text : "确定",
				handler : this.onSave,
				scope : this
		}]
		if (!this.firstChangePassword) {
			btns = btns.concat([{
			    text : "取消",
			    handler : this.onCancel,
			    scope : this
			}])
		}
		Ext.apply(this,{
			width : 400,
			height : 300,
			modal : false,
			closable : !this.firstChangePassword,
			maximizable : false,
			minimizable : false,
			layout : "fit",
			buttons : btns,
			items : {
				xtype : "divo.home.ChangePasswordForm",
				userId : this.userId,
				userName : this.userName,
				bySite : this.bySite,
				firstChangePassword : this.firstChangePassword,
				passwordTimeout : this.passwordTimeout
			},
			keys : {
				key : Ext.EventObject.ENTER,
				fn : this.onSave,
				scope : this
			}
		})
		
		divo.home.ChangePasswordWindow.superclass.initComponent.call(this);
	},
	onSave : function() {
		this.items.itemAt(0).save(this.onSaveSucccess.createDelegate(this))
	},
	onSaveSucccess : function() {
		this.close()
		if (this.firstChangePassword) {
			if (this.bySite) 
			    divo.home.gotoNewPageAfterLogin()
			else	
				divo.publish("j.showHomepage")
		}
	}
})
// EOP
