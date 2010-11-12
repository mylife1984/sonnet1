/**
 * 显示即加载，并具有save功能的表单
 */
divo.form.EditAndSaveForm = Ext.extend(Ext.form.FormPanel, {
    initFocusFldName : null,
    url : null,
    saveRequestMethod : 'PUT',
    initFormBySelf : true, //是否由由外部驱动初始化表单
    sayAfterSaved : true,
    initComponent : function() {
        if (this.initFormBySelf)
            divo.waitFor(this.canInitForm,this.initForm,this)
            
        this.on('beforedestroy',function() {
            if (Ext.MessageBox.isVisible())
                Ext.MessageBox.hide();
        },this)
            
        divo.form.EditAndSaveForm.superclass.initComponent.call(this);
    },
    //public
    canInitForm : function() {
        var o = this.getForm()
        if (o)
            var fld = this.getForm().findField(this.initFocusFldName)
        return fld
    },
    //public
    initForm : function() {
        var f = this.getForm().findField(this.initFocusFldName)
        if (f)
            f.focus.defer(100, f)
        if (!this.initFormBySelf)
            this.loadItem()
        this.initFormAddon()
    },
    afterRender : function() {
        divo.form.EditAndSaveForm.superclass.afterRender.call(this)
        if (this.initFormBySelf)
            this.loadItem()
    },
    //子类可以重写
    initFormAddon : Ext.emptyFn,
    loadItem : function() {
        if (!this.url) return
        Ext.MessageBox.wait("正在加载...", '请稍候');
        
        var f = function() {
            Ext.Ajax.request({
                scope : this,
                url : this.url,
                method : 'GET',
                success : function(response, options) {
                    var resp = Ext.decode(response.responseText)
                    if (resp.success) {
                        this.getForm().setValues(resp.data)
                        this.afterLoadItem(resp.data)
                    }    
                    Ext.MessageBox.hide();
                },
                failure : function(response, options) {
                    Ext.MessageBox.hide();
                    this.alert(response.responseText);
                }
            })
        }
        f.defer(100,this)
    },
    //模板方法
    afterLoadItem : Ext.emptyFn,
    //模板方法
    validateBeforeSave : function(item) {
        return true
    },
    //子类可重写
    getSaveUrl : function() {
        return this.url
    },
    save : function(callbackFn) {
        if (!this.url) return
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
                async : false, //要求同步
                method : this.saveRequestMethod,
                jsonData : item,
                success : function(response, options) {
                    Ext.MessageBox.hide()
                    if(this.sayAfterSaved)
                        this.say("保存完毕")
                    if (callbackFn) callbackFn.call()
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
    beforeSave : function(item) {
        return item
    }
    
})
// EOP

