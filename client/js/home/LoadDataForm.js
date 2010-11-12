/**
 * 加载数据
 */
divo.home.LoadDataForm = Ext.extend(Ext.form.FormPanel, {
	initComponent : function() {
		this.isDebug = this.getAppContext().isDebug
		
		var btns1 = [{
					items : [this.btnMenuItem = new Ext.Button({
						handler : this.onLoadMenuItems,
						text : "加载“菜单项”",
						scope : this
					})]
				}, {
					html : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
				}, {
					html : '<div id="data-load-menu-item"></div><span class="common-text" id="data-load-menu-item-text"></span><br /><br />'
				}, {
					items : [this.btnPortalView = new Ext.Button({
						handler : this.onLoadPortalViews,
						text : "加载“门户状态”",
						scope : this
					})]
				}, {
					html : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
				}, {
					html : '<div id="data-load-portalviews"></div><span class="common-text" id="data-load-portalviews-text"></span><br /><br />'
				}, {
					items : [this.btnGlobal = new Ext.Button({
						handler : this.onLoadGlobalPermissions,
						text : "加载“全局权限”",
						scope : this
					})]
				}, {
					html : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
				}, {
					html : '<div id="data-load-globals"></div><span class="common-text" id="data-load-globals-text"></span><br /><br />'
				}]
				
		var btns3 = [{
					items : [this.btnOther = new Ext.Button({
						handler : this.onLoadOthers,
						text : "加载“其他数据”",
						scope : this
					})]
				}, {
					html : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
				}, {
					html : '<div id="data-load-others"></div><span class="common-text" id="data-load-others-text"></span><br /><br />'
				}]			
				
		Ext.apply(this, {
			autoScroll : true,
			bodyStyle : "padding:20px",
			items : [{
				layout : "table",
				border : false,
				layoutConfig : {
					columns : 3
				},
				items : btns1.concat(btns3)
			}]
		})

		divo.home.LoadDataForm.superclass.initComponent.apply(this,
				arguments)
	},
	onLoadMenuItems : function() {
		this.loadAndshowProgess('data-load-menu-item','/data/menuitems',this.btnMenuItem)
	},
	onLoadGridViews : function() {
		this.loadAndshowProgess('data-load-grid-view','/data/gridviews',this.btnGridView)
	},
	onLoadGlobalPermissions : function() {
		this.loadAndshowProgess('data-load-globals','/data/globals',this.btnGlobal)
	},
	onLoadPortalViews : function() {
		this.loadAndshowProgess('data-load-portalviews','/data/portalviews',this.btnPortalView)
	},
	onLoadOthers : function() {
		this.loadAndshowProgess('data-load-others','/data/others',this.btnOther)
	},
	loadAndshowProgess : function(id,url,btn) {
		btn.disable()
		var p = new Ext.ProgressBar({
			width : 300,
			renderTo : id
		});
		p.on('update', function(val) {
			Ext.fly(id+'-text').dom.innerHTML += '.';
		});
		Ext.fly(id+'-text').update('加载中...');
		p.wait()
		Ext.Ajax.request({
			scope : this,
			url : url,
			async : true,
			method : 'PUT',
			success : function(response, options) {
				var resp = Ext.decode(response.responseText)
				if (resp.success) {
					p.destroy()
					btn.enable()
					Ext.fly(id+'-text').update('完成');
				}
			},
			failure : function(response, options) {
				this.alert(response.responseText)
				p.destroy()
				btn.enable()
				Ext.fly(id+'-text').update('失败');
			}
		});
	}
})

Ext.reg('divo.home.LoadDataForm', divo.home.LoadDataForm)
// EOP

