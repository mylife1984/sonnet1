/**
 * 首页
 */

//主页应用管理 
divo.homeApp = function() {

	return {
        init: function(){
            if (Ext.isIE)
                Ext.util.CSS.swapStyleSheet("css-patch","css/ie-patch.css?v=1")
            if (Ext.isChrome)
                Ext.util.CSS.swapStyleSheet("css-patch","css/chrome-patch.css?v=1")
            if (Ext.isGecko)
                Ext.util.CSS.swapStyleSheet("css-patch","css/firefox-patch.css?v=1")

            new divo.home.Main({
                 id : 'home-app'
            })
		}	
    }
}()

divo.home.CenterTabbedPanel = Ext.extend(divo.panel.TabbedPanel, {
	//重写
    onTabChanged : function(thisPanel, newPanel) {
    	this.publish("divo.home.TabChanged",{
    		sender:this.id,
    		tabId: newPanel.id
    	})
    }
})

divo.home.Main = Ext.extend(Ext.Viewport, {
	initComponent : function() {
		var panels = [
			new divo.home.DashWorkspacePanel({
				title: '首页',
				iconCls: 'icon-menu-overview',
				id : "home-page"
			})
        ];
        Ext.get('header').removeClass('x-hidden');
        Ext.get('footer').removeClass('x-hidden');
        
		new Ext.Viewport({
			layout: 'tdgi_border',
			defaults : {
				border : true
			},
			items: [
				new Ext.BoxComponent({
					region: 'north',
					el: 'header'
				}),
				new Ext.BoxComponent({
					region: 'south',
					el: 'footer'
				}),	{
					region: 'west',
					id: 'menu-panel',
					title: '<img src="images/silk/application_double.png" />&nbsp;菜单导航',
					collapsedTitle : '菜单导航',
					split: true,
					stateful :  true,
					stateId : this.myId('west'),
					width: 150,
					bodyBorder: false,
					minSize: 100,
					maxSize: 300,
					collapsible: true,
					collapsed : false,
					margins: '0 0 0 0',
					layout: 'fit',
					items: [{
						html: 'menu tree'
					}]
				},
				new divo.home.CenterTabbedPanel({
					defaults : {
						border : true
					},
					id: 'tabs-panel',
					region:'center',
					activeTab: 0,
					enableTabScroll: true,
					//autoScroll : true,
					items: panels
				})
		 	]
		});
		this.subscribe("divo.tree.MenuItemSelect",this.onMenuSelected,this)
		this.on('beforedestroy',function() {
		      this.unsubscribe()
		},this)
		divo.home.Main.superclass.initComponent.call(this)
	}
})

// EOP
