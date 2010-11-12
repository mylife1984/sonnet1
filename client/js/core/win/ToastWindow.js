//Thanks: https://extjs.com/forum/showthread.php?t=32365
Ext.ux.ToastWindowMgr = {
    positions: [] 
};

Ext.ux.ToastWindow = Ext.extend(Ext.Window, {
    initComponent: function(){
          Ext.apply(this, {
            iconCls: this.iconCls || 'x-icon-information',
            width: 300,
            autoHeight: true,
            //closable: false,
            plain: false,
            //draggable: false,
            modal : false,
            //!this.autoDestroy,
            bodyStyle: 'text-align:center;padding:10px 1px 10px 1px;background-color:white;color:red;'
          });
          if(this.autoDestroy) {
          	this.task = new Ext.util.DelayedTask(this.hide, this);
          }
        Ext.ux.ToastWindow.superclass.initComponent.call(this);
    },
    setMessage: function(msg){
        this.body.update(msg);
    },
    setTitle: function(title, iconCls){
        Ext.ux.ToastWindow.superclass.setTitle.call(this, title, iconCls||this.iconCls);
    },
    onRender:function(ct, position) {
        Ext.ux.ToastWindow.superclass.onRender.call(this, ct, position);
    },
    onDestroy: function(){
        Ext.ux.ToastWindowMgr.positions.remove(this.pos);
        Ext.ux.ToastWindow.superclass.onDestroy.call(this);
    },
    afterShow: function(){
        Ext.ux.ToastWindow.superclass.afterShow.call(this);
        this.on('move', function(){
            Ext.ux.ToastWindowMgr.positions.remove(this.pos);
            if (this.task)
            	this.task.cancel();
        }, this);
        if(this.autoDestroy) {
            this.task.delay(this.hideDelay || 5000);
       }
    },
    animShow: function(){
        this.pos = 0;
        while(Ext.ux.ToastWindowMgr.positions.indexOf(this.pos)>-1)
            this.pos++;
        Ext.ux.ToastWindowMgr.positions.push(this.pos);
        this.setSize(300,100);
        this.el.alignTo(document, "br-br", [ -20, -20-((this.getSize().height+10)*this.pos) ]);
        this.el.slideIn('b', {
            duration: 1,
            callback: this.afterShow,
            scope: this
        });    
    },
    animHide: function(){
        Ext.ux.ToastWindowMgr.positions.remove(this.pos);
        this.el.ghost("b", {
            duration: 1,
            remove: true
        });    
    }
}); 
//EOP
