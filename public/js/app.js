/**
 * 用户帐号信息管理
 */
Ext.ns("divo.admin.user")
divo.admin.user.MainPanel = Ext.extend(divo.panel.PanelWithHtmlBtns, {
	rightWidth : 150,
	initComponent : function() {
		Ext.apply(this, {
			layout : 'tdgi_border',
			items : [{
				stateful : true,
				stateId : this.myId('groups'),
				region : 'east',
				title : '所属用户组',
				collapsible : true,
				width : 300,
				collapsedTitle : true,
				split : true,
				layout : 'fit',
				items : [{
					id : this.myId('groups'),
					xtype : "grid.admin.UserGroupsGrid"
				}]
			}, {
				region : 'center',
				layout : 'fit',
				//autoScroll : true,
				items : [{
					id : this.myId('user'),
					xtype : "grid.admin.UserGrid"
				}]
			},this.getHtmlBtnsPanel([{
				icon : 'divo/add2.gif',
                text : "新建帐号", 
                handler :this.addUser
			},{  
				icon : 'locked.gif',
                text : "重置密码", 
                handler :this.resetPassword
            },'->',{
            	text : '<img src="/media/images/menus/group.gif"/>选择所属用户组',
            	handler : this.selectUserGroups
            }
            ])
			]
		})
		this.subscribe("divo.rowSelect"+this.myId('user'),this.onUserChange,this)
		this.on('beforedestroy',function() {
		      this.unsubscribe()
		},this)

		divo.admin.user.MainPanel.superclass.initComponent.call(this)
	},
	//选择了某个用户
	onUserChange : function(subj, msg, data) {
		Ext.getCmp(this.myId('groups')).showList(msg.id)
	},
	addUser : function() {
		Ext.getCmp(this.myId('user')).addItem()
	},
    resetPassword : function() {
        Ext.getCmp(this.myId('user')).resetPassword()
    },
    selectUserGroups : function() {
        Ext.getCmp(this.myId('groups')).selectUserGroups()
    }
	
})

//主程序
divo.admin.user.Main = function() {
	return {
		init : function(menuItemId) {
			return new divo.admin.user.MainPanel({
			     id : 'admin-user'
                 //menuItemId : menuItemId
			})
		}
	} // return
}()
// EOP

;/**
 * 定义命名空间 
 */
Ext.ns("form.admin")
Ext.ns("grid.admin")
Ext.ns("panel.admin")
Ext.ns("tree.admin")
Ext.ns("win.admin")

//EOP
;/**
 * 用户帐号信息管理
 */
grid.admin.UserGrid = Ext.extend(divo.grid.SmartSimpleGrid, {
	initComponent : function() {
		if (!this.isLookup) {
			this.action = new Ext.ux.grid.RowActions({
				header : '操作',
				autoWidth : false,
				width : 100,
				actions : [{
					iconCls : 'icon-update',
					tooltip : '修改用户帐号信息',
					hideIndex : 'is_admin'
				}, {
					iconCls : 'icon-delete',
					tooltip : '删除用户帐号',
					hideIndex : 'is_admin'
				}, {
					iconIndex : 'activate_cls',
					qtipIndex : 'activate_tip',
					hideIndex : 'is_admin'
				}]
			})
			this.action.on('action', this.onAction, this)
		}

		Ext.apply(this, {
			url : "/users",
			fieldDefinitions : this.getListDefinitions(),
			gridConfig : {
				filter : true,
				plugins : this.isLookup ? undefined : [this.action],
				getRowClass : function(row,index) {
					return row.data.active?'':'inactive-grid-row'
				}
			}
		})
		
		this.subscribe("win.admin.UserChanged", this.onChangeList, this)
		this.on('beforedestroy', function() {
			this.unsubscribe()
		}, this)
		
		grid.admin.UserGrid.superclass.initComponent.apply(this,arguments)
	},
	onAction : function(grid, record, action, row, col) {
		if (action == 'icon-update')
			this.editItem()
		if (action == 'icon-delete')
			this.deleteItem()
		if (action == 'icon-activate' || action == 'icon-deactivate')
			this.setStatus(record.data.id)
	},
	//重写
	createGridMeta : function() {
		this.putFirst = true
		return divo.getGridMeta(this,this.fieldDefinitions,this.isLookup?null:[this.action])
	},
	getListDefinitions : function() {
		return [{
			name : 'id'
		}, {
			name : 'name',
			header : '用户名',
			searchable : true,
			width : 150
		}, {
			name : 'full_name',
			header : '姓名',
			searchable : true,
			width : 150
		},{
			name : 'dept_name',
			header : '所属机构',
			sortable : false,
			width : 150,
			renderer: this.wordWrapRender.createDelegate(this)
        },{
            name : 'email',
            header : '邮箱',
            searchable : true
		}, {
			name : 'is_admin',
			type : 'bool',
			convert : function(v, rec) {
				return rec.id == 1
			}
		}, {
			name : 'activate_cls',
			type : 'string',
			convert : function(v, rec) {
				return (rec.active ? 'icon-deactivate' : 'icon-activate')
			}
		}, {
			name : 'activate_tip',
			type : 'string',
			convert : function(v, rec) {
				return (rec.active ? '休眠' : '激活')
			}
		}, {
			name : 'active',
			header : '状态',
			type : 'bool',
			width : 60,
			hidden : this.isLookup,
			renderer : this.activeRender.createDelegate(this)
		}, {
			name : 'login_on',
			header : '最近一次登录',
			hidden : this.isLookup,
			width : 160
		}, {
			name : 'added_on',
			header : '加入时间',
			hidden : this.isLookup,
			renderer : this.addedOnRender.createDelegate(this)
		}]
	},
	activeRender : function(value, p, record) {
		return (value ? '激活' : '休眠')
	},
	//public
	addItem : function() {
		var win = new window.admin.UserAddOrEditWindow({
			closeAction : "destroy",
			cancelAction : "destroy",
			adding : true
		})
		win.show()
	},
	editItem : function() {
		if (!this.cId) {
			this.say("请先选择要修改的用户")
			return
		}
		var win = new window.admin.UserAddOrEditWindow({
			closeAction : "destroy",
			cancelAction : "destroy",
			adding : false,
			recordId : this.cId
		})
		win.show()
	},
	setStatus : function(id) {
		var ok = true
		Ext.Ajax.request({
			scope : this,
			url : "users/" + id + "/state",
			async : false,
			method : 'PUT',
			success : function(response, options) {
				var resp = Ext.decode(response.responseText)
				if (resp.success) {
					this.say('状态改变成功')
				}
			},
			failure : function(response, options) {
				this.alert(response.responseText)
				ok = false
			}
		});
		if (ok) {
			this.loadList()
		}
	},
	//public
	resetPassword : function() {
		if (!this.cId) {
			this.say("请先选择用户。")
			return
		}
		if (this.cId == 1) {
			this.say("系统管理员的密码不允许重置。")
			return
		}
		Ext.MessageBox.confirm('确认', '要重置密码吗？', this.resetPasswordConfirm
				.createDelegate(this))
	},
	resetPasswordConfirm : function(btn) {
		if (btn !== 'yes')
			return

		var ok = true
		Ext.Ajax.request({
			scope : this,
			url : "users/" + this.cId + "/password/default",
			async : false,
			method : 'PUT',
			success : function(response, options) {
				var resp = Ext.decode(response.responseText)
				if (resp.success) {
					this.say('密码重置成功')
				}
			},
			failure : function(response, options) {
				this.alert(response.responseText)
				ok = false
			}
		});
		if (ok) {
			this.loadList()
		}
	}

})

Ext.reg('grid.admin.UserGrid', grid.admin.UserGrid);
// EOP

;/**
 * 用户新建或修改表单
 */
form.admin.UserAddOrEditForm = Ext.extend(divo.form.AddOrEditForm, {
	initComponent : function() {
		Ext.apply(this, {
			initFocusFldName : 'full_name',
			url : "/users",
			items : [{
				fieldLabel : divo.required + "姓名",
				name : "full_name",
				allowBlank : false,
				width : 100
			},{
				fieldLabel : divo.required + "用户名",
				name : "name",
				width : 100,
				readOnly : !this.adding,
				allowBlank : false,
				validationEvent:'blur',
				validator : function(v) {
					var t = /^[a-zA-Z0-9_\-]+$/;
					return t.test(v);
				}
			},{
				fieldLabel : "电子邮箱",
				name : "email",
				validationEvent:'blur',
				vtype : 'email',
				width : 150
			},{
                xtype : 'xlovfield',
                name : 'dept_id',
                fieldLabel : '所属机构',
                multiSelect : false,
                lovTitle : '请选择',
                lovHeight : 350,
                lovWidth : 580,
                minItem : 1,
                maxItem : 1,
                width : 150,
                valueField : 'id',  
                displayField : divo.t1 + '{name}' + divo.t2,
                textarea : false,
                windowConfig : {
                   stateful : true,
                   stateId : 'form-admin-UserAddOrEditForm-lovWin'
                },
                view : new grid.admin.DeptGrid({
                    isLookup : true
                })
			}]
		})
		form.admin.UserAddOrEditForm.superclass.initComponent.call(this);
	},
	validateBeforeSave : function(item) {
		var t = /^[a-zA-Z0-9_\-]+$/;
		if (!t.test(item.name)) {
			this.say("用户名中含有非法字符！")
			return false
		}
		return true
	},
	beforeSave : function(item) {
		item.name = item.name.trim()
		return item
	},
	//重写
	afterLoadItem : function(data) {
        var fld = this.getForm().findField("dept_id")
        if (fld)
            fld.setNameValue(data.dept_name,data.dept_id)
	}
})

Ext.reg("form.admin.UserAddOrEditForm", form.admin.UserAddOrEditForm)
// EOP

;/**
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

;