/**
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

