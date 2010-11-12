Ext.namespace('Ext.ux.form');

/**
 * --------------------------------------------------------------
 * 消息：
 * 用户选择了
 * 
 * 消息名：     			
 * ux.form.LovField.Select<本器件的id值>  
 * 
 * 消息内容：
 * {String} sender 本器件的id值
 * {String} displayValue 显示值
 * {String} returnValue 返回值
 * {Object} record 选择的记录对象
 * --------------------------------------------------------------
 * 消息：
 * 窗口显示了
 * 
 * 消息名：     			
 * ux.form.LovField.ShowWindow<本器件的id值>  
 * 
 * 消息内容：
 * {String} sender 本器件的id值
 * {Object} window对象
 * --------------------------------------------------------------

Thanks: http://madrabaz.com/ext/ux/LovField/demo/

        http://extjs.com/forum/showthread.php?t=26146&page=3 
        (添加了 displayValue (displays selected values in the text field)
                hiddenValue (sets the hidden value, ID's, to be posted.)
                
        本人修改为只支持网格。                

Config Options
--------------

alwaysLoadStore : True to reload data store each time the LOV is opened(default to false)

displayField : The data store field name or Ext.XTemplate instance or config option to use for a display(default to 'id')

displaySeparator : String to separate selected item displays(defaults to ',' if textarea = false or '\n' if textarea = true)

lovHeight : LOV window width (default to 300)

lovTitle : LOV window title (default to '')

lovWidth : LOV window width (default to 300)

maxItem : Maximum selected item number required(default to Number.MAX_VALUE)

maxItemText : Error text to display if the maximum select validation fails (default to 'The maximum selected item number for this field is {0}')

minItem : Minimum selected item number required(default to 0)

minItemText : Error text to display if the minimum select validation fails (default to 'The minimum selected item number for this field is {0}')

multiSelect : True to allow selection of more than one item at a time (default to false)

qtipTpl : Ext.XTemplate instance or config option to display the qtip(default to undefined)

showOnFocus : True to show LOV window when user focus the field(default to false)

textarea : True to display the textarea field instead of text field (default to false)

valueField : The data store field name to use for a value(default to 'id')

valueSeparator : String to separate selected item values(default to ',')

view : The Ext.grid.GridPanel or Ext.DataView to bind this LovField

windowConfig : LOV window config options(autoScroll, layout, bbar and items options are not changed)

displayValue: 

hiddenValue:

isReadOnly: 代替 readOnly 设置只读（不让选择）

*/
Ext.ux.form.LovField = Ext.extend(Ext.form.TriggerField, {
    defaultAutoCreate : {tag: "input", type: "text", size: "16",style:"cursor:default;", autocomplete: "off"},
    triggerClass: 'x-form-search-trigger',
    validateOnBlur: false,

    // LOV window width
    lovWidth: 300,
    // LOV window height
    lovHeight: 300,
    // LOV window title
    lovTitle: '',
    // Multiple selection is possible?
    multiSelect: false,

    // If this option is true, data store reloads each time the LOV opens
    alwaysLoadStore: false,
    // LOV data provider, intance of Ext.grid.GridPanel or Ext.DataView
    view: {},

    displayValue: '',
    hiddenValue: '',    
    
    // Which data store field will use for return
    valueField: 'id',
    // Which data store field will use for display
    displayField: 'id',
    // If multiple items are selected, they are joined with this character
    valueSeparator: ',',
    displaySeparator: ',',

    // LOV window configurations
    // autoScroll, layout, bbar and items configurations are not changed by this option
    windowConfig: {},
    showOnFocus : false,

    minItem : 0,
    minItemText : '至少应该选择{0}项',
    minItemText2 : '至少应该选择{0}项，最多允许选择{1}项',

    maxItem : Number.MAX_VALUE,
    maxItemText : '最多允许选择{0}项',

    // Private
    isStoreLoaded: false,
    // Private
    selections: [],
    // Private
    selectedRecords: null,

    initComponent: function(){
       	this.hiddenName = this.hiddenName || this.name //保证FindField能找到
        this.multiSelect = this.maxItem > 1
        
        Ext.ux.form.LovField.superclass.initComponent.call(this);
    },

    onRender: function(ct, position){
        if (this.isRendered) {
            return;
        }

        this.readOnly = true;
        if(this.textarea){
            this.defaultAutoCreate = {tag: "textarea", style:"cursor:default;width:124px;height:200px;", autocomplete: "off", value: this.displayValue};
            this.displaySeparator = '\n';
        }
        this.value = this.displayValue;

        Ext.ux.form.LovField.superclass.onRender.call(this, ct, position);

        this.hiddenField = this.el.insertSibling({tag:'input', type:'hidden',
        name: this.el.dom.getAttribute('name'), id: this.id + '-hidden'}, 'before', true);
        this.hiddenField.value = this.hiddenValue;

        // prevent input submission
        this.el.dom.removeAttribute('name');

        if(this.showOnFocus){
            this.on('focus',this.onTriggerClick,this);
        }

        this.isRendered = true;
    },
    
    afterRender : function() {
		Ext.ux.form.LovField.superclass.afterRender.apply(this,arguments)
    	
        this.viewType = 'grid'
        
        if(this.viewType == 'grid') {
            this.view.sm = this.view.getSelectionModel();
            this.view.store = this.view.getStore();
        }

        if(this.viewType == 'grid'){
            this.view.sm.singleSelect = !this.multiSelect;
        }else{
            this.view.singleSelect = !this.multiSelect;
            this.view.multiSelect = this.multiSelect;
        }

        if(Ext.type(this.displayField) == 'array'){
            this.displayField = this.displayField.join('');
        }
        if (/<tpl(.*)<\/tpl>/.test(this.displayField) && !(this.displayFieldTpl instanceof Ext.XTemplate)) {
            this.displayFieldTpl = new Ext.XTemplate(this.displayField).compile();
        }

        if(Ext.type(this.qtipTpl) == 'array'){
            this.qtipTpl = this.qtipTpl.join('');
        }
        if(/<tpl(.*)<\/tpl>/.test(this.qtipTpl) && !(this.qtipTpl instanceof Ext.XTemplate) ){
            this.qtipTpl = new Ext.XTemplate(this.qtipTpl).compile();
        }

        // If store was auto loaded mark it as loaded
        if (this.view.store.autoLoad) {
            this.isStoreLoaded = true;
        }
        
    },

    validateValue : function(value){
    	if (this.hiddenValue) return true
    	
        if( Ext.ux.form.LovField.superclass.validateValue.call(this, value)){
            if(this.selectedRecord && this.selectedRecords.length < this.minItem){
            	if (this.maxItem != Number.MAX_VALUE)
                    this.markInvalid(String.format(this.minItemText2, this.minItem, this.maxItem));
                else    
                    this.markInvalid(String.format(this.minItemText, this.minItem));
                return false;
            }
            if(this.selectedRecord && this.selectedRecords.length > this.maxItem){
                this.markInvalid(String.format(this.maxItemText, this.maxItem));
                return false;
            }
        }else{
            return false;
        }
        return true;
    },

    getSelectedRecords : function(){
        if(this.viewType == 'grid'){
            this.selections = this.selectedRecords = this.view.sm.getSelections();
        }else{
            this.selections = this.view.getSelectedIndexes();
            this.selectedRecords = this.view.getSelectedRecords();
        }

        return this.selectedRecords;
    },

    clearSelections : function(){
        return (this.viewType == 'grid')? this.view.sm.clearSelections() : this.view.clearSelections();
    },

    select : function(selections){
        if(this.viewType == 'grid'){
            if(selections[0] instanceof Ext.data.Record){
                this.view.sm.selectRecords(selections);
            }else{
                this.view.sm.selectRows(selections);

            }
        }else{
            this.view.select(selections);
        }
    },

    onSelect: function(){
        var d = this.prepareValue(this.getSelectedRecords());
        var returnValue = d.hv ? d.hv.join(this.valueSeparator) : '';
        var displayValue = d.dv ? d.dv.join(this.displaySeparator) : '';

        Ext.form.ComboBox.superclass.setValue.call(this, displayValue);
        this.hiddenField.setAttribute('value', returnValue);

        this.publish("ux.form.LovField.Select"+this.id,{
        	sender:this.id,
        	returnValue:returnValue,
        	displayValue:displayValue,
			record : this.getSelectedRecords()[0].data
        })

        if(Ext.QuickTips){ // fix for floating editors interacting with DND
            Ext.QuickTips.enable();
        }
        this.window.hide();
    },

    prepareValue:function(sRec){
        //this.el.dom.qtip = '';
        if (sRec.length > 0) {
            var vals = {"hv": [],"dv": []};
            Ext.each(sRec, function(i){
                vals.hv.push(i.get(this.valueField));
                if (this.displayFieldTpl) {
                    vals.dv.push(this.displayFieldTpl.apply(i.data));
                } else {
                    vals.dv.push(i.get(this.displayField));
                }

                //if(this.qtipTpl){
                //    this.el.dom.qtip += this.qtipTpl.apply(i.data);
                //}

            }, this);
            return vals;
        }
        return false;
    },

    getValue:function(){
        var v = this.hiddenField.value;
        if(v === this.emptyText || v === undefined){
            v = '';
        }
        return v;
    },

    onTriggerClick: function(e){
    	if (this.isReadOnly || this.disabled)  //避免使用 readOnly
    	    return
    	    
        // Store Load
        if (!this.isStoreLoaded) {
            this.view.store.load();
            this.isStoreLoaded = true;
        } else if (this.alwaysLoadStore === true) {
            this.view.store.reload();
        }

        this.windowConfig = Ext.applyIf(this.windowConfig,
        {
            title: this.lovTitle,
            width: this.lovWidth,
            height: this.lovHeight,
            modal : true,
            autoScroll: true,
            layout: 'fit',
            bbar: new Ext.Toolbar({
				cls: 'go-paging-tb',
				items: [{
	            	text: '<img src="/media/images/divo/delete-red.gif"><span>取消</span>',
	            	tooltip : "关闭窗口不做任何选择",
	            	handler: function(){
	                	this.select(this.selections);
	                	this.window.hide();
	            	},
	            	scope: this
	           	},{
	           		text: '<img src="/media/images/divo/clear.gif"><span>清除</span>', 
	            	tooltip : "清除当前所选行",
	           		handler: function(){ 
	           		    this.clearSelections();
	         		},
	         		scope: this
	        	},'->',{
	        		text: '<img src="/media/images/divo/add2.gif"><span>选择</span>',
	            	tooltip : "关闭窗口并选择所选行",
	        		handler: this.onSelect,
	        		scope: this
	       		}]
       		}),
            items: this.view
        },{shadow: false, frame: true});

        if(!this.window){
            this.window = new Ext.Window(this.windowConfig);

            if (e && e.xy)
            	this.window.setPagePosition(e.xy[0] + 16, e.xy[1] + 16);

            this.window.on('beforeclose', function(){
                this.window.hide();
                return false;
            }, this);

            this.window.on('hide', this.validate, this);
            this.view.on('dblclick', this.onSelect, this);
            this.view.on('render', this.initSelect, this);
        }

        this.window.show();
        this.publish("ux.form.LovField.ShowWindow"+this.id,{
        	sender:this.id,
        	window:this.window,
        	view:this.view
        })
    },
    initSelect: function() {
    	if (!this.hiddenValue) return
    	
        rows = this.hiddenValue.split(''+this.valueSeparator);
        var records = new Array();
        
		for(i=0;i<rows.length;i++) {
			record = this.view.getStore().getById(rows[i]);
			records.push(record);
		} 
		
        this.view.sm.selectRecords(records, true);            
    },
    //public
    setNameValue : function(name,id) {
    	this.setValue(name)
    	this.hiddenField.setAttribute('value', id)
    }
    
});

Ext.reg('xlovfield', Ext.ux.form.LovField);