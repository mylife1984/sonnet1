/**
 * 菜单项对应JS程序加载器
 */
divo.home.Loader = function() {
	/* ----------------------- private变量 ----------------------- */
	var maxPanelNum = 10
    var jsLoader = new divo.utils.JsLoader();

	/* ----------------------- private方法 ----------------------- */
	// 选择菜单项
	function selectMenu(mainTabPanel,menuItemNode) {
		loadApp(mainTabPanel,menuItemNode)
	}
	
	//取得菜单项信息
	function getMenuItemInfo(menuId) {
		var ok = true
		var objName,loadOnDemand,imageUrl
		Ext.Ajax.request({
			scope : this,
			url : "/menus/items/"+menuId+"/main",
			async : false,
			method : 'GET',
			success : function(response, options) {
				Ext.getBody().unmask()
				var resp = Ext.decode(response.responseText)
				if (!resp.success) {
					alert("加载菜单项时出错（请查看log.txt，获得详细错误信息）")
					return
				}
				objName = resp.objName
				loadOnDemand = resp.loadOnDemand
				imageUrl = resp.imageUrl
			},
			failure : function(response, options) {
				Ext.getBody().unmask()
				divo.showError(response.responseText)
				ok = false
			}
		});
		return {
			ok:ok,
		    objName:objName,
		    loadOnDemand:loadOnDemand,
		    imageUrl: imageUrl      
		}
		
	}

	// 加载菜单对应的程序
	function loadApp(mainTabPanel,menuItemNode) {
		var menuItemId = menuItemNode.id
		
		var menuItem = getMenuItemInfo(menuItemId) 
		if (!menuItem.ok) return
		
		var objName = menuItem.objName
		var loadOnDemand = menuItem.loadOnDemand
		
        var callback = function() {
		    var oMain
		    eval('oMain = ' + objName)
		    
		    var n = 0
            while (!oMain && n<2) {
			   alert("点击[确定]后继续")
			   eval('oMain = ' + objName)
			   n++
            } //js加载后执行函数体需要时间
            
            var p = oMain.init(menuItemId)
            var canClose = (oMain.closable == undefined || oMain.closable == true)
            showMainPage(p,mainTabPanel,menuItemNode.id,menuItemNode.text,objName,menuItemNode.autoActivated,canClose)
        }

        if (loadOnDemand) {
			jsLoader.onSuccess = callback;
			//通过dev参数避免客户端缓冲，参见middle_http_auth.py
			jsLoader.load("/media/debug/"+objName+".js?dev=yes",true);
        } else {
        	callback()
        }
	}
	
    //在主页标签中显示内容
    function showMainPage(p,mainTabPanel,menuItemId,menuItemText,objName,autoActivated,canClose) {
        var tabId = 'mp-'+menuItemId
        var oldTabPanel = mainTabPanel.getItem(tabId)
        if (!oldTabPanel) {
        	//tabId,title,innerPanel,active,closable,iconCls,panelCls
            mainTabPanel.openNormalTab(tabId, menuItemText, p, autoActivated, canClose,'icon-'+objName.replace(/\./g,'-'),'og-content-panel')
        } else {
            mainTabPanel.openDynamicTab(tabId, menuItemText)
        }   
    }
	
	/* ----------------------- public方法 ----------------------- */
	return {

		/**
		 * 选择菜单项
		 */
		selectMenu : function(mainTabPanel,menuItemNode) {
			Ext.getBody().mask('','x-mask-loading')
			selectMenu.defer(100,this,[mainTabPanel,menuItemNode])
		}

	} // return

}()

// EOP

