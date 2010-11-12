/**
 * 改写Ext组件的默认行为（与本项目业务逻辑相关的部分)
 */
Ext.override(Ext.Component, {
	menuItemId : null,
    //有新建操作权限吗？
    canCreate : function() {
    	if (this.menuItemId)
        	return divo.canCreate(this.menuItemId)
        else
        	return true
    },
    //有修改操作权限吗？
    canUpdate : function() {
    	if (this.menuItemId)
	        return divo.canUpdate(this.menuItemId)
	    else    
        	return true
    },
    //有删除操作权限吗？
    canDelete : function() {
    	if (this.menuItemId)
	        return divo.canDelete(this.menuItemId)
	    else    
        	return true
    }
})
//EOP

