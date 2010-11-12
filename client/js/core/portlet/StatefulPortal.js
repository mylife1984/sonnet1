// Thanks: http://extjs.com/forum/showthread.php?t=25042
Ext.ux.StatefulPortal = Ext.extend(Ext.ux.Portal, {
    // configurables
	autoScroll:false, //非弹出方式最大化时需要
    columnCount:4
    // {{{
    ,initComponent:function() {

        Ext.apply(this, {}
        ); // end of apply

        // call parent
        Ext.ux.StatefulPortal.superclass.initComponent.apply(this, arguments);

    } // end of function initComponent
    // }}}
    // {{{
    ,getConfig:function() {
        var pConfig = [[]]
        
        var col;
        for(var c = 0; c < this.items.getCount(); c++) {
            col = this.items.get(c);    
            pConfig[c] = [];
            if(col.items) {
                for(var s = col.items.getCount()-1; s >= 0; s--) {
                    pConfig[c].push(col.items.items[s].getConfig());
                }
            }
        } 
        //pConfig值说明:
        //[
        // [{id:'portlet2'},{id:'portlet1'}], //第1列(打开了2个portlet,注意要倒序排列)
        // [undefined] //第2列(无portlet打开)
        //]
        return pConfig;
    }
    // }}}
    // {{{
    ,afterRender: function() {

        // call parent
        Ext.ux.StatefulPortal.superclass.afterRender.apply(this, arguments);
        this.body.setStyle('overflow-y', 'scroll');

    } // end of function afterRender
    // }}}

}); // end of extend

// register xtype
Ext.reg('statefulportal', Ext.ux.StatefulPortal);  
//EOP
