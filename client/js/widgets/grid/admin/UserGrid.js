/**
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

