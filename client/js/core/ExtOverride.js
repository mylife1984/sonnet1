/**
 * 改写Ext组件的默认行为
 */
Ext.override(Ext.Component, {
	defaults : {
		border : false
	},
	getAppContext : function() {
		return divo.appContext
	},
	getUserId : function() {
		return divo.getUserId()
	},
	getUserFullName : function() {
		return divo.getUserFullName()
	},
    getDeptId : function() {
        return divo.getDeptId()
    },
    getDeptName : function() {
        return divo.getDeptName()
    },
	myId : function(id) {
		return this.id + "-" + id
	},
	subscribe : function(name, callback, scope) {
		if (!this.pagebusSubs)
		    this.pagebusSubs = []
		this.pagebusSubs.push(divo.subscribe(name, callback, scope))
	},
	unsubscribe : function() {
		if (!this.pagebusSubs) return
		
		for (var i = 0; i < this.pagebusSubs.length; i++)
			divo.unsubscribe(this.pagebusSubs[i])
	},
	publish : function(name, message) {
		divo.publish(name, message)
	},
	alert : function(msg) {
		divo.showError(msg)
	},
    err : function(msg) {
        divo.err(msg);
    },
    say : function(msg) {
        divo.say(msg);
    }
})

Ext.override(Ext.form.BasicForm, {
	//解决将NumericField没有转换为数值的问题
	getObjectValues : function() {
		var vv = this.getValues()
		this.items.each(function(f){
             if (f.xtype=='numberfield') {
                 vv[f.name] = parseFloat(vv[f.name]||0)
             }  
             if (f.xtype=='xcheckbox') {
                 vv[f.name] = eval(vv[f.name])
             }  
		})     
		return vv
	}, 
	//解决后台逻辑型字段返回0和1的问题
    setValues : function(values){
        if(Ext.isArray(values)){ // array of objects
            for(var i = 0, len = values.length; i < len; i++){
                var v = values[i];
                var f = this.findField(v.id);
                if(f){
                    f.setValue(v.value);
                    if(this.trackResetOnLoad){
                        f.originalValue = f.getValue();
                    }
                }
            }
        }else{ // object hash
            var field, id;
            for(id in values){
                if(typeof values[id] != 'function' && (field = this.findField(id))){
                	if (field.xtype=='xcheckbox' && typeof values[id]!='boolean')
                    	field.setValue(values[id]?true:false);
                	else
                    	field.setValue(values[id]);
                    if(this.trackResetOnLoad){
                        field.originalValue = field.getValue();
                    }
                }
            }
        }
        return this;
    }
})

//根据 divo.grid.SimpleGrid 的需要而重写
Ext.override(Ext.DataView, {
	refresh : function() {
		this.clearSelections(false, true)
		this.el.update("")
		var r = this.store.getRange()
		if (r.length < 1) {
			this.el.update(this.emptyText)
			this.all.clear()
			return
		}
		this.tpl.overwrite(this.el, this.collectData(r, 0))
		this.all.fill(Ext.query(this.itemSelector, this.el.dom))
		this.updateIndexes(0)
		this.fireEvent("afterRefresh", this)
	}
})

//关闭按钮的handler直接可以这样使用：
//			buttons : [{
//				text : "关闭",
//				handler : this.onCancel,
//				scope : this
//			}]
//另外，cancelAction 也可以像 closeAction一样设置，如：
//
//test.window.MyProfileWindow = Ext.extend(Ext.Window, {
//	cancelAction : "destroy",
//	closeAction : "destroy",
//	initComponent : function() {
//  。。。
//  
Ext.override(Ext.Window, {
	cancelAction : "destroy",
	onCancel : function() {
		this[this.cancelAction]()
	},
	//Keep window in viewport and no shadows by default for IE performance
	shadow : false,
	constrainHeader : true
})

// 中文语言包(ext-lang-zh_CN.js)补丁
Ext.apply(Ext.PagingToolbar.prototype, {
	beforePageText : "第",
	afterPageText : "页共 {0} 页",
	firstText : "第一页",
	prevText : "前一页",
	nextText : "下一页",
	lastText : "最后页",
	refreshText : "刷新",
	displayMsg : "显示{0}-{1}共{2}条",
	emptyMsg : '共0条'
})
Ext.apply(Ext.DatePicker.prototype, {
	todayText : "今天",
	minText : "日期在最小日期之前",
	maxText : "日期在最大日期之后",
	disabledDaysText : "",
	disabledDatesText : "",
	monthNames : Date.monthNames,
	dayNames : Date.dayNames,
	nextText : '下月 (Control+Right)',
	prevText : '上月 (Control+Left)',
	monthYearText : '选择一个月 (Control+Up/Down 来改变年)',
	todayTip : "{0} (空格键选择)",
	format : "y年m月d日"
})
Ext.apply(Ext.grid.GroupingView.prototype, {
		groupByText : '分组',
		showGroupsText : '分组有效'
})
Ext.apply(Ext.grid.GridView.prototype, {
      sortAscText  : "升序",
      sortDescText : "降序",
      lockText     : "锁列",
      unlockText   : "解锁列",
      columnsText  : "列",
      emptyText    : "没有找到记录"
})

//Thanks: http://extjs.com/forum/showthread.php?t=34819
	Ext.apply(Ext.menu.TextItem.prototype, {
        setText : function(text){
            this.text = text;
            if(this.rendered){
                this.el.update(text);
                this.parentMenu.autoWidth();
            }
        }
    });

//http://extjs.com/forum/showthread.php?t=36474
//本人修改有修改：可以指定searchField
Ext.override(Ext.form.ComboBox, {
    doQuery : function(q, forceAll){
        if(q === undefined || q === null){
            q = '';
        }
        this.queryFilterByValue = q  //added
        var qe = {
            query: q,
            forceAll: forceAll,
            combo: this,
            cancel:false
        };
        if(this.fireEvent('beforequery', qe)===false || qe.cancel){
            return false;
        }
        q = qe.query;
        forceAll = qe.forceAll;
        if(forceAll === true || (q.length >= this.minChars)){
            if(this.lastQuery !== q){
                // change: Durlabh's change start
                var lastQuery = this.lastQuery;
                // change:
                this.lastQuery = q;
                if(this.mode == 'local'){
                    this.selectedIndex = -1;
                    if(forceAll){
                        this.store.clearFilter();
                    }else{
                    	//added start
                        if (this.searchField)  {
                            //例如：下拉显示值为：
                            // 1 优先
                            // 2 一般
                            // 3 普通
                            //用户可以直接输入1或2或3就能选择，但复选框中仍然显示中文名称。
                            //此时,就要将searchField设置为数字对应的字段名。
                            if (typeof this.queryFilterByFunc == "function") {
                                //当store有可能被加上 filter 时，要定义 queryFilterByFunc，
                            	//该函数中，this.ownerCt 指向放置combo的表单类对象
                            	this.store.filterBy(this.queryFilterByFunc.createDelegate(this));
                            } else {	
                            	this.store.filter(this.searchField, q);
                            }	
                        } else {    
	                    	//added end
                            this.store.filter(this.displayField, q);
                        }    
                    }
                    this.onLoad();
                }else{
                    this.store.baseParams[this.queryParam] = q;
                    this.store.load({
                        params: this.getParams(q)
                    });
                    this.expand();
                }
            }else{
                this.selectedIndex = -1;
                this.onLoad();
            }
        }
    }
});

//nodeConfigFn： 调用该方法构建节点对象,并实现服务器返回的数据映射到标准节点属性
Ext.override(Ext.tree.TreeLoader,{
    processResponse : function(response, node, callback){
        var json = response.responseText;
        try {
            var o = eval("("+json+")");
            node.beginUpdate();
            for(var i = 0, len = o.length; i < len; i++){
            	if (this.nodeConfigFn)
                	var n = this.createNode(this.nodeConfigFn(o[i]));
                else	
                	var n = this.createNode(o[i]);
                if(n){
                    node.appendChild(n);
                }
            }
            node.endUpdate();
            if(typeof callback == "function"){
                callback(this, node);
            }
        }catch(e){
            this.handleFailure(response);
        }
    }
})

//Thanks: http://extjs.com/forum/showthread.php?t=17396&page=2
Ext.override(Ext.layout.FormLayout, {
    renderItem : function(c, position, target){
        if(c && !c.rendered && c.isFormField && c.inputType != 'hidden'){
            var args = [
                   c.id, c.fieldLabel,
                   c.labelStyle||this.labelStyle||'',
                   this.elementStyle||'',
                   typeof c.labelSeparator == 'undefined' ? this.labelSeparator : c.labelSeparator,
                   (c.itemCls||this.container.itemCls||'') + (c.hideLabel ? ' x-hide-label' : ''),
                   c.clearCls || 'x-form-clear-left' 
            ];
            if(typeof position == 'number'){
                position = target.dom.childNodes[position] || null;
            }
            c.actionMode = 'formItem';
            if(position){
                c.formItem = Ext.get(this.fieldTpl.insertBefore(position, args));
            }else{
                c.formItem = Ext.get(this.fieldTpl.append(target, args));
            }
            c.render('x-form-el-'+c.id);
        }else {
            Ext.layout.FormLayout.superclass.renderItem.apply(this, arguments);
        }
    }
});

//Thanks: http://extjs.com/forum/showthread.php?t=47607
Ext.override( Ext.FormPanel ,{

    /**
     * Starts monitoring of the valid state of this form. Usually this is done by passing the config
     * option "monitorValid"
     */
    startMonitoring : function(){
        if(!this.bound){
            this.bound = true;
            if(!this.monitorTask){  //Make sure only one is running
               this.monitorTask = Ext.TaskMgr.start({
                   run : this.bindHandler,
                   interval : this.monitorPoll || 200,
                   scope: this
               });
            }
        }
    },

    /**
     * Stops monitoring of the valid state of this form
     */
    stopMonitoring : function(){
        this.bound = false;
        if(this.monitorTask){
           Ext.TaskMgr.stop(this.monitorTask);
           this.monitorTask = null;
        }
    }
}); 

//Thanks: http://extjs.com/forum/showthread.php?t=39161
Ext.override(Ext.form.RadioGroup, {
  getName: function() {
    return this.items.first().getName();
  },

  getValue: function() {
    var v;

    this.items.each(function(item) {
      v = item.getRawValue();
      return !item.getValue();
    });

    return v;
  },

  setValue: function(v) {
    this.items.each(function(item) {
      item.setValue(item.getRawValue() == v);
    });
  }
});

//长度考虑汉字
Ext.override(Ext.form.TextField, {
    validateValue : function(value){
        if(value.getHzLength() < 1 || value === this.emptyText){ // if it's blank
             if(this.allowBlank){
                 this.clearInvalid();
                 return true;
             }else{
                 this.markInvalid(this.blankText);
                 return false;
             }
        }
        if(value.getHzLength() < this.minLength){
            this.markInvalid(String.format(this.minLengthText, this.minLength));
            return false;
        }
        if(value.getHzLength() > this.maxLength){
            this.markInvalid(String.format(this.maxLengthText, this.maxLength));
            return false;
        }
        if(this.vtype){
            var vt = Ext.form.VTypes;
            if(!vt[this.vtype](value, this)){
                this.markInvalid(this.vtypeText || vt[this.vtype +'Text']);
                return false;
            }
        }
        if(typeof this.validator == "function"){
            var msg = this.validator(value);
            if(msg !== true){
                this.markInvalid(msg);
                return false;
            }
        }
        if(this.regex && !this.regex.test(value)){
            this.markInvalid(this.regexText);
            return false;
        }
        return true;
    }
});

//Thanks: http://extjs.com/forum/showthread.php?t=64032
Ext.override(Ext.TabPanel, {
    setActiveTab : function(item){
        item = this.getComponent(item);
        if(!item || this.fireEvent('beforetabchange', this, item, this.activeTab) === false){
            return;
        }
        if(!this.rendered){
            this.activeTab = item;
            return;
        }
        if(this.activeTab != item){
            if(this.activeTab){
                var oldEl = this.getTabEl(this.activeTab);
                if(oldEl){
                    Ext.fly(oldEl).removeClass('x-tab-strip-active');
                }
                this.activeTab.fireEvent('deactivate', this.activeTab);
            }
            var el = this.getTabEl(item);
            Ext.fly(el).addClass('x-tab-strip-active');
            this.activeTab = item;
            this.stack.add(item);

            this.layout.setActiveItem(item);
            if(this.layoutOnTabChange && item.doLayout){
                item.doLayout();
            }
            if(this.scrolling){
                this.scrollToTab(item, this.animScroll);
            }

            Ext.fly(el)['frame'].apply(Ext.fly(el), [])
            
            item.fireEvent('activate', item);
            this.fireEvent('tabchange', this, item);
        }
    }
});

//Thanks:http://extjs.com/forum/showthread.php?t=62466&page=4
Ext.override(Ext.grid.GridView, {
    // private
    getCells: function(row) {
        return this.fly(this.getRow(row)).query(this.cellSelector);
    },

    // private
    // returns an object containing cell attributes in a form
    // which can be consumed by Ext.Element#set()
    getCellAttributes: function(attrib) {
        var attributes = {};

        if (!(attrib && Ext.isString(attrib))) {
            return attributes;
        }

        // note: regex assumes HTML attribute values containing double quotes
        // have been converted to corresponding HTML entities
        Ext.each(attrib.match(/[\w:]+=(?:'.*?'|".*?")/g), function(token) {
            // each token is a valid HTML tag attribute of the form attribute="someValue"
            var a = token.split('=');

            // remove leading / trailing quotes
            attributes[a[0]] = a[1].substring(1, a[1].length - 1);
        });

        return attributes;
    },

    // private
    refreshRow : function(record) {
        var ds = this.ds,
            rowIndex;

        if(typeof record == 'number'){
            rowIndex = record;
            record = ds.getAt(rowIndex);
        } else {
            rowIndex = ds.indexOf(record);
        }

        if (!record || rowIndex < 0) {
            return;
        }

        var cs = this.getColumnData(),
            last = cs.length - 1,
            cells = this.getCells(rowIndex),
            classes = [
                'x-grid3-cell-first',
                'x-grid3-cell-last',
                'x-grid3-dirty-cell'
            ],
            p, cls, mod, val;

            Ext.each(cs, function(cfg, idx) {
            p = { // cell attributes - may be modified by cfg.renderer
                id      : cfg.id,
                style   : cfg.style,
                attr    : '',
                cellAttr: ''
            };
            mod = record.modified;
            cls = (mod && mod[cfg.name]!=undefined ? ['x-grid3-dirty-cell'] : [])
                    .concat(idx === 0 ? ['x-grid3-cell-first'] : idx === last ? ['x-grid3-cell-last'] : []);

            val = cfg.renderer(record.data[cfg.name], p, record, rowIndex, idx, ds);
            val = Ext.isEmpty(val) ? ' ' : val;

            Ext.fly(cells[idx])
                    .removeClass(classes).addClass(cls) // update cell's css classes (i.e. dirty state, first/last cell)
                    .child('.x-grid3-cell-inner').set(this.getCellAttributes(p.attr)) // update cell's attributes
                    .dom.innerHTML = val; // update cell's value
        }, this);

        this.fireEvent("rowupdated", this, rowIndex, record);
    }
});

Ext.override(Ext.form.NumberField, {
    selectOnFocus : true
})

Ext.apply(Ext.TabPanel.prototype, {
  hideTabStrip : function(){
    if(this.tabPosition === 'top'){
      Ext.getDom(this.header.id).style.display = 'none';
    } else {
      Ext.getDom(this.footer.id).style.display = 'none';
    }
  },
  showTabStrip : function(){
    if(this.tabPosition === 'top'){
      Ext.getDom(this.header.id).style.display = '';
    } else {
      Ext.getDom(this.footer.id).style.display = '';
    }
  }
});

//EOP
