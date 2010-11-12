Ext.namespace('Ext.ux', 'Ext.ux.form');

Ext.ux.form.MagnifiedTextArea = Ext.extend(Ext.form.TextArea,  
{
   icon: '',
   msg: '',
   textHeight: 400,
   title: '', //无fieldLable时应定义此属性值
   tooltip: '放大输入框',
   
   onRender: function(ct, position)
   {
      Ext.ux.form.MagnifiedTextArea.superclass.onRender.call(this, ct, position);
      if(!this.readOnly) {
	      this.img = Ext.DomHelper.insertAfter(this.el, {tag: 'img', src: Ext.BLANK_IMAGE_URL, cls: 'x-form-magnifiedTextArea'}, true);
	      this.img.on('click', this.showDialog, this);
	      if (this.tooltip)
	      {
	         Ext.QuickTips.init();
	         if(typeof this.tooltip == 'object')
	            this.tool = new Ext.ToolTip(Ext.apply(this.tooltip, {target: this.img.id}));
	         else if (typeof this.tooltip == 'string')
	            this.tool = new Ext.ToolTip(
	            {
	               target: this.img.id,
	               html: this.tooltip
	            }
	            );
	      }
      } //只读时无此功能（可能弹出窗口在当前窗口后面）
   },
   
   onDestroy: function()
   {
      this.img.removeAllListeners();
      Ext.removeNode(this.img);
      if (this.tool)
         this.tool.destroy();
         
      Ext.ux.form.MagnifiedTextArea.superclass.onDestroy.call(this);
    },
    
    //private
    retrieveValue: function(btn, value)
    {
       if (btn == 'ok')
          this.setValue(value); 
    },
    
    showDialog: function()
    {
       Ext.MessageBox.show(
       {
          animEl: this.el,
          buttons: Ext.MessageBox.OKCANCEL,
          closable: true,
          fn: this.retrieveValue,
          icon: this.icon,
          modal: true,
          msg: this.msg,
          multiline: this.textHeight,
          scope: this,
          title: this.title?this.title:this.fieldLabel,
          value: this.getValue(),
 		  minWidth : this.width-10  //使输入框宽度和原宽度一致
       }
       );
   }
}
);

Ext.reg('magnifiedTextArea', Ext.ux.form.MagnifiedTextArea);