// ButtonField 
// based on http://extjs.com/forum/showthread.php?t=6099&page=2 by jgarcia@tdg-i.com

Ext.namespace('Ext.ux.form');

Ext.ux.form.ButtonField = Ext.extend(Ext.form.Field,  
{
	defaultAutoCreate : 
	{ 
		tag: 'div' 
	},
	
	value : '',
	
	onRender: function (ct, position) 
	{
            if(!this.el)
            {
                var cfg = this.getAutoCreate();
                if(!cfg.name)
                {
                    cfg.name = this.name || this.id;
                }
                if(this.inputType)
                {
                    cfg.type = this.inputType;   
				}
                this.el = ct.createChild(cfg, position);
            }

		this.button = new Ext.Button(
		{
			renderTo : this.el,
			text     : this.text,
			iconCls  : this.iconCls || null,
			handler  : this.handler || Ext.emptyFn,
			scope    : this.scope   || this
		})
	},
	getValue : function()
	{	return this.button.text;
	},
	setValue : function(value)
	{	this.button.text = value;
		this.value = value;
	}
});

Ext.ComponentMgr.registerType("formBtn", Ext.ux.form.ButtonField );
