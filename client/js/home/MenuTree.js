/**
  * 菜单树
  * 
  * --------------------------------------------------------------
  * 消息：
  * 选择了某个菜单项
  * 
  * 消息名：     			
  * divo.tree.MenuItemSelect
  * 
  * 消息内容：
  * {String} sender 本器件的id值
  * {String} menuItemId 菜单项Id
  * {String} menuItemName 菜单项名称
  * {String} menuItemUrl 菜单项对应js对象名
  * {String} menuItemIcon 菜单项图标
  * --------------------------------------------------------------
 */
divo.tree.MenuTree  = Ext.extend(Ext.tree.TreePanel, {
	initComponent : function() {
		Ext.apply(this,{
			animate : false,
			autoScroll : true,
			enableDD : false,
			containerScroll : true,
			lines : true,
			tbar : this.createTopBar(),
			rootVisible : false,
			root : new Ext.tree.TreeNode({
				text : "全部",
				leaf : false,
				expanded : true
			})
		})
		divo.tree.MenuTree.superclass.initComponent.call(this)
	},
	afterRender : function() {
		divo.tree.MenuTree.superclass.afterRender.call(this)
		this.on("click", this.onNodeClicked, this)
		this.setupMenu()
	},
    createTopBar : function() {
        return  new Ext.Toolbar({
            items: ['->',{
                icon : divo.iconCollapseAll2,
                cls : 'x-btn-icon',
                tooltip : '全部折叠',
                handler : this.onCollapseAll,
                scope : this
            }]
        })
    },
    onCollapseAll : function() {
        this.root.collapse(true)
    },
    onNodeClicked : function(node,e,autoActivated) {
		if (!node.attributes.leaf) return
		
		var v = (autoActivated==undefined?true:false)
		this.publish("divo.tree.MenuItemSelect",{
			sender:this.id,
			menuItemId:node.attributes.code,
			menuItemName:node.attributes.text,
			menuItemIcon:node.attributes.icon,
			menuItemUrl:node.attributes.url,
			autoActivated : v
		})
	},
	setupMenu : function() {
		var menuDefinitions = []
		var mainMenus = []
		var menus
		Ext.Ajax.request({
			scope : this,
			url : "/users/"+this.getUserId()+"/modules/default/menus" ,
			async : true,
			method : 'GET',
			success : function(response, options) {
				var resp = Ext.decode(response.responseText)
				if (resp.totalCount==0) return
				menus = resp.rows
						
				var idList = ""
				for (var i=0; i < menus.length; i++) {
					if (i==menus.length-1)
						idList += menus[i].id
					else	
						idList += menus[i].id+"_"
				}	
				mainMenus = menus
				Ext.Ajax.request({
					scope : this,
					url : "/users/"+this.getUserId()+"/menus/"+idList+"/items" ,
					async : true,
					method : 'GET',
					success : function(response, options) {
						var resp = Ext.decode(response.responseText)
						for (var i=0; i < mainMenus.length; i++) {
							var menu = {
								title : mainMenus[i].name,
								items : []
							}
							for (var j=0; j < resp.rows.length; j++) {
								var row = resp.rows[j]
								if (row.menu_id+'' == mainMenus[i].id+'')
									menu.items.push({
										text : row.name,
										id : row.id,
										url : row.url,
										icon : row.small_image
									})
							}
							menuDefinitions.push(menu)
						}
						this.initMenu(menuDefinitions)
					},
					failure : function(response, options) {
						this.alert(response.responseText)
					}
				})
			},
			failure : function(response, options) {
				this.alert(response.responseText)
			}
		})
	},
	initMenu : function(menuDefinitions) {
		for (var i=0; i < menuDefinitions.length; i++) {
			var p = menuDefinitions[i]
			var nodeOfMainMenu = new Ext.tree.TreeNode({
				text : p.title,
				leaf : false
			}) //主菜单
			this.root.appendChild(nodeOfMainMenu)
			for (var j=0; j < p.items.length; j++) {
				var item = p.items[j]
				nodeOfMainMenu.appendChild(new Ext.tree.TreeNode({
						text : item.text,
						code : item.id,
						url : item.url,
						icon : "/media/images/menus/"+item.icon,
						leaf : true
				}))
			} //菜单项
		}
		this.root.expand(true)
	}
})

Ext.reg("divo.tree.MenuTree", divo.tree.MenuTree )
// EOP

