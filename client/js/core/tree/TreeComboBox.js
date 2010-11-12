//Thanks: http://www.sencha.com/forum/showthread.php?27269-2.x-ComboBox-Tree/page3
divo.tree.TreeComboBox = Ext.extend(Ext.form.ComboBox, { 
    tree: null, 
    treeId: 0, 
    initComponent: function(){     	
    	//注意：因为id固定，所以此控件不能同时用于多个组件实例
        this.treeId = "divo-tree-combo"
        this.focusLinkId = "divo-tree-combo-link"
         
        Ext.apply(this, { 
            store:new Ext.data.SimpleStore({fields:[],data:[[]]}), 
            editable:false, 
            shadow:false, 
            mode: 'local', 
            triggerAction:'all', 
            maxHeight: 200, 
            tpl: Templates.treeComboBoxTpl,
            selectedClass:'', 
            onSelect:Ext.emptyFn, 
            valueField: 'id' 
        }); 
        
        this.on('expand', this.onExpand); 
        this.tree.on('click', this.onClick, this); 
         
        divo.tree.TreeComboBox.superclass.initComponent.call(this);          
    }, 
    onRender:function(ct,position) {
        divo.tree.TreeComboBox.superclass.onRender.call(this, ct, position);

        var wrap = this.el.up('div.x-form-field-wrap');
        this.wrap.applyStyles({position:'relative'});
        this.el.addClass('x-icon-combo-input');
        this.flag = Ext.DomHelper.append(wrap, {
            tag: 'div', style:'position:absolute'
        });
    },
	setIconCls: function(node) {
		var cls = node.attributes.iconCls
		if(!cls)
			cls = 'icon-default-tree-node-root'
		this.flag.className = 'x-icon-combo-icon ' + cls;        
    },
    onTriggerClick : function(){ 
        if(this.disabled){ 
            return; 
        } 
        if(this.isExpanded()){ 
            this.collapse(); 
        }else { 
            this.onFocus({}); 
            if(this.triggerAction == 'all') { 
                this.doQuery(this.allQuery, true); 
            } else { 
                this.doQuery(this.getRawValue()); 
            } 
        } 
    }, 
    onFocus : function () { 
        divo.tree.TreeComboBox.superclass.onFocus.call(this); 
        Ext.get(this.focusLinkId).focus(); 
    }, 
    onClick: function (node) { 
        this.selectedTreeNode = node; 
        
        this.valueNotFoundText = node.text; //使显示名称
        this.setValue(node.id); 
        this.setIconCls(node)
        this.collapse(); 
    }, 
    onExpand: function(){ 
        this.tree.render(this.treeId); 
        this.tree.focus(); 
    },
    //public
    getSelectedNode : function() {
    	return this.selectedTreeNode
    },
    //public
	showNode : function(node) {
		this.onClick(node)
	}	
    
}); 

Ext.reg("divo.tree.treecombobox", divo.tree.TreeComboBox);  