/**
 * 用户新建或修改窗口
 * --------------------------------------------------------------
 * 消息：
 * 用户新增或修改了
 * 
 * 消息名：     			
 * window.admin.UserChanged    
 * 
 * 消息内容：
 * {int} sender 本组件的id值
 * {int} id 新建或修改记录的id字段值
 * --------------------------------------------------------------
*/
win.admin.UserAddOrEditWindow = Ext.extend(Ext.Window, {
	adding : null,
	recordId : null,
	closeAction : "hide",
	cancelAction : "hide",
	initComponent : function() {
		var btns = [{
				text : "保存并继续",
				handler : this.onSave,
				tooltip : '可直接按CTRL+S',
				scope : this
			}, {
				text : "保存并关闭",
				handler : this.onSaveAndClose,
				
				scope : this
			}, {
				text : "关闭",
				handler : this.onCancel,
				scope : this
			}]
		if (!this.adding)
			btns = [{
				text : "保存",
				handler : this.onSaveAndClose,
				scope : this
			}, {
				text : "关闭",
				handler : this.onCancel,
				scope : this
			}]
		Ext.apply(this, {
			title : (this.adding?'新建':'修改')+'用户',
			height : 300,
			width : 400,
			modal : true,
			stateful : true,
			stateId : 'win-admin-UserAddOrEdit',
			closable : true,
			maximizable : true,
			minimizable : false,
			layout : "fit",
			items : {
				id : this.myId('form'),
				xtype : "form.admin.UserAddOrEditForm",
				adding : this.adding,
				recordId : this.recordId
			},
			buttons : btns,
			keys : {			
				key: Ext.EventObject.S,
				ctrl:true,
				stopEvent: true,
				fn: this.onSave,
				scope : this
			}
		})

		win.admin.UserAddOrEditWindow.superclass.initComponent.call(this)
	},
	onSave : function() {
		Ext.getCmp(this.myId('form')).save(this.onSaveSucccess.createDelegate(this))
	},
	onSaveSucccess : function(id) {
		this.say('保存完毕, 请继续新建。')
	    Ext.getCmp(this.myId('form')).clearForm()
	    this.notifyChanged(id)
	},
	onSaveAndClose : function() {
		Ext.getCmp(this.myId('form')).save(this.onSaveAndCloseSucccess.createDelegate(this))
	},
	onSaveAndCloseSucccess : function(id) {
		this.say('保存完毕')
		this.close()
		this.notifyChanged(id)
	},
	notifyChanged : function(id) {
		this.publish("win.admin.UserChanged",{
			sender:this.id,
			id : id
		})
	}
})
//EOP

