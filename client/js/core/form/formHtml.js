// SimpleHtml 


Ext.namespace('Ext.ux.form');
Ext.ux.form.SimpleHtml = Ext.extend(Ext.form.Field,  
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
           
		this.component = new Ext.Component({
			renderTo : this.el,
			autoEl	 : { html: this.value },
			scope    : this.scope || this,
			style    : "padding-top:2px;"+(this.bodyStyle || "") // Correct the aligning with the label
		})
		
		this.hiddenName = this.name; // Make findField working
			
	},
	getValue : function()
	{	return this.component.autoEl.html;
	},
	setValue : function(value)
	{	this.component.getEl().dom.innerHTML = value;
		this.value = value;
	}
});

Ext.ComponentMgr.registerType("formHtml", Ext.ux.form.SimpleHtml );