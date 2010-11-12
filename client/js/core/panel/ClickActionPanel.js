/**
 * Thanks: http://extjs.com/forum/showthread.php?t=44107
 * 
 * --------------------------------------------------------------
 * 消息：
 * 点击了链接
 * 
 * 消息名：     			
 * ux.clickAction   
 * 
 * 消息内容：
 * {int} sender 本组件的id值
 * {int} targetId 链接Id
 * --------------------------------------------------------------
 */
Ext.ux.ClickActionPanel = Ext.extend(Ext.Panel, {
    
    doAction: function(e, t){
        e.stopEvent();
        //this.fireEvent('clicked_on_' + t.id);
        this.publish("ux.clickAction",{
        	targetId : t.id,
        	targetText : t.innerHTML,
        	sender:this.id
        })
    },
    
    onRender: function () {
        Ext.ux.ClickActionPanel.superclass.onRender.apply(this, arguments);
        this.body.on('mousedown', this.doAction, this, {delegate:'a'});
        this.body.on('click',Ext.emptyFn,null,{delegate:'a', preventDefault:true});
    }
    
});

Ext.reg('clickactionpanel', Ext.ux.ClickActionPanel); // register xtype
//EOP
