/**
 * 新建或修改表单（基类）
 */
divo.form.AddOrEditForm = Ext.extend(Ext.form.FormPanel, {
	recordId : null,
	adding : false,
	initFocusFldName : null,
	labelWidth : 100,
	defaultType : "textfield",
	labelAlign : "right",
	autoScroll : true,
	bodyStyle : "padding:10px",
	initFormBySelf : true, //是否由外部调用initForm方法
	initComponent : function() {
		this.on('beforedestroy',function() {
			if (Ext.MessageBox.isVisible())
		    	Ext.MessageBox.hide();
		},this)
			
		divo.form.AddOrEditForm.superclass.initComponent.call(this);
	},
	//public
    initForm : function(t) {
    	if (!this.adding) 
    		this.loadItem()
    	
	    if (this.initFocusFldName)
			var f = this.getForm().findField(this.initFocusFldName)
			if (f)
				f.focus.defer(t?t:100, f)  
    },
    afterRender : function() {
    	divo.form.AddOrEditForm.superclass.afterRender.call(this)
    	if (this.initFormBySelf)
    		this.initForm.defer(100,this)
    },
	// public
	clearForm : function() {
		this.getForm().reset()
		this.initForm(1500) //新建成功后发出消息会刷新网格，造成焦点丢失，通过增加延时解决
	},
    //子类可以重写
    getLoadItemUrl : function(url,recordId) {
        if (url!=undefined) {
            return url + "/"+recordId
        } else {    
            if (!this.url || !this.recordId) 
                return null
            return this.url + "/"+this.recordId
        }
    },
	//子类可重写
	loadItem : function(url,recordId) {
        var url = this.getLoadItemUrl(url,recordId)
        if(!url) return

        Ext.MessageBox.wait("正在加载...", '请稍候');
		
		var f = function() {
			Ext.Ajax.request({
				scope : this,
				url : url,
				method : 'GET',
				success : function(response, options) {
					var resp = Ext.decode(response.responseText);
					this.getForm().setValues(resp.data)
					this.afterLoadItem(resp.data)
					this.oldData = resp.data
    	            Ext.MessageBox.hide();
				},
				failure : function(response, options) {
    	            Ext.MessageBox.hide();
					this.alert(response.responseText)
				}
			})
		}
		f.defer(100,this)
	},
	//模板方法
	afterLoadItem : Ext.emptyFn,
	//子类可重写
	getSaveUrl : function() {
		return this.url + (this.adding ? "" : "/" + this.recordId)
	},
	// public
	save : function(callbackOnSuccess) {
		var item = this.getForm().getObjectValues()
		if (!this.validateBeforeSave(item)) {
			return
		}
		Ext.MessageBox.wait("正在保存...", '请稍候');
		item = this.beforeSave(item)
		
		var f = function(item) {
			Ext.Ajax.request({
				scope : this,
				url : this.getSaveUrl(),
				method : (this.adding ? 'POST' : 'PUT'),
				async : true,	
				jsonData : item,
				success : function(response, options) {
    	            Ext.MessageBox.hide();
					var resp = Ext.decode(response.responseText)
					if (!resp.success) {
						this.say("输入数据验证未通过，请检查。")
						this.getForm().markInvalid(resp.errors)
						this.afterMarkInvalid()
					} else {
						this.afterSave(resp.id,item)
						if (typeof callbackOnSuccess == "function")
							callbackOnSuccess(resp.id,item)
					}
				},
				failure : function(response, options) {
    	            Ext.MessageBox.hide();
					this.alert(response.responseText)
				}
			})
		}
		f.defer(100,this,[item])
	},
	//模板方法
	validateBeforeSave : function(item) {
		return true
	},
	//模板方法
	beforeSave : function(item) {
		return item
	},
	//模板方法
	afterSave : Ext.emptyFn,
	//模板方法
	afterMarkInvalid : Ext.emptyFn,
	//public
	refreshForm : function(id) {
		this.recordId = id
		this.initForm()		
	}
})    
    
// EOP

