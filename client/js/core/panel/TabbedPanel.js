/**
 * 标签式面板
 */
divo.panel.IFrameComponent = Ext.extend(Ext.BoxComponent, {
	onRender : function(ct, position) {
		this.el = ct.createChild( {
			tag : 'iframe',
			id : 'iframe-' + this.id,
			frameBorder : 0,
			src : this.url
		})
	}
})
divo.panel.TabCloseMenu = function() {
	var tabs, menu, ctxItem;
	this.init = function(tp) {
		tabs = tp;
		tabs.on('contextmenu', onContextMenu);
	}

	function onContextMenu(ts, item, e) {
		if (!menu) { // create context menu on first right click
			menu = new Ext.menu.Menu([ {
				id : tabs.id + '-close',
				text : '关闭',
				handler : function() {
					tabs.remove(ctxItem);
				}
			}, {
				id : tabs.id + '-close-others',
				text : '关闭其他',
				handler : function() {
					tabs.items.each(function(item) {
						if (item.closable && item != ctxItem) {
							tabs.remove(item);
						}
					});
				}
			}]);
		}
		ctxItem = item;
		var items = menu.items;
		items.get(tabs.id + '-close').setDisabled(!item.closable);
		var disableOthers = true;
		tabs.items.each(function() {
			if (this != item && this.closable) {
				disableOthers = false;
				return false;
			}
		});
		items.get(tabs.id + '-close-others').setDisabled(disableOthers);
		menu.showAt(e.getPoint());
	}
};
divo.panel.TabbedPanel = Ext.extend(Ext.TabPanel, {
	closable : true,
    tabPosition : 'top',	
    margins : '0 0 0 0',
    notCloseMeHTML : '',
    showFixedPanel : false, //避免网格显示在TabPanel中不显示页脚
	initComponent : function() {

		Ext.apply(this, {
			activeTab : 0,
			region : 'center',
			border : false,
			margins : this.margins,
			tabPosition : this.tabPosition,
			enableTabScroll : (this.tabPosition == 'top'),
			plugins : new divo.panel.TabCloseMenu()
		});
		
	    if (this.tabPosition == 'bottom' || this.showFixedPanel) 
			Ext.apply(this, {
				items : [{
					title : '<img src="/media/images/divo/button.gif">',
					closable : false,
					autoScroll : false,
					id : this.notCloseMeTabId || 'not-close-me',
					html: this.notCloseMeHTML
				}]
			});
		
		divo.panel.TabbedPanel.superclass.initComponent.call(this);
	},
	afterRender : function() {
		divo.panel.TabbedPanel.superclass.afterRender.call(this);
		this.on("tabchange",this.onTabChanged,this)
	},
	//模板方法
	onTabChanged : Ext.emptyFn,
	/**
	 * 打开IFRAME方式的Tab
	 * 
	 * @param {String} tabId 标识
	 * @param {String} title 标题
	 * @param {String} url
	 * @return 打开的Panel对象
	 */
	openTab : function(tabId, title, url) {
		var tab;
		if (!(tab = this.getItem(tabId))) {
			var iframe = new divo.panel.IFrameComponent({
				id : tabId,
				autoScroll : true,
				url : url
			});
			tab = new Ext.Panel({
				id : tabId,
				title : title,
				closable : this.closable,
				autoScroll : true,
				border : false,
				layout : 'fit',
				items : [iframe]
			})
			this.add(tab);
		} else {
			tab.setTitle(title);
		}
		this.setActiveTab(tab);
		tab.doLayout();
		return tab;
	},
	/**
	 * 打开非IFRAME方式的TabPanel,其中的内容已经在另外一个Panel中定义好了
	 * 
	 * @param {String} tabId 标识
	 * @param {String} title 标题
	 * @param {Ext.Panel} innerPanel
	 * @return 打开的Panel对象
	 */
	openNormalTab : function(tabId, title, innerPanel,active,closable,iconCls,panelCls) {
		var tab;
		if (!(tab = this.getItem(tabId))) {
			tab = new Ext.Panel({
				id : tabId,
				cls : panelCls,
				iconCls : iconCls,
				title : title,
				autoScroll : false,
				border : false,
				closable : closable==true?true:false, 
				layout : 'fit',
				items : [innerPanel]
			});
			this.add(tab);
		}
		tab.setTitle(title);
		if (active==undefined || active)
			this.setActiveTab(tab);
		tab.doLayout(); // 没有这句，内嵌网格显示就不正常
		return tab;
	},
	/**
	 * 打开非IFRAME方式的TabPanel,其中的内容将随后动态创建
	 * 
	 * @param {String} tabId 标识
	 * @param {String} title 标题
	 */
	openDynamicTab : function(tabId, title, closable) {
		var tab;
		if (!(tab = this.getItem(tabId))) {
			Ext.DomHelper.append(document.body, {
				tag : 'div',
				id : 'div-' + tabId
			});
			tab = new Ext.Panel({
				id : tabId,
				title : false,
				closable : closable || true,
				autoScroll : false,
				border : false,
				layout : 'fit',
				el : 'div-' + tabId
			});
			tab.render();
			this.add(tab);
		}
		tab.setTitle(title);
		this.setActiveTab(tab);
		tab.doLayout();
		return tab;
	}

})

Ext.reg("divo.panel.TabbedPanel", divo.panel.TabbedPanel)
// EOP
