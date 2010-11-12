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

