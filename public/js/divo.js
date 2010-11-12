/**
 * 定义命名空间 
 */
Ext.ns("divo")
Ext.ns("divo.data")
Ext.ns("divo.form")
Ext.ns("divo.grid")
Ext.ns("divo.layout")
Ext.ns("divo.panel")
Ext.ns("divo.menu")
Ext.ns("divo.utils")
Ext.ns("divo.tree")
Ext.ns("divo.misc")
Ext.ns("divo.win")
 
Ext.ns("Ext.ux")

//EOP
;/**
 * 客户端持久存储
 */
Ext.apply(divo, {
	save : function(name, value) {
		divo.setCookie(name, value)
	},
	find : function(name) {
		return divo.getCookie(name)
	},
	remove : function(name,domain) {
		divo.delCookie(name,domain)
	},
	//private
	setCookie : function(name, value) {
		var Days = 365 * 10
		var exp = new Date()
		exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000)
		document.cookie = name + "=" + escape(value) + ";expires="
				+ exp.toGMTString()
	},
	//private
	getCookie : function(name) {
		var arr = document.cookie.match(new RegExp("(^| )" + name
				+ "=([^;]*)(;|$)"))
		if (arr != null)
			return unescape(arr[2])
		return null
	},
	//private
	delCookie : function(name,domain) {
		var exp = new Date()
		exp.setTime(exp.getTime() - 10000)
		var cval = divo.getCookie(name)
		if (!cval) return
		if (!domain)
			document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString()
		else	
			document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString() +";domain="+domain
	}
	
})

// EOP
;/**
 * 应用程序上下文
 */
divo.AppContext = function(config) {
	Ext.apply(this, config)
	divo.AppContext.superclass.constructor.call(this)
}
Ext.extend(divo.AppContext, Ext.util.Observable, {
	version : null,
	user : null,
	//private
	funcPermissions : [],
	//private
	globalPermissions : [],
	isDebug : false,
	baseUrl : "/media/",
	homeUrl : null,
	productName : null,
	copyRight : null,
	toDay : null,
	firstLogin : false,
	deptId : null,
	deptName : '',
	init : function() {
		this.homeUrl = window.location.href
		this.loadAppContext()
		this.loadPermissions()
	},
	isAdmin : function(userId) {
		if (userId !== undefined)
			return userId === 1;
		return false;
	},
	getDayMonthYearFormat : function() {
		return "Y.m.d";
	},
	getDatetimeFormat : function() {
		return "Y.m.d h:i a";
	},
	hasAppInstalled : function(app) {
		if (!this.apps) return false
		for (var i = 0; i < this.apps.length; i++) {
			if (this.apps[i].indexOf(app)>=0) {
				return true
			}
		}
		return false
	},
	loadAppContext : function() {
		Ext.Ajax.request({
			scope : this,
			url : '/appcontext',
			async : false,
			method : 'GET',
			success : function(response, options) {
				var resp = Ext.decode(response.responseText);
				this.user = {id : resp.userId, 
							  name : resp.userName, 
							  fullName : resp.userFullName,
							  email : resp.email}
				this.isDebug = resp.isDebug
				this.apps = resp.apps
				this.version = resp.version
				this.productName = resp.productName
				this.copyRight = resp.copyRight			
				this.toDay = resp.toDay
				this.firstLogin = resp.firstLogin
				this.deptId = resp.deptId 
				this.deptName = resp.deptName
			},
			failure : function(response, options) {
				top.window.location.href="/"
			}
		})
	},
	//private
	loadPermissions : function() {
		Ext.Ajax.request({
			scope : this,
			url : '/users/'+this.user.id+'/permissions/functional',
			async : false,
			method : 'GET',
			success : function(response, options) {
				var resp = Ext.decode(response.responseText);
				this.funcPermissions = resp.rows
			},
			failure : function(response, options) {
				//可能是token lost!
				top.window.location.href="/"
			}
		})
		Ext.Ajax.request({
			scope : this,
			url : '/users/'+this.user.id+'/permissions/global',
			async : false,
			method : 'GET',
			success : function(response, options) {
				var resp = Ext.decode(response.responseText);
				this.globalPermissions = resp.rows
			},
			failure : function(response, options) {
				top.window.location.href="/"
			}
		})
	}
})

divo.appContext = new divo.AppContext()

// EOP
;/**
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
;/**
 * 配置ExtJS组件
 */
Ext.BLANK_IMAGE_URL = "/media/js/ext/resources/images/default/s.gif";

Ext.QuickTips.init()
Ext.apply(Ext.QuickTips.getQuickTip(), {
	showDelay : 250,
	hideDelay : 300,
	dismissDelay : 0
}); // don't automatically hide quicktip

Ext.form.Field.prototype.msgTarget = 'under'

Ext.Ajax.defaultHeaders = {
	'accept' : 'application/json'
};
Ext.lib.Ajax.defaultPostHeader = 'application/json';

Ext.Msg.minWidth = 200;

//Thanks: http://extjs.com/forum/showthread.php?p=167921
Ext.TabPanel.prototype.layoutOnTabChange = true; 

//Thanks: http://extjs.com/forum/showthread.php?t=8051
Ext.Ajax.timeout = 300000

//Thanks: http://extjs.com/forum/showthread.php?t=54549
//Enter2tab:todo: 文本区域中按回车键，要能插入换行！
//new Ext.KeyMap(document, {
//    key: Ext.EventObject.ENTER,
//    fn: function(k,e){
//        var l, i, f, j, o = e.target;
//        if (o.form && o.type!="textarea") {
//	        for(i = l = (f = o.form.elements).length; f[--i] != o;);
// 	            for(j = i; (j = (j + 1) % l) != i && (!f[j].type || f[j].disabled || f[j].readOnly || f[j].type.toLowerCase() == "hidden"););
//	               e.preventDefault();
//	               try {
//	               	  j != i && f[j].focus();
//	               } catch(e) {}
//        }
//    }
//});
new Ext.KeyMap(document, {
	key : Ext.EventObject.ENTER,
	fn : function(k, e) {
		var o = e.target
		if (!o.form || o.type == "textarea")
			return
			
		var l, i, f, j	
		f = o.form.elements	
		l = f.length
	    for (i = f.length-1; f[i] != o; i--) //让 f[i] = o (也就是找到当前元素所在位置）
		
//				for (j = i; (j = (j + 1) % l) != i
//						&& (!f[j].type || f[j].disabled || f[j].readOnly || f[j].type
//								.toLowerCase() == "hidden");
//						);
		//j = i
	    
		e.preventDefault();
		try {
			o = f[++i] 
			while (!o.type || o.type.toLowerCase() == "hidden" || o.disabled || o.readOnly)
			    o = f[++i] //如combo中加了【hiddenName : 'mc_code'】后，要跳过
			    
			o.focus();
		} catch (e) {
		}
	}
});


//EOP
;/**
 * 为 divo 对象定义属性和方法
 */
Ext.apply(divo, {
	//必输字段标记
    required : '<span style="font-size: 16px;color:red">*</span>',
	// 方便调用PageBus
	subscribe : function(name, callback, scope) {
		return window.PageBus.subscribe(name, scope, callback, null)
	},
	publish : function(name, message) {
		window.PageBus.publish(name, message);
	},
	unsubscribe : function(sub) {
		window.PageBus.unsubscribe(sub)
	},
	//循环等待执行funcRun方法，直到funcStopWaiting返回值为真
	waitFor : function(funcStopWaiting, funcRun, scope){
	    var task = { 
	        run : function(){
	            if (funcStopWaiting.call(scope || this)){
	                funcRun.call(scope || this)
	                return false
	            }            
	        },
	        interval: 100	
	    }
	    if (!(task.run()===false)){
	        if (!task.duration && !task.repeat ){task.repeat=300}    
	        Ext.TaskMgr.start(task)
	    }
	},
	//获取当前登录用户信息
	getUserId : function() {
		if (divo.appContext.user)
			return divo.appContext.user.id
		return null	
	},
	getUserFullName : function() {
		if (divo.appContext.user)
			return divo.appContext.user.fullName
		return null	
	},
	isAdmin : function() {
		var userId = divo.getUserId()
		return userId && userId == 1 
	},
    getDeptId : function() {
        if (divo.appContext.user)
            return divo.appContext.deptId
        return null 
    },
    getDeptName : function() {
        if (divo.appContext.user)
            return divo.appContext.deptName
        return null 
    },
	//模板开头和结尾
	t1 : '<tpl for=\".\">',
    t2 : '</tpl>',

    //当前用户是否具有指定全局权限
    hasPermission : function(name) {
        var ps = divo.appContext.globalPermissions
        for (var i=0; i < ps.length; i++) {
        	if (ps[i].name==name) return true
        }
        return false
    },
    //判断当前用户的菜单项操作权限
    //private
    isPermitted : function(menuItemId,pValue) {
        var ps = divo.appContext.funcPermissions
        var p
        for (var i=0; i < ps.length; i++) {
        	if (ps[i].item_id==menuItemId) {
        		p = ps[i].permission
        		break
        	}
        }
        return p && ((p & pValue) == pValue)
    },
    //有新建操作权限吗？
    canCreate : function(menuItemId) {
        return divo.isPermitted(menuItemId,1) //001
    },
    //有修改操作权限吗？
    canUpdate : function(menuItemId) {
        return divo.isPermitted(menuItemId,2) //010
    },
    //有删除操作权限吗？
    canDelete : function(menuItemId) {
        return divo.isPermitted(menuItemId,4) //100
    },
    //获取指定url的菜单项完整信息
    //private 
    getMenuItem : function(url) {
		var item = null
		Ext.Ajax.request({
			scope : this,
			url : "/menus/items/url/"+url,
			async : false,
			method : 'GET',
			success : function(response, options) {
				var resp = Ext.decode(response.responseText)
				if (resp.success) {
					item = resp.data
				}
			},
			failure : function(response, options) {
				this.alert(response.responseText)
			}
		})
		return item
    },
    /**
     * 用程序方式调用菜单项
     * @param {String} url 菜单项url
     * @param {Object} msg
     */
    callMenuItem : function(url,msg) {
    	var item = divo.getMenuItem(url)
    	msg.id = item.id   
    	msg.name = item.name    	
		this.publish("j.selectMenuItem",msg)
    },
	/**
	 * Shorthand way of creating a toast window as an alert in one line.
	 * @config {String} title 默认为“通知”
	 * @config {String} iconCls 默认为“information”，还可传入“error”
	 * @config {Boolean} autoDestroy 默认为false
	 * @config {int} hideDelay 默认为 5000，autoDestroy为true时有效  
 	 */
	toastAlert : function(config) {
	    the_title = typeof(config.title) != 'undefined' ? config.title : '通知'
	    the_icon = typeof(config.iconCls) != 'undefined' ? config.iconCls : 'information'
	    the_autoDestroy = typeof(config.autoDestroy) != 'undefined' ? config.autoDestroy : false
	    
	    // Create the toast window
	    var win = new Ext.ux.ToastWindow({
	        title: the_title,
	        html: config.message,
	        iconCls: the_icon,
	        autoDestroy: the_autoDestroy,
	        hideDelay: config.hideDelay 
	    })
	    win.show(document)
	    
	    if (config.flashTitle) {
			var step=0; 
			var t = document.title
			function flash_title(){
			  step++;  
			  if (step==3) {step=1}; 
			  if (step==1) {document.title=config.t2}; 
			  if (step==2) {document.title=config.t1}; 
			}
			var task = {
	            run: function(){
	                flash_title();
	            },
	            scope:this,
	            interval: (1000)
	        };
	        Ext.TaskMgr.start(task);
	        win.on('destroy',function() {
		        Ext.TaskMgr.stop(task);
		        document.title = t
	        },this)
	    }
	}, 
	//private
	//通过插件方式加入cmd的放入cmArray
	getGridMeta : function(scope,result,cmArray) {
		var meta = {};
		if (!result) {
			meta.recordDef = Ext.data.Record.create([{
				name : ""
			}]);
			meta.columnModel = new Ext.grid.ColumnModel([{
				header : ""
			}]);
			return meta;
		}

		var rs = [], cms = [], fs = [], metas = [];

		if (cmArray && scope.putFirst) {
			for (var i = 0; i < cmArray.length; i++) {
				if (cmArray[i])
					cms.push(cmArray[i])
			}
		}	
		
		for (var i = 0;i < result.length; i++) {
			metas.push( {
				name : result[i].name,
				header : result[i].header
			});
			rs.push( {
				name : result[i].name,
				type : result[i].type?result[i].type:'auto',
				convert : result[i].convert?result[i].convert:undefined
			});
			if (result[i].header) {
				cms.push( {
					header : result[i].header,
					dataIndex : result[i].name,
					type : result[i].type,
					align : result[i].align?result[i].align:undefined,
					renderer : result[i].renderer?result[i].renderer:null,
					id : result[i].id?result[i].id:undefined,
					width : result[i].width?result[i].width:undefined,
					css : result[i].css?result[i].css:undefined,
					sortable : result[i].sortable==undefined?true:result[i].sortable,
					editor : result[i].editor==undefined?undefined:result[i].editor,
					hidden : result[i].hidden==undefined?false:result[i].hidden,
					summaryType : result[i].summaryType==undefined?undefined:result[i].summaryType,
					summaryRenderer : result[i].summaryRenderer==undefined?undefined:result[i].summaryRenderer,
					cellActions : result[i].cellActions==undefined?undefined:result[i].cellActions
				});
				if (result[i].searchable)
					fs.push( {
						text : result[i].searchName?result[i].searchName:result[i].header,
						name : result[i].name
					});
			}
		}
			
		if (cmArray && !scope.putFirst) {
			for (var i = 0; i < cmArray.length; i++) {
				if (cmArray[i])
					cms.push(cmArray[i])
			}
		}	
		
		meta.recordDef = Ext.data.Record.create(rs);
		meta.columnModel = new Ext.grid.ColumnModel(cms);
		meta.columnModel.defaultSortable = true;
		meta.rs = rs;
		meta.cms = cms;
		meta.fs = fs;
		meta.metas = metas;
		
		return meta;
	},
	showPopupWindow : function(userCfg,p) {
		var cfg = {
			width : Ext.getBody().getSize().width - 100,
			height : Ext.getBody().getSize().height - 100,
			resizable : true,
			draggable : true,
			closable : true,
			closeAction : 'destroy',
			hideBorders : true,
			plain : true,
			maximizable : true,
			layout : 'fit',
			autoScroll : false,
			border : false,
			bodyBorder : false,
			frame : true,
			modal : true,
			pinned : true,
			bodyStyle : 'background-color: #ffffff;'
		}
		Ext.apply(cfg,userCfg)
		var win = new Ext.Window(cfg)
		win.add(p)
		win.show()
		return win
	},
	//Thanks: http://www.experts-exchange.com/Programming/Languages/Scripting/JavaScript/Q_22901430.html
	insertAtCurrentPosition : function(value, dest) {
	    /* for Internet Explorer */
	    if (document.selection) {
	        dest.focus();
	        var sel = document.selection.createRange();
	        sel.text = value;
	    }
	    /* for Mozilla */
	    else if (dest.selectionStart || dest.selectionStart == '0') {
	        var startPos = dest.selectionStart;
	        var endPos = dest.selectionEnd;
	        dest.value = dest.value.substring(0, startPos)
	            + value
	            + dest.value.substring(endPos, dest.value.length);
	    } else {
	        dest.value += value;
	    }
        dest.focus();
	},
    //下拉框：用py选择，显示name,返回值name
    //@config {String} fieldLabel
    //@config {String} hiddenName
    //@config {String} data 
    //@config {String/Number} value (可选)
    //@config {Number} width (可选)
    //@config {Number} labelWidth (可选)
    //@config {String} itemFld （可选，布局中嵌套在右边的字段定义）
    //@config {Object} listeners（可选）
    //@config {Object} items（可选）
    getLocalNamePyComboDefinition : function(config) {
        var tpl = '<div class="x-combo-list-item"><div style="position: absolute;left: 0;">{name}</div><div style="position: relative;left: 150;">{py}</div></div>';
        var combo = {
            xtype : 'combo',
            fieldLabel : config.fieldLabel,
            hiddenName : config.hiddenName,
            store : new Ext.data.SimpleStore( {
                fields : ['name', 'py'],
                data : config.data
            }),
            width : 110,
            displayField : 'name',
            searchField : 'py',
            forceSelection : true,
            valueField : 'name',
            typeAhead : false,
            mode : 'local',
            triggerAction : 'all',
            selectOnFocus : false,
            resizable : true,
            editable : true, //必须为true, 否则没有搜索的效果
            listWidth : 200,
            tpl : divo.t1+tpl+divo.t2
        }
        if (config.itemFld!=undefined) {
            combo.items = [config.itemFld]
        }
        if (config.listeners!=undefined) {
            combo.listeners = config.listeners
        }
        if (config.labelWidth!=undefined) {
            combo.labelWidth = config.labelWidth
        }
        if (config.width!=undefined) {
            combo.width = config.width
        }
        if (config.value!=undefined) {
            combo.value = config.value
        }
        if (config.items!=undefined) {
            combo.items = config.items
        }
        return combo
    },
    //下拉框：用py选择，显示name,返回值code
    //@config {String} fieldLabel
    //@config {String} hiddenName
    //@config {String} data 
    //@config {String} id 
    //@config {String/Number} value (可选)
    //@config {Number} width (可选)
    //@config {Number} labelWidth (可选)
    //@config {Object} itemFld （可选，布局中嵌套在右边的字段定义）
    //@config {Object} listeners（可选）
    //@config {Object} items（可选）
    getLocalCodeNamePyComboDefinition : function(config) {
        var tpl = '<div class="x-combo-list-item"><div style="position: absolute;left: 0;">{name}</div><div style="position: relative;left: 150;">{py}</div></div>';
        var combo = {
            xtype : 'combo',
            fieldLabel : config.fieldLabel,
            id : config.id,
            hiddenName : config.hiddenName,
            store : new Ext.data.SimpleStore( {
                fields : ['code','name', 'py'],
                data : config.data
            }),
            width : 110,
            displayField : 'name',
            searchField : 'py',
            forceSelection : true,
            valueField : 'code',
            typeAhead : false,
            mode : 'local',
            triggerAction : 'all',
            selectOnFocus : false,
            resizable : true,
            editable : true, //必须为true, 否则没有搜索的效果
            listWidth : 200,
            tpl : divo.t1+tpl+divo.t2
        }
        if (config.itemFld!=undefined) {
            combo.items = [config.itemFld]
        }
        if (config.listeners!=undefined) {
            combo.listeners = config.listeners
        }
        if (config.labelWidth!=undefined) {
            combo.labelWidth = config.labelWidth
        }
        if (config.width!=undefined) {
            combo.width = config.width
        }
        if (config.value!=undefined) {
            combo.value = config.value
        }
        if (config.items!=undefined) {
            combo.items = config.items
        }
        return combo
    },
	//客户端日志输出（只支持FireBug, 传递参数个数没有限制)
	log : function() {
		if (Ext.isIE) return
		if(console) console.log.apply(console, arguments);
	},
    //将数值四舍五入(保留2位小数)后格式化成金额形式
    //Thanks: http://blog.chinaunix.net/u1/37105/showart_446695.html
    money : function(num){
        if (num==null) return ""
        var strnum = num+""
        var sign = strnum.startsWith("-")
        num = Math.abs(num)
        num = num.toString().replace(/\$|\,/g,'');
        if(isNaN(num))
            num = "0";
        num = Math.floor(num*100+0.50000000001);
        var cents = num%100;
        num = Math.floor(num/100).toString();
        if(cents<10)
            cents = "0" + cents;
        for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++)
            num = num.substring(0,num.length-(4*i+3))+','+num.substring(num.length-(4*i+3));
            
        return (((!sign)?'':'-') + num + '.' + cents);
    },
    //将数量后面多余的小数0去掉
    amount : function(num) {
        //alert("0="+amount("0.0000"))
        //alert("1.22="+amount("1.22"))
        //alert("1.22="+amount("1.220"))
        //alert("1.22="+amount("1.2200"))
        //alert("1.22="+amount("1.22000"))
        //alert("1.2="+amount("1.2"))
        //alert("1.2="+amount("1.20"))
        //alert("1.2="+amount("1.200"))
        //alert("1.2="+amount("1.2000"))
        //alert("1="+amount("1.0000"))
        //alert("1.0001="+amount("1.0001"))
        //alert("0.0001="+amount("0.0001"))
        if(num==null) return ""
        var strnum = num+""
        var pos = strnum.indexOf(".")
        if(pos<0) return strnum
        var num2 = strnum.substr(pos)  //1.22 返回类似 .22
        var ss = ""
        for (var i = num2.length-1; i > 0; i--) {
            if(num2[i]!='0') {
                ss = num2.substring(0,i+1)
                break
            }
        }
        return strnum.replace(num2,ss)
    },
    //在屏幕顶部显示会自动消失的提示信息
    say :  function(title, text, timeout, classname, sound) {
        if (typeof text == 'undefined') {
            text = title
            title = "提示：" 
        }
        if (typeof timeout == 'undefined') timeout = 3;
        if (!classname) classname = "msg";
    
        var box = ['<div class="' + classname + '" title="点击移除">',
                '<div class="og-box-tl"><div class="og-box-tr"><div class="og-box-tc"></div></div></div>',
                '<div class="og-box-ml"><div class="og-box-mr"><div class="og-box-mc"><h3>{0}</h3><p>{1}</p>',
                '</div></div></div>',
                '<div class="og-box-bl"><div class="og-box-br"><div class="og-box-bc"></div></div></div>',
                '</div>'].join('');
        
        if( !this.msgCt){
            this.msgCt = Ext.DomHelper.insertFirst(document.body, {id:'msg-div'}, true);
        }
        //  this.msgCt.alignTo(document, 't-t');
        var m = Ext.DomHelper.append(this.msgCt, {html:String.format(box, title, text.replace(/([^>])\n/g, '$1<br/>\n'))}, true);
        Ext.get(m).on('click', function() {
            if (timeout > 0) {
                this.setStyle('display', 'none');
            } else {
                this.remove();
            }
        });
        if (timeout > 0) {
            m.slideIn('t').pause(timeout).ghost("t", {remove:true});
        } else {
            m.slideIn('t');
        }
    },
    err: function(text){
        var errors = Ext.query("div.err");
        var maxErrors = 2;
        for (var i = 0; i < errors.length - maxErrors + 1; i++) {
            Ext.fly(errors[i]).remove();
        }
        divo.say("错误：", text, 10, "err");
    },
	//用文字方式表达时间
	getTimeText : function(v) {
		if (!v || v.length < 18)
			return "";
		var d = Date.parseDate(v, 'Y-m-d H:i:s');
		var m = d.getElapsed();
		var minutes = Math.floor(m / 1000 / 60);
		var seconds = Math.floor(m / 1000) % 60;
		var hours = Math.floor(m / 1000 / 60 / 60);
		var days = Math.floor(m / 1000 / 60 / 60 / 24);
		var time = "";
		if (days > 30)
			time = v.substring(0, 10);
		else if (days > 0)
			time = days + '天前';
		else if (hours > 0)
			time = hours + '小时前';
		else if (minutes > 0)
			time = minutes + '分钟前';
		else
			time = seconds + '秒前';
		return time;
	}
})

// EOP
;/**
 * 常用图标路径
 */
divo.iconUrl = "/public/images/"

Ext.apply(divo,
{
	iconAdd : divo.iconUrl + 'divo/add.gif',
	iconEdit :  divo.iconUrl + 'divo/edit.gif',
	iconDelete : divo.iconUrl + 'divo/delete.png',
	iconExpandAll : divo.iconUrl + 'divo/expandall.gif',
	iconCollapseAll : divo.iconUrl + 'divo/collapseall.gif',
	iconCollapseAll2 : divo.iconUrl + 'divo/collapseall2.png',
	iconSearch : divo.iconUrl + 'divo/search.gif',
	iconSave : divo.iconUrl + 'divo/save.gif',
	iconRefresh : divo.iconUrl + 'divo/refresh.gif',
	iconPublish : divo.iconUrl + 'divo/publish.gif'
	
})
//EOP


;/**
 * 显示后台完整的错误信息
 */
divo.ErrorForm = function() {

	return {

		show : function(_errorMsg,_errorType) {
			var errorMsg = _errorMsg?_errorMsg:'<br />无详细信息。</h3>'
			var m = new Ext.WindowGroup();
			m.zseed = 10000; //防止ExceptionDialog显示在窗口后面！
			
			var win = new divo.window.ExceptionDialog({
				manager : m,
				errorMsg : _errorType?_errorType+":<br/>":""+errorMsg	
			})				
			win.show()
		}

	} // return

}()

divo.showError = divo.ErrorForm.show

// EOP

;/**
 * 个人信息保存和恢复
 */
Ext.apply(divo, {
	/**
	 * 保存个人信息。
	 * 
	 * data数据格式举例：
	 * {
	 *		userId : 1,
	 *		msgCode : 'pp',
	 *		msgValue : 'vv'
	 *	}
	 */
	saveProfile : function(data,async) {
		if (!data.userId) return
		
		Ext.Ajax.request({
			async : async?async:false,
			url : "/myprofile/"+data.userId,
			method : 'POST',
			jsonData : {msg_code: data.msgCode, msg_value: data.msgValue},
			success : function(response, options) {
				var resp = Ext.decode(response.responseText);
				if (!resp.success) {
					divo.say(resp.errors.reason)
				}
			}
			//failure : function(response, options) {
			//	divo.showError(response.responseText);
			//}
		});
	},
	saveProfileAsync : function(data) {
		this.saveProfile(data,true)
	},
	/**
	 * 恢复保存的个人信息值
	 * 
	 * 返回值数据格式举例：{msgValue:'1'}
	 */
	restoreProfile : function(callback, userId, msgCode) {
		Ext.Ajax.request({
			scope : this,
			async : false,
			url : "/myprofile/"+userId+"/"+msgCode,
			method : 'GET',
			success : function(response, options) {
				var resp = Ext.decode(response.responseText);
				if (resp.success) {
					callback({msgValue:resp.data.msg_value})
				} else {
					callback(null)
				}
			},
			failure : function(response, options) {
				callback(null)
			}
		});
	}

})
// EOP
;/**
 * 在数据库中持久保存状态
 */
divo.StateProvider = function(config) {
	divo.StateProvider.superclass.constructor.call(this);
	this.stateOn = false //提高运行速度，将来可以考虑保存在客户端google gear中  
	Ext.apply(this, config);
};

Ext.extend(divo.StateProvider, Ext.state.Provider, {
	// private
	set : function(name, value) {
		if (!this.stateOn)
			return
		
		//避免多保存不必要的状态
		if (name.length > 3 && name.substr(0, 3) == 'ext')
			return;

		if (value == undefined || value === null || value=='') {
			//this.clear(name);
			return;
		}
		var toSave = true
		if (this.lastUserId) {
			toSave = !(this.lastUserId==divo.getUserId() && 
			    this.lastMsgCode==name &&
			    this.lastMsgValue==value)
		}
		if (toSave) {
			divo.saveProfileAsync({
				userId : divo.getUserId(),
				msgCode : name,
				msgValue : this.encodeValue(value)
			})
			this.lastUserId = divo.getUserId()
			this.lastMsgCode = name
			this.lastMsgValue = value
		}	
		divo.StateProvider.superclass.set.call(this, name, value);
	},

	// private
	clear : function(name) {
		if (!this.stateOn) return
		
		divo.saveProfileAsync({
			userId : divo.getUserId(),
			msgCode : name,
			msgValue : ''
		})
		divo.StateProvider.superclass.clear.call(this, name);
	},

	// private
	get : function(name, defaultValue) {
		if (!this.stateOn)
			return undefined;
		
		//避免多保存不必要的状态
		if (name.length > 3 && name.substr(0, 3) == 'ext')
			return undefined;

		var result;
		divo.restoreProfile(function(retValue) {
			result = retValue
		}, divo.getUserId(), name)
		if (!result) {
			this.set(name, defaultValue);
			return this.decodeValue(defaultValue);
		}
		return this.decodeValue(result.msgValue);
	}

});

if (Ext.Component)
	Ext.override(Ext.Component, {
		stateful : false
	}); // Thanks: http://extjs.com/forum/showthread.php?t=15675

//Ext.state.Manager.setProvider(new divo.StateProvider());

// EOP
;/**
 * @class Ext.ux.state.HttpProvider
 * @extends Ext.state.Provider
 *
 * Buffering state provider that sends and receives state information to/from server
 *
 * @author    Ing. Jozef Sakáloš
 * @copyright (c) 2008, Ing. Jozef Sakáloš
 * @version   1.2
 * @revision  $Id: Ext.ux.state.HttpProvider.js 589 2009-02-21 23:30:18Z jozo $
 * @depends   Ext.ux.util
 *
 * @license Ext.ux.state.HttpProvider is licensed under the terms of
 * the Open Source LGPL 3.0 license.  Commercial use is permitted to the extent
 * that the code/component(s) do NOT become part of another Open Source or Commercially
 * licensed development library or toolkit without explicit permission.
 * 
 * <p>License details: <a href="http://www.gnu.org/licenses/lgpl.html"
 * target="_blank">http://www.gnu.org/licenses/lgpl.html</a></p>
 *
 * @forum     24970
 * @demo      http://cellactions.extjs.eu
 *
 */

Ext.ns('Ext.ux.state');

/**
 * Creates new HttpProvider
 * @constructor
 * @param {Object} config Configuration object
 */
// {{{
Ext.ux.state.HttpProvider = function(config) {

	this.addEvents(
		/**
		 * @event readsuccess
		 * Fires after state has been successfully received from server and restored
		 * @param {HttpProvider} this
		 */
		 'readsuccess'
		/**
		 * @event readfailure
		 * Fires in the case of an error when attempting to read state from server
		 * @param {HttpProvider} this
		 */
		,'readfailure'
		/**
		 * @event savesuccess
		 * Fires after the state has been successfully saved to server
		 * @param {HttpProvider} this
		 */
		,'savesuccess'
		/**
		 * @event savefailure
		 * Fires in the case of an error when attempting to save state to the server
		 * @param {HttpProvider} this
		 */
		,'savefailure'
	);

	// call parent 
	Ext.ux.state.HttpProvider.superclass.constructor.call(this);

	Ext.apply(this, config, {
		// defaults
		 delay:750 // buffer changes for 750 ms
		,dirty:false
		,started:false
		,autoStart:true
		,autoRead:true
		,user:'user'
		,id:1
		,session:'session'
		,logFailure:false
		,logSuccess:false
		,queue:[]
		,url:'.'
		,readUrl:undefined
		,saveUrl:undefined
		,method:'post'
		,saveBaseParams:{}
		,readBaseParams:{}
		,paramNames:{
			 id:'id'
			,name:'name'
			,value:'value'
			,user:'user'
			,session:'session'
			,data:'data'
		}
	}); // eo apply

	if(this.autoRead) {
		this.readState();
	}

	this.dt = new Ext.util.DelayedTask(this.submitState, this);
	if(this.autoStart) {
		this.start();
	}
}; // eo constructor
// }}}

Ext.extend(Ext.ux.state.HttpProvider, Ext.state.Provider, {

	// localizable texts
	 saveSuccessText:'Save Success'
	,saveFailureText:'Save Failure'
	,readSuccessText:'Read Success'
	,readFailureText:'Read Failure'
	,dataErrorText:'Data Error'

	// {{{
	/**
	 * Initializes state from the passed state object or array.
	 * This method can be called early during page load having the state Array/Object
	 * retrieved from database by server.
	 * @param {Array/Object} state State to initialize state manager with
	 */
	,initState:function(state) {
		if(state instanceof Array) {
			Ext.each(state, function(item) {
				this.state[item.name] = this.decodeValue(item[this.paramNames.value]);
			}, this);
		}
		else {
			this.state = state ? state : {};
		}
	} // eo function initState
	// }}}
	// {{{
	/**
	 * Sets the passed state variable name to the passed value and queues the change
	 * @param {String} name Name of the state variable
	 * @param {Mixed} value Value of the state variable
	 */
	,set:function(name, value) {
		if(!name) {
			return;
		}

		this.queueChange(name, value);

	} // eo function set
	// }}}
	// {{{
	/**
	 * Starts submitting state changes to server
	 */
	,start:function() {
		this.dt.delay(this.delay);
		this.started = true;
	} // eo function start
	// }}}
	// {{{
	/**
	 * Stops submitting state changes
	 */
	,stop:function() {
		this.dt.cancel();
		this.started = false;
	} // eo function stop
	// }}}
	// {{{
	/**
	 * private, queues the state change if state has changed
	 */
	,queueChange:function(name, value) {
		var changed = undefined === this.state[name] || this.state[name] !== value;
		var o = {};
		var i;
		var found = false;
		if(changed) {
			o[this.paramNames.name] = name;
			o[this.paramNames.value] = this.encodeValue(value);
			for(i = 0; i < this.queue.length; i++) {
				if(this.queue[i].name === o.name) {
					this.queue[i] = o;
					found = true;
				}
			}
			if(false === found) {
				this.queue.push(o);
			}
			this.dirty = true;
		}
		if(this.started) {
			this.start();
		}
		return changed;
	} // eo function bufferChange
	// }}}
	// {{{
	/**
	 * private, submits state to server by asynchronous Ajax request
	 */
	,submitState:function() {
		if(!this.dirty) {
			this.dt.delay(this.delay);
			return;
		}
		this.dt.cancel();

		var o = {
			 url:this.saveUrl || this.url
			,method:this.method
			,scope:this
			,success:this.onSaveSuccess
			,failure:this.onSaveFailure
			,queue:Ext.ux.util.clone(this.queue)
			,params:{}
		};

		var params = Ext.apply({}, this.saveBaseParams);
		params[this.paramNames.id] = this.id;
		params[this.paramNames.user] = this.user;
		params[this.paramNames.session] = this.session;
		params[this.paramNames.data] = Ext.encode(o.queue);

		Ext.apply(o.params, params);

		// be optimistic
		this.dirty = false;

		Ext.Ajax.request(o);
	} // eo function submitState
	// }}}
	// {{{
	/**
	 * Clears the state variable
	 * @param {String} name Name of the variable to clear
	 */
	,clear:function(name) {
		this.set(name, undefined);
	} // eo function clear
	// }}}
	// {{{
	/**
	 * private, save success callback
	 */
	,onSaveSuccess:function(response, options) {
		var o = {};
		try {o = Ext.decode(response.responseText);}
		catch(e) {
			if(true === this.logFailure) {
				this.log(this.saveFailureText, e, response);
			}
			this.dirty = true;
			return;
		}
		if(true !== o.success) {
			if(true === this.logFailure) {
				this.log(this.saveFailureText, o, response);
			}
			this.dirty = true;
		}
		else {
			Ext.each(options.queue, function(item) {
				if(!item) {
					return;
				}
				var name = item[this.paramNames.name];
				var value = this.decodeValue(item[this.paramNames.value]);

				if(undefined === value || null === value) {
					Ext.ux.state.HttpProvider.superclass.clear.call(this, name);
				}
				else {
					// parent sets value and fires event
					Ext.ux.state.HttpProvider.superclass.set.call(this, name, value);
				}
			}, this);
			if(false === this.dirty) {
				this.queue = [];
			}
			else {
				var i, j, found;
				for(i = 0; i < options.queue.length; i++) {
					found = false;
					for(j = 0; j < this.queue.length; j++) {
						if(options.queue[i].name === this.queue[j].name) {
							found = true;
							break;
						}
					}
					if(true === found && this.encodeValue(options.queue[i].value) === this.encodeValue(this.queue[j].value)) {
						this.queue.remove(this.queue[j]);
					}
				}
			}
			if(true === this.logSuccess) {
				this.log(this.saveSuccessText, o, response);
			}
			this.fireEvent('savesuccess', this);
		}
	} // eo function onSaveSuccess
	// }}}
	// {{{
	/**
	 * private, save failure callback
	 */
	,onSaveFailure:function(response, options) {
		if(true === this.logFailure) {
			this.log(this.saveFailureText, response);
		}
		this.dirty = true;
		this.fireEvent('savefailure', this);
	} // eo function onSaveFailure
	// }}}
	// {{{
	/**
	 * private, read state callback
	 */
	,onReadFailure:function(response, options) {
		if(true === this.logFailure) {
			this.log(this.readFailureText, response);
		}
		this.fireEvent('readfailure', this);

	} // eo function onReadFailure
	// }}}
	// {{{
	/**
	 * private, read success callback
	 */
	,onReadSuccess:function(response, options) {
		var o = {}, data;
		try {o = Ext.decode(response.responseText);}
		catch(e) {
			if(true === this.logFailure) {
				this.log(this.readFailureText, e, response);
			}
			return;
		}
		if(true !== o.success) {
			if(true === this.logFailure) {
				this.log(this.readFailureText, o, response);
			}
		}
		else {
			data = o[this.paramNames.data];
			if(!(data instanceof Array) && true === this.logFailure) {
				this.log(this.dataErrorText, data, response);
				return;
			}
			Ext.each(data, function(item) {
				this.state[item[this.paramNames.name]] = this.decodeValue(item[this.paramNames.value]);
			}, this);
			this.queue = [];
			this.dirty = false;
			if(true === this.logSuccess) {
				this.log(this.readSuccessText, data, response);
			}
			this.fireEvent('readsuccess', this);
		}
	} // eo function onReadSuccess
	// }}}
	// {{{
	/**
	 * Reads saved state from server by sending asynchronous Ajax request and processing the response
	 */
	,readState:function() {
		var o = {
			 url:this.readUrl || this.url
			,method:this.method
			,scope:this
			,success:this.onReadSuccess
			,failure:this.onReadFailure
			,params:{}
		};

		var params = Ext.apply({}, this.readBaseParams);
		params[this.paramNames.id] = this.id;
		params[this.paramNames.user] = this.user;
		params[this.paramNames.session] = this.session;

		Ext.apply(o.params, params);
		Ext.Ajax.request(o);
	} // eo function readState
	// }}}
	// {{{
	/**
	 * private, logs errors or successes
	 */
	,log:function() {
		if(console) {
			console.log.apply(console, arguments);
		}
	} // eo log
	// }}}

}); // eo extend

// eof
;/**
 * SimpleListStore：数据必须在构造时加载（以后不能再重新加载?)
 * 
 * 数据源举例:
 *	[{versionId:1,versionNumber:'1.0',comments:'评论1',createdDate:new Date(),userName:'user1'},
 *	 {versionId:2,versionNumber:'2.0',comments:'评论2',createdDate:new Date(),userName:'user2'}
 *	]
 */
divo.data.SimpleListStore = function(config) {
	divo.data.SimpleListStore.superclass.constructor.call(this, {
		reader : new Ext.data.JsonReader({
			id : config.id
		}, Ext.data.Record.create(config.fields)),
		proxy : new Ext.data.MemoryProxy(config.data)
	});
	this.load()
}

Ext.extend(divo.data.SimpleListStore, Ext.data.Store)
//EOP
;/**
 * ArrayStore：数据在构造时可以加载，也可以重新加载
 */
divo.data.ArrayStore = function(config) {
	divo.data.ArrayStore.superclass.constructor.call(this, {
		reader : new Ext.data.ArrayReader({}, Ext.data.Record.create(config.fields))
	})
	this.loadData(config.data||[])
};

Ext.extend(divo.data.ArrayStore, Ext.data.Store)
// EOP
;(function(){var EV=Ext.lib.Event;Ext.ux.ManagedIFrame=function(){var args=Array.prototype.slice.call(arguments,0),el=Ext.get(args[0]),config=args[0];if(el&&el.dom&&el.dom.tagName=="IFRAME"){config=args[1]||{};}else{config=args[0]||args[1]||{};el=config.autoCreate?Ext.get(Ext.DomHelper.append(config.autoCreate.parent||document.body,Ext.apply({tag:"iframe",src:(Ext.isIE&&Ext.isSecure)?Ext.SSL_SECURE_URL:""},config.autoCreate))):null;}if(!el||el.dom.tagName!="IFRAME"){return el;}el.dom.name||(el.dom.name=el.dom.id);el.dom.mifId=el.dom.id;this.addEvents({"focus":true,"blur":true,"unload":true,"domready":true,"documentloaded":true,"exception":true,"message":true});if(config.listeners){this.listeners=config.listeners;Ext.ux.ManagedIFrame.superclass.constructor.call(this);}Ext.apply(el,this);el.addClass("x-managed-iframe");if(config.style){el.applyStyles(config.style);}el._maskEl=el.parent(".x-managed-iframe-mask")||el.parent().addClass("x-managed-iframe-mask");Ext.apply(el,{disableMessaging:config.disableMessaging===true,loadMask:Ext.apply({msg:"Loading..",msgCls:"x-mask-loading",maskEl:el._maskEl,hideOnReady:true,disabled:!config.loadMask},config.loadMask),_eventName:Ext.isIE?"onreadystatechange":"onload",_windowContext:null,eventsFollowFrameLinks:typeof config.eventsFollowFrameLinks=="undefined"?true:config.eventsFollowFrameLinks});el.dom[el._eventName]=el.loadHandler.createDelegate(el);var um=el.updateManager=new Ext.UpdateManager(el,true);um.showLoadIndicator=config.showLoadIndicator||false;if(config.src){el.setSrc(config.src);}else{var content=config.html||config.content||false;if(content){el.update.defer(10,el,[content]);}}return Ext.ux.ManagedIFrame.Manager.register(el);};var MIM=Ext.ux.ManagedIFrame.Manager=function(){var frames={};var readyHandler=function(e,target){try{var id=target?target.mifId:null,frame;if((frame=this.getFrameById(id||target.id))&&frame._frameAction){frame.loadHandler({type:"domready"});}}catch(rhEx){}};var implementation={shimCls:"x-frame-shim",register:function(frame){frame.manager=this;frames[frame.id]=frames[frame.dom.name]={ref:frame,elCache:{}};return frame;},deRegister:function(frame){frame._unHook();delete frames[frame.id];delete frames[frame.dom.name];},hideShims:function(){if(!this.shimApplied){return ;}Ext.select("."+this.shimCls,true).removeClass(this.shimCls+"-on");this.shimApplied=false;},showShims:function(){if(!this.shimApplied){this.shimApplied=true;Ext.select("."+this.shimCls,true).addClass(this.shimCls+"-on");}},getFrameById:function(id){return typeof id=="string"?(frames[id]?frames[id].ref||null:null):null;},getFrameByName:function(name){return this.getFrameById(name);},getFrameHash:function(frame){return frame.id?frames[frame.id]:null;},eventProxy:function(e){if(!e){return ;}e=Ext.EventObject.setEvent(e);var be=e.browserEvent||e;if(e.type=="unload"){this._unHook();}if(!be["eventPhase"]||(be["eventPhase"]==(be["AT_TARGET"]||2))){return this.fireEvent(e.type,e);}},_flyweights:{},destroy:function(){if(this._domreadySignature){Ext.EventManager.un.apply(Ext.EventManager,this._domreadySignature);}},removeNode:Ext.isIE?function(frame,n){frame=MIM.getFrameHash(frame);if(frame&&n&&n.tagName!="BODY"){d=frame.scratchDiv||(frame.scratchDiv=frame.getDocument().createElement("div"));d.appendChild(n);d.innerHTML="";}}:function(frame,n){if(n&&n.parentNode&&n.tagName!="BODY"){n.parentNode.removeChild(n);}}};if(document.addEventListener){Ext.EventManager.on.apply(Ext.EventManager,implementation._domreadySignature=[window,"DOMFrameContentLoaded",readyHandler,implementation]);}Ext.EventManager.on(window,"beforeunload",implementation.destroy,implementation);return implementation;}();MIM.showDragMask=MIM.showShims;MIM.hideDragMask=MIM.hideShims;MIM.El=function(frame,el,forceNew){var frameObj;frame=(frameObj=MIM.getFrameHash(frame))?frameObj.ref:null;if(!frame){return null;}var elCache=frameObj.elCache||(frameObj.elCache={});var dom=frame.getDom(el);if(!dom){return null;}var id=dom.id;if(forceNew!==true&&id&&elCache[id]){return elCache[id];}this.dom=dom;this.id=id||Ext.id(dom);};MIM.El.get=function(frame,el){var ex,elm,id,doc;if(!frame||!el){return null;}var frameObj;frame=(frameObj=MIM.getFrameHash(frame))?frameObj.ref:null;if(!frame){return null;}var elCache=frameObj.elCache||(frameObj.elCache={});if(!(doc=frame.getDocument())){return null;}if(typeof el=="string"){if(!(elm=frame.getDom(el))){return null;}if(ex=elCache[el]){ex.dom=elm;}else{ex=elCache[el]=new MIM.El(frame,elm);}return ex;}else{if(el.tagName){if(!(id=el.id)){id=Ext.id(el);}if(ex=elCache[id]){ex.dom=el;}else{ex=elCache[id]=new MIM.El(frame,el);}return ex;}else{if(el instanceof MIM.El){if(el!=frameObj.docEl){el.dom=frame.getDom(el.id)||el.dom;elCache[el.id]=el;}return el;}else{if(el.isComposite){return el;}else{if(Ext.isArray(el)){return frame.select(el);}else{if(el==doc){if(!frameObj.docEl){var f=function(){};f.prototype=MIM.El.prototype;frameObj.docEl=new f();frameObj.docEl.dom=doc;}return frameObj.docEl;}}}}}}return null;};Ext.apply(MIM.El.prototype,Ext.Element.prototype);Ext.extend(Ext.ux.ManagedIFrame,Ext.util.Observable,{src:null,resetUrl:Ext.isIE&&Ext.isSecure?Ext.SSL_SECURE_URL:"about:blank",setSrc:function(url,discardUrl,callback){var src=url||this.src||this.resetUrl;this._windowContext=null;this._unHook();this._frameAction=this.frameInit=this._domReady=false;if(Ext.isOpera){this.reset();}this._callBack=callback||false;this.showMask();(function(){var s=typeof src=="function"?src()||"":src;try{this._frameAction=true;this.dom.src=s;this.frameInit=true;this.checkDOM();}catch(ex){this.fireEvent("exception",this,ex);}}).defer(100,this);if(discardUrl!==true){this.src=src;}return this;},reset:function(src,callback){this.dom.src=src||this.resetUrl;if(typeof callback=="function"){callback.defer(100);}return this;},scriptRE:/(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/gi,update:function(content,loadScripts,callback){loadScripts=loadScripts||this.getUpdateManager().loadScripts||false;content=Ext.DomHelper.markup(content||"");content=loadScripts===true?content:content.replace(this.scriptRE,"");var doc;if(doc=this.getDocument()){this._frameAction=!!content.length;this._windowContext=this.src=null;this._callBack=callback||false;this._unHook();this.showMask();doc.open();doc.write(content);doc.close();this.frameInit=true;if(this._frameAction){this.checkDOM();}else{this.hideMask(true);if(this._callBack){this._callBack();}}}else{this.hideMask(true);if(this._callBack){this._callBack();}}return this;},disableMessaging:true,_XFrameMessaging:function(){var tagStack={"$":[]};var isEmpty=function(v,allowBlank){return v===null||v===undefined||(!allowBlank?v==="":false);};window.sendMessage=function(message,tag,origin){var MIF;if(MIF=arguments.callee.manager){if(message._fromHost){var fn,result;var compTag=message.tag||tag||null;var mstack=!isEmpty(compTag)?tagStack[compTag.toLowerCase()]||[]:tagStack["$"];for(var i=0,l=mstack.length;i<l;i++){if(fn=mstack[i]){result=fn.apply(fn.__scope,arguments)===false?false:result;if(fn.__single){mstack[i]=null;}if(result===false){break;}}}return result;}else{message={type:isEmpty(tag)?"message":"message:"+tag.toLowerCase().replace(/^\s+|\s+$/g,""),data:message,domain:origin||document.domain,uri:document.documentURI,source:window,tag:isEmpty(tag)?null:tag.toLowerCase()};try{return MIF.disableMessaging!==true?MIF.fireEvent.call(MIF,message.type,MIF,message):null;}catch(ex){}return null;}}};window.onhostmessage=function(fn,scope,single,tag){if(typeof fn=="function"){if(!isEmpty(fn.__index)){throw"onhostmessage: duplicate handler definition"+(tag?" for tag:"+tag:"");}var k=isEmpty(tag)?"$":tag.toLowerCase();tagStack[k]||(tagStack[k]=[]);Ext.apply(fn,{__tag:k,__single:single||false,__scope:scope||window,__index:tagStack[k].length});tagStack[k].push(fn);}else{throw"onhostmessage: function required";}};window.unhostmessage=function(fn){if(typeof fn=="function"&&typeof fn.__index!="undefined"){var k=fn.__tag||"$";tagStack[k][fn.__index]=null;}};},get:function(el){return MIM.El.get(this,el);},fly:function(el,named){named=named||"_global";el=this.getDom(el);if(!el){return null;}if(!MIM._flyweights[named]){MIM._flyweights[named]=new Ext.Element.Flyweight();}MIM._flyweights[named].dom=el;return MIM._flyweights[named];},getDom:function(el){var d;if(!el||!(d=this.getDocument())){return null;}return el.dom?el.dom:(typeof el=="string"?d.getElementById(el):el);},select:function(selector,unique){var d;return(d=this.getDocument())?Ext.Element.select(selector,unique,d):null;},query:function(selector){var d;return(d=this.getDocument())?Ext.DomQuery.select(selector,d):null;},getDoc:function(){return this.get(this.getDocument());},removeNode:function(node){MIM.removeNode(this,this.getDom(node));},_unHook:function(){var elcache,h=MIM.getFrameHash(this)||{};if(this._hooked&&h&&(elcache=h.elCache)){for(var id in elcache){var el=elcache[id];delete elcache[id];if(el.removeAllListeners){el.removeAllListeners();}}if(h.docEl){h.docEl.removeAllListeners();h.docEl=null;delete h.docEl;}}this._hooked=this._domReady=this._domFired=false;},_renderHook:function(){this._windowContext=this.CSS=null;this._hooked=false;try{if(this.writeScript('(function(){(window.hostMIF = parent.Ext.get("'+this.dom.id+'"))._windowContext='+(Ext.isIE?"window":"{eval:function(s){return eval(s);}}")+";})();")){this._frameProxy||(this._frameProxy=MIM.eventProxy.createDelegate(this));var w=this.getWindow();EV.doAdd(w,"focus",this._frameProxy);EV.doAdd(w,"blur",this._frameProxy);EV.doAdd(w,"unload",this._frameProxy);if(this.disableMessaging!==true){this.loadFunction({name:"XMessage",fn:this._XFrameMessaging},false,true);var sm;if(sm=w.sendMessage){sm.manager=this;}}this.CSS=new CSSInterface(this.getDocument());}}catch(ex){}return this.domWritable();},sendMessage:function(message,tag,origin){var win;if(this.disableMessaging!==true&&(win=this.getWindow())){tag||(tag=message.tag||"");tag=tag.toLowerCase();message=Ext.applyIf(message.data?message:{data:message},{type:Ext.isEmpty(tag)?"message":"message:"+tag,domain:origin||document.domain,uri:document.documentURI,source:window,tag:tag||null,_fromHost:this});return win.sendMessage?win.sendMessage.call(null,message,tag,origin):null;}return null;},_windowContext:null,getDocument:function(){var win=this.getWindow(),doc=null;try{doc=(Ext.isIE&&win?win.document:null)||this.dom.contentDocument||window.frames[this.id].document||null;}catch(gdEx){return false;}return doc;},getBody:function(){var d;return(d=this.getDocument())?d.body:null;},getDocumentURI:function(){var URI,d;try{URI=this.src&&(d=this.getDocument())?d.location.href:null;}catch(ex){}return URI||this.src;},getWindow:function(){var dom=this.dom,win=null;try{win=dom.contentWindow||window.frames[dom.name]||null;}catch(gwEx){}return win;},print:function(){try{var win=this.getWindow();if(Ext.isIE){win.focus();}win.print();}catch(ex){throw"print exception: "+(ex.description||ex.message||ex);}},destroy:function(){this.removeAllListeners();if(this.dom){this.dom[this._eventName]=null;Ext.ux.ManagedIFrame.Manager.deRegister(this);this._windowContext=null;if(Ext.isIE&&this.dom.src){this.dom.src="javascript:false";}this._maskEl=null;this.remove();}if(this.loadMask){Ext.apply(this.loadMask,{masker:null,maskEl:null});}},domWritable:function(){return !!this._windowContext;},execScript:function(block,useDOM){try{if(this.domWritable()){if(useDOM){this.writeScript(block);}else{return this._windowContext.eval(block);}}else{throw"execScript:non-secure context";}}catch(ex){this.fireEvent("exception",this,ex);return false;}return true;},writeScript:function(block,attributes){attributes=Ext.apply({},attributes||{},{type:"text/javascript",text:block});try{var head,script,doc=this.getDocument();if(doc&&typeof doc.getElementsByTagName!="undefined"){if(!(head=doc.getElementsByTagName("head")[0])){head=doc.createElement("head");doc.getElementsByTagName("html")[0].appendChild(head);}if(head&&(script=doc.createElement("script"))){for(var attrib in attributes){if(attributes.hasOwnProperty(attrib)&&attrib in script){script[attrib]=attributes[attrib];}}return !!head.appendChild(script);}}}catch(ex){this.fireEvent("exception",this,ex);}return false;},loadFunction:function(fn,useDOM,invokeIt){var name=fn.name||fn;var fn=fn.fn||window[fn];this.execScript(name+"="+fn,useDOM);if(invokeIt){this.execScript(name+"()");}},showMask:function(msg,msgCls,forced){var lmask;if((lmask=this.loadMask)&&(!lmask.disabled||forced)){if(lmask._vis){return ;}lmask.masker||(lmask.masker=Ext.get(lmask.maskEl||this.dom.parentNode||this.wrap({tag:"div",style:{position:"relative"}})));lmask._vis=true;lmask.masker.mask.defer(lmask.delay||5,lmask.masker,[msg||lmask.msg,msgCls||lmask.msgCls]);}},hideMask:function(forced){var tlm;if((tlm=this.loadMask)&&!tlm.disabled&&tlm.masker){if(!forced&&(tlm.hideOnReady!==true&&this._domReady)){return ;}tlm._vis=false;tlm.masker.unmask.defer(tlm.delay||5,tlm.masker);}},loadHandler:function(e,target){if(!this.frameInit||(!this._frameAction&&!this.eventsFollowFrameLinks)){return ;}target||(target={});var rstatus=(e&&typeof e.type!=="undefined"?e.type:this.dom.readyState);switch(rstatus){case"loading":case"interactive":break;case"domready":if(this._domReady){return ;}this._domReady=true;if(this._hooked=this._renderHook()){this._domFired=true;this.fireEvent("domready",this);}case"domfail":this._domReady=true;this.hideMask();break;case"load":case"complete":if(!this._domReady){this.loadHandler({type:"domready",id:this.id});}this.hideMask(true);if(this._frameAction||this.eventsFollowFrameLinks){this.fireEvent.defer(50,this,["documentloaded",this]);}this._frameAction=this._frameInit=false;if(this.eventsFollowFrameLinks){this._domFired=this._domReady=false;}if(this._callBack){this._callBack(this);}break;default:}this.frameState=rstatus;},checkDOM:function(win){if(Ext.isOpera||Ext.isGecko||!this._frameAction){return ;}var n=0,win=win||this.getWindow(),manager=this,domReady=false,max=300;var poll=function(){try{var doc=manager.getDocument(),body=null;if(doc===false){throw"Document Access Denied";}if(!manager._domReady){domReady=!!(doc&&doc.getElementsByTagName);domReady=domReady&&(body=doc.getElementsByTagName("body")[0])&&!!body.innerHTML.length;}}catch(ex){n=max;}if(!manager._frameAction||manager._domReady){return ;}if((++n<max)&&!domReady){setTimeout(arguments.callee,10);return ;}manager.loadHandler({type:domReady?"domready":"domfail"});};setTimeout(poll,40);}});var styleCamelRe=/(-[a-z])/gi;var styleCamelFn=function(m,a){return a.charAt(1).toUpperCase();};var CSSInterface=function(hostDocument){var doc;if(hostDocument){doc=hostDocument;return{rules:null,createStyleSheet:function(cssText,id){var ss;if(!doc){return ;}var head=doc.getElementsByTagName("head")[0];var rules=doc.createElement("style");rules.setAttribute("type","text/css");if(id){rules.setAttribute("id",id);}if(Ext.isIE){head.appendChild(rules);ss=rules.styleSheet;ss.cssText=cssText;}else{try{rules.appendChild(doc.createTextNode(cssText));}catch(e){rules.cssText=cssText;}head.appendChild(rules);ss=rules.styleSheet?rules.styleSheet:(rules.sheet||doc.styleSheets[doc.styleSheets.length-1]);}this.cacheStyleSheet(ss);return ss;},removeStyleSheet:function(id){if(!doc){return ;}var existing=doc.getElementById(id);if(existing){existing.parentNode.removeChild(existing);}},swapStyleSheet:function(id,url){this.removeStyleSheet(id);if(!doc){return ;}var ss=doc.createElement("link");ss.setAttribute("rel","stylesheet");ss.setAttribute("type","text/css");ss.setAttribute("id",id);ss.setAttribute("href",url);doc.getElementsByTagName("head")[0].appendChild(ss);},refreshCache:function(){return this.getRules(true);},cacheStyleSheet:function(ss){if(this.rules){this.rules={};}try{var ssRules=ss.cssRules||ss.rules;for(var j=ssRules.length-1;j>=0;--j){this.rules[ssRules[j].selectorText]=ssRules[j];}}catch(e){}},getRules:function(refreshCache){if(this.rules==null||refreshCache){this.rules={};if(doc){var ds=doc.styleSheets;for(var i=0,len=ds.length;i<len;i++){try{this.cacheStyleSheet(ds[i]);}catch(e){}}}}return this.rules;},getRule:function(selector,refreshCache){var rs=this.getRules(refreshCache);if(!Ext.isArray(selector)){return rs[selector];}for(var i=0;i<selector.length;i++){if(rs[selector[i]]){return rs[selector[i]];}}return null;},updateRule:function(selector,property,value){if(!Ext.isArray(selector)){var rule=this.getRule(selector);if(rule){rule.style[property.replace(styleCamelRe,styleCamelFn)]=value;return true;}}else{for(var i=0;i<selector.length;i++){if(this.updateRule(selector[i],property,value)){return true;}}}return false;}};}};Ext.ux.ManagedIframePanel=Ext.extend(Ext.Panel,{defaultSrc:null,bodyStyle:{height:"100%",width:"100%",position:"relative"},frameStyle:{overflow:"auto"},frameConfig:null,hideMode:!Ext.isIE?"nosize":"display",shimCls:Ext.ux.ManagedIFrame.Manager.shimCls,shimUrl:null,loadMask:false,stateful:false,animCollapse:Ext.isIE&&Ext.enableFx,autoScroll:false,closable:true,ctype:"Ext.ux.ManagedIframePanel",showLoadIndicator:false,unsupportedText:"Inline frames are NOT enabled/supported by your browser.",initComponent:function(){this.bodyCfg||(this.bodyCfg={cls:"x-managed-iframe-mask",children:[Ext.apply({tag:"iframe",frameborder:0,cls:"x-managed-iframe",style:this.frameStyle||null,html:this.unsupportedText||null},this.frameConfig?this.frameConfig.autoCreate||{}:false,Ext.isIE&&Ext.isSecure?{src:Ext.SSL_SECURE_URL}:false),{tag:"img",src:this.shimUrl||Ext.BLANK_IMAGE_URL,cls:this.shimCls,galleryimg:"no"}]});this.autoScroll=false;this.items=null;if(this.stateful!==false){this.stateEvents||(this.stateEvents=["documentloaded"]);}Ext.ux.ManagedIframePanel.superclass.initComponent.call(this);this.monitorResize||(this.monitorResize=this.fitToParent);this.addEvents({documentloaded:true,domready:true,message:true,exception:true});this.addListener=this.on;},doLayout:function(){if(this.fitToParent&&!this.ownerCt){var pos=this.getPosition(),size=(Ext.get(this.fitToParent)||this.getEl().parent()).getViewSize();this.setSize(size.width-pos[0],size.height-pos[1]);}Ext.ux.ManagedIframePanel.superclass.doLayout.apply(this,arguments);},beforeDestroy:function(){if(this.rendered){if(this.tools){for(var k in this.tools){Ext.destroy(this.tools[k]);}}if(this.header&&this.headerAsText){var s;if(s=this.header.child("span")){s.remove();}this.header.update("");}Ext.each(["iframe","shim","header","topToolbar","bottomToolbar","footer","loadMask","body","bwrap"],function(elName){if(this[elName]){if(typeof this[elName].destroy=="function"){this[elName].destroy();}else{Ext.destroy(this[elName]);}this[elName]=null;delete this[elName];}},this);}Ext.ux.ManagedIframePanel.superclass.beforeDestroy.call(this);},onDestroy:function(){Ext.Panel.superclass.onDestroy.call(this);},onRender:function(ct,position){Ext.ux.ManagedIframePanel.superclass.onRender.call(this,ct,position);if(this.iframe=this.body.child("iframe.x-managed-iframe")){this.iframe.ownerCt=this;var El=Ext.Element;var mode=El[this.hideMode.toUpperCase()]||"x-hide-nosize";Ext.each([this[this.collapseEl],this.floating?null:this.getActionEl(),this.iframe],function(el){if(el){el.setVisibilityMode(mode);}},this);if(this.loadMask){this.loadMask=Ext.apply({disabled:false,maskEl:this.body,hideOnReady:true},this.loadMask);}if(this.iframe=new Ext.ux.ManagedIFrame(this.iframe,{loadMask:this.loadMask,showLoadIndicator:this.showLoadIndicator,disableMessaging:this.disableMessaging,style:this.frameStyle})){this.loadMask=this.iframe.loadMask;this.relayEvents(this.iframe,["blur","focus","unload","documentloaded","domready","exception","message"].concat(this._msgTagHandlers||[]));delete this._msgTagHandlers;}this.getUpdater().showLoadIndicator=this.showLoadIndicator||false;var ownerCt=this.ownerCt;while(ownerCt){ownerCt.on("afterlayout",function(container,layout){var MIM=Ext.ux.ManagedIFrame.Manager,st=false;Ext.each(["north","south","east","west"],function(region){var reg;if((reg=layout[region])&&reg.splitEl){st=true;if(!reg.split._splitTrapped){reg.split.on("beforeresize",MIM.showShims,MIM);reg.split._splitTrapped=true;}}},this);if(st&&!this._splitTrapped){this.on("resize",MIM.hideShims,MIM);this._splitTrapped=true;}},this,{single:true});ownerCt=ownerCt.ownerCt;}}this.shim=Ext.get(this.body.child("."+this.shimCls));},toggleShim:function(){if(this.shim&&this.shimCls){this.shim.toggleClass(this.shimCls+"-on");}},afterRender:function(container){var html=this.html;delete this.html;Ext.ux.ManagedIframePanel.superclass.afterRender.call(this);if(this.iframe){if(this.defaultSrc){this.setSrc();}else{if(html){this.iframe.update(typeof html=="object"?Ext.DomHelper.markup(html):html);}}}},sendMessage:function(){if(this.iframe){this.iframe.sendMessage.apply(this.iframe,arguments);}},on:function(name){var tagRE=/^message\:/i,n=null;if(typeof name=="object"){for(var na in name){if(!this.filterOptRe.test(na)&&tagRE.test(na)){n||(n=[]);n.push(na.toLowerCase());}}}else{if(tagRE.test(name)){n=[name.toLowerCase()];}}if(this.getFrame()&&n){this.relayEvents(this.iframe,n);}else{this._msgTagHandlers||(this._msgTagHandlers=[]);if(n){this._msgTagHandlers=this._msgTagHandlers.concat(n);}}Ext.ux.ManagedIframePanel.superclass.on.apply(this,arguments);},setSrc:function(url,discardUrl,callback){url=url||this.defaultSrc||false;if(!url){return this;}if(url.url){callback=url.callback||false;discardUrl=url.discardUrl||false;url=url.url||false;}var src=url||(Ext.isIE&&Ext.isSecure?Ext.SSL_SECURE_URL:"");if(this.rendered&&this.iframe){this.iframe.setSrc(src,discardUrl,callback);}return this;},getState:function(){var URI=this.iframe?this.iframe.getDocumentURI()||null:null;return Ext.apply(Ext.ux.ManagedIframePanel.superclass.getState.call(this)||{},URI?{defaultSrc:typeof URI=="function"?URI():URI}:null);},getUpdater:function(){return this.rendered?(this.iframe||this.body).getUpdater():null;},getFrame:function(){return this.rendered?this.iframe:null;},getFrameWindow:function(){return this.rendered&&this.iframe?this.iframe.getWindow():null;},getFrameDocument:function(){return this.rendered&&this.iframe?this.iframe.getDocument():null;},getFrameDoc:function(){return this.rendered&&this.iframe?this.iframe.getDoc():null;},getFrameBody:function(){return this.rendered&&this.iframe?this.iframe.getBody():null;},load:function(loadCfg){var um;if(um=this.getUpdater()){if(loadCfg&&loadCfg.renderer){um.setRenderer(loadCfg.renderer);delete loadCfg.renderer;}um.update.apply(um,arguments);}return this;},doAutoLoad:function(){this.load(typeof this.autoLoad=="object"?this.autoLoad:{url:this.autoLoad});}});Ext.reg("iframepanel",Ext.ux.ManagedIframePanel);Ext.ux.ManagedIframePortlet=Ext.extend(Ext.ux.ManagedIframePanel,{anchor:"100%",frame:true,collapseEl:"bwrap",collapsible:true,draggable:true,cls:"x-portlet"});Ext.reg("iframeportlet",Ext.ux.ManagedIframePortlet);Ext.apply(Ext.Element.prototype,{setVisible:function(visible,animate){if(!animate||!Ext.lib.Anim){if(this.visibilityMode==Ext.Element.DISPLAY){this.setDisplayed(visible);}else{if(this.visibilityMode==Ext.Element.VISIBILITY){this.fixDisplay();this.dom.style.visibility=visible?"visible":"hidden";}else{this[visible?"removeClass":"addClass"](String(this.visibilityMode));}}}else{var dom=this.dom;var visMode=this.visibilityMode;if(visible){this.setOpacity(0.01);this.setVisible(true);}this.anim({opacity:{to:(visible?1:0)}},this.preanim(arguments,1),null,0.35,"easeIn",function(){if(!visible){if(visMode==Ext.Element.DISPLAY){dom.style.display="none";}else{if(visMode==Ext.Element.VISIBILITY){dom.style.visibility="hidden";}else{Ext.get(dom).addClass(String(visMode));}}Ext.get(dom).setOpacity(1);}});}return this;},isVisible:function(deep){var vis=!(this.getStyle("visibility")=="hidden"||this.getStyle("display")=="none"||this.hasClass(this.visibilityMode));if(deep!==true||!vis){return vis;}var p=this.dom.parentNode;while(p&&p.tagName.toLowerCase()!="body"){if(!Ext.fly(p,"_isVisible").isVisible()){return false;}p=p.parentNode;}return true;}});Ext.onReady(function(){var CSS=Ext.util.CSS,rules=[];CSS.getRule(".x-managed-iframe")||(rules.push(".x-managed-iframe {height:100%;width:100%;overflow:auto;}"));CSS.getRule(".x-managed-iframe-mask")||(rules.push(".x-managed-iframe-mask{width:100%;height:100%;position:relative;}"));if(!CSS.getRule(".x-frame-shim")){rules.push(".x-frame-shim {z-index:8500;position:absolute;top:0px;left:0px;background:transparent!important;overflow:hidden;display:none;}");rules.push(".x-frame-shim-on{width:100%;height:100%;display:block;zoom:1;}");rules.push(".ext-ie6 .x-frame-shim{margin-left:5px;margin-top:3px;}");}CSS.getRule(".x-hide-nosize")||(rules.push(".x-hide-nosize,.x-hide-nosize *{height:0px!important;width:0px!important;border:none;}"));if(!!rules.length){CSS.createStyleSheet(rules.join(" "));}});})();;/**
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
;/**
  * 点击并能保持焦点的显项目列表显示面板
  * --------------------------------------------------------------
  * 消息：
  * 选择了项目
  * 
  * 消息名：     			
  * divo.panel.clickAction      
  * 
  * 消息内容：
  * {String} sender 本组件的id值
  * {String} code 所选项目编号
  * {String} name 所选项目名称
  * --------------------------------------------------------------
 */
divo.panel.ClickActionWithFocusPanel = Ext.extend(Ext.Panel, {
	customCls : "",
	customBodyStyle : "padding:10px",
	selectedItemCode : null,
	initComponent : function() {
		this.listId  = this.myId("list")
    	var navHTML = [				
		'<div id="'+this.listId+'" class="divo-list'+(this.customCls?'-'+this.customCls:'')+'">',
		'  <div id="'+this.listId+'-inner"></div>',
		'</div>'].join('')

		Ext.apply(this, {
			layout : 'fit',						
			bodyStyle : this.customBodyStyle,
			items : [{
	  		   autoScroll : true,
			   xtype : "panel",
			   html : navHTML
			}]
		})
		
		divo.panel.ClickActionWithFocusPanel.superclass.initComponent.apply(this,arguments)
	},
    afterRender : function() {
    	divo.panel.ClickActionWithFocusPanel.superclass.afterRender.call(this)
    	this.renderOther.defer(100,this)
    },
	renderOther : function() {
		var el = Ext.get(this.listId+"-inner")
		
	    var tpl = new Ext.XTemplate(
	    	'<tpl for=".">',
			'<tpl if="this.isLine(name)">',
            '    <br />',
        	'</tpl>',	    	
			'<tpl if="this.isLine(name)==false">',
	    	'  <a href="#" hidefocus="on" class="{cls}" id="'+this.listId +'-{code}">',
	    	'    <img src="/media/js/ext/resources/images/default/s.gif">',
	    	'    {name}',
	    	'  </a>',
        	'</tpl>',	    	
	    	'</tpl>',{
			isLine: function(name){
        		return name == "-";
     		}	    		
	    })
		
	    this.listData = this.getListData()
		tpl.overwrite(el, this.listData)

		el.on('click', function(e, t) {
			e.stopEvent()
			this.selectItem(t)
		},this)
		
		if (this.selectedItemCode) {
			this.selectItem.defer(100,this,[this.listId+"-"+this.selectedItemCode])
		}
	},
	selectItem : function(t) {
		var el = Ext.get(t)
		if (!el) return
		
		el.radioClass('active')
		if (t.id)
			var codes = t.id.split('-')
		else
		    var codes = t.split('-')
		code = codes[codes.length-1] 
		if (code=='inner') return
        this.publish("divo.panel.clickAction",{
        	code : code,
        	name : this.getListName(code),
        	sender:this.id
        })
	},
	getListName : function(code) {
		for (var i = 0; i < this.listData.length; i++) {
		    if (this.listData[i].code==code)
		        return this.listData[i].name
		}
		return ""
	},
	//子类需重写
	getListData : Ext.emptyFn
})

Ext.reg('divo.panel.ClickActionWithFocusPanel', divo.panel.ClickActionWithFocusPanel)
// EOP

;/**
 * 带有定制按钮和链接的面板（只用作基类）
 */
divo.panel.PanelWithHtmlBtns = Ext.extend(Ext.Panel, {
	//public
	//btn是对象数组，数组元素表示按钮，例如：
	//
	// text : '修改',
	// icon : 'edit.gif',  //默认 /media/images/
	// handler :this.modifyCheckReport,
	// hidden : !this.isCheckerUser()
    //
	rightWidth : 100,
	btnRightCls : 'divo-big-btn-right',
	btnCls : 'divo-big-btn-left',
	initComponent : function() {
		divo.waitFor(this.canSetupBtns,this.setupBtns,this)
		divo.panel.PanelWithHtmlBtns.superclass.initComponent.call(this);
	},
	getHtmlBtnsPanel : function(btns) {
        this.hasRightBtns = false
        this.htmlBtns = btns

		var html = []
		html.push('<div class="divo-big-btn" >')
		
		//左侧按钮
		html.push('<div class="'+this.btnCls+'"><ul id="' + this.myId('btns') + '">')
		var hasBtns = false
		var rightBtnStartAt = 0
		for (var i = 0; i < this.htmlBtns.length; i++) {
			var item = this.htmlBtns[i]
			if (typeof item == 'string' && item=='->') {
				 this.hasRightBtns = true
				 rightBtnStartAt = i+1
			     break
			}
			if (item.hidden) continue 
			
			if (item.items==undefined) {
				var btnId = this.myId('btn-' + i)
				var img = ''
				if(item.icon)
					var img =  '<img src="/media/images/'+item.icon+'" />&nbsp;'
				var text = img+item.text
			} else {
				var btnId = this.myId('btn-items-' + i)
				var text = item.text+'▼'
			}	
			html.push('<li><a id="'
						+ btnId
						+ '" href="#">'
						+ text + '</a></li>')
			hasBtns = true
		}
		html.push('</ul></div>')
        html.push('</div>')
        //divo.log(html)
		
		//右侧链接, 或者纯文字
		if (this.hasRightBtns) {
			var html2 = []
            html2.push('<div class="divo-big-btn" >')
            html2.push('<div id="' + this.myId('btnsRight') + '" class="'+this.btnRightCls+'">')
            for (var i = rightBtnStartAt; i < this.htmlBtns.length; i++) {
                var item = this.htmlBtns[i]
                if (item.hidden) continue 
                if (item.handler==undefined) {
                	html2.push(item.text)
                } else {
                    html2.push('<a id="'
                                + this.myId('btn-' + i)
                                + '" href="#">'
                                + item.text + '</a>&nbsp;&nbsp;')
                }                
                hasBtns = true
            }
            html2.push('</div>')
            html2.push('</div>')
		}
		
        if (!this.hasRightBtns)
    		return {
    			region : 'north',
    			layout : 'fit',
    			height : hasBtns?38:0,
    			html : html.join('')
    		}
    	return {
            region : 'north',
            layout : 'fit',
            height : hasBtns?38:0,
            items : [this.createBtnLayoutPanel(html,html2)]
    	}
	},
    createBtnLayoutPanel : function(htmlLeft,htmlRight) {
        return new Ext.Panel({
            layout : 'border',
            items : [{
                region : 'center',
                layout : 'fit',
                html : htmlLeft.join('')
            },{
                region : 'east',
                width : this.rightWidth,
                layout : 'fit',
                html : htmlRight.join('')
            }] // items
        })  
    },
    canSetupBtns : function() {
    	return Ext.get(this.myId('btns'))
    },
    setupBtnsCore : function(el) {
        el.on({
            click : {
                stopEvent : false,
                delegate : 'a',
                scope : this,
                fn : function(e, target) {
                    var elIds = target.id.split('-')
                    var index = elIds[elIds.length-1]
                    //if  (!Ext.get(target.id).hasClass("inactive")) {
                        if (target.id.indexOf("-items-")>0) {
                            this.showContextMenu(index,target.id)
                        } else {
                            this.htmlBtns[index].handler.call(this)
                        }   
                    //}   
                }
            }
        })
    },    
	setupBtns : function() {
		this.setupBtnsCore(Ext.get(this.myId('btns')))
        if (this.hasRightBtns)		
            this.setupBtnsCore(Ext.get(this.myId('btnsRight')))
	},
	//public
	setBtnText : function(index,text) {
		var el = Ext.get(this.myId('btn-' + index))
		el.dom.innerHTML = text
	},
	//public
	setBtnVisible : function(index,visible) {
		var el = Ext.get(this.myId('btn-' + index))
		el.setVisibilityMode(Ext.Element.DISPLAY);
		el.setVisible(visible)
	},
	//public
	disableBtn : function(index) {
		this.setBtnVisible(index,false)
	},
	//public
	enableBtn : function(index) {
		this.setBtnVisible(index,true)
	},
	showContextMenu : function(index,btnId) {
		var menu = new Ext.menu.Menu({
			items: this.htmlBtns[index].items	
		});
		var position = Ext.get(btnId).getXY()
		position[1] = position[1]+22 //y
		menu.showAt(position);
	}
})

// EOP

;
/* global Ext
 *
 *
 ************************************************************************************
 *   This file is distributed on an AS IS BASIS WITHOUT ANY WARRANTY;
 *   without even the implied warranty of MERCHANTABILITY or
 *   FITNESS FOR A PARTICULAR PURPOSE.
 ************************************************************************************

 License: ux.Media classes are licensed under the terms of
 the Open Source GPL 3.0 license (details: http://www.gnu.org/licenses/gpl.html).

 Donations are welcomed: http://donate.theactivegroup.com

 Commercial use is prohibited without a Commercial License. See http://licensing.theactivegroup.com.

 Notes: the <embed> tag is NOT used(or necessary) in this implementation

 Version   2.1  11/11/2008
          Fixes:
            Corrects missing unsupportedText markup rendering.
            Corrects inline markup rendering.
            Corrects autoSize height/width macro replacement.
            Corrects mixed content warnings on SSL sites.
          Adds:
            loaded readyState detection for all media types and sub-classes.

 Version:  2.0
           Height/Width now honors inline style as well,
           Added Component::mediaEl(eg: 'body', 'el') for targeted media rendering.
           Added scale and status macros.
           Added px unit assertion for strict DTDs.
           Final Quicktime config.
           Adds new PDF(Iframe), Remote Desktop Connection, Silverlight, Office Web Connect-XLS (IE),
                Powerpoint, Wordpress player mediaType profiles.


 Version:  Rc1
           Adds inline media rendering within markup: <div><script>document.write(String(new Ext.ux.Media(mediaCfg)));</script></div>
           New extensible classes :
              ux.Media
              ux.MediaComponent
              ux.MediaPanel

           Solves the Firefox reinitialization problem for Ext.Components with embedded <OBJECT> tags
           when the upstream DOM is reflowed.

           See Mozilla https://bugzilla.mozilla.org/show_bug.cgi?id=262354

 Version:  .31 Fixes to canned WMV config.
 Version:  .3  New class Heirarchy.  Adds renderMedia(mediaCfg) method for refreshing
               a mediaPanels body with a new/current mediaCfg.
 Version:  .2  Adds JW FLV Player Support and enhances mediaClass defaults mechanism.
 Version:  .11 Modified width/height defaults since CSS does not seem to
                honor height/width rules
 Version:  .1  initial release

 mediaCfg: {Object}
     { mediaType : mediaClass defined by ux.Media.mediaTypes[mediaClass]
      ,url       : Url resource to load when rendered
      ,requiredVersion : may specify a specific player/plugin version (for use with inline plugin updates where implemented)
      ,loop      : (true/false) (@macro enabled)
      ,scripting : (true/false) (@macro enabled)
      ,start     : (true/false) (@macro enabled)
      ,volume    : (number%, default: 20 ) audio volume level % (@macro enabled)
      ,height    : (default: 100%) (@macro enabled)
      ,width     : (default: 100%) (@macro enabled)
      ,scale     : (default: 1) (@macro enabled)
      ,status    : (default: false) (@macro enabled)
      ,autoSize  : (true/false) If true the rendered <object> consumes 100% height/width of its
                     containing Element.  Actual container height/width are available to macro substitution
                     engine.
      ,controls  : optional: show plugins control menu (true/false) (@macro enabled)
      ,unsupportedText: (String,DomHelper cfg) Text to render if plugin is not installed/available.
      ,listeners  : {"mouseover": function() {}, .... } DOM listeners to set each time the Media is rendered.
      ,params   : { }  members/values unique to Plugin provider
     }

*/

Ext.removeNode =  Ext.isIE ? function(n){
            var d = document.createElement('div'); //the original closure held a reference till reload as well.
            if(n && n.tagName != 'BODY'){
                    var d = document.createElement('div');
                    d.appendChild(n);
                    //d.innerHTML = '';  //either works equally well
                    d.removeChild(n);
                    delete Ext.Element.cache[n.id];  //clear out any Ext reference from the Elcache
                    d = null;  //just dump the scratch DIV reference here.
            }

        } :
        function(n){
            if(n && n.parentNode && n.tagName != 'BODY'){
                n.parentNode.removeChild(n);
                delete Ext.Element.cache[n.id];
            }
        };


(function(){

   /**
    *
    * @class Ext.ux.Media
    * @version 2.1
    * @author Doug Hendricks. doug[always-At]theactivegroup.com
    * @copyright 2007-2008, Active Group, Inc.  All rights reserved.
    * @constructor
    * @donate <a target="tag_donate" href="http://donate.theactivegroup.com"><img border="0" src="http://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" border="0" alt="Make a donation to support ongoing development"></a>
    * @desc
    * Base Media Class
    * Used primarily for rendering a mediaCfg for use with inline markup.
    */

    Ext.ux.Media = function(config){
         this.toString = this.asMarkup;  //Inline rendering support for this and all subclasses
         Ext.apply(this,config||{});
         this.initMedia();
    };
    var ux = Ext.ux.Media;
    var stateRE = /4$/i;

    if(parseFloat(Ext.version) < 2.1){ throw "Ext.ux.Media and sub-classes are not License-Compatible with your Ext release.";}

    Ext.ux.Media.prototype = {

         /**
         * @property {Object} mediaObject An {@link Ext.ux.Media.Element} reference to rendered DOM Element.
         */
         mediaObject     : null,

         /**
          * @cfg {Object} mediaCfg Media configuration options.
          * @example mediaCfg  : {
             id    : String   Desired DOM id of rendered Media tag
             tag   :
             style : Obj  optional DomHelper style object

            }
         */
         mediaCfg        : null,
         mediaVersion    : null,
         requiredVersion : null,

         /**
          * @cfg {String/DOMHelperObject} unsupportedText Text Markup/DOMHelper config displayed when the media is not available or cannot be rendered without an additional browser plugin.
          */
         unsupportedText : null,

         /** @cfg {string} hideMode Defines the hideMode for Ext.ux.Media component sub-classes.<p>
          * If the the value of 'nosize' is used, the {@link Ext.ux.VisibilityMode} plugin is applied to the media Component
          * as well as to upstream layout Containers.
          * @default for IE: 'display', 'nosize' for all other browsers
         */

         hideMode      : !Ext.isIE?'nosize':'display',

         animCollapse  :  Ext.enableFx && Ext.isIE,

         animFloat     :  Ext.enableFx && Ext.isIE,

         autoScroll    : true,

         bodyStyle     : {position: 'relative'},

         visibilityCls : !Ext.isIE ?'x-hide-nosize':null,

        /**
          * @private (usually called once by initComponent)
          * Subclasses should override for special startup tasks
          */
         initMedia      : function(){ },

         /**
          * @cfg {boolean} disableCaching Disable browser caching of URLs
          */
         disableCaching  : false,

         _maxPoll        : 200,


         /** @private */
         getMediaType: function(type){
             return ux.mediaTypes[type];
         },

         /** @private
          Assert default values and exec as functions
          */
         assert : function(v,def){
              v= typeof v === 'function'?v.call(v.scope||null):v;
              return Ext.value(v ,def);
         },

        /** @private
           Assert/cleanse ID.  Overridable by sub-classes
         */
         assertId : function(id, def){
             id || (id = def || Ext.id());
             return id;
         },

        /** @private
         * Prepare a URL for disabledCaching
         */
         prepareURL : function(url, disableCaching){
            var parts = url ? url.split('#') : [''];
            if(!!url && (disableCaching = disableCaching === undefined ? this.disableCaching : disableCaching) ){

                var u = parts[0];

                if( !(/_dc=/i).test(u) ){

                    var append = "_dc=" + (new Date().getTime());
                    if(u.indexOf("&") !== -1){
                        u += "&" + append;
                    }else{
                        u += "?" + append;
                    }

                    parts[0] = u;
                }
            }
            return parts.length > 1 ? parts.join('#') : parts[0];
         },

          /* Normalize the mediaCfg to DOMHelper cfg */
         prepareMedia : function(mediaCfg, width, height, ct){

             mediaCfg = mediaCfg ||this.mediaCfg;

             if(!mediaCfg){return '';}

             var m= Ext.apply({url:false,autoSize:false}, mediaCfg); //make a copy

             m.url = this.prepareURL(this.assert(m.url,false),m.disableCaching);

             if( m.mediaType){

                 var value,p, El = Ext.Element;

                 var media = Ext.apply({}, this.getMediaType(this.assert(m.mediaType,false)) || false );

                 var params = Ext.apply(media.params||{},m.params || {});

                 for(var key in params){

                    if(params.hasOwnProperty(key)){
                      m.children || (m.children = []);
                      p = this.assert(params[key],null);
                      if(p !== null){
                         m.children.push({tag:'param'
                                         ,name:key
                                         ,value: typeof p === 'object'?Ext.urlEncode(p):encodeURI(p)
                                         });
                      }
                    }
                 }
                 delete   media.params;

                 //childNode Text if plugin/object is not installed.
                 var unsup = this.assert(m.unsupportedText|| this.unsupportedText || media.unsupportedText,null);
                 if(unsup){
                     m.children || (m.children = []);
                     m.children.push(unsup);
                 }

                 if(m.style && typeof m.style != "object") { throw 'Style must be JSON formatted'; }

                 m.style = this.assert(Ext.apply(media.style || {}, m.style || {}) , {});
                 delete media.style;

                 m.height = this.assert(height || m.height || media.height || m.style.height, null);
                 m.width  = this.assert(width  || m.width  || media.width || m.style.width ,null);

                 m = Ext.apply({tag:'object'},m,media);

                 //Convert element height and width to inline style to avoid issues with display:none;
                 if(m.height || m.autoSize)
                 {
                    Ext.apply(m.style, {
                      height:El.addUnits( m.autoSize ? '100%' : m.height ,El.prototype.defaultUnit)});
                 }
                 if(m.width || m.autoSize)
                 {
                    Ext.apply(m.style, {
                      width :El.addUnits( m.autoSize ? '100%' : m.width ,El.prototype.defaultUnit)});
                 }

                 m.id   = this.assertId(m.id);
                 m.name = this.assertId(m.name, m.id);

                 m._macros= {
                   url       : m.url || ''
                  ,height    : (/%$/.test(m.height)) ? m.height : parseInt(m.height,10)||null
                  ,width     : (/%$/.test(m.width)) ? m.width : parseInt(m.width,10)||null
                  ,scripting : this.assert(m.scripting,false)
                  ,controls  : this.assert(m.controls,false)
                  ,scale     : this.assert(m.scale,1)
                  ,status    : this.assert(m.status,false)
                  ,start     : this.assert(m.start, false)
                  ,loop      : this.assert(m.loop, false)
                  ,volume    : this.assert(m.volume, 20)
                  ,id        : m.id
                 };

                 delete   m.url;
                 delete   m.mediaType;
                 delete   m.controls;
                 delete   m.status;
                 delete   m.start;
                 delete   m.loop;
                 delete   m.scale;
                 delete   m.scripting;
                 delete   m.volume;
                 delete   m.autoSize;
                 delete   m.params;
                 delete   m.unsupportedText;
                 delete   m.renderOnResize;
                 delete   m.disableCaching;
                 delete   m.listeners;
                 delete   m.height;
                 delete   m.width;
                 return m;
              }else{
                 var unsup = this.assert(m.unsupportedText|| this.unsupportedText || media.unsupportedText,null);
                 unsup = unsup ? Ext.DomHelper.markup(unsup): null;
                 return String.format(unsup || 'Media Configuration/Plugin Error',' ',' ');
             }
           },

           /**
            * @return {String} the renderable markup of a passed normalized mediaCfg
            */
         asMarkup  : function(mediaCfg){
              return this.mediaMarkup(this.prepareMedia(mediaCfg));
         },

          /** @private
          * macro replacement engine for mediaCfg -> rendered tags/styling
          */
         mediaMarkup : function(mediaCfg){
            mediaCfg = mediaCfg || this.mediaCfg;
            if(mediaCfg){
                 var _macros = mediaCfg._macros;
                 delete mediaCfg._macros;
                 var m = Ext.DomHelper.markup(mediaCfg);
                 if(_macros){
                   var _m, n;
                    for ( n in _macros){
                      _m = _macros[n];
                      if(_m !== null){
                           m = m.replace(new RegExp('((%40|@)'+n+')','g'),_m+'');
                      }
                    }

                  }
                  return m;
            }

         },

         /** @private
         * Set the mediaMask if defined
         */
         setMask  : function(el) {
             var mm;
             if((mm = this.mediaMask)){
                    mm.el || (mm = this.mediaMask = new Ext.ux.IntelliMask(el,mm));
                    mm.el.addClass('x-media-mask');
             }

         },
         /**
         *  Refreshes the Media Object based on last known mediaCfg.
         *  @param {Element} target The target container Element for the refresh operation.
         *  @returns {Ext.ux.Media} this
         */
          refreshMedia  : function(target){
                 if(this.mediaCfg) {this.renderMedia(null,target);}
                 return this;
          },

          /**
          *  This method updates the target Element with a new mediaCfg object,
          *  or supports a refresh of the target based on the current mediaCfg object
          *  This method may be invoked inline (in Markup) before the DOM is ready
          *  param position indicate the DomHeper position for Element insertion (ie 'afterbegin' the default)
          */
          renderMedia : function(mediaCfg, ct, domPosition , w , h){
              if(!Ext.isReady){
                  Ext.onReady(this.renderMedia.createDelegate(this,Array.prototype.slice.call(arguments,0)));
                  return;
              }
              var mc = (this.mediaCfg = mediaCfg || this.mediaCfg) ;
              ct = Ext.get(this.lastCt || ct || (this.mediaObject?this.mediaObject.dom.parentNode:null));

              this.onBeforeMedia.call(this, mc, ct, domPosition , w , h);

              if(ct){
                  this.lastCt = ct;
                  if(mc && (mc = this.prepareMedia(mc, w, h, ct))){
                     this.setMask(ct);

                     if(this.mediaMask && this.autoMask){
                          this.mediaMask.show();
                     }
                     this.clearMedia();

                     this.writeMedia(mc, ct, domPosition || 'afterbegin');

                  }
              }
              this.onAfterMedia(ct);

          },

          /** @private
           *Override if necessary to render to targeted container
           */
          writeMedia : function(mediaCfg, container, domPosition ){
              var ct = Ext.get(container);
              if(ct){
                domPosition ? Ext.DomHelper.insertHtml(domPosition,ct.dom,this.mediaMarkup(mediaCfg))
                  :ct.update(this.mediaMarkup(mediaCfg));
              }

          },

          /**
           * Remove a rendered  mediaObject from the DOM.
           */
          clearMedia : function(){
            var mo;
            if(Ext.isReady && (mo = this.mediaObject)){
                mo.remove(true,true);
            }
            this.mediaObject = null;
          },

           /** @private */
          resizeMedia   : function(comp, w, h){
              var mc = this.mediaCfg;

              if(mc && this.boxReady && mc.renderOnResize && !!w && !!h){
                  // Ext.Window.resizer fires this event a second time
                  if(arguments.length > 3 && (!this.mediaObject || mc.renderOnResize )){
                      this.refreshMedia(this[this.mediaEl]);
                  }
              }

          },

          /** @private */
          onBeforeMedia  : function(mediaCfg, ct, domPosition, width, height){

            var m = mediaCfg || this.mediaCfg, mt;

            if( m && (mt = this.getMediaType(m.mediaType)) ){
                m.autoSize = m.autoSize || mt.autoSize===true;
                var autoSizeEl;
                //Calculate parent container size for macros (if available)
                if(m.autoSize && (autoSizeEl = Ext.isReady?
                    //Are we in a layout ? autoSize to the container el.
                     Ext.get(this[this.mediaEl] || this.lastCt || ct) :null)
                 ){
                  m.height = this.autoHeight ? null : autoSizeEl.getHeight(true);
                  m.width  = this.autoWidth ? null : autoSizeEl.getWidth(true);
                }

             }
             this.assert(m.height,height);
             this.assert(m.width ,width);
             mediaCfg = m;

          },

          /** @private
           * Media Load Handler, called when a mediaObject reports a loaded readystate
           */
          onMediaLoad : function(e){
               if(e && e.type == 'load'){
                  this.fireEvent('mediaload',this, this.mediaObject );

                  if(this.mediaMask && this.autoMask){ this.mediaMask.hide(); }

               }
          },
          /** @private */
          onAfterMedia   : function(ct){
               var mo;
               if(this.mediaCfg && ct && (mo = this.mediaObject =
                       new (this.elementClass || Ext.ux.Media.Element)(ct.child('.x-media', true) ))){
                   mo.ownerCt = this;

                   var L; //Reattach any DOM Listeners after rendering.
                   if(L = this.mediaCfg.listeners ||null){
                      mo.on(L);  //set any DOM listeners
                    }
                   this.fireEvent('mediarender',this, this.mediaObject );

                    //Load detection for non-<object> media (iframe, img)
                   if(mo.dom.tagName !== 'OBJECT'){
                      mo.on({
                       load  :this.onMediaLoad
                      ,scope:this
                      ,single:true
                     });
                   } else {
                       //IE, Opera possibly others, support a readyState on <object>s
                       this._countPoll = 0;
                       this.pollReadyState( this.onMediaLoad.createDelegate(this,[{type:'load'}],0));
                   }

               }
              if(this.autoWidth || this.autoHeight){
                this.syncSize();
              }
          },

          /**
           * @private
           * synthesize a mediaload event for DOMs that support object.readyState
           */
         pollReadyState : function( cb, readyRE){

            var media = this.getInterface();
            if(media && typeof media.readyState != 'undefined'){
                (readyRE || stateRE).test(media.readyState) ? cb() : arguments.callee.defer(10,this,arguments);
            }
         },

          /**
          * @return {Ext.Element} reference to the rendered media Object.
          */
          getInterface  : function(){
              return this.mediaObject?this.mediaObject.dom||null:null;
          },

         detectVersion  : Ext.emptyFn,

         /**
            @cfg {Boolean} autoMask
            @default false
            Class default: IE provides sufficient DOM readyState for object tags to manage {@link #mediaMask}s automatically
            (No other browser does), so masking must either be directed manually or use the autoHide option
            of the {@link Ext.ux.IntelliMask}.
          * <p>If true the Component attempts to manage the mediaMask based on events/media status,
          * false permits control of the mask visibility manually.
          */

         autoMask   : false
    };

    Ext.ns('Ext.ux.plugin');

    var componentAdapter = {

        init         : function(){

            this.getId = function(){
                return this.id || (this.id = "media-comp" + (++Ext.Component.AUTO_ID));
            };

            this.html = this.contentEl = this.items = null;

            //Attach the Visibility Fix (if available) to the current class Component
            if(this.hideMode == 'nosize' && Ext.ux.plugin.VisibilityMode){

               new Ext.ux.plugin.VisibilityMode({
                 visibilityCls   : 'x-hide-nosize',
                 hideMode        : 'nosize'
                }).init(this);
            }

            this.initMedia();

            //Inline rendering support for this and all subclasses
            this.toString = this.asMarkup;

            this.addEvents(

              /**
                * Fires immediately after the markup has been rendered.
                * @event mediarender
                * @memberOf Ext.ux.Media
                * @param {Object} component This Media Class object instance.
                * @param {Element} mediaObject The Ext.Element object rendered.
               */
                'mediarender',
               /**
                * Fires when the mediaObject has reported a loaded state (IE, Opera Only)
                * @event mediaload
                * @memberOf Ext.ux.Media
                * @param {Object} component This Media Class object instance.
                * @param {Element} mediaObject The Ext.Element object loaded.
                */

                'mediaload');

            if(this.mediaCfg.renderOnResize ){
                this.on('resize', this.resizeMedia, this);
            }


        },
        afterRender  : function(ct){

            //set the mediaMask
            this.setMask(this[this.mediaEl] || ct);

            if(!this.mediaCfg.renderOnResize ){
                this.renderMedia(this.mediaCfg,this[this.mediaEl] || ct);
            }

        },
        onDestroy  :  function(){

            this.clearMedia();
            Ext.destroy(this.mediaMask,this.loadMask);
            this.lastCt = this.mediaObject = this.renderTo = this.applyTo = this.mediaMask = this.loadMask = null;


        }
    };

    /**
     * @class Ext.ux.Media.Component
     * @extends Ext.BoxComponent
     * @version 2.1
     * @author Doug Hendricks. doug[always-At]theactivegroup.com
     * @copyright 2007-2008, Active Group, Inc.  All rights reserved.
     * @donate <a target="tag_donate" href="http://donate.theactivegroup.com"><img border="0" src="http://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" border="0" alt="Make a donation to support ongoing development"></a>
     * @license <a href="http://www.gnu.org/licenses/gpl.html">GPL 3.0</a>
     * @base Ext.ux.Media
     * @constructor
     * @param {Object} config The config object
     */

    Ext.ux.Media.Component= Ext.extend ( Ext.BoxComponent, {


        ctype         : "Ext.ux.Media.Component",

        /**
        * @cfg {String} mediaEl The name of the containing element for the media.
        * @default 'el'
        */
        mediaEl         : 'el',

        autoEl  : {tag:'div',style : { overflow: 'hidden', display:'block',position: 'relative'}},

        cls     : "x-media-comp",


        mediaClass    : Ext.ux.Media,

        constructor   : function(){

         //Inherit the ux.Media class
          Ext.apply(this , this.mediaClass.prototype );
          ux.Component.superclass.constructor.apply(this, arguments);

        },


        /** @private */
        initComponent   : function(){

            ux.Component.superclass.initComponent.apply(this,arguments);
            componentAdapter.init.apply(this,arguments);
        },


        /** @private */
        afterRender  : function(ct){
            ux.Component.superclass.afterRender.apply(this,arguments);
            componentAdapter.afterRender.apply(this,arguments);
         },

         /** @private */
        beforeDestroy   : function(){

            ux.Component.superclass.beforeDestroy.apply(this,arguments);
            componentAdapter.onDestroy.apply(this,arguments);
         },

        doAutoLoad : Ext.emptyFn,


         /** @private */
        setAutoScroll   : function(){
            if(this.rendered && this.autoScroll){
                this.getEl().setOverflow('auto');
            }
        }

    });


    Ext.reg('uxmedia', Ext.ux.Media.Component);
    Ext.reg('media', Ext.ux.Media.Component);

    /**
     * @class Ext.ux.Media.Panel
     * @extends Ext.Panel
     * @version 2.1
     * @author Doug Hendricks. doug[always-At]theactivegroup.com
     * @copyright 2007-2008, Active Group, Inc.  All rights reserved.
     * @donate <a target="tag_donate" href="http://donate.theactivegroup.com"><img border="0" src="http://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" border="0" alt="Make a donation to support ongoing development"></a>
     * @license <a href="http://www.gnu.org/licenses/gpl.html">GPL 3.0</a>
     * @constructor
     * @base Ext.ux.Media
     * @param {Object} config The config object
     */

    Ext.ux.Media.Panel = Ext.extend( Ext.Panel,  {

         cls           : "x-media-panel",

         ctype         : "Ext.ux.Media.Panel",

          /**
           * @cfg {String} mediaEl The name of the containing element for the media.
           * @default 'body'
           */
         mediaEl       : 'body',

         mediaClass    : Ext.ux.Media,

         constructor   : function(){

         //Inherit the ux.Media class
          Ext.apply(this , this.mediaClass.prototype );

          ux.Panel.superclass.constructor.apply(this, arguments);

        },


        /** @private */
        initComponent   : function(){

            ux.Panel.superclass.initComponent.apply(this,arguments);
            componentAdapter.init.apply(this,arguments);
        },


        /** @private */
        afterRender  : function(ct){
            ux.Panel.superclass.afterRender.apply(this,arguments);
            componentAdapter.afterRender.apply(this,arguments);
         },

         /** @private */
        beforeDestroy   : function(){

            ux.Panel.superclass.beforeDestroy.apply(this,arguments);
            componentAdapter.onDestroy.apply(this,arguments);
         },

        doAutoLoad : Ext.emptyFn

    });


    Ext.reg('mediapanel', Ext.ux.Media.Panel);
    /**
     * @class Ext.ux.Media.Portlet
     * @extends Ext.ux.Media.Panel
     * @version 2.1
     * @author Doug Hendricks. doug[always-At]theactivegroup.com
     * @donate <a target="tag_donate" href="http://donate.theactivegroup.com"><img border="0" src="http://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" border="0" alt="Make a donation to support ongoing development"></a>
     * @copyright 2007-2008, Active Group, Inc.  All rights reserved.
     * @license <a href="http://www.gnu.org/licenses/gpl.html">GPL 3.0</a>
     * @constructor
     * @param {Object} config The config object
     */

    Ext.ux.Media.Portlet = Ext.extend ( Ext.ux.Media.Panel , {
       anchor       : '100%',
       frame        : true,
       collapseEl   : 'bwrap',
       collapsible  : true,
       draggable    : true,
       ctype        : "Ext.ux.Media.Portlet",
       cls          : 'x-portlet x-media-portlet'

    });

    Ext.reg('mediaportlet', Ext.ux.Media.Portlet);

   /**
     * @class Ext.ux.Media.Window
     * @extends Ext.Window
     * @version 1.0
     * @author Doug Hendricks. doug[always-At]theactivegroup.com
     * @copyright 2007-2008, Active Group, Inc.  All rights reserved.
     * @donate <a target="tag_donate" href="http://donate.theactivegroup.com"><img border="0" src="http://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" border="0" alt="Make a donation to support ongoing development"></a>
     * @license <a href="http://www.gnu.org/licenses/gpl.html">GPL 3.0</a>
     * @constructor
     * @base Ext.ux.Media
     * @param {Object} config The config object
     */

    Ext.ux.Media.Window = Ext.extend( Ext.Window ,{

        /** @private */
        constructor   : function(config){

          Ext.apply(this , this.mediaClass.prototype );

          ux.Window.superclass.constructor.apply(this, arguments);

        },

         cls           : "x-media-window",

         ctype         : "Ext.ux.Media.Window",

         mediaClass    : Ext.ux.Media,

          /**
           * @cfg {String} mediaEl The name of the containing element for the media.
           * @default 'body'
           */
         mediaEl       : 'body',


        /** @private */
        initComponent   : function(){
            ux.Window.superclass.initComponent.apply(this,arguments);
            componentAdapter.init.apply(this,arguments);
        },

        /** @private */
        afterRender  : function(){
            ux.Window.superclass.afterRender.apply(this,arguments);  //wait for sizing
            componentAdapter.afterRender.apply(this,arguments);
         },
         /** @private */
        beforeDestroy   : function(){

            componentAdapter.onDestroy.apply(this,arguments);
            ux.Window.superclass.beforeDestroy.apply(this,arguments);

         },

        doAutoLoad : Ext.emptyFn

    });

    Ext.reg('mediawindow', ux.Window);



    Ext.onReady(function(){
        //Generate CSS Rules if not defined in markup
        var CSS = Ext.util.CSS, rules=[];

        CSS.getRule('.x-media', true) || (rules.push('.x-media{width:100%;height:100%;outline:none;overflow:hidden;}'));
        CSS.getRule('.x-media-mask') || (rules.push('.x-media-mask{width:100%;height:100%;position:relative;zoom:1;}'));

        //default Rule for IMG:  h/w: auto;
        CSS.getRule('.x-media-img') || (rules.push('.x-media-img{background-color:transparent;width:auto;height:auto;position:relative;}'));

        if(!!rules.length){
             CSS.createStyleSheet(rules.join(''));
             CSS.refreshCache();
        }

    });



    Ext.override(Ext.Element, {

         /**
          * Puts a mask over the element to disable user interaction. Requires core.css.
          * @param {String} msg (optional) A message to display in the mask
          * @param {String} msgCls (optional) A css class to apply to the msg element
          * @return {Element} The mask element
          */
         mask : function(msg, msgCls){

             if(this._maskMsg){
                 this._maskMsg.remove();
             }
             if(this._mask){
                 this._mask.remove();
             }

              if(this.getStyle("position") == "static"){
                  this._preMaskPosition = 'static';
                  this.setStyle("position", "relative");
              }

             this._mask = Ext.DomHelper.append(this.dom, {cls:"ext-el-mask"}, true);

             if(!this.select('iframe,frame,object,embed').elements.length){
                 this.addClass("x-masked");  //causes element re-init after reflow (overflow:hidden)
             }
             this._mask.setDisplayed(true);
             if(typeof msg == 'string'){
                 this._maskMsg = Ext.DomHelper.append(this.dom, {cls:"ext-el-mask-msg", cn:{tag:'div'}}, true);
                 var mm = this._maskMsg;
                 mm.dom.className = msgCls ? "ext-el-mask-msg " + msgCls : "ext-el-mask-msg";
                 mm.dom.firstChild.innerHTML = msg;
                 mm.setDisplayed(true);
                 mm.center(this);
             }
             if(Ext.isIE && !(Ext.isIE7 && Ext.isStrict) && this.getStyle('height') == 'auto'){ // ie will not expand full height automatically
                 //this._mask.setSize(this.dom.clientWidth, this.getHeight());
                 //see: http://www.extjs.com/forum/showthread.php?p=252925#post252925
                 this._mask.setHeight(this.getHeight());
             }
             return this._mask;
         },

         /**
          * Removes a previously applied mask.
          */
         unmask : function(){

             if(this._mask){
                 if(this._preMaskPosition) {
                     this.setStyle("position", this._preMaskPosition);
                 }

                 if(this._maskMsg){
                     this._maskMsg.remove();
                     delete this._maskMsg;
                 }

                 this._mask.remove();
                 delete this._mask;
             }
             this.removeClass("x-masked");

         },

        /**
          * Removes this element from the DOM and deletes it from the cache
          * @param {Boolean} cleanse (optional) Perform a cleanse of immediate childNodes as well.
          * @param {Boolean} deep (optional) Perform a deep cleanse of all nested childNodes as well.
          */

        remove : function(cleanse, deep){
              if(this.dom){
                this.removeAllListeners();    //remove any Ext-defined DOM listeners
                if(cleanse){ this.cleanse(true, deep); }
                Ext.removeNode(this.dom);
                this.maskEl = null;
                this.dom = null;  //clear ANY DOM references
                delete this.dom;

              }
         },

        /**
         * Deep cleansing childNode Removal
         * @param {Boolean} forceReclean (optional) By default the element
         * keeps track if it has been cleansed already so
         * you can call this over and over. However, if you update the element and
         * need to force a reclean, you can pass true.
         * @param {Boolean} deep (optional) Perform a deep cleanse of all childNodes as well.
         */
        cleanse : function(forceReclean, deep){
            if(this.isCleansed && forceReclean !== true){
                return this;
            }

            var d = this.dom, n = d.firstChild, nx;
             while(d && n){
                 nx = n.nextSibling;
                 if(deep){
                         Ext.fly(n, '_cleanser').cleanse(forceReclean, deep);
                         }
                 Ext.removeNode(n);
                 n = nx;
             }
             this.isCleansed = true;
             return this;
         }
    });

    /**
     * @class Ext.ux.Media.Element
     * @extends Ext.Element
     * @version 2.1
     * @author Doug Hendricks. doug[always-At]theactivegroup.com
     * @copyright 2007-2008, Active Group, Inc.  All rights reserved.
     * @donate <a target="tag_donate" href="http://donate.theactivegroup.com"><img border="0" src="http://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" border="0" alt="Make a donation to support ongoing development"></a>
     * @license <a href="http://www.gnu.org/licenses/gpl.html">GPL 3.0</a>
     * @constructor
     */
    Ext.ux.Media.Element = Ext.extend ( Ext.Element , {

        visibilityMode  : 'x-hide-nosize',
        /**
        * @private
        */
        constructor   : function( element ) {

            if(!element ){ return null; }

            var dom = typeof element == "string" ? d.getElementById(element) : element.dom || element ;

            if(!dom ){ return null; }

            /**
             * The DOM element
             * @type HTMLElement
             */
            this.dom = dom;
            /**
             * The DOM element ID
             * @type String
             */
            this.id = dom.id || Ext.id(dom);

            Ext.Element.cache[this.id] = this;

        },

        /**
         * <object|frame|img> are not maskable by the default Element mask implementation.
         * This selects the immediate parent element as the mask target.

         * Puts a mask over the element to disable user interaction. Requires core.css.
         * @param {String} msg (optional) A message to display in the mask
         * @param {String} msgCls (optional) A css class to apply to the msg element
         * @return {Element} The mask element
         */
        mask : function(msg, msgCls){

            this.maskEl || (this.maskEl = this.parent('.x-media-mask') || this.parent());

            return this.maskEl.mask.apply(this.maskEl, arguments);

        },
        unmask : function(){

            if(this.maskEl){
                this.maskEl.unmask();
                this.maskEl = null;
            }
        }


    });

    Ext.ux.Media.prototype.elementClass  =  Ext.ux.Media.Element;

    /**
     * @class Ext.ux.IntelliMask
     * @version 1.0.1
     * @author Doug Hendricks. doug[always-At]theactivegroup.com
     * @copyright 2007-2008, Active Group, Inc.  All rights reserved.
     * @donate <a target="tag_donate" href="http://donate.theactivegroup.com"><img border="0" src="http://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" border="0" alt="Make a donation to support ongoing development"></a>
     * @constructor
     * Create a new LoadMask
     * @desc A custom utility class for generically masking elements while loading media.
     */
    Ext.ux.IntelliMask = function(el, config){

        Ext.apply(this, config);
        this.el = Ext.get(el);
        this.removeMask = Ext.value(config.removeMask, true);

    };

    Ext.ux.IntelliMask.prototype = {

        /**
         * @cfg {Boolean} removeMask
         * True to create a single-use mask that is automatically destroyed after loading (useful for page loads),
         * False to persist the mask element reference for multiple uses (e.g., for paged data widgets).  Defaults to false.
         */

         removeMask  : true,

        /**
         * @cfg {String} msg The default text to display in a centered loading message box
         * @default 'Loading Media...'
         */
        msg : 'Loading Media...',
        /**
         * @cfg {String} msgCls
         * The CSS class to apply to the loading message element.
         * @default "x-mask-loading"
         */
        msgCls : 'x-mask-loading',


        /** @cfg {Number} zIndex The optional zIndex applied to the masking Elements
         */
        zIndex : null,

        /**
         * Read-only. True if the mask is currently disabled so that it will not be displayed (defaults to false)
         * @property {Boolean} disabled
         * @type Boolean
         */
        disabled: false,

        /**
         * Read-only. True if the mask is currently applied to the element.
         * @property {Boolean} active
         * @type Boolean
         */
        active: false,

        /**
         * @cfg {Boolean/Integer} autoHide  True or millisecond value hides the mask if the {link #hide} method is not called within the specified time limit.
         */
        autoHide: false,

        /**
         * Disables the mask to prevent it from being displayed
         */
        disable : function(){
           this.disabled = true;
        },

        /**
         * Enables the mask so that it can be displayed
         */
        enable : function(){
            this.disabled = false;
        },

        /**
         * Show this Mask over the configured Element.
         * @param {String/ConfigObject} msg The message text do display during the masking operation
         * @param {String} msgCls The CSS rule applied to the message during the masking operation.
         * @param {Function} fn The callback function to be invoked after the mask is displayed.
         * @param {Integer} fnDelay The number of milleseconds to wait before invoking the callback function
         * @return {Ext.Element} the mask container element.
         * @example
           mask.show({autoHide:3000});   //show defaults and hide after 3 seconds.
         * @example
           mask.show('Loading Content', null, loadContentFn); //show msg and execute fn
         * @example
           mask.show({
               msg: 'Loading Content',
               msgCls : 'x-media-loading',
               fn : loadContentFn,
               fnDelay : 100,
               scope : window,
               autoHide : 2000   //remove the mask after two seconds.
           });
         */
        show: function(msg, msgCls, fn, fnDelay ){

            var opt={}, autoHide = this.autoHide;
            fnDelay = parseInt(fnDelay,10) || 20; //ms delay to allow mask to quiesce if fn specified

            if(typeof msg == 'object'){
                opt = msg;
                msg = opt.msg;
                msgCls = opt.msgCls;
                fn = opt.fn;
                autoHide = typeof opt.autoHide != 'undefined' ?  opt.autoHide : autoHide;
                fnDelay = opt.fnDelay || fnDelay ;
            }
            if(!this.active && !this.disabled && this.el){
                var mask = this.el.mask(msg || this.msg, msgCls || this.msgCls);

                this.active = !!this.el._mask;
                if(this.active){
                    if(this.zIndex){
                        this.el._mask.setStyle("z-index", this.zIndex);
                        if(this.el._maskMsg){
                            this.el._maskMsg.setStyle("z-index", this.zIndex+1);
                        }
                    }
                }
            } else {fnDelay = 0;}

            //passed function is called regardless of the mask state.
            if(typeof fn === 'function'){
                fn.defer(fnDelay ,opt.scope || null);
            } else { fnDelay = 0; }

            if(autoHide && (autoHide = parseInt(autoHide , 10)||2000)){
                this.hide.defer(autoHide+(fnDelay ||0),this);
            }

            return this.active? {mask: this.el._mask , maskMsg: this.el._maskMsg} : null;
        },

        /**
         * Hide this Mask.
         * @param {Boolean} remove  True to remove the mask element from the DOM after hide.
         */
        hide: function(remove){
            if(this.el){
                this.el.unmask(remove || this.removeMask);
            }
            this.active = false;
            return this;
        },

        // private
        destroy : function(){this.hide(true); this.el = null; }
     };



/**
 * @namespace Ext.ux.Media.mediaTypes
 */
Ext.ux.Media.mediaTypes =
     {
        /**
         * @namespace Ext.ux.Media.mediaTypes.PDF
         */

       PDF : Ext.apply({  //Acrobat plugin thru release 8.0 all crash FF3
                tag     : 'object'
               ,cls     : 'x-media x-media-pdf'
               ,type    : "application/pdf"
               ,data    : "@url"
               ,autoSize:true
               ,params  : { src : "@url" }

               },Ext.isIE?{
                   classid :"CLSID:CA8A9780-280D-11CF-A24D-444553540000"
                   }:false),


      /**
       * @namespace Ext.ux.Media.mediaTypes.PDFFRAME
       * @desc Most reliable method for Acrobat on all browsers!!
       */
      PDFFRAME  : {
                  tag      : 'iframe'
                 ,cls      : 'x-media x-media-pdf-frame'
                 ,frameBorder : 0
                 ,style    : { 'z-index' : 2}
                 ,src      : "@url"
                 ,autoSize :true
        },

       /**
         * @namespace Ext.ux.Media.mediaTypes.WMV
         * @desc <pre><code>WMV Interface Notes
           On IE only, to retrieve the object interface (for controlling player via JS)
            use mediaComp.getInterface().object.controls

           For all other browsers use: mediaComp.getInterface().controls
           Related DOM attributes for WMV:
                 DataFormatAs :
                 Name :
                 URL :
                 OpenState:6
                 PlayState:0
                 Controls :
                 Settings :
                 CurrentMedia:null
                 MediaCollection :
                 PlaylistCollection :
                 VersionInfo:9.0.0.3008
                 Network :
                 CurrentPlaylist :
                 CdromCollection :
                 ClosedCaption :
                 IsOnline:false
                 Error :
                 Status :
                 Dvd :
                 Enabled:true
                 FullScreen:false
                 EnableContextMenu:true
                 UiMode:full
                 StretchToFit:false
                 WindowlessVideo:false
                 IsRemote:false</code></pre>
        */


      WMV : Ext.apply(
              {tag      :'object'
              ,cls      : 'x-media x-media-wmv'
              ,type     : 'application/x-mplayer2'
              ,data     : "@url"
              ,autoSize : false
              ,params  : {

                  filename     : "@url"
                 ,displaysize  : 0
                 ,autostart    : "@start"
                 ,showControls : "@controls"
                 ,showStatusBar: "@status"
                 ,showaudiocontrols : true
                 ,stretchToFit  : true
                 ,Volume        :"@volume"
                 ,PlayCount     : 1

               }
               },Ext.isIE?{
                   classid :"CLSID:22d6f312-b0f6-11d0-94ab-0080c74c7e95" //default for WMP installed w/Windows
                   ,codebase:"http" + ((Ext.isSecure) ? 's' : '') + "http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=5,1,52,701"
                   ,type:'application/x-oleobject'
                   }:
                   {src:"@url"}),

     /**
       * @namespace Ext.ux.Media.mediaTypes.SWF
       */


       SWF   :  Ext.apply({
                  tag      :'object'
                 ,cls      : 'x-media x-media-swf'
                 ,type     : 'application/x-shockwave-flash'
                 ,scripting: 'sameDomain'
                 ,standby  : 'Loading..'
                 ,loop     :  true
                 ,start    :  false
                 ,unsupportedText : {cn:['The Adobe Flash Player is required.',{tag:'br'},{tag:'a',cn:[{tag:'img',src:'http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif'}],href:'http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash',target:'_flash'}]}
                 ,params   : {
                      movie     : "@url"
                     ,menu      : "@controls"
                     ,play      : "@start"
                     ,quality   : "high"
                     ,allowscriptaccess : "@scripting"
                     ,allownetworking : 'all'
                     ,allowfullScreen : false
                     ,bgcolor   : "#FFFFFF"
                     ,wmode     : "opaque"
                     ,loop      : "@loop"
                    }

                },Ext.isIE?
                    {classid :"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
                     codebase:"http" + ((Ext.isSecure) ? 's' : '') + "://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0"
                    }:
                    {data     : "@url"}),
      /**
       * @namespace Ext.ux.Media.mediaTypes.JWP
       * @see http://code.jeroenwijering.com/trac/wiki/FlashAPI
       */

        JWP :  Ext.apply({
              tag      :'object'
             ,cls      : 'x-media x-media-swf x-media-flv'
             ,type     : 'application/x-shockwave-flash'
             ,data     : "@url"
             ,loop     :  false
             ,start    :  false
             //ExternalInterface bindings
             ,boundExternals : ['sendEvent' , 'addModelListener', 'addControllerListener', 'addViewListener', 'getConfig', 'getPlaylist']
             ,params   : {
                 movie     : "@url"
                ,flashVars : {
                               autostart:'@start'
                              ,repeat   :'@loop'
                              ,height   :'@height'
                              ,width    :'@width'
                              ,id       :'@id'
                              }
                }

        },Ext.isIE?{
             classid :"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
            ,codebase:"http" + ((Ext.isSecure) ? 's' : '') + "://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0"
            }:false),


        /**
         * @namespace Ext.ux.Media.mediaTypes.QT
         * @desc QT references: http://developer.apple.com/documentation/quicktime/Conceptual/QTScripting_JavaScript/aQTScripting_Javascro_AIntro/chapter_1_section_1.html
         */
        QT : Ext.apply({
                       tag      : 'object'
                      ,cls      : 'x-media x-media-quicktime'
                      ,type     : "video/quicktime"
                      ,style    : {position:'relative',"z-index":1 ,behavior:'url(#qt_event_source)'}
                      ,scale    : 'aspect'  // ( .5, 1, 2 , ToFit, Aspect )
                      ,unsupportedText : '<a href="http://www.apple.com/quicktime/download/">Get QuickTime</a>'
                      ,scripting : true
                      ,volume   : '50%'
                      ,data     : '@url'
                      ,params   : {
                           src          : Ext.isIE?'@url': null
                          ,href        : "http://quicktime.com"
                          ,target      : "_blank"
                          ,autoplay     : "@start"
                          ,targetcache  : true
                          ,cache        : true
                          ,wmode        : 'transparent'
                          ,controller   : "@controls"
                      ,enablejavascript : "@scripting"
                          ,loop         : '@loop'
                          ,scale        : '@scale'
                          ,volume       : '@volume'
                          ,QTSRC        : '@url'

                       }

                     },Ext.isIE?
                          { classid      :'clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B'
                           ,codebase     :"http" + ((Ext.isSecure) ? 's' : '') + '://www.apple.com/qtactivex/qtplugin.cab#version=7,2,1,0'

                       }:
                       {
                         PLUGINSPAGE  : "http://www.apple.com/quicktime/download/"

                    }),

        /**
         * @namespace Ext.ux.Media.mediaTypes.QTEVENTS
         * @desc For QuickTime DOM event support include this <object> tag structure in the <head> section
         */


        QTEVENTS : {
                   tag      : 'object'
                  ,id       : 'qt_event_source'
                  ,cls      : 'x-media x-media-qtevents'
                  ,type     : "video/quicktime"
                  ,params   : {}
                  ,classid      :'clsid:CB927D12-4FF7-4a9e-A169-56E4B8A75598'
                  ,codebase     :"http" + ((Ext.isSecure) ? 's' : '') + '://www.apple.com/qtactivex/qtplugin.cab#version=7,2,1,0'
                 },

        /**
         * @namespace Ext.ux.Media.mediaTypes.WPMP3
         * @desc WordPress Audio Player : http://wpaudioplayer.com/
         */

        WPMP3 : Ext.apply({
                       tag      : 'object'
                      ,cls      : 'x-media x-media-audio x-media-wordpress'
                      ,type     : 'application/x-shockwave-flash'
                      ,data     : '@url'
                      ,start    : true
                      ,loop     : false
                      ,boundExternals : ['open','close','setVolume','load']
                      ,params   : {
                           movie        : "@url"
                          ,width        :'@width'  //required
                          ,flashVars : {
                               autostart    : "@start"
                              ,controller   : "@controls"
                              ,enablejavascript : "@scripting"
                              ,loop         :'@loop'
                              ,scale        :'@scale'
                              ,initialvolume:'@volume'
                              ,width        :'@width'  //required
                              ,encode       : 'no'  //mp3 urls will be encoded
                              ,soundFile    : ''   //required
                          }
                       }
                    },Ext.isIE?{classid :"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"}:false),

        /**
         * @namespace Ext.ux.Media.mediaTypes.REAL
         * @desc Real Player
         */

        REAL : Ext.apply({
                tag     :'object'
               ,cls     : 'x-media x-media-real'
               ,type    : "audio/x-pn-realaudio"
               ,data    : "@url"
               ,controls: 'imagewindow,all'
               ,start   : false
               ,standby : "Loading Real Media Player components..."
               ,params   : {
                          src        : "@url"
                         ,autostart  : "@start"
                         ,center     : false
                         ,maintainaspect : true
                         ,controller : "@controls"
                         ,controls   : "@controls"
                         ,volume     :'@volume'
                         ,loop       : "@loop"
                         ,console    : "_master"
                         ,backgroundcolor : '#000000'
                         }

                },Ext.isIE?{classid :"clsid:CFCDAA03-8BE4-11CF-B84B-0020AFBBCCFA"}:false),

        /**
         * @namespace Ext.ux.Media.mediaTypes.SVG
         * @desc Generic SVG
         */

        SVG : {
                  tag      : 'object'
                 ,cls      : 'x-media x-media-img x-media-svg'
                 ,type     : "image/svg+xml"
                 ,data     : "@url"
                 ,params   : { src : "@url"}

        },

        /**
         * @namespace Ext.ux.Media.mediaTypes.GIF
         * @desc
         */

        GIF : {
                  tag      : 'img'
                 ,cls      : 'x-media x-media-img x-media-gif'
                 ,src     : "@url"
        },
        /**
         * @namespace Ext.ux.Media.mediaTypes.JPEG
         */

        JPEG : {
                  tag      : 'img'
                 ,cls      : 'x-media x-media-img x-media-jpeg'
                 //,style    : {overflow:'hidden', display:'inline'}
                 ,src     : "@url"
        },
        /**
         * @namespace Ext.ux.Media.mediaTypes.JP2
         */

        JP2 :{
                  tag      : 'object'
                 ,cls      : 'x-media x-media-img x-media-jp2'
                 ,type     : "image/jpeg2000-image"
                 ,data     : "@url"
                },
        /**
         * @namespace Ext.ux.Media.mediaTypes.PNG
         */
        PNG : {
                  tag      : 'img'
                 ,cls      : 'x-media x-media-img x-media-png'
                 ,src     : "@url"
        },
        /**
         * @namespace Ext.ux.Media.mediaTypes.HTM
         */

        HTM : {
                  tag      : 'iframe'
                 ,cls      : 'x-media x-media-html'
                 ,frameBorder : 0
                 ,autoSize : true
                 ,style    : {overflow:'auto', 'z-index' : 2}
                 ,src     : "@url"
        },
        /**
         * @namespace Ext.ux.Media.mediaTypes.TXT
         */

        TXT : {
                  tag      : 'object'
                 ,cls      : 'x-media x-media-text'
                 ,type     : "text/plain"
                 ,style    : {overflow:'auto',width:'100%',height:'100%'}
                 ,data     : "@url"
        },

        /**
         * @namespace Ext.ux.Media.mediaTypes.RTF
         */

        RTF : {
                  tag      : 'object'
                 ,cls      : 'x-media x-media-rtf'
                 ,type     : "application/rtf"
                 ,style    : {overflow:'auto',width:'100%',height:'100%'}
                 ,data     : "@url"
        },
        /**
         * @namespace Ext.ux.Media.mediaTypes.JS
         */

        JS : {
                  tag      : 'object'
                 ,cls      : 'x-media x-media-js'
                 ,type     : "text/javascript"
                 ,style    : {overflow:'auto',width:'100%',height:'100%'}
                 ,data     : "@url"
        },
        /**
         * @namespace Ext.ux.Media.mediaTypes.CSS
         */

        CSS : {
                  tag      : 'object'
                 ,cls      : 'x-media x-media-css'
                 ,type     : "text/css"
                 ,style    : {overflow:'auto',width:'100%',height:'100%'}
                 ,data     : "@url"
        },
        /**
         * @namespace Ext.ux.Media.mediaTypes.SILVERLIGHT
         */

        SILVERLIGHT : {
              tag      : 'object'
             ,cls      : 'x-media x-media-silverlight'
             ,type      :"application/ag-plugin"
             ,data     : "@url"
             ,params  : { MinRuntimeVersion: "1.0" , source : "@url" }
        },
        /**
         * @namespace Ext.ux.Media.mediaTypes.SILVERLIGHT2
         */

        SILVERLIGHT2 : {
              tag      : 'object'
             ,cls      : 'x-media x-media-silverlight'
             ,type      :"application/x-silverlight-2-b2"
             ,data     : "data:application/x-silverlight-2-b2,"
             ,params  : { MinRuntimeVersion: "2.0" }
             ,unsupportedText: '<a href="http://go2.microsoft.com/fwlink/?LinkID=114576&v=2.0"><img style="border-width: 0pt;" alt="Get Microsoft Silverlight" src="http://go2.microsoft.com/fwlink/?LinkID=108181"/></a>'
        },
        /**
         * @namespace Ext.ux.Media.mediaTypes.DATAVIEW
         */

        DATAVIEW : {
              tag      : 'object'
             ,cls      : 'x-media x-media-dataview'
             ,classid  : 'CLSID:0ECD9B64-23AA-11D0-B351-00A0C9055D8E'
             ,type     : 'application/x-oleobject'
             ,unsupportedText: 'MS Dataview Control is not installed'

        },
        /**
         * @namespace Ext.ux.Media.mediaTypes.OWCXLS
         */

        "OWCXLS" : Ext.apply({     //experimental IE only
              tag      : 'object'
             ,cls      : 'x-media x-media-xls'
             ,type      :"application/vnd.ms-excel"
             ,controltype: "excel"
             ,params  : { DataType : "CSVURL"
                        ,CSVURL : '@url'
                        ,DisplayTitleBar : true
                        ,AutoFit         : true
                     }
             },Ext.isIE?{
                   codebase: "file:msowc.cab"
                  ,classid :"CLSID:0002E510-0000-0000-C000-000000000046" //owc9
                 //classid :"CLSID:0002E550-0000-0000-C000-000000000046" //owc10
                 //classid :"CLSID:0002E559-0000-0000-C000-000000000046" //owc11

                 }:false),

        /**
         * @namespace Ext.ux.Media.mediaTypes.OWCCHART
         */

        "OWCCHART" : Ext.apply({     //experimental
              tag      : 'object'
             ,cls      : 'x-media x-media-xls'
             ,type      :"application/vnd.ms-excel"
             ,data     : "@url"
             ,params  : { DataType : "CSVURL" }
             },Ext.isIE?{
                    classid :"CLSID:0002E500-0000-0000-C000-000000000046" //owc9
                  //classid :"CLSID:0002E556-0000-0000-C000-000000000046" //owc10
                  //classid :"CLSID:0002E55D-0000-0000-C000-000000000046" //owc11
                 }:false),

        /**
         * @namespace Ext.ux.Media.mediaTypes.OFFICE
         */

        OFFICE : {
              tag      : 'object'
             ,cls      : 'x-media x-media-office'
             ,type      :"application/x-msoffice"
             ,data     : "@url"
        },
        /**
         * @namespace Ext.ux.Media.mediaTypes.POWERPOINT
         */

        POWERPOINT : Ext.apply({     //experimental
                      tag      : 'object'
                     ,cls      : 'x-media x-media-ppt'
                     ,type     :"application/vnd.ms-powerpoint"
                     ,file     : "@url"
                     },Ext.isIE?{classid :"CLSID:EFBD14F0-6BFB-11CF-9177-00805F8813FF"}:false),
        /**
         * @namespace Ext.ux.Media.mediaTypes.XML
         */

        XML : {
              tag      : 'iframe'
             ,cls      : 'x-media x-media-xml'
             ,style    : {overflow:'auto'}
             ,src     : "@url"
        },

        /**
         * @namespace Ext.ux.Media.mediaTypes.VLC
         */

        //VLC ActiveX Player -- Suffers the same fate as the Acrobat ActiveX Plugin
        VLC : Ext.apply({
              tag      : 'object'
             ,cls      : 'x-media x-media-vlc'
             ,type     : "application/x-vlc-plugin"
             ,version  : "VideoLAN.VLCPlugin.2"
             ,pluginspage:"http://www.videolan.org"
             ,events   : true
             ,start    : false
             ,params   : {
                   Src        : "@url"
                  ,MRL        : "@url"
                  ,autoplay  :  "@start"
                  ,ShowDisplay: "@controls"
                  ,Volume     : '@volume'
                  ,Autoloop   : "@loop"

                }

             },Ext.isIE?{
                  classid :"clsid:9BE31822-FDAD-461B-AD51-BE1D1C159921"
                 ,CODEBASE :"http://downloads.videolan.org/pub/videolan/vlc/latest/win32/axvlc.cab"
             }:false),
        /**
         * @namespace Ext.ux.Media.mediaTypes.RDP
         */

         RDP : Ext.apply({
              tag      : 'object'
             ,cls      : 'x-media x-media-rdp'
             ,type     : "application/rds"
             ,unsupportedText: "Remote Desktop Web Connection ActiveX control is required. <a target=\"_msd\" href=\"http://go.microsoft.com/fwlink/?linkid=44333\">Download it here</a>."
             ,params:{
                  Server         : '@url'
                 ,Fullscreen     : false
                 ,StartConnected : false
                 ,DesktopWidth   : '@width'
                 ,DesktopHeight  : '@height'
             }

         },Ext.isIE?{
             classid :"CLSID:9059f30f-4eb1-4bd2-9fdc-36f43a218f4a"
            ,CODEBASE :"msrdp.cab#version=5,2,3790,0"


         }:false)

    };





if (Ext.provide) {
    Ext.provide('uxmedia');
}

Ext.applyIf(Array.prototype, {

    /*
     * Fix for IE/Opera, which does not seem to include the map
     * function on Array's
     */
    map : function(fun, scope) {
        var len = this.length;
        if (typeof fun != "function") {
            throw new TypeError();
        }
        var res = new Array(len);

        for (var i = 0; i < len; i++) {
            if (i in this) {
                res[i] = fun.call(scope || this, this[i], i, this);
            }
        }
        return res;
    }
});



/* Previous Release compatability: */

Ext.ux.MediaComponent = Ext.ux.Media.Component;
Ext.ux.MediaPanel     = Ext.ux.Media.Panel;
Ext.ux.MediaPortlet   = Ext.ux.Media.Portlet;
Ext.ux.MediaWindow    = Ext.ux.Media.Window;

})();;/* global Ext */
/*
 * version  2.1
 * author Doug Hendricks. doug[always-At]theactivegroup.com
 * Copyright 2007-2008, Active Group, Inc.  All rights reserved.
 *
 ************************************************************************************
 *   This file is distributed on an AS IS BASIS WITHOUT ANY WARRANTY;
 *   without even the implied warranty of MERCHANTABILITY or
 *   FITNESS FOR A PARTICULAR PURPOSE.
 ************************************************************************************

 License: ux.Media.Flash classes are licensed under the terms of
 the Open Source GPL 3.0 license (details: http://www.gnu.org/licenses/gpl.html).

 Commercial use is prohibited without a Commercial License. See http://licensing.theactivegroup.com.

 Donations are welcomed: http://donate.theactivegroup.com

 Notes: the <embed> tag is NOT used(or necessary) in this implementation

 Version:
        2.1
           Addresses the Flash visibility/re-initialization issues for all browsers.
           Adds bi-directional fscommand support for all A-Grade browsers.
           Adds ExternalInterface Binding support with optional externalsNamespace support


        Rc1
           Adds inline media rendering within markup: <div><script>document.write(String(new Ext.ux.Media.Flash(mediaCfg)));</script></div>
           New extensible classes :
              ux.Media.Flash
              ux.FlashComponent
              ux.FlashPanel
              ux.FlashWindow

   A custom implementation for advanced Flash object interaction
       Supports:
            version detection,
            version assertion,
            Flash Express Installation (inplace version upgrades),
            and custom Event Sync for interaction with SWF.ActionScript.

    mediaCfg: {Object}
         {
           url       : Url resource to load when rendered
          ,loop      : (true/false)
          ,start     : (true/false)
          ,height    : (defaults 100%)
          ,width     : (defaults 100%)
          ,scripting : (true/false) (@macro enabled)
          ,controls  : optional: show plugins control menu (true/false)
          ,eventSynch: (Bool) If true, this class initializes an internal event Handler for
                       ActionScript event synchronization
          ,listeners  : {"mouseover": function() {}, .... } DOM listeners to set on the media object each time the Media is rendered.
          ,requiredVersion: (String,Array,Number) If specified, used in version detection.
          ,unsupportedText: (String,DomHelper cfg) Text to render if plugin is not installed/available.
          ,installUrl:(string) Url to inline SWFInstaller, if specified activates inline Express Install.
          ,installRedirect : (string) optional post install redirect
          ,installDescriptor: (Object) optional Install descriptor config
         }
    */

(function(){

   var ux = Ext.ux.Media;
    /**
     *
     * @class Ext.ux.Media.Flash
     * @extends Ext.ux.Media
     * @author Doug Hendricks. doug[always-At]theactivegroup.com
     * @donate <a target="tag_donate" href="http://donate.theactivegroup.com"><img border="0" src="http://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" border="0" alt="Make a donation to support ongoing development"></a>
     * @constructor
     * @version 2.1
     * @desc
     * Base Media Class for Flash objects. Used for rendering Flash Objects for use with inline markup.

    */

    Ext.ux.Media.Flash = Ext.extend( Ext.ux.Media, {

        varsName       :'flashVars',

       /**
        *
        * @cfg {String} externalsNamespace  Defines the namespace within the Flash class instance to hold
          references to Flash ExternalInterface methods.  <p>If null, the namespace defaults to class instance (this) itself.
          If specified, the namespace is created when ExternalInterface bindings are created.<p>
          with:   externalsNamespace : 'player', you would reference ExternalInterface methods as:
          @example
             this.player.Play();
        */
        externalsNamespace :  null,

        /** @private */
        mediaType: Ext.apply({
              tag      : 'object'
             ,cls      : 'x-media x-media-swf'
             ,type     : 'application/x-shockwave-flash'
             ,loop     : null
             ,scripting: "sameDomain"
             ,start    : true
             ,unsupportedText : {cn:['The Adobe Flash Player{0}is required.',{tag:'br'},{tag:'a',cn:[{tag:'img',src:'http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif'}],href:'http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash',target:'_flash'}]}
             ,params   : {
                  movie     : "@url"
                 ,play      : "@start"
                 ,loop      : "@loop"
                 ,menu      : "@controls"
                 ,quality   : "high"
                 ,bgcolor   : "#FFFFFF"
                 ,wmode     : "opaque"
                 ,allowscriptaccess : "@scripting"
                 ,allowfullscreen : false
                 ,allownetworking : 'all'
                }
             },Ext.isIE?
                    {classid :"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
                     codebase:"http" + ((Ext.isSecure) ? 's' : '') + "://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0"
                    }:
                    {data     : "@url"}),

        /** @private */
        getMediaType: function(){
             return this.mediaType;
        },

        /** @private
         * Remove the following characters to permit Flash ExternalInterface: +-/\*.
         */
        assertId : function(id, def){
             id || (id = def || Ext.id());
             return id.replace(/\+|-|\\|\/|\*/g,'');
         },

        /** @private
         *  (called once by the constructor)
         */
        initMedia : function(){

            ux.Flash.superclass.initMedia.call(this);

            var mc = Ext.apply({}, this.mediaCfg||{});
            var requiredVersion = (this.requiredVersion = mc.requiredVersion || this.requiredVersion|| false ) ;
            var hasFlash  = !!(this.playerVersion = this.detectFlashVersion());
            var hasRequired = hasFlash && (requiredVersion?this.assertVersion(requiredVersion):true);

            var unsupportedText = this.assert(mc.unsupportedText || this.unsupportedText || (this.getMediaType()||{}).unsupportedText,null);
            if(unsupportedText){
                 unsupportedText = Ext.DomHelper.markup(unsupportedText);
                 unsupportedText = mc.unsupportedText = String.format(unsupportedText,
                     (requiredVersion?' '+requiredVersion+' ':' '),
                     (this.playerVersion?' '+this.playerVersion+' ':' Not installed.'));
            }
            mc.mediaType = "SWF";

            if(!hasRequired ){
                this.autoMask = false;

                //Version check for the Flash Player that has the ability to start Player Product Install (6.0r65)
                var canInstall = hasFlash && this.assertVersion('6.0.65');
                if(canInstall && mc.installUrl){

                       mc =  mc.installDescriptor || {
                           mediaType  : 'SWF'
                            ,tag      : 'object'
                            ,cls      : 'x-media x-media-swf x-media-swfinstaller'
                            ,id       : 'SWFInstaller'
                            ,type     : 'application/x-shockwave-flash'
                            ,data     : "@url"
                            ,url              : this.prepareURL(mc.installUrl)
                            //The dimensions of playerProductInstall.swf must be at least 310 x 138 pixels,
                            ,width            : (/%$/.test(mc.width)) ? mc.width : ((parseInt(mc.width,10) || 0) < 310 ? 310 :mc.width)
                            ,height           : (/%$/.test(mc.height))? mc.height :((parseInt(mc.height,10) || 0) < 138 ? 138 :mc.height)
                            ,loop             : false
                            ,start            : true
                            ,unsupportedText  : unsupportedText
                            ,params:{
                                      quality          : "high"
                                     ,movie            : '@url'
                                     ,allowscriptacess : "always"
                                     ,wmode            : "opaque"
                                     ,align            : "middle"
                                     ,bgcolor          : "#3A6EA5"
                                     ,pluginspage      : mc.pluginsPage || this.pluginsPage || "http://www.adobe.com/go/getflashplayer"
                                   }
                        };
                        mc.params[this.varsName] = "MMredirectURL="+( mc.installRedirect || window.location)+
                                            "&MMplayerType="+(Ext.isIE?"ActiveX":"Plugin")+
                                            "&MMdoctitle="+(document.title = document.title.slice(0, 47) + " - Flash Player Installation");
                } else {
                    //Let superclass handle with unsupportedText property
                    mc.mediaType=null;
                }
            }

            /**
            *  Sets up a eventSynch between the ActionScript environment
            *  and converts it's events into native Ext events.
            *  When this config option is true, binds an ExternalInterface definition
            *  to the ux.Media.Flash class method Ext.ux.Media.Flash.eventSynch.
            *
            *  The default binding definition pass the following flashVars to the Flash object:
            *
            *  allowedDomain,
            *  elementID (the ID assigned to the DOM <object> )
            *  eventHandler (the globally accessible function name of the handler )
            *     the default implementation expects a call signature in the form:
            *
            *    ExternalInterface.call( 'eventHandler', elementID, eventString )

            *  For additional flexibility, your own eventSynch may be defined to match an existing
            *  ActionScript ExternalInterface definition.
            */

            if(mc.eventSynch){
                mc.params || (mc.params = {});
                var vars = mc.params[this.varsName] || (mc.params[this.varsName] = {});
                if(typeof vars === 'string'){ vars = Ext.urlDecode(vars,true); }
                var eventVars = (mc.eventSynch === true ? {
                         allowedDomain  : vars.allowedDomain || document.location.hostname
                        ,elementID      : mc.id || (mc.id = Ext.id())
                        ,eventHandler   : 'Ext.ux.Media.Flash.eventSynch'
                        }: mc.eventSynch );

                Ext.apply(mc.params,{
                     allowscriptaccess  : 'always'
                })[this.varsName] = Ext.applyIf(vars,eventVars);
            }

            this.bindExternals(mc.boundExternals);

            delete mc.requiredVersion;
            delete mc.installUrl;
            delete mc.installRedirect;
            delete mc.installDescriptor;
            delete mc.eventSynch;
            delete mc.boundExternals;

            this.mediaCfg = mc;


        },


        /**
        * Asserts the desired version against the installed Flash Object version.
        * @param {mixed} versionMap Acceptable parameter formats for versionMap:
        *
        *  '9.0.40' (string)<br>
        *   9  or 9.1  (number)<br>
        *   [9,0,43]  (array)
        *
        * @return {Boolean} true if the desired version is => installed version
        *  and false for all other conditions
        */
        assertVersion : function(versionMap){

            var compare;
            versionMap || (versionMap = []);

            if(Ext.isArray(versionMap)){
                compare = versionMap;
            } else {
                compare = String(versionMap).split('.');
            }
            compare = (compare.concat([0,0,0,0])).slice(0,3); //normalize

            var tpv;
            if(!(tpv = this.playerVersion || (this.playerVersion = this.detectFlashVersion()) )){ return false; }

            if (tpv.major > parseFloat(compare[0])) {
                        return true;
            } else if (tpv.major == parseFloat(compare[0])) {
                   if (tpv.minor > parseFloat(compare[1]))
                            {return true;}
                   else if (tpv.minor == parseFloat(compare[1])) {
                        if (tpv.rev >= parseFloat(compare[2])) { return true;}
                        }
                   }
            return false;
        },

       /**
        * Flash version detection function
        * @returns {Object} {major,minor,rev} version object or
        * false if Flash is not installed or detection failed.
        */
        detectFlashVersion : function(){
            if(ux.Flash.prototype.flashVersion ){
                return this.playerVersion = ux.Flash.prototype.flashVersion;
            }
            var version=false;
            var formatVersion = function(version){
              return version && !!version.length?
                {major:version[0] !== null? parseInt(version[0],10): 0
                ,minor:version[1] !== null? parseInt(version[1],10): 0
                ,rev  :version[2] !== null? parseInt(version[2],10): 0
                ,toString : function(){return this.major+'.'+this.minor+'.'+this.rev;}
                }:false;
            };
            var sfo= null;
            if(Ext.isIE){

                try{
                    sfo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
                }catch(e){
                    try {
                        sfo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
                        version = [6,0,21];
                        // error if player version < 6.0.47 (thanks to Michael Williams @ Adobe for this solution)
                        sfo.allowscriptaccess = "always";
                    } catch(ex) {
                        if(version && version[0] === 6)
                            {return formatVersion(version); }
                        }
                    try {
                        sfo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
                    } catch(ex1) {}
                }
                if (sfo) {
                    version = sfo.GetVariable("$version").split(" ")[1].split(",");
                }
             }else if(navigator.plugins && navigator.mimeTypes.length){
                sfo = navigator.plugins["Shockwave Flash"];
                if(sfo && sfo.description) {
                    version = sfo.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s+r|\s+b[0-9]+)/, ".").split(".");
                }
            }
            return (this.playerVersion = ux.Flash.prototype.flashVersion = formatVersion(version));

        }

        /** @private */
        ,onAfterMedia : function(ct){

              ux.Flash.superclass.onAfterMedia.apply(this,arguments);
              var mo;
              if(mo = this.mediaObject){

                  var id = mo.id;
                  if(Ext.isIE ){

                    //fscommand bindings
                    //implement a fsCommand event interface since its not supported on IE when writing innerHTML

                    if(!(Ext.query('script[for='+id+']').length)){
                      writeScript('var c;if(c=Ext.getCmp("'+this.id+'")){c.onfsCommand.apply(c,arguments);}',
                                  {event:"FSCommand", htmlFor:id});
                    }
                  }else{
                      window[id+'_DoFSCommand'] || (window[id+'_DoFSCommand']= this.onfsCommand.createDelegate(this));
                  }
              }
         },

        /** Remove (safely) an existing mediaObject from the Component.
         *
         */
        clearMedia  : function(){

           //de-register fscommand hooks
           if(this.mediaObject){
               var id = this.mediaObject.id;
               if(Ext.isIE){
                    Ext.select('script[for='+id+']',true).remove();
               } else {
                    window[id+'_DoFSCommand']= null;
                    delete window[id+'_DoFSCommand'];
               }

           }

           ux.Flash.superclass.clearMedia.call(this);

        },

        /**
         * Returns a reference to the embedded Flash object
         * @return {HTMLElement}
         */
        getSWFObject : function() {
            return this.getInterface();
        },


        /**
         * @private
         * fscommand handler
         * ref: http://www.northcode.com/blog.php/2007/09/11/FSCommand-and-getURL-Bug-in-Flash-Player-9
         */

        onfsCommand : function( command, args){

            if(this.events){
                this.fireEvent('fscommand', this, command ,args );
            }

        },

        /**
         * Use Flash's SetVariable method if available
         * @param {String} varName The named variable to set.
         * @param {Mixed} value The value to set.
         * @return {Boolean} Returns True if the operation was successful.
         *
         */

        setVariable : function(varName, value){
            var fo = this.getInterface();
            if(fo && typeof fo.SetVariable != 'undefined'){
                fo.SetVariable(varName,value);
                return true;
            }
            fo = null;
            return false;

        },

       /** Use Flash's GetVariable method if available
        * @param {string} varName The named variable to retrieve.
        * @return {Mixed} returns 'undefined' if the function is not supported.
        */
        getVariable : function(varName ){
            var fo = this.getInterface();
            if(fo && typeof fo.GetVariable != 'undefined'){
                return fo.GetVariable(varName );
            }
            fo = null;
            return undefined;

        },

        /** Helper method used to bind Flash ExternalInterface methods to a property on the ux.Flash Component level.<p>
         * Note: ExternalInterface bindings are maintained on the{@link #Ext.ux.Media.Flash-externalsNamespace} property, not the DOM Element itself.
         * <p>This prevent potential corruption during Flash refreshes which may occur during DOM reflow or when the Flash object is not visible.
         * @param {String|Array} methods A single method name or Array of method names to bind.
         * @example flashObj.bindExternals(['Play', 'Stop', 'Rewind']);
         * flashMediaObj.Play();
         */
        bindExternals : function(methods){

            if(methods && this.playerVersion.major >= 8){
                methods = new Array().concat(methods);
            }else{
                return;
            }

            var nameSpace = (typeof this.externalsNamespace == 'string' ?
                  this[this.externalsNamespace] || (this[this.externalsNamespace] = {} )
                     : this );

            Ext.each(methods,function(method){
                //Do not overwrite existing function with the same name.
               nameSpace[method] || (nameSpace[method] = function(){
                      return this.invoke.apply(this,[method].concat(Array.prototype.slice.call(arguments,0)));
               }.createDelegate(this));

            },this);
        },

        /** Invoke a Flash ExternalInterface method
         * @param {String} method Method Name to invoke
         * @param {Mixed} arguments (Optional)  (1-n) method arguments.
         * @return {Mixed} Result (if provided) or, 'undefined' if the method
         * is not defined by the External Interface
         */
        invoke   : function(method /* , optional arguments, .... */ ){

            var obj,r;
            var c = [
                    '<invoke name="'+method+'" returntype="javascript">',
                    '<arguments>',
                    (Array.prototype.slice.call(arguments,1)).map(this._toXML).join(''),
                    '</arguments>',
                    '</invoke>'].join('');

            if(method && (obj = this.getInterface()) && typeof obj.CallFunction !== 'undefined' ){
                r=Ext.decode(obj.CallFunction(c));
            }
            return r;

        },

        /**
         * this function is designed to be used when a Flashplayer player object notifies the browser
         * if its initialization state
         */
        onFlashInit  :  function(){

            if(this.mediaMask && this.autoMask){this.mediaMask.hide();}
            this.fireEvent.defer(300,this,['flashinit',this, this.getInterface()]);


        },

        /**  Flash Specific Method to synthesize a mediaload event
         * @private
         */
        pollReadyState : function(cb, readyRE){
            var media;

            if(media= this.getInterface()){
                if(typeof media.PercentLoaded != 'undefined'){
                   var perc = media.PercentLoaded() ;

                   this.fireEvent( 'progress' ,this , this.getInterface(), perc) ;
                   if( perc = 100 ) { cb(); return; }
                }

                this._countPoll++ > this._maxPoll || arguments.callee.defer(10,this,arguments);

            }

         },

        /**
         * @private
         * Dispatches events received from the SWF object (when defined by the eventSynch mediaConfig option).
         *
         * @method _handleSWFEvent
         * @private
         */
        _handleSWFEvent: function(event)
        {
            var type = event.type||event||false;
            if(type){
                 if(this.events && !this.events[String(type)])
                     { this.addEvents(String(type));}

                 return this.fireEvent.apply(this, [String(type), this].concat(Array.prototype.slice.call(arguments,0)));
            }
        },


       _toXML    : function(value){

           var format = Ext.util.Format;
           var type = typeof value;
           if (type == "string") {
               return "<string>" + format.xmlEncode(value) + "</string>";}
           else if (type == "undefined")
              {return "<undefined/>";}
           else if (type == "number")
              {return "<number>" + value + "</number>";}
           else if (value == null)
              {return "<null/>";}
           else if (type == "boolean")
              {return value ? "<true/>" : "<false/>";}
           else if (value instanceof Date)
              {return "<date>" + value.getTime() + "</date>";}
           else if (Ext.isArray(value))
              {return this._arrayToXML(value);}
           else if (type == "object")
              {return this._objectToXML(value);}
           else {return "<null/>";}
         },

        _arrayToXML  : function(arrObj){

            var s = "<array>";
            for (var i = 0; i < arrObj.length; i++) {
                s += "<property id=\"" + i + "\">" + this._toXML(arrObj[i]) + "</property>";
            }
            return s + "</array>";
        },

        _objectToXML  : function(obj){

            var s = "<object>";
            for (var prop in obj) {
                if(obj.hasOwnProperty(prop)){
                   s += "<property id=\"" + prop + "\">" + this._toXML(obj[prop]) + "</property>";
                }
              }
            return s + "</object>";

        }

    });

    /**
     Class Method to handle defined Flash interface events
     @memberOf Ext.ux.Media.Flash
    */
    Ext.ux.Media.Flash.eventSynch = function(elementID, event /* additional arguments optional */ ){
            var SWF = Ext.get(elementID), inst;
            if(SWF && (inst = SWF.ownerCt)){
                return inst._handleSWFEvent.apply(inst, Array.prototype.slice.call(arguments,1));
            }
        };


    var componentAdapter = {
       init         : function(){

          //Must do this or Flash ExternalInterface methods are disabled!
          this.hideMode    = 'nosize';

          this.visibilityCls = 'x-hide-nosize';

          this.getId = function(){
              return this.id || (this.id = "flash-comp" + (++Ext.Component.AUTO_ID));
          };

          this.addEvents(


             /**
              * Fires when the Flash Object reports an initialized state via a public callback function.
              * @event flashinit
              * @memberOf Ext.ux.Media.Flash
              * @param {Ext.ux.Media.Flash} this Ext.ux.Media.Flash instance
              * @param {Element} SWFObject The Flash object DOM Element.
              *
              * this callback must implemented to be useful in raising this event.
              * @example
              * //YouTube Global ready handler
                var onYouTubePlayerReady = function(playerId) {

                    //Search for a ux.Flash-managed player.
                    var flashComp, el = Ext.get(playerId);
                    if(flashComp = (el?el.ownerCt:null)){
                       flashComp.onFlashInit();
                    }

                };
              */
              'flashinit',

             /**
              * Fires when the Flash Object issues an fscommand to the ux.Flash Component
              * @event fscommand
              * @memberOf Ext.ux.Media.Flash
              * @param {Ext.ux.Media.Flash} this Ext.ux.Media.Flash instance
              * @param {string} command The command string
              * @param {string} args The arguments string
              */
              'fscommand',

             /**
              * Fires indicating the load progress of the Flash Movie Object
              * @event progress
              * @memberOf Ext.ux.Media.Flash
              * @param {Ext.ux.Media.Flash} this Ext.ux.Media.Flash instance
              * @param {Element} SWFObject The Flash object DOM Element.
              * @param {Integer} percent The percentage of the Movie loaded.
             */
             'progress' );

        }

  };


     /**
      *
      * @class Ext.ux.Media.Flash.Component
      * @extends Ext.ux.Media.Component
      * @base Ext.ux.Media.Flash
      * @version  2.1
      * @author Doug Hendricks. doug[always-At]theactivegroup.com
      * @copyright 2007-2008, Active Group, Inc.  All rights reserved.
      * @donate <a target="tag_donate" href="http://donate.theactivegroup.com"><img border="0" src="http://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" border="0" alt="Make a donation to support ongoing development"></a>
      * @license <a href="http://www.gnu.org/licenses/gpl.html">GPL 3.0</a>
      * @constructor

      * @param {Object} config The config object
      * @desc
      * Base Media Class for Flash objects
      * Used primarily for rendering Flash Objects for use with inline markup.
    */
   Ext.ux.Media.Flash.Component = Ext.extend(Ext.ux.Media.Component, {
         /**
         * @private
         */
         ctype         : "Ext.ux.Media.Flash.Component",


        /**
         * @private
         */
         cls    : "x-media-flash-comp",

         /**
         * @private
         */
         autoEl  : {tag:'div',style : { overflow: 'auto', display:'block'}},

        /**
         * @private
         * The className of the Media interface to inherit
         */
         mediaClass    : Ext.ux.Media.Flash,

        /** @private */
         initComponent   : function(){

            componentAdapter.init.apply(this,arguments);
            Ext.ux.Media.Flash.Component.superclass.initComponent.apply(this,arguments);

         }



   });

   Ext.reg('uxflash', Ext.ux.Media.Flash.Component);

   ux.Flash.prototype.detectFlashVersion();

   /**
     *
     * @class Ext.ux.Media.Flash.Panel
     * @extends Ext.ux.Media.Panel
     * @version 2.1
     * @author Doug Hendricks. doug[always-At]theactivegroup.com
     * @donate <a target="tag_donate" href="http://donate.theactivegroup.com"><img border="0" src="http://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" border="0" alt="Make a donation to support ongoing development"></a>
     * @copyright 2007-2008, Active Group, Inc.  All rights reserved.
     * @constructor
     * @base Ext.ux.Media.Flash
     * @param {Object} config The config object
     * @desc
     * Base Media Class for Flash objects
     * Used primarily for rendering Flash Objects for use with inline markup.
    */

   Ext.ux.Media.Flash.Panel = Ext.extend(Ext.ux.Media.Panel,{

        ctype         : "Ext.ux.Media.Flash.Panel",

        mediaClass    : Ext.ux.Media.Flash,

        autoScroll    : true,

        /**
         * @cfg {Boolean} shadow Set to false to prevent DOM reflow when shadow is hidden/shown
         * @default false
         */
        shadow        : false,


        /** @private */
        initComponent   : function(){
            componentAdapter.init.apply(this,arguments);
            Ext.ux.Media.Flash.Panel.superclass.initComponent.apply(this,arguments);

       }

   });

   Ext.reg('flashpanel', ux.Flash.Panel);
   Ext.reg('uxflashpanel', ux.Flash.Panel);

   /**
    *
    * @class Ext.ux.Media.Flash.Portlet
    * @extends Ext.ux.Media.Flash.Panel
    * @version  2.1
    * @donate <a target="tag_donate" href="http://donate.theactivegroup.com"><img border="0" src="http://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" border="0" alt="Make a donation to support ongoing development"></a>
    * @author Doug Hendricks. doug[always-At]theactivegroup.com
    * @copyright 2007-2008, Active Group, Inc.  All rights reserved.
    * @desc
    * Base Media Class for Flash objects
    * Used primarily for rendering Flash Objects for use with inline markup.
    */

   Ext.ux.Media.Flash.Portlet = Ext.extend(Ext.ux.Media.Flash.Panel,{
       ctype         : "Ext.ux.Media.Flash.Portlet",
       anchor       : '100%',
       frame        : true,
       collapseEl   : 'bwrap',
       collapsible  : true,
       draggable    : true,
       cls          : 'x-portlet x-flash-portlet'

   });

   Ext.reg('flashportlet', ux.Flash.Portlet);
   Ext.reg('uxflashportlet', ux.Flash.Portlet);

   /**
    *
    * @class Ext.ux.Media.Flash.Window
    * @extends Ext.ux.Media.Window
    * @version  2.1
    * @author Doug Hendricks. doug[always-At]theactivegroup.com
    * @donate <a target="tag_donate" href="http://donate.theactivegroup.com"><img border="0" src="http://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" border="0" alt="Make a donation to support ongoing development"></a>
    * @copyright 2007-2008, Active Group, Inc.  All rights reserved.
    * @constructor
    * @base Ext.ux.Media.Flash
    * @param {Object} config The config object
    * @desc
    * Base Media Class for Flash objects
    * Used primarily for rendering Flash Objects for use with inline markup.
    */

   Ext.ux.Media.Flash.Window  = Ext.extend( Ext.ux.Media.Window , {

        ctype         : "Ext.ux.Media.Flash.Window",
        mediaClass    : Ext.ux.Media.Flash,

        autoScroll    : true,

        /**
         * @cfg {Boolean} shadow Set to false to prevent DOM reflow when shadow is hidden/shown
         * @default false
         */
        shadow        : false,


        /** @private */
        initComponent   : function(){
            componentAdapter.init.apply(this,arguments);
            Ext.ux.Media.Flash.Window.superclass.initComponent.apply(this,arguments);

       }

   });

   Ext.reg('flashwindow', ux.Flash.Window);

   /**
    *
    * @class Ext.ux.Media.Flash.Element
    * @extends Ext.ux.Media.Element
    * @version  2.1
    * @author Doug Hendricks. doug[always-At]theactivegroup.com
    * @donate <a target="tag_donate" href="http://donate.theactivegroup.com"><img border="0" src="http://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" border="0" alt="Make a donation to support ongoing development"></a>
    * @copyright 2007-2008, Active Group, Inc.  All rights reserved.
    * @desc
    * Base Media Class for Flash objects
    * Used primarily for rendering Flash Objects for use with inline markup.
    */


   Ext.ux.Media.Flash.Element = Ext.extend ( Ext.ux.Media.Element , {

        /**
         * Removes this Flash element from the DOM and deletes it from the cache.  For Flash objects,
         * this requires special treatment to prevent Memory leakage (for IE).
         * @param {Boolean} cleanse (optional) Perform a cleanse of immediate childNodes as well.
         * @param {Boolean} deep (optional) Perform a deep cleanse of all nested childNodes as well.
         */

       remove : function(){

             var d ;
             // Fix streaming media troubles for IE
             // IE has issues with loose references when removing an <object>
             // before the onload event fires (all <object>s should have readyState == 4 after browsers onload)

             // Advice: do not attempt to remove the Component before onload has fired on IE/Win.

            if(Ext.isIE && Ext.isWindows && (d = this.dom)){

                this.removeAllListeners();
                d.style.display = 'none'; //hide it regardless of state
                if(d.readyState == 4){
                    for (var x in d) {
                        if (x.toLowerCase() != 'flashvars' && typeof d[x] == 'function') {
                            d[x] = null;
                        }
                    }
                }

             }

             Ext.ux.Media.Flash.Element.superclass.remove.apply(this, arguments);

         }

   });

   Ext.ux.Media.Flash.prototype.elementClass  =  Ext.ux.Media.Flash.Element;
            //this.elementClass  =  Ext.ux.Media.Flash.Element;

   var writeScript = function(block, attributes) {
        attributes = Ext.apply({},attributes||{},{type :"text/javascript",text:block});

         try{
            var head,script, doc= document;
            if(doc && doc.getElementsByTagName){
                if(!(head = doc.getElementsByTagName("head")[0] )){

                    head =doc.createElement("head");
                    doc.getElementsByTagName("html")[0].appendChild(head);
                }
                if(head && (script = doc.createElement("script"))){
                    for(var attrib in attributes){
                          if(attributes.hasOwnProperty(attrib) && attrib in script){
                              script[attrib] = attributes[attrib];
                          }
                    }
                    return !!head.appendChild(script);
                }
            }
         }catch(ex){}
         return false;
    };

    /* This is likely unnecessary with this implementation, as Flash objects are removed as needed
     * during the clearMedia method, but included to cleanup inline flash markup.
     */
    if(Ext.isIE && Ext.isWindows && ux.Flash.prototype.flashVersion.major == 9) {


        window.attachEvent('onbeforeunload', function() {
              __flash_unloadHandler = __flash_savedUnloadHandler = function() {};
        });

        //Note: we cannot use IE's onbeforeunload event because an internal Flash Form-POST
        // raises the browsers onbeforeunload event when the server returns a response.  that is crazy!
        window.attachEvent('onunload', function() {

            Ext.each(Ext.query('.x-media-swf'), function(item, index) {
                item.style.display = 'none';
                for (var x in item) {
                    if (x.toLowerCase() != 'flashvars' && typeof item[x] == 'function') {
                        item[x] = null;
                    }
                }
            });
        });

    }

 Ext.apply(Ext.util.Format , {
       /**
         * Convert certain characters (&, <, >, and ') to their HTML character equivalents for literal display in web pages.
         * @param {String} value The string to encode
         * @return {String} The encoded text
         */
        xmlEncode : function(value){
            return !value ? value : String(value)
                .replace(/&/g, "&amp;")
                .replace(/>/g, "&gt;")
                .replace(/</g, "&lt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&apos;");
        },

        /**
         * Convert certain characters (&, <, >, and ') from their HTML character equivalents.
         * @param {String} value The string to decode
         * @return {String} The decoded text
         */
        xmlDecode : function(value){
            return !value ? value : String(value)
                .replace(/&gt;/g, ">")
                .replace(/&lt;/g, "<")
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, "&")
                .replace(/&apos;/g, "'");

        }

    });


 Ext.ux.FlashComponent  = Ext.ux.Media.Flash.Component ;
 Ext.ux.FlashPanel      = Ext.ux.Media.Flash.Panel;
 Ext.ux.FlashPortlet    = Ext.ux.Media.Flash.Portlet;
 Ext.ux.FlashWindow     = Ext.ux.Media.Flash.Window;

})();

;/* @copyright 2007-2008, Active Group, Inc. All rights reserved.*/
 /**
  * @class Ext.ux.Chart.FlashAdapter
  * @extends Ext.ux.Media.Flash
  * @version 2.1
  * @license <a href="http://www.gnu.org/licenses/gpl.html">GPL 3.0</a>
  * @author Doug Hendricks,.doug[always-At]theactivegroup.com
  * @desc
  * Abstract Chart Class which defines the standard interface for all Flash charts supported by the ChartPack series.
  */

(function(){

    Ext.namespace("Ext.ux.Chart");
    var chart = Ext.ux.Chart;
    var flash = Ext.ux.Media.Flash;

    Ext.ux.Chart.FlashAdapter = Ext.extend( Ext.ux.Media.Flash, {

       /**
        * @cfg {String|Float} requiredVersion The required Flash version necessary to support the Chart object.
        * @memberof Ext.ux.Chart.FlashAdapter
        * @default 8
        */
       requiredVersion : 8,


       /**
        * @cfg {Mixed} unsupportedText Text Markup/DOMHelper config displayed when the Flash Plugin is not available
        */
       unsupportedText : {cn:['The Adobe Flash Player{0}is required.',{tag:'br'},{tag:'a',cn:[{tag:'img',src:'http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif'}],href:'http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash',target:'_flash'}]},

       /**
        * @cfg {String} chartURL Url of the Flash Chart object.
        */
       chartURL        : null,

       /**
        * @cfg {Object/JSONstring/Function} chartData Chart data series to load when initially rendered. <p> May be an object, JSONString, or Function that returns either.
        */
       chartData       : null,

       /**
        * @cfg {String} dataURL Url of the chart series to load when initially rendered.
        */
       dataURL         : null,

        /**
        * @cfg {String/Object} autoLoad Url string or {@link #Ext.ux.Chart.FlashAdapter-load} method config object.
        */
       autoLoad        : null,

        /**
         * @cfg {Boolean/Object} loadMask True to mask the Component while the Chart object itself is being
         * initially loaded.  See {@link Ext.ux.IntelliMask} for configuration options.
        */
       loadMask        : null,
        /**
         * @cfg {Boolean/Object} mediaMask True to mask the Component while the Chart class loads data to update the
         * chart during {@link #Ext.ux.Chart.FlashAdapter-load} operations.  See {@link Ext.ux.IntelliMask} for configuration options.
        */
       mediaMask       : null,

       autoMask        : null,

       /**
        * @cfg {Mixed} blankChartData The default data value (or a Function that returns the value) used to render an empty/blank chart.
        */
       blankChartData  : '',


       /**
        * @cfg {string} externalsNamespace ExternalInterface commands for all Flash charts will be bound here.<p>This value becomes the secondary interface
        * for calling object methods defined by the chart object vendor that are not standardized by the ChartPack series.</p>
        * @default chart
        * @example
        * //invoke a chart's Flash ExternalInterface method
        * Ext.getCmp('salesChart').chart.print();
        */
       externalsNamespace  : 'chart',

       /**
        * @cfg {Object} chartCfg Flash configuration options.
        * @example chartCfg  : {  //optional
            id    : String   id of <object> tag
            style : Obj  optional DomHelper style object
            params: {

                flashVars : {
                    chartWidth  : defaults to SWF Object geometry
                    chartHeight : defaults to SWF Object geometry
                    DOMId       : DOM Id of SWF object (defaults to assigned macro '@id')
                    dataXML     : An XML string representing the chart canvas config and data series
                    dataUrl     : A Url to load an XML resource (dataXML)
                }
            }
        }
        */
       chartCfg       : null,

       /**
       * The default Flash Externalinterface object as defined by the {@link #Ext.ux.Chart.FlashAdapter-externalsNamespace} config value.
       *<p>Use this object to access public methods/properties defined by the Flash Chart implementation.
       * @property {DOMElement} chart
       *
       */

       chart          : null,


       /** @private
        * default mediaCfg(chartCfg) for a Chart object
        */
       mediaCfg        : {url      : null,
                          id       : null,
                          start    : true,
                          controls : true,
                          height  : null,
                          width   : null,
                          autoSize : true,
                          renderOnResize:false,
                          scripting : 'always',
                          cls     :'x-media x-media-swf x-chart',
                          params  : {
                              allowscriptaccess : '@scripting',
                              wmode     :'opaque',
                              scale     :'exactfit',
                              scale       : null,
                              salign      : null
                           }
        },

       /** @private */
       initMedia   : function(){

           this.addEvents(

               /**
                * Fires after a succesfull {@link #Ext.ux.Chart.FlashAdapter-load} method attempt but before the retrieved data is submitted to the chart.
                * @event beforeload
                * @param {Ext.ux.Chart} chart this chart component
                * @param {Element} chartObject the underlying chart component DOM reference
                * @param {Object} response The response object from the Ajax request.
                * @param {Object} options The request options used to perform the Ajax request.
                * Returning a value of false from this event prevents updating of the chart.
                */

               'beforeload',

               /**
                * Fires when the the {@link #Ext.ux.Chart.FlashAdapter-load} method attempt reports an error condition.
                * @event loadexception
                * @param {Ext.ux.Chart} chart this chart component
                * @param {Element} chartObject the underlying chart component DOM reference
                * @param {Object} response The response object from the Ajax request.
                * @param {Object} options The request options used to perform the Ajax request.
                * @param {Error} exception The reported exception.
                */

               'loadexception',

               /**
                * If supported by the chart (or can be determined by the chart class),
                * fires when the underlying chart component reports that it has loaded its chart series data.
                * @event chartload
                * @param {Ext.ux.Chart} chart this chart component
                * @param {Element} chartObject the underlying chart component DOM reference
                */

               'chartload',

              /**
               * If supported by the chart or can be determined by the chart class,
               * fires when the underlying chart component has rendered its chart series data.
               * @event chartrender
               * @param {Ext.ux.Chart} chart This chart component
               * @param {Element} chartObject The underlying chart component DOM reference
               */
               'chartrender'
            );


           this.mediaCfg.renderOnResize =
                this.mediaCfg.renderOnResize || (this.chartCfg || {}).renderOnResize;

           chart.FlashAdapter.superclass.initMedia.call(this);

           if(this.autoLoad){
                this.on('mediarender', this.doAutoLoad, this, {single:true} );
           }
       },

       /** @private called just prior to rendering the media
        * Merges chartCfg with default Flash mediaCfg for charting
        */
       onBeforeMedia: function(){

          /* assemble a valid mediaCfg */
          var mc =  this.mediaCfg;
          var mp = mc.params||{};
          delete mc.params;
          var mv = mp[this.varsName]||{};
          delete mp[this.varsName];

          //chartCfg
          var cCfg = Ext.apply({},this.chartCfg || {});

           //chart params
          var cp = Ext.apply({}, this.assert( cCfg.params,{}));
          delete cCfg.params;

           //chart.params.flashVars
          var cv = Ext.apply({}, this.assert( cp[this.varsName],{}));
          delete cp[this.varsName];

          Ext.apply(mc , cCfg, {
              url  : this.assert(this.chartURL, null)
          });

          mc.params = Ext.apply(mp,cp);
          mc.params[this.varsName] = Ext.apply(mv,cv);

          chart.FlashAdapter.superclass.onBeforeMedia.call(this);

      },

     /**
      * Set/update the current chart with a new Data series URL.<p>Override the subclass for a chart-specific implementation.
      * @param {String} url The URL of the stream to update with.
      * @param {Boolean} immediate false to defer rendering the new data until the next chart rendering.
      * @default true
      * @return {ux.Chart.Component} this
      */
     setChartDataURL  : function(url, immediate){

           return this;

         },

     /**
       * Performs an <b>asynchronous</b> request, updating this chart Element with the response.
       * If params are specified it uses POST, otherwise it uses GET.<br><br>
       * <b>Note:</b> Due to the asynchronous nature of remote server requests, the Chart
       * will not have been fully updated when the function returns. To post-process the returned
       * data, use the callback option, or an <b><tt>{@link #Ext.ux.Chart.FlashAdapter-beforeload}</tt></b> event handler.
       * @param {Object} options A config object containing any of the following options:<ul>
       * <li>url : <b>String/Function</b><p class="sub-desc">The URL to request or a function which
       * <i>returns</i> the URL </p></li>
       * <li>method : <b>String</b><p class="sub-desc">The HTTP method to
       * use. Defaults to POST if the <tt>params</tt> argument is present, otherwise GET.</p></li>
       * <li>params : <b>String/Object/Function</b><p class="sub-desc">The
       * parameters to pass to the server (defaults to none). These may be specified as a url-encoded
       * string, or as an object containing properties which represent parameters,
       * or as a function, which returns such an object.</p></li>
       * <li>callback : <b>Function</b><p class="sub-desc">A function to
       * be called when the response from the server arrives. Returning a false value from the callback prevents loading of the chart data.<p>
       * The following parameters are passed:<ul>
       * <li><b>Component</b> : ux.Chart.Component<p class="sub-desc">The Element being updated.</p></li>
       * <li><b>success</b> : Boolean<p class="sub-desc">True for success, false for failure.</p></li>
       * <li><b>response</b> : XMLHttpRequest<p class="sub-desc">The XMLHttpRequest which processed the update.</p></li>
       * <li><b>options</b> : Object<p class="sub-desc">The config object passed to the load call.</p></li></ul>
       * </p></li>
       * <li>scope : <b>Object</b><p class="sub-desc">The scope in which
       * to execute the callback (The callback's <tt>this</tt> reference.) If the
       * <tt>params</tt> argument is a function, this scope is used for that function also.</p></li>
       * <li>timeout : <b>Number</b><p class="sub-desc">The number of seconds to wait for a response before
       * timing out (defaults to 30 seconds).</p></li>
       * <li>text : <b>String</b><p class="sub-desc">The text to use to override the default loadMask text of the
       * {@link #Ext.ux.Chart.FlashAdapter-loadMask} div if {@link #Ext.ux.Chart.FlashAdapter-autoMask} is enabled.</p></li>
       * <li>disableCaching: <b>Boolean</b><p class="sub-desc">Only needed for GET
       * requests, this option causes an extra, auto-generated parameter to be appended to the request
       * to defeat caching (defaults to {@link #Ext.ux.Chart.FlashAdapter-disableCaching}).</p></li></ul>
       * <p>
      *
      * @param {Object/String/Function} url A config object containing any of the following options:
      * @param {Object/Function} params A config object containing parameter definitions or a Function that does, if any.
      * @param {Function} callback Optional callback Function called upon completion of the request.
      * @param {Object} scope The scope of the callback Function.
      * @return {Ext.Data.Connection} The Ext.data.Connection instance used to make the request. (Useful for abort operations)
      * @example
        var requestConnection = chartComponent.load({
           url: "your-url.php",
           method  : "POST",
           params: {param1: "foo", param2: "bar"}, // or a URL encoded string
           callback: yourFunction,
           scope: yourObject, // optional scope for the callback
           disableCaching : true,
           timeout: 30,
           text   : 'Loading Sales Data...',  //optional loadMask text override
       });
        */

       load :  function(url, params, callback, scope){

           if(!url){return null;}

           this.connection || (this.connection = new Ext.data.Connection() );

           if(this.loadMask && this.autoMask && !this.loadMask.active ){

                this.loadMask.show({
                     msg : url.text || null
                    ,fn : arguments.callee.createDelegate(this,arguments)
                    ,fnDelay : 100
                 });
                return this.connection;
           }

           var method , dataUrl, cfg, callerScope,timeout,disableCaching ;

           if(typeof url === "object"){ // must be config object
               cfg = Ext.apply({},url);
               dataUrl = cfg.url;
               params = params || cfg.params;
               callback = callback || cfg.callback;
               callerScope = scope || cfg.scope;
               method = cfg.method || params ? 'POST': 'GET';
               disableCaching = cfg.disableCaching ;
               timeout = cfg.timeout || 30;
           } else {
               dataUrl  = url;
           }

           //resolve Function if supplied
           if(!(dataUrl = this.assert(dataUrl, null)) ){return null;}

           method = method || (params ? "POST" : "GET");
           if(method === "GET"){
               dataUrl= this.prepareURL(dataUrl, disableCaching );
           }
           var o;
           o = Ext.apply(cfg ||{}, {
               url : dataUrl,
               params:  params,
               method: method,
               success: function(response, options){
                    o.loadData = this.fireEvent('beforeload', this, this.getInterface(), response, options) !== false;
               },
               failure: function(response, options){
                    this.fireEvent('loadexception', this, this.getInterface(), response, options, exception);
                   },
               scope: this,
               //Actual response is managed here
               callback: function(options, success, response ) {
                   o.loadData = success;
                   if(callback){
                       o.loadData = callback.call(callerScope , this, success, response, options )!== false;
                   }
                   if(success && o.loadData){
                        /* If either the callback or the beforeload event provide a
                         * options.chartResponse property, use that instead of responseText
                         */
                        this.setChartData(options.chartResponse || response.responseText);
                    }
                   if(this.autoMask){ this.onChartLoaded(); }

               },
               timeout: (timeout*1000),
               argument: {
                "options"   : cfg,
                "url"       : dataUrl,
                "form"      : null,
                "callback"  : callback,
                "scope"     : callerScope ,
                "params"    : params
               }
           });

           this.connection.request(o);
           return this.connection;
      },
      /**
       * Set/update the current chart with a new data series
       * @param {Mixed} data The chart series data (string, Function, or JSON object depending on the needs of the chart) to update with.
       */
      setChartData  : function(data){

          return this;
      },
       /** @private */
      setMask  : function(ct) {

          chart.FlashAdapter.superclass.setMask.call(this, ct);

          //loadMask reserved for data loading operations only
          //see: @cfg:mediaMask for Chart object masking
          if(this.loadMask && !this.loadMask.disabled){
              this.loadMask = new Ext.ux.IntelliMask( this[this.mediaEl] || ct, this.loadMask);
          }

      },

       /** @private */
      doAutoLoad  : function(){
          this.load (
           typeof this.autoLoad === 'object' ?
               this.autoLoad : {url: this.autoLoad});

          this.autoLoad = null;
      },


       /** @private */
       onChartRendered   :  function(){
             this.fireEvent('chartrender', this, this.getInterface());
             if(this.loadMask && this.autoMask){this.loadMask.hide();}
       },
       /** @private */
       onChartLoaded   :  function(){
            this.fireEvent('chartload', this, this.getInterface());
            if(this.loadMask && this.autoMask){this.loadMask.hide();}
       },

       /** @private  this function is designed to be used when a chart object notifies the browser
        * if its initialization state.  Raised Asynchronously.
        */
       onFlashInit  :  function(id){
           chart.FlashAdapter.superclass.onFlashInit.apply(this,arguments);
           this.fireEvent.defer(1,this,['chartload',this, this.getInterface()]);
       },

       loadMask : false,

       /**
        * @returns {Mixed} Returns the release number of the Chart object.
        * <p>Note: Override for chart object's specific support for it.
        */

       getChartVersion :  function(){}

    });


    /** @private  Class method callbacks */
    chart.FlashAdapter.chartOnLoad = function(DOMId){

        var c, d = Ext.get(DOMId);
        if(d && (c = d.ownerCt)){
            c.onChartLoaded.defer(1, c);
            c = d=null;
            return false;
        }
        d= null;
    };

    /** @private  Class method callbacks */
    chart.FlashAdapter.chartOnRender = function(DOMId){
        var c, d = Ext.get(DOMId);
        if(d && (c = d.ownerCt)){
            c.onChartRendered.defer(1, c);
            c = d = null;
            return false;
        }
        d= null;
    };

    Ext.apply(Ext.util.Format , {
       /**
         * Convert certain characters (&, <, >, and ') to their HTML character equivalents for literal display in web pages.
         * @param {String} value The string to encode
         * @return {String} The encoded text
         */
        xmlEncode : function(value){
            return !value ? value : String(value)
                .replace(/&/g, "&amp;")
                .replace(/>/g, "&gt;")
                .replace(/</g, "&lt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&apos;");
        },

        /**
         * Convert certain characters (&, <, >, and ') from their HTML character equivalents.
         * @param {String} value The string to decode
         * @return {String} The decoded text
         */
        xmlDecode : function(value){
            return !value ? value : String(value)
                .replace(/&gt;/g, ">")
                .replace(/&lt;/g, "<")
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, "&")
                .replace(/&apos;/g, "'");

        }

    });

})();;/* global Ext */
/**
 * @class Ext.ux.Chart.OFC
 * @version 1.1
 * @author  Doug Hendricks. doug[always-At]theactivegroup.com
 * @copyright 2007-2008, Active Group, Inc.  All rights reserved.
 */
 /************************************************************************************
 *   This file is distributed on an AS IS BASIS WITHOUT ANY WARRANTY;
 *   without even the implied warranty of MERCHANTABILITY or
 *   FITNESS FOR A PARTICULAR PURPOSE.
 ************************************************************************************

 License: ux.Chart.OFC is licensed under the terms of the Open Source GPL 3.0 license.

     This program is free software for non-commercial use:
     you can redistribute it and/or modify
     it under the terms of the GNU General Public License as published by
     the Free Software Foundation, either version 3 of the License, or
     any later version.

     This program is distributed in the hope that it will be useful,
     but WITHOUT ANY WARRANTY; without even the implied warranty of
     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     GNU General Public License for more details.

     You should have received a copy of the GNU General Public License
     along with this program.  If not, see < http://www.gnu.org/licenses/gpl.html>.

   Donations are welcomed: http://donate.theactivegroup.com
   Commercial use is prohibited without a Commercial License. See http://licensing.theactivegroup.com.

 Version:  1.1  10/14/2008
         Add: saveAsImage method since latest OFC2 beta now supports it.
         Add: imagesaved Event.
         Fixes: Corrected ofcCfg options merge for params and flashVars

 Component Config Options:

   chartUrl    : the URL to open_flash_chart.swf
   dataUrl     : the URL of a remote chart data resource (loaded by the chart object itself)
   dataFn      : the name of an accessible function which return the initial chart series as a JSON string.
   autoLoad    : Use Ext.Ajax to remote load a JSON chart series
   chartData   : (optional object/JSON string/Function) Chart data series to load when initially rendered.  May be an object, JSONString, or Function that returns either.
   ofcCfg  : {  //optional
            id    : String   id of <object> tag
            style : Obj  optional DomHelper style object

        }

 This class inherits from (thus requires):
  ux.Media(uxmedia.js) and
  ux.Media.Flash (uxflash.js),
  uxchart.js

  files and classes.

 */


(function(){
    Ext.namespace("Ext.ux.Chart.OFC");

    var chart = Ext.ux.Chart;
    /**
     * @class Ext.ux.Chart.OFC.Adapter
     * @extends Ext.ux.Chart.FlashAdapter
     * @version 1.0
     * @author Doug Hendricks. doug[always-At]theactivegroup.com
     * @copyright 2007-2008, Active Group, Inc.  All rights reserved.
     * @license <a href="http://www.gnu.org/licenses/gpl.html">GPL 3.0</a>
     * @constructor
     * @param {Object} config The config object
     */

    Ext.ux.Chart.OFC.Adapter = Ext.extend( Ext.ux.Chart.FlashAdapter , {

       /**
        * @cfg {String|Float} requiredVersion The required Flash version necessary to support the Chart object.
        * @default "9"
        */
       requiredVersion : 9,

       /**
       * Chart configuration options may be overriden by supplying alternate values only as necessary.
       * <br />See {@link Ext.ux.Media.Flash} for additional config options.
       * @cfg {Object} chartCfg/fusionCfg Flash configuration options.
       * @memberof Ext.ux.Chart.OFC.Adapter
       * @example chartCfg  : {
             id    : {String}  //id of &lt;object&gt; tag (auto-generated if not specified)
             name      : '@id', //set automatically
             style : {Object}  //optional DomHelper style object
             controls  : true,
             height    : '@height',
             width     : '@width',
             autoSize  : false,
             renderOnResize:false,  //force re-render when the ux.Chart.Component is resized
             scripting : 'always',
             params: {
               allowscriptaccess : '@scripting',
               flashVars : {
                   id          : DOM Id of SWF object (macro '@id')
                   get-data    : {String} Function name to call to gather initial chart series data (.dataFn)
                   data-file   : A Url to initially load a chart series (.dataURL)
               }
           }
          }
        */

       chartCfg  : null,

       /**
        * @cfg {String} dataFn The named function for the chart object to invoke to retrieve its initial chart series data.
        * This function must return a compatible JSON string.  If defined this method supercedes the class default data retrieval
        * autoLoad mechamism.
        * @optional
        * @example 'MyApp.getMyChartData'
        *
        */
       dataFn : null,

       /**
        * @cfg {Mixed} blankChartData The default data value used to render an empty/blank chart.
        * @default null
        */

       blankChartData : { "elements": []}, //,"style":{"font-size": "30px;"}}} ,

       /** @private */
       mediaCfg        : {url       : null,
                          id        : null,
                          start     : true,
                          controls  : true,
                          name      :'@id',
                          height    : '@height',
                          width     : '@width',
                          autoSize  : false,
                          start     :false,
                          renderOnResize:false,
                          scripting : 'always',
                          cls       :'x-media x-media-swf x-chart-ofc',
                          params    : {
                             allowscriptaccess : '@scripting',
                             flashVars : {
                                 'get-data'  : null,  //function name to call for initial data
                                 'data-file' : null,  //URL for initial data
                                 id: '@id'
                             }
                          },

                          //Auto ExternalInterface Bindings (Flash v8 or higher)
                          boundExternals : ['post_image',    //from OFC2 beta 2.2 Hyperion?
                                            'get_img_binary', //new for OFC2 beta 2.2 : returns PNG image as a base64:String
                                            'get_version',
                                            'load'
                                            ]

        },

        /** @private */
       initMedia  : function(){

           this.addEvents(

             /**
              * Fires when the image_saved callback is return by the OFC component
              * @event imagesaved
              * @param {Ext.ux.Chart.OFC} this Chart Component
              * @param {object} the underlying chart component DOM reference
              */
              'imagesaved'

            );

           //For compat with previous versions < 2.1
           this.chartCfg || (this.chartCfg = this.ofcCfg);


           /*
            * Custom autoLoad handling for OFC
            * Must wait for its 'open_flash_chart_data' callBack, indicating its ready
            * to accept new Data
            */
           this._autoLoad = this.dataFn ? null : this.autoLoad;
           delete this.autoLoad;

           chart.OFC.Adapter.superclass.initMedia.call(this);

       },

        /** @private */
       //called just prior to rendering the media
       onBeforeMedia: function(){

         /* assemble a compatible mediaCfg for use with the defined Chart SWF variables */
           var mc = this.mediaCfg;
           var cCfg = this.chartCfg || (this.chartCfg = {});
           cCfg.params                = this.assert( cCfg.params,{});
           cCfg.params[this.varsName] = this.assert( cCfg.params[this.varsName],{});

           cCfg.params[this.varsName] = Ext.apply({
                'data-file' : this.dataURL ? this.prepareURL(this.dataURL || null) : null,
                'get-data'  : this.dataFn ? String(this.dataFn) : null,
                allowResize : !!this.resizable
               }, cCfg.params[this.varsName] );

           chart.OFC.Adapter.superclass.onBeforeMedia.call(this);

       },
       /**
       * @private
       * @cfg {String} setDataMethod The method name to use to set the charts current data series.
       */
       setDataMethod : 'loadData',


       /**
        *
        * @param {JSONString/Object/Function} data The data (or Function that returns the data) to apply to the chart immediately.
        * @return {ux.Chart.OFC} this
        */
       setChartData: function(data){
           var o, j;

           j = this.assert(data ,null);  //Value/Function assertion


           if(j && (o = this.getInterface()) && typeof o.load != 'undefined'){
                  if(this.loadMask && this.autoMask && !this.loadMask.active ){
                       this.loadMask.show();
                  }

                  j = this.chartData = (typeof j == 'object'? Ext.encode(j) : j);

                  o.load(j);
                  //OFC2 does not raise the ofc_ready callback for a load method,
                  //so we will.
                  this.onChartLoaded();

           }
           return this;
       },

       /**
       * <strong>Not implemented by OFC2 </strong><p>
       * Set/update the current chart with a new URL returning a data series.
       * @param {String} url The URL of the stream to update with.
       * @param {Boolean} immediate false to defer rendering the new data until the next chart rendering.
       * @default true
       */
       setChartDataURL  : function(url, immediate){
         return this;
        },

       /**
       * When initially rendered, the OFC Flash object will invoke the 'window.open_flash_chart_data' method
       * in an effort to render an initial chart series of choice.
       * ux.Chart.OFC proxies this method when called.<p>You can use this method in several ways.
       * <ul><li>If the class {@link #chartData} property contains a value, it is returned.</li><li>Otherwise, autoLoad is initiated if defined.</li>
       * <li>Or, redefine this method of your chart instance to return the desired initial data series.</li></ul>
       * @return {JSONString} Return a JSON string used to <b>initially</b> render the chart. <p>If a value is not available, the value of {@link #blankChartData} is returned.
       */

       onDataRequest : function() {

           var json = this.assert(this.chartData ,this.assert(this.blankChartData,null) );

           if(!this.chartData && this._autoLoad){
               this.doAutoLoad();
               this._autoLoad = null;
           }

           return json && typeof json == 'object'? Ext.encode(json) : json;

        },

      /** @private */
      doAutoLoad  : function(){
          this.load (
           typeof this._autoLoad === 'object' ?
               this._autoLoad : {url: this._autoLoad});


      },

      loadMask : false,

      /**
       * Open Flash Chart 2 has an external interface method that you can call to make it save an image.
       * @param {String} url The URL of the upload PHP script Example: http://example.com/php-ofc-library/ofc_upload_image.php?name=my_chart.jpg
       * @param {Boolean} debug (optional) If debug is true the browser will open a new window showing the results (and any echo/print statements) but, the imagesaved event is NOT raised.
       *  If it is false, no redirect happens and the imagesaved event is raised.
       *  <p>This feature requires a serverside script (included in the OCF2 Chart Distribution: ofc_upload_image.php<p>
       *  For a Tutorial on this feature, @see http://teethgrinder.co.uk/open-flash-chart-2/adv-upload-image.php
       */

       //OFC2 beta 2 has changed the saveAsImage process, final details are pending, but earlier beta
       //releases are still supported here (but, likely subject to CHANGE )
      saveAsImage : function(url, debug ){
        var o;
        if(url && (o = this.getInterface()) ){
            var method = this.chart.post_image || o.post_image;

            if(method !== undefined){
               method(url, 'Ext.ux.Chart.OFC.Adapter._saveImageCallback(\''+this.id+'\')', debug || false);
            }
            return this;
        }
      },

      /**
       * Open Flash Chart 2 has an external interface method that you can call to to return a base64 encoded stream of the current chart.
       * @return {base64:String} The encoded PNG image stream suitable for browsers that support data URLs.
       */
      getBinaryImage  : function(){
         var o;
        if(o = this.getInterface()){

            if(o.get_img_binary !== undefined){
               return o.get_img_binary();
            }

        }

      },

      /**
       * Returns the release number of the Chart object.
       * @return {string}
       */
      getChartVersion  :  function(){
          var ns = this[this.externalsNamespace] || this;
          ns = typeof ns.get_version != 'undefined' ? ns : this.getInterface();

          return (ns && typeof ns.get_version != 'undefined') ? ns.get_version() : '';

      }

    });


    /**
     * @class Ext.ux.Chart.OFC.Component
     * @extends Ext.ux.Chart.OFC.Adapter
     * @version 2.1
     * @author Doug Hendricks. doug[always-At]theactivegroup.com
     * @copyright 2007-2008, Active Group, Inc.  All rights reserved.
     * @license <a href="http://www.gnu.org/licenses/gpl.html">GPL 3.0</a>
     * @constructor
     * @param {Object} config The config object
     * @base Ext.ux.Media.Flash.Component
     */
    Ext.ux.Chart.OFC.Component = Ext.extend(Ext.ux.Media.Flash.Component, {
        ctype : 'Ext.ux.Chart.OFC',
        mediaClass  : chart.OFC.Adapter
        });

    Ext.reg('openchart', chart.OFC.Component);
    /**
     * @class Ext.ux.Chart.OFC.Panel
     * @extends Ext.ux.Media.Flash.Panel
     * @version 2.1
     * @author Doug Hendricks. doug[always-At]theactivegroup.com
     * @copyright 2007-2008, Active Group, Inc.  All rights reserved.
     * @license <a href="http://www.gnu.org/licenses/gpl.html">GPL 3.0</a>
     * @constructor
     * @param {Object} config The config object
     * @base Ext.ux.Chart.OFC.Adapter
     */
    Ext.ux.Chart.OFC.Panel = Ext.extend(Ext.ux.Media.Flash.Panel, {
        ctype : 'Ext.ux.Chart.OFC.Panel',
        mediaClass  : chart.OFC.Adapter
        });

    Ext.reg('openchartpanel', chart.OFC.Panel);
    /**
     * @class Ext.ux.Chart.OFC.Portlet
     * @extends Ext.ux.Chart.OFC.Panel
     * @version 2.1
     * @author Doug Hendricks. doug[always-At]theactivegroup.com
     * @copyright 2007-2008, Active Group, Inc.  All rights reserved.
     * @license <a href="http://www.gnu.org/licenses/gpl.html">GPL 3.0</a>
     * @constructor
     * @param {Object} config The config object
     */

    Ext.ux.Chart.OFC.Portlet = Ext.extend(Ext.ux.Chart.OFC.Panel, {
        anchor      : '100%',
        frame       : true,
        collapseEl  : 'bwrap',
        collapsible : true,
        draggable   : true,
        cls         : 'x-portlet x-chart-portlet'
    });

    Ext.reg('openchartportlet', chart.OFC.Portlet);

    /**
     * @class Ext.ux.Chart.OFC.Window
     * @extends Ext.ux.Media.Flash.Window
     * @version 1.0
     * @author Doug Hendricks. doug[always-At]theactivegroup.com
     * @copyright 2007-2008, Active Group, Inc.  All rights reserved.
     * @license <a href="http://www.gnu.org/licenses/gpl.html">GPL 3.0</a>
     * @constructor
     * @param {Object} config The config object
     * @base Ext.ux.Chart.OFC.Adapter
     */

    Ext.ux.Chart.OFC.Window = Ext.extend(Ext.ux.Media.Flash.Window, {
        ctype : "Ext.ux.Chart.OFC.Window",
        mediaClass  : chart.OFC.Adapter
        });

    Ext.reg('openchartwindow', chart.OFC.Window);

    /* Class Proxy Methods */
    Ext.apply(chart.OFC.Adapter,{

        /** @private  Class method callbacks */
        chartDataRequest : function(DOMId){

            var c, d = Ext.get(DOMId);
            if(d && (c = d.ownerCt)){

                return c.onDataRequest?c.onDataRequest() :c.assert(c.blankChartData,null)
            }
            d= null;
        },

        /** @private
         * Class Method
         * Saved Image Callback handler
         */
        _saveImageCallback : function(ofcComp){
              var c;
              if(c = Ext.getCmp(ofcComp)){
                 //return to Flash asap to expose any callback errors.
                 c.fireEvent.defer(1,c,['imagesaved', c, c.getInterface()]);
              }
          }

        });

        window.ofc_ready = window.ofc_ready ?
                window.ofc_ready.createInterceptor(chart.FlashAdapter.chartOnLoad )
               :chart.FlashAdapter.chartOnLoad;

        window.open_flash_chart_data = window.open_flash_chart_data ?
                window.open_flash_chart_data.createInterceptor(chart.OFC.Adapter.chartDataRequest )
           :chart.OFC.Adapter.chartDataRequest;


})();

if (Ext.provide) {
    Ext.provide('uxofc');
};/**
  * 使用OFC显示图形的面板基类
 */
divo.panel.OFCPanel = Ext.extend(Ext.ux.Chart.OFC.Panel, {
	initComponent : function() {
		Ext.apply(this, {
            chartURL  : '/media/flash/open-flash-chart.swf',
            chartData: this.blankChartData
		})
		
		divo.panel.OFCPanel.superclass.initComponent.apply(this,arguments)
	}
})

// EOP

;/**
 * 上传图片显示面板
 * 
 * --------------------------------------------------------------
 * 消息：
 * 选择了某个图片
 * 
 * 消息名：     			
 * divo.panel.SelectImage
 * 
 * 消息内容：
 * {int} sender 当前组件Id
 * {Object} node 被选中的图片对象
 */
divo.panel.UploadedImagePanel = Ext.extend(Ext.Panel, {
	allowMaxWidth : null,
	allowMaxHeight : null,
	lookup : {}, // cache data by image name for easy lookup
	isFlash : false,
	initComponent : function() {
		this.store = new Ext.data.JsonStore({
			root : 'images',
			fields : ['id', 'title','url','thumbnail_url',{
				name : 'size',
				type : 'int'
			},{
				name : 'height',
				type : 'int'
			},{
				name : 'width',
				type : 'int'
			},{
				name : 'added_on',
				type : 'string'
			}]
		});
		this.initTemplates();

		var formatFileSize = function(data){
	        if(data.size < 1024) {
	            return data.size + " 字节";
	        } else {
	            return (Math.round(((data.size*10) / 1024))/10) + " KB";
	        }
	    };
		
		var formatData = function(data){
	    	data.shortName = data.title.ellipse(15)
	    	data.imageSizeString = "宽度:"+data.width+"&nbsp;高度:"+data.height
	    	data.fileSizeString = formatFileSize(data)
	    	data.dateString = data.added_on;
	    	this.lookup['divo-img-chooser-img-'+data.id] = data;
	    	return data;
	    };
		
		this.view = new Ext.DataView({
			store : this.store,
			tpl : this.thumbTemplate,
			autoHeight : true,
			singleSelect: true,
			overClass : 'x-view-over',
			itemSelector : 'div.thumb-wrap',
			emptyText : '<div style="padding:10px;">(无文件)</div>',
			prepareData: formatData.createDelegate(this),
			listeners : {
				'click' : {
					fn : this.showDetails,
					scope : this,
					buffer : 100
				},
				'dblclick' : {
					fn : this.doCallback,
					scope : this
				},
				'loadexception' : {
					fn : this.onLoadException,
					scope : this
				}
			}
		}) // new Ext.DataView

		Ext.apply(this, {
			layout : 'border',
			autoScroll : true,
			items : [{
				id : 'divo-img-chooser-view',
				region : 'center',
				autoScroll : true,
				items : this.view
			}, {
				id : 'divo-img-detail-panel',
				region : 'east',
				split : true,
				stateful : true,
				stateId : this.myId('detail'),
				autoScroll : true,
				width : 250,
				minWidth : 50
			}]
		})

		divo.panel.UploadedImagePanel.superclass.initComponent.apply(this,
				arguments)
	},
	render : function() {
		divo.panel.UploadedImagePanel.superclass.render.apply(this,arguments)
		this.store.on("load", this.onStoreLoad, this)
	},
	formatSize : function(data) {
		if (data.size < 1024) {
			return data.size + " 字节";
		} else {
			return (Math.round(((data.size * 10) / 1024)) / 10) + " KB";
		}
	},
	initTemplates : function() {
		this.thumbTemplate = new Ext.XTemplate(
				'<tpl for=".">',
				'<div class="thumb-wrap" id="divo-img-chooser-img-{id}">',
				'<div class="thumb"><img src="{thumbnail_url}" title="{title}"></div>',
				'<span>{shortName}</span></div>',
				'</tpl>',
				'<div class="x-clear"></div>');
		this.thumbTemplate.compile();

		this.detailsTemplate = new Ext.XTemplate(
		        '<div class="details">',
				'<tpl for=".">', 
				'<img src="{url}"><div class="details-info">',
				'<b>标题:</b>',
				'<span>{title}</span>',
				'<b>图片大小:</b>',
				'<span>{imageSizeString}</span>',
				'<b>文件大小:</b>',
				'<span>{fileSizeString}</span>',
				'<b>创建时间:</b>',
				'<span>{dateString}</span></div>',
				'</tpl>',
				'</div>');
		this.detailsTemplate.compile();
	},
	showDetails : function(){
	    var selNode = this.view.getSelectedNodes();
	    var el = Ext.getCmp('divo-img-detail-panel')
	    if (!el) return
	    var detailEl = el.body;
		if(selNode && selNode.length > 0){
			selNode = selNode[0];
		    var data = this.lookup[selNode.id];
            detailEl.hide();
            this.detailsTemplate.overwrite(detailEl, data);
            detailEl.slideIn('l', {stopFx:true,duration:.2});
		}else{
		    detailEl.update('');
		}
	},
	doCallback : function(){
	    var selNode = this.view.getSelectedNodes()
	    if (selNode.length > 0) {
	        var node = selNode[0];
			var data = this.lookup[node.id]
			if (this.allowMaxWidth && this.allowMaxWidth > 0) {
				if (data.width!=this.allowMaxWidth || data.height!=this.allowMaxHeight) {
					this.say("图片大小要求:宽度"+this.allowMaxWidth+"&nbsp;高度"+this.allowMaxHeight)
					return
				}
			}
			this.publish("divo.panel.SelectImage",{
				sender:this.id,
				node:data
			})
		} else {
			this.say("请选择"+(this.isFlash?'Flash文件':'图片'))
		}
    },
	onLoadException : function(v,o){
	    this.view.getEl().update('<div style="padding:10px;">加载失败.</div>'); 
	},
	//public
	getCurrentNode : function() {
	    var selNode = this.view.getSelectedNodes()
	    if (selNode.length > 0) {
	        var node = selNode[0];
			return this.lookup[node.id]
		} else {
			this.say("请选择"+(this.isFlash?'Flash文件':'图片'))
			return null
		}
	},
	// public
	showList : function(catalogCode,currentFileId) {
		if (catalogCode)
			this.catalogCode = catalogCode

		this.currentFileId = null	
		if (currentFileId)
		    this.currentFileId = currentFileId

		if (!this.catalogCode)
			return

		this.store.proxy.conn.url = '/uploadedimages/' + this.getUserId()
				+ "/" + catalogCode+"/0/0/0/0/0/0/0"
		this.store.reload()
	},
	onStoreLoad : function(store, records, options) {
		if (this.store.getTotalCount() > 0 && this.currentFileId) {
			var el = Ext.get('divo-img-chooser-img-'+this.currentFileId)
			this.view.select(el)
			this.showDetails()
		}
	},
	//public
	deleteImage : function() {
		var rs = this.view.getSelectedRecords()
        if (rs.length==0) {
        	this.say("请先选择"+(this.isFlash?'Flash文件':'图片'))
        	return
        }
        this.getEl().mask('','x-mask-loading')
        Ext.Ajax.request({
        	scope : this,
        	url : '/uploadedimages/'+rs[0].data.id,
        	async : true,
        	method : 'DELETE',
        	success : function(response, options) {
        		this.getEl().unmask()
        		var resp = Ext.decode(response.responseText)
        		this.store.reload()
        	},
        	failure : function(response, options) {
        		this.getEl().unmask()
        		this.alert(response.responseText)
        	}
        })
	}
})

Ext.reg('divo.panel.UploadedImagePanel', divo.panel.UploadedImagePanel)
// EOP

;// the namespace
Ext.namespace("Ext.ux.DataView");

/**
 * a Ext.ux.DataView Plugin which imitates the famous LightBox in ExtJS style it
 * opens a window, provides back and forward buttons for cycling through images
 * 
 * it uses 2 different methods of showing the window...gecko browsers simply
 * reloads the image src, and syncs the window size so it fits
 * 
 * all other browser need the destroy the window, and create a new one
 * 
 * @author caziel
 * @copyright 2008
 * @license GPL
 * @namespace Ext.ux.DataView
 * @version 0.1
 * @see http://extjs.com/deploy/dev/examples/view/data-view.html
 *      @example
 *      http://extjs-ux.org/repo/authors/caziel/trunk/Ext/ux/DataView/LightBox/examples/
 * 
 * @param {Object}
 *            cfg overrides default window config
 * @extends {Ext.ux}
 *          -------------------------------------------------------------- 消息：
 *          选择了某个节点
 * 
 * 消息名： Ext.ux.DataView.LightBox.NodeSelect<本组件Id>
 * 
 * 消息内容： {String} sender 本器件的id值 {Number} index 节点index {Object} view
 * --------------------------------------------------------------
 */
Ext.ux.DataView.LightBox = function(cfg) {

	/**
	 * the window config
	 * 
	 * @private
	 * @type {Object}
	 */
	var cfg = cfg || {};

	/**
	 * the DataView
	 * 
	 * @private
	 * @type {Ext.DataView}
	 */
	var view;

	/**
	 * the LightBox Window
	 * 
	 * @private
	 * @type {Ext.Window}
	 */
	var win;

	/**
	 * the current image record
	 * 
	 * @private
	 * @type {Ext.data.Record}
	 */
	var rec;

	/**
	 * the current index
	 * 
	 * @private
	 * @type {int}
	 */
	var index;

	/**
	 * the init function for starting the plugin
	 * 
	 * @param {Ext.DataView}
	 *            dataView the DataView
	 * @return {void}
	 */
	this.init = function(dataView) {
		view = dataView;
		view.on('click', onDblClick, this); // 原来为dblclick
	};

	/**
	 * the double Click Event Handler
	 * 
	 * @private
	 * @param {Ext.DataView}
	 *            view
	 * @param {int}
	 *            index
	 * @param {Ext.data.Node}
	 *            node
	 * @param {Ext.EventObject}
	 *            e
	 * @return {void}
	 */
	function onDblClick(view, ind, node, e) {
		index = ind;
		rec = view.getRecord(view.getNode(index));

		if (cfg.id)
			divo.publish("Ext.ux.DataView.LightBox.NodeSelect" + cfg.id, {
						sender : cfg.id,
						index : index,
						view : view
					})
		var config = { // the default window config
			modal : true,
			hideBorders : true,
			border : false,
			layout : 'fit',
			resizable : false,
			draggable : true,
			bodyBorder : false,
			//autoScroll : true,
			//maximizable : true, 最大化后下方多出一横条
			title : rec ? rec.data.name + " [" + (index + 1) + " of "
					+ view.store.getCount() + "]" : '',
			items : [{
				autoScroll : true,
			    html : "<img id='divo-lightbox-image' src='"+(rec ? rec.data.url : '')+"'/>"
			}],
			bbar : new Ext.Toolbar({
						cls : 'go-paging-tb',
						items : [{
									xtype : 'tbbutton',
									icon : cfg.prevImage,
									iconCls : 'blist',
									id : 'prev_btn',
									text : "<span>上一张&nbsp;&nbsp;</span>",
									hidden : view.getNode(index - 1)
											? false
											: true,
									scope : this,
									handler : prevAction
								}, {
									xtype : 'tbfill'
								}, {
									xtype : 'tbbutton',
									id : 'next_btn',
									text : "<span>下一张&nbsp;&nbsp;</span>",
									iconCls : 'blist',
									icon : cfg.nextImage,
									scope : this,
									hidden : view.getNode(index + 1)
											? false
											: true,
									handler : nextAction
								}]
					}),
			keys : [{
						key : Ext.EventObject.LEFT,
						fn : prevAction,
						scope : this
					}, {
						key : Ext.EventObject.RIGHT,
						fn : nextAction,
						scope : this
					}],
			listeners : {
				"render" : function() {
					this.setSize( Ext.getBody().getSize().width - 100, Ext.getBody().getSize().height - 100);
				}
			}
		};
		win = new Ext.Window(config);
		win.show();
		if (Ext.isGecko) {
			// set the title
			win.setTitle(rec.data.name + " [第" + (index + 1) + "张 共"
					+ view.store.getCount() + "张]");

			// disable/enable previous/next buttons
			view.getNode(index - 1)
					? Ext.ComponentMgr.get('prev_btn').show()
					: Ext.ComponentMgr.get('prev_btn').hide();
			view.getNode(index + 1)
					? Ext.ComponentMgr.get('next_btn').show()
					: Ext.ComponentMgr.get('next_btn').hide();

			// change selection
			Ext.each(view.getSelectedNodes(), function(e) {
						view.deselect(e);
					}, this);
			view.select(index);

			if (cfg.id)
				divo.publish("Ext.ux.DataView.LightBox.NodeSelect" + cfg.id, {
							sender : cfg.id,
							index : index,
							view : view
						})

			Ext.get('divo-lightbox-image').dom.src = rec.data.url;		
			win.center();
		}
	};

	/**
	 * returns the current record
	 * 
	 * @return {Ext.data.Record}
	 */
	this.getRecord = function() {
		return rec;
	}

	/**
	 * returns the current index
	 * 
	 * @return {int}
	 */
	this.getIndex = function() {
		return index;
	}

	/**
	 * returns the view
	 * 
	 * @return {Ext.DataView}
	 */
	this.getView = function() {
		return view;
	}

	/**
	 * returns the window
	 * 
	 * @return {Ext.Window}
	 */
	this.getWindow = function() {
		return win;
	}

	/**
	 * loads an image into the window
	 * 
	 * @private
	 * @return {void}
	 */
	loadImage = function() {
		// set the title
		win.setTitle(rec.data.name + " [第" + (index + 1) + "张 共"
				+ view.store.getCount() + "张]");

		// disable/enable previous/next buttons
		view.getNode(index - 1)
				? Ext.ComponentMgr.get('prev_btn').show()
				: Ext.ComponentMgr.get('prev_btn').hide();
		view.getNode(index + 1)
				? Ext.ComponentMgr.get('next_btn').show()
				: Ext.ComponentMgr.get('next_btn').hide();

		// change selection
		Ext.each(view.getSelectedNodes(), function(e) {
					view.deselect(e);
				}, this);
		view.select(index);

		if (cfg.id)
			divo.publish("Ext.ux.DataView.LightBox.NodeSelect" + cfg.id, {
						sender : cfg.id,
						index : index,
						view : view
					})

		Ext.get('divo-lightbox-image').dom.src = rec.data.url;
		win.center();
	}

	/**
	 * the action to show the previous image
	 * 
	 * @private
	 * @return {void}
	 */
	prevAction = function() {
		index = index - 1;
		rec = view.getRecord(view.getNode(index));
		loadImage();
	}

	/**
	 * the action to show the next image
	 * 
	 * @private
	 * @return {void}
	 */
	nextAction = function() {
		index = index + 1;
		rec = view.getRecord(view.getNode(index));
		loadImage();
	}

	/**
	 * generate the LighBox Window on the fly
	 * 
	 * @private
	 * @param {int}
	 *            ind
	 * @return {void}
	 */
	showWindow = function() {
		var config = { 
			modal : true,
			hideBorders : true,
			border : false,
			layout : 'fit',
			resizable : false,
			draggable : true,
			bodyBorder : false,
			//autoScroll : true,
			//maximizable : true,最大化后下方多出一横条
			title : rec ? rec.data.name + " [" + (index + 1) + " of "
					+ view.store.getCount() + "]" : '',
			items : [{
				autoScroll : true,
			    html : "<img id='divo-lightbox-image' src='"+(rec ? rec.data.url : '')+"'/>"
			}],
			bbar : new Ext.Toolbar({
						cls : 'go-paging-tb',
						items : [{
									xtype : 'tbbutton',
									icon : cfg.prevImage,
									iconCls : 'blist',
									id : 'prev_btn',
									text : "<span>上一张&nbsp;&nbsp;</span>",
									hidden : view.getNode(index - 1)
											? false
											: true,
									scope : this,
									handler : prevAction
								}, {
									xtype : 'tbfill'
								}, {
									xtype : 'tbbutton',
									id : 'next_btn',
									text : "<span>下一张&nbsp;&nbsp;</span>",
									iconCls : 'blist',
									icon : cfg.nextImage,
									scope : this,
									hidden : view.getNode(index + 1)
											? false
											: true,
									handler : nextAction
								}]
					}),
			keys : [{
						key : Ext.EventObject.LEFT,
						fn : prevAction,
						scope : this
					}, {
						key : Ext.EventObject.RIGHT,
						fn : nextAction,
						scope : this
					}],
			listeners : {
				"render" : function() {
					this.setSize(Ext.getBody().getSize().width - 100, Ext.getBody().getSize().height - 100);
				},
				scope: this
			}
		};

		win = new Ext.Window(config);
		win.show();
	};
};;/**
 * 附件面板基类
 */
divo.panel.AttachmentBasePanel = Ext.extend(Ext.Panel, {
	adding : false,
	initComponent : function() {
		this.attachmentListId = this.myId('list')
		this.uploadedAttachmentListId = this.myId('list-uploaded')

		Ext.apply(this, {
			bodyStyle : "padding:5px;",
			border : false,
			items : [{
				layout : "table",
				defaults : {
					border : false
				},
				border : false,
				layoutConfig : {
					columns : 2
				},
				items : [{
					html : "<span class='common-text'>附件:&nbsp;&nbsp;&nbsp;&nbsp;</span>"
				}, this.readOnly?{html:""}:{
					items : [new Ext.Button({
						handler : this.showAttachmentDialog,
						text : "上传",
						scope : this
					})]
				}, {
					html : ""
				}, {
					html : "<div class='common-text' id='"
							+ this.uploadedAttachmentListId + "'></div><div class='common-text' id='"
							+ this.attachmentListId + "'></div>"
				}]
			}]
		})
		
		divo.panel.AttachmentBasePanel.superclass.initComponent.call(this)
	},
	afterRender : function() {
		divo.panel.AttachmentBasePanel.superclass.afterRender.call(this)
		
		var f = function() {
		if (!this.adding)
		    this.renderUploadedFiles()
		}
		f.defer(100,this)
	},
	showAttachmentDialog : function() {
		if (!this.uploadDialog) {
			this.uploadDialog = new Ext.ux.UploadDialog.Dialog({
			  url: this.getUploadUrl()+"?auth="+Ext.Ajax.defaultHeaders.Authorization,
			  reset_on_hide: false,
			  allow_close_on_upload: false,
			  upload_autostart: true
		    })
		    this.uploadDialog.on('uploadsuccess',this.onUploadSuccess,this) 
		    this.uploadDialog.on('fileremove',this.onUploadFileRemove,this) 
		    this.uploadDialog.on('resetqueue',this.onUploadFileRemoveAll,this) 
		}
		this.uploadDialog.show()
	},
	onUploadSuccess : function(o,fileName,resp) {
	    if (!resp.success) return
	    
		if (!this.uploadFiles) {
			this.uploadFiles = {}
		}
		this.uploadFiles[resp.fileName] = fileName
		this.showAttacheFiles()
	},
	onUploadFileRemove : function(o,fileName) {
		for (var obj in this.uploadFiles) {
			if (this.uploadFiles[obj] == fileName)
			    delete this.uploadFiles[obj]
		}
		this.showAttacheFiles()
	},
	onUploadFileRemoveAll : function() {
		this.uploadFiles = {}
		this.showAttacheFiles("")
	},
	showAttacheFiles : function(c) {
		var listEl = Ext.get(this.attachmentListId)
		if (c!=undefined) {
			listEl.dom.innerHTML = c
			return
		}
		var html = "<ul>"
		for (var obj in this.uploadFiles) {
			html += "<li>" + this.uploadFiles[obj]
		}
		html += "</ul>"
		listEl.dom.innerHTML = html
	},
	beforeDestroy : function() {
		if (this.uploadDialog)
			Ext.destroy(this.uploadDialog)
		divo.panel.AttachmentBasePanel.superclass.beforeDestroy.apply(this,arguments)
	},
	//public
	getAttachments : function() {
		var data = ""
		if (this.uploadedFiles) {
			for (var obj in this.uploadedFiles) {
				data += obj+","
			}
		}
		if (this.uploadFiles) {
			for (var obj in this.uploadFiles) {
				data += obj+","
			}
		}
		return data?data.substr(0,data.length-1):""
	},
	//public （仅新建时用）
	clearContent : function(code) {
		this.uploadFiles = null
		this.uploadDialog && Ext.destroy(this.uploadDialog)
		this.uploadDialog = null
		this.showAttacheFiles("")
	},
	//---- 以下为修改时用 -------------
	loadUploadedFiles : function() {
		this.uploadedFiles = {}
		this.uploadedFileIds = {}
		
		Ext.Ajax.request({
			scope : this,
			url : this.getAttachmentListUrl(),
			async : false,
			method : 'GET',
			success : function(response, options) {
				var resp = Ext.decode(response.responseText)
				if (resp.totalCount>0) {
					for (var i = 0; i <resp.totalCount; i++) {
						var id = resp.rows[i].id
						var fn = resp.rows[i].client_file_name
						this.uploadedFiles[resp.rows[i].file_name+"|"+fn] = fn
						this.uploadedFileIds[id] = fn
					}
				}
			},
			failure : function(response, options) {
				this.alert(response.responseText)
			}
		})
	},
	showUploadedFiles : function() {
		var listEl = Ext.get(this.uploadedAttachmentListId)
		listEl.dom.innerHTML = ""
		var html = "<ul>"
		
		for (var id in this.uploadedFileIds) {
		    var fn = this.uploadedFileIds[id]
			var url = this.getAttachmentListUrl()+"/"+id+"?auth="+Ext.Ajax.defaultHeaders.Authorization
			html += '<li><a id="track-discussrecords-attachment-file-'+id+'" href="'+url+'" target="_self">'+fn+
			        '</a>&nbsp;&nbsp;&nbsp;&nbsp;'+(this.readOnly?"":
			        '<a id="track-ticket-attachment-'+id+'" class="common-text" href="#">'+
			        '<span style="TEXT-DECORATION: underline;cursor:hand;">删除</span></a>')
		}
		html += "</ul>"
		listEl.dom.innerHTML = html
	},
	canRenderUploadedFiles : function() {
		return Ext.get(this.uploadedAttachmentListId)
	},
	//public
	renderUploadedFiles : function() {
		if (this.uploadDialog) {
			this.uploadDialog.resetQueue()
			this.onUploadFileRemoveAll()
		}	
		
		this.loadUploadedFiles()
		this.showUploadedFiles()
		this.captureUploadedFileDeleteEvent()
	},
	captureUploadedFileDeleteEvent : function() {
		var listEl = Ext.get(this.uploadedAttachmentListId)
		listEl.on({
			click : {
				stopEvent : false,
				delegate : 'a',
				scope : this,
				fn : function(e, target) {
					var id = target.id
					if (id.indexOf('-file-') > 0)
					   return 
					var attacheId = id.split('-')[3]   
					this.deleteUploadedFile(attacheId)
				}
			}
		})
	},
	deleteUploadedFile : function(id) {
		var fn = ""
		for (var obj in this.uploadedFileIds) {
			if (obj == id)
			    fn = this.uploadedFileIds[obj]
		}
		for (var obj in this.uploadedFiles) {
			if (this.uploadedFiles[obj] == fn) {
			    delete this.uploadedFiles[obj]
			    delete this.uploadedFileIds[id]
			    break
			}    
		}
		this.showUploadedFiles()
	},
	//子类需要重写
	getAttachmentListUrl : function() {
		return ""
	},
	//子类需要重写
	getUploadUrl : function() {
		return ""
	}
	
})
// EOP

;/**
 * SWFUpload: http://www.swfupload.org, http://swfupload.googlecode.com
 *
 * mmSWFUpload 1.0: Flash upload dialog - http://profandesign.se/swfupload/,  http://www.vinterwebb.se/
 *
 * SWFUpload is (c) 2006-2007 Lars Huring, Olov Nilz�n and Mammon Media and is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * SWFUpload 2 is (c) 2007-2008 Jake Roberts and is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 */


/* ******************* */
/* Constructor & Init  */
/* ******************* */
var SWFUpload;

if (SWFUpload == undefined) {
	SWFUpload = function (settings) {
		this.initSWFUpload(settings);
	};
}

SWFUpload.prototype.initSWFUpload = function (settings) {
	try {
		this.customSettings = {};	// A container where developers can place their own settings associated with this instance.
		this.settings = settings;
		this.eventQueue = [];
		this.movieName = "SWFUpload_" + SWFUpload.movieCount++;
		this.movieElement = null;


		// Setup global control tracking
		SWFUpload.instances[this.movieName] = this;

		// Load the settings.  Load the Flash movie.
		this.initSettings();
		this.loadFlash();
		this.displayDebugInfo();
	} catch (ex) {
		delete SWFUpload.instances[this.movieName];
		throw ex;
	}
};

/* *************** */
/* Static Members  */
/* *************** */
SWFUpload.instances = {};
SWFUpload.movieCount = 0;
SWFUpload.version = "2.2.0 Beta 3";
SWFUpload.QUEUE_ERROR = {
	QUEUE_LIMIT_EXCEEDED	  		: -100,
	FILE_EXCEEDS_SIZE_LIMIT  		: -110,
	ZERO_BYTE_FILE			  		: -120,
	INVALID_FILETYPE		  		: -130
};
SWFUpload.UPLOAD_ERROR = {
	HTTP_ERROR				  		: -200,
	MISSING_UPLOAD_URL	      		: -210,
	IO_ERROR				  		: -220,
	SECURITY_ERROR			  		: -230,
	UPLOAD_LIMIT_EXCEEDED	  		: -240,
	UPLOAD_FAILED			  		: -250,
	SPECIFIED_FILE_ID_NOT_FOUND		: -260,
	FILE_VALIDATION_FAILED	  		: -270,
	FILE_CANCELLED			  		: -280,
	UPLOAD_STOPPED					: -290
};
SWFUpload.FILE_STATUS = {
	QUEUED		 : -1,
	IN_PROGRESS	 : -2,
	ERROR		 : -3,
	COMPLETE	 : -4,
	CANCELLED	 : -5
};
SWFUpload.BUTTON_ACTION = {
	SELECT_FILE  : -100,
	SELECT_FILES : -110,
	START_UPLOAD : -120
};
SWFUpload.CURSOR = {
	ARROW : -1,
	HAND : -2
};
SWFUpload.WINDOW_MODE = {
	WINDOW : "window",
	TRANSPARENT : "transparent",
	OPAQUE : "opaque"
};

/* ******************** */
/* Instance Members  */
/* ******************** */

// Private: initSettings ensures that all the
// settings are set, getting a default value if one was not assigned.
SWFUpload.prototype.initSettings = function () {
	this.ensureDefault = function (settingName, defaultValue) {
		this.settings[settingName] = (this.settings[settingName] == undefined) ? defaultValue : this.settings[settingName];
	};
	
	// Upload backend settings
	this.ensureDefault("upload_url", "");
	this.ensureDefault("file_post_name", "Filedata");
	this.ensureDefault("post_params", {});
	this.ensureDefault("use_query_string", false);
	this.ensureDefault("requeue_on_error", false);
	this.ensureDefault("http_success", []);
	
	// File Settings
	this.ensureDefault("file_types", "*.*");
	this.ensureDefault("file_types_description", "All Files");
	this.ensureDefault("file_size_limit", 0);	// Default zero means "unlimited"
	this.ensureDefault("file_upload_limit", 0);
	this.ensureDefault("file_queue_limit", 0);

	// Flash Settings
	this.ensureDefault("flash_url", "swfupload.swf");
	this.ensureDefault("prevent_swf_caching", true);
	
	// Button Settings
	this.ensureDefault("button_image_url", "");
	this.ensureDefault("button_width", 1);
	this.ensureDefault("button_height", 1);
	this.ensureDefault("button_text", "");
	this.ensureDefault("button_text_style", "color: #000000; font-size: 16pt;");
	this.ensureDefault("button_text_top_padding", 0);
	this.ensureDefault("button_text_left_padding", 0);
	this.ensureDefault("button_action", SWFUpload.BUTTON_ACTION.SELECT_FILES);
	this.ensureDefault("button_disabled", false);
	this.ensureDefault("button_placeholder_id", null);
	this.ensureDefault("button_cursor", SWFUpload.CURSOR.ARROW);
	this.ensureDefault("button_window_mode", SWFUpload.WINDOW_MODE.WINDOW);
	
	// Debug Settings
	this.ensureDefault("debug", false);
	this.settings.debug_enabled = this.settings.debug;	// Here to maintain v2 API
	
	// Event Handlers
	this.settings.return_upload_start_handler = this.returnUploadStart;
	this.ensureDefault("swfupload_loaded_handler", null);
	this.ensureDefault("file_dialog_start_handler", null);
	this.ensureDefault("file_queued_handler", null);
	this.ensureDefault("file_queue_error_handler", null);
	this.ensureDefault("file_dialog_complete_handler", null);
	
	this.ensureDefault("upload_start_handler", null);
	this.ensureDefault("upload_progress_handler", null);
	this.ensureDefault("upload_error_handler", null);
	this.ensureDefault("upload_success_handler", null);
	this.ensureDefault("upload_complete_handler", null);
	
	this.ensureDefault("debug_handler", this.debugMessage);

	this.ensureDefault("custom_settings", {});

	// Other settings
	this.customSettings = this.settings.custom_settings;
	
	// Update the flash url if needed
	if (this.settings.prevent_swf_caching) {
		this.settings.flash_url = this.settings.flash_url + "?swfuploadrnd=" + Math.floor(Math.random() * 999999999);
	}
	
	delete this.ensureDefault;
};

SWFUpload.prototype.loadFlash = function () {
	if (this.settings.button_placeholder_id !== "") {
		this.replaceWithFlash();
	} else {
		this.appendFlash();
	}
};

// Private: appendFlash gets the HTML tag for the Flash
// It then appends the flash to the body
SWFUpload.prototype.appendFlash = function () {
	var targetElement, container;

	// Make sure an element with the ID we are going to use doesn't already exist
	if (document.getElementById(this.movieName) !== null) {
		throw "ID " + this.movieName + " is already in use. The Flash Object could not be added";
	}

	// Get the body tag where we will be adding the flash movie
	targetElement = document.getElementsByTagName("body")[0];

	if (targetElement == undefined) {
		throw "Could not find the 'body' element.";
	}

	// Append the container and load the flash
	container = document.createElement("div");
	container.style.width = "1px";
	container.style.height = "1px";
	container.style.overflow = "hidden";

	targetElement.appendChild(container);
	container.innerHTML = this.getFlashHTML();	// Using innerHTML is non-standard but the only sensible way to dynamically add Flash in IE (and maybe other browsers)

	// Fix IE Flash/Form bug
	if (window[this.movieName] == undefined) {
		window[this.movieName] = this.getMovieElement();
	}
	
	
};

// Private: replaceWithFlash replaces the button_placeholder element with the flash movie.
SWFUpload.prototype.replaceWithFlash = function () {
	var targetElement, tempParent;

	// Make sure an element with the ID we are going to use doesn't already exist
	if (document.getElementById(this.movieName) !== null) {
		throw "ID " + this.movieName + " is already in use. The Flash Object could not be added";
	}

	// Get the element where we will be placing the flash movie
	targetElement = document.getElementById(this.settings.button_placeholder_id);

	if (targetElement == undefined) {
		throw "Could not find the placeholder element.";
	}

	// Append the container and load the flash
	tempParent = document.createElement("div");
	tempParent.innerHTML = this.getFlashHTML();	// Using innerHTML is non-standard but the only sensible way to dynamically add Flash in IE (and maybe other browsers)
	targetElement.parentNode.replaceChild(tempParent.firstChild, targetElement);

	// Fix IE Flash/Form bug
	if (window[this.movieName] == undefined) {
		window[this.movieName] = this.getMovieElement();
	}
	
};

// Private: getFlashHTML generates the object tag needed to embed the flash in to the document
SWFUpload.prototype.getFlashHTML = function () {
	// Flash Satay object syntax: http://www.alistapart.com/articles/flashsatay
	return ['<object id="', this.movieName, '" type="application/x-shockwave-flash" data="', this.settings.flash_url, '" width="', this.settings.button_width, '" height="', this.settings.button_height, '" class="swfupload">',
				'<param name="wmode" value="', this.settings.button_window_mode , '" />',
				'<param name="movie" value="', this.settings.flash_url, '" />',
				'<param name="quality" value="high" />',
				'<param name="menu" value="false" />',
				'<param name="allowScriptAccess" value="always" />',
				'<param name="flashvars" value="' + this.getFlashVars() + '" />',
				'</object>'].join("");
};

// Private: getFlashVars builds the parameter string that will be passed
// to flash in the flashvars param.
SWFUpload.prototype.getFlashVars = function () {
	// Build a string from the post param object
	var paramString = this.buildParamString();
	var httpSuccessString = this.settings.http_success.join(",");
	
	// Build the parameter string
	return ["movieName=", encodeURIComponent(this.movieName),
			"&amp;uploadURL=", encodeURIComponent(this.settings.upload_url),
			"&amp;useQueryString=", encodeURIComponent(this.settings.use_query_string),
			"&amp;requeueOnError=", encodeURIComponent(this.settings.requeue_on_error),
			"&amp;httpSuccess=", encodeURIComponent(httpSuccessString),
			"&amp;params=", encodeURIComponent(paramString),
			"&amp;filePostName=", encodeURIComponent(this.settings.file_post_name),
			"&amp;fileTypes=", encodeURIComponent(this.settings.file_types),
			"&amp;fileTypesDescription=", encodeURIComponent(this.settings.file_types_description),
			"&amp;fileSizeLimit=", encodeURIComponent(this.settings.file_size_limit),
			"&amp;fileUploadLimit=", encodeURIComponent(this.settings.file_upload_limit),
			"&amp;fileQueueLimit=", encodeURIComponent(this.settings.file_queue_limit),
			"&amp;debugEnabled=", encodeURIComponent(this.settings.debug_enabled),
			"&amp;buttonImageURL=", encodeURIComponent(this.settings.button_image_url),
			"&amp;buttonWidth=", encodeURIComponent(this.settings.button_width),
			"&amp;buttonHeight=", encodeURIComponent(this.settings.button_height),
			"&amp;buttonText=", encodeURIComponent(this.settings.button_text),
			"&amp;buttonTextTopPadding=", encodeURIComponent(this.settings.button_text_top_padding),
			"&amp;buttonTextLeftPadding=", encodeURIComponent(this.settings.button_text_left_padding),
			"&amp;buttonTextStyle=", encodeURIComponent(this.settings.button_text_style),
			"&amp;buttonAction=", encodeURIComponent(this.settings.button_action),
			"&amp;buttonDisabled=", encodeURIComponent(this.settings.button_disabled),
			"&amp;buttonCursor=", encodeURIComponent(this.settings.button_cursor)
		].join("");
};

// Public: getMovieElement retrieves the DOM reference to the Flash element added by SWFUpload
// The element is cached after the first lookup
SWFUpload.prototype.getMovieElement = function () {
	if (this.movieElement == undefined) {
		this.movieElement = document.getElementById(this.movieName);
	}

	if (this.movieElement === null) {
		throw "Could not find Flash element";
	}
	
	return this.movieElement;
};

// Private: buildParamString takes the name/value pairs in the post_params setting object
// and joins them up in to a string formatted "name=value&amp;name=value"
SWFUpload.prototype.buildParamString = function () {
	var postParams = this.settings.post_params; 
	var paramStringPairs = [];

	if (typeof(postParams) === "object") {
		for (var name in postParams) {
			if (postParams.hasOwnProperty(name)) {
				paramStringPairs.push(encodeURIComponent(name.toString()) + "=" + encodeURIComponent(postParams[name].toString()));
			}
		}
	}

	return paramStringPairs.join("&amp;");
};

// Public: Used to remove a SWFUpload instance from the page. This method strives to remove
// all references to the SWF, and other objects so memory is properly freed.
// Returns true if everything was destroyed. Returns a false if a failure occurs leaving SWFUpload in an inconsistant state.
// Credits: Major improvements provided by steffen
SWFUpload.prototype.destroy = function () {
	try {
		// Make sure Flash is done before we try to remove it
		this.cancelUpload(null, false);
		
		// Remove the SWFUpload DOM nodes
		var movieElement = null;
		movieElement = this.getMovieElement();
		
		if (movieElement) {
			// Loop through all the movie's properties and remove all function references (DOM/JS IE 6/7 memory leak workaround)
			for (var i in movieElement) {
				try {
					if (typeof(movieElement[i]) === "function") {
						movieElement[i] = null;
					}
				} catch (ex1) {}
			}

			// Remove the Movie Element from the page
			try {
				movieElement.parentNode.removeChild(movieElement);
			} catch (ex) {}
		}
		
		
		// Remove IE form fix reference
		window[this.movieName] = null;

		// Destroy other references
		SWFUpload.instances[this.movieName] = null;
		delete SWFUpload.instances[this.movieName];

		this.movieElement = null;
		this.settings = null;
		this.customSettings = null;
		this.eventQueue = null;
		this.movieName = null;
		
		
		return true;
	} catch (ex1) {
		return false;
	}
};

// Public: displayDebugInfo prints out settings and configuration
// information about this SWFUpload instance.
// This function (and any references to it) can be deleted when placing
// SWFUpload in production.
SWFUpload.prototype.displayDebugInfo = function () {
	this.debug(
		[
			"---SWFUpload Instance Info---\n",
			"Version: ", SWFUpload.version, "\n",
			"Movie Name: ", this.movieName, "\n",
			"Settings:\n",
			"\t", "upload_url:               ", this.settings.upload_url, "\n",
			"\t", "flash_url:                ", this.settings.flash_url, "\n",
			"\t", "use_query_string:         ", this.settings.use_query_string.toString(), "\n",
			"\t", "requeue_on_error:         ", this.settings.requeue_on_error.toString(), "\n",
			"\t", "http_success:             ", this.settings.http_success.join(", "), "\n",
			"\t", "file_post_name:           ", this.settings.file_post_name, "\n",
			"\t", "post_params:              ", this.settings.post_params.toString(), "\n",
			"\t", "file_types:               ", this.settings.file_types, "\n",
			"\t", "file_types_description:   ", this.settings.file_types_description, "\n",
			"\t", "file_size_limit:          ", this.settings.file_size_limit, "\n",
			"\t", "file_upload_limit:        ", this.settings.file_upload_limit, "\n",
			"\t", "file_queue_limit:         ", this.settings.file_queue_limit, "\n",
			"\t", "debug:                    ", this.settings.debug.toString(), "\n",

			"\t", "prevent_swf_caching:      ", this.settings.prevent_swf_caching.toString(), "\n",

			"\t", "button_placeholder_id:    ", this.settings.button_placeholder_id.toString(), "\n",
			"\t", "button_image_url:         ", this.settings.button_image_url.toString(), "\n",
			"\t", "button_width:             ", this.settings.button_width.toString(), "\n",
			"\t", "button_height:            ", this.settings.button_height.toString(), "\n",
			"\t", "button_text:              ", this.settings.button_text.toString(), "\n",
			"\t", "button_text_style:        ", this.settings.button_text_style.toString(), "\n",
			"\t", "button_text_top_padding:  ", this.settings.button_text_top_padding.toString(), "\n",
			"\t", "button_text_left_padding: ", this.settings.button_text_left_padding.toString(), "\n",
			"\t", "button_action:            ", this.settings.button_action.toString(), "\n",
			"\t", "button_disabled:          ", this.settings.button_disabled.toString(), "\n",

			"\t", "custom_settings:          ", this.settings.custom_settings.toString(), "\n",
			"Event Handlers:\n",
			"\t", "swfupload_loaded_handler assigned:  ", (typeof this.settings.swfupload_loaded_handler === "function").toString(), "\n",
			"\t", "file_dialog_start_handler assigned: ", (typeof this.settings.file_dialog_start_handler === "function").toString(), "\n",
			"\t", "file_queued_handler assigned:       ", (typeof this.settings.file_queued_handler === "function").toString(), "\n",
			"\t", "file_queue_error_handler assigned:  ", (typeof this.settings.file_queue_error_handler === "function").toString(), "\n",
			"\t", "upload_start_handler assigned:      ", (typeof this.settings.upload_start_handler === "function").toString(), "\n",
			"\t", "upload_progress_handler assigned:   ", (typeof this.settings.upload_progress_handler === "function").toString(), "\n",
			"\t", "upload_error_handler assigned:      ", (typeof this.settings.upload_error_handler === "function").toString(), "\n",
			"\t", "upload_success_handler assigned:    ", (typeof this.settings.upload_success_handler === "function").toString(), "\n",
			"\t", "upload_complete_handler assigned:   ", (typeof this.settings.upload_complete_handler === "function").toString(), "\n",
			"\t", "debug_handler assigned:             ", (typeof this.settings.debug_handler === "function").toString(), "\n"
		].join("")
	);
};

/* Note: addSetting and getSetting are no longer used by SWFUpload but are included
	the maintain v2 API compatibility
*/
// Public: (Deprecated) addSetting adds a setting value. If the value given is undefined or null then the default_value is used.
SWFUpload.prototype.addSetting = function (name, value, default_value) {
    if (value == undefined) {
        return (this.settings[name] = default_value);
    } else {
        return (this.settings[name] = value);
	}
};

// Public: (Deprecated) getSetting gets a setting. Returns an empty string if the setting was not found.
SWFUpload.prototype.getSetting = function (name) {
    if (this.settings[name] != undefined) {
        return this.settings[name];
	}

    return "";
};



// Private: callFlash handles function calls made to the Flash element.
// Calls are made with a setTimeout for some functions to work around
// bugs in the ExternalInterface library.
SWFUpload.prototype.callFlash = function (functionName, argumentArray) {
	argumentArray = argumentArray || [];
	
	var movieElement = this.getMovieElement();
	var returnValue, returnString;

	// Flash's method if calling ExternalInterface methods (code adapted from MooTools).
	try {
		returnString = movieElement.CallFunction('<invoke name="' + functionName + '" returntype="javascript">' + __flash__argumentsToXML(argumentArray, 0) + '</invoke>');
		returnValue = eval(returnString);
	} catch (ex) {
		throw "Call to " + functionName + " failed";
	}
	
	// Unescape file post param values
	if (returnValue != undefined && typeof returnValue.post === "object") {
		returnValue = this.unescapeFilePostParams(returnValue);
	}

	return returnValue;
};


/* *****************************
	-- Flash control methods --
	Your UI should use these
	to operate SWFUpload
   ***************************** */

// WARNING: this function does not work in Flash Player 10
// Public: selectFile causes a File Selection Dialog window to appear.  This
// dialog only allows 1 file to be selected.
SWFUpload.prototype.selectFile = function () {
	this.callFlash("SelectFile");
};

// WARNING: this function does not work in Flash Player 10
// Public: selectFiles causes a File Selection Dialog window to appear/ This
// dialog allows the user to select any number of files
// Flash Bug Warning: Flash limits the number of selectable files based on the combined length of the file names.
// If the selection name length is too long the dialog will fail in an unpredictable manner.  There is no work-around
// for this bug.
SWFUpload.prototype.selectFiles = function () {
	this.callFlash("SelectFiles");
};


// Public: startUpload starts uploading the first file in the queue unless
// the optional parameter 'fileID' specifies the ID 
SWFUpload.prototype.startUpload = function (fileID) {
	this.callFlash("StartUpload", [fileID]);
};

// Public: cancelUpload cancels any queued file.  The fileID parameter may be the file ID or index.
// If you do not specify a fileID the current uploading file or first file in the queue is cancelled.
// If you do not want the uploadError event to trigger you can specify false for the triggerErrorEvent parameter.
SWFUpload.prototype.cancelUpload = function (fileID, triggerErrorEvent) {
	if (triggerErrorEvent !== false) {
		triggerErrorEvent = true;
	}
	this.callFlash("CancelUpload", [fileID, triggerErrorEvent]);
};

// Public: stopUpload stops the current upload and requeues the file at the beginning of the queue.
// If nothing is currently uploading then nothing happens.
SWFUpload.prototype.stopUpload = function () {
	this.callFlash("StopUpload");
};

/* ************************
 * Settings methods
 *   These methods change the SWFUpload settings.
 *   SWFUpload settings should not be changed directly on the settings object
 *   since many of the settings need to be passed to Flash in order to take
 *   effect.
 * *********************** */

// Public: getStats gets the file statistics object.
SWFUpload.prototype.getStats = function () {
	return this.callFlash("GetStats");
};

// Public: setStats changes the SWFUpload statistics.  You shouldn't need to 
// change the statistics but you can.  Changing the statistics does not
// affect SWFUpload accept for the successful_uploads count which is used
// by the upload_limit setting to determine how many files the user may upload.
SWFUpload.prototype.setStats = function (statsObject) {
	this.callFlash("SetStats", [statsObject]);
};

// Public: getFile retrieves a File object by ID or Index.  If the file is
// not found then 'null' is returned.
SWFUpload.prototype.getFile = function (fileID) {
	if (typeof(fileID) === "number") {
		return this.callFlash("GetFileByIndex", [fileID]);
	} else {
		return this.callFlash("GetFile", [fileID]);
	}
};

// Public: addFileParam sets a name/value pair that will be posted with the
// file specified by the Files ID.  If the name already exists then the
// exiting value will be overwritten.
SWFUpload.prototype.addFileParam = function (fileID, name, value) {
	return this.callFlash("AddFileParam", [fileID, name, value]);
};

// Public: removeFileParam removes a previously set (by addFileParam) name/value
// pair from the specified file.
SWFUpload.prototype.removeFileParam = function (fileID, name) {
	this.callFlash("RemoveFileParam", [fileID, name]);
};

// Public: setUploadUrl changes the upload_url setting.
SWFUpload.prototype.setUploadURL = function (url) {
	this.settings.upload_url = url.toString();
	this.callFlash("SetUploadURL", [url]);
};

// Public: setPostParams changes the post_params setting
SWFUpload.prototype.setPostParams = function (paramsObject) {
	this.settings.post_params = paramsObject;
	this.callFlash("SetPostParams", [paramsObject]);
};

// Public: addPostParam adds post name/value pair.  Each name can have only one value.
SWFUpload.prototype.addPostParam = function (name, value) {
	this.settings.post_params[name] = value;
	this.callFlash("SetPostParams", [this.settings.post_params]);
};

// Public: removePostParam deletes post name/value pair.
SWFUpload.prototype.removePostParam = function (name) {
	delete this.settings.post_params[name];
	this.callFlash("SetPostParams", [this.settings.post_params]);
};

// Public: setFileTypes changes the file_types setting and the file_types_description setting
SWFUpload.prototype.setFileTypes = function (types, description) {
	this.settings.file_types = types;
	this.settings.file_types_description = description;
	this.callFlash("SetFileTypes", [types, description]);
};

// Public: setFileSizeLimit changes the file_size_limit setting
SWFUpload.prototype.setFileSizeLimit = function (fileSizeLimit) {
	this.settings.file_size_limit = fileSizeLimit;
	this.callFlash("SetFileSizeLimit", [fileSizeLimit]);
};

// Public: setFileUploadLimit changes the file_upload_limit setting
SWFUpload.prototype.setFileUploadLimit = function (fileUploadLimit) {
	this.settings.file_upload_limit = fileUploadLimit;
	this.callFlash("SetFileUploadLimit", [fileUploadLimit]);
};

// Public: setFileQueueLimit changes the file_queue_limit setting
SWFUpload.prototype.setFileQueueLimit = function (fileQueueLimit) {
	this.settings.file_queue_limit = fileQueueLimit;
	this.callFlash("SetFileQueueLimit", [fileQueueLimit]);
};

// Public: setFilePostName changes the file_post_name setting
SWFUpload.prototype.setFilePostName = function (filePostName) {
	this.settings.file_post_name = filePostName;
	this.callFlash("SetFilePostName", [filePostName]);
};

// Public: setUseQueryString changes the use_query_string setting
SWFUpload.prototype.setUseQueryString = function (useQueryString) {
	this.settings.use_query_string = useQueryString;
	this.callFlash("SetUseQueryString", [useQueryString]);
};

// Public: setRequeueOnError changes the requeue_on_error setting
SWFUpload.prototype.setRequeueOnError = function (requeueOnError) {
	this.settings.requeue_on_error = requeueOnError;
	this.callFlash("SetRequeueOnError", [requeueOnError]);
};

// Public: setHTTPSuccess changes the http_success setting
SWFUpload.prototype.setHTTPSuccess = function (http_status_codes) {
	if (typeof http_status_codes === "string") {
		http_status_codes = http_status_codes.replace(" ", "").split(",");
	}
	
	this.settings.http_success = http_status_codes;
	this.callFlash("SetHTTPSuccess", [http_status_codes]);
};


// Public: setDebugEnabled changes the debug_enabled setting
SWFUpload.prototype.setDebugEnabled = function (debugEnabled) {
	this.settings.debug_enabled = debugEnabled;
	this.callFlash("SetDebugEnabled", [debugEnabled]);
};

// Public: setButtonImageURL loads a button image sprite
SWFUpload.prototype.setButtonImageURL = function (buttonImageURL) {
	if (buttonImageURL == undefined) {
		buttonImageURL = "";
	}
	
	this.settings.button_image_url = buttonImageURL;
	this.callFlash("SetButtonImageURL", [buttonImageURL]);
};

// Public: setButtonDimensions resizes the Flash Movie and button
SWFUpload.prototype.setButtonDimensions = function (width, height) {
	this.settings.button_width = width;
	this.settings.button_height = height;
	
	var movie = this.getMovieElement();
	if (movie != undefined) {
		movie.style.width = width + "px";
		movie.style.height = height + "px";
	}
	
	this.callFlash("SetButtonDimensions", [width, height]);
};
// Public: setButtonText Changes the text overlaid on the button
SWFUpload.prototype.setButtonText = function (html) {
	this.settings.button_text = html;
	this.callFlash("SetButtonText", [html]);
};
// Public: setButtonTextPadding changes the top and left padding of the text overlay
SWFUpload.prototype.setButtonTextPadding = function (left, top) {
	this.settings.button_text_top_padding = top;
	this.settings.button_text_left_padding = left;
	this.callFlash("SetButtonTextPadding", [left, top]);
};

// Public: setButtonTextStyle changes the CSS used to style the HTML/Text overlaid on the button
SWFUpload.prototype.setButtonTextStyle = function (css) {
	this.settings.button_text_style = css;
	this.callFlash("SetButtonTextStyle", [css]);
};
// Public: setButtonDisabled disables/enables the button
SWFUpload.prototype.setButtonDisabled = function (isDisabled) {
	this.settings.button_disabled = isDisabled;
	this.callFlash("SetButtonDisabled", [isDisabled]);
};
// Public: setButtonAction sets the action that occurs when the button is clicked
SWFUpload.prototype.setButtonAction = function (buttonAction) {
	this.settings.button_action = buttonAction;
	this.callFlash("SetButtonAction", [buttonAction]);
};

// Public: setButtonCursor changes the mouse cursor displayed when hovering over the button
SWFUpload.prototype.setButtonCursor = function (cursor) {
	this.settings.button_cursor = cursor;
	this.callFlash("SetButtonCursor", [cursor]);
};

/* *******************************
	Flash Event Interfaces
	These functions are used by Flash to trigger the various
	events.
	
	All these functions a Private.
	
	Because the ExternalInterface library is buggy the event calls
	are added to a queue and the queue then executed by a setTimeout.
	This ensures that events are executed in a determinate order and that
	the ExternalInterface bugs are avoided.
******************************* */

SWFUpload.prototype.queueEvent = function (handlerName, argumentArray) {
	// Warning: Don't call this.debug inside here or you'll create an infinite loop
	
	if (argumentArray == undefined) {
		argumentArray = [];
	} else if (!(argumentArray instanceof Array)) {
		argumentArray = [argumentArray];
	}
	
	var self = this;
	if (typeof this.settings[handlerName] === "function") {
		// Queue the event
		this.eventQueue.push(function () {
			this.settings[handlerName].apply(this, argumentArray);
		});
		
		// Execute the next queued event
		setTimeout(function () {
			self.executeNextEvent();
		}, 0);
		
	} else if (this.settings[handlerName] !== null) {
		throw "Event handler " + handlerName + " is unknown or is not a function";
	}
};

// Private: Causes the next event in the queue to be executed.  Since events are queued using a setTimeout
// we must queue them in order to garentee that they are executed in order.
SWFUpload.prototype.executeNextEvent = function () {
	// Warning: Don't call this.debug inside here or you'll create an infinite loop

	var  f = this.eventQueue ? this.eventQueue.shift() : null;
	if (typeof(f) === "function") {
		f.apply(this);
	}
};

// Private: unescapeFileParams is part of a workaround for a flash bug where objects passed through ExternalInterface cannot have
// properties that contain characters that are not valid for JavaScript identifiers. To work around this
// the Flash Component escapes the parameter names and we must unescape again before passing them along.
SWFUpload.prototype.unescapeFilePostParams = function (file) {
	var reg = /[$]([0-9a-f]{4})/i;
	var unescapedPost = {};
	var uk;

	if (file != undefined) {
		for (var k in file.post) {
			if (file.post.hasOwnProperty(k)) {
				uk = k;
				var match;
				while ((match = reg.exec(uk)) !== null) {
					uk = uk.replace(match[0], String.fromCharCode(parseInt("0x" + match[1], 16)));
				}
				unescapedPost[uk] = file.post[k];
			}
		}

		file.post = unescapedPost;
	}

	return file;
};

SWFUpload.prototype.flashReady = function () {
	// Check that the movie element is loaded correctly with its ExternalInterface methods defined
	var movieElement = this.getMovieElement();

	// Pro-actively unhook all the Flash functions
	if (typeof(movieElement.CallFunction) === "unknown") { // We only want to do this in IE
		this.debug("Removing Flash functions hooks (this should only run in IE and should prevent memory leaks)");
		for (var key in movieElement) {
			try {
				if (typeof(movieElement[key]) === "function") {
					movieElement[key] = null;
				}
			} catch (ex) {
			}
		}
	}
	
	this.queueEvent("swfupload_loaded_handler");
};


/* This is a chance to do something before the browse window opens */
SWFUpload.prototype.fileDialogStart = function () {
	this.queueEvent("file_dialog_start_handler");
};


/* Called when a file is successfully added to the queue. */
SWFUpload.prototype.fileQueued = function (file) {
	file = this.unescapeFilePostParams(file);
	this.queueEvent("file_queued_handler", file);
};


/* Handle errors that occur when an attempt to queue a file fails. */
SWFUpload.prototype.fileQueueError = function (file, errorCode, message) {
	file = this.unescapeFilePostParams(file);
	this.queueEvent("file_queue_error_handler", [file, errorCode, message]);
};

/* Called after the file dialog has closed and the selected files have been queued.
	You could call startUpload here if you want the queued files to begin uploading immediately. */
SWFUpload.prototype.fileDialogComplete = function (numFilesSelected, numFilesQueued) {
	this.queueEvent("file_dialog_complete_handler", [numFilesSelected, numFilesQueued]);
};

SWFUpload.prototype.uploadStart = function (file) {
	file = this.unescapeFilePostParams(file);
	this.queueEvent("return_upload_start_handler", file);
};

SWFUpload.prototype.returnUploadStart = function (file) {
	var returnValue;
	if (typeof this.settings.upload_start_handler === "function") {
		file = this.unescapeFilePostParams(file);
		returnValue = this.settings.upload_start_handler.call(this, file);
	} else if (this.settings.upload_start_handler != undefined) {
		throw "upload_start_handler must be a function";
	}

	// Convert undefined to true so if nothing is returned from the upload_start_handler it is
	// interpretted as 'true'.
	if (returnValue === undefined) {
		returnValue = true;
	}
	
	returnValue = !!returnValue;
	
	this.callFlash("ReturnUploadStart", [returnValue]);
};



SWFUpload.prototype.uploadProgress = function (file, bytesComplete, bytesTotal) {
	file = this.unescapeFilePostParams(file);
	this.queueEvent("upload_progress_handler", [file, bytesComplete, bytesTotal]);
};

SWFUpload.prototype.uploadError = function (file, errorCode, message) {
	file = this.unescapeFilePostParams(file);
	this.queueEvent("upload_error_handler", [file, errorCode, message]);
};

SWFUpload.prototype.uploadSuccess = function (file, serverData) {
	file = this.unescapeFilePostParams(file);
	this.queueEvent("upload_success_handler", [file, serverData]);
};

SWFUpload.prototype.uploadComplete = function (file) {
	file = this.unescapeFilePostParams(file);
	this.queueEvent("upload_complete_handler", file);
};

/* Called by SWFUpload JavaScript and Flash functions when debug is enabled. By default it writes messages to the
   internal debug console.  You can override this event and have messages written where you want. */
SWFUpload.prototype.debug = function (message) {
	this.queueEvent("debug_handler", message);
};


/* **********************************
	Debug Console
	The debug console is a self contained, in page location
	for debug message to be sent.  The Debug Console adds
	itself to the body if necessary.

	The console is automatically scrolled as messages appear.
	
	If you are using your own debug handler or when you deploy to production and
	have debug disabled you can remove these functions to reduce the file size
	and complexity.
********************************** */
   
// Private: debugMessage is the default debug_handler.  If you want to print debug messages
// call the debug() function.  When overriding the function your own function should
// check to see if the debug setting is true before outputting debug information.
SWFUpload.prototype.debugMessage = function (message) {
	if (this.settings.debug) {
		var exceptionMessage, exceptionValues = [];

		// Check for an exception object and print it nicely
		if (typeof message === "object" && typeof message.name === "string" && typeof message.message === "string") {
			for (var key in message) {
				if (message.hasOwnProperty(key)) {
					exceptionValues.push(key + ": " + message[key]);
				}
			}
			exceptionMessage = exceptionValues.join("\n") || "";
			exceptionValues = exceptionMessage.split("\n");
			exceptionMessage = "EXCEPTION: " + exceptionValues.join("\nEXCEPTION: ");
			SWFUpload.Console.writeLine(exceptionMessage);
		} else {
			SWFUpload.Console.writeLine(message);
		}
	}
};

SWFUpload.Console = {};
SWFUpload.Console.writeLine = function (message) {
	var console, documentForm;

	try {
		console = document.getElementById("SWFUpload_Console");

		if (!console) {
			documentForm = document.createElement("form");
			document.getElementsByTagName("body")[0].appendChild(documentForm);

			console = document.createElement("textarea");
			console.id = "SWFUpload_Console";
			console.style.fontFamily = "monospace";
			console.setAttribute("wrap", "off");
			console.wrap = "off";
			console.style.overflow = "auto";
			console.style.width = "700px";
			console.style.height = "350px";
			console.style.margin = "5px";
			documentForm.appendChild(console);
		}

		console.value += message + "\n";

		console.scrollTop = console.scrollHeight - console.clientHeight;
	} catch (ex) {
		alert("Exception: " + ex.name + " Message: " + ex.message);
	}
};
;// Create user extension namespace
Ext.namespace('Ext.ux');

/**
 * @class Ext.ux.SwfUploadPanel
 * @extends Ext.grid.GridPanel

 * Makes a Panel to provide the ability to upload multiple files using the SwfUpload flash script.
 *
 * @author Stephan Wentz
 * @author Michael Giddens (Original author)
 * @website http://www.brainbits.net
 * @created 2008-02-26
 * @version 0.5
 * 
 * known_issues 
 *      - Progress bar used hardcoded width. Not sure how to make 100% in bbar
 *      - Panel requires width / height to be set.  Not sure why it will not fit
 *      - when panel is nested sometimes the column model is not always shown to fit until a file is added. Render order issue.
 *      
 * @constructor
 * @param {Object} config The config object
 */
Ext.ux.SwfUploadPanel = Ext.extend(Ext.grid.GridPanel, {
    
    /**
     * @cfg {Object} strings
     * All strings used by Ext.ux.SwfUploadPanel
     */
    strings: {
        text_add: '添加文件',
        text_upload: '上传文件',
        text_cancel: '取消上传',
        text_clear: '清空队列',
        text_progressbar: '<span>进度条</span>',
        text_remove: '删除文件',
        text_remove_sure: '要从队列删除此文件吗?',
        text_error: '失败',
        text_uploading: '正在上传: {0} ({1} / {2})',
        header_filename: '文件名',
        header_size: '大小',
        header_status: '状态',
        status: {
            0: '排队中',
            1: '上传中...',
            2: '上传完毕',
            3: '失败',
            4: '已取消'
        },
        error_queue_exceeded: 'The selected file(s) exceed(s) the maximum number of {0} queued files.',
        error_queue_slots_0: 'There is no slot left',
        error_queue_slots_1: 'There is only one slot left',
        error_queue_slots_2: 'There are only {0} slots left',
        error_size_exceeded: 'The selected files size exceeds the allowed limit of {0}.',
        error_zero_byte_file: 'Zero byte file selected.',
        error_invalid_filetype: 'Invalid filetype selected.',
        error_file_not_found: '文件未找到 404.',
        error_security_error: 'Security Error. Not allowed to post to different url.'
    },
    
    /**
     * @cfg {Boolean} single_select
     * True to allow multiple file selections, false for single file selection.
     * Please note that this doesn't affect the number of allowed files in the queue. 
     * Use the {@link #file_queue_limit} parameter to change the allowed number of files in the queue. 
     */
    single_select: false,
    /**
     * @cfg {Boolean} confirm_delete
     * Show a confirmation box on deletion of queued files.
     */ 
    confirm_delete: true,
    /**
     * @cfg {String} file_types
     * Allowed file types for the File Selection Dialog. Use semi-colon as a seperator for multiple file-types.
     */ 
    file_types: "*.*",                   // Default allow all file types
    /**
     * @cfg {String} file_types
     * A text description that is displayed to the user in the File Browser dialog.
     */ 
    file_types_description: "All Files", // 
    /**
     * @cfg {String} file_size_limit
     * The file_size_limit setting defines the maximum allowed size of a file to be uploaded. 
     * This setting accepts a value and unit. Valid units are B, KB, MB and GB. If the unit is omitted default is KB. 
     * A value of 0 (zero) is interpretted as unlimited.
     */ 
    file_size_limit: "10240",          // Default size limit 10MB
    /**
     * @cfg {String} file_upload_limit
     * Defines the number of files allowed to be uploaded by SWFUpload. 
     * This setting also sets the upper bound of the {@link #file_queue_limit} setting. 
     * The value of 0 (zero) is interpretted as unlimited.
     */ 
    file_upload_limit: "0",              // Default no upload limit
    /**
     * @cfg {String} file_queue_limit
     * Defines the number of unprocessed files allowed to be simultaneously queued.
     * The value of 0 (zero) is interpretted as unlimited.
     */ 
    file_queue_limit: "0",               // Default no queue limit
    /**
     * @cfg {String} file_post_name
     * The file_post_name allows you to set the value name used to post the file.
     */ 
    file_post_name: "Filedata",          // Default name
    /**
     * @cfg {String} flash_url
     * The full, absolute, or relative URL to the Flash Control swf file.
     */ 
    flash_url: "/media/flash/swfupload.swf",       // Default url, relative to the page url
    /**
     * @cfg {Boolean} debug
     * A boolean value that defines whether the debug event handler should be fired.
     */ 
    debug: false,
    
    // standard grid parameters
    autoExpandColumn: 'name',
    enableColumnResize: false,
    enableColumnMove: false,

    // private
    upload_cancelled: false,
        
    // private
    initComponent: function() {
        
        this.addEvents(
            /**
             * @event swfUploadLoaded
             * Fires after the Flash object has been loaded
             * @param {Ext.grid.GridPanel} grid This grid
             */
            'swfUploadLoaded',
            /**
             * @event swfUploadLoaded
             * Fires after a file has been qeueud
             * @param {Ext.grid.GridPanel} grid This grid
             * @param {Object} file The file object that produced the error
             */
            'fileQueued',
            /**
             * @event startUpload
             * Fires before the upload starts
             * @param {Ext.grid.GridPanel} grid This grid
             */
            'startUpload',
            /**
             * @event fileUploadError
             * Fires after an upload has been stopped or cancelled
             * @param {Ext.grid.GridPanel} grid This grid
             * @param {Object} file The file object that produced the error
             * @param {String} code The error code
             * @param {String} message Supplemental error message
             */
            'fileUploadError',
            /**
             * @event fileUploadSuccess
             * Fires after an upload has been successfully uploaded
             * @param {Ext.grid.GridPanel} grid This grid
             * @param {Object} file The file object that has been uploaded
             * @param {Object} data The response data of the upload request
             */
            'fileUploadSuccess',
            /**
             * @event fileUploadComplete
             * Fires after the upload cycle for one file finished
             * @param {Ext.grid.GridPanel} grid This grid
             * @param {Object} file The file object that has been uploaded
             */
            'fileUploadComplete',
            /**
             * @event fileUploadComplete
             * Fires after the upload cycle for all files in the queue finished
             * @param {Ext.grid.GridPanel} grid This grid
             */
            'allUploadsComplete',
            /**
             * @event fileUploadComplete
             * Fires after one or more files have been removed from the queue
             * @param {Ext.grid.GridPanel} grid This grid
             */
            'removeFiles',
            /**
             * @event fileUploadComplete
             * Fires after all files have been removed from the queue
             * @param {Ext.grid.GridPanel} grid This grid
             */
            'removeAllFiles'
        );
        
        this.rec = Ext.data.Record.create([
             {name: 'name'},
             {name: 'size'},
             {name: 'id'},
             {name: 'type'},
             {name: 'creationdate', type: 'date', dateFormat: 'm/d/Y'},
             {name: 'status'}
        ]);
        
        this.store = new Ext.data.Store({
            reader: new Ext.data.JsonReader({
                  id: 'id'
             }, this.rec)
        });
        
        this.columns = [{
            id:'name', 
            header: this.strings.header_filename, 
            dataIndex: 'name'
        },{
            id:'size', 
            header: this.strings.header_size, 
            width: 80, 
            dataIndex: 'size', 
            renderer: this.formatBytes
        },{
            id:'status', 
            header: this.strings.header_status, 
            width: 80, 
            dataIndex: 'status', 
            renderer: this.formatStatus.createDelegate(this)
        }];
        
        this.sm = new Ext.grid.RowSelectionModel({
            singleSelect: this.single_select
        });


        this.progress_bar = new Ext.ProgressBar({
            text: this.strings.text_progressbar
//            width: this.width - 7
        }); 

        this.tbar = [{
            text: this.strings.text_add,
            iconCls: 'SwfUploadPanel_iconAdd',
            xhandler: function() {
                if (this.single_select) {
                    this.suo.selectFile();
                }
                else {
                    this.suo.selectFiles();
                }
            },
            xscope: this
        }, '->', {
            text: this.strings.text_cancel,
            iconCls: 'SwfUploadPanel_iconCancel',
            handler: this.stopUpload,
            scope: this,
            hidden: true
        }, {
            text: this.strings.text_upload,
            iconCls: 'SwfUploadPanel_iconUpload',
            handler: this.startUpload,
            scope: this,
            hidden: true
        }, {
            text: this.strings.text_clear,
            iconCls: 'SwfUploadPanel_iconClear',
            handler: this.removeAllFiles,
            scope: this,
            hidden: false
        }];
        
        this.bbar = [
            this.progress_bar
        ];
        
        this.addListener({
            keypress: {
                fn: function(e) {
                    if (this.confirm_delete) {
                        if(e.getKey() == e.DELETE) {
                            Ext.MessageBox.confirm(this.strings.text_remove,this.strings.text_remove_sure, function(e) {
                                if (e == 'yes') {
                                    this.removeFiles();
                                }
                            }, this);
                        }   
                    } else {
                        this.removeFiles(this);
                    }
                },
                scope: this
            },
            
            // Prevent the default right click to show up in the grid.
            contextmenu: function(e) {
                e.stopEvent();
            },
            
            render: {
                fn: function(){
                    this.resizeProgressBar();
                    
                    this.addBtn = this.getTopToolbar().items.items[0];
					this.cancelBtn = this.getTopToolbar().items.items[2];
                    this.uploadBtn = this.getTopToolbar().items.items[3];
                    this.clearBtn = this.getTopToolbar().items.items[4];
        
                    this.on('resize', this.resizeProgressBar, this);
                },
                scope: this
            }
        });
        

        this.on('render', function() {
            var suoID = Ext.id();
            var em = this.addBtn.el.child('em');
            em.setStyle({
                position: 'relative',
                display: 'block'
            });
            em.createChild({
                tag: 'div',
                id: suoID
            });
            this.suo = new SWFUpload({
                button_placeholder_id: suoID,
                button_width: em.getWidth(),
                button_height: em.getHeight(),
                button_cursor: SWFUpload.CURSOR.HAND,
                button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
                
                upload_url: this.upload_url,
                post_params: this.post_params,
                file_post_name: this.file_post_name,  
                file_size_limit: this.file_size_limit,
                file_queue_limit: this.file_queue_limit,
                file_types: this.file_types,
                file_types_description: this.file_types_description,
                file_upload_limit: this.file_upload_limit,
                flash_url: this.flash_url,   
        
                // Event Handler Settings
                swfupload_loaded_handler: this.swfUploadLoaded.createDelegate(this),
        
                file_dialog_start_handler: this.fileDialogStart.createDelegate(this),
                file_queued_handler: this.fileQueue.createDelegate(this),
                file_queue_error_handler: this.fileQueueError.createDelegate(this),
                file_dialog_complete_handler: this.fileDialogComplete.createDelegate(this),
                
                upload_start_handler: this.uploadStart.createDelegate(this),
                upload_progress_handler: this.uploadProgress.createDelegate(this),
                upload_error_handler: this.uploadError.createDelegate(this), 
                upload_success_handler: this.uploadSuccess.createDelegate(this),
                upload_complete_handler: this.uploadComplete.createDelegate(this),
        
                debug: this.debug,
                debug_handler: this.debugHandler
            });
            
            Ext.get(this.suo.movieName).setStyle({
                position: 'absolute', 
                top: 0,
                left: 0
            });
        }, this);
        
        Ext.ux.SwfUploadPanel.superclass.initComponent.call(this);
    },

    // private
    resizeProgressBar: function() {
        this.progress_bar.setWidth(this.getBottomToolbar().el.getWidth() - 5);
        Ext.fly(this.progress_bar.el.dom.firstChild.firstChild).applyStyles("height: 16px");
    },
    
    /**
     * SWFUpload debug handler
     * @param {Object} line
     */
    debugHandler: function(line) {
        console.log(line);
    },
    
    /**
     * Formats file status
     * @param {Integer} status
     * @return {String}
     */
    formatStatus: function(status) {
        return this.strings.status[status];
    },
    
    /**
     * Formats raw bytes into kB/mB/GB/TB
     * @param {Integer} bytes
     * @return {String}
     */
    formatBytes: function(size) {
        if (!size) {
            size = 0;
        }
        var suffix = ["B", "KB", "MB", "GB"];
        var result = size;
        size = parseInt(size, 10);
        result = size + " " + suffix[0];
        var loop = 0;
        while (size / 1024 > 1) {
            size = size / 1024;
            loop++;
        }
        result = Math.round(size) + " " + suffix[loop];

        return result;

        if(isNaN(bytes)) {
            return ('');
        }

        var unit, val;

        if(bytes < 999) {
            unit = 'B';
            val = (!bytes && this.progressRequestCount >= 1) ? '~' : bytes;
        } else if(bytes < 999999) {
            unit = 'kB';
            val = Math.round(bytes/1000);
        } else if(bytes < 999999999) {
            unit = 'MB';
            val = Math.round(bytes/100000) / 10;
        } else if(bytes < 999999999999) {
            unit = 'GB';
            val = Math.round(bytes/100000000) / 10;
        } else {
            unit = 'TB';
            val = Math.round(bytes/100000000000) / 10;
        }

        return (val + ' ' + unit);
    },

    /**
     * SWFUpload swfUploadLoaded event
     */
    swfUploadLoaded: function() {
        if(this.debug) console.info('SWFUPLOAD LOADED');
        
        this.fireEvent('swfUploadLoaded', this);
    },
        
    /**
     * SWFUpload fileDialogStart event
     */
    fileDialogStart: function() {
        if(this.debug) console.info('FILE DIALOG START');
        
        this.fireEvent('fileDialogStart', this);
    },
    
    /**
     * Add file to store / grid
     * SWFUpload fileQueue event
     * @param {Object} file
     */
    fileQueue: function(file) {
        if(this.debug) console.info('FILE QUEUE');
        
        file.status = 0;
        r = new this.rec(file);
        r.id = file.id;
        this.store.add(r);
        
        this.fireEvent('fileQueued', this, file);
    },

    /**
     * Error when file queue error occurs
     * SWFUpload fileQueueError event
     * @param {Object}  file
     * @param {Integer} code
     * @param {string}  message
     */
    fileQueueError: function(file, code, message) {
        if(this.debug) console.info('FILE QUEUE ERROR');

        switch (code) {
            case -100: 
                var slots;
                switch(message) {
                    case '0':
                        slots = this.strings.error_queue_slots_0;
                        break;
                    case '1':
                        slots = this.strings.error_queue_slots_1;
                        break;
                    default:
                        slots = String.format(this.strings.error_queue_slots_2, message);
                }
                Ext.MessageBox.alert(this.strings.text_error, String.format(this.strings.error_queue_exceeded + ' ' + slots, this.file_queue_limit));
                break;
                
            case -110:
                Ext.MessageBox.alert(this.strings.text_error, String.format(this.strings.error_size_exceeded, this.formatBytes(this.file_size_limit * 1024)));
                break;

            case -120:
                Ext.MessageBox.alert(this.strings.text_error, this.strings.error_zero_byte_file);
                break;

            case -130:
                Ext.MessageBox.alert(this.strings.text_error, this.strings.error_invalid_filetype);
                break;
        }
        
        this.fireEvent('fileQueueError', this, file, code, error);
    },

    /**
     * SWFUpload fileDialogComplete event
     * @param {Integer} file_count
     */
    fileDialogComplete: function(file_count) {
        if(this.debug) console.info('FILE DIALOG COMPLETE');
        
        if (file_count > 0) {
            this.uploadBtn.show();
        }
        
        this.addBtn.show();
		this.clearBtn.show();
        
        this.fireEvent('fileDialogComplete', this, file_count);
    },

    /**
     * SWFUpload uploadStart event
     * @param {Object} file
     */
    uploadStart: function(file) {
        if(this.debug) console.info('UPLOAD START');
        
        this.fireEvent('uploadStart', this, file);
        
        return true;
    },
    
    /**
     * SWFUpload uploadProgress event
     * @param {Object}  file
     * @param {Integer} bytes_completed
     * @param {Integer} bytes_total
     */
    uploadProgress: function(file, bytes_completed, bytes_total) {
        if(this.debug) console.info('UPLOAD PROGRESS');
        
        this.store.getById(file.id).set('status', 1);       
        this.store.getById(file.id).commit();
        this.progress_bar.updateProgress(bytes_completed/bytes_total, String.format(this.strings.text_uploading, file.name, this.formatBytes(bytes_completed), this.formatBytes(bytes_total)));
        
        this.fireEvent('uploadProgress', this, file, bytes_completed, bytes_total);
    },

    /**
     * SWFUpload uploadError event
     * Show notice when error occurs
     * @param {Object} file
     * @param {Integer} error
     * @param {Integer} code
     * @return {}
     */
    uploadError: function(file, error, code) {
        if(this.debug) console.info('UPLOAD ERROR');

        switch (error) {
            case -200:  
                Ext.MessageBox.alert(this.strings.text_error, this.strings.error_file_not_found);
                break;
                
            case -230:  
                Ext.MessageBox.alert(this.strings.text_error, this.strings.error_security_error);
                break;
                
            case -290:
                this.store.getById(file.id).set('status', 4);
                this.store.getById(file.id).commit();
                break;
        }
        
        this.fireEvent('fileUploadError', this, file, error, code);
    },

    /**
     * SWFUpload uploadSuccess event
     * @param {Object} file
     * @param {Object} response
     */ 
    uploadSuccess: function(file, response) {
        if(this.debug) console.info('UPLOAD SUCCESS');
        
        var data = Ext.decode(response); 
        if (data.success) {
            this.store.remove(this.store.getById(file.id));
        } else {
            this.store.getById(file.id).set('status', 3);
            this.store.getById(file.id).commit();
            if (data.msg) {
                Ext.MessageBox.alert(this.strings.text_error, data.msg);
            }
        }
        
        
        this.fireEvent('fileUploadSuccess', this, file, data);
    },

    /**
     * SWFUpload uploadComplete event
     * @param {Object} file
     */
    uploadComplete: function(file) {
        if(this.debug) console.info('UPLOAD COMPLETE');
        
        this.progress_bar.reset();
        this.progress_bar.updateText(this.strings.text_progressbar);
        
        if(this.suo.getStats().files_queued && !this.upload_cancelled) {
            this.suo.startUpload();
        } else {
            this.fireEvent('fileUploadComplete', this, file);
            
            this.allUploadsComplete();
        }
        
    },
    
    /**
     * SWFUpload allUploadsComplete method
     */
    allUploadsComplete: function() {
        this.cancelBtn.hide();
		this.addBtn.show();
		this.clearBtn.show();
        
        this.fireEvent('allUploadsComplete', this);
    },
    
    /**
     * SWFUpload setPostParams method
     * @param {String} name
     * @param {String} value
     */
    addPostParam: function(name, value) {
        if (this.suo) {
            this.suo.settings.post_params[name] = value;
            this.suo.setPostParams(this.suo.settings.post_params);
        } else {
            this.post_params[name] = value;
        }
    },
        
    /**
     * Start file upload
     * SWFUpload startUpload method
     */
    startUpload: function() {
        if(this.debug) console.info('START UPLOAD');
        
        this.cancelBtn.show();
        this.uploadBtn.hide();
        this.clearBtn.hide();
//		this.addBtn.hide();
        
        this.upload_cancelled = false;
        
		this.fireEvent('startUpload', this);
		
        this.suo.startUpload();
    },
    
    /**
     * SWFUpload stopUpload method
     * @param {Object} file
     */
    stopUpload: function(file) {
        if(this.debug) console.info('STOP UPLOAD');
        
        this.suo.stopUpload();
        
        this.upload_cancelled = true;
        
        this.getStore().each(function() {
            if (this.data.status == 1) {
                this.set('status', 0);
                this.commit();
            }
        });

        this.cancelBtn.hide();
        if (this.suo.getStats().files_queued > 0) {
            this.uploadBtn.show();
        }
        this.addBtn.show();
		this.clearBtn.show();

        this.progress_bar.reset();
        this.progress_bar.updateText(this.strings.text_progressbar);

    },
    
    /**
     * Delete one or multiple rows
     * SWFUpload cancelUpload method
     */
    removeFiles: function() {
        if(this.debug) console.info('REMOVE FILES');
        
        var selRecords = this.getSelections();
        for (var i=0; i < selRecords.length; i++) {
            if (selRecords[i].data.status != 1) {
                this.suo.cancelUpload(selRecords[i].id);
                this.store.remove(selRecords[i]);
            }
        }
        
        if (this.suo.getStats().files_queued === 0) {
            this.uploadBtn.hide();
//            this.clearBtn.hide();
        }
        
        this.fireEvent('removeFiles', this);
    },
    
    /**
     * Clear the Queue
     * SWFUpload cancelUpload method
     */
    removeAllFiles: function() {
        if(this.debug) console.info('REMOVE ALL');
        
        // mark all internal files as cancelled
        var files_left = this.suo.getStats().files_queued;

        while (files_left > 0) {
            this.suo.cancelUpload();
            files_left = this.suo.getStats().files_queued;
        }
        
        this.store.removeAll();
        
        this.cancelBtn.hide();
        this.uploadBtn.hide();
//        this.clearBtn.hide();
        
        this.fireEvent('removeAllFiles', this);
    }   
    
});;//Thanks: http://extjs.com/forum/showthread.php?t=41357
if (Ext.isIE6) {
	Ext.util.CSS.createStyleSheet(".ux-panel-header-btns-ct-ie6 {float: right; width: 1px; }");
} 
if (Ext.isIE7) {
	Ext.util.CSS.createStyleSheet(".ux-panel-header-btns-ct-ie7 {float: right; width: 1px; }");
} 
Ext.namespace('Ext.ux.plugins');
Ext.ux.plugins.HeaderButtons = function(config)

{

	Ext.apply(this, config);

};

Ext.extend(Ext.ux.plugins.HeaderButtons, Ext.util.Observable,

{

	init : function(panel)

	{

		if (panel.hbuttons) {
			Ext.apply(panel, {
				onRender : panel.onRender
						.createSequence(function(ct, position) {
							if (this.headerButtons
									&& this.headerButtons.length > 0) {
								var tb = this.header.createChild({
									//cls : 'ux-panel-header-btns-ct',
									cls: (Ext.isIE7 || Ext.isIE6) ? 'ux-panel-header-btns-ct-ie'+(Ext.isIE6?'6':'7'): 'ux-panel-header-btns-ct',
									cn : {
										cls : "ux-panel-header-btns",
										html : '<table cellspacing="0"><tbody><tr></tr></tbody></table><div class="x-clear"></div>'
									}
								}, this.header.first('span', true), true); // insert
																			// before
																			// header
																			// text
																			// (but
																			// after
																			// tools)

								var tr = tb.getElementsByTagName('tr')[0];
								for (var i = 0, len = this.headerButtons.length; i < len; i++) {
									var b = this.headerButtons[i];
									var td = document.createElement('td');
									td.className = 'ux-panel-header-btn-td';
									b.render(tr.appendChild(td));
								}
							}

						}),

				addHeaderButton : function(config, handler, scope) {
					var bc = {
						handler : handler,
						scope : scope,
						hideParent : true
					};
					if (typeof config == "string")
						bc.text = config;
					else
						Ext.apply(bc, config);

					var btn = new Ext.Button(bc);
					btn.ownerCt = this;
					if (!this.headerButtons)
						this.headerButtons = [];

					this.headerButtons.push(btn);
					return btn;
				}
			});

			var btns = panel.hbuttons;

			panel.headerButtons = [];
			for (var i = 0, len = btns.length; i < len; i++) {
				if (btns[i].render)
					panel.headerButtons.push(btns[i]);
				else
					panel.addHeaderButton(btns[i]);
			}

			delete panel.hbuttons;
		}
	}

});
// EOP
;/**
 * 标签式面板
 */
divo.panel.IFrameComponent = Ext.extend(Ext.BoxComponent, {
	onRender : function(ct, position) {
		this.el = ct.createChild( {
			tag : 'iframe',
			id : 'iframe-' + this.id,
			frameBorder : 0,
			src : this.url
		})
	}
})
divo.panel.TabCloseMenu = function() {
	var tabs, menu, ctxItem;
	this.init = function(tp) {
		tabs = tp;
		tabs.on('contextmenu', onContextMenu);
	}

	function onContextMenu(ts, item, e) {
		if (!menu) { // create context menu on first right click
			menu = new Ext.menu.Menu([ {
				id : tabs.id + '-close',
				text : '关闭',
				handler : function() {
					tabs.remove(ctxItem);
				}
			}, {
				id : tabs.id + '-close-others',
				text : '关闭其他',
				handler : function() {
					tabs.items.each(function(item) {
						if (item.closable && item != ctxItem) {
							tabs.remove(item);
						}
					});
				}
			}]);
		}
		ctxItem = item;
		var items = menu.items;
		items.get(tabs.id + '-close').setDisabled(!item.closable);
		var disableOthers = true;
		tabs.items.each(function() {
			if (this != item && this.closable) {
				disableOthers = false;
				return false;
			}
		});
		items.get(tabs.id + '-close-others').setDisabled(disableOthers);
		menu.showAt(e.getPoint());
	}
};
divo.panel.TabbedPanel = Ext.extend(Ext.TabPanel, {
	closable : true,
    tabPosition : 'top',	
    margins : '0 0 0 0',
    notCloseMeHTML : '',
    showFixedPanel : false, //避免网格显示在TabPanel中不显示页脚
	initComponent : function() {

		Ext.apply(this, {
			activeTab : 0,
			region : 'center',
			border : false,
			margins : this.margins,
			tabPosition : this.tabPosition,
			enableTabScroll : (this.tabPosition == 'top'),
			plugins : new divo.panel.TabCloseMenu()
		});
		
	    if (this.tabPosition == 'bottom' || this.showFixedPanel) 
			Ext.apply(this, {
				items : [{
					title : '<img src="/media/images/divo/button.gif">',
					closable : false,
					autoScroll : false,
					id : this.notCloseMeTabId || 'not-close-me',
					html: this.notCloseMeHTML
				}]
			});
		
		divo.panel.TabbedPanel.superclass.initComponent.call(this);
	},
	afterRender : function() {
		divo.panel.TabbedPanel.superclass.afterRender.call(this);
		this.on("tabchange",this.onTabChanged,this)
	},
	//模板方法
	onTabChanged : Ext.emptyFn,
	/**
	 * 打开IFRAME方式的Tab
	 * 
	 * @param {String} tabId 标识
	 * @param {String} title 标题
	 * @param {String} url
	 * @return 打开的Panel对象
	 */
	openTab : function(tabId, title, url) {
		var tab;
		if (!(tab = this.getItem(tabId))) {
			var iframe = new divo.panel.IFrameComponent({
				id : tabId,
				autoScroll : true,
				url : url
			});
			tab = new Ext.Panel({
				id : tabId,
				title : title,
				closable : this.closable,
				autoScroll : true,
				border : false,
				layout : 'fit',
				items : [iframe]
			})
			this.add(tab);
		} else {
			tab.setTitle(title);
		}
		this.setActiveTab(tab);
		tab.doLayout();
		return tab;
	},
	/**
	 * 打开非IFRAME方式的TabPanel,其中的内容已经在另外一个Panel中定义好了
	 * 
	 * @param {String} tabId 标识
	 * @param {String} title 标题
	 * @param {Ext.Panel} innerPanel
	 * @return 打开的Panel对象
	 */
	openNormalTab : function(tabId, title, innerPanel,active,closable,iconCls,panelCls) {
		var tab;
		if (!(tab = this.getItem(tabId))) {
			tab = new Ext.Panel({
				id : tabId,
				cls : panelCls,
				iconCls : iconCls,
				title : title,
				autoScroll : false,
				border : false,
				closable : closable==true?true:false, 
				layout : 'fit',
				items : [innerPanel]
			});
			this.add(tab);
		}
		tab.setTitle(title);
		if (active==undefined || active)
			this.setActiveTab(tab);
		tab.doLayout(); // 没有这句，内嵌网格显示就不正常
		return tab;
	},
	/**
	 * 打开非IFRAME方式的TabPanel,其中的内容将随后动态创建
	 * 
	 * @param {String} tabId 标识
	 * @param {String} title 标题
	 */
	openDynamicTab : function(tabId, title, closable) {
		var tab;
		if (!(tab = this.getItem(tabId))) {
			Ext.DomHelper.append(document.body, {
				tag : 'div',
				id : 'div-' + tabId
			});
			tab = new Ext.Panel({
				id : tabId,
				title : false,
				closable : closable || true,
				autoScroll : false,
				border : false,
				layout : 'fit',
				el : 'div-' + tabId
			});
			tab.render();
			this.add(tab);
		}
		tab.setTitle(title);
		this.setActiveTab(tab);
		tab.doLayout();
		return tab;
	}

})

Ext.reg("divo.panel.TabbedPanel", divo.panel.TabbedPanel)
// EOP
;Ext.namespace('Ext.ux');

Ext.ux.ScreenshotUploadPanel = Ext.extend(Ext.Panel, {
    /**
     * The upload URL for the screenshot
     * @type String
     */
    uploadUrl: '',
    
    /**
     * The URL to a placeholder or an existing screenshot
     * that will be replaced with the upload
     * @type String
     */
    screenshotUrl: '/media/images/placeholder.gif',
    screenHtml : null,
    
    inputFileName: 'screenshot',
    
    width: 100,
    
    height: 110,
    
    waitTitle: 'Uploading Screenshot',
    
	waitMsg: 'Your screenshot is being uploaded...',
    
	promtOnUploadCompleted : true, //上传成功后是否提示
	onUploadCompleted : function() {
		this.refreshImage()
	},
	
    initComponent: function(){    	    	
        
        this.browseBtn = new Ext.ux.form.BrowseButton({
        	xtype: 'browsebutton',
			debug: false,
            handler: this.browseFile,
            scope: this,
            text : '&nbsp;浏览...&nbsp;',
            inputFileName: this.inputFileName
        });
        
    	Ext.apply(this, {
        	id: Ext.id(null, 'screenshot'),
        	width: this.width,
        	height: this.height + 36,
        	buttonAlign: 'right',
        	buttons: [
        		this.browseBtn
        	]
        });
        Ext.ux.ScreenshotUploadPanel.superclass.initComponent.apply(this, arguments);
        if (!this.screenHtml)
            var html = '<img id="' + this.myId("image") + '" src="' + this.screenshotUrl + '" />'
        else    
            var html = this.screenHtml
        this.imgViewPanel = new Ext.Panel({
            frame: false,
            border: false,       	
            html: html
        });
        this.add(this.imgViewPanel); 
    },
    refreshImage : function(url) {
    	if (!url) url = this.screenshotUrl
		var el = Ext.get(this.myId("image"))
		el.dom.src = url + "?_dc=" + (new Date().getTime())
    },
    browseFile: function(){
    	if (!this.uploadUrl) {
    		this.say(this.cannotUploadPrompt)
    		return 
    	}
    	if (!this.addScreenshotForm) {
            var addScreenshotFormEl = this.body.createChild({
                tag: 'form',
                style: 'display:none'
            });
            this.addScreenshotForm = new Ext.form.BasicForm(addScreenshotFormEl, {
                url: this.uploadUrl, 
                fileUpload: true
            });
        }
        var inputFileEl = this.browseBtn.detachInputFile();
        inputFileEl.appendTo(this.addScreenshotForm.getEl());
        
        this.uploadScreenshot.call(this);
    },
    
    uploadScreenshot: function(){
        this.addScreenshotForm.submit({
            //params: {
            //    extraParam1: 'value1'
            //},
            success: this.onSuccess,
            failure: this.onFailure,
            scope: this,
            waitTitle: this.waitTitle,
            waitMsg: this.waitMsg
        });
    },
        
    onSuccess: function(form, action){
        var inputFileEl = this.addScreenshotForm.getEl().child('input');
        inputFileEl.remove();
        if (this.promtOnUploadCompleted) {
	        Ext.Msg.show({
	            title: '上传',
	            msg: '操作成功。',
	            closable : false,  
	            buttons: Ext.Msg.OK,
	            minWidth: 300,
	            fn : this.onUploadCompleted.createDelegate(this,[form,action])
	        })
        } else {    
	        if (this.onUploadCompleted) {
	        	this.onUploadCompleted(form,action)
	        }
        }    
    },
        
    onFailure: function(form, action, rsp){
        var inputFileEl = this.addScreenshotForm.getEl().child('input');
        inputFileEl.remove();
        Ext.Msg.show({
            title: '上传失败',
            msg: action.result.error,
            buttons: Ext.Msg.OK,
            minWidth: 300
        });
    }
    
});

Ext.reg('screenshotupload', Ext.ux.ScreenshotUploadPanel);;/**
 * @class Ext.ux.ColumnMenu
 * @extends Ext.menu.Menu
 * A menu object.  This is the container to which you add all other menu items in column format.  Menu can also serve a as a base class
 * when you want a specialzed menu based off of another component (like {@link Ext.menu.DateMenu} for example).
 * @constructor
 * Creates a new Column Menu
 * @param {Object} config Configuration options
 */
Ext.ux.ColumnMenu = function(config) {
	Ext.apply(this,config);
    Ext.ux.ColumnMenu.superclass.constructor.call(this, config);
};

Ext.extend( Ext.ux.ColumnMenu , Ext.menu.Menu , {
    /**
     * @cfg {Number} columnHeight The max height of a menu column in pixels (defaults to 300)
     */
	columnHeight: 300,
    /**
     * @cfg {Number} columnWidth The width of a menu column in pixels (defaults to 180)
     */
	columnWidth: 180,
	
	// private
    render: function() {
        if ( this.el ) {
            return;
        }
        
        var el = this.el = this.createEl();

        if ( !this.keyNav ) {
            this.keyNav = new Ext.menu.MenuNav( this );
        }
        
        if ( this.plain ) {
            el.addClass("x-menu-plain");
        }
        
        if ( this.cls ) {
            el.addClass( this.cls );
        }

        var focusEl = this.focusEl = el.createChild({
            cls: "x-menu-focus",
            href: "#",
            onclick: "return false;",
            tabIndex:"-1",
            tag: "a"
        });
        
        el.setStyle({
			'background': '',
			'margin': '0',
        	'padding': '0'
        });
        
        var containerEl = this.containerEl = el.createChild({
            cls: "x-column-menu",
            tag: "div"
        });

		var columnEl = null;
        var ul = null;
        var li = null;

        this.items.each(function( item , index , length ) {
            if ( ul === null || ul.getHeight() >= this.columnHeight ) {
	            columnEl = containerEl.createChild({
	                cls: "x-menu-list",
	                tag: "div"
	            });
	            
	            ul = columnEl.createChild({
	                style: "width: " + this.columnWidth + "px;",
	                tag: "ul"
	            });
	            
	            ul.on("click", this.onClick, this);
	            ul.on("mouseover", this.onMouseOver, this);
	            ul.on("mouseout", this.onMouseOut, this);
	            
	            this.ul = ul;
			}
            
            li = document.createElement("li");
            li.className = "x-menu-list-item";
            
            ul.dom.appendChild( li );
            
            item.render( li , this );
		}.createDelegate( this ));
		
		containerEl.child('.x-menu-list:last').setHeight( containerEl.child('.x-menu-list:first').getComputedHeight() );
    }
});
//EOP
;/**
 * 只读表单基类
 */
divo.form.DivoBasicForm = Ext.extend(Ext.Component, {
	autoScroll : true,
	item : null,
	fields : [],
	tableClass : "j-grid-table",
	labelClass : "label",
	labelAlign : "right",
	labelWidth : "40%",
	fieldDefinitions : null,
	getFieldFunc : null,
	iconRequired : null,
	clickable : false,
	readOnly : true,
	//初始化
	initComponent : function() {
		this.separator = ":"
		if (this.tableClass!='j-form-table')
		    this.separator = ""

		Ext.applyIf(this, {
			defaultDateFormat : this.getAppContext().getDayMonthYearFormat()
		});

		divo.form.DivoBasicForm.superclass.initComponent.call(this)
	},
	getTypeFromString : function(s) {
		var ss = s.split("."), i = 0, obj = dj_global; //dj_global?
		do {
			obj = obj[ss[i++]];
		} while (i < ss.length && obj);
		return (obj != dj_global) ? obj : null;
	},
	_meta : {
		field : null,
		format : null,
		dataType : String,
		label : null,
		align : "left",
		valign : "top",
		getField : function() {
			return this.field || this.label;
		},
		getType : function() {
			return this.dataType;
		},
		idField : "id",
		displayField : "name",
		cls : null
	},
	setFieldDefinitions : function(defs) {
		delete this.fields;
		this.fields = [];
		for (var i = 0; i < defs.length; i++) {
			var def = Ext.apply({}, defs[i]);
			this.fields.push(this.createMetaData(def));
		}
		this.reconfig = true;
	},
	createMetaData : function(obj) {
		for (var p in this._meta) {
			if (!obj[p]) {
				obj[p] = this._meta[p];
			}
		}
		if (!obj.label) {
			obj.label = obj.field;
		}
		return obj;
	},
	createRow : function(meta, item) {
		var tpls = this.templates;
		var rowTpl1 = tpls.rowTpl1;
		var rowTpl2 = tpls.rowTpl2;
		var rowTpl3 = tpls.rowTpl3;
		var child;
		var tbody = this.tbody;
		var sep = meta.separator || this.separator;
		var val = this.getFieldFunc(item, meta);
		var label = meta.required && !this.readOnly
				? divo.required + meta.label
				: meta.label;
		if (meta.labelAlign != "top") {
			var row1 = rowTpl1.append(tbody, {
				labelCls : this.labelClass,
				labelValue : label,
				separator : sep,
				align : meta.labelAlign || this.labelAlign,
				style : "width:" + (meta.labelWidth || this.labelWidth) + ";"
			});
			child = row1.childNodes[1];
		} else {
			rowTpl2.append(tbody, {
				labelCls : this.labelClass,
				separator : sep,
				labelValue : label
			});
			var row2 = rowTpl3.append(tbody, {});
			child = row2.firstChild;
		}
		this.fillCell(child, meta, val);
		return row1;
	},
	fillCell : function(cell, meta, val) {
		if (this.readOnly || meta.readOnly) {
			this.fillCellReadOnly(cell, meta, val);
		} else {
			this.fillCellWithControl(cell, meta, val);
		}
	},
	fillCellReadOnly : function(cell, meta, val) {
		if (meta.sortType == "__markup__") {
			cell.innerHTML = val;
		} else {
			if (meta.getType() == Date || meta.getType() == "date") {
				cell.innerHTML = val
			} else {
				if (meta.getType() == "Lookup" || meta.dataType == "lookup"
						|| meta.dataType == "multiRadioBox"
						|| (meta.getType() == "Integer" && meta.options)) {
					if (val) {
						if (!val[meta.idField]) {
							var val = this.getLookup(meta, val);
						}
						val = val ? val[meta.displayField] : "";
						cell.appendChild(document.createTextNode(val));
					} else {
						cell.innerHTML = "";
					}
				} else {
					if ("Number number int Integer float Float".indexOf(meta.getType()) > -1) {
						if (val.length == 0) {
							val = "0";
						}
						var n = parseFloat(val, 10) + "";
						if (n.indexOf(".") > -1) {
							n = Math.round(parseFloat(val, 10), 2);
						}
						cell.innerHTML = n;
					} else {
						if (meta.getType() == "boolean") {
							cell.appendChild(document.createTextNode(val ? "是" : "否"));
						} else {
							if (meta.getType() == "text") {
								if (meta.controlTypeId == 2) {
									cell.innerHTML = this.encodeTextForDisplay(val);
								} else {
									val = "<div class=\"j-text-box\">" + val + "</div>";
									cell.innerHTML = val;
								}
							} else {
								if (this.clickable && meta.label == "ID") {
									cell.appendChild(this
											.makeValueHyperlink(val));
								} else {
									if (meta.inputType == "password") {
										val = this.createMask(val);
										cell.innerHTML = val;
									} else {
										cell.innerHTML = val;
									}
								}
							}
						}
					}
				}
			}
		}
	},
	createMask : function(val) {
		var mask = "";
		if (val) {
			for (var i = 0, len = val.length; i < len; i++) {
				mask += "*";
			}
		}
		return mask;
	},
	makeValueHyperlink : function(val) {
		return val;
	},
	fillCellWithControl : function(cell, meta, val) {
		if (meta.sortType == "__markup__") {
			cell.innerHTML = val;
		} else {
			if (meta.getType() == Date || meta.getType() == "date") {
				var fmt = meta.format || this.defaultDateFormat;
				this.createDatePicker(cell, meta, fmt, val);
			} else {
				if (meta.getType() == "Lookup" || meta.dataType == "lookup"
						|| (meta.getType() == "Integer" && meta.options)) {
					this.createDropDown(cell, meta, val);
				} else {
					if ("Number number int Integer float Float".indexOf(meta.getType()) > -1) {
						if (val.length == 0) {
							val = "0";
						}
						var n = parseFloat(val, 10) + "";
						if (n.indexOf(".") > -1) {
							n = Math.round(parseFloat(val, 10), 2);
						}
						cell.innerHTML = n;
					} else {
						if (meta.getType() == "boolean") {
							this.createCheckBox(cell, meta, val);
						} else {
							if (meta.getType() == "multiCheckboxes") {
								this.createMultiCheckboxes(cell, meta, val);
							} else {
								if (meta.getType() == "multiRadioBox") {
									this.createMultiRadioBox(cell, meta, val);
								} else {
									if (meta.getType() == "text") {
										val = val ? val : "";
										if (meta.controlTypeId == 2) {
											this.createTextarea(cell, meta,	val);
										}
									} else {
										this.createInputBox(cell, meta, val);
									}
								}
							}
						}
					}
				}
			}
			if (meta.required && this.iconRequired) {
				cell.appendChild(this.createImage(this.iconRequired));
			}
		}
	},
	createDropDown : function(cell, meta, val) {
		var selectEl = document.createElement("select");
		var idField = meta.idField;
		var displayField = meta.displayField;
		for (var i = 0; i < meta.options.length; i++) {
			var option = meta.options[i];
			var ele = document.createElement("option");
			ele.value = option[idField];
			ele.innerHTML = option[displayField];
			selectEl.appendChild(ele);
		}
		if (val) {
			selectEl.value = val ? (val[idField] ? val[idField] : val) : "";
		} else {
			var s = this.getLookupByDisplay(meta, "Select One");
			selectEl.value = s ? s[meta.idField] : "";
		}
		cell.appendChild(selectEl);
		meta.control = selectEl;
	},
	createMultiCheckboxes : function(cell, meta, val) {
		var idField = meta.idField;
		var displayField = meta.displayField;
		var flds = [];
		if (typeof(val) == "string") {
			flds = val.split(" ");
		} else {
			if (meta.returnIds) {
				flds = val;
			} else {
				for (var i = 0; i < val.length; i++) {
					flds.push(val[i][idField]);
				}
			}
		}
		var div = Ext.DomHelper.append(cell, {
			tag : "div",
			cls : "j-form-scroll-box",
			id : this.getEl().id + "_" + meta.field
		}, true);
		if (!this.checkboxTpl) {
			this.checkTpl = new Ext.Template("<input type=\"checkbox\" name=\"{fieldName}\" value=\"{id}\""
					+ "{checked}/>&nbsp;&nbsp;{name}<br/>");
		}
		var i, tpl = this.checkTpl;
		for (i = 0; i < meta.options.length; i++) {
			var option = meta.options[i];
			var state = (this.hasValue(option[idField], flds))
					? "checked=\"checked\""
					: "";
			tpl.append(div, {
				filedName : meta.field,
				id : option[idField],
				name : option[displayField],
				checked : state
			});
		}
		if (i < 7) {
			div.dom.style.height = i * 20 + "px";
		}
		meta.control = div.dom;
	},
	hasValue : function(v, flds) {
		for (var i in flds) {
			if (flds[i] == v) {
				return true;
			}
		}
		return false;
	},
	encodeTextForDisplay : function(text, html) {
		if (text == undefined || text == null) {
			return text;
		}
		if (html == undefined) {
			html = "</br>";
		}
		text = text.replace(/\r\n/g, html);
		text = text.replace(/\n/g, html);
		text = text.replace(/\r/g, html);
		return text;
	},
	createInputBox : function(cell, meta, val) {
		var inputEl = document.createElement("input");
		if (meta.inputType) {
			inputEl.type = meta.inputType;
		} else {
			inputEl.type = "text";
		}
		inputEl.value = val;
		inputEl.id = this.widgetId + "_" + meta.field;
		inputEl.name = inputEl.id;
		if (meta.size) {
			inputEl.size = meta.size;
		} else {
			if (meta.style) {
				inputEl.setAttribute("style", meta.style);
			} else {
				inputEl.style.width = "99%";
			}
		}
		inputEl.maxLength = meta.maxLength ? meta.maxLength : 255;
		cell.appendChild(inputEl);
		meta.control = inputEl;
	},
	createTextarea : function(cell, meta, val) {
		var textareaEl = document.createElement("textarea");
		cell.appendChild(textareaEl);
		textareaEl.value = val;
		textareaEl.id = this.widgetId + "_" + meta.field;
		textareaEl.name = textareaEl.id;
		textareaEl.style.height = meta.height ? meta.height : 120;
		textareaEl.style.width = meta.width ? meta.width : "99%";
		meta.control = textareaEl;
	},
	createHtmlEditor : function(cell, meta, val) {
		var divEl = document.createElement("div");
		cell.appendChild(divEl);
		var editor = new Ext.form.HtmlEditor({
			name : meta.field,
			width : meta.width ? meta.width : "100%",
			height : meta.height ? meta.height : 200
		});
		editor.render(divEl);
		editor.setValue(val);
		meta.control = editor;
		meta.control.controlType = "htmleditor";
	},
	createCheckBox : function(cell, meta, val) {
		var inputEl = document.createElement("input");
		inputEl.type = "checkbox";
		cell.appendChild(inputEl);
		inputEl.value = "on";
		if (val) {
			inputEl.checked = val;
		}
		inputEl.id = this.widgetId + "_" + meta.field;
		inputEl.name = inputEl.id;
		meta.control = inputEl;
	},
	createDatePicker : function(cell, meta, fmt, val) {
		var divEl = document.createElement("div");
		cell.appendChild(divEl);
		var fld = new Ext.form.DateField({
			format : fmt,
			allowBlank : true
		});
		fld.render(divEl);
		fld.setValue(val);
		meta.control = fld;
		meta.widgetType = "ext";
	},
	createMultiRadioBox : function(cell, meta, val) {
		var id = this.getEl().id;
		if (typeof(val) == "object") {
			val = val[meta.idField];
		}
		var div = Ext.DomHelper.append(cell, {
			tag : "div",
			cls : (meta.cls != null) ? meta.cls : "j-form-scroll-box",
			id : id + "_" + meta.field
		}, true);
		if (!this.radioTpl) {
			this.radioTpl = new Ext.Template("<input type=\"radio\" name=\"{fieldName}\" value=\"{value}\""
					+ "{checked}{disabled}/>&nbsp;&nbsp;{name}<br/>");
		}
		var i, tpl = this.radioTpl;
		var _55f = id + "_r_" + meta.field;
		for (i = 0; i < meta.options.length; i++) {
			var _560 = meta.options[i];
			var _561 = (val == _560[meta.idField]) ? "checked=\"checked\"" : "";
			var _562 = (_560.disable ? " disabled" : "");
			tpl.append(div, {
				fieldName : _55f,
				value : _560[meta.idField],
				name : _560[meta.displayField],
				checked : _561,
				disabled : _562
			});
		}
		meta.control = div.dom;
	},
	createImage : function(src) {
		var imgEl = document.createElement("img");
		imgEl.src = src;
		imgEl.alt = "required";
		return imgEl;
	},
	getLookup : function(meta, val) {
		var result = null;
		if (val) {
			for (var i in meta.options) {
				var option = meta.options[i];
				if (option[meta.idField] == val) {
					result = option;
					break;
				}
			}
		}
		return result;
	},
	getLookupByDisplay : function(meta, val) {
		var result = null;
		if (val) {
			for (var i in meta.options) {
				var option = meta.options[i];
				if (option[meta.displayField] == val) {
					result = option;
					break;
				}
			}
		}
		return result;
	},
	getMultiCheckboxesValues : function(meta, val) {
		var inputEl = meta.control.getElementsByTagName("input");
		var vs = [];
		var idField = meta.idField;
		for (var i = 0; i < inputEl.length; i++) {
			var fld = inputEl[i];
			if (fld.checked) {
				if (meta.returnIds || meta.returnString) {
					vs.push(fld.value);
				} else {
					var obj = {};
					obj[idField] = fld.value;
					vs.push(obj);
				}
			}
		}
		if (meta.returnString) {
			return vs.join(",");
		} else {
			return vs;
		}
	},
	getMultiRadioBoxValue : function(meta, val) {
		var inputEl = meta.control.getElementsByTagName("input");
		var vs = null;
		for (var i = 0; i < inputEl.length; i++) {
			var fld = inputEl[i];
			if (fld.checked) {
				vs = fld.value;
				break;
			}
		}
		return vs;
	},
	getFieldMeta : function(name) {
		for (var i = 0; i < this.fields.length; i++) {
			var meta = this.fields[i];
			if (meta.field == name) {
				return meta;
			}
		}
		return null;
	},
	getField : function(obj, meta) {
		var name = meta.field;
		var map = meta.mapping;
		var fld = null;
		if (map) {
			fld = map(obj);
		} else {
			fld = obj[name];
		}
		if (typeof fld == "boolean") {
			return fld;
		}
		return fld ? fld : "";
	},
	setField : function(obj, meta, fld) {
		obj[meta.field] = fld;
	},
	encodeTextForTextarea : function(text, html) {
		if (text == undefined || text == null) {
			return text;
		}
		if (html == undefined) {
			html = "</br>";
		}
		text = text.replace(/\r\n/g, html);
		text = text.replace(/\n/g, html);
		text = text.replace(/\r/g, html);
		return text;
	},
	cloneItem : function(item) {
		return Ext.apply({}, item);
	},
	destroyWidgetControls : function() {
		for (var j = 0; j < this.fields.length; j++) {
			var meta = this.fields[j]
			if (meta.control && meta.control.widgetType == "ext") {
				Ext.destroy(meta.control)
			}
		}
		return true
	},
	setItem : function(item) {
		this.removeFields();
		this.item = item;
		this.renderRows(this.tbody, item);
		this.reconfig = false;
	},
	removeFields : function() {
		var body = Ext.getDom(this.tbody);
		if (body)
			while (body.childNodes.length > 0) {
				body.removeChild(body.childNodes[0]);
			}
		this.destroyWidgetControls();
	},
	setValues : function(item) {
		if (this.reconfig) {
			this.setValues(item);
		} else {
			for (var i = 0; i < this.fields.length; i++) {
				var meta = this.fields[i];
				if (meta.control) {
					val = this.getFieldFunc(item, meta);
					if (meta.dataType == Date || meta.dataType == "date") {
						meta.control.setValue(value);
					} else {
						if (meta.dataType == "lookup" || meta.dataType == "Lookup") {
							meta.contorl.setValue(value ? value.id : null);
						} else {
							if (meta.dataType == "multiCheckboxes") {
								value = this.getMultiCheckboxesValues(meta);
							} else {
								if (meta.dataType == "multiRadioBox") {
									value = this.getMultiRadioBoxValue(meta);
								} else {
									if (meta.dataType == "boolean") {
										meta.control.checked = value;
									} else {
										if (meta.dataType == "text") {
											if (meta.control.controlType == "htmleditor") {
												meta.control.setValue(value);
											} else {
												meta.control.value = value;
											}
										} else {
											meta.control.value = value;
										}
									}
								}
							}
						}
					}
				}
			}
		}
	},
	renderRows : function(body, item) {
		for (var j = 0; j < this.fields.length; j++) {
			var meta = this.fields[j];
			if (!meta.hidden && !(this.readOnly && meta.hideReadOnly)) {
				this.createRow(meta, item);
			}
		}
	},
	initTemplates : function() {
		if (!this.templates) {
			if (!divo.form.DivoBasicForm.tpls) {
				divo.form.DivoBasicForm.tpls = {};
				var tpls = divo.form.DivoBasicForm.tpls;
				tpls.rowTpl1 = new Ext.Template("<tr><td class=\"{labelCls}\" align=\"{align}\" style=\"{style}\">{labelValue}{separator}</td><td></td></tr>");
				tpls.rowTpl2 = new Ext.Template("<tr><td class=\"{labelCls}\" colspan=\"2\">{labelValue}{separator}</td></tr>");
				tpls.rowTpl3 = new Ext.Template("<tr><td colspan=\"2\"></td></tr>");
			}
			this.templates = divo.form.DivoBasicForm.tpls;
		}
	},
	onRender : function(ct) {
		ct = Ext.get(ct);
		this.headerPanel = Ext.DomHelper.append(ct,	"<div class=\"x-grid-topbar \"></div>",true);
		this.headerPanel.enableDisplayMode("block");
		this.el = ct.createChild({
			tag : "table",
			cls : this.tableClass,
			id : this.id || Ext.id()
		});
		this.table = this.el;
		this.domNode = this.el.dom;
		this.tbody = Ext.DomHelper.append(this.table, {
			tag : "tbody"
		});
		if (this.fieldDefinitions) {
			this.setFieldDefinitions(this.fieldDefinitions);
		}
		if (this.getFieldFunc == null) {
			this.getFieldFunc = this.getField;
		}
		if (this.setFieldFunc == null) {
			this.setFieldFunc = this.setField;
		}
		this.initTemplates();
	},
	beforeDestroy : function() {
		this.destroyWidgetControls();
		divo.form.DivoBasicForm.superclass.beforeDestroy.apply(this, arguments);
	},
	setSize : function() {
		//prevent error: item.setSize is not a function
		//caused by layoutOnTabChange
	},
	setFocus : function() {
		if (this.readOnly) {
			return;
		}
		for (var i = 0; i < this.fields.length; i++) {
			var meta = this.fields[i];
			if (meta.control) {
				var tag = meta.control.tagName;
				if (tag == "INPUT" || tag == "SELECT" || tag == "TEXTAREA") {
					meta.control.focus();
					break;
				}
			}
		}
	},
	getUpdatedItem : function() {
		var item = this.cloneItem(this.item);
		for (var i = 0; i < this.fields.length; i++) {
			var meta = this.fields[i];
			if (meta.control) {
				var v;
				if (meta.dataType == Date || meta.dataType == "date") {
					if (meta.control.getValue()) {
						//v = meta.control.getValue();
						v = meta.control.getRawValue()
					} else {
						v = null;
					}
				} else {
					if (meta.dataType == "lookup" || meta.dataType == "Lookup") {
						v = this.getLookup(meta, meta.control.value);
						if (v) {
							v = {
								id : v.id,
								name : v.name
							};
						}
					} else {
						if (meta.dataType == "multiCheckboxes") {
							v = this.getMultiCheckboxesValues(meta);
						} else {
							if (meta.dataType == "multiRadioBox") {
								v = this.getMultiRadioBoxValue(meta);
							} else {
								if (meta.dataType == "boolean") {
									v = meta.control.checked;
								} else {
									if (meta.dataType == "text") {
										if (meta.control.controlType == "htmleditor") {
											v = meta.control.getValue();
										} else {
											v = meta.control.value;
										}
									} else {
										v = meta.control.value;
									}
								}
							}
						}
					}
				}
				this.setFieldFunc(item, meta, v);
			}
		}
		return item;
	}
	
})
// EOP
;//Thanks: http://extjs.com/forum/showthread.php?t=31989
Ext.ns('Ext.ux.form'); 

/**
 * @class Ext.ux.form.Spacer
 * @extends Ext.BoxComponent
 * Utility spacer class.
 * @constructor
 * @param {Number} height (optional) Spacer height in pixels (defaults to 22).
 */
Ext.ux.form.Spacer = Ext.extend(Ext.BoxComponent, {
  height: 22,
  autoEl: 'div' // thanks @jack =)
});

Ext.reg('spacer', Ext.ux.form.Spacer);
//EOP
;// Thanks: http://extjs.com/forum/showthread.php?t=12030
Ext.namespace("Ext.ux.form");

Ext.ux.form.HistoryClearableComboBox = Ext.extend(Ext.form.ComboBox, {
	displayField : 'query',
	typeAhead : false,
	mode : 'local',
	triggerAction : 'all',
	maxInHistory : 10,
	save2ServerSide : false,
	save2Local : false,
	saveId : null,
	saveSplitChar : 'zzz',
	rememberOn : 'enter',  //可取值 'all'（输入即保存）,'blur'（光标离开后再保存）,'enter'（回车后再保存）
	hideTrigger : false,
	hideComboTrigger : false,
	hideClearTrigger : false,
	// private
	initComponent : function(){
        Ext.ux.form.HistoryClearableComboBox.superclass.initComponent.call(this);
        
		this.addEvents( {
			'change' : true,
			'clearvalue' : true
		});
	
		this.store = new Ext.data.SimpleStore( {
			fields : ['query'],
			data : []
		});
	
		this.historyRecord = Ext.data.Record.create([{
			name : 'query',
			type : 'string'
		}]);

		this.triggerConfig = {
			tag : 'span',
			cls : 'x-form-twin-triggers',
			style : 'padding-right:2px', // padding needed to prevent IE from
			// clipping 2nd trigger button
			cn : [ {
				tag : "img",
				src : Ext.BLANK_IMAGE_URL,
				cls : "x-form-trigger",
				style : this.hideComboTrigger ? "display:none" : ""
			}, {
				tag : "img",
				src : Ext.BLANK_IMAGE_URL,
				cls : "x-form-trigger x-form-clear-trigger",
				style : this.hideClearTrigger ? "display:none" : ""
			}]
		};
        
	},
	restoreEncodedData : function(result) {
		if (result) {
			var data = result.split(this.saveSplitChar)
			for (var i = 0; i < data.length; i++) {
				if (data[i]) {
					var vr = new this.historyRecord( {
						query : data[i]
					});
					this.store.insert(0, vr)
				}
			}
		}	
	},
	getTrigger : function(index) {
		return this.triggers[index];
	},
	initTrigger : function() {
		var ts = this.trigger.select('.x-form-trigger', true);
		this.wrap.setStyle('overflow', 'hidden');
		var triggerField = this;
		ts.each(function(t, all, index) {
			t.hide = function() {
				var w = triggerField.wrap.getWidth();
				this.dom.style.display = 'none';
				triggerField.el.setWidth(w - triggerField.trigger.getWidth());
			};
			t.show = function() {
				var w = triggerField.wrap.getWidth();
				this.dom.style.display = '';
				triggerField.el.setWidth(w - triggerField.trigger.getWidth());
			};
			var triggerIndex = 'Trigger' + (index + 1);

			if (this['hide' + triggerIndex]) {
				t.dom.style.display = 'none';
			}
			t.on("click", this['on' + triggerIndex + 'Click'], this, {
				preventDefault : true
			});
			t.addClassOnOver('x-form-trigger-over');
			t.addClassOnClick('x-form-trigger-click');
		}, this);
		this.triggers = ts.elements;
	},
	onTrigger1Click : function() {
		this.onTriggerClick()
	}, // pass to original combobox trigger handler
	onTrigger2Click : function() {
		this.reset();
		this.fireEvent('clearvalue', this);
		this.clearHistory()
	}, // clear contents of combobox
	afterRender : function(ct) {
		Ext.ux.form.HistoryClearableComboBox.superclass.afterRender.call(this)
		
		var f = function() {
			if (this.save2ServerSide) {
				var result
				divo.restoreProfile(function(retValue) {
				   result = retValue
				},divo.getUserId(), this.saveId || this.name+'-history')
				if (result)
					this.restoreEncodedData(result.msgValue)
			} 
			if (this.save2Local) {
				this.restoreEncodedData(divo.find(this.saveId || this.name+'-history'))
			}
		}
		f.defer(100,this) //避免时间过长引起其他器件不能渲染
	},
	initEvents : function() {
		Ext.ux.form.HistoryClearableComboBox.superclass.initEvents.call(this);
		if (this.rememberOn=="blur")
			this.el.on("blur", this.onHistoryKeyUp, this);
		else	
			this.el.on("keyup", this.onHistoryKeyUp, this);
	},
	historyChange : function(value) {
		var value = this.getValue().replace(/^\s+|\s+$/g, "");
		if (value.length == 0)
			return;
		this.store.clearFilter();
		var vr_insert = true;
		if (this.rememberOn == "all") {
			this.store.each(function(r) {
				if (r.data['query'].indexOf(value) == 0) {
					// backspace
					vr_insert = false;
					return false;
				} else if (value.indexOf(r.data['query']) == 0) {
					// forward typing
					this.store.remove(r);
				}
			});
		}
		if (vr_insert == true) {
			this.store.each(function(r) {
				if (r.data['query'] == value) {
					vr_insert = false;
				}
			});
		}
		if (vr_insert == true) {
			var vr = new this.historyRecord( {
				query : value
			});
			this.store.insert(0, vr)
		}
		var ss_max = this.maxInHistory;
		if (this.store.getCount() > ss_max) {
			var ssc = this.store.getCount();
			var overflow = this.store.getRange(ssc - (ssc - ss_max), ssc);
			for (var i = 0;i < overflow.length; i++) {
				this.store.remove(overflow[i]);
			}
		}
		this.saveHistory();
	},
    getStoreEncodedData : function() {
		var v = ""
		var sc = this.saveSplitChar
		this.store.each(function(r) {
			if (r.data['query'])
				v += r.data['query']+sc
		})
		return v
    },
	onHistoryKeyUp : function(e) {
		if ((this.rememberOn == "enter" && e.getKey() == 13) || 
		     this.rememberOn == "all" ||
		     this.rememberOn == "blur") {
			this.historyChange(this.getValue());
			this.fireEvent('change', this.getValue());
		}
	},
	setValue : function(v) {
		Ext.ux.form.HistoryClearableComboBox.superclass.setValue.call(this,	v);
		this.fireEvent('change', this.getValue());
	},
	clearValue : function() {
		this.setValue("")
	},
	saveHistory : function() {
		if (this.save2ServerSide) {
			var v = this.getStoreEncodedData()
			divo.saveProfileAsync({
				userId : this.getUserId(),
				msgCode : this.saveId || this.name+'-history',
				msgValue : v?v.substr(0,v.length-this.saveSplitChar.length):v
			})
		}
		if (this.save2Local) {
			var v = this.getStoreEncodedData()
			divo.save(this.saveId || this.name+'-history',v)
		}	
	},
	clearHistory : function() {
		this.store.removeAll()
        this.saveHistory()
	}
});

Ext.reg('historycombo', Ext.ux.form.HistoryClearableComboBox);

// EOP
;Ext.namespace('Ext.ux.form');

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

Ext.reg('xlovfield', Ext.ux.form.LovField);;Ext.namespace("Ext.ux"); 

/** 
 * @class Ext.ux.DDView 
 * A DnD enabled version of Ext.View. 
 * @param {Element/String} container The Element in which to create the View. 
 * @param {String} tpl The template string used to create the markup for each element of the View 
 * @param {Object} config The configuration properties. These include all the config options of 
 * {@link Ext.View} plus some specific to this class.<br /> 
 * <p> 
 * Drag/drop is implemented by adding {@link Ext.data.Record}s to the target DDView. If copying is 
 * not being performed, the original {@link Ext.data.Record} is removed from the source DDView.<br /> 
 * <p> 
 * The following extra CSS rules are needed to provide insertion point highlighting:<pre><code> 
.x-view-drag-insert-above { 
    border-top:1px dotted #3366cc; 
} 
.x-view-drag-insert-below { 
    border-bottom:1px dotted #3366cc; 
} 
</code></pre> 
 *  
 */ 
Ext.ux.DDView = function(config) {
	if (!config.itemSelector) {
		var tpl = config.tpl;
		if (this.classRe.test(tpl)) {
			config.tpl = tpl.replace(this.classRe, 'class=$1x-combo-list-item $2$1');
		}
		else {
			config.tpl = tpl.replace(this.tagRe, '$1 class="x-combo-list-item" $2');
		}
		config.itemSelector = ".x-combo-list-item";
	}
    Ext.ux.DDView.superclass.constructor.call(this, Ext.apply(config, { 
        border: false 
    })); 
}; 

Ext.extend(Ext.ux.DDView, Ext.DataView, { 
/**    @cfg {String/Array} dragGroup The ddgroup name(s) for the View's DragZone. */ 
/**    @cfg {String/Array} dropGroup The ddgroup name(s) for the View's DropZone. */ 
/**    @cfg {Boolean} copy Causes drag operations to copy nodes rather than move. */ 
/**    @cfg {Boolean} allowCopy Causes ctrl/drag operations to copy nodes rather than move. */ 

	sortDir: 'ASC',

    isFormField: true, 
     
    classRe: /class=(['"])(.*)\1/, 

    tagRe: /(<\w*)(.*?>)/, 

    reset: Ext.emptyFn, 
     
    clearInvalid: Ext.form.Field.prototype.clearInvalid, 

    msgTarget: 'qtip', 

	afterRender: function() {
		Ext.ux.DDView.superclass.afterRender.call(this);
	    if (this.dragGroup) { 
	        this.setDraggable(this.dragGroup.split(",")); 
	    } 
	    if (this.dropGroup) { 
	        this.setDroppable(this.dropGroup.split(",")); 
	    } 
	    if (this.deletable) { 
	        this.setDeletable(); 
	    } 
	    this.isDirtyFlag = false; 
	    this.addEvents( 
	        "drop" 
	    );
	},
     
    validate: function() { 
        return true; 
    }, 
     
    destroy: function() { 
        this.purgeListeners(); 
        this.getEl().removeAllListeners(); 
        this.getEl().remove(); 
        if (this.dragZone) { 
            if (this.dragZone.destroy) { 
                this.dragZone.destroy(); 
            } 
        } 
        if (this.dropZone) { 
            if (this.dropZone.destroy) { 
                this.dropZone.destroy(); 
            } 
        } 
    }, 

/**    Allows this class to be an Ext.form.Field so it can be found using {@link Ext.form.BasicForm#findField}. */ 
    getName: function() { 
        return this.name; 
    }, 

/**    Loads the View from a JSON string representing the Records to put into the Store. */ 
    setValue: function(v) { 
        if (!this.store) { 
            throw "DDView.setValue(). DDView must be constructed with a valid Store"; 
        } 
        var data = {}; 
        data[this.store.reader.meta.root] = v ? [].concat(v) : []; 
        this.store.proxy = new Ext.data.MemoryProxy(data); 
        this.store.load(); 
    }, 

/**    @return {String} a parenthesised list of the ids of the Records in the View. */ 
    getValue: function() { 
        var result = '('; 
        this.store.each(function(rec) { 
            result += rec.id + ','; 
        }); 
        return result.substr(0, result.length - 1) + ')'; 
    }, 
     
    getIds: function() { 
        var i = 0, result = new Array(this.store.getCount()); 
        this.store.each(function(rec) { 
            result[i++] = rec.id; 
        }); 
        return result; 
    }, 
     
    isDirty: function() { 
        return this.isDirtyFlag; 
    }, 

/** 
 *    Part of the Ext.dd.DropZone interface. If no target node is found, the 
 *    whole Element becomes the target, and this causes the drop gesture to append. 
 */ 
    getTargetFromEvent : function(e) { 
        var target = e.getTarget(); 
        while ((target !== null) && (target.parentNode != this.el.dom)) { 
            target = target.parentNode; 
        } 
        if (!target) { 
            target = this.el.dom.lastChild || this.el.dom; 
        } 
        return target; 
    }, 

/** 
 *    Create the drag data which consists of an object which has the property "ddel" as 
 *    the drag proxy element.  
 */ 
    getDragData : function(e) { 
        var target = this.findItemFromChild(e.getTarget()); 
        if(target) { 
            if (!this.isSelected(target)) { 
                delete this.ignoreNextClick; 
                this.onItemClick(target, this.indexOf(target), e); 
                this.ignoreNextClick = true; 
            } 
            var dragData = { 
                sourceView: this, 
                viewNodes: [], 
                records: [], 
                copy: this.copy || (this.allowCopy && e.ctrlKey) 
            }; 
            if (this.getSelectionCount() == 1) { 
                var i = this.getSelectedIndexes()[0]; 
                var n = this.getNode(i); 
                dragData.viewNodes.push(dragData.ddel = n); 
                dragData.records.push(this.store.getAt(i)); 
                dragData.repairXY = Ext.fly(n).getXY(); 
            } else { 
                dragData.ddel = document.createElement('div'); 
                dragData.ddel.className = 'multi-proxy'; 
                this.collectSelection(dragData); 
            } 
            return dragData; 
        } 
        return false; 
    }, 

//    override the default repairXY. 
    getRepairXY : function(e){ 
        return this.dragData.repairXY; 
    }, 

/**    Put the selections into the records and viewNodes Arrays. */ 
    collectSelection: function(data) { 
        data.repairXY = Ext.fly(this.getSelectedNodes()[0]).getXY(); 
        if (this.preserveSelectionOrder === true) { 
            Ext.each(this.getSelectedIndexes(), function(i) { 
                var n = this.getNode(i); 
                var dragNode = n.cloneNode(true); 
                dragNode.id = Ext.id(); 
                data.ddel.appendChild(dragNode); 
                data.records.push(this.store.getAt(i)); 
                data.viewNodes.push(n); 
            }, this); 
        } else { 
            var i = 0; 
            this.store.each(function(rec){ 
                if (this.isSelected(i)) { 
                    var n = this.getNode(i); 
                    var dragNode = n.cloneNode(true); 
                    dragNode.id = Ext.id(); 
                    data.ddel.appendChild(dragNode); 
                    data.records.push(this.store.getAt(i)); 
                    data.viewNodes.push(n); 
                } 
                i++; 
            }, this); 
        } 
    }, 
     
/**    Specify to which ddGroup items in this DDView may be dragged. */ 
    setDraggable: function(ddGroup) { 
        if (ddGroup instanceof Array) { 
            Ext.each(ddGroup, this.setDraggable, this); 
            return; 
        } 
        if (this.dragZone) { 
            this.dragZone.addToGroup(ddGroup); 
        } else { 
            this.dragZone = new Ext.dd.DragZone(this.getEl(), { 
                containerScroll: true, 
                ddGroup: ddGroup 
            }); 
//            Draggability implies selection. DragZone's mousedown selects the element. 
            if (!this.multiSelect) { this.singleSelect = true; } 

//            Wire the DragZone's handlers up to methods in *this* 
            this.dragZone.getDragData = this.getDragData.createDelegate(this); 
            this.dragZone.getRepairXY = this.getRepairXY; 
            this.dragZone.onEndDrag = this.onEndDrag; 
        } 
    }, 

/**    Specify from which ddGroup this DDView accepts drops. */ 
    setDroppable: function(ddGroup) { 
        if (ddGroup instanceof Array) { 
            Ext.each(ddGroup, this.setDroppable, this); 
            return; 
        } 
        if (this.dropZone) { 
            this.dropZone.addToGroup(ddGroup); 
        } else { 
            this.dropZone = new Ext.dd.DropZone(this.getEl(), { 
                owningView: this, 
                containerScroll: true, 
                ddGroup: ddGroup 
            }); 

//            Wire the DropZone's handlers up to methods in *this* 
            this.dropZone.getTargetFromEvent = this.getTargetFromEvent.createDelegate(this); 
            this.dropZone.onNodeEnter = this.onNodeEnter.createDelegate(this); 
            this.dropZone.onNodeOver = this.onNodeOver.createDelegate(this); 
            this.dropZone.onNodeOut = this.onNodeOut.createDelegate(this); 
            this.dropZone.onNodeDrop = this.onNodeDrop.createDelegate(this); 
        } 
    }, 

/**    Decide whether to drop above or below a View node. */ 
    getDropPoint : function(e, n, dd){ 
        if (n == this.el.dom) { return "above"; } 
        var t = Ext.lib.Dom.getY(n), b = t + n.offsetHeight; 
        var c = t + (b - t) / 2; 
        var y = Ext.lib.Event.getPageY(e); 
        if(y <= c) { 
            return "above"; 
        }else{ 
            return "below"; 
        } 
    }, 
     
    isValidDropPoint: function(pt, n, data) { 
        if (!data.viewNodes || (data.viewNodes.length != 1)) { 
            return true; 
        } 
        var d = data.viewNodes[0]; 
        if (d == n) { 
            return false; 
        } 
        if ((pt == "below") && (n.nextSibling == d)) { 
            return false; 
        } 
        if ((pt == "above") && (n.previousSibling == d)) { 
            return false; 
        } 
        return true; 
    }, 

    onNodeEnter : function(n, dd, e, data){ 
    	if (this.highlightColor && (data.sourceView != this)) {
	    	this.el.highlight(this.highlightColor);
	    }
        return false; 
    }, 
     
    onNodeOver : function(n, dd, e, data){ 
        var dragElClass = this.dropNotAllowed; 
        var pt = this.getDropPoint(e, n, dd); 
        if (this.isValidDropPoint(pt, n, data)) { 
    		if (this.appendOnly || this.sortField) {
    			return "x-tree-drop-ok-below";
    		}

//            set the insert point style on the target node 
            if (pt) { 
                var targetElClass; 
                if (pt == "above"){ 
                    dragElClass = n.previousSibling ? "x-tree-drop-ok-between" : "x-tree-drop-ok-above"; 
                    targetElClass = "x-view-drag-insert-above"; 
                } else { 
                    dragElClass = n.nextSibling ? "x-tree-drop-ok-between" : "x-tree-drop-ok-below"; 
                    targetElClass = "x-view-drag-insert-below"; 
                } 
                if (this.lastInsertClass != targetElClass){ 
                    Ext.fly(n).replaceClass(this.lastInsertClass, targetElClass); 
                    this.lastInsertClass = targetElClass; 
                } 
            } 
        } 
        return dragElClass; 
    }, 

    onNodeOut : function(n, dd, e, data){ 
        this.removeDropIndicators(n); 
    }, 

    onNodeDrop : function(n, dd, e, data){ 
        if (this.fireEvent("drop", this, n, dd, e, data) === false) { 
            return false; 
        } 
        var pt = this.getDropPoint(e, n, dd); 
        var insertAt = (this.appendOnly || (n == this.el.dom)) ? this.store.getCount() : n.viewIndex; 
        if (pt == "below") { 
            insertAt++; 
        } 

//        Validate if dragging within a DDView 
        if (data.sourceView == this) { 
//            If the first element to be inserted below is the target node, remove it 
            if (pt == "below") { 
                if (data.viewNodes[0] == n) { 
                    data.viewNodes.shift(); 
                } 
            } else { //    If the last element to be inserted above is the target node, remove it 
                if (data.viewNodes[data.viewNodes.length - 1] == n) { 
                    data.viewNodes.pop(); 
                } 
            } 
     
//            Nothing to drop... 
            if (!data.viewNodes.length) { 
                return false; 
            } 

//            If we are moving DOWN, then because a store.remove() takes place first, 
//            the insertAt must be decremented. 
            if (insertAt > this.store.indexOf(data.records[0])) { 
                insertAt--; 
            } 
        } 

//        Dragging from a Tree. Use the Tree's recordFromNode function. 
        if (data.node instanceof Ext.tree.TreeNode) { 
            var r = data.node.getOwnerTree().recordFromNode(data.node); 
            if (r) { 
                data.records = [ r ]; 
            } 
        } 
         
        if (!data.records) { 
            alert("Programming problem. Drag data contained no Records"); 
            return false; 
        } 

        for (var i = 0; i < data.records.length; i++) { 
            var r = data.records[i]; 
            var dup = this.store.getById(r.id); 
            if (dup && (dd != this.dragZone)) { 
				if(!this.allowDup && !this.allowTrash){
                	Ext.fly(this.getNode(this.store.indexOf(dup))).frame("red", 1); 
					return true
				}
				var x=new Ext.data.Record();
				r.id=x.id;
				delete x;
			}
            if (data.copy) { 
                this.store.insert(insertAt++, r.copy()); 
            } else { 
                if (data.sourceView) { 
                    data.sourceView.isDirtyFlag = true; 
                    data.sourceView.store.remove(r); 
                } 
                if(!this.allowTrash)this.store.insert(insertAt++, r); 
            } 
			if(this.sortField){
				this.store.sort(this.sortField, this.sortDir);
			}
            this.isDirtyFlag = true; 
        } 
        this.dragZone.cachedTarget = null; 
        return true; 
    }, 

//    Ensure the multi proxy is removed 
    onEndDrag: function(data, e) { 
        var d = Ext.get(this.dragData.ddel); 
        if (d && d.hasClass("multi-proxy")) { 
            d.remove(); 
            //delete this.dragData.ddel; 
        } 
    }, 

    removeDropIndicators : function(n){ 
        if(n){ 
            Ext.fly(n).removeClass([ 
                "x-view-drag-insert-above", 
				"x-view-drag-insert-left",
				"x-view-drag-insert-right",
                "x-view-drag-insert-below"]); 
            this.lastInsertClass = "_noclass"; 
        } 
    }, 

/** 
 *    Utility method. Add a delete option to the DDView's context menu. 
 *    @param {String} imageUrl The URL of the "delete" icon image. 
 */ 
    setDeletable: function(imageUrl) { 
        if (!this.singleSelect && !this.multiSelect) { 
            this.singleSelect = true; 
        } 
        var c = this.getContextMenu(); 
        this.contextMenu.on("itemclick", function(item) { 
            switch (item.id) { 
                case "delete": 
                    this.remove(this.getSelectedIndexes()); 
                    break; 
            } 
        }, this); 
        this.contextMenu.add({ 
            icon: imageUrl || AU.resolveUrl("/images/delete.gif"), 
            id: "delete", 
            text: AU.getMessage("deleteItem") 
        }); 
    }, 
     
/**    Return the context menu for this DDView. */ 
    getContextMenu: function() { 
        if (!this.contextMenu) { 
//            Create the View's context menu 
            this.contextMenu = new Ext.menu.Menu({ 
                id: this.id + "-contextmenu" 
            }); 
            this.el.on("contextmenu", this.showContextMenu, this); 
        } 
        return this.contextMenu; 
    }, 
     
    disableContextMenu: function() { 
        if (this.contextMenu) { 
            this.el.un("contextmenu", this.showContextMenu, this); 
        } 
    }, 

    showContextMenu: function(e, item) { 
        item = this.findItemFromChild(e.getTarget()); 
        if (item) { 
            e.stopEvent(); 
            this.select(this.getNode(item), this.multiSelect && e.ctrlKey, true); 
            this.contextMenu.showAt(e.getXY()); 
        } 
    }, 

/** 
 *    Remove {@link Ext.data.Record}s at the specified indices. 
 *    @param {Array/Number} selectedIndices The index (or Array of indices) of Records to remove. 
 */ 
    remove: function(selectedIndices) { 
        selectedIndices = [].concat(selectedIndices); 
        for (var i = 0; i < selectedIndices.length; i++) { 
            var rec = this.store.getAt(selectedIndices[i]); 
            this.store.remove(rec); 
        } 
    }, 

/** 
 *    Double click fires the event, but also, if this is draggable, and there is only one other 
 *    related DropZone that is in another DDView, it drops the selected node on that DDView. 
 */ 
    onDblClick : function(e){ 
        var item = this.findItemFromChild(e.getTarget()); 
        if(item){ 
            if (this.fireEvent("dblclick", this, this.indexOf(item), item, e) === false) { 
                return false; 
            } 
            if (this.dragGroup) { 
                var targets = Ext.dd.DragDropMgr.getRelated(this.dragZone, true); 

//                Remove instances of this View's DropZone 
                while (targets.contains(this.dropZone)) { 
                    targets.remove(this.dropZone); 
                } 

//                If there's only one other DropZone, and it is owned by a DDView, then drop it in 
                if ((targets.length == 1) && (targets[0].owningView)) { 
                    this.dragZone.cachedTarget = null; 
                    var el = Ext.get(targets[0].getEl()); 
                    var box = el.getBox(true); 
                    targets[0].onNodeDrop(el.dom, { 
                        target: el.dom, 
                        xy: [box.x, box.y + box.height - 1] 
                    }, null, this.getDragData(e)); 
                } 
            } 
        } 
    }, 
     
    onItemClick : function(item, index, e){ 
//        The DragZone's mousedown->getDragData already handled selection 
        if (this.ignoreNextClick) { 
            delete this.ignoreNextClick; 
            return; 
        } 

        if(this.fireEvent("beforeclick", this, index, item, e) === false){ 
            return false; 
        } 
        if(this.multiSelect || this.singleSelect){ 
            if(this.multiSelect && e.shiftKey && this.lastSelection){ 
                this.select(this.getNodes(this.indexOf(this.lastSelection), index), false); 
            } else if (this.isSelected(item) && e.ctrlKey) { 
                this.deselect(item); 
            }else{ 
                this.deselect(item); 
                this.select(item, this.multiSelect && e.ctrlKey); 
                this.lastSelection = item; 
            } 
            e.preventDefault(); 
        } 
        return true; 
    } 
});  
;//version 3.0

Ext.ux.Multiselect = Ext.extend(Ext.form.Field,  {
	store:null,
	dataFields:[],
	data:[],
	width:100,
	height:100,
	displayField:0,
	valueField:1,
	allowBlank:true,
	minLength:0,
	maxLength:Number.MAX_VALUE,
	blankText:Ext.form.TextField.prototype.blankText,
	minLengthText:'Minimum {0} item(s) required',
	maxLengthText:'Maximum {0} item(s) allowed',
	copy:false,
	allowDup:false,
	allowTrash:false,
	legend:null,
	focusClass:undefined,
	delimiter:',',
	view:null,
	dragGroup:null,
	dropGroup:null,
	tbar:null,
	appendOnly:false,
	sortField:null,
	sortDir:'ASC',
	defaultAutoCreate : {tag: "div"},
	
    initComponent: function(){
		Ext.ux.Multiselect.superclass.initComponent.call(this);
		this.addEvents({
			'dblclick' : true,
			'click' : true,
			'change' : true,
			'drop' : true
		});		
	},
    onRender: function(ct, position){
		var fs, cls, tpl;
		Ext.ux.Multiselect.superclass.onRender.call(this, ct, position);

		cls = 'ux-mselect';

		fs = new Ext.form.FieldSet({
			renderTo:this.el,
			title:this.legend,
			height:this.height,
			width:this.width,
			style:"padding:1px;",
			tbar:this.tbar
		});
		//if(!this.legend)fs.el.down('.'+fs.headerCls).remove();  //by fzx
		fs.body.addClass(cls);

		tpl = '<tpl for="."><div class="' + cls + '-item';
		if(Ext.isIE || Ext.isIE7)tpl+='" unselectable=on';
		else tpl+=' x-unselectable"';
		tpl+='>{' + this.displayField + '}</div></tpl>';

		if(!this.store){
			this.store = new Ext.data.SimpleStore({
				fields: this.dataFields,
				data : this.data
			});
		}

		this.view = new Ext.ux.DDView({
			multiSelect: true, store: this.store, selectedClass: cls+"-selected", tpl:tpl,
			allowDup:this.allowDup, copy: this.copy, allowTrash: this.allowTrash, 
			dragGroup: this.dragGroup, dropGroup: this.dropGroup, itemSelector:"."+cls+"-item",
			isFormField:false, applyTo:fs.body, appendOnly:this.appendOnly,
			sortField:this.sortField, sortDir:this.sortDir
		});

		fs.add(this.view);
		
		this.view.on('click', this.onViewClick, this);
		this.view.on('beforeClick', this.onViewBeforeClick, this);
		this.view.on('dblclick', this.onViewDblClick, this);
		this.view.on('drop', function(ddView, n, dd, e, data){
	    	return this.fireEvent("drop", ddView, n, dd, e, data);
		}, this);
		
		this.hiddenName = this.name;
		var hiddenTag={tag: "input", type: "hidden", value: "", name:this.name};
		if (this.isFormField) { 
			this.hiddenField = this.el.createChild(hiddenTag);
		} else {
			this.hiddenField = Ext.get(document.body).createChild(hiddenTag);
		}
		fs.doLayout();
	},
	
	initValue:Ext.emptyFn,
	
	onViewClick: function(vw, index, node, e) {
		var arrayIndex = this.preClickSelections.indexOf(index);
		if (arrayIndex  != -1)
		{
			this.preClickSelections.splice(arrayIndex, 1);
			this.view.clearSelections(true);
			this.view.select(this.preClickSelections);
		}
		this.fireEvent('change', this, this.getValue(), this.hiddenField.dom.value);
		this.hiddenField.dom.value = this.getValue();
		this.fireEvent('click', this, e);
		this.validate();		
	},

	onViewBeforeClick: function(vw, index, node, e) {
		this.preClickSelections = this.view.getSelectedIndexes();
		if (this.disabled) {return false;}
	},

	onViewDblClick : function(vw, index, node, e) {
		return this.fireEvent('dblclick', vw, index, node, e);
	},	
	
	getValue: function(valueField){
		var returnArray = [];
		var selectionsArray = this.view.getSelectedIndexes();
		if (selectionsArray.length == 0) {return '';}
		for (var i=0; i<selectionsArray.length; i++) {
			returnArray.push(this.store.getAt(selectionsArray[i]).get(((valueField != null)? valueField : this.valueField)));
		}
		return returnArray.join(this.delimiter);
	},

	setValue: function(values) {
		var index;
		var selections = [];
		this.view.clearSelections();
		this.hiddenField.dom.value = '';
		
		if (!values || (values == '')) { return; }
		
		if (!(values instanceof Array)) { values = values.split(this.delimiter); }
		for (var i=0; i<values.length; i++) {
			index = this.view.store.indexOf(this.view.store.query(this.valueField, 
				new RegExp('^' + values[i] + '$', "i")).itemAt(0));
			selections.push(index);
		}
		this.view.select(selections);
		this.hiddenField.dom.value = this.getValue();
		this.validate();
	},
	
	reset : function() {
		this.setValue('');
	},
	
	getRawValue: function(valueField) {
        var tmp = this.getValue(valueField);
        if (tmp.length) {
            tmp = tmp.split(this.delimiter);
        }
        else{
            tmp = [];
        }
        return tmp;
    },

    setRawValue: function(values){
        setValue(values);
    },

    validateValue : function(value){
        if (value.length < 1) { // if it has no value
             if (this.allowBlank) {
                 this.clearInvalid();
                 return true;
             } else {
                 this.markInvalid(this.blankText);
                 return false;
             }
        }
        if (value.length < this.minLength) {
            this.markInvalid(String.format(this.minLengthText, this.minLength));
            return false;
        }
        if (value.length > this.maxLength) {
            this.markInvalid(String.format(this.maxLengthText, this.maxLength));
            return false;
        }
        return true;
    }
});

Ext.reg("multiselect", Ext.ux.Multiselect);

Ext.ux.ItemSelector = Ext.extend(Ext.form.Field,  {
	msWidth:200,
	msHeight:300,
	hideNavIcons:false,
	imagePath:"",
	iconUp:"/media/images/divo/up2.gif",
	iconDown:"/media/images/divo/down2.gif",
	iconLeft:"/media/images/divo/left2.gif",
	iconRight:"/media/images/divo/right2.gif",
	iconTop:"/media/images/divo/top2.gif",
	iconBottom:"/media/images/divo/bottom2.gif",
	drawUpIcon:true,
	drawDownIcon:true,
	drawLeftIcon:true,
	drawRightIcon:true,
	drawTopIcon:true,
	drawBotIcon:true,
	fromStore:null,
	toStore:null,
	fromData:null, 
	toData:null,
	displayField:0,
	valueField:1,
	switchToFrom:false,
	allowDup:false,
	focusClass:undefined,
	delimiter:',',
	readOnly:false,
	toLegend:null,
	fromLegend:null,
	toSortField:null,
	fromSortField:null,
	toSortDir:'ASC',
	fromSortDir:'ASC',
	toTBar:null,
	fromTBar:null,
	bodyStyle:null,
	border:false,
	defaultAutoCreate:{tag: "div"},
	
    initComponent: function(){
		Ext.ux.ItemSelector.superclass.initComponent.call(this);
		this.addEvents({
			'rowdblclick' : true,
			'change' : true
		});			
	},

    onRender: function(ct, position){
		Ext.ux.ItemSelector.superclass.onRender.call(this, ct, position);

		this.fromMultiselect = new Ext.ux.Multiselect({
			legend: this.fromLegend,
			delimiter: this.delimiter,
			allowDup: this.allowDup,
			copy: this.allowDup,
			allowTrash: this.allowDup,
			dragGroup: this.readOnly ? null : "drop2-"+this.el.dom.id,
			dropGroup: this.readOnly ? null : "drop2-"+this.el.dom.id+",drop1-"+this.el.dom.id,
			width: this.msWidth,
			height: this.msHeight,
			dataFields: this.dataFields,
			data: this.fromData,
			displayField: this.displayField,
			valueField: this.valueField,
			store: this.fromStore,
			isFormField: false,
			tbar: this.fromTBar,
			appendOnly: true,
			sortField: this.fromSortField,
			sortDir: this.fromSortDir
		});
		this.fromMultiselect.on('dblclick', this.onRowDblClick, this);

		if (!this.sorterOnly) {
			if (!this.toStore) {
				this.toStore = new Ext.data.SimpleStore({
					fields: this.dataFields,
					data : this.toData
				});
			}
			this.toStore.on('add', this.valueChanged, this);
			this.toStore.on('remove', this.valueChanged, this);
			this.toStore.on('load', this.valueChanged, this);

			this.toMultiselect = new Ext.ux.Multiselect({
				legend: this.toLegend,
				delimiter: this.delimiter,
				allowDup: this.allowDup,
				dragGroup: this.readOnly ? null : "drop1-"+this.el.dom.id,
				dropGroup: this.readOnly ? null : "drop2-"+this.el.dom.id+",drop1-"+this.el.dom.id,
				width: this.msWidth,
				height: this.msHeight,
				displayField: this.displayField,
				valueField: this.valueField,
				store: this.toStore,
				isFormField: false,
				tbar: this.toTBar,
				sortField: this.toSortField,
				sortDir: this.toSortDir
			});
			this.toMultiselect.on('dblclick', this.onRowDblClick, this);
		} //by fzx
		
		var p = new Ext.Panel({
			bodyStyle:this.bodyStyle,
			border:this.border,
			layout:"table",
			layoutConfig:{columns:3}
		});
		
		this.onRenderOther(p) //by fzx
		
		p.add(this.switchToFrom ? this.toMultiselect : this.fromMultiselect);
		var icons = new Ext.Panel({header:false});
		p.add(icons);
		if (!this.sorterOnly) //by fzx
			p.add(this.switchToFrom ? this.fromMultiselect : this.toMultiselect);
		p.render(this.el);
		icons.el.down('.'+icons.bwrapCls).remove();

		if (this.imagePath!="" && this.imagePath.charAt(this.imagePath.length-1)!="/")
			this.imagePath+="/";
		this.iconUp = this.imagePath + (this.iconUp || 'up2.gif');
		this.iconDown = this.imagePath + (this.iconDown || 'down2.gif');
		this.iconLeft = this.imagePath + (this.iconLeft || 'left2.gif');
		this.iconRight = this.imagePath + (this.iconRight || 'right2.gif');
		this.iconTop = this.imagePath + (this.iconTop || 'top2.gif');
		this.iconBottom = this.imagePath + (this.iconBottom || 'bottom2.gif');
		var el=icons.getEl();
		if (!this.toSortField) {
			this.toTopIcon = el.createChild({tag:'img', src:this.iconTop, style:{cursor:'pointer', margin:'2px'}});
			el.createChild({tag: 'br'});
			this.upIcon = el.createChild({tag:'img', src:this.iconUp, style:{cursor:'pointer', margin:'2px'}});
			el.createChild({tag: 'br'});
		}
		if (!this.sorterOnly) {
			this.addIcon = el.createChild({tag:'img', src:this.switchToFrom?this.iconLeft:this.iconRight, style:{cursor:'pointer', margin:'2px'}});
			el.createChild({tag: 'br'});
			this.removeIcon = el.createChild({tag:'img', src:this.switchToFrom?this.iconRight:this.iconLeft, style:{cursor:'pointer', margin:'2px'}});
			el.createChild({tag: 'br'});
		} // by fzx
		if (!this.toSortField) {
			this.downIcon = el.createChild({tag:'img', src:this.iconDown, style:{cursor:'pointer', margin:'2px'}});
			el.createChild({tag: 'br'});
			this.toBottomIcon = el.createChild({tag:'img', src:this.iconBottom, style:{cursor:'pointer', margin:'2px'}});
		}
		if (!this.readOnly) {
			if (!this.toSortField) {
				if (!this.sorterOnly) {
					this.toTopIcon.on('click', this.toTop, this);
					this.upIcon.on('click', this.up, this);
					this.downIcon.on('click', this.down, this);
					this.toBottomIcon.on('click', this.toBottom, this);
		        } else {
					this.toTopIcon.on('click', this.toTop2, this);
					this.upIcon.on('click', this.up2, this);
					this.downIcon.on('click', this.down2, this);
					this.toBottomIcon.on('click', this.toBottom2, this);
		        } // by fzx
			}
		    if (!this.sorterOnly) {
				this.addIcon.on('click', this.fromTo, this);
				this.removeIcon.on('click', this.toFrom, this);
			} // by fzx
		}
		if (!this.drawUpIcon || this.hideNavIcons) { this.upIcon.dom.style.display='none'; }
		if (!this.drawDownIcon || this.hideNavIcons) { this.downIcon.dom.style.display='none'; }
		if (!this.sorterOnly) {
			if (!this.drawLeftIcon || this.hideNavIcons) { this.addIcon.dom.style.display='none'; }
			if (!this.drawRightIcon || this.hideNavIcons) { this.removeIcon.dom.style.display='none'; }
        } // by fzx
		if (!this.drawTopIcon || this.hideNavIcons) { this.toTopIcon.dom.style.display='none'; }
		if (!this.drawBotIcon || this.hideNavIcons) { this.toBottomIcon.dom.style.display='none'; }

		var tb = p.body.first();
		this.el.setWidth(p.body.first().getWidth());
		p.body.removeClass();
		
		this.hiddenName = this.name;
		var hiddenTag={tag: "input", type: "hidden", value: "", name:this.name};
		this.hiddenField = this.el.createChild(hiddenTag);
		if (!this.sorterOnly) // by fzx
			this.valueChanged(this.toStore);
	},
	
	initValue:Ext.emptyFn,
	
	toTop : function() {
		var selectionsArray = this.toMultiselect.view.getSelectedIndexes();
		var records = [];
		if (selectionsArray.length > 0) {
			selectionsArray.sort();
			for (var i=0; i<selectionsArray.length; i++) {
				record = this.toMultiselect.view.store.getAt(selectionsArray[i]);
				records.push(record);
			}
			selectionsArray = [];
			for (var i=records.length-1; i>-1; i--) {
				record = records[i];
				this.toMultiselect.view.store.remove(record);
				this.toMultiselect.view.store.insert(0, record);
				selectionsArray.push(((records.length - 1) - i));
			}
		}
		this.toMultiselect.view.refresh();
		this.toMultiselect.view.select(selectionsArray);
	},

	toBottom : function() {
		var selectionsArray = this.toMultiselect.view.getSelectedIndexes();
		var records = [];
		if (selectionsArray.length > 0) {
			selectionsArray.sort();
			for (var i=0; i<selectionsArray.length; i++) {
				record = this.toMultiselect.view.store.getAt(selectionsArray[i]);
				records.push(record);
			}
			selectionsArray = [];
			for (var i=0; i<records.length; i++) {
				record = records[i];
				this.toMultiselect.view.store.remove(record);
				this.toMultiselect.view.store.add(record);
				selectionsArray.push((this.toMultiselect.view.store.getCount()) - (records.length - i));
			}
		}
		this.toMultiselect.view.refresh();
		this.toMultiselect.view.select(selectionsArray);
	},
	
	up : function() {
		var record = null;
		var selectionsArray = this.toMultiselect.view.getSelectedIndexes();
		selectionsArray.sort();
		var newSelectionsArray = [];
		if (selectionsArray.length > 0) {
			for (var i=0; i<selectionsArray.length; i++) {
				record = this.toMultiselect.view.store.getAt(selectionsArray[i]);
				if ((selectionsArray[i] - 1) >= 0) {
					this.toMultiselect.view.store.remove(record);
					this.toMultiselect.view.store.insert(selectionsArray[i] - 1, record);
					newSelectionsArray.push(selectionsArray[i] - 1);
				}
			}
			this.toMultiselect.view.refresh();
			this.toMultiselect.view.select(newSelectionsArray);
		}
	},

	down : function() {
		var record = null;
		var selectionsArray = this.toMultiselect.view.getSelectedIndexes();
		selectionsArray.sort();
		selectionsArray.reverse();
		var newSelectionsArray = [];
		if (selectionsArray.length > 0) {
			for (var i=0; i<selectionsArray.length; i++) {
				record = this.toMultiselect.view.store.getAt(selectionsArray[i]);
				if ((selectionsArray[i] + 1) < this.toMultiselect.view.store.getCount()) {
					this.toMultiselect.view.store.remove(record);
					this.toMultiselect.view.store.insert(selectionsArray[i] + 1, record);
					newSelectionsArray.push(selectionsArray[i] + 1);
				}
			}
			this.toMultiselect.view.refresh();
			this.toMultiselect.view.select(newSelectionsArray);
		}
	},
	
	fromTo : function() {
		var selectionsArray = this.fromMultiselect.view.getSelectedIndexes();
		var records = [];
		if (selectionsArray.length > 0) {
			for (var i=0; i<selectionsArray.length; i++) {
				record = this.fromMultiselect.view.store.getAt(selectionsArray[i]);
				records.push(record);
			}
			if(!this.allowDup)selectionsArray = [];
			for (var i=0; i<records.length; i++) {
				record = records[i];
				if(this.allowDup){
					var x=new Ext.data.Record();
					record.id=x.id;
					delete x;	
					this.toMultiselect.view.store.add(record);
				}else{
					this.fromMultiselect.view.store.remove(record);
					this.toMultiselect.view.store.add(record);
					selectionsArray.push((this.toMultiselect.view.store.getCount() - 1));
				}
			}
		}
		this.toMultiselect.view.refresh();
		this.fromMultiselect.view.refresh();
		if(this.toSortField)this.toMultiselect.store.sort(this.toSortField, this.toSortDir);
		if(this.allowDup)this.fromMultiselect.view.select(selectionsArray);
		else this.toMultiselect.view.select(selectionsArray);
	},
	
	toFrom : function() {
		var selectionsArray = this.toMultiselect.view.getSelectedIndexes();
		var records = [];
		if (selectionsArray.length > 0) {
			for (var i=0; i<selectionsArray.length; i++) {
				record = this.toMultiselect.view.store.getAt(selectionsArray[i]);
				records.push(record);
			}
			selectionsArray = [];
			for (var i=0; i<records.length; i++) {
				record = records[i];
				this.toMultiselect.view.store.remove(record);
				if(!this.allowDup){
					this.fromMultiselect.view.store.add(record);
					selectionsArray.push((this.fromMultiselect.view.store.getCount() - 1));
				}
			}
		}
		this.fromMultiselect.view.refresh();
		this.toMultiselect.view.refresh();
		if(this.fromSortField)this.fromMultiselect.store.sort(this.fromSortField, this.fromSortDir);
		this.fromMultiselect.view.select(selectionsArray);
	},
	
	valueChanged: function(store) {
		var record = null;
		var values = [];
		for (var i=0; i<store.getCount(); i++) {
			record = store.getAt(i);
			values.push(record.get(this.valueField));
		}
		this.hiddenField.dom.value = values.join(this.delimiter);
		this.fireEvent('change', this, this.getValue(), this.hiddenField.dom.value);
	},
	
	getValue : function() {
        if (!this.sorterOnly)		
			return this.hiddenField.dom.value;

		//by fzx    
		var values = [];
		var store = this.fromMultiselect.view.store;    
		for (var i=0; i<store.getCount(); i++) {
			record = store.getAt(i);
			values.push(record.get(this.valueField));
		}
		return values.join(this.delimiter);
	},
	
	onRowDblClick : function(vw, index, node, e) {
		return this.fireEvent('rowdblclick', vw, index, node, e);
	},
	
	reset: function(){
		range = this.toMultiselect.store.getRange();
		this.toMultiselect.store.removeAll();
		if (!this.allowDup) {
			this.fromMultiselect.store.add(range);
			this.fromMultiselect.store.sort(this.displayField,'ASC');
		}
		this.valueChanged(this.toMultiselect.store);
	},

	//added by fzx
	toTop2 : function() {
		var selectionsArray = this.fromMultiselect.view.getSelectedIndexes();
		var records = [];
		if (selectionsArray.length > 0) {
			selectionsArray.sort();
			for (var i=0; i<selectionsArray.length; i++) {
				record = this.fromMultiselect.view.store.getAt(selectionsArray[i]);
				records.push(record);
			}
			selectionsArray = [];
			for (var i=records.length-1; i>-1; i--) {
				record = records[i];
				this.fromMultiselect.view.store.remove(record);
				this.fromMultiselect.view.store.insert(0, record);
				selectionsArray.push(((records.length - 1) - i));
			}
		}
		this.fromMultiselect.view.refresh();
		this.fromMultiselect.view.select(selectionsArray);
	},

	//added by fzx
	toBottom2 : function() {
		var selectionsArray = this.fromMultiselect.view.getSelectedIndexes();
		var records = [];
		if (selectionsArray.length > 0) {
			selectionsArray.sort();
			for (var i=0; i<selectionsArray.length; i++) {
				record = this.fromMultiselect.view.store.getAt(selectionsArray[i]);
				records.push(record);
			}
			selectionsArray = [];
			for (var i=0; i<records.length; i++) {
				record = records[i];
				this.fromMultiselect.view.store.remove(record);
				this.fromMultiselect.view.store.add(record);
				selectionsArray.push((this.fromMultiselect.view.store.getCount()) - (records.length - i));
			}
		}
		this.fromMultiselect.view.refresh();
		this.fromMultiselect.view.select(selectionsArray);
	},
	
	//added by fzx
	up2 : function() {
		var record = null;
		var selectionsArray = this.fromMultiselect.view.getSelectedIndexes();
		selectionsArray.sort();
		var newSelectionsArray = [];
		if (selectionsArray.length > 0) {
			for (var i=0; i<selectionsArray.length; i++) {
				record = this.fromMultiselect.view.store.getAt(selectionsArray[i]);
				if ((selectionsArray[i] - 1) >= 0) {
					this.fromMultiselect.view.store.remove(record);
					this.fromMultiselect.view.store.insert(selectionsArray[i] - 1, record);
					newSelectionsArray.push(selectionsArray[i] - 1);
				}
			}
			this.fromMultiselect.view.refresh();
			this.fromMultiselect.view.select(newSelectionsArray);
		}
	},

	//added by fzx
	down2 : function() {
		var record = null;
		var selectionsArray = this.fromMultiselect.view.getSelectedIndexes();
		selectionsArray.sort();
		selectionsArray.reverse();
		var newSelectionsArray = [];
		if (selectionsArray.length > 0) {
			for (var i=0; i<selectionsArray.length; i++) {
				record = this.fromMultiselect.view.store.getAt(selectionsArray[i]);
				if ((selectionsArray[i] + 1) < this.fromMultiselect.view.store.getCount()) {
					this.fromMultiselect.view.store.remove(record);
					this.fromMultiselect.view.store.insert(selectionsArray[i] + 1, record);
					newSelectionsArray.push(selectionsArray[i] + 1);
				}
			}
			this.fromMultiselect.view.refresh();
			this.fromMultiselect.view.select(newSelectionsArray);
		}
	},

	onRenderOther : Ext.emptyFn

});

Ext.reg("itemselector", Ext.ux.ItemSelector);;/**
 * @author Robert Williams (vtswingkid)
 * @version 1.0.4
 * Thanks:  
 */
Ext.ux.RadioGroup = Ext.extend(Ext.form.Field,  {
    /**
     * @cfg {String} focusClass The CSS class to use when the checkbox receives focus (defaults to undefined)
     */
    focusClass : undefined,
    /**
     * @cfg {String} fieldClass The default CSS class for the checkbox (defaults to "x-form-field")
     */
    fieldClass: "x-form-field",
    /**
     * @cfg {Boolean} checked True if the the checkbox should render already checked (defaults to false)
     */
    checked: false,
    /**
     * @cfg {String/Object} autoCreate A DomHelper element spec, or true for a default element spec (defaults to
     * {tag: "input", type: "radio", autocomplete: "off"})
     */
    defaultAutoCreate : { tag: "input", type: 'radio', autocomplete: "off"},
    /**
     * @cfg {String} boxLabel The text that appears beside the checkbox
     */
	
	getId:function(){
		//if multiple radios are defined use this information
		if(this.radios && this.radios instanceof Array){
			if(this.radios.length){
				var r=this.radios[0];
				this.value=r.value;
				this.boxLabel=r.boxLabel;
				this.checked=r.checked || false;
				this.readOnly=r.readOnly || false;
				this.disabled=r.disabled || false;
				this.tabIndex=r.tabIndex;
				this.cls=r.cls;
				this.listeners=r.listeners;
				this.style=r.style;
				this.bodyStyle=r.bodyStyle;
				this.hideParent=r.hideParent;
				this.hidden=r.hidden;
			}
		}
		Ext.ux.RadioGroup.superclass.getId.call(this);
	},

	// private
    initComponent : function(){
        Ext.ux.RadioGroup.superclass.initComponent.call(this);
        this.addEvents(
            /**
             * @event change
             * Fires when the radio value changes.
             * @param {Ext.vx.RadioGroup} this This radio
             * @param {Boolean} checked The new checked value
             */
            'check'
        );
    },

    // private
    onResize : function(){
        Ext.ux.RadioGroup.superclass.onResize.apply(this, arguments);
        if(!this.boxLabel){
            this.el.alignTo(this.wrap, 'c-c');
        }
    },
    
    // private
    initEvents : function(){
        Ext.ux.RadioGroup.superclass.initEvents.call(this);
        this.el.on("click", this.onClick,  this);
        this.el.on("change", this.onClick,  this);
    },

	// private
    getResizeEl : function(){
        return this.wrap;
    },

    // private
    getPositionEl : function(){
        return this.wrap;
    },

    /**
     * Overridden and disabled. The editor element does not support standard valid/invalid marking. @hide
     * @method
     */
    markInvalid : Ext.emptyFn,
    /**
     * Overridden and disabled. The editor element does not support standard valid/invalid marking. @hide
     * @method
     */
    clearInvalid : Ext.emptyFn,

    // private
    onRender : function(ct, position){
        Ext.ux.RadioGroup.superclass.onRender.call(this, ct, position);
        this.wrap = this.el.wrap({cls: "x-form-check-wrap"});
        if(this.boxLabel){
            this.wrap.createChild({tag: 'label', htmlFor: this.el.id, cls: 'x-form-cb-label', html: this.boxLabel});
        }
		if(!this.isInGroup){
			this.wrap.applyStyles({'padding-top':'2px'});
		}
        if(this.checked){
            this.setChecked(true);
        }else{
            this.checked = this.el.dom.checked;
        }
		if (this.radios && this.radios instanceof Array) {
			this.els=new Array();
			this.els[0]=this.el;
			for(var i=1;i<this.radios.length;i++){
				var r=this.radios[i];
				this.els[i]=new Ext.ux.RadioGroup({
					renderTo:this.wrap,
					hideLabel:true,
					boxLabel:r.boxLabel,
					checked:r.checked || false,
					value:r.value,
					name:this.name || this.id,
					readOnly:r.readOnly || false,
					disabled:r.disabled || false,
					tabIndex:r.tabIndex,
					cls:r.cls,
					listeners:r.listeners,
					style:r.style,
					bodyStyle:r.bodyStyle,
					hideParent:r.hideParent,
					hidden:r.hidden,
					isInGroup:true
				});
				if (this.horizontal) {
					this.els[i].el.up('div.x-form-check-wrap').applyStyles({
						'display': 'inline',
						'padding-left': '5px'
					});
				}
			}
			if(this.hidden)this.hide();
		}
    },
    
    initValue : function(){
        if(this.value !== undefined){
            this.el.dom.value=this.value;
        }else if(this.el.dom.value.length > 0){
            this.value=this.el.dom.value;
        }
    },
	
    // private
    onDestroy : function(){
		if (this.radios && this.radios instanceof Array) {
			var cnt = this.radios.length;
			for(var x=1;x<cnt;x++){
				this.els[x].destroy();
			}
		}
        if(this.wrap){
            this.wrap.remove();
        }
        Ext.ux.RadioGroup.superclass.onDestroy.call(this);
    },

	setChecked:function(v){
        if(this.el && this.el.dom){
			var fire = false;
			if(v != this.checked)fire=true;
			this.checked=v;
            this.el.dom.checked = this.checked;
            this.el.dom.defaultChecked = this.checked;
    	    if(fire)this.fireEvent("check", this, this.checked);
	    }
    },
    /**
     * Returns the value of the checked radio.
     * @return {Mixed} value
     */
    getValue : function(){
        if(!this.rendered) {
            return this.value;
        }
        var p=this.el.up('form');//restrict to the form if it is in a form
		if(!p)p=Ext.getBody();
		var c=p.child('input[name='+escape(this.el.dom.name)+']:checked', true);
		return (c)?c.value:this.value;
    },

	// private
    onClick : function(){
        if(this.el.dom.checked != this.checked){
			var p = this.el.up('form');
			if (!p) 
				p = Ext.getBody();
			var els = p.select('input[name=' + escape(this.el.dom.name) + ']');
			els.each(function(el){
				if (el.dom.id == this.id) {
					this.setChecked(true);
				}
				else {
					var e = Ext.getCmp(el.dom.id);
					e.setChecked.apply(e, [false]);
				}
			}, this);
        }
    },

    /**
     * Checks the radio box with the matching value
     * @param {Mixed} v
     */

    setValue : function(v){
        if(!this.rendered) {
            this.value=v;
            return;
        }
        var p=this.el.up('form');//restrict to the form if it is in a form
        if(!p)p=Ext.getBody();
        var target = p.child('input[name=' + escape(this.el.dom.name) + '][value=' + v + ']', true);
        if (target) target.checked = true;
    },
	
	clear: function(){
		if (!this.rendered) return;
		var p = this.el.up('form');//restrict to the form if it is in a form
		if (!p) p = Ext.getBody();
		var c = p.child('input[name=' + escape(this.el.dom.name) + ']:checked', true);
		if (c) c.checked = false;
	},
	
	disable: function(){
		if (!this.rendered) return;
		var p = this.el.up('form');//restrict to the form if it is in a form
		if (!p) p = Ext.getBody();
		var els = p.select('input[name=' + escape(this.el.dom.name) + ']');
		els.each(function(el){
			if (el.dom.id == this.id) {
				Ext.ux.RadioGroup.superclass.disable.call(this);
			}
			else {
				var e = Ext.getCmp(el.dom.id);
				Ext.ux.RadioGroup.superclass.disable.call(e);
			}
		}, this);
	},
	
	enable: function(){
		if (!this.rendered) return;
		var p = this.el.up('form');//restrict to the form if it is in a form
		if (!p) p = Ext.getBody();
		var els = p.select('input[name=' + escape(this.el.dom.name) + ']');
		els.each(function(el){
			if (el.dom.id == this.id) {
				Ext.ux.RadioGroup.superclass.enable.call(this);
			}
			else {
				var e = Ext.getCmp(el.dom.id);
				Ext.ux.RadioGroup.superclass.enable.call(e);
			}
		}, this);
	},

	hide: function(){
		if (!this.rendered) return;
		this.wrap.hide();
		this.wrap.parent().parent().hide();
	},
	
	show: function(){
		if (!this.rendered) return;
		this.wrap.show();
		this.wrap.parent().parent().show();
	}
});
Ext.reg('ux-radiogroup', Ext.ux.RadioGroup);
//EOP
;/**
 * 显示即加载，并具有save功能的表单
 */
divo.form.EditAndSaveForm = Ext.extend(Ext.form.FormPanel, {
    initFocusFldName : null,
    url : null,
    saveRequestMethod : 'PUT',
    initFormBySelf : true, //是否由由外部驱动初始化表单
    sayAfterSaved : true,
    initComponent : function() {
        if (this.initFormBySelf)
            divo.waitFor(this.canInitForm,this.initForm,this)
            
        this.on('beforedestroy',function() {
            if (Ext.MessageBox.isVisible())
                Ext.MessageBox.hide();
        },this)
            
        divo.form.EditAndSaveForm.superclass.initComponent.call(this);
    },
    //public
    canInitForm : function() {
        var o = this.getForm()
        if (o)
            var fld = this.getForm().findField(this.initFocusFldName)
        return fld
    },
    //public
    initForm : function() {
        var f = this.getForm().findField(this.initFocusFldName)
        if (f)
            f.focus.defer(100, f)
        if (!this.initFormBySelf)
            this.loadItem()
        this.initFormAddon()
    },
    afterRender : function() {
        divo.form.EditAndSaveForm.superclass.afterRender.call(this)
        if (this.initFormBySelf)
            this.loadItem()
    },
    //子类可以重写
    initFormAddon : Ext.emptyFn,
    loadItem : function() {
        if (!this.url) return
        Ext.MessageBox.wait("正在加载...", '请稍候');
        
        var f = function() {
            Ext.Ajax.request({
                scope : this,
                url : this.url,
                method : 'GET',
                success : function(response, options) {
                    var resp = Ext.decode(response.responseText)
                    if (resp.success) {
                        this.getForm().setValues(resp.data)
                        this.afterLoadItem(resp.data)
                    }    
                    Ext.MessageBox.hide();
                },
                failure : function(response, options) {
                    Ext.MessageBox.hide();
                    this.alert(response.responseText);
                }
            })
        }
        f.defer(100,this)
    },
    //模板方法
    afterLoadItem : Ext.emptyFn,
    //模板方法
    validateBeforeSave : function(item) {
        return true
    },
    //子类可重写
    getSaveUrl : function() {
        return this.url
    },
    save : function(callbackFn) {
        if (!this.url) return
        var item = this.getForm().getObjectValues()
        if (!this.validateBeforeSave(item)) {
            return
        }
        Ext.MessageBox.wait("正在保存...", '请稍候');
        item = this.beforeSave(item)
        
        var f = function(item) {
            Ext.Ajax.request({
                scope : this,
                url : this.getSaveUrl(),
                async : false, //要求同步
                method : this.saveRequestMethod,
                jsonData : item,
                success : function(response, options) {
                    Ext.MessageBox.hide()
                    if(this.sayAfterSaved)
                        this.say("保存完毕")
                    if (callbackFn) callbackFn.call()
                },
                failure : function(response, options) {
                    Ext.MessageBox.hide();
                    this.alert(response.responseText)    
                }
            })
        }
        f.defer(100,this,[item])
    },
    //模板方法
    beforeSave : function(item) {
        return item
    }
    
})
// EOP

;/**
 * 新建或修改表单（基类）
 */
divo.form.AddOrEditForm = Ext.extend(Ext.form.FormPanel, {
	recordId : null,
	adding : false,
	initFocusFldName : null,
	labelWidth : 100,
	defaultType : "textfield",
	labelAlign : "right",
	autoScroll : true,
	bodyStyle : "padding:10px",
	initFormBySelf : true, //是否由外部调用initForm方法
	initComponent : function() {
		this.on('beforedestroy',function() {
			if (Ext.MessageBox.isVisible())
		    	Ext.MessageBox.hide();
		},this)
			
		divo.form.AddOrEditForm.superclass.initComponent.call(this);
	},
	//public
    initForm : function(t) {
    	if (!this.adding) 
    		this.loadItem()
    	
	    if (this.initFocusFldName)
			var f = this.getForm().findField(this.initFocusFldName)
			if (f)
				f.focus.defer(t?t:100, f)  
    },
    afterRender : function() {
    	divo.form.AddOrEditForm.superclass.afterRender.call(this)
    	if (this.initFormBySelf)
    		this.initForm.defer(100,this)
    },
	// public
	clearForm : function() {
		this.getForm().reset()
		this.initForm(1500) //新建成功后发出消息会刷新网格，造成焦点丢失，通过增加延时解决
	},
    //子类可以重写
    getLoadItemUrl : function(url,recordId) {
        if (url!=undefined) {
            return url + "/"+recordId
        } else {    
            if (!this.url || !this.recordId) 
                return null
            return this.url + "/"+this.recordId
        }
    },
	//子类可重写
	loadItem : function(url,recordId) {
        var url = this.getLoadItemUrl(url,recordId)
        if(!url) return

        Ext.MessageBox.wait("正在加载...", '请稍候');
		
		var f = function() {
			Ext.Ajax.request({
				scope : this,
				url : url,
				method : 'GET',
				success : function(response, options) {
					var resp = Ext.decode(response.responseText);
					this.getForm().setValues(resp.data)
					this.afterLoadItem(resp.data)
					this.oldData = resp.data
    	            Ext.MessageBox.hide();
				},
				failure : function(response, options) {
    	            Ext.MessageBox.hide();
					this.alert(response.responseText)
				}
			})
		}
		f.defer(100,this)
	},
	//模板方法
	afterLoadItem : Ext.emptyFn,
	//子类可重写
	getSaveUrl : function() {
		return this.url + (this.adding ? "" : "/" + this.recordId)
	},
	// public
	save : function(callbackOnSuccess) {
		var item = this.getForm().getObjectValues()
		if (!this.validateBeforeSave(item)) {
			return
		}
		Ext.MessageBox.wait("正在保存...", '请稍候');
		item = this.beforeSave(item)
		
		var f = function(item) {
			Ext.Ajax.request({
				scope : this,
				url : this.getSaveUrl(),
				method : (this.adding ? 'POST' : 'PUT'),
				async : true,	
				jsonData : item,
				success : function(response, options) {
    	            Ext.MessageBox.hide();
					var resp = Ext.decode(response.responseText)
					if (!resp.success) {
						this.say("输入数据验证未通过，请检查。")
						this.getForm().markInvalid(resp.errors)
						this.afterMarkInvalid()
					} else {
						this.afterSave(resp.id,item)
						if (typeof callbackOnSuccess == "function")
							callbackOnSuccess(resp.id,item)
					}
				},
				failure : function(response, options) {
    	            Ext.MessageBox.hide();
					this.alert(response.responseText)
				}
			})
		}
		f.defer(100,this,[item])
	},
	//模板方法
	validateBeforeSave : function(item) {
		return true
	},
	//模板方法
	beforeSave : function(item) {
		return item
	},
	//模板方法
	afterSave : Ext.emptyFn,
	//模板方法
	afterMarkInvalid : Ext.emptyFn,
	//public
	refreshForm : function(id) {
		this.recordId = id
		this.initForm()		
	}
})    
    
// EOP

;/**
 * Ext.ux.form.XCheckbox - checkbox with configurable submit values
 *
 * @author  Ing. Jozef Sakalos
 * @version $Id: Ext.ux.form.XCheckbox.js 313 2008-08-18 18:00:16Z jozo $
 * @date    10. February 2008
 *
 *
 * @license Ext.ux.form.XCheckbox is licensed under the terms of
 * the Open Source LGPL 3.0 license.  Commercial use is permitted to the extent
 * that the code/component(s) do NOT become part of another Open Source or Commercially
 * licensed development library or toolkit without explicit permission.
 * 
 * License details: http://www.gnu.org/licenses/lgpl.html
 */

/*global Ext */

/**
  * @class Ext.ux.XCheckbox
  * @extends Ext.form.Checkbox
  */
Ext.ns('Ext.ux.form');
Ext.ux.form.XCheckbox = Ext.extend(Ext.form.Checkbox, {
     submitOffValue:'false'
    ,submitOnValue:'true'

    ,onRender:function() {

        this.inputValue = this.submitOnValue;

        // call parent
        Ext.ux.form.XCheckbox.superclass.onRender.apply(this, arguments);

        // create hidden field that is submitted if checkbox is not checked
        this.hiddenField = this.wrap.insertFirst({tag:'input', type:'hidden'});

        // support tooltip
        if(this.tooltip) {
            this.imageEl.set({qtip:this.tooltip});
        }

        // update value of hidden field
        this.updateHidden();

    } // eo function onRender

    /**
     * Calls parent and updates hiddenField
     * @private
     */
    ,setValue:function(v) {
        v = this.convertValue(v);
        this.updateHidden(v);
        Ext.ux.form.XCheckbox.superclass.setValue.apply(this, arguments);
    } // eo function setValue

    /**
     * Updates hiddenField
     * @private
     */
    ,updateHidden:function(v) {
        v = undefined !== v ? v : this.checked;
        v = this.convertValue(v);
        if(this.hiddenField) {
            this.hiddenField.dom.value = v ? this.submitOnValue : this.submitOffValue;
            this.hiddenField.dom.name = v ? '' : this.el.dom.name;
        }
    } // eo function updateHidden

    /**
     * Converts value to boolean
     * @private
     */
    ,convertValue:function(v) {
        return (v === true || v === 'true' || v === this.submitOnValue || String(v).toLowerCase() === 'on');
    } // eo function convertValue

}); // eo extend

// register xtype
Ext.reg('xcheckbox', Ext.ux.form.XCheckbox);

// eo file 



;Ext.apply(Ext.DataView.prototype, {
	deselect:function(node, suppressEvent){
    if(this.isSelected(node)){
			var node = this.getNode(node);
			this.selected.removeElement(node);
			if(this.last == node.viewIndex){
				this.last = false;
			}
			Ext.fly(node).removeClass(this.selectedClass);
			if(!suppressEvent){
				this.fireEvent('selectionchange', this, this.selected.elements);
			}
		}
	}
});

Ext.namespace('Ext.ux.Andrie');

/**
 * @class Ext.ux.Andrie.Select
 * @extends Ext.form.ComboBox
 * A combobox control with support for multiSelect.
 * @constructor
 * Create a new Select.
 * @param {Object} config Configuration options
 * @author Andrei Neculau - andrei.neculau@gmail.com / http://andreineculau.wordpress.com
 * @version 0.4.1
 */
Ext.ux.Andrie.Select = function(config){
	if (config.transform && typeof config.multiSelect == 'undefined'){
		var o = Ext.getDom(config.transform);
		config.multiSelect = (Ext.isIE ? o.getAttributeNode('multiple').specified : o.hasAttribute('multiple'));
	}
	config.hideTrigger2 = config.hideTrigger2||config.hideTrigger;
	Ext.ux.Andrie.Select.superclass.constructor.call(this, config);
}

Ext.extend(Ext.ux.Andrie.Select, Ext.form.ComboBox, {
	/**
	 * @cfg {Boolean} multiSelect Multiple selection is allowed (defaults to false)
	 */
	multiSelect:false,
	/**
	 * @cfg {Integer} minLength Minimum number of required items to be selected
	 */
	minLength:0,
	/**
	 * @cfg {String} minLengthText Validation message displayed when minLength is not met.
	 */
	minLengthText:'Minimum {0} items required',
	/**
	 * @cfg {Integer} maxLength Maximum number of allowed items to be selected
	 */
	maxLength:Number.MAX_VALUE,
	/**
	 * @cfg {String} maxLengthText Validation message displayed when maxLength is not met.
	 */
	maxLengthText:'Maximum {0} items allowed',
	/**
	 * @cfg {Boolean} clearTrigger Show the clear button (defaults to true)
	 */
	clearTrigger:true,
	/**
	 * @cfg {Boolean} history Add selected value to the top of the list (defaults to false)
	 */
	history:false,
	/**
	 * @cfg {Integer} historyMaxLength Number of entered values to remember. 0 means remember all (defaults to 0)
	 */
	historyMaxLength:0,
	/**
	 * @cfg {String} separator Separator to use for the values passed to setValue (defaults to comma)
	 */
	separator:',',
	/**
	 * @cfg {String} displaySeparator Separator to use for displaying the values (defaults to comma)
	 */
	displaySeparator:',',
	
	// private
	valueArray:[],
	
	// private
	rawValueArray:[],
	
	initComponent:function(){
		//from twintrigger
		this.triggerConfig = {
			tag:'span', cls:'x-form-twin-triggers', cn:[
				{tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger " + this.trigger1Class},
				{tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger " + this.trigger2Class}
			]
		};
		
		Ext.ux.Andrie.Select.superclass.initComponent.call(this);
		if (this.multiSelect){
			this.typeAhead = false;
			this.editable = false;
			//this.lastQuery = this.allQuery;
			this.triggerAction = 'all';
			this.selectOnFocus = false;
		}
		if (this.history){
			this.forceSelection = false;
		}
		if (this.value){
			this.setValue(this.value);
		}
	},
	
	hideTrigger1:true,
	
	getTrigger:Ext.form.TwinTriggerField.prototype.getTrigger,
	
	initTrigger:Ext.form.TwinTriggerField.prototype.initTrigger,
	
	trigger1Class:'x-form-clear-trigger',
	trigger2Class:'x-form-arrow-trigger',
	
	onTrigger2Click:function(){
		this.onTriggerClick();
	},
	
	onTrigger1Click:function(){
		this.clearValue();
	},
	
	initList:function(){
		if(!this.list){
			var cls = 'x-combo-list';

			this.list = new Ext.Layer({
				shadow: this.shadow, cls: [cls, this.listClass].join(' '), constrain:false
			});

			var lw = this.listWidth || Math.max(this.wrap.getWidth(), this.minListWidth);
			this.list.setWidth(lw);
			this.list.swallowEvent('mousewheel');
			this.assetHeight = 0;

			if(this.title){
				this.header = this.list.createChild({cls:cls+'-hd', html: this.title});
				this.assetHeight += this.header.getHeight();
			}

			this.innerList = this.list.createChild({cls:cls+'-inner'});
						this.innerList.on('mouseover', this.onViewOver, this);
			this.innerList.on('mousemove', this.onViewMove, this);
			this.innerList.setWidth(lw - this.list.getFrameWidth('lr'))

			if(this.pageSize){
				this.footer = this.list.createChild({cls:cls+'-ft'});
				this.pageTb = new Ext.PagingToolbar({
					store:this.store,
					pageSize: this.pageSize,
					renderTo:this.footer
				});
				this.assetHeight += this.footer.getHeight();
			}

			if(!this.tpl){
				this.tpl = '<tpl for="."><div class="'+cls+'-item">{' + this.displayField + '}</div></tpl>';
			}

			/**
			* The {@link Ext.DataView DataView} used to display the ComboBox's options.
			* @type Ext.DataView
			*/
			this.view = new Ext.DataView({
				applyTo: this.innerList,
				tpl: this.tpl,
				singleSelect: true,
								
				// ANDRIE
				multiSelect: this.multiSelect,
				simpleSelect: true,
				overClass:cls + '-cursor',
				// END
								
				selectedClass: this.selectedClass,
				itemSelector: this.itemSelector || '.' + cls + '-item'
			});

			this.view.on('click', this.onViewClick, this);
			// ANDRIE
			this.view.on('beforeClick', this.onViewBeforeClick, this);
			// END

			this.bindStore(this.store, true);
						
			// ANDRIE
			if (this.valueArray.length){
				this.selectByValue(this.valueArray);
			}
			// END

			if(this.resizable){
				this.resizer = new Ext.Resizable(this.list,  {
				   pinned:true, handles:'se'
				});
				this.resizer.on('resize', function(r, w, h){
					this.maxHeight = h-this.handleHeight-this.list.getFrameWidth('tb')-this.assetHeight;
					this.listWidth = w;
					this.innerList.setWidth(w - this.list.getFrameWidth('lr'));
					this.restrictHeight();
				}, this);
				this[this.pageSize?'footer':'innerList'].setStyle('margin-bottom', this.handleHeight+'px');
			}
		}
	},
	
	// private
	initEvents:function(){
		Ext.form.ComboBox.superclass.initEvents.call(this);

		this.keyNav = new Ext.KeyNav(this.el, {
			"up" : function(e){
				this.inKeyMode = true;
				this.hoverPrev();
			},

			"down" : function(e){
				if(!this.isExpanded()){
					this.onTriggerClick();
				}else{
					this.inKeyMode = true;
					this.hoverNext();
				}
			},

			"enter" : function(e){
				if (this.isExpanded()){
					this.inKeyMode = true;
					var hoveredIndex = this.view.indexOf(this.view.lastItem);
					this.onViewBeforeClick(this.view, hoveredIndex, this.view.getNode(hoveredIndex), e);
					this.onViewClick(this.view, hoveredIndex, this.view.getNode(hoveredIndex), e);
				}else{
					this.onSingleBlur();
				}
				return true;
			},

			"esc" : function(e){
				this.collapse();
			},

			"tab" : function(e){
				this.collapse();
				return true;
			},
			
			"home" : function(e){
				this.hoverFirst();
				return false;
			},
			
			"end" : function(e){
				this.hoverLast();
				return false;
			},

			scope : this,

			doRelay : function(foo, bar, hname){
				if(hname == 'down' || this.scope.isExpanded()){
				   return Ext.KeyNav.prototype.doRelay.apply(this, arguments);
				}
				// ANDRIE
				if(hname == 'enter' || this.scope.isExpanded()){
				   return Ext.KeyNav.prototype.doRelay.apply(this, arguments);
				}
				// END
				return true;
			},

			forceKeyDown: true
		});
		this.queryDelay = Math.max(this.queryDelay || 10,
				this.mode == 'local' ? 10 : 250);
		this.dqTask = new Ext.util.DelayedTask(this.initQuery, this);
		if(this.typeAhead){
			this.taTask = new Ext.util.DelayedTask(this.onTypeAhead, this);
		}
		if(this.editable !== false){
			this.el.on("keyup", this.onKeyUp, this);
		}
		// ANDRIE
		if(!this.multiSelect){
			if(this.forceSelection){
				this.on('blur', this.doForce, this);
			}
			this.on('focus', this.onSingleFocus, this);
			this.on('blur', this.onSingleBlur, this);
		}
		this.on('change', this.onChange, this);
		// END
	},

	// ability to delete value with keyboard
	doForce:function(){
		if(this.el.dom.value.length > 0){
			if (this.el.dom.value == this.emptyText){
				this.clearValue();
			}
			else if (!this.multiSelect){
				this.el.dom.value =
					this.lastSelectionText === undefined?'':this.lastSelectionText;
				this.applyEmptyText();
			}
		}
	},
	
	
	/* listeners */
	// private
	onLoad:function(){
		if(!this.hasFocus){
			return;
		}
		if(this.store.getCount() > 0){
			this.expand();
			this.restrictHeight();
			if(this.lastQuery == this.allQuery){
				if(this.editable){
					this.el.dom.select();
				}
				// ANDRIE
				this.selectByValue(this.value, true);
				/*if(!this.selectByValue(this.value, true)){
					this.select(0, true);
				}*/
				// END
			}else{
				this.selectNext();
				if(this.typeAhead && this.lastKey != Ext.EventObject.BACKSPACE && this.lastKey != Ext.EventObject.DELETE){
					this.taTask.delay(this.typeAheadDelay);
				}
			}
		}else{
			this.onEmptyResults();
		}
		//this.el.focus();
	},

	// private
	onSelect:function(record, index){
		if(this.fireEvent('beforeselect', this, record, index) !== false){
			this.addValue(record.data[this.valueField || this.displayField]);
			this.fireEvent('select', this, record, index);
			if (!this.multiSelect){
				this.collapse();
			}
		}
	},
	
	// private
	onSingleFocus:function(){
		this.oldValue = this.getRawValue();
	},
	
	// private
	onSingleBlur:function(){
		var r = this.findRecord(this.displayField, this.getRawValue());
		if (r){
			this.select(this.store.indexOf(r));
			return;
		}
		if (String(this.oldValue) != String(this.getRawValue())){
			this.setValue(this.getRawValue());
			this.fireEvent('change', this, this.oldValue, this.getRawValue());
		}
		this.oldValue = String(this.getRawValue());
	},
	
	// private
	onChange:function(){
		if (!this.clearTrigger){
			return;
		}
		if (this.getValue() != ''){
			this.triggers[0].show();
		}else{
			this.triggers[0].hide();
		}
	},



	/* list/view functions AND listeners */
	collapse:function(){
		this.hoverOut();
		Ext.ux.Andrie.Select.superclass.collapse.call(this);
	},

	expand:function(){
		Ext.ux.Andrie.Select.superclass.expand.call(this);
		this.hoverFirst();
	},
	
	// private
	onViewOver:function(e, t){
		if(this.inKeyMode){ // prevent key nav and mouse over conflicts
			return;
		}
		// ANDRIE
		/*var item = this.view.findItemFromChild(t);
		if(item){
			var index = this.view.indexOf(item);
			this.select(index, false);
		}*/
		// END
	},
	
	// private
	onViewBeforeClick:function(vw, index, node, e){
		this.preClickSelections = this.view.getSelectedIndexes();
	},
	
	// private
	onViewClick:function(vw, index, node, e){
		if (typeof index != 'undefined'){
			var arrayIndex = this.preClickSelections.indexOf(index);
			if (arrayIndex != -1 && this.multiSelect){
				this.removeValue(this.store.getAt(index).data[this.valueField || this.displayField]);
				if (this.inKeyMode){
					this.view.deselect(index, true);
				}
				this.hover(index, true);
			}else{
				var r = this.store.getAt(index);
				if (r){
					if (this.inKeyMode){
						this.view.select(index, true);
					}
					this.onSelect(r, index);
					this.hover(index, true);
				}
			}
		}
			
		// from the old doFocus argument; don't really know its use
		if(vw !== false){
			this.el.focus();
		}
	},

	
	
	/* value functions */
	/**
	 * Add a value if this is a multi select
	 * @param {String} value The value to match
	 */
	addValue:function(v){
		if (!this.multiSelect){
			this.setValue(v);
			return;
		}
		if (v instanceof Array){
			v = v[0];
		}
		v = String(v);
		if (this.valueArray.indexOf(v) == -1){
			var text = v;
			var r = this.findRecord(this.valueField || displayField, v);
			if(r){
				text = r.data[this.displayField];
				if (this.view){
					this.select(this.store.indexOf(r));
				}
			}else if(this.forceSelection){
				return;
			}
			var result = Ext.apply([], this.valueArray);
			result.push(v);
			var resultRaw = Ext.apply([], this.rawValueArray);
			resultRaw.push(text);
			v = result.join(this.separator || ',');
			text = resultRaw.join(this.displaySeparator || this.separator || ',');
			this.commonChangeValue(v, text, result, resultRaw);
		}
	},
	
	/**
	 * Remove a value
	 * @param {String} value The value to match
	 */
	removeValue:function(v){
		if (v instanceof Array){
			v = v[0];
		}
		v = String(v);
		if (this.valueArray.indexOf(v) != -1){
			var text = v;
			var r = this.findRecord(this.valueField || displayField, v);
			if(r){
				text = r.data[this.displayField];
				if (this.view){
					this.deselect(this.store.indexOf(r));
				}
			}else if(this.forceSelection){
				return;
			}
			var result = Ext.apply([], this.valueArray);
			result.remove(v);
			var resultRaw = Ext.apply([], this.rawValueArray);
			resultRaw.remove(text);
			v = result.join(this.separator || ',');
			text = resultRaw.join(this.displaySeparator || this.separator || ',');
			this.commonChangeValue(v, text, result, resultRaw);
		}
	},
	
	/**
	 * Sets the specified value for the field. The value can be an Array or a String (optionally with separating commas)
	 * If the value finds a match, the corresponding record text will be displayed in the field.
	 * @param {Mixed} value The value to match
	 */
	setValue:function(v){
		var result = [],
				resultRaw = [];
		if (!(v instanceof Array)){
			if (this.separator && this.separator !== true){
				v = v.split(String(this.separator));
			}else{
				v = [v];
			}
		}
		else if (!this.multiSelect){
			v = v.slice(0,1);
		} 
		for (var i=0, len=v.length; i<len; i++){
			var value = v[i];
			var text = value;
			if(this.valueField){
				var r = this.findRecord(this.valueField || this.displayField, value);
				if(r){
					text = r.data[this.displayField];
				}else if(this.forceSelection){
					continue;
				}
			}
			result.push(value);
			resultRaw.push(text);
		}
		v = result.join(this.separator || ',');
		text = resultRaw.join(this.displaySeparator || this.separator || ',');
		
		this.commonChangeValue(v, text, result, resultRaw);
		
		if (this.history && !this.multiSelect && this.mode == 'local'){
			this.addHistory(this.valueField?this.getValue():this.getRawValue());
		}
		if (this.view){
			this.view.clearSelections();
			this.selectByValue(this.valueArray);
		}
	},
	
	// private
	commonChangeValue:function(v, text, result, resultRaw){
		this.lastSelectionText = text;
		this.valueArray = result;
		this.rawValueArray = resultRaw;
		if(this.hiddenField){
			this.hiddenField.value = v;
		}
		Ext.form.ComboBox.superclass.setValue.call(this, text);
		this.value = v;
		
		if (this.oldValueArray != this.valueArray){
			this.fireEvent('change', this, this.oldValueArray, this.valueArray);
		}
		this.oldValueArray = Ext.apply([], this.valueArray);
	},

	validateValue:function(value){
		if(!Ext.ux.Andrie.Select.superclass.validateValue.call(this, value)){
			return false;
		}
		if (this.valueArray.length < this.minLength){
			this.markInvalid(String.format(this.minLengthText, this.minLength));
			return false;
		}
		if (this.valueArray.length > this.maxLength){
			this.markInvalid(String.format(this.maxLengthText, this.maxLength));
			return false;
		}
		return true;
	},
	
	clearValue:function(){
		this.commonChangeValue('', '', [], []);
		if (this.view){
			this.view.clearSelections();
		}
		Ext.ux.Andrie.Select.superclass.clearValue.call(this);
	},
	
	reset:function(){
		if (this.view){
			this.view.clearSelections();
		}
		Ext.ux.Andrie.Select.superclass.reset.call(this);
	},

	getValue : function(asArray){
		if (asArray){
			return typeof this.valueArray != 'undefined' ? this.valueArray : [];
		}
		return Ext.ux.Andrie.Select.superclass.getValue.call(this);
	},
	
	getRawValue:function(asArray){
		if (asArray){
			return typeof this.rawValueArray != 'undefined' ? this.rawValueArray : [];
		}
		return Ext.ux.Andrie.Select.superclass.getRawValue.call(this);
	},
	
	beforeBlur : Ext.emptyFn, //fix for 2.3.0: http://extjs.com/forum/showthread.php?p=375022
	
	/* selection functions */
	select:function(index, scrollIntoView){
		this.selectedIndex = index;
		if (!this.view){
			return;
		}
		this.view.select(index, this.multiSelect);
		if(scrollIntoView !== false){
			var el = this.view.getNode(index);
			if(el){
				this.innerList.scrollChildIntoView(el, false);
			}
		}
	},
	
	deselect:function(index, scrollIntoView){
		this.selectedIndex = index;
		this.view.deselect(index, this.multiSelect);
		if(scrollIntoView !== false){
			var el = this.view.getNode(index);
			if(el){
				this.innerList.scrollChildIntoView(el, false);
			}
		}
	},
	
	selectByValue:function(v, scrollIntoView){
		this.hoverOut();
		if(v !== undefined && v !== null){
			if (!(v instanceof Array)){
				v = [v];
			}
			var result = [];
			for (var i=0, len=v.length; i<len; i++){
				var value = v[i];
				var r = this.findRecord(this.valueField || this.displayField, value);
				if(r){
					this.select(this.store.indexOf(r), scrollIntoView);
					result.push(value);
				}
			}
			return result.join(',');
		}
		return false;
	},
	
	// private
	selectFirst:function(){
		var ct = this.store.getCount();
		if(ct > 0){
			this.select(0);
		}
	},
	
	// private
	selectLast:function(){
		var ct = this.store.getCount();
		if(ct > 0){
			this.select(ct);
		}
	},
	
	
	
	/* hover functions */
	/**
	* Hover an item in the dropdown list by its numeric index in the list.
	* @param {Number} index The zero-based index of the list item to select
	* @param {Boolean} scrollIntoView False to prevent the dropdown list from autoscrolling to display the
	* hovered item if it is not currently in view (defaults to true)
	*/
	hover:function(index, scrollIntoView){
		if (!this.view){
			return;
		}
		this.hoverOut();
		var node = this.view.getNode(index);
		this.view.lastItem = node;
		Ext.fly(node).addClass(this.view.overClass);
		if(scrollIntoView !== false){
			var el = this.view.getNode(index);
			if(el){
				this.innerList.scrollChildIntoView(el, false);
			}
		}
	},
	
	hoverOut:function(){
		if (!this.view){
			return;
		}
		if (this.view.lastItem){
			Ext.fly(this.view.lastItem).removeClass(this.view.overClass);
			delete this.view.lastItem;
		}
	},

	// private
	hoverNext:function(){
		if (!this.view){
			return;
		}
		var ct = this.store.getCount();
		if(ct > 0){
			if(!this.view.lastItem){
				this.hover(0);
			}else{
				var hoveredIndex = this.view.indexOf(this.view.lastItem);
				if(hoveredIndex < ct-1){
					this.hover(hoveredIndex+1);
				}
			}
		}
	},

	// private
	hoverPrev:function(){
		if (!this.view){
			return;
		}
		var ct = this.store.getCount();
		if(ct > 0){
			if(!this.view.lastItem){
				this.hover(0);
			}else{
				var hoveredIndex = this.view.indexOf(this.view.lastItem);
				if(hoveredIndex != 0){
					this.hover(hoveredIndex-1);
				}
			}
		}
	},
	
	// private
	hoverFirst:function(){
		var ct = this.store.getCount();
		if(ct > 0){
			this.hover(0);
		}
	},
	
	// private
	hoverLast:function(){
		var ct = this.store.getCount();
		if(ct > 0){
			this.hover(ct);
		}
	},
	
	
	
	/* history functions */
	
	addHistory:function(value){
		if (!value.length){
			return;
		}
		var r = this.findRecord(this.valueField || this.displayField, value);
		if (r){
			this.store.remove(r);
		}else{
			//var o = this.store.reader.readRecords([[value]]);
			//r = o.records[0];
			var o = {};
			if (this.valueField){
				o[this.valueField] = value;
			}
			o[this.displayField] = value;
			r = new this.store.reader.recordType(o);
		}
		this.store.clearFilter();
		this.store.insert(0, r);
		this.pruneHistory();
	},
	
	// private
	pruneHistory:function(){
		if (this.historyMaxLength == 0){
			return;
		}
		if (this.store.getCount()>this.historyMaxLength){
			var overflow = this.store.getRange(this.historyMaxLength, this.store.getCount());
			for (var i=0, len=overflow.length; i<len; i++){
				this.store.remove(overflow[i]);
			}
		}
	}
});
Ext.reg('multiselectcombo', Ext.ux.Andrie.Select);;//Thanks: http://extjs.com/forum/showthread.php?t=38059
function TinyMCEFileBrowser(field_name, url, type, win) {
	var chooser = new divo.win.ImageChooserWindow({
		width : 815,
		height : 500
	})
	chooser.showWindow(field_name, function(imageSrcEl, data) {
		// insert information now
		win.document.getElementById(imageSrcEl).value = data.url
		win.document.getElementById('alt').value = data.title
		// for image browsers: update image dimensions
		if (win.ImageDialog.getImageData)
			win.ImageDialog.getImageData()
		if (win.ImageDialog.showPreviewImage)
			win.ImageDialog.showPreviewImage(data.url)
	})
	return false;
}	
//EOP

;Ext.namespace('Ext.ux.form');

/**
 * 使用通用的 ImageChooserWindow 上传图片窗口
 */
Ext.ux.form.ImageField = Ext.extend(Ext.BoxComponent, {

    /**
     * @cfg {String} fieldLabel The label text to display next to this field (defaults to '')
     */
    /**
     * @cfg {String} labelStyle A CSS style specification to apply directly to this field's label (defaults to the
     * container's labelStyle value if set, or ''). For example, <code>labelStyle: 'font-weight:bold;'</code>.
     */
    /**
     * @cfg {String} labelSeparator The standard separator to display after the text of each form label (defaults
     * to the value of {@link Ext.layout.FormLayout#labelSeparator}, which is a colon ':' by default).  To display
     * no separator for this field's label specify empty string ''.
     */
    /**
     * @cfg {Boolean} hideLabel True to completely hide the label element (defaults to false)
     */
    /**
     * @cfg {String} clearCls The CSS class used to provide field clearing (defaults to 'x-form-clear-left')
     */
    /**
     * @cfg {String} itemCls An additional CSS class to apply to the wrapper's form item element of this field (defaults 
     * to the container's itemCls value if set, or '').  Since it is applied to the item wrapper, it allows you to write 
     * standard CSS rules that can apply to the field, the label (if specified) or any other element within the markup for 
     * the field. NOTE: this will not have any effect on fields that are not part of a form.
     */
    /**
     * @cfg {String} inputType The type attribute for this field -- this is required for all form fields
     * to render properly in a FormLayout as it does check this value to determine whether of not to render it.
     * 'image' is the default and only value for this property.
     */
	inputType : 'image',
    /**
     * @cfg {Mixed} value A value to initialize this field with (defaults to '').
     */
	value : '',
    /**
     * @cfg {String} name The field's HTML name attribute (defaults to "").
     */
	name : '',
    /**
     * @cfg {String} cls A custom CSS class to apply to the field's underlying element (defaults to "").
     */
    /**
     * @cfg {String} invalidClass The CSS class to use when marking a field invalid (defaults to "x-form-imagefield-invalid")
     */
    invalidClass : "x-form-imagefield-invalid",
    /**
     * @cfg {String} invalidText The error text to use when marking a field invalid and no message is provided
     * (defaults to "The value in this field is invalid")
     */
    invalidText : "This field is required",
    /**
     * @cfg {String/Boolean} validationEvent The event that should initiate field validation. Set to false to disable
      automatic validation (defaults to false).
     */
    validationEvent : 'change',
    /**
     * @cfg {Number} validationDelay The length of time in milliseconds after a validation event occurs until validation
     * is initiated (defaults to 250)
     */
    validationDelay : 250,
    /**
     * @cfg {String/Object} autoCreate A DomHelper element spec, or true for a default element spec (defaults to
     * {tag: "input", type: "text", size: "20", autocomplete: "off"})
     */
    defaultAutoCreate : {tag: "div"},
    /**
     * @cfg {String} fieldClass The default CSS class for the field (defaults to "x-form-image")
     */
    fieldClass : "x-form-imagefield",
    /**
     * @cfg {String} msgTarget The location where error text should display.  Should be one of the following values
     * (defaults to 'qtip'):
     */
    msgTarget : 'qtip',
    /**
     * @cfg {String} msgFx <b>Experimental</b> The effect used when displaying a validation message under the field
     * (defaults to 'normal').
     */
    msgFx : 'normal',
    /**
     * @cfg {Boolean} disabled True to disable the field (defaults to false).
     */
    disabled : false,
    /**
     * @cfg {Boolean} optional True allow the image field to not have a value (value == '')
     * Set this to true when the image field is not required to be specified
     * (defaults to false)
     */
	optional : false,
    /**
     * @cfg {Boolean} hideTrigger True to hide the trigger element and display only the base text field (defaults to false)
     */
    hideTrigger : false,
	/**
     * @cfg {String} triggerClass A CSS class to apply to the trigger
     */
	triggerClass : '',
	/**
     * @cfg {String} defaultImage The default image to display in the field (default to Ext.BLANK_IMAGE_URL)
     */
    defaultImage: "/media/images/image-field-blank.gif",	
	/**
     * @cfg {String} valueField The data store field to return as the field's value
     */	
	valueField : 'url',
	
    // private
    isFormField : true,
    
	allowMaxWidth : null,
	allowMaxHeight : null,
	allowMaxFileSize : null,
	thumbWidth : 0,
	thumbHeight : 0,
    baseWidth : 0,
    baseHeight : 0,
    isFlash : false,
    
	// private
	initComponent : function(){
        Ext.ux.form.ImageField.superclass.initComponent.call(this);
        this.addEvents(
            /**
             * @event change
             * Fires if the field value has changed.
             * @param {Ext.ux.form.ImageField} this
             * @param {String} newValue The new value
             * @param {String} oldValue The original value
             */
            'change',
            /**
             * @event invalid
             * Fires after the field has been marked as invalid.
             * @param {Ext.ux.form.ImageField} this
             * @param {String} msg The validation message
             */
            'invalid',
            /**
             * @event valid
             * Fires after the field has been validated with no errors.
             * @param {Ext.ux.form.ImageField} this
             */
            'valid'
        );
        if(this.isFlash) {
        	this.defaultImage = "/media/images/flashno.png"
        }
    },

    /**
     * Returns the name attribute of the field if available
     * @return {String} name The field name
     */
    getName: function(){
         return this.rendered && this.hiddenField.dom.name ? this.hiddenField.dom.name : '';
    },
    // private
    onRender : function(ct, position){
        Ext.ux.form.ImageField.superclass.onRender.call(this, ct, position);
        if(!this.el){
            var cfg = this.getAutoCreate();
            this.el = ct.createChild(cfg, position);
        }
		this.imageEl = this.el.insertFirst({tag: 'img', src: this.defaultImage });
		// create hidden field to hold the value for the image field
		this.hiddenField = this.imageEl.insertSibling({tag:'input', type:'hidden', name: this.name, id: this.id + '-hidden'}, 'before');
        this.el.addClass([this.fieldClass, this.cls]);
		this.imageEl.addClass(this.fieldClass + '-image');
        this.initValue();
		// wrap it up
		this.wrap = this.imageEl.wrap({cls: "x-form-field-wrap"});
		this.trigger = this.wrap.createChild({tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger"});
        if(this.hideTrigger){
            this.trigger.setDisplayed(false);
        }
		this.initTrigger();
    },
	
    // private
    initTrigger : function(){
        this.trigger.on("click", this.onTriggerClick, this, {preventDefault:true});
        this.trigger.addClassOnOver('x-form-trigger-over');
        this.trigger.addClassOnClick('x-form-trigger-click');
    },

    // private
    onDestroy : function(){
        if(this.trigger){
            this.trigger.removeAllListeners();
            this.trigger.remove();
        }
        this.wrap.remove();
        Ext.ux.form.ImageField.superclass.onDestroy.call(this);
    },
	
    // private
    onDisable : function(){
		this.wrap.addClass('x-item-disabled');
		this.hiddenField.dom.disabled = true;
    },
	
    // private
    onEnable : function(){
        this.wrap.removeClass('x-item-disabled');
		this.hiddenField.dom.disabled = false;
    },
	
    // private
    onShow : function(){
        this.wrap.dom.style.display = '';
        this.wrap.dom.style.visibility = 'visible';
    },
	
    // private
    onHide : function(){
        this.wrap.dom.style.display = 'none';
    },
	
    /**
     * The function that should handle the trigger's click event.  This method does nothing by default until overridden
     * by an implementing function.
     * @method
     * @param {EventObject} e
     */
    onTriggerClick : function(e){
		if(this.disabled){
            return;
        }
		var chooser = new divo.win.ImageChooserWindow({
			width : 815,
			height : 500,
		    allowMaxWidth : this.allowMaxWidth,
		    allowMaxHeight : this.allowMaxHeight,
		    allowMaxFileSize : this.allowMaxFileSize,
		    thumbWidth : this.thumbWidth,
		    thumbHeight : this.thumbHeight,
		    baseWidth : this.baseWidth,
		    baseHeight : this.baseHeight,
		    isFlash : this.isFlash
		})
		chooser.showWindow('', this.onSelect.createDelegate(this))
		//this.fireEvent('expand', this, this.view);
	},
	onSelect : function(imageSrcEl, data) {
       this.setValue(data.url)
	},
    // private
    initValue : function(){
        if(this.value !== undefined){
            this.hiddenField.dom.value = (this.value === null || this.value === undefined ? '' : this.value);
        } else {
			this.hiddenField.dom.value = '';
		}
    },

    /**
     * Returns true if this field has been changed since it was originally loaded and is not disabled.
     */
    isDirty : function() {
        if(this.disabled) {
            return false;
        }
        return String(this.getValue()) !== String(this.originalValue);
    },

    // private
    afterRender : function(){
        Ext.ux.form.ImageField.superclass.afterRender.call(this);
        this.initEvents();
    },

    /**
     * Resets the current field value to the originally loaded value and clears any validation messages
     */
    reset : function(){
    	if (!this.originalValue)
        	this.originalValue = this.defaultImage
    	
        this.setValue(this.originalValue);
        this.clearInvalid();
    },

    // private
    initEvents : function(){
		if(this.validationEvent !== false){
            this.el.on(this.validationEvent, this.validate, this, {buffer: this.validationDelay});
        }
        // reference to original value for reset
        this.originalValue = this.getValue();
    },


    /**
     * Returns whether or not the field value is currently valid
     * @param {Boolean} preventMark True to disable marking the field invalid
     * @return {Boolean} True if the value is valid, else false
     */
    isValid : function(preventMark){
        if(this.disabled){
            return true;
        }
        var restore = this.preventMark;
        this.preventMark = preventMark === true;
        var v = this.validateValue(this.processValue(this.getRawValue()));
        this.preventMark = restore;
        return v;
    },

    /**
     * Validates the field value
     * @return {Boolean} True if the value is valid, else false
     */
    validate : function(){
        if(this.disabled || this.validateValue(this.processValue(this.getRawValue()))){
            this.clearInvalid();
            return true;
        }
        return false;
    },

    // protected - should be overridden by subclasses if necessary to prepare raw values for validation
    processValue : function(value){
        return value;
    },

    // private
    validateValue : function(value){
		if (this.hiddenField.dom.value === '') {
			this.markInvalid();
			return false;
		} else {
			return true;
		}
    },

    /**
     * Mark this field as invalid, using {@link #msgTarget} to determine how to display the error and 
     * applying {@link #invalidClass} to the field's element.
     * @param {String} msg (optional) The validation message (defaults to {@link #invalidText})
     */
    markInvalid : function(msg){
        if(!this.rendered || this.preventMark){ // not rendered
            return;
        }
        this.el.addClass(this.invalidClass);
        msg = msg || this.invalidText;
        switch(this.msgTarget){
            case 'qtip':
                this.el.dom.qtip = msg;
                this.el.dom.qclass = 'x-form-invalid-tip';
                if(Ext.QuickTips){ // fix for floating editors interacting with DND
                    Ext.QuickTips.enable();
                }
                break;
            case 'title':
                this.el.dom.title = msg;
                break;
            case 'under':
                if(!this.errorEl){
                    var elp = this.getErrorCt();
                    this.errorEl = elp.createChild({cls:'x-form-invalid-msg'});
                    this.errorEl.setWidth(elp.getWidth(true)-20);
                }
                this.errorEl.update(msg);
                Ext.ux.form.ImageField.msgFx[this.msgFx].show(this.errorEl, this);
                break;
            case 'side':
                if(!this.errorIcon){
                    var elp = this.getErrorCt();
                    this.errorIcon = elp.createChild({cls:'x-form-invalid-icon'});
                }
                this.alignErrorIcon();
                this.errorIcon.dom.qtip = msg;
                this.errorIcon.dom.qclass = 'x-form-invalid-tip';
                this.errorIcon.show();
                this.on('resize', this.alignErrorIcon, this);
                break;
            default:
                var t = Ext.getDom(this.msgTarget);
                t.innerHTML = msg;
                t.style.display = this.msgDisplay;
                break;
        }
        this.fireEvent('invalid', this, msg);
    },
    
    // private
    getErrorCt : function(){
        return this.el.findParent('.x-form-element', 5, true) || // use form element wrap if available
            this.el.findParent('.x-form-field-wrap', 5, true);   // else direct field wrap
    },

    // private
    alignErrorIcon : function(){
        this.errorIcon.alignTo(this.el, 'tl-tr', [2, 0]);
    },

    /**
     * Clear any invalid styles/messages for this field
     */
    clearInvalid : function(){
        if(!this.rendered || this.preventMark){ // not rendered
            return;
        }
        this.el.removeClass(this.invalidClass);
        switch(this.msgTarget){
            case 'qtip':
                this.el.dom.qtip = '';
                break;
            case 'title':
                this.el.dom.title = '';
                break;
            case 'under':
                if(this.errorEl){
                    Ext.ux.form.ImageField.msgFx[this.msgFx].hide(this.errorEl, this);
                }
                break;
            case 'side':
                if(this.errorIcon){
                    this.errorIcon.dom.qtip = '';
                    this.errorIcon.hide();
                    this.un('resize', this.alignErrorIcon, this);
                }
                break;
            default:
                var t = Ext.getDom(this.msgTarget);
                t.innerHTML = '';
                t.style.display = 'none';
                break;
        }
        this.fireEvent('valid', this);
    },

    /**
     * Returns the raw data value which may or may not be a valid, defined value.  To return a normalized value see {@link #getValue}.
     * @return {Mixed} value The field value
     */
    getRawValue : function(){
        var v = this.rendered ? this.hiddenField.getValue() : Ext.value(this.value, '');
        return v;
    },

    /**
     * Returns the normalized data value (undefined will be returned as '').  To return the raw value see {@link #getRawValue}.
     * @return {Mixed} value The field value
     */
    getValue : function(){
        if(!this.rendered) {
            return this.value;
        }
        var v = this.hiddenField.getValue();
        if(v === undefined){
            v = '';
        }
        return v;
    },

    /**
     * Sets the underlying DOM field's value directly, bypassing validation.  To set the value with validation see {@link #setValue}.
     * @param {Mixed} value The value to set
     */
    setRawValue : function(v){
        return this.hiddenField.dom.value = (v === null || v === undefined ? '' : v);
    },

    /**
     * Sets a data value into the field and validates it.  To set the value directly without validation see {@link #setRawValue}.
     * @param {Mixed} value The value to set
     */
    setValue : function(v){
    	if (!this.isFlash && !v)
        	v = this.defaultImage
    	
		var original = this.value;
        this.value = v;
        if(this.rendered){
            this.hiddenField.dom.value = (v === null || v === undefined ? '' : v);
            if(this.isFlash) {
                 this.imageEl.dom.src = "/media/images/flash"+(v?"yes":"no")+".png";
            } else { 
			     this.imageEl.dom.src = (v === null || v === undefined ? '' : v);
            } 
			this.fireEvent('change', this, original, v);
            this.validate();
        }
    }

});

// anything other than normal should be considered experimental
Ext.ux.form.ImageField.msgFx = {
    normal : {
        show: function(msgEl, f){
            msgEl.setDisplayed('block');
        },

        hide : function(msgEl, f){
            msgEl.setDisplayed(false).update('');
        }
    },

    slide : {
        show: function(msgEl, f){
            msgEl.slideIn('t', {stopFx:true});
        },

        hide : function(msgEl, f){
            msgEl.slideOut('t', {stopFx:true,useDisplay:true});
        }
    },

    slideRight : {
        show: function(msgEl, f){
            msgEl.fixDisplay();
            msgEl.alignTo(f.el, 'tl-tr');
            msgEl.slideIn('l', {stopFx:true});
        },

        hide : function(msgEl, f){
            msgEl.slideOut('l', {stopFx:true,useDisplay:true});
        }
    }
};

Ext.reg('imagefield', Ext.ux.form.ImageField);
;/**
 * Utility Formintro class.
 */
divo.form.FormIntro = Ext.extend(Ext.BoxComponent, {
    _textEl : null,
    _labelEl : null,
	initComponent : function() {
	    Ext.apply(this, {
		    autoEl : {
		        tag : 'div',
		        children : [{
		            tag      : 'div',
		            cls      : 'divo-formintro-container',
		            children : [{
		                tag  : 'div',
		                cls  :  'divo-formintro-label',
		                html : ''
		            }, {
		                tag      : 'div',
		                cls      : 'divo-formintro-outersep',
		                children : this.label?[{
		                    tag  : 'div',
		                    cls  : 'divo-formintro-sepx',
		                    html : '&nbsp;'
		                }]:[]
		            }]
		        }, {
		            tag  : 'div',
		            html : '',
		            cls  : 'divo-formintro-description'
		        }]
		    }     
	    })
		divo.form.FormIntro.superclass.initComponent.call(this)
	},
    setLabel : function(label)
    {
        this.label = label;

        if (this.renderedl) {
            this._labelEl.update(label);
        }
    },
    setText : function(text)
    {
        this.text = text;

        if (this.rendered) {
            if (this.text != undefined) {
                this._textEl.update(this.text);
                this._textEl.setDisplayed(true);
            } else {
                this._textEl.setDisplayed(false);
            }
        }
    },
    onRender : function(ct, position)
    {
        divo.form.FormIntro.superclass.onRender.call(this, ct, position);

        this._labelEl = new Ext.Element(this.el.dom.firstChild.firstChild);
        this._textEl  = new Ext.Element(this.el.dom.lastChild);

        if (this.label) {
            this._labelEl.update(this.label);
        }

        if (this.text != undefined) {
            this._textEl.update(this.text);
        } else {
            this._textEl.setDisplayed(false);
        }

        if (this.imageClass) {
            this._textEl.addClass(this.imageClass);
        }

    }
});
;/**
 * 树节点排序表单
 */
divo.form.TreeSortForm = Ext.extend(Ext.form.FormPanel, {
	baseUrl : null,
	parentNode : null,
	initComponent : function() {
		
		Ext.apply(this, {
			baseCls : "x-plain",
			labelWidth : 75,
			labelAlign : "right",
			autoScroll : true,
			bodyStyle : "padding:0",
			items : [{
				xtype : "itemselector",
				name : 'tree-childs',
				hideLabel : true,
				sorterOnly : true,
				fromStore:this.getFromDataStore(),
				msWidth : 500,
				msHeight : 300,
				valueField : "id",
				displayField : "name"
			}]
		});

		divo.form.TreeSortForm.superclass.initComponent.call(this);

	},
	getFromDataStore : function() {
		return new Ext.data.Store({					 
			autoLoad: true,
			proxy : new Ext.data.HttpProxy( {
				method : 'GET',
				url : this.baseUrl+"/children"
			}),
			reader: this.getReader(),
			baseParams: {
				node:this.parentNode.id,
				rootNeeded : 1
			}
		})		
	},
	getReader : function() {
		return new Ext.data.JsonReader({
			idProperty:'id',
			root:'rows',
			fields: [
				{name: 'id', type: 'int'},
				{name: 'name', type: 'string'}
			]
		})		
	},
	//public
	save : function(callbackOnSuccess) {
		var itemStr = this.getForm().findField('tree-childs').getValue()
		var ok = true    
		Ext.Ajax.request({
			scope : this,
			url : this.baseUrl+"/"+this.parentNode.id+"/order",
			async : false,
			method : 'PUT',
			jsonData : {idList:itemStr},
			success : function(response, options) {
				var resp = Ext.decode(response.responseText)
				if (resp.success) 
					this.say('显示顺序修改成功')
			},
			failure : function(response, options) {
				this.alert(response.responseText)
				ok = false
			}
		})
		
		if (ok) callbackOnSuccess.call()
	}
})

Ext.reg("divo.form.TreeSortForm", divo.form.TreeSortForm);
// EOP

;/**
 * A ComboBox with a secondary trigger button that clears the contents of the
 * ComboBox.
 * 
 * Thanks: http://extjs.com/forum/showthread.php?t=9619
 */
divo.form.ClearableComboBox = Ext.extend(Ext.form.ComboBox, {
	initComponent : function() {
		divo.form.ClearableComboBox.superclass.initComponent.call(this);

		this.triggerConfig = {
			tag : 'span',
			cls : 'x-form-twin-triggers',
			style : 'padding-right:2px', // padding needed to prevent IE from
			// clipping 2nd trigger button
			cn : [ {
				tag : "img",
				src : Ext.BLANK_IMAGE_URL,
				cls : "x-form-trigger"
			}, {
				tag : "img",
				src : Ext.BLANK_IMAGE_URL,
				cls : "x-form-trigger x-form-clear-trigger"
			}]
		};
	},

	getTrigger : function(index) {
		return this.triggers[index];
	},

	initTrigger : function() {
		var ts = this.trigger.select('.x-form-trigger', true);
		this.wrap.setStyle('overflow', 'hidden');
		var triggerField = this;
		ts.each(function(t, all, index) {
			t.hide = function() {
				var w = triggerField.wrap.getWidth();
				this.dom.style.display = 'none';
				triggerField.el.setWidth(w - triggerField.trigger.getWidth());
			};
			t.show = function() {
				var w = triggerField.wrap.getWidth();
				this.dom.style.display = '';
				triggerField.el.setWidth(w - triggerField.trigger.getWidth());
			};
			var triggerIndex = 'Trigger' + (index + 1);

			if (this['hide' + triggerIndex]) {
				t.dom.style.display = 'none';
			}
			t.on("click", this['on' + triggerIndex + 'Click'], this, {
				preventDefault : true
			});
			t.addClassOnOver('x-form-trigger-over');
			t.addClassOnClick('x-form-trigger-click');
		}, this);
		this.triggers = ts.elements;
	},

	onTrigger1Click : function() {
		this.onTriggerClick()
	}, 
	onTrigger2Click : function() {
		this.reset()
		this.fireEvent("select", this, "");
	}
})

Ext.reg("clearablecombo",divo.form.ClearableComboBox)

//EOP
;/**
 * @class Ext.ux.form.DateTime
 * @extends Ext.form.Field
 *
 * DateTime field, combination of DateField and TimeField
 *
 * @author      Ing. Jozef Sakáloš
 * @copyright (c) 2008, Ing. Jozef Sakáloš
 * @version   2.0
 * @revision  $Id: Ext.ux.form.DateTime.js 603 2009-03-04 22:27:06Z jozo $
 *
 * @license Ext.ux.form.DateTime is licensed under the terms of
 * the Open Source LGPL 3.0 license.  Commercial use is permitted to the extent
 * that the code/component(s) do NOT become part of another Open Source or Commercially
 * licensed development library or toolkit without explicit permission.
 * 
 * <p>License details: <a href="http://www.gnu.org/licenses/lgpl.html"
 * target="_blank">http://www.gnu.org/licenses/lgpl.html</a></p>
 *
 * @forum      22661
 *
 * @donate
 * <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
 * <input type="hidden" name="cmd" value="_s-xclick">
 * <input type="hidden" name="hosted_button_id" value="3430419">
 * <input type="image" src="https://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" 
 * border="0" name="submit" alt="PayPal - The safer, easier way to pay online.">
 * <img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1">
 * </form>
 */

Ext.ns('Ext.ux.form');

/**
 * Creates new DateTime
 * @constructor
 * @param {Object} config A config object
 */
Ext.ux.form.DateTime = Ext.extend(Ext.form.Field, {
    /**
     * @cfg {String/Object} defaultAutoCreate DomHelper element spec
     * Let superclass to create hidden field instead of textbox. Hidden will be submittend to server
     */
     defaultAutoCreate:{tag:'input', type:'hidden'}
    /**
     * @cfg {Number} timeWidth Width of time field in pixels (defaults to 100)
     */
    ,timeWidth:100
    /**
     * @cfg {String} dtSeparator Date - Time separator. Used to split date and time (defaults to ' ' (space))
     */
    ,dtSeparator:' '
    /**
     * @cfg {String} hiddenFormat Format of datetime used to store value in hidden field
     * and submitted to server (defaults to 'Y-m-d H:i:s' that is mysql format)
     */
    ,hiddenFormat:'Y-m-d H:i:s'
    /**
     * @cfg {Boolean} otherToNow Set other field to now() if not explicly filled in (defaults to true)
     */
    ,otherToNow:true
    /**
     * @cfg {Boolean} emptyToNow Set field value to now on attempt to set empty value.
     * If it is true then setValue() sets value of field to current date and time (defaults to false)
     */
    /**
     * @cfg {String} timePosition Where the time field should be rendered. 'right' is suitable for forms
     * and 'below' is suitable if the field is used as the grid editor (defaults to 'right')
     */
    ,timePosition:'right' // valid values:'below', 'right'
    /**
     * @cfg {String} dateFormat Format of DateField. Can be localized. (defaults to 'm/y/d')
     */
    ,dateFormat:'m/d/y'
    /**
     * @cfg {String} timeFormat Format of TimeField. Can be localized. (defaults to 'g:i A')
     */
    ,timeFormat:'g:i A'
    /**
     * @cfg {Object} dateConfig Config for DateField constructor.
     */
    /**
     * @cfg {Object} timeConfig Config for TimeField constructor.
     */

    // {{{
    /**
     * @private
     * creates DateField and TimeField and installs the necessary event handlers
     */
    ,initComponent:function() {
        // call parent initComponent
        Ext.ux.form.DateTime.superclass.initComponent.call(this);

        // create DateField
        var dateConfig = Ext.apply({}, {
             id:this.id + '-date'
            ,format:this.dateFormat || Ext.form.DateField.prototype.format
            ,width:this.timeWidth
            ,selectOnFocus:this.selectOnFocus
            ,listeners:{
                  blur:{scope:this, fn:this.onBlur}
                 ,focus:{scope:this, fn:this.onFocus}
            }
        }, this.dateConfig);
        this.df = new Ext.form.DateField(dateConfig);
        this.df.ownerCt = this;
        delete(this.dateFormat);

        // create TimeField
        var timeConfig = Ext.apply({}, {
             id:this.id + '-time'
            ,format:this.timeFormat || Ext.form.TimeField.prototype.format
            ,width:this.timeWidth
            ,selectOnFocus:this.selectOnFocus
            ,listeners:{
                  blur:{scope:this, fn:this.onBlur}
                 ,focus:{scope:this, fn:this.onFocus}
            }
        }, this.timeConfig);
        this.tf = new Ext.form.TimeField(timeConfig);
        this.tf.ownerCt = this;
        delete(this.timeFormat);

        // relay events
        this.relayEvents(this.df, ['focus', 'specialkey', 'invalid', 'valid']);
        this.relayEvents(this.tf, ['focus', 'specialkey', 'invalid', 'valid']);

    } // eo function initComponent
    // }}}
    // {{{
    /**
     * @private
     * Renders underlying DateField and TimeField and provides a workaround for side error icon bug
     */
    ,onRender:function(ct, position) {
        // don't run more than once
        if(this.isRendered) {
            return;
        }

        // render underlying hidden field
        Ext.ux.form.DateTime.superclass.onRender.call(this, ct, position);

        // render DateField and TimeField
        // create bounding table
        var t;
        if('below' === this.timePosition || 'bellow' === this.timePosition) {
            t = Ext.DomHelper.append(ct, {tag:'table',style:'border-collapse:collapse',children:[
                 {tag:'tr',children:[{tag:'td', style:'padding-bottom:1px', cls:'ux-datetime-date'}]}
                ,{tag:'tr',children:[{tag:'td', cls:'ux-datetime-time'}]}
            ]}, true);
        }
        else {
            t = Ext.DomHelper.append(ct, {tag:'table',style:'border-collapse:collapse',children:[
                {tag:'tr',children:[
                    {tag:'td',style:'padding-right:4px', cls:'ux-datetime-date'},{tag:'td', cls:'ux-datetime-time'}
                ]}
            ]}, true);
        }

        this.tableEl = t;
        this.wrap = t.wrap({cls:'x-form-field-wrap'});
//        this.wrap = t.wrap();
        this.wrap.on("mousedown", this.onMouseDown, this, {delay:10});

        // render DateField & TimeField
        this.df.render(t.child('td.ux-datetime-date'));
        this.tf.render(t.child('td.ux-datetime-time'));

        // workaround for IE trigger misalignment bug
        if(Ext.isIE && Ext.isStrict) {
            t.select('input').applyStyles({top:0});
        }

        this.on('specialkey', this.onSpecialKey, this);
        this.df.el.swallowEvent(['keydown', 'keypress']);
        this.tf.el.swallowEvent(['keydown', 'keypress']);

        // create icon for side invalid errorIcon
        if('side' === this.msgTarget) {
            var elp = this.el.findParent('.x-form-element', 10, true);
            this.errorIcon = elp.createChild({cls:'x-form-invalid-icon'});

            this.df.errorIcon = this.errorIcon;
            this.tf.errorIcon = this.errorIcon;
        }

        // setup name for submit
        this.el.dom.name = this.hiddenName || this.name || this.id;

        // prevent helper fields from being submitted
        this.df.el.dom.removeAttribute("name");
        this.tf.el.dom.removeAttribute("name");

        // we're rendered flag
        this.isRendered = true;

        // update hidden field
        this.updateHidden();

    } // eo function onRender
    // }}}
    // {{{
    /**
     * @private
     */
    ,adjustSize:Ext.BoxComponent.prototype.adjustSize
    // }}}
    // {{{
    /**
     * @private
     */
    ,alignErrorIcon:function() {
        this.errorIcon.alignTo(this.tableEl, 'tl-tr', [2, 0]);
    }
    // }}}
    // {{{
    /**
     * @private initializes internal dateValue
     */
    ,initDateValue:function() {
        this.dateValue = this.otherToNow ? new Date() : new Date(1970, 0, 1, 0, 0, 0);
    }
    // }}}
    // {{{
    /**
     * Calls clearInvalid on the DateField and TimeField
     */
    ,clearInvalid:function(){
        this.df.clearInvalid();
        this.tf.clearInvalid();
    } // eo function clearInvalid
    // }}}
    // {{{
    /**
     * Calls markInvalid on both DateField and TimeField
     * @param {String} msg Invalid message to display
     */
    ,markInvalid:function(msg){
        this.df.markInvalid(msg);
        this.tf.markInvalid(msg);
    } // eo function markInvalid
    // }}}
    // {{{
    /**
     * @private
     * called from Component::destroy. 
     * Destroys all elements and removes all listeners we've created.
     */
    ,beforeDestroy:function() {
        if(this.isRendered) {
//            this.removeAllListeners();
            this.wrap.removeAllListeners();
            this.wrap.remove();
            this.tableEl.remove();
            this.df.destroy();
            this.tf.destroy();
        }
    } // eo function beforeDestroy
    // }}}
    // {{{
    /**
     * Disable this component.
     * @return {Ext.Component} this
     */
    ,disable:function() {
        if(this.isRendered) {
            this.df.disabled = this.disabled;
            this.df.onDisable();
            this.tf.onDisable();
        }
        this.disabled = true;
        this.df.disabled = true;
        this.tf.disabled = true;
        this.fireEvent("disable", this);
        return this;
    } // eo function disable
    // }}}
    // {{{
    /**
     * Enable this component.
     * @return {Ext.Component} this
     */
    ,enable:function() {
        if(this.rendered){
            this.df.onEnable();
            this.tf.onEnable();
        }
        this.disabled = false;
        this.df.disabled = false;
        this.tf.disabled = false;
        this.fireEvent("enable", this);
        return this;
    } // eo function enable
    // }}}
    // {{{
    /**
     * @private Focus date filed
     */
    ,focus:function() {
        this.df.focus();
    } // eo function focus
    // }}}
    // {{{
    /**
     * @private
     */
    ,getPositionEl:function() {
        return this.wrap;
    }
    // }}}
    // {{{
    /**
     * @private
     */
    ,getResizeEl:function() {
        return this.wrap;
    }
    // }}}
    // {{{
    /**
     * @return {Date/String} Returns value of this field
     */
    ,getValue:function() {
        // create new instance of date
        return this.dateValue ? new Date(this.dateValue) : '';
    } // eo function getValue
    // }}}
    // {{{
    /**
     * @return {Boolean} true = valid, false = invalid
     * @private Calls isValid methods of underlying DateField and TimeField and returns the result
     */
    ,isValid:function() {
        return this.df.isValid() && this.tf.isValid();
    } // eo function isValid
    // }}}
    // {{{
    /**
     * Returns true if this component is visible
     * @return {boolean} 
     */
    ,isVisible : function(){
        return this.df.rendered && this.df.getActionEl().isVisible();
    } // eo function isVisible
    // }}}
    // {{{
    /** 
     * @private Handles blur event
     */
    ,onBlur:function(f) {
        // called by both DateField and TimeField blur events

        // revert focus to previous field if clicked in between
        if(this.wrapClick) {
            f.focus();
            this.wrapClick = false;
        }

        // update underlying value
        if(f === this.df) {
            this.updateDate();
        }
        else {
            this.updateTime();
        }
        this.updateHidden();

        // fire events later
        (function() {
            if(!this.df.hasFocus && !this.tf.hasFocus) {
                var v = this.getValue();
                if(String(v) !== String(this.startValue)) {
                    this.fireEvent("change", this, v, this.startValue);
                }
                this.hasFocus = false;
                this.fireEvent('blur', this);
            }
        }).defer(100, this);

    } // eo function onBlur
    // }}}
    // {{{
    /**
     * @private Handles focus event
     */
    ,onFocus:function() {
        if(!this.hasFocus){
            this.hasFocus = true;
            this.startValue = this.getValue();
            this.fireEvent("focus", this);
        }
    }
    // }}}
    // {{{
    /**
     * @private Just to prevent blur event when clicked in the middle of fields
     */
    ,onMouseDown:function(e) {
        if(!this.disabled) {
            this.wrapClick = 'td' === e.target.nodeName.toLowerCase();
        }
    }
    // }}}
    // {{{
    /**
     * @private
     * Handles Tab and Shift-Tab events
     */
    ,onSpecialKey:function(t, e) {
        var key = e.getKey();
        if(key === e.TAB) {
            if(t === this.df && !e.shiftKey) {
                e.stopEvent();
                this.tf.focus();
            }
            if(t === this.tf && e.shiftKey) {
                e.stopEvent();
                this.df.focus();
            }
        }
        // otherwise it misbehaves in editor grid
        if(key === e.ENTER) {
            this.updateValue();
        }

    } // eo function onSpecialKey
    // }}}
    // {{{
    /**
     * @private Sets the value of DateField
     */
    ,setDate:function(date) {
        this.df.setValue(date);
    } // eo function setDate
    // }}}
    // {{{
    /** 
     * @private Sets the value of TimeField
     */
    ,setTime:function(date) {
        this.tf.setValue(date);
    } // eo function setTime
    // }}}
    // {{{
    /**
     * @private
     * Sets correct sizes of underlying DateField and TimeField
     * With workarounds for IE bugs
     */
    ,setSize:function(w, h) {
        if(!w) {
            return;
        }
        if('below' === this.timePosition) {
            this.df.setSize(w, h);
            this.tf.setSize(w, h);
            if(Ext.isIE) {
                this.df.el.up('td').setWidth(w);
                this.tf.el.up('td').setWidth(w);
            }
        }
        else {
            this.df.setSize(w - this.timeWidth - 4, h);
            this.tf.setSize(this.timeWidth, h);

            if(Ext.isIE) {
                this.df.el.up('td').setWidth(w - this.timeWidth - 4);
                this.tf.el.up('td').setWidth(this.timeWidth);
            }
        }
    } // eo function setSize
    // }}}
    // {{{
    /**
     * @param {Mixed} val Value to set
     * Sets the value of this field
     */
    ,setValue:function(val) {
        if(!val && true === this.emptyToNow) {
            this.setValue(new Date());
            return;
        }
        else if(!val) {
            this.setDate('');
            this.setTime('');
            this.updateValue();
            return;
        }
        if ('number' === typeof val) {
          val = new Date(val);
        }
        else if('string' === typeof val && this.hiddenFormat) {
            val = Date.parseDate(val, this.hiddenFormat)
        }
        val = val ? val : new Date(1970, 0 ,1, 0, 0, 0);
        var da, time;
        if(val instanceof Date) {
            this.setDate(val);
            this.setTime(val);
            this.dateValue = new Date(val);
        }
        else {
            da = val.split(this.dtSeparator);
            this.setDate(da[0]);
            if(da[1]) {
                if(da[2]) {
                    // add am/pm part back to time
                    da[1] += da[2];
                }
                this.setTime(da[1]);
            }
        }
        this.updateValue();
    } // eo function setValue
    // }}}
    // {{{
    /**
     * Hide or show this component by boolean
     * @return {Ext.Component} this
     */
    ,setVisible: function(visible){
        if(visible) {
            this.df.show();
            this.tf.show();
        }else{
            this.df.hide();
            this.tf.hide();
        }
        return this;
    } // eo function setVisible
    // }}}
    //{{{
    ,show:function() {
        return this.setVisible(true);
    } // eo function show
    //}}}
    //{{{
    ,hide:function() {
        return this.setVisible(false);
    } // eo function hide
    //}}}
    // {{{
    /**
     * @private Updates the date part
     */
    ,updateDate:function() {

        var d = this.df.getValue();
        if(d) {
            if(!(this.dateValue instanceof Date)) {
                this.initDateValue();
                if(!this.tf.getValue()) {
                    this.setTime(this.dateValue);
                }
            }
            this.dateValue.setMonth(0); // because of leap years
            this.dateValue.setFullYear(d.getFullYear());
            this.dateValue.setMonth(d.getMonth(), d.getDate());
//            this.dateValue.setDate(d.getDate());
        }
        else {
            this.dateValue = '';
            this.setTime('');
        }
    } // eo function updateDate
    // }}}
    // {{{
    /**
     * @private
     * Updates the time part
     */
    ,updateTime:function() {
        var t = this.tf.getValue();
        if(t && !(t instanceof Date)) {
            t = Date.parseDate(t, this.tf.format);
        }
        if(t && !this.df.getValue()) {
            this.initDateValue();
            this.setDate(this.dateValue);
        }
        if(this.dateValue instanceof Date) {
            if(t) {
                this.dateValue.setHours(t.getHours());
                this.dateValue.setMinutes(t.getMinutes());
                this.dateValue.setSeconds(t.getSeconds());
            }
            else {
                this.dateValue.setHours(0);
                this.dateValue.setMinutes(0);
                this.dateValue.setSeconds(0);
            }
        }
    } // eo function updateTime
    // }}}
    // {{{
    /**
     * @private Updates the underlying hidden field value
     */
    ,updateHidden:function() {
        if(this.isRendered) {
            var value = this.dateValue instanceof Date ? this.dateValue.format(this.hiddenFormat) : '';
            this.el.dom.value = value;
        }
    }
    // }}}
    // {{{
    /**
     * @private Updates all of Date, Time and Hidden
     */
    ,updateValue:function() {

        this.updateDate();
        this.updateTime();
        this.updateHidden();

        return;
    } // eo function updateValue
    // }}}
    // {{{
    /**
     * @return {Boolean} true = valid, false = invalid
     * calls validate methods of DateField and TimeField
     */
    ,validate:function() {
        return this.df.validate() && this.tf.validate();
    } // eo function validate
    // }}}
    // {{{
    /**
     * Returns renderer suitable to render this field
     * @param {Object} Column model config
     */
    ,renderer: function(field) {
        var format = field.editor.dateFormat || Ext.ux.form.DateTime.prototype.dateFormat;
        format += ' ' + (field.editor.timeFormat || Ext.ux.form.DateTime.prototype.timeFormat);
        var renderer = function(val) {
            var retval = Ext.util.Format.date(val, format);
            return retval;
        };
        return renderer;
    } // eo function renderer
    // }}}

}); // eo extend

// register xtype
Ext.reg('xdatetime', Ext.ux.form.DateTime);

// eof
;Ext.namespace('Ext.ux.form');

/**
 * @class Ext.ux.form.BrowseButton
 * @extends Ext.Button
 * Ext.Button that provides a customizable file browse button.
 * Clicking this button, pops up a file dialog box for a user to select the file to upload.
 * This is accomplished by having a transparent <input type="file"> box above the Ext.Button.
 * When a user thinks he or she is clicking the Ext.Button, they're actually clicking the hidden input "Browse..." box.
 * Note: this class can be instantiated explicitly or with xtypes anywhere a regular Ext.Button can be except in 2 scenarios:
 * - Panel.addButton method both as an instantiated object or as an xtype config object.
 * - Panel.buttons config object as an xtype config object.
 * These scenarios fail because Ext explicitly creates an Ext.Button in these cases.
 * Browser compatibility:
 * Internet Explorer 6:
 * - no issues
 * Internet Explorer 7:
 * - no issues
 * Firefox 2 - Windows:
 * - pointer cursor doesn't display when hovering over the button.
 * Safari 3 - Windows:
 * - no issues.
 * @author loeppky - based on the work done by MaximGB in Ext.ux.UploadDialog (http://extjs.com/forum/showthread.php?t=21558)
 * The follow the curosr float div idea also came from MaximGB.
 * @see http://extjs.com/forum/showthread.php?t=29032
 * @constructor
 * Create a new BrowseButton.
 * @param {Object} config Configuration options
 */
Ext.ux.form.BrowseButton = Ext.extend(Ext.Button, {
	/*
	 * Config options:
	 */
	/**
	 * @cfg {String} inputFileName
	 * Name to use for the hidden input file DOM element.  Deaults to "file".
	 */
	inputFileName: 'file',
	/**
	 * @cfg {Boolean} debug
	 * Toggle for turning on debug mode.
	 * Debug mode doesn't make clipEl transparent so that one can see how effectively it covers the Ext.Button.
	 * In addition, clipEl is given a green background and floatEl a red background to see how well they are positioned.
	 */
	debug: false,
	
	
	/*
	 * Private constants:
	 */
	/**
	 * @property FLOAT_EL_WIDTH
	 * @type Number
	 * The width (in pixels) of floatEl.
	 * It should be less than the width of the IE "Browse" button's width (65 pixels), since IE doesn't let you resize it.
	 * We define this width so we can quickly center floatEl at the mouse cursor without having to make any function calls.
	 * @private
	 */
	FLOAT_EL_WIDTH: 60,
	
	/**
	 * @property FLOAT_EL_HEIGHT
	 * @type Number
	 * The heigh (in pixels) of floatEl.
	 * It should be less than the height of the "Browse" button's height.
	 * We define this height so we can quickly center floatEl at the mouse cursor without having to make any function calls.
	 * @private
	 */
	FLOAT_EL_HEIGHT: 18,
	
	
	/*
	 * Private properties:
	 */
	/**
	 * @property buttonCt
	 * @type Ext.Element
	 * Element that contains the actual Button DOM element.
	 * We store a reference to it, so we can easily grab its size for sizing the clipEl.
	 * @private
	 */
	buttonCt: null,
	/**
	 * @property clipEl
	 * @type Ext.Element
	 * Element that contains the floatEl.
	 * This element is positioned to fill the area of Ext.Button and has overflow turned off.
	 * This keeps floadEl tight to the Ext.Button, and prevents it from masking surrounding elements.
	 * @private
	 */
	clipEl: null,
	/**
	 * @property floatEl
	 * @type Ext.Element
	 * Element that contains the inputFileEl.
	 * This element is size to be less than or equal to the size of the input file "Browse" button.
	 * It is then positioned wherever the user moves the cursor, so that their click always clicks the input file "Browse" button.
	 * Overflow is turned off to preven inputFileEl from masking surrounding elements.
	 * @private
	 */
	floatEl: null,
	/**
	 * @property inputFileEl
	 * @type Ext.Element
	 * Element for the hiden file input.
	 * @private
	 */
	inputFileEl: null,
	/**
	 * @property originalHandler
	 * @type Function
	 * The handler originally defined for the Ext.Button during construction using the "handler" config option.
	 * We need to null out the "handler" property so that it is only called when a file is selected.
	 * @private
	 */
	originalHandler: null,
	/**
	 * @property originalScope
	 * @type Object
	 * The scope originally defined for the Ext.Button during construction using the "scope" config option.
	 * While the "scope" property doesn't need to be nulled, to be consistent with originalHandler, we do.
	 * @private
	 */
	originalScope: null,
	
	
	/*
	 * Protected Ext.Button overrides
	 */
	/**
	 * @see Ext.Button.initComponent
	 */
	initComponent: function(){
		Ext.ux.form.BrowseButton.superclass.initComponent.call(this);
		// Store references to the original handler and scope before nulling them.
		// This is done so that this class can control when the handler is called.
		// There are some cases where the hidden file input browse button doesn't completely cover the Ext.Button.
		// The handler shouldn't be called in these cases.  It should only be called if a new file is selected on the file system.  
		this.originalHandler = this.handler;
		this.originalScope = this.scope;
		this.handler = null;
		this.scope = null;
	},
	
	/**
	 * @see Ext.Button.onRender
	 */
	onRender: function(ct, position){
		Ext.ux.form.BrowseButton.superclass.onRender.call(this, ct, position); // render the Ext.Button
		this.buttonCt = this.el.child('.x-btn-center em');
		this.buttonCt.position('relative'); // this is important!
		var styleCfg = {
			position: 'absolute',
			overflow: 'hidden',
			top: '0px', // default
			left: '0px' // default
		};
		// browser specifics for better overlay tightness
		if (Ext.isIE) {
			Ext.apply(styleCfg, {
				left: '-3px',
				top: '-3px'
			});
		} else if (Ext.isGecko) {
			Ext.apply(styleCfg, {
				left: '-3px',
				top: '-3px'
			});
		} else if (Ext.isSafari) {
			Ext.apply(styleCfg, {
				left: '-4px',
				top: '-2px'
			});
		}
		this.clipEl = this.buttonCt.createChild({
			tag: 'div',
			style: styleCfg
		});
		this.setClipSize();
		this.clipEl.on({
			'mousemove': this.onButtonMouseMove,
			'mouseover': this.onButtonMouseMove,
			scope: this
		});
		
		this.floatEl = this.clipEl.createChild({
			tag: 'div',
			style: {
				position: 'absolute',
				width: this.FLOAT_EL_WIDTH + 'px',
				height: this.FLOAT_EL_HEIGHT + 'px',
				overflow: 'hidden'
			}
		});
		
		
		if (this.debug) {
			this.clipEl.applyStyles({
				'background-color': 'green'
			});
			this.floatEl.applyStyles({
				'background-color': 'red'
			});
		} else {
			this.clipEl.setOpacity(0.0);
		}
		
		// Cover cases where someone tabs to the button:
		// Listen to focus of the button so we can translate the focus to the input file el.
		var buttonEl = this.el.child(this.buttonSelector);
		buttonEl.on('focus', this.onButtonFocus, this);
		// In IE, it's possible to tab to the text portion of the input file el.  
		// We want to listen to keyevents so that if a space is pressed, we "click" the input file el.
		if (Ext.isIE) {
			this.el.on('keydown', this.onButtonKeyDown, this);
		}
		
		this.createInputFile();
	},
	
	
	/*
	 * Private helper methods:
	 */
	/**
	 * Sets the size of clipEl so that is covering as much of the button as possible.
	 * @private
	 */
	setClipSize: function(){
		if (this.clipEl) {
			var width = this.buttonCt.getWidth();
			var height = this.buttonCt.getHeight();
			if (Ext.isIE) {
				width = width + 5;
				height = height + 5;
			} else if (Ext.isGecko) {
				width = width + 6;
				height = height + 6;
			} else if (Ext.isSafari) {
				width = width + 6;
				height = height + 6;
			}
			this.clipEl.setSize(width, height);
		}
	},
	
	/**
	 * Creates the input file element and adds it to inputFileCt.
	 * The created input file elementis sized, positioned, and styled appropriately.
	 * Event handlers for the element are set up, and a tooltip is applied if defined in the original config.
	 * @private
	 */
	createInputFile: function(){
	
		this.inputFileEl = this.floatEl.createChild({
			tag: 'input',
			type: 'file',
			size: 1, // must be > 0. It's value doesn't really matter due to our masking div (inputFileCt).  
			name: this.inputFileName || Ext.id(this.el),
			tabindex: this.tabIndex,
			// Use the same pointer as an Ext.Button would use.  This doesn't work in Firefox.
			// This positioning right-aligns the input file to ensure that the "Browse" button is visible.
			style: {
				position: 'absolute',
				cursor: 'pointer',
				right: '0px',
				top: '0px'
			}
		});
		this.inputFileEl = this.inputFileEl.child('input') || this.inputFileEl;
		
		// setup events
		this.inputFileEl.on({
			'click': this.onInputFileClick,
			'change': this.onInputFileChange,
			'focus': this.onInputFileFocus,
			'select': this.onInputFileFocus,
			'blur': this.onInputFileBlur,
			scope: this
		});
		
		// add a tooltip
		if (this.tooltip) {
			if (typeof this.tooltip == 'object') {
				Ext.QuickTips.register(Ext.apply({
					target: this.inputFileEl
				}, this.tooltip));
			} else {
				this.inputFileEl.dom[this.tooltipType] = this.tooltip;
			}
		}
	},
	
	/**
	 * Redirecting focus to the input file element so the user can press space and select files.
	 * @param {Event} e focus event.
	 * @private
	 */
	onButtonFocus: function(e){
		if (this.inputFileEl) {
			this.inputFileEl.focus();
			e.stopEvent();
		}
	},
	
	/**
	 * Handler for the IE case where once can tab to the text box of an input file el.
	 * If the key is a space, we simply "click" the inputFileEl.
	 * @param {Event} e key event.
	 * @private
	 */
	onButtonKeyDown: function(e){
		if (this.inputFileEl && e.getKey() == Ext.EventObject.SPACE) {
			this.inputFileEl.dom.click();
			e.stopEvent();
		}
	},
	
	/**
	 * Handler when the cursor moves over the clipEl.
	 * The floatEl gets centered to the cursor location.
	 * @param {Event} e mouse event.
	 * @private
	 */
	onButtonMouseMove: function(e){
		var xy = e.getXY();
		xy[0] -= this.FLOAT_EL_WIDTH / 2;
		xy[1] -= this.FLOAT_EL_HEIGHT / 2;
		this.floatEl.setXY(xy);
	},
	
	/**
	 * Add the visual enhancement to the button when the input file recieves focus. 
	 * This is the tip for the user that now he/she can press space to select the file.
	 * @private
	 */
	onInputFileFocus: function(e){
		if (!this.isDisabled) {
			this.el.addClass("x-btn-over");
		}
	},
	
	/**
	 * Removes the visual enhancement from the button.
	 * @private
	 */
	onInputFileBlur: function(e){
		this.el.removeClass("x-btn-over");
	},
	
	/**
	 * Handler when inputFileEl's "Browse..." button is clicked.
	 * @param {Event} e click event.
	 * @private
	 */
	onInputFileClick: function(e){
		e.stopPropagation();
	},
	
	/**
	 * Handler when inputFileEl changes value (i.e. a new file is selected).
	 * @private
	 */
	onInputFileChange: function(){
		if (this.originalHandler) {
			this.originalHandler.call(this.originalScope, this);
		}
	},
	
	
	/*
	 * Public methods:
	 */
	/**
	 * Detaches the input file associated with this BrowseButton so that it can be used for other purposed (e.g. uplaoding).
	 * The returned input file has all listeners and tooltips applied to it by this class removed.
	 * @param {Boolean} whether to create a new input file element for this BrowseButton after detaching.
	 * True will prevent creation.  Defaults to false.
	 * @return {Ext.Element} the detached input file element.
	 */
	detachInputFile: function(noCreate){
		var result = this.inputFileEl;
		
		if (typeof this.tooltip == 'object') {
			Ext.QuickTips.unregister(this.inputFileEl);
		} else {
			this.inputFileEl.dom[this.tooltipType] = null;
		}
		this.inputFileEl.removeAllListeners();
		this.inputFileEl = null;
		
		if (!noCreate) {
			this.createInputFile();
		}
		return result;
	},
	
	/**
	 * @return {Ext.Element} the input file element attached to this BrowseButton.
	 */
	getInputFile: function(){
		return this.inputFileEl;
	},
	
	/**
	 * @see Ext.Button.disable
	 */
	disable: function(){
		Ext.ux.form.BrowseButton.superclass.disable.call(this);
		this.inputFileEl.dom.disabled = true;
	},
	
	/**
	 * @see Ext.Button.enable
	 */
	enable: function(){
		Ext.ux.form.BrowseButton.superclass.enable.call(this);
		this.inputFileEl.dom.disabled = false;
	}
});

Ext.reg('browsebutton', Ext.ux.form.BrowseButton);;Ext.namespace('Ext.ux');

Ext.ux.BoxSelect = Ext.extend(Ext.form.ComboBox, {

	initComponent:function() {
		Ext.apply(this, {
			selectedValues: {},
			boxElements: {},
			current: false,
			options: {
				className: 'bit',
				separator: ','
			},
			hideTrigger: true,
			grow: false
		});
			
		Ext.ux.BoxSelect.superclass.initComponent.call(this);
	},
	
	onRender:function(ct, position) {
		Ext.ux.BoxSelect.superclass.onRender.call(this, ct, position);
		
		this.el.removeClass('x-form-text');
		this.el.className = 'maininput';
		this.el.setWidth(20);

		this.holder = this.el.wrap({
			'tag': 'ul',
			'class':'holder x-form-text'
		});
				
		this.holder.on('click', function(e){
			e.stopEvent();
			if(this.maininput != this.current) this.focus(this.maininput);
		}, this);

		this.maininput = this.el.wrap({
			'tag': 'li', 'class':'bit-input'
		});
		
		
		Ext.apply(this.maininput, {
			'focus': function(){
				this.focus();
			}.createDelegate(this)
		})
		
		this.store.on('datachanged', function(store){
			this.store.each(function(rec){
				if(this.checkValue(rec.data[this.valueField])){
					this.removedRecords[rec.data[this.valueField]] = rec;
					this.store.remove(rec);
				}
			}, this);
		}, this);

		this.on('expand', function(store){
			this.store.each(function(rec){
				if(this.checkValue(rec.data[this.valueField])){
					this.removedRecords[rec.data[this.valueField]] = rec;
					this.store.remove(rec);
				}
			}, this);
		}, this);
		
		this.removedRecords = {};
	},
	
	onResize : function(w, h, rw, rh){
		this._width = w;
		this.holder.setWidth(w-4);
		Ext.ux.BoxSelect.superclass.onResize.call(this, w, h, rw, rh);
		this.autoSize();
	},
	
	onKeyUp : function(e) {
		if(this.editable !== false && !e.isSpecialKey()){
			if(e.getKey() == e.BACKSPACE && this.lastValue.length == 0){
				e.stopEvent();
				this.collapse();
				var el = this.maininput.prev();
				if(el) el.focus();
				return;
			}
			this.dqTask.delay(this.queryDelay);
		}

		this.autoSize();

		Ext.ux.BoxSelect.superclass.onKeyUp.call(this, e);

		this.lastValue = this.el.dom.value;
	},

	onSelect: function(record, index) {
		var val = record.data[this.valueField];
		
		this.selectedValues[val] = val;
		
		if(typeof this.displayFieldTpl === 'string')
			this.displayFieldTpl = new Ext.XTemplate(this.displayFieldTpl);
		
		if(!this.boxElements[val]){
			var caption;
			if(this.displayFieldTpl)
				caption = this.displayFieldTpl.apply(record.data)
			else if(this.displayField)
				caption = record.data[this.displayField];
			
			this.addItem(record.data[this.valueField], caption)
			
		}
		this.collapse();
		this.setRawValue('');
		this.lastSelectionText = '';
		this.applyEmptyText();

		this.autoSize();
	},

	onEnable: function(){
		Ext.ux.BoxSelect.superclass.onEnable.apply(this, arguments);
		for(var k in this.boxElements){
			this.boxElements[k].enable();
		}
	},

	onDisable: function(){
		Ext.ux.BoxSelect.superclass.onDisable.apply(this, arguments);
		for(var k in this.boxElements){
			this.boxElements[k].disable();
		}
	},

	getValue: function(){
		var ret = [];
		for(var k in this.selectedValues){
			if(this.selectedValues[k])
				ret.push(this.selectedValues[k]);
		}
		return ret.join(this.options['separator']);
	},
	
	setValue: function(value){
		this.removeAllItems();
		this.store.clearFilter();
		this.resetStore();
	
		if(Ext.isArray(this.value) && typeof this.value[0]==='object' && this.value[0].data){
			this.setValues(this.value);
		}
		else{
			if(value && typeof value === 'string'){
				value = value.split(',');
			}

			var values = [];
			
			if(this.mode == 'local'){
				Ext.each(value, function(item){
					var index = this.store.find(this.valueField, item.trim());
					if(index > -1){
						values.push(this.store.getAt(index));
					}
				}, this);
			}else{
				this.store.baseParams[this.queryParam] = value;
				this.store.load({
					params: this.getParams(value)
				});
			}
			this.setValues(values);
		}
	},
	
	setValues: function(values){
		if(values){
			Ext.each(values, function(data){
				this.onSelect(data);
			}, this);
		}
		
		this.value = '';
	},
	
	removeAllItems: function(){
		for(var k in this.boxElements){
			this.boxElements[k].dispose(true);
		}
	},
	
	resetStore: function(){
		for(var k in this.removedRecords){
			var rec = this.removedRecords[k];
			this.store.add(rec);
		}
		this.sortStore();
	},
	
	sortStore: function(){
		var si = this.store.getSortState();
		if(si && si.field)
			this.store.sort(si.field, si.direction);
	},
	
	addItem: function(id, caption){
		var box = new Ext.ux.BoxSelect.Item({
			id: 'Box_' + id,
			maininput: this.maininput,
			renderTo: this.holder,
			className: this.options['className'],
			caption: caption,
			disabled: this.disabled,
			'value': id,
			listeners: {
				'remove': function(box){
					delete this.selectedValues[box.value];
					var rec = this.removedRecords[box.value];
					if(rec){
						this.store.add(rec);
						this.sortStore();
						this.view.render();
						//this.removedRecords[box.value] = null;
					}
				},
				scope: this
			}
		});
		box.render();

		box.hidden = this.el.insertSibling({
			'tag':'input', 
			'type':'hidden', 
			'value': id,
			'name': (this.hiddenName || this.name)
		},'before', true);

		this.boxElements['Box_' + id] = box;
	},
	
	autoSize : function(){
		if(!this.rendered){
		return;
		}
		if(!this.metrics){
			this.metrics = Ext.util.TextMetrics.createInstance(this.el);
		}
		var el = this.el;
		var v = el.dom.value;
		var d = document.createElement('div');
		d.appendChild(document.createTextNode(v));
		v = d.innerHTML;
		d = null;
		v += "&#160;";
		var w = Math.max(this.metrics.getWidth(v) +  10, 10);
		if(typeof this._width != 'undefined')
			w = Math.min(this._width, w);
		
		this.el.setWidth(w);
		
		if(Ext.isIE){
			this.el.dom.style.top='0';
		}
	},
	
	onEnable: function(){
		Ext.ux.BoxSelect.superclass.onEnable.apply(this, arguments);

		for(var k in this.boxElements){
			this.boxElements[k].enable();
		}
	},

	onDisable: function(){
		Ext.ux.BoxSelect.superclass.onDisable.apply(this, arguments);

		for(var k in this.boxElements){
			this.boxElements[k].disable();
		}
	},

	checkValue: function (value) {
		return (typeof this.selectedValues[value] != 'undefined');
	}
});

Ext.reg('boxselect', Ext.ux.BoxSelect);

Ext.ux.BoxSelect.Item = Ext.extend(Ext.Component, {

	initComponent : function(){
		Ext.ux.BoxSelect.Item.superclass.initComponent.call(this);
	},

	onElClick : function(e){
		this.focus();
	},

	onLnkClick : function(e){
		e.stopEvent();
		this.fireEvent('remove', this);
		this.dispose();
	},

	onLnkFocus : function(){
		this.el.addClass("bit-box-focus");
	},

	onLnkBlur : function(){
		this.el.removeClass("bit-box-focus");
	},

	enableElListeners : function() {
		this.el.on('click', this.onElClick, this, {stopEvent:true});
	},

	enableLnkListeners : function() {
		this.lnk.on({
			'click': this.onLnkClick,
			'focus': this.onLnkFocus,
			'blur':  this.onLnkBlur,
			scope: this
		});
	},

	enableAllListeners : function() {
		this.enableElListeners();
		this.enableLnkListeners();
	},

	disableAllListeners : function() {
		this.el.un('click', this.onElClick, this);

		this.lnk.un('click', this.onLnkClick, this);
		this.lnk.un('focus', this.onLnkFocus, this);
		this.lnk.un('blur', this.onLnkBlur, this);
	},

	onRender: function(ct, position){
		Ext.ux.BoxSelect.Item.superclass.onRender.call(this, ct, this.maininput);
		
		this.addEvents('remove');

		this.addClass('bit-box');

		this.el = ct.createChild({ tag: 'li' }, this.maininput);
		this.el.addClassOnOver('bit-hover');

		Ext.apply(this.el, {
			'focus': function(){
				this.down('a.closebutton').focus();
			},
			'dispose': function(){
				this.dispose();
			}.createDelegate(this)

		});

		this.enableElListeners();

		this.el.update(this.caption);

		this.lnk = this.el.createChild({
			'tag': 'a',
			'class': 'closebutton',
			'href':'#'
		});

		if(!this.disabled)
			this.enableLnkListeners();
		else
			this.disableAllListeners();

		this.on({
			'disable': this.disableAllListeners,
			'enable': this.enableAllListeners,
			scope: this
		});

		new Ext.KeyMap(this.lnk, [
			{
				key: [Ext.EventObject.BACKSPACE, Ext.EventObject.DELETE],
				fn: function(){
					this.dispose();
				}.createDelegate(this)
			},
			{
				key: Ext.EventObject.RIGHT,
				fn: function(){
					this.move('right');
				}.createDelegate(this)
			},
			{
				key: Ext.EventObject.LEFT,
				fn: function(){
					this.move('left');
				}.createDelegate(this)
			},
			{
				key: Ext.EventObject.TAB,
				fn: function(){
				}.createDelegate(this)
			}
		]).stopEvent = true;

	},
	
	move: function(direction) {
		if(direction == 'left')
			el = this.el.prev();
		else
			el = this.el.next();
		if(el)
			el.focus();
	},
		
	dispose: function(withoutEffect) {
		this.fireEvent('remove', this);
		Ext.fly(this.hidden).remove();  //Thanks:http://extjs.com/forum/showthread.php?t=33794&page=8

		if(withoutEffect){
			this.destroy();
		}
		else{
			this.el.hide({
				duration: .5,
				callback: function(){
					this.move('right');
					this.destroy()
				}.createDelegate(this)
			});
		}

		return this;
	}

});

;Ext.namespace('Ext.ux.file');

/**
 * @class Ext.ux.file.BrowseAction
 * Reusable action that provides a customizable file browse button.
 * Clicking this button, pops up a file dialog box for a user to select the file to upload.
 * This is accomplished by having a transparent <input type="file"> box above the Ext.Button.
 * When a user thinks he or she is clicking the Ext.Button, they're actually clicking the hidden input "Browse..." box.
 * Note: this class can be instantiated explicitly or with xtypes anywhere a regular Ext.Button can be except in 2 scenarios:
 * - Panel.addButton method both as an instantiated object or as an xtype config object.
 * - Panel.buttons config object as an xtype config object.
 * These scenarios fail because Ext explicitly creates an Ext.Button in these cases.
 * Browser compatibility:
 * Internet Explorer 6:
 * - no issues
 * Internet Explorer 7:
 * - no issues
 * Firefox 2 - Windows:
 * - pointer cursor doesn't display when hovering over the button.
 * Safari 3 - Windows:
 * - no issues.
 * @constructor
 * Create a new BrowseButton.
 * @param {Object} config Configuration options
 */
Ext.ux.file.BrowsePlugin = function(config) {
    Ext.apply(this, config);
};

Ext.ux.file.BrowsePlugin.prototype = {
    /**
     * @cfg {String} inputFileName
     * Name to use for the hidden input file DOM element.  Deaults to "file".
     */
    inputFileName: 'file',
    /**
     * @cfg {Boolean} debug
     * Toggle for turning on debug mode.
     * Debug mode doesn't make clipEl transparent so that one can see how effectively it covers the Ext.Button.
     * In addition, clipEl is given a green background and floatEl a red background to see how well they are positioned.
     */
    debug: false,
    
    
    /*
     * Private constants:
     */
    /**
     * @property FLOAT_EL_WIDTH
     * @type Number
     * The width (in pixels) of floatEl.
     * It should be less than the width of the IE "Browse" button's width (65 pixels), since IE doesn't let you resize it.
     * We define this width so we can quickly center floatEl at the mouse cursor without having to make any function calls.
     * @private
     */
    FLOAT_EL_WIDTH: 60,
    
    /**
     * @property FLOAT_EL_HEIGHT
     * @type Number
     * The heigh (in pixels) of floatEl.
     * It should be less than the height of the "Browse" button's height.
     * We define this height so we can quickly center floatEl at the mouse cursor without having to make any function calls.
     * @private
     */
    FLOAT_EL_HEIGHT: 18,
    
    
    /*
     * Private properties:
     */
    /**
     * @property buttonCt
     * @type Ext.Element
     * Element that contains the actual Button DOM element.
     * We store a reference to it, so we can easily grab its size for sizing the clipEl.
     * @private
     */
    buttonCt: null,
    /**
     * @property clipEl
     * @type Ext.Element
     * Element that contains the floatEl.
     * This element is positioned to fill the area of Ext.Button and has overflow turned off.
     * This keeps floadEl tight to the Ext.Button, and prevents it from masking surrounding elements.
     * @private
     */
    clipEl: null,
    /**
     * @property floatEl
     * @type Ext.Element
     * Element that contains the inputFileEl.
     * This element is size to be less than or equal to the size of the input file "Browse" button.
     * It is then positioned wherever the user moves the cursor, so that their click always clicks the input file "Browse" button.
     * Overflow is turned off to preven inputFileEl from masking surrounding elements.
     * @private
     */
    floatEl: null,
    /**
     * @property inputFileEl
     * @type Ext.Element
     * Element for the hiden file input.
     * @private
     */
    inputFileEl: null,
    /**
     * @property originalHandler
     * @type Function
     * The handler originally defined for the Ext.Button during construction using the "handler" config option.
     * We need to null out the "handler" property so that it is only called when a file is selected.
     * @private
     */
    originalHandler: null,
    /**
     * @property originalScope
     * @type Object
     * The scope originally defined for the Ext.Button during construction using the "scope" config option.
     * While the "scope" property doesn't need to be nulled, to be consistent with originalHandler, we do.
     * @private
     */
    originalScope: null,
    
    /*
     * Protected Ext.Button overrides
     */
    /**
     * @see Ext.Button.initComponent
     */
    init: function(cmp){
        //Ext.ux.file.BrowseAction.superclass.initComponent.call(this);
        // Store references to the original handler and scope before nulling them.
        // This is done so that this class can control when the handler is called.
        // There are some cases where the hidden file input browse button doesn't completely cover the Ext.Button.
        // The handler shouldn't be called in these cases.  It should only be called if a new file is selected on the file system.
        this.originalHandler = cmp.handler || null;
        this.originalScope = cmp.scope || window;
        this.handler = null;
        this.scope = null;
        
        this.component = cmp;
        
        cmp.on('render', this.onRender, this);
        
        // chain enable/disable fns
        if (typeof cmp.setDisabled == 'function') {
            cmp.setDisabled = cmp.setDisabled.createSequence(function(disabled) {
                if (this.inputFileEl) {
                    this.inputFileEl.dom.disabled = disabled;
                }
            }, this);
        }
        
        if (typeof cmp.enable == 'function') {
            cmp.enable = cmp.enable.createSequence(function() {
                if (this.inputFileEl) {
                    this.inputFileEl.dom.disabled = false;
                }
            }, this);
        }
        
        if (typeof cmp.disable == 'function') {
            cmp.disable = cmp.disable.createSequence(function() {
                if (this.inputFileEl) {
                    this.inputFileEl.dom.disabled = true;
                }
            }, this);
        }
        
    },
    
    /**
     * @see Ext.Button.onRender
     */
    onRender: function(){
        
        this.buttonCt = this.buttonCt || this.component.el.child('.x-btn-center em') || this.component.el;
        this.buttonCt.position('relative'); // this is important!
        var styleCfg = {
            position: 'absolute',
            overflow: 'hidden',
            top: '0px', // default
            left: '0px' // default
        };
        // browser specifics for better overlay tightness
        if (Ext.isIE) {
            Ext.apply(styleCfg, {
                left: '-3px',
                top: '-3px'
            });
        } else if (Ext.isGecko) {
            Ext.apply(styleCfg, {
                left: '-3px',
                top: '-3px'
            });
        } else if (Ext.isSafari) {
            Ext.apply(styleCfg, {
                left: '-4px',
                top: '-2px'
            });
        }
        this.clipEl = this.buttonCt.createChild({
            tag: 'div',
            style: styleCfg
        });
        this.setClipSize();
        this.clipEl.on({
            'mousemove': this.onButtonMouseMove,
            'mouseover': this.onButtonMouseMove,
            scope: this
        });
        
        this.floatEl = this.clipEl.createChild({
            tag: 'div',
            style: {
                position: 'absolute',
                width: this.FLOAT_EL_WIDTH + 'px',
                height: this.FLOAT_EL_HEIGHT + 'px',
                overflow: 'hidden'
            }
        });
        
        // set the styles, is IE has problems to follow the mouse
        // when no styles are set
        this.clipEl.applyStyles({
            'background-color': 'green'
        });
        this.floatEl.applyStyles({
            'background-color': 'red'
        });
            
        if (! this.debug) {
            this.clipEl.setOpacity(0.0);
        }
        
        this.createInputFile();
    },
    
    
    /*
     * Private helper methods:
     */
    /**
     * Sets the size of clipEl so that is covering as much of the button as possible.
     * @private
     */
    setClipSize: function(){
        if (this.clipEl) {
            var width = this.buttonCt.getWidth();
            var height = this.buttonCt.getHeight();
            if (Ext.isIE) {
                width = width + 5;
                height = height + 5;
            } else if (Ext.isGecko) {
                width = width + 6;
                height = height + 6;
            } else if (Ext.isSafari) {
                width = width + 6;
                height = height + 6;
            }
            this.clipEl.setSize(width, height);
        }
    },
    
    /**
     * Creates the input file element and adds it to inputFileCt.
     * The created input file elementis sized, positioned, and styled appropriately.
     * Event handlers for the element are set up, and a tooltip is applied if defined in the original config.
     * @private
     */
    createInputFile: function(){
    
        this.inputFileEl = this.floatEl.createChild({
            tag: 'input',
            type: 'file',
            size: 1, // must be > 0. It's value doesn't really matter due to our masking div (inputFileCt).  
            name: this.inputFileName || Ext.id(this.el),
            // Use the same pointer as an Ext.Button would use.  This doesn't work in Firefox.
            // This positioning right-aligns the input file to ensure that the "Browse" button is visible.
            style: {
                position: 'absolute',
                cursor: 'pointer',
                right: '0px',
                top: '0px'
            }
        });
        this.inputFileEl = this.inputFileEl.child('input') || this.inputFileEl;
        
        // setup events
        this.inputFileEl.on({
            'click': this.onInputFileClick,
            'change': this.onInputFileChange,
            scope: this
        });
        
        // add a tooltip
        if (this.tooltip) {
            if (typeof this.tooltip == 'object') {
                Ext.QuickTips.register(Ext.apply({
                    target: this.inputFileEl
                }, this.tooltip));
            } else {
                this.inputFileEl.dom[this.tooltipType] = this.tooltip;
            }
        }
    },
    
    /**
     * Handler when the cursor moves over the clipEl.
     * The floatEl gets centered to the cursor location.
     * @param {Event} e mouse event.
     * @private
     */
    onButtonMouseMove: function(e){
        var xy = e.getXY();
        xy[0] -= this.FLOAT_EL_WIDTH / 2;
        xy[1] -= this.FLOAT_EL_HEIGHT / 2;
        this.floatEl.setXY(xy);
    },
    
    /**
     * Handler when inputFileEl's "Browse..." button is clicked.
     * @param {Event} e click event.
     * @private
     */
    onInputFileClick: function(e){
        e.stopPropagation();
    },
    
    /**
     * Handler when inputFileEl changes value (i.e. a new file is selected).
     * @private
     */
    onInputFileChange: function(){
        if (this.originalHandler) {
            this.originalHandler.call(this.originalScope, this);
        }
    },
    
    
    /*
     * Public methods:
     */
    /**
     * Detaches the input file associated with this BrowseButton so that it can be used for other purposed (e.g. uplaoding).
     * The returned input file has all listeners and tooltips applied to it by this class removed.
     * @param {Boolean} whether to create a new input file element for this BrowseButton after detaching.
     * True will prevent creation.  Defaults to false.
     * @return {Ext.Element} the detached input file element.
     */
    detachInputFile: function(noCreate){
        var result = this.inputFileEl;
        
        if (typeof this.tooltip == 'object') {
            Ext.QuickTips.unregister(this.inputFileEl);
        } else {
            this.inputFileEl.dom[this.tooltipType] = null;
        }
        this.inputFileEl.removeAllListeners();
        this.inputFileEl = null;
        
        if (!noCreate) {
            this.createInputFile();
        }
        return result;
    },
    
    /**
     * @return {Ext.Element} the input file element attached to this BrowseButton.
     */
    getInputFile: function(){
        return this.inputFileEl;
    },
    
    /**
     * @see Ext.Button.disable
     */
    disable: function(){
        Ext.ux.file.BrowseAction.superclass.disable.call(this);
        this.inputFileEl.dom.disabled = true;
    },
    
    /**
     * @see Ext.Button.enable
     */
    enable: function(){
        Ext.ux.file.BrowseAction.superclass.enable.call(this);
        this.inputFileEl.dom.disabled = false;
    }
};
;Ext.namespace('Ext.ux.file');

/**
 * a simple file uploader
 * 
 * objects of this class represent a single file uplaod
 */
Ext.ux.file.Uploader = function(config) {
    Ext.apply(this, config);

    Ext.ux.file.Uploader.superclass.constructor.apply(this, arguments);
    
    this.addEvents(
        /**
         * @event uploadcomplete
         * Fires when the upload was done successfully 
         * @param {Ext.ux.file.Uploader} this
         */
         'uploadcomplete',
        /**
         * @event uploadfailure
         * Fires when the upload failed 
         * @param {Ext.ux.file.Uploader} this
         */
         'uploadfailure'
    );
};
 
Ext.extend(Ext.ux.file.Uploader, Ext.util.Observable, {
    /**
     * @cfg {Int} maxFileSize the maximum file size in bytes
     */
    maxFileSize: 2097152,
    /**
     * @cfg {String} url the url we upload to
     */
    url: 'index.php',
    
    //默认为0，表示后台不对图片大小进行处理
    imageWidth : 0,
    imageHeight : 0,
    
    /**
     * creates a form where the upload takes place in
     * @private
     */
    createForm: function() {
        var form = Ext.getBody().createChild({
            tag:'form',
            action:this.url,
            method:'post',
            cls:'x-hidden',
            id:Ext.id(),
            cn:[{
                tag: 'input',
                type: 'hidden',
                name: 'MAX_FILE_SIZE',
                value: this.maxFileSize
            }]
        });
        return form;
    },
    /**
     * perform the upload
     * @return {Ext.ux.file.Uploader} this
     */
    upload: function() {
        var form = this.createForm();
        form.appendChild(this.input);
        this.record = new Ext.ux.file.Uploader.file({
            input: this.input,
            form: form,
            status: 'uploading'
        });
        
        var request = Ext.Ajax.request({
            isUpload: true,
            method:'post',
            form: form,
            scope: this,
            success: this.onUploadSuccess,
            failure: this.onUploadFail,
            params: {
                width: this.imageWidth,
                height: this.imageHeight
            }
        });
        
        this.record.set('request', request);
        return this;
    },
    /**
     * returns record with info about this upload
     * @return {Ext.data.Record}
     */
    getRecord: function() {
        return this.record;
    },
    /**
     * executed if a file got uploaded successfully
     */
    onUploadSuccess: function(response, request) {
        response = Ext.util.JSON.decode(response.responseText);
        if (response.status && response.status !== 'success') {
            this.onUploadFail();
        } else {
            this.record.set('status', 'complete');
            this.record.set('tempFile', response.tempFile);
            
            this.fireEvent('uploadcomplete', this, this.record);
        }
    },
    /**
     * executed if a file upload failed
     */
    onUploadFail: function(response, request) {
        this.record.set('status', 'failure');
        
        this.fireEvent('uploadfailure', this, this.record);
    },
    /**
     * get file name
     * @return {String}
     */
    getFileName:function() {
        return this.input.getValue().split(/[\/\\]/).pop();
    },
    /**
     * get file path (excluding the file name)
     * @return {String}
     */
    getFilePath:function() {
        return this.input.getValue().replace(/[^\/\\]+$/,'');
    },
    /**
     * returns file class based on name extension
     * @return {String} class to use for file type icon
     */
    getFileCls: function() {
        var fparts = this.getFileName().split('.');
        if(fparts.length === 1) {
            return '';
        }
        else {
            return fparts.pop().toLowerCase();
        }
    },
    isImage: function() {
        var cls = this.getFileCls();
        return (cls == 'jpg' || cls == 'gif' || cls == 'png' || cls == 'jpeg');
    }
});

Ext.ux.file.Uploader.file = Ext.data.Record.create([
    {name: 'id', type: 'text', system: true},
    {name: 'status', type: 'text', system: true},
    {name: 'tempFile', system: true},
    {name: 'form', system: true},
    {name: 'input', system: true},
    {name: 'request', system: true}
]);
;/**
 * 与 Ext.ux.form.ImageField 的区别：自定义接收上传文件的 url
 */
Ext.ux.form.ImageField2 = Ext.extend(Ext.form.Field, {
    /**
     * @cfg {bool}
     */
    border: true,
    /**
     * @cfg {String}
     */
    defaultImage: '/media/images/image-field-2-blank.gif',
    uploadUrl : "",
    
    defaultAutoCreate : {tag:'input', type:'hidden'},
    
    initComponent: function() {
        this.plugins = this.plugins || [];
        this.scope = this;
        this.handler = this.onFileSelect;
        
        this.browsePlugin = new Ext.ux.file.BrowsePlugin({});
        this.plugins.push(this.browsePlugin);
        
        Ext.ux.form.ImageField2.superclass.initComponent.call(this);
        this.imageSrc = this.defaultImage;
        if(this.border === true) {
            this.width = this.width;
            this.height = this.height;
        }
    },
    onRender: function(ct, position) {
        Ext.ux.form.ImageField2.superclass.onRender.call(this, ct, position);
        
        // the container for the browe button
        this.buttonCt = Ext.DomHelper.insertFirst(ct, '<div>&nbsp;</div>', true);
        this.buttonCt.applyStyles({
            border: this.border === true ? '1px solid #B5B8C8' : '0'
        });
        this.buttonCt.setSize(this.width, this.height);
        this.buttonCt.on('contextmenu', this.onContextMenu, this);
        
        // the click to edit text container
//        var clickToEditText = '点击开始上传';
//        this.textCt = Ext.DomHelper.insertFirst(this.buttonCt, '<div class="x-ux-from-imagefield-text">' + clickToEditText + '</div>', true);
//        this.textCt.setSize(this.width, this.height);
//        var tm = Ext.util.TextMetrics.createInstance(this.textCt);
//        tm.setFixedWidth(this.width);
//        this.textCt.setStyle({top: ((this.height - tm.getHeight(clickToEditText)) / 2) + 'px'});
        
        // the image container
        // NOTE: this will atm. always be the default image for the first few miliseconds
        this.imageCt = Ext.DomHelper.insertFirst(this.buttonCt, '<img src="' + this.imageSrc + '"/>' , true);
        this.imageCt.setOpacity(0.2);
        this.imageCt.setStyle({
            position: 'absolute',
            top: '18px'
        });
        
        Ext.apply(this.browsePlugin, {
            buttonCt: this.buttonCt,
            renderTo: this.buttonCt
        });
    },
    getValue: function() {
        var value = Ext.ux.form.ImageField2.superclass.getValue.call(this);
        return value;
    },
    setValue: function(value) {
        Ext.ux.form.ImageField2.superclass.setValue.call(this, value);
        if (! value || value == this.defaultImage) {
            this.imageSrc = this.defaultImage;
        } else {
            this.imageSrc = value;
            this.imageSrc.width = this.width;
            this.imageSrc.height = this.height;
            this.imageSrc.ratiomode = 0;
        }
        this.updateImage();
    },
    /**
     * @private
     */
    onFileSelect: function(bb) {
        var input = bb.detachInputFile();
        var uploader = new Ext.ux.file.Uploader({
            input: input,
            url : this.uploadUrl,
            imageWidth : this.width,
            imageHeight : this.height
        });
        if(! uploader.isImage()) {
            Ext.MessageBox.alert('提示', '上传文件不是图片(gif/png/jpeg)').setIcon(Ext.MessageBox.ERROR);
            return;
        }
        uploader.on('uploadcomplete', function(uploader, record){
            this.setValue(record.data.tempFile);
            this.updateImage();
        }, this);
        uploader.on('uploadfailure', this.onUploadFail, this);
        
        this.buttonCt.mask('Loading', 'x-mask-loading');
        uploader.upload();
        
    },
    /**
     * @private
     */
    onUploadFail: function() {
    	this.buttonCt.unmask()
        Ext.MessageBox.alert('提示', '上传失败').setIcon(Ext.MessageBox.ERROR);
    },
    /**
     * executed on image contextmenu
     * @private
     */
    onContextMenu: function(e, input) {
        e.preventDefault();
        
        var ct = Ext.DomHelper.append(this.buttonCt, '<div>&nbsp;</div>', true);
        this.ctxMenu = new Ext.menu.Menu({
            items: [
            {
                text: '删除图片',
                iconCls: 'action_delete',
                disabled: this.imageSrc == this.defaultImage,
                scope: this,
                handler: function() {
                    this.setValue('');
                }
                
            }]
        });
        this.ctxMenu.showAt(e.getXY());
    },
    updateImage: function() {
        // only update when new image differs from current
        if(this.imageCt.dom.src.substr(-1 * this.imageSrc.length) != this.imageSrc) {
            var ct = this.imageCt.up('div');
            var img = Ext.DomHelper.insertAfter(this.imageCt, '<img src="' + this.imageSrc + '"/>' , true);
            // replace image after load
            img.on('load', function(){
                this.imageCt.remove();
                this.imageCt = img;
                //this.textCt.setVisible(this.imageSrc == this.defaultImage);
                this.imageCt.setOpacity(this.imageSrc == this.defaultImage ? 0.2 : 1);
                this.buttonCt.unmask();
            }, this);
            img.on('error', function() {
                Ext.MessageBox.alert('Image Failed', 'Could not load image. Please notify your Administrator').setIcon(Ext.MessageBox.ERROR);
                this.buttonCt.unmask();
            }, this);
        }
    }
});

Ext.reg('ximagefield', Ext.ux.form.ImageField);
;// ButtonField 
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
;// SimpleHtml 


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

Ext.ComponentMgr.registerType("formHtml", Ext.ux.form.SimpleHtml );;Ext.namespace('Ext.ux', 'Ext.ux.form');

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

Ext.reg('magnifiedTextArea', Ext.ux.form.MagnifiedTextArea);;/**********
*
* http://TDG-i.com TDG innovations, LLC
* 03/15/2008, Jay Garcia, jgarcia@tdg-i.com
* borderLayout extension example displaying 'collapsed titles' 
* Blog Link: http://tdg-i.com/30/how-to-get-titles-in-collapsed-panels-for-border-layout
* Purpose : Adds ability to insert title in collapsed layout panels.  
* Note: You must use layout 'tdgi_border' to use this extension.
* Works with EXT 2.0+
*
* Parameters: collapsedTitle, object || string || boolean
* 
* Example Object: 
	collapsedTitle: {
		//Just like an Ext.DomHelper config object
		element : {
			// Required0
			tag  : 'div',
			// Required
			html : 'NorthPanel Collapsed',
			// Set this if you need to.
			style  : "margin-left:3px; color: #FF0000; font-weight: bold;"
		}
	}

*
* Example String: (Html fragment)
	collapsedTitle: '<div style="myStyle">My Collapsed Title</div>'
*
* Example Boolean: (This allows you to use the original title)
	collapsedTitle: true

*
* License : Free to use, just please don't sell without permission.
* This was made for myself, my customers, and the EXT Community.  
* 
* Waranty : None. I can answer questions via email: jgarcia@tdg-i.com
*
**********/

Ext.namespace('Ext.ux', 'Ext.ux.TDGi');

Ext.ux.TDGi.BorderLayout = function(config) {

	Ext.ux.TDGi.BorderLayout.superclass.constructor.call(this, config, this);
	
	
};

Ext.extend(Ext.ux.TDGi.BorderLayout, Ext.layout.BorderLayout, {
	northTitleAdded  : false,
	southTitleAdded  : false,
	eastTitleAdded  : false,
	westTitleAdded  : false,

	doCollapsedTitle : function (ct) {
		function doHtmlInsert(ct, element) {
			if (ct.region == 'east' || ct.region =='west') {
				if (Ext.isIE6 || Ext.isIE7) {
					if (ct.region == 'east') {
						Ext.get(ct.collapsedEl.dom.firstChild).applyStyles({margin:'3px 3px 5px 3px'});
					}
					else {
						Ext.get(ct.collapsedEl.dom.firstChild).applyStyles({margin:'3px auto 5px 3px'});
					}
				}
				return(Ext.DomHelper.append(ct.collapsedEl, element));
			}
			else {
				return(Ext.DomHelper.insertFirst(ct.collapsedEl, element));
			}			
			
		}
		
		if (ct.collapsedTitle) {
			if (typeof ct.collapsedTitle == 'object') {
				if (typeof ct.collapsedTitle.element == 'object') {
					var element = ct.collapsedTitle.element;
					if (element.style) {
						element.style += 'float: left;';	
					}
					else {
						element.style = 'float: left;';	
					}
					doHtmlInsert(ct, element);
					return(true);
				}
			}
			else if (typeof ct.collapsedTitle == 'string') {
				var element = ct.collapsedTitle;
				doHtmlInsert(ct, element);
				return(true)	
			}
			else if (typeof ct.collapsedTitle == 'boolean' && ct.collapsedTitle == true) {
				if (ct.region == 'east' || ct.region =='west') {
					if (Ext.isIE6 || Ext.isIE7) {
						var element = {
							tag : 'div',
							style : "writing-mode: tb-rl;FONT-FAMILY: 'Arial', 'Helvetica';FONT-SIZE: 13px; ",
							html : ct.title 
						}
					}
					else {
						var y = 0, txt = '';
						for (i = 0; y < ct.title.length ; i ++ ) {
							txt += ct.title.substr(y, 1) + '<br />';
							y++;	
						}
						var element = {
							tag : 'div',
							style : "text-align: center;",
							html : txt 
						}
					}
				}
				else {
					var element = {
						tag : 'div',
						html : ct.title ,
						style : 'float: left;'
					}
				
				}
				doHtmlInsert(ct, element);
				return(true);				
			}
			
		}

	},
	// private
	onLayout : function(ct, target){

		var collapsed;
		if(!this.rendered){
			
			target.position();
			target.addClass('x-border-layout-ct');
			var items = ct.items.items;
			collapsed = [];
			for(var i = 0, len = items.length; i < len; i++) {
				var c = items[i];
				var pos = c.region;
				if(c.collapsed){
					collapsed.push(c);
				}
				c.collapsed = false;
				if(!c.rendered){
					c.cls = c.cls ? c.cls +' x-border-panel' : 'x-border-panel';
					c.render(target, i);
				}
				this[pos] = pos != 'center' && c.split ?
					new Ext.layout.BorderLayout.SplitRegion(this, c.initialConfig, pos) :
					new Ext.layout.BorderLayout.Region(this, c.initialConfig, pos);
				this[pos].render(target, c);
			}
			this.rendered = true;
		}

		var size = target.getViewSize();
		if(size.width < 20 || size.height < 20){ // display none?
			if(collapsed){
				this.restoreCollapsed = collapsed;
			}
			return;
		}else if(this.restoreCollapsed){
			collapsed = this.restoreCollapsed;
			delete this.restoreCollapsed;
		}

		var w = size.width, h = size.height;
		var centerW = w, centerH = h, centerY = 0, centerX = 0;

		var n = this.north, s = this.south, west = this.west, e = this.east, c = this.center;
		if(!c){
			throw 'No center region defined in BorderLayout ' + ct.id;
		}

		if(n && n.isVisible()){
			var b = n.getSize();
			var m = n.getMargins();
			b.width = w - (m.left+m.right);
			b.x = m.left;
			b.y = m.top;
			centerY = b.height + b.y + m.bottom;
			centerH -= centerY;
			n.applyLayout(b);
					
			/**********
			*
			* http://TDG-i.com TDG innovations, LLC
			* 03/15/2008, Jay Garcia, jgarcia@tdg-i.com
			* borderLayout extension example displaying 'collapsed titles' 
			* Blog Link: http://tdg-i.com/30/how-to-get-titles-in-collapsed-panels-for-border-layout
			* Purpose : Adds ability to insert title in collapsed layout panels.
			*
			************/
			if (typeof n.collapsedEl != 'undefined' && n.collapsedTitle && this.northTitleAdded == false) {
				if (this.doCollapsedTitle(n)) {
					this.northTitleAdded = true;
				}
			}                    
		}
		if(s && s.isVisible()){
			var b = s.getSize();
			var m = s.getMargins();
			b.width = w - (m.left+m.right);
			b.x = m.left;
			var totalHeight = (b.height + m.top + m.bottom);
			b.y = h - totalHeight + m.top;
			centerH -= totalHeight;
			s.applyLayout(b);

			/**********
			*
			* http://TDG-i.com TDG innovations, LLC
			* 03/15/2008, Jay Garcia, jgarcia@tdg-i.com
			* borderLayout extension example displaying 'collapsed titles' 
			* Blog Link: http://tdg-i.com/30/how-to-get-titles-in-collapsed-panels-for-border-layout
			* Purpose : Adds ability to insert title in collapsed layout panels.
			*
			************/

			if (typeof s.collapsedEl != 'undefined' && s.collapsedTitle && this.southTitleAdded == false) {
				if (this.doCollapsedTitle(s)) {
					this.southTitleAdded = true;
				}
			}                
		}
		if(west && west.isVisible()){
			var b = west.getSize();
			var m = west.getMargins();
			b.height = centerH - (m.top+m.bottom);
			b.x = m.left;
			b.y = centerY + m.top;
			var totalWidth = (b.width + m.left + m.right);
			centerX += totalWidth;
			centerW -= totalWidth;
			west.applyLayout(b);

			/**********
			*
			* http://TDG-i.com TDG innovations, LLC
			* 03/15/2008, Jay Garcia, jgarcia@tdg-i.com
			* borderLayout extension example displaying 'collapsed titles' 
			* Blog Link: http://tdg-i.com/30/how-to-get-titles-in-collapsed-panels-for-border-layout
			* Purpose : Adds ability to insert title in collapsed layout panels.
			*
			************/
			if (typeof west.collapsedEl != 'undefined' && west.collapsedTitle && this.westTitleAdded == false) {
				if (this.doCollapsedTitle(west)) {
					this.westTitleAdded = true;
				}
			
			}                
			
		}
		if(e && e.isVisible()){
			var b = e.getSize();
			var m = e.getMargins();
			b.height = centerH - (m.top+m.bottom);
			var totalWidth = (b.width + m.left + m.right);
			b.x = w - totalWidth + m.left;
			b.y = centerY + m.top;
			centerW -= totalWidth;
			e.applyLayout(b);
	
			/**********
			*
			* http://TDG-i.com TDG innovations, LLC
			* 03/15/2008, Jay Garcia, jgarcia@tdg-i.com
			* borderLayout extension example displaying 'collapsed titles' 
			* Blog Link: http://tdg-i.com/30/how-to-get-titles-in-collapsed-panels-for-border-layout
			* Purpose : Adds ability to insert title in collapsed layout panels.
			*
			************/
			if (typeof e.collapsedEl != 'undefined' && e.collapsedTitle && this.eastTitleAdded == false) {
				if (this.doCollapsedTitle(e)) {
					this.eastTitleAdded = true;
				}
			}                
			
		}

		var m = c.getMargins();
		var centerBox = {
			x: centerX + m.left,
			y: centerY + m.top,
			width: centerW - (m.left+m.right),
			height: centerH - (m.top+m.bottom)
		};
		c.applyLayout(centerBox);

		if(collapsed){
			for(var i = 0, len = collapsed.length; i < len; i++){
				collapsed[i].collapse(false);
			}
		}

		if(Ext.isIE && Ext.isStrict){ // workaround IE strict repainting issue
			target.repaint();
		}
	}
});

Ext.Container.LAYOUTS['tdgi_border'] = Ext.ux.TDGi.BorderLayout;;// Version: 11. August 2008

// AutoTableFormLayout
// Based on http://extjs.com/forum/showthread.php?t=39342 by mbajema and Animal

Ext.namespace('Ext.ux.layout');

// Make the fieldTpl available to ALL layouts
Ext.override(Ext.layout.ContainerLayout, {
    fieldTpl: (function() {
        var t = new Ext.Template(
            '<div class="x-form-item {5}" tabIndex="-1">',
                '<label for="{0}" style="{2}" class="x-form-item-label">{1}{4}</label>',
                '<div class="x-form-element" id="x-form-el-{0}" style="{3}">',
                '</div><div class="{6}"></div>',
            '</div>'
        );
        t.disableFormats = true;
        return t.compile();
    })()
});

Ext.ux.layout.AutoTableFormLayout = Ext.extend(Ext.layout.TableLayout, 
{
	labelSeparator: ':',
	
    setContainer: function(ct) 
    {
        // Creating all subitems, figure out how many columns we need
		this.columns = 1;
        var aCols = new Array();
        for(var i = 0, len = ct.items.length; i < len; i++) 
        {	var mainItem = ct.items.itemAt(i);
        	if (mainItem.fieldLabel == "") mainItem.labelSeparator = "";
        	mainItem.labelWidth = mainItem.labelWidth || ct.labelWidth || 100;
        	mainItem.colspan = mainItem.colspan || 1;
        	
        	var cols = mainItem.colspan;
        	if (mainItem.items != undefined)
       		{	// All subitems of this row
       			for(var j = 0, lensubItems = mainItem.items.length; j < lensubItems; j++) 	
            	{	var subItem = mainItem.items[j];
            		Ext.applyIf(subItem, ct.defaults);
            		subItem = Ext.ComponentMgr.create(subItem, subItem.xtype || ct.defaultType || "textfield");
            		if (subItem.fieldLabel == "") subItem.labelSeparator = "";
            		
            		subItem.labelWidth = subItem.labelWidth || ct.subLabelWidth || 0;
            		mainItem.items[j] = subItem;
           	 		subItem.colspan = subItem.colspan || 1;
           	 		cols += subItem.colspan;
           	 		ct.getForm().add(subItem);
            	}
           	 	this.columns = Math.max(this.columns, cols);
           	 }
        	aCols[i] = cols;
        }
       
        // Set colspan
        for(var i = 0, len = ct.items.length; i < len; i++) 
        {	var mainItem = ct.items.itemAt(i);
        	mainItem.colspan += this.columns-aCols[i];
        }
        
       Ext.layout.FormLayout.prototype.setContainer.apply(this, arguments);
       
       this.currentRow = 0;
       this.currentColumn = 0;
       this.cells = [];
    },

    renderItem : function(c, position, target) 
    {
        if (c && !c.rendered)
		{			
        		
			// Render mainItem
            this.doRender(c, 0, Ext.get(this.getNextCell(c)), false);
         		
         	// Render subitems
         	for (var i = 0; i < this.columns-1; i++) 
         	{	if (c.items != undefined && i < c.items.length)
            	{	// Subitem available: Render it
            		var subItem = c.items[i];
            		this.doRender(subItem, 0, Ext.get(this.getNextCell(subItem)), true);
            	}
            }

         	// Hide row?
         	if (c.hideRow) this.showRow(this.currentRow, false);
        
        }
    },
    
    doRender : function (c, position, target, isChild)
    {	// We need this in order to be able to set the labelWidth for mainitems and subitems differently
    	if(typeof c.labelWidth == 'number')
        {	var pad = Ext.isIE?5:20; // (typeof c.ownerCt.labelPad == 'number' ? c.ownerCt.labelPad : 5); // How to get the container here?
    		this.labelStyle = "width:"+c.labelWidth+"px;";
    		if (isChild) this.labelStyle += "width:"+(c.labelWidth-pad)+"px; padding-left:"+pad+"px;";
            this.elementStyle = "padding-left:"+(c.labelWidth+pad)+'px;';
    	}
    	
    	// Call Render
    	Ext.layout.FormLayout.prototype.renderItem.call(this, c, 0, target);
    },
    
    showRow : function (index, show)
    {	var row = this.getRow(index);
		if (show)
				row.style.display = "";
		else	row.style.display = "none";
    }
    
});

Ext.Container.LAYOUTS['autotableform'] = Ext.ux.layout.AutoTableFormLayout;


;Ext.namespace('Ext.ux', 'Ext.ux.layout');

/**
 * @class Ext.ux.layout.HorizontalFitLayout
 * @extends Ext.layout.ContainerLayout
 * @description
 * <p>This is a base class for layouts that contain a single item that automatically expands horizontally to fill 
 * the horizontal dimenson of the layout's container.  This class is intended to be extended or created via the 
 * layout:'hfit' {@link Ext.Container#layout} config, and should generally not need to be created directly via 
 * the new keyword.</p>
 * <p>To fit a panel to a container horizontally using Horizontal FitLayout, simply set layout:'hfit' on the container 
 * and add a multiple panel to it.</p>
 * <p>Example usage:</p>
 * <pre><code>
var p = new Ext.Panel({
    title: 'Horizontal Fit Layout',
    layout:'hfit',
    items: [{
        title: 'Inner Panel One',
        html: '&lt;p&gt;This is the firsts inner panel content&lt;/p&gt;',
        border: false
    },{
        title: 'Inner Panel Two',
        html: '&lt;p&gt;This is the seconds inner panel content&lt;/p&gt;',
        border: false
    }]
});
</code></pre>
 */
Ext.ux.layout.HorizontalFitLayout = Ext.extend(Ext.layout.ContainerLayout, {
    /**
     * @cfg {bool} containsScrollbar
     */
    containsScrollbar: false,
    /**
     * @private
     */
    monitorResize:true,

    /**
     * @private
     */
    onLayout : function(ct, target){
        Ext.layout.FitLayout.superclass.onLayout.call(this, ct, target);
        if(!this.container.collapsed){
            var size = target.getStyleSize();
            size.width = ct.containsScrollbar ? size.width-16 : size.width;
            
            ct.items.each(function(item){
                this.setItemSize(item,  size);
            }, this);
        }
    },
    /**
     * @private
     */
    setItemSize : function(item, size){
        if(item && size.height > 0){ // display none?
            item.setWidth(size.width);
        }
    }
});
Ext.Container.LAYOUTS['hfit'] = Ext.ux.layout.HorizontalFitLayout;
;
Ext.namespace('Ext.ux', 'Ext.ux.form');

/**
 * @class Ext.ux.form.ColumnFormPanel
 * @description
 * Helper Class for creating form panels with a horizontal layout. This class could be directly
 * created using the new keyword or by specifying the xtype: 'columnform'
 * Example usage:</p>
 * <pre><code>
var p = new Ext.ux.form.ColumnFormPanel({
    title: 'Horizontal Form Layout',
    items: [
        [
            {
                columnWidth: .6,
                fieldLabel:'Company Name', 
                name:'org_name'
            },
            {
                columnWidth: .4,
                fieldLabel:'Street', 
                name:'adr_one_street'
            }
        ],
        [
            {
                columnWidth: .7,
                fieldLabel:'Region',
                name:'adr_one_region'
            },
            {
                columnWidth: .3,
                fieldLabel:'Postal Code', 
                name:'adr_one_postalcode'
            }
        ]
    ]
});
</code></pre>
 */
Ext.ux.form.ColumnFormPanel = Ext.extend(Ext.Panel, {
    /**
     * @cfg
     */
    formDefaults: {
        xtype:'textfield',
        anchor: '100%',
        labelSeparator: '',
        columnWidth: .333
    },
    layout: 'hfit',
    labelAlign: 'top',
    /**
     * @private
     */
    initComponent: function() {
        var items = [];
            
        // each item is an array with the config of one row
        for (var i=0,j=this.items.length; i<j; i++) {
            
            var initialRowConfig = this.items[i];
            var rowConfig = {
                border: false,
                layout: 'column',
                items: []
            };
            // each row consits n column objects 
            for (var n=0,m=initialRowConfig.length; n<m; n++) {
                var column = initialRowConfig[n];
                var idx = rowConfig.items.push({
                    columnWidth: column.columnWidth ? column.columnWidth : this.formDefaults.columnWidth,
                    layout: 'form',
                    labelAlign: this.labelAlign,
                    defaults: this.formDefaults,
                    bodyStyle: 'padding-right: 5px;',
                    border: false,
                    items: column
                });
                
                if (column.width) {
                    rowConfig.items[idx-1].width = column.width;
                    delete rowConfig.items[idx-1].columnWidth;
                }
            }
            items.push(rowConfig);
        }
        this.items = items;
        
        Ext.ux.form.ColumnFormPanel.superclass.initComponent.call(this);
    }
});

Ext.reg('columnform', Ext.ux.form.ColumnFormPanel);

;/**
 * 用HTML表格实现的网格
 */
divo.grid.SimpleGrid = Ext.extend(Ext.Panel, {
	item : null,
	displayEmptyText : null,
	editable : true,
	//defaultDateFormat : "m/d/Y",
	alternateRows : false,
	fields : [],
	rowAlternateClass : "alt",
	selectedClass : "selected",
	hoveredClass : "hovered",
	singleSelect : true,
	muliSelect : false,
	headerClass : "",
	headerUpClass : "selectedUp",
	headerDownClass : "selectedDown",
	tableClass : "j-grid-table",
	fieldDefinitions : null,
	getFieldFunc : null,
	setFieldFunc : null,
	selectRecord : null,
	sortable : true,
	sortInfo : {
		index : -1,
		direction : 0
	},
	_meta : {
		field : null,
		format : null,
		filterer : null,
		sortable : true,
		sortType : "String",
		dataType : String,
		sortFunction : null,
		filterFunction : null,
		label : "",
		align : "left",
		valign : "top",
		getField : function() {
			return this.field || this.label;
		},
		getType : function() {
			return this.dataType;
		}
	},
	initComponent : function() {
		Ext.apply(this, {
			autoScroll : true,
			emptyText : this.displayEmptyText || '(无记录)',
			defaultDateFormat : this.getAppContext().getDayMonthYearFormat()
		});
		divo.grid.SimpleGrid.superclass.initComponent.call(this);
		if (this.fieldDefinitions) {
			this.setFieldDefinitions(this.fieldDefinitions);
		}
	},
	afterRefresh : function() {
		var sortInfo = this.sortInfo;
		if (this.sortInfo && this.sortInfo.index != -1) {
			var head = this.view.getEl().child("thead");
			if (head) {
				var tr = head.child("tr", true);
			}
			if (tr && sortInfo.index < tr.cells.length) {
				var cell = tr.cells[sortInfo.index];
				cell.className = (sortInfo.direction == 0)
						? this.headerDownClass
						: this.headerUpClass;
			}
		}
	},
	setFieldDefinitions : function(meta) {
		this.sortInfo = {
			index : -1,
			direction : 0
		};
		this.fields = [];
		for (var i = 0; i < meta.length; i++) {
			var fld = Ext.applyIf(meta[i], this._meta);
			this.fields.push(fld);
		}
		this.createTemplate(this.fields);
	},
	createTemplate : function(meta) {
		var buf = "<table class=\"" + this.tableClass + "\">";
		buf += this.createHeader();
		buf += "<tbody><tpl for=\".\">";
		buf += "<tr class=\"j-grid-row {alt}\">";
		for (var i = 0; i < meta.length; i++) {
			var fld = meta[i];
			buf += "<td class=\"j-grid-col\">" + "{" + fld.field + "}"
					+ "</td>";
		}
		buf += "</tr>";
		buf += "</tpl></tbody></table>";
		this.template = new Ext.XTemplate(buf);
	},
	createHeader : function() {
		var tpl = new Ext.XTemplate("<thead><tr><tpl for=\".\">",
				"<td width=\"{width}\">{label}</td>", "</tpl></tr></thead>");
		return tpl.apply(this.fields);
	},
	prepareData : function(data, _26b, _26c) {
		var obj = {};
		var flds = this.fields;
		for (var i = 0; i < flds.length; i++) {
			var fld = flds[i];
			var fldDef = fld.field;
			var v = data[fldDef];
			obj[fldDef] = this.getFieldValue(fld, v, _26c);
		}
		if (_26b % 2 == 1) {
			obj["alt"] = (_26b % 2 == 1) ? "j-grid-row-alt" : "";
		}
		return obj;
	},
	getFieldValue : function(fld, v, _275) {
		var _v = v;
		if (fld.renderer) {
			_v = fld.renderer(v, null, _275);
		} else {
			switch (fld.dataType) {
				case "lookup" :
					if (!v) {
						_v = v;
					} else {
						if (typeof(v) == "object") {
							_v = v ? v.name : "";
						} else {
							if (fld.options) {
								var _277 = this.getLookup(fld.options, v);
								_v = _277 ? _277.name : "";
							}
						}
					}
					break;
				case "date" :
					_v = v ? v.format(fld.format
							|| this.defaultDateFormat) : "";
					break;
				case "action" :
					_v = this.createActionHtml(fld.actions);
					break;
				default :
					break;
			}
		}
		return _v;
	},
	getLookup : function(options, val) {
		var result = null;
		if (val) {
			for (var i = 0; i < options.length; i++) {
				var option = options[i];
				if (option.id == val) {
					result = option;
					break;
				}
			}
		}
		return result;
	},
	createActionHtml : function(actions) {
		var html = "";
		if (this.editable) {
			for (var j = 0; j < actions.length; j++) {
				var action = actions[j]
				if (action.hidden) continue
				
				if (j > 0) {
					html += "&nbsp;|&nbsp;"
				}
				var link = String.format(
					"<a href=\"javascript:void(0);\" title=\"{2}\" class=\"{0}\">{1}</a>",
					"j-action-" + action.name, action.display,action.tooltip)
				html += link
			}
		}
		return html;
	},
	sortDataStore : function() {
		var index = this.sortInfo.index;
		if (index >= 0) {
			var fld = this.fields[index];
			this.dataStore.sort(fld.field, this.sortInfo.direction == 0
					? "ASC"
					: "DESC");
		}
	},
	onSelectRow : function(view, rowAt, item, e) {
		var bodyEl = this.body;
		var record = this.dataStore.getAt(rowAt);
		var _cls = null;
		var row = e.getTarget("tr", bodyEl);
		var cell = e.getTarget("td", bodyEl);
		var link = e.getTarget("a", bodyEl);
		if (link != null) {
			var cls = link.className;
			if (cls.indexOf("j-action-") != -1) {
				_cls = cls.substr(9);
			}
		}
		this.onSelectItem(view, rowAt, record, e, _cls, cell.cellIndex);
	},
	onSort : function(view, e) {
		var headEl;
		if (!this.sortable || !(headEl = e.getTarget("thead"))) {
			return false;
		}
		var cell = e.getTarget("td", headEl);
		var cellIndex = cell.cellIndex;
		var fld = this.fields[cellIndex];
		if (!fld.sortable) {
			return false;
		}
		var row = e.getTarget("tr", headEl);
		var tdEl = row.getElementsByTagName("td");
		for (var i = 0; i < tdEl.length; i++) {
			tdEl[i].className = this.headerClass;
		}
		var sortInfo = this.sortInfo;
		if (cellIndex == sortInfo.index) {
			sortInfo.direction = (sortInfo.direction + 1) % 2;
		} else {
			sortInfo = {
				index : cellIndex,
				direction : 0
			};
		}
		cell.className = (sortInfo.direction == 0)
				? this.headerDownClass
				: this.headerUpClass;
		this.sortInfo = sortInfo;
		this.sortDataStore();
		return true;
	},
	//子类可以重写
	onSelectItem : Ext.emptyFn,
	//加载数据
	loadData : function(data) {
		if (!this.dataStore.proxy && !data) //是divo.data.ArrayStore
		    return
		
		if (this.dataStore.proxy && !this.dataStore.proxy.conn.url) //尚未定义url
		    return
		
		this.mask()
		if (data)
			this.dataStore.loadData(data)
		else
			this.dataStore.load()
	},
	mask : function() {
		this.el.mask('', 'x-mask-loading')
	},
	unmask : function() {
		this.el.unmask();
	},
	onRenderOther : Ext.emptyFn,
	onRender : function(ct, _2a2) {
		divo.grid.SimpleGrid.superclass.onRender.call(this, ct, _2a2);
		if (this.fields) {
			this.view = new Ext.DataView({
				emptyText : this.emptyText,
				tpl : this.template,
				store : this.dataStore,
				itemSelector : "tr.j-grid-row",
				selectedClass : this.selectedClass,
				prepareData : this.prepareData.createDelegate(this),
				listeners : {
					click : {
						fn : this.onSelectRow,
						scope : this
					},
					containerclick : {
						fn : this.onSort,
						scope : this
					},
					afterRefresh : {
						fn : this.afterRefresh,
						scope : this
					},
					loadexception : {
						fn : this.onLoadException,
						scope : this
					}					
				}
			});
			this.add(this.view);
			this.doLayout();
			this.view.store.on("datachanged", this.unmask, this);
			this.onRenderOther();
		}
	},
	onLoadException : function(loader, node, response) {
		divo.showError(response.responseText)
	},
	//public
	setUrl : function(url) {
		this.dataStore.proxy.conn.url = url
	},
	render : function() {
		divo.grid.SimpleGrid.superclass.render.apply(this, arguments)
		this.dataStore.on("load",this.onAfterLoad, this, true)
		this.showList()
	},
	onAfterLoad : Ext.emptyFn,  //子类需重写
	//public
	showList: function() {
		this.loadData()
	}
	
})
// EOP
;/**
 * 从EditorGridPanel扩展的简单网格类
 * 
 * @cfg {Object} gridConfig 可使用下列配置项:
 * 
 * {Boolean} footer 显示页脚（如果没有定义，则显示页脚；可定义值false, 不显示页脚）
 * {Boolean} filter 显示搜索框（如果没有定义，则不显示搜索框；可定义值true, 显示搜索框)
 * {Boolean} displayLoadMask 显示数据加载提示（如果没有定义，则显示加载提示；可定义值false,不显示加载提示）
 * {Array} toolbar 放置在工具条上的按钮
 * {Object/Array} plugins 插件对象
 * {String} groupField (分组视图用)分组字段名(如果未定义，则表示不需要分组）	
 * {Boolean} hideHeaders 显示网格列标题（如果没有定义，则表示显示；可定义值true, 不显示网格列标题）
 * {Boolean} singleSelect 只能单选(如果没有定义，则表示单选；可定义值false, 表示多选, 第1列会出现复选框)
 * {Boolean} enableDragDrop 是否允许拖动(默认为false,表示不允许)
 * {String} ddGroup 拖动时用的标识（默认为gridDD）
 * {Boolean} autoSelectRow 数据加载后自动选择行（默认为true,表示自动选择）
 * {Boolean} clearSelection 当autoSelectRow为false时有效，假表示不要清除选择（默认为真,表示会清除选择的行）
 * {Boolean} export2Excel 是否允许导出到Excel(默认为假，表示不允许导出） 
 * {String} emptyText 记录为空时显示的信息（默认为“没有找到记录”）
 * {Nubmer} pageSize 每页记录数，默认为20.
 * {Boolean} autoRefresher 是否显示自动刷新间隔时间选择框（默认为false,表示不显示）
 * {Boolean} simpleSearch 是否显示普通的下拉框进行搜索条件输入（默认为false）
 * {Boolean} viewForceFit 对应 viewConfig 中的 forceFit 配置项 （默认为false）
 * {Boolean} viewEnableRowBody 对应 viewConfig 中的 enableRowBody 配置项 （默认为false）
 * {String} autoExpandColumn 自动扩展的字段的Id（默认为未定义）
 * {String} filterTooltip 额外的搜索按钮的tooltip文字
 * {Boolean} showActiveBtn 真表示在底部显示按钮可以切换显示全部记录或隐藏非活动记录（默认为假）
 * 
 * --------------------------------------------------------------
 * 消息：
 * 选中了网格中的某行
 * 
 * 消息名：     			
 * divo.rowSelect<网格器件Id>    
 * 
 * 消息内容：
 * {String} sender 本器件的id值
 * {Number}	id 当前记录的id字段值
 * {String} name 当前记录的name字段值
 * {Object} record 当前记录对象(可直接访问所有字段值，如record.project_id)
 * --------------------------------------------------------------
 */
divo.grid.SmartSimpleGrid = Ext.extend(Ext.grid.EditorGridPanel, {
    fieldDefinitions : null,
	isLookup : false,  //同一个网格面板可以用于数据维护和字典查找,用于字典查找时设置为true
	menuItemId : null,
	gridConfig : {},
    initComponent : function() {
        this.allRecordsVisible = false
    	this.meta = this.createGridMeta()
    	
    	if (this.gridConfig.autoSelectRow==undefined)
    		this.autoSelectRow = true
    	else	
    	    this.autoSelectRow = this.gridConfig.autoSelectRow

        if (this.gridConfig.showActiveBtn==undefined)
            this.showActiveBtn = false
        else    
            this.showActiveBtn = this.gridConfig.showActiveBtn

    	if (this.gridConfig.simpleSearch==undefined)
    		this.simpleSearch = false
    	else	
    	    this.simpleSearch = this.gridConfig.simpleSearch

    	if (this.gridConfig.clearSelection==undefined)
    		this.clearSelection = true
    	else	
    	    this.clearSelection = this.gridConfig.clearSelection

    	if (this.gridConfig.viewForceFit==undefined)
    		this.viewForceFit = false
    	else	
    	    this.viewForceFit = this.gridConfig.viewForceFit

    	if (this.gridConfig.viewEnableRowBody==undefined)
    		this.viewEnableRowBody = false
    	else	
    	    this.viewEnableRowBody = this.gridConfig.viewEnableRowBody
    	    
    	this.lazyLoad = this.lazyLoad==undefined?false:this.lazyLoad
		if (!this.url)
		    this.lazyLoad = true
		    
		if (!this.gridConfig.groupField) {
			this.store = new Ext.data.Store( {
				proxy : new Ext.data.HttpProxy( {
					method : 'GET',
					url : this.url
				}),
				reader : new Ext.data.JsonReader( {
					root : 'rows',
					totalProperty : 'totalCount',
					id : 'id'
				}, this.meta.recordDef),
				remoteSort : true
			})
		} else {
			//分组网格
			this.store = new Ext.data.GroupingStore({
				proxy : new Ext.data.HttpProxy( {
					method : 'GET',
					url : this.url
				}),
				reader : new Ext.data.JsonReader( {
					root : 'rows',
					totalProperty : 'totalCount',
					id : 'id'
				}, this.meta.recordDef),
				remoteSort : true,	
				groupField : this.gridConfig.groupField,
				remoteGroup : true
			})
		}

		this.tbarItems = []
		if (this.gridConfig.toolbar) {
			this.tbarItems = this.gridConfig.toolbar;
		} else {
			if (!this.gridConfig.filter)
			    this.tbarItems = [];
		}
		this.pageSize = this.gridConfig.pageSize || 20
		if (this.gridConfig.footer==undefined || this.gridConfig.footer) 
			this.createGridFooter()
		else
			this.pageSize = 10000 // 避免分页
		
		if (this.gridConfig.filter) 
			this.createGridFilter()
		
		this.canMultiSelect = (this.gridConfig.singleSelect==false)
		
		if (this.canMultiSelect) {
		    this.selModel = new Ext.grid.CheckboxSelectionModel()
		    var cms = [this.selModel].concat(this.meta.cms)
		    var cm = new Ext.grid.ColumnModel(cms)
		} else {
			var cm = this.meta.columnModel
			this.selModel = new Ext.grid.RowSelectionModel({
				singleSelect : true
			})
		}
		if (this.gridConfig.groupField) {
			//分组网格视图
	        this.view = new Ext.grid.GroupingView({
	        	emptyText : this.gridConfig.emptyText ||  '没有找到记录',
	            groupTextTpl: '{text}',
            	showGroupName: false,
            	enableNoGroups:false,
            	enableGroupingMenu:false,
            	hideGroupedColumn:true
	        })
		} else {		
        	this.view = new Ext.grid.GridView({
	            forceFit:this.viewForceFit,
    	        enableRowBody:this.viewEnableRowBody,
				getRowClass : this.gridConfig.getRowClass,
        		emptyText : this.gridConfig.emptyText ||  '没有找到记录'
        	})
		}	
		var ptPlugints = []
		if (this.gridConfig.autoRefresher) {
			ptPlugints.push(new Ext.ux.grid.AutoRefresher({gridId:this.id}));
		}
		if (ptPlugints.length==0)
		    ptPlugints = undefined;
		    
		var gridPlugins = []    
		if (this.gridConfig.plugins)
		    gridPlugins = this.gridConfig.plugins
		
		Ext.apply(this,{
			region : this.region || 'center',
			stripeRows : true,
			cm : cm,
			hideHeaders : this.gridConfig.hideHeaders,
			loadMask : this.gridConfig.displayLoadMask==undefined || this.gridConfig.displayLoadMask?{
				msg : '',
				msgCls : 'x-mask-loading'
			}:false,
			bbar : this.gridConfig.footer==undefined || this.gridConfig.footer?new Ext.PagingToolbar({
				cls: 'go-paging-tb',
				plugins: ptPlugints,
				pageSize : this.pageSize,
				store : this.store,
				displayInfo : true,
				items : this.bbarItems
			}):null,
	        enableDragDrop:this.gridConfig.enableDragDrop==undefined?false:this.gridConfig.enableDragDrop,
		  	ddGroup:this.gridConfig.ddGroup || 'gridDD',
			plugins : gridPlugins,
			cls : this.gridConfig.cls,
			autoExpandColumn : this.gridConfig.autoExpandColumn
		})
		if (this.tbarItems.length>0)
			Ext.apply(this,{
				tbar: this.tbarItems
			})	

        divo.grid.SmartSimpleGrid.superclass.initComponent.call(this);
    },
	//创建网格元数据(子类可以重写，以插件方式添加新的列类型)
	createGridMeta : function() {
		return divo.getGridMeta(this,this.fieldDefinitions)
	},
	// private
	smartLoad : function() {
		if (this.lazyLoad) return
		
		this.loaded = true
		this.store.load( {
			params : {
				start : 0,
				limit : this.pageSize
			}
		})
	},
	// private
	smartReload : function() {
		if (this.lazyLoad) return
		
		if (!this.loaded)
		    this.smartLoad()
		else
		    this.store.reload()
	},
	// private
	createGridFooter : function() {
		this.bbarItems = [];

		if (this.gridConfig.export2Excel) {
			this.bbarItems.push('-')
			this.export2ExcelBtn = new Ext.Toolbar.Button( {
				text : '<span>导出&nbsp;&nbsp;</span>',
				icon : divo.iconUrl + "excel.gif",
				cls : 'x-btn-text-icon',
				tooltip : '导出网格内容到Excel',
				handler : this.onExport2Excel.createDelegate(this)
			});
			this.bbarItems.push(this.export2ExcelBtn);
		}
		
		this.createOtherFooterBtn()
	},
	//模板方法
	createOtherFooterBtn : function() {
        if (this.gridConfig.showActiveBtn)
    		this.createActiveFooterBtn()
	},
	//子类可重写
    createActiveFooterBtn : function() {
        this.bbarItems.push('-')
        this.bbarItems.push({
            text : '<span>显示全部记录</span>',
            icon : divo.iconUrl + "pages.gif",
            cls : 'x-btn-text-icon',
            tooltip : '隐藏非活动的记录或显示全部记录',
            enableToggle: true,
            toggleHandler: this.onShowAllRecords.createDelegate(this),
            pressed: false
        })
    },
    onShowAllRecords : function(item, pressed) {
        this.allRecordsVisible = pressed
        this.onRefreshList()
    },
	// private
	onExport2Excel : function() {
		if (!this.url) return
		
		var fieldList,sort='',dir=''
		var cm = this.getColumnModel()
		var ds = this.getStore()

		var sortState = ds.getSortState()
	    if (typeof(sortState) == "object") {
		    if (("field" in sortState) && ("direction" in sortState)) {
		    	sort = sortState.field
		    	dir = sortState.direction
		    }
	    }
	    var fldNames = [],fldHeaders = []
	    for (var i = 0; i < cm.config.length; i++) {
	    	 if (!cm.config[i].hidden) {
				 fldNames.push(cm.config[i].dataIndex)
				 fldHeaders.push(cm.config[i].header)
	    	 } 
		}
 		document.GridExportForm.action = this.url+'/xls';
		document.GridExportForm.auth.value = Ext.Ajax.defaultHeaders.Authorization
		document.GridExportForm.fieldHeaders.value = fldHeaders.join('-')
		document.GridExportForm.fieldNames.value =  fldNames.join('-')
		document.GridExportForm.sort.value = sort.length==0?'':sort
		document.GridExportForm.dir.value = dir;
		if (this.gridConfig.filter) {
			document.GridExportForm.filterValue.value = this.filterCombo?this.filterCombo.getValue():''
			document.GridExportForm.filterField.value = this.getFilterField()
		}	
		if (this.store.baseParams) {
			var firstParam = true
			for (var obj in this.store.baseParams) {
				if ('filterValue,filterField,dir,sort,fieldNames,fieldHeaders,auth,'.indexOf(obj)<0) {
				    v = this.store.baseParams[obj]
				    c = firstParam?"?":"&"
			    	document.GridExportForm.action += c+obj+"="+v
				    firstParam = false	
				}    
			}
		}		
		document.GridExportForm.submit()
	},
	afterRender : function() {
        divo.grid.SmartSimpleGrid.superclass.afterRender.apply(this,arguments)
		
		this.store.on('beforeload', function() {
			if (this.gridConfig.filter) {
				this.store.baseParams.filterValue =	this.filterCombo?this.filterCombo.getValue():'';
				this.store.baseParams.filterField = this.getFilterField();
			}	
		}, this, true)
        
		this.store.on("loadexception", function(o,options,response,e) {
			 if (response.responseText)
			 	divo.showError(response.responseText,'数据加载失败')
		}, this, true)
		
		this.selModel.on('rowselect', this.onGridRowSelect, this)
		this.on('dblclick', this.onSelect, this)	
		this.store.on("load", this.onGridLoad, this)
		this.store.on('beforeload', this.onBeforeLoad, this)

		var el = Ext.get('grid-export-form')
		if (!el) {
			// 导出到Excel表单
			var html2 = [
					'<div id="grid-export-form" class="x-hidden">',
					'    <form method="POST" name="GridExportForm">',
					'         <input type="hidden" name="auth"/>',
					'         <input type="hidden" name="fieldNames"/>',
					'         <input type="hidden" name="fieldHeaders"/>',
					'         <input type="hidden" name="viewCode"/>',
					'         <input type="hidden" name="sort"/>',
					'         <input type="hidden" name="dir"/>',
					'         <input type="hidden" name="filterValue"/>',
					'         <input type="hidden" name="filterField"/>',
					'    </form>',
					'</div>	'].join('');
			Ext.DomHelper.append(document.body, {
				html : html2
			})
		}
		
		this.smartLoad()
	},
	// private
	createGridFilter : function() {
		this.createOtherBtn()
		
		if (!this.isLookup)
			this.tbarItems.push("->")

		var l = this.meta.fs.length;
		if (!this.meta.fs || l == 0) {
			if (!this.simpleSearch)
				this.tbarItems.push({text:"搜索:&nbsp;&nbsp;"});
			else		
				this.tbarItems.push({text:"输入搜索关键字然后按回车键:&nbsp;&nbsp;"});
		} else {
			var menus = [{
				text : '搜索:',
				handler : this.onFilterClick.createDelegate(this)
			}];
			for (var i = 0;i < l; i++) {
				menus.push( {
					text : this.meta.fs[i].text,
					handler : this.onFilterClick.createDelegate(this)
				});
			}
			this.filterBtn = new Ext.Toolbar.MenuButton( {
				text : '搜索:',
				enableToggle : false,
				menu : {
					items : menus
				}
			});
			this.tbarItems.push(this.filterBtn);
		}

		// Create the filter field
		var searchConfig =  {
			selectOnFocus : true,
			emptyText : ' ',
			resizable : true,
			hideClearButton : false,
			hideTrigger : false,
			typeAhead : true,
			width:150,
			triggerAction : 'all'
		}
		if (this.simpleSearch)
			this.filterCombo = new Ext.form.ComboBox(searchConfig)
		else	
			this.filterCombo = new Ext.ux.form.HistoryClearableComboBox(searchConfig);
		this.tbarItems.push(this.filterCombo);

		// press enter keyboard
		this.filterCombo.on('specialkey', this.onSearchKeyPress.createDelegate(this));
		this.filterCombo.on('clearvalue', this.onSearch.createDelegate(this));
		this.filterCombo.on('select', this.onSearch.createDelegate(this));

		if (!this.simpleSearch)
		    var text = this.gridConfig.filterTooltip?":"+this.gridConfig.filterTooltip:""
			this.tbarItems.push( {
				icon : divo.iconSearch,
				cls : 'x-btn-icon',
				tooltip : '开始搜索(或按回车键)'+text,
				tooltipType : 'title',
				handler : this.onSearch.createDelegate(this)
			})
	},
	createOtherBtn : Ext.emptyFn,
	// private
	getFilterField : function() {
		if (this.filterBtn) {
			var fld = this.filterBtn.getText();
			var l = this.meta.fs.length;
			for (var i = 0;i < l; i++) {
				if (fld === this.meta.fs[i].text)
					return this.meta.fs[i].name;
			}
		}
		return '';
	},
	// private
	onFilterClick : function(item) {
		this.filterBtn.setText(item.text);

		if (this.filterCombo.getValue())
			this.smartLoad();
	},
	// private
	onSearchKeyPress : function(o, e) {
		if (e.getKey() === e.ENTER) {
			this.smartLoad();
		}
	},
	//private
	onSearch : function() {
		this.smartLoad();
	},
	//private
	onGridRowSelect : function (grid, rowIndex, e) {
		var record = this.selModel.getSelections()[0]
		this.cRowIndex = rowIndex
		this.cRecordData = record.data
		if (this.cIdFocus)
		   this.cId = this.cIdFocus
		else
		   this.cId = this.cRecordData.id
		   
		this.cIdFocus = null
		this.cName = this.cRecordData.name

		this.notifyRowChange(record)
	},
	//private
	notifyRowChange : function(record) {
		this.publish("divo.rowSelect"+this.id,{
			sender:this.id,
			id:this.cId,
			name:this.cName,
			record:record?record.data:null})
	},
	//private
	onGridLoad : function(store, records, options) {
		var f = function() {
			if (this.store.getTotalCount() == 0) {
				this.cId = null
				this.cName = null
				this.notifyRowChange()
			} else {
				if (this.cIdFocus)
				    this.cId = this.cIdFocus
				
				if (this.autoSelectRow) {    
					if (this.cId ) {
						var i = this.store.indexOfId(this.cId)
						if (i>=0) {
							this.getView().focusRow(i)
							this.selModel.selectRow(i)
						} else {
							this.selModel.selectFirstRow()
						}
					} else {
						this.selModel.selectFirstRow()
					}
				} else {
					if (this.clearSelection) {
						this.selModel.clearSelections()
						this.cId = null
						this.cIdFocus = null
						this.cName = null
						this.notifyRowChange() 
					}
				}
			}
			this.onAfterLoad(store, records, options)
		}
		if (!this.canMultiSelect) 
			f.defer(1000,this) 
	},
	//子类可重写
	onAfterLoad : Ext.emptyFn,
	//public
	loadList : function() {
		this.smartReload()
	},
	//public
	setUrl : function(url) {
		this.cId = null
		this.cName = null

		this.url = url
		this.lazyLoad = false
		this.store.proxy.conn.url = url
	},
	/**
	 * LovField所需接口
	 */
	//public
	onSelect : function(e) {
		this.onSmartDblClick()
	},
	//模板方法,子类实现
	onSmartDblClick : Ext.emptyFn,
	//模板方法,子类可重写
    onBeforeLoad : function(store,options) {
        if(this.showActiveBtn)    	
            store.baseParams.allRecordsVisible = this.allRecordsVisible?1:0
    },
	//public
	checkSelection : function(msg) {
		if (!this.cId) {
			this.say(msg || "请先选择某条记录")
			return false
		}
		return true
	},
	//public
	deleteItem : function() {
		if (!this.cId) {
			this.say("请先选择要删除的记录")
			return
		}
		if (!this.onBeforeDeleteItem())
		    return
		Ext.MessageBox.confirm("确认", "要删除吗?", this.deleteItemConfirm.createDelegate(this))
	},
	//模板方法，可被子类重写
	onBeforeDeleteItem : function() {
		return true
	},
	//private
	deleteItemConfirm : function(btn) {
		if (btn == "yes") {
			this.onDeleteItem(this.cId)
		}
	},
	//模板方法，可被子类重写
	getDeleteUrl : function(id) {
		return this.url + '/' + id
	},
	//private
	onDeleteItem : function(id) {
		Ext.Ajax.request({
			scope : this,
			url : this.getDeleteUrl(id),
			method : 'DELETE',
			success : function(response, options) {
				var resp = Ext.decode(response.responseText)
				if (resp.success) {
					this.deleteItemCallback()
					this.onAfterDeleteItem()
				} else {
					this.say(resp.errors.reason)
				}	
			},
			failure : function(response, options) {
				this.alert(response.responseText)
			}
		})
	},
	//子类可重写
	onAfterDeleteItem : Ext.emptyFn,
	//private
	deleteItemCallback : function() {
		this.cId = null
		this.cName = null
		this.loadList()
	},
	rowNumberRender : function(value, p, record) {
		var ds = record.store
		var i = ds.lastOptions.params.start
		if (isNaN(i)) {
			i = 0;
		}
		return ds.indexOf(record)+i+1
	},
	//倒序
	rowNumberDescRender : function(value, p, record) {
		var ds = record.store
		var cc = ds.getTotalCount()
		var i = ds.lastOptions.params.start
		if (isNaN(i)) {
			i = cc;
		}
		return cc-ds.indexOf(record)-i
	},
	addedOnRender : function(value, p, record) {
		if (!value) return ""
		return value.substr(0,10)
	},
	lineBreakRender : function(value, p, record) {
		return value.replace(/\n/g, "<br/>")
	},
    wordWrapRender : function(value,metadata,record,rowIndex,colIndex){
    	if (!this.getColumnModel().config[colIndex].width)
    	    return value
    	if (!value) return ""
		v = value.replace(/\s*(.*?)\s*(\r\n)\s*/mg,"$1$2"); //去掉前后和末尾的回车
    	
		var begin = 0
		var finalText = ''
		var hzLen = v.getHzLength()
		var columnWidth = this.getColumnModel().getColumnWidth(colIndex)
		columnWidth /= 7.8
		if(hzLen > columnWidth){
			return v.brkLine(columnWidth).replace(/\n/g, "<br/>")
		}else{
			return v.replace(/\n/g, "<br/>")
		}
	},
	moneyRender : function(value, cell, rec, rowIndex, colIndex, ds) {
	  return divo.money(value)
	}, 
    amountRender : function(value) {
      return divo.amount(value)
    }, 
    priceRender : function(value) {
      return divo.amount(value)
    }, 
	booleanRender : function(value, cell, rec, rowIndex, colIndex, ds) {
	  return [
	    '<img ',
	      'class="checkbox" ', 
	      'src="/media/images/divo/',
	      value? 'checked2.gif' : 'unchecked2.gif',
	    '"/>'
	  ].join("");
	},
    cellTooltipRender : function(value,metadata) {
        metadata.attr = ' ext:qtip="' + value + '"';
        return value;
    },
	addedOnTextRender : function(value, p, record) {
		return divo.getTimeText(value)
	},
	//可用来接收处理需要刷新网格的pagebus消息(当前行位置不变）
	//public
	onRefreshList : function() {
		this.cIdFocus = this.cId
		this.loadList()
	},
	onRefreshNextList : function(subj, msg, data) {
		var i = this.store.indexOfId(this.cId)
		if(i<this.store.getCount()-1) {
			this.cIdFocus = this.store.getAt(i+1).data.id
			this.loadList()
		}
	},
	//可用来接收处理新建或修改结束后需要刷新网格的pagebus消息(当前行设置为新建或修改的记录）
	//public
	onChangeList : function(subj, msg, data) {
		this.cIdFocus = msg.id
		this.loadList()
	},
	//public
	getTotalCount : function() {
		return this.store.getTotalCount()
	},	
    totalSumRoundTo0Render : function(v, params, data) {
        return Math.round(v)
    },
    totalSumRoundTo2Render : function(v, params, data) {
        return Math.round(v*100)/100.00
    },
    totalSumRoundTo0MoneyRender : function(v, params, data) {
        return divo.money(Math.round(v))
    },
    totalSumRoundTo2MoneyRender : function(v, params, data) {
        return divo.money(Math.round(v*100)/100.00)
    },
    totalSumRoundToAmountRender : function(v, params, data) {
        return divo.amount(v)
    },
    totalRender : function(v, params, data) {
        return '合计：'
    }

})

Ext.reg('divo.grid.SmartSimpleGrid',divo.grid.SmartSimpleGrid )
//EOP
;/**
 * RowActions plugin for Ext grid
 *
 * Contains renderer for icons and fires events when an icon is clicked
 *
 * @author    Ing. Jozef Sakáloš
 * @date      22. March 2008
 * @version   $Id: Ext.ux.grid.RowActions.js 150 2008-04-08 21:50:58Z jozo $
 *
 * @license Ext.ux.grid.RowActions is licensed under the terms of
 * the Open Source LGPL 3.0 license.  Commercial use is permitted to the extent
 * that the code/component(s) do NOT become part of another Open Source or Commercially
 * licensed development library or toolkit without explicit permission.
 * 
 * License details: http://www.gnu.org/licenses/lgpl.html
 */

/*global Ext */

Ext.ns('Ext.ux.grid');

/**
 * @class Ext.ux.grid.RowActions
 * @extends Ext.util.Observable
 *
 * CSS rules from Ext.ux.RowActions.css are mandatory
 *
 * Important general information: Actions are identified by iconCls. Wherever an <i>action</i>
 * is referenced (event argument, callback argument), the iconCls of clicked icon is used.
 * In another words, action identifier === iconCls.
 *
 * Creates new RowActions plugin
 * @constructor
 * @param {Object} config The config object
 */
Ext.ux.grid.RowActions = function(config) {
	Ext.apply(this, config);

	// {{{
	this.addEvents(
		/**
		 * @event beforeaction
		 * Fires before action event. Return false to cancel the subsequent action event.
		 * @param {Ext.grid.GridPanel} grid
		 * @param {Ext.data.Record} record Record corresponding to row clicked
		 * @param {String} action Identifies the action icon clicked. Equals to icon css class name.
		 * @param {Integer} rowIndex Index of clicked grid row
		 * @param {Integer} colIndex Index of clicked grid column that contains all action icons
		 */
		 'beforeaction'
		/**
		 * @event action
		 * Fires when icon is clicked
		 * @param {Ext.grid.GridPanel} grid
		 * @param {Ext.data.Record} record Record corresponding to row clicked
		 * @param {String} action Identifies the action icon clicked. Equals to icon css class name.
		 * @param {Integer} rowIndex Index of clicked grid row
		 * @param {Integer} colIndex Index of clicked grid column that contains all action icons
		 */
		,'action'
		/**
		 * @event beforegroupaction
		 * Fires before group action event. Return false to cancel the subsequent groupaction event.
		 * @param {Ext.grid.GridPanel} grid
		 * @param {Array} records Array of records in this group
		 * @param {String} action Identifies the action icon clicked. Equals to icon css class name.
		 * @param {String} groupId Identifies the group clicked
		 */
		,'beforegroupaction'
		/**
		 * @event groupaction
		 * Fires when icon in a group header is clicked
		 * @param {Ext.grid.GridPanel} grid
		 * @param {Array} records Array of records in this group
		 * @param {String} action Identifies the action icon clicked. Equals to icon css class name.
		 * @param {String} groupId Identifies the group clicked
		 */
		,'groupaction'
	);
	// }}}

	// call parent
	Ext.ux.grid.RowActions.superclass.constructor.call(this);
};

Ext.extend(Ext.ux.grid.RowActions, Ext.util.Observable, {

	// configuration options
	// {{{
	/**
	 * @cfg {Array} actions Mandatory. Array of action configuration objects. The following
	 * configuration options of action are recognized:
	 *
	 * - @cfg {Function} callback Optional. Function to call if the action icon is clicked.
	 *   This function is called with same signature as action event and in its original scope.
	 *   If you need to call it in different scope or with another signature use 
	 *   createCallback or createDelegate functions. Works for statically defined actions. Use
	 *   callbacks configuration options for store bound actions.
	 *
	 * - @cfg {Function} cb Shortcut for callback.
	 *
	 * - @cfg {String} iconIndex Optional, however either iconIndex or iconCls must be
	 *   configured. Field name of the field of the grid store record that contains
	 *   css class of the icon to show. If configured, shown icons can vary depending
	 *   of the value of this field.
	 *
	 * - @cfg {String} iconCls. css class of the icon to show. It is ignored if iconIndex is
	 *   configured. Use this if you want static icons that are not base on the values in the record.
	 *
	 * - @cfg {Boolean} hide Optional. True to hide this action while still have a space in 
	 *   the grid column allocated to it. IMO, it doesn't make too much sense, use hideIndex instead.
	 *
	 * - @cfg (string} hideIndex Optional. Field name of the field of the grid store record that
	 *   contains hide flag (falsie [null, '', 0, false, undefined] to show, anything else to hide).
	 *
	 * - @cfg {String} qtipIndex Optional. Field name of the field of the grid store record that 
	 *   contains tooltip text. If configured, the tooltip texts are taken from the store.
	 *
	 * - @cfg {String} tooltip Optional. Tooltip text to use as icon tooltip. It is ignored if 
	 *   qtipIndex is configured. Use this if you want static tooltips that are not taken from the store.
	 *
	 * - @cfg {String} qtip Synonym for tooltip
	 *
	 * - @cfg {String} textIndex Optional. Field name of the field of the grids store record
	 *   that contains text to display on the right side of the icon. If configured, the text
	 *   shown is taken from record.
	 *
	 * - @cfg {String} text Optional. Text to display on the right side of the icon. Use this
	 *   if you want static text that are not taken from record. Ignored if textIndex is set.
	 *
	 * - @cfg {String} style Optional. Style to apply to action icon container.
	 */

	/**
	 * @cfg {String} actionEvnet Event to trigger actions, e.g. click, dblclick, mouseover (defaults to 'click')
	 */
	 actionEvent:'click'

	/**
	 * @cfg {Boolean} autoWidth true to calculate field width for iconic actions only.
	 */
	,autoWidth:true

	/**
	 * @cfg {Array} groupActions Array of action to use for group headers of grouping grids.
	 * These actions support static icons, texts and tooltips same way as actions. There is one
	 * more action config recognized:
	 * - @cfg {String} align Set it to 'left' to place action icon next to the group header text.
	 *   (defaults to undefined = icons are placed at the right side of the group header.
	 */

	/**
	 * @cfg {Object} callbacks iconCls keyed object that contains callback functions. For example:
	 * callbacks:{
	 *      'icon-open':function(...) {...}
	 *     ,'icon-save':function(...) {...}
	 * }
	 */

	/**
	 * @cfg {String} header Actions column header
	 */
	,header:''

	/**
	 * @cfg {Boolean} menuDisabled No sense to display header menu for this column
	 */
	,menuDisabled:true

	/**
	 * @cfg {Boolean} sortable Usually it has no sense to sort by this column
	 */
	,sortable:false

	/**
	 * @cfg {String} tplGroup Template for group actions
	 * @private
	 */
	,tplGroup:
		 '<tpl for="actions">'
		+'<div class="ux-grow-action-item<tpl if="\'right\'===align"> ux-action-right</tpl> '
		+'{cls}" style="{style}" qtip="{qtip}">{text}</div>'
		+'</tpl>'

	/**
	 * @cfg {String} tplRow Template for row actions
	 * @private
	 */
	,tplRow:
		 '<div class="ux-row-action">'
		+'<tpl for="actions">'
		+'<div class="ux-row-action-item {cls} <tpl if="text">'
		+'ux-row-action-text</tpl>" style="{hide}{style}" qtip="{qtip}">'
		+'<tpl if="text"><span qtip="{qtip}">{text}</span></tpl></div>'
		+'</tpl>'
		+'</div>'

	/**
	 * @private {Number} widthIntercept constant used for auto-width calculation
	 */
	,widthIntercept:4

	/**
	 * @private {Number} widthSlope constant used for auto-width calculation
	 */
	,widthSlope:21
	// }}}

	// methods
	// {{{
	/**
	 * Init function
	 * @param {Ext.grid.GridPanel} grid Grid this plugin is in
	 */
	,init:function(grid) {
		this.grid = grid;
		
		// {{{
		// setup template
		if(!this.tpl) {
			this.tpl = this.processActions(this.actions);

		} // eo template setup
		// }}}

		// calculate width
		if(this.autoWidth) {
			this.width =  this.widthSlope * this.actions.length + this.widthIntercept;
			this.fixed = true;
		}

		// body click handler
		var view = grid.getView();
		var cfg = {scope:this};
		cfg[this.actionEvent] = this.onClick;
		grid.on({
			render:{scope:this, fn:function() {
				view.mainBody.on(cfg);
			}}
		});

		// setup renderer
		if(!this.renderer) {
			this.renderer = function(value, cell, record, row, col, store) {
				cell.css += (cell.css ? ' ' : '') + 'ux-row-action-cell';
				return this.tpl.apply(this.getData(value, cell, record, row, col, store));
			}.createDelegate(this);
		}

		// actions in grouping grids support
		if(view.groupTextTpl && this.groupActions) {
			view.interceptMouse = view.interceptMouse.createInterceptor(function(e) {
				if(e.getTarget('.ux-grow-action-item')) {
					return false;
				}
			});
			view.groupTextTpl = 
				 '<div class="ux-grow-action-text">' + view.groupTextTpl +'</div>' 
				+this.processActions(this.groupActions, this.tplGroup).apply()
			;
		}
		
	} // eo function init
	// }}}
	// {{{
	/**
	 * Returns data to apply to template. Override this if needed.
	 * @param {Mixed} value 
	 * @param {Object} cell object to set some attributes of the grid cell
	 * @param {Ext.data.Record} record from which the data is extracted
	 * @param {Number} row row index
	 * @param {Number} col col index
	 * @param {Ext.data.Store} store object from which the record is extracted
	 * @returns {Object} data to apply to template
	 */
	,getData:function(value, cell, record, row, col, store) {
		return record.data || {};
	} // eo function getData
	// }}}
	// {{{
	/**
	 * Processes actions configs and returns template.
	 * @param {Array} actions
	 * @param {String} template Optional. Template to use for one action item.
	 * @return {String}
	 * @private
	 */
	,processActions:function(actions, template) {
		var acts = [];

		// actions loop
		Ext.each(actions, function(a, i) {
			// save callback
			if(a.iconCls && 'function' === typeof (a.callback || a.cb)) {
				this.callbacks = this.callbacks || {};
				this.callbacks[a.iconCls] = a.callback || a.cb;
			}

			// data for intermediate template
			var o = {
				 cls:a.iconIndex ? '{' + a.iconIndex + '}' : (a.iconCls ? a.iconCls : '')
				,qtip:a.qtipIndex ? '{' + a.qtipIndex + '}' : (a.tooltip || a.qtip ? a.tooltip || a.qtip : '')
				,text:a.textIndex ? '{' + a.textIndex + '}' : (a.text ? a.text : '')
				,hide:a.hideIndex ? '<tpl if="' + a.hideIndex + '">visibility:hidden;</tpl>' : (a.hide ? 'visibility:hidden;' : '')
				,align:a.align || 'right'
				,style:a.style ? a.style : ''
			};
			acts.push(o);

		}, this); // eo actions loop

		var xt = new Ext.XTemplate(template || this.tplRow);
		return new Ext.XTemplate(xt.apply({actions:acts}));

	} // eo function processActions
	// }}}
	// {{{
	/**
	 * Grid body actionEvent event handler
	 * @private
	 */
	,onClick:function(e, target) {

		var view = this.grid.getView();
		var action = false;

		// handle row action click
		var row = e.getTarget('.x-grid3-row');
		var col = view.findCellIndex(target.parentNode.parentNode);

		var t = e.getTarget('.ux-row-action-item');
		if(t) {
			action = t.className.replace(/ux-row-action-item /, '');
			if(action) {
				action = action.replace(/ ux-row-action-text/, '');
				action = action.trim();
			}
		}
		if(false !== row && false !== col && false !== action) {
			var record = this.grid.store.getAt(row.rowIndex);

			// call callback if any
			if(this.callbacks && 'function' === typeof this.callbacks[action]) {
				this.callbacks[action](this.grid, record, action, row.rowIndex, col);
			}

			// fire events
			if(true !== this.eventsSuspended && false === this.fireEvent('beforeaction', this.grid, record, action, row.rowIndex, col)) {
				return;
			}
			else if(true !== this.eventsSuspended) {
				this.fireEvent('action', this.grid, record, action, row.rowIndex, col);
			}

		}

		// handle group action click
		t = e.getTarget('.ux-grow-action-item');
		if(t) {
			// get groupId
			var group = view.findGroup(target);
			var groupId = group ? group.id.replace(/ext-gen[0-9]+-gp-/, '') : null;

			// get matching records
			var records;
			if(groupId) {
				var re = new RegExp(groupId);
				records = this.grid.store.queryBy(function(r) {
					return r._groupId.match(re);
				});
				records = records ? records.items : [];
			}
			action = t.className.replace(/ux-grow-action-item (ux-action-right )*/, '');

			// call callback if any
			if('function' === typeof this.callbacks[action]) {
				this.callbacks[action](this.grid, records, action, groupId);
			}

			// fire events
			if(true !== this.eventsSuspended && false === this.fireEvent('beforegroupaction', this.grid, records, action, groupId)) {
				return false;
			}
			this.fireEvent('groupaction', this.grid, records, action, groupId);
		}
	} // eo function onClick
	// }}}

});

// registre xtype
Ext.reg('rowactions', Ext.ux.grid.RowActions);

// eof
;/**
 * Ext.ux.grid.ProgressColumn - Ext.ux.grid.ProgressColumn is a grid plugin that
 * shows a progress bar for a number between 0 and 100 to indicate some sort of
 * progress. The plugin supports all the normal cell/column operations including
 * sorting, editing, dragging, and hiding. It also supports special progression
 * coloring or standard Ext.ProgressBar coloring for the bar.
 *
 * @author Benjamin Runnels <kraven@kraven.org>
 * @copyright (c) 2008, by Benjamin Runnels
 * @date 06 June 2008
 * @version 1.1
 *
 * @license Ext.ux.grid.ProgressColumn is licensed under the terms of the Open
 *          Source LGPL 3.0 license. Commercial use is permitted to the extent
 *          that the code/component(s) do NOT become part of another Open Source
 *          or Commercially licensed development library or toolkit without
 *          explicit permission.
 *
 * License details: http://www.gnu.org/licenses/lgpl.html
 */

Ext.namespace('Ext.ux.grid');

Ext.ux.grid.ProgressColumn = function(config) {
  Ext.apply(this, config);
  this.renderer = this.renderer.createDelegate(this);
  this.addEvents('action');
  Ext.ux.grid.ProgressColumn.superclass.constructor.call(this);
};

Ext.extend(Ext.ux.grid.ProgressColumn, Ext.util.Observable, {
  /**
   * @cfg {String} colored determines whether use special progression coloring
   *      or the standard Ext.ProgressBar coloring for the bar (defaults to
   *      false)
   */
  textPst : '%',
  /**
   * @cfg {String} colored determines whether use special progression coloring
   *      or the standard Ext.ProgressBar coloring for the bar (defaults to
   *      false)
   */
  colored : false,
  /**
   * @cfg {String} actionEvent Event to trigger actions, e.g. click, dblclick,
   *      mouseover (defaults to 'dblclick')
   */
  actionEvent : 'dblclick',

  init : function(grid) {
    this.grid = grid;
    this.view = grid.getView();

    if (this.editor && grid.isEditor) {
      var cfg = {
        scope : this
      };
      cfg[this.actionEvent] = this.onClick;
      grid.afterRender = grid.afterRender.createSequence(function() {
        this.view.mainBody.on(cfg);
      }, this);
    }
  },

  onClick : function(e, target) {
    var rowIndex = e.getTarget('.x-grid3-row').rowIndex;
    var colIndex = this.view.findCellIndex(target.parentNode.parentNode);

    var t = e.getTarget('.x-progress-text');
    if (t) {
      this.grid.startEditing(rowIndex, colIndex);
    }
  },

  renderer : function(v, p, record) {
    var style = '';
    var textClass = (v < 55) ? 'x-progress-text-back' : 'x-progress-text-front' + (Ext.isIE6 ? '-ie6' : '');

    //ugly hack to deal with IE6 issue
    var text = String.format('</div><div class="x-progress-text {0}" style="width:100%;" id="{1}">{2}</div></div>',
      textClass, Ext.id(), v + this.textPst
    );
    text = (v<96) ? text.substring(0, text.length - 6) : text.substr(6);

    if (this.colored == true) {
      if (v <= 100 && v > 66)
        style = '-green';
      if (v < 67 && v > 33)
        style = '-orange';
      if (v < 34)
        style = '-red';
    }

    p.css += ' x-grid3-progresscol';
    return String.format(
      '<div class="x-progress-wrap"><div class="x-progress-inner"><div class="x-progress-bar{0}" style="width:{1}%;">{2}</div>' +
      '</div>', style, v, text
    );
  }
});;/*
 * Ext.ux.grid.AutoRefresher
 * 
 * Refresh a grid every x minutes
 */
Ext.ux.grid.AutoRefresher = function(config) {
	Ext.apply(this, config);
};
Ext.extend(Ext.ux.grid.AutoRefresher, Ext.util.Observable, {
	/**
	 * @cfg {Array} intervals
	 * List of refresh intervals (as minutes) to populate the comboBox with
	 */
	intervals : [[1], [5], [10], [15], [30], [60]],
	/**
	 * @cfg {integer} interval
	 * default value
	 */
	interval : 1,
	/**
	 * @cfg {String} beforeText
	 * Text to display before the comboBox
	 */
	beforeText : '刷新间隔',
	/**
	 * @cfg {String} afterText
	 * Text to display after the comboBox
	 */
	afterText : '分钟',
	/**
	 * @cfg {Mixed} addBefore
	 * Toolbar item(s) to add before the PageSizer
	 */
	addBefore : '-',
	/**
	 * @cfg {Mixed} addAfter
	 * Toolbar item(s) to be added after the PageSizer
	 */
	addAfter : null,
	init : function(Toolbar) {
		this.Toolbar = Toolbar;
		if (Toolbar.store) {
			this.store = Toolbar.store
		}
		Toolbar.on("render", this.onRender, this);

		this.store.startAutoRefresh = function(interval) {
			if (this.autoRefreshProcId) {
				clearInterval(this.autoRefreshProcId);
			}
			this.autoRefreshProcId = setInterval(this.reload
							.createDelegate(this, [{}]), interval * 1000);
		}
		this.store.stopAutoRefresh = function() {
			if (this.autoRefreshProcId) {
				clearInterval(this.autoRefreshProcId);
			}
		}
	},
	update : function(c) {
		var value = c.getValue();
		if (value > 0) {
			this.store.startAutoRefresh(value * 60);
		} else {
			this.store.stopAutoRefresh();
		}
	},
	onRender : function() {
		// this.intervals.unshift(['']); //add a 'never' value
		var config = {
			maskRe : /^d*$/,
			store : new Ext.data.SimpleStore({
						fields : ['autoRefresh'],
						data : this.intervals
					}),
			displayField : 'autoRefresh',
			typeAhead : true,
			mode : 'local',
			triggerAction : 'all',
			selectOnFocus : true,
			width : 50
		};
		Ext.apply(config, this.comboCfg)
		var combo = new Ext.form.ComboBox(config);
		combo.on("change", this.update, this);
		combo.on("select", this.update, this);
		if (this.addBefore) {
			this.Toolbar.add(this.addBefore)
		};
		this.Toolbar.add(this.beforeText, combo, this.afterText);
		if (this.addAfter) {
			this.Toolbar.add(this.addAfter)
		};
		combo.getEl().on('keydown', function(e) {
					var key = e.getKey();
					switch (key) {
						case Ext.EventObject.ENTER :
							this.update(combo);
					}
				}, this);
		combo.setValue(this.interval);
		if (this.interval > 0) {
			this.store.startAutoRefresh(this.interval * 60);
		} else {
			this.store.stopAutoRefresh();
		}
	}

});
//EOP
;Ext.ns('Ext.ux.grid');

Ext.ux.grid.GridSummary = function(config) {
        Ext.apply(this, config);
};

Ext.extend(Ext.ux.grid.GridSummary, Ext.util.Observable, {
    init : function(grid) {
        this.grid = grid;
        this.cm = grid.getColumnModel();
        this.view = grid.getView();

        var v = this.view;

        // override GridView's onLayout() method
        v.onLayout = this.onLayout;

        v.afterMethod('render', this.refreshSummary, this);
        v.afterMethod('refresh', this.refreshSummary, this);
        v.afterMethod('syncScroll', this.syncSummaryScroll, this);
        v.afterMethod('onColumnWidthUpdated', this.doWidth, this);
        v.afterMethod('onAllColumnWidthsUpdated', this.doAllWidths, this);
        v.afterMethod('onColumnHiddenUpdated', this.doHidden, this);

        // update summary row on store's add/remove/clear/update events
        grid.store.on({
            add: this.refreshSummary,
            remove: this.refreshSummary,
            clear: this.refreshSummary,
            update: this.refreshSummary,
            scope: this
        });

        if (!this.rowTpl) {
            this.rowTpl = new Ext.Template(
                '<div class="x-grid3-summary-row x-grid3-gridsummary-row-offset">',
                    '<table class="x-grid3-summary-table" border="0" cellspacing="0" cellpadding="0" style="{tstyle}">',
                        '<tbody><tr>{cells}</tr></tbody>',
                    '</table>',
                '</div>'
            );
            this.rowTpl.disableFormats = true;
        }
        this.rowTpl.compile();

        if (!this.cellTpl) {
            this.cellTpl = new Ext.Template(
                '<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} {css}" style="{style}">',
                    '<div class="x-grid3-cell-inner x-grid3-col-{id}" unselectable="on" {attr}>{value}</div>',
                "</td>"
            );
            this.cellTpl.disableFormats = true;
        }
        this.cellTpl.compile();
    },

    calculate : function(rs, cm) {
        var data = {}, cfg = cm.config;
        for (var i = 0, len = cfg.length; i < len; i++) { // loop through all columns in ColumnModel
            var cf = cfg[i], // get column's configuration
                cname = cf.dataIndex; // get column dataIndex

            // initialise grid summary row data for
            // the current column being worked on
            data[cname] = 0;

            if (cf.summaryType) {
                for (var j = 0, jlen = rs.length; j < jlen; j++) {
                    var r = rs[j]; // get a single Record
                    data[cname] = Ext.ux.grid.GridSummary.Calculations[cf.summaryType](r.get(cname), r, cname, data, j);
                }
            }
        }

        return data;
    },

    onLayout : function(vw, vh) {
        if (Ext.type(vh) != 'number') { // handles grid's height:'auto' config
            return;
        }
        // note: this method is scoped to the GridView
        if (!this.grid.getGridEl().hasClass('x-grid-hide-gridsummary')) {
            // readjust gridview's height only if grid summary row is visible
            this.scroller.setHeight(vh - this.summary.getHeight());
        }
    },

    syncSummaryScroll : function() {
        var mb = this.view.scroller.dom;

        this.view.summaryWrap.dom.scrollLeft = mb.scrollLeft;
        this.view.summaryWrap.dom.scrollLeft = mb.scrollLeft; // second time for IE (1/2 time first fails, other browsers ignore)
    },

    doWidth : function(col, w, tw) {
        var s = this.view.summary.dom;

        s.firstChild.style.width = tw;
        s.firstChild.rows[0].childNodes[col].style.width = w;
    },

    doAllWidths : function(ws, tw) {
        var s = this.view.summary.dom, wlen = ws.length;

        s.firstChild.style.width = tw;

        var cells = s.firstChild.rows[0].childNodes;

        for (var j = 0; j < wlen; j++) {
            cells[j].style.width = ws[j];
        }
    },

    doHidden : function(col, hidden, tw) {
        var s = this.view.summary.dom,
            display = hidden ? 'none' : '';

        s.firstChild.style.width = tw;
        s.firstChild.rows[0].childNodes[col].style.display = display;
    },

    renderSummary : function(o, cs, cm) {
        cs = cs || this.view.getColumnData();
        var cfg = cm.config,
            buf = [],
            last = cs.length - 1;

        for (var i = 0, len = cs.length; i < len; i++) {
            var c = cs[i], cf = cfg[i], p = {};

            p.id = c.id;
            p.style = c.style;
            p.css = i == 0 ? 'x-grid3-cell-first ' : (i == last ? 'x-grid3-cell-last ' : '');

            if (cf.summaryType || cf.summaryRenderer) {
                p.value = (cf.summaryRenderer || c.renderer)(o.data[c.name], p, o);
            } else {
                p.value = '';
            }
            if (p.value == undefined || p.value === "") p.value = "&#160;";
            buf[buf.length] = this.cellTpl.apply(p);
        }

        return this.rowTpl.apply({
            tstyle: 'width:' + this.view.getTotalWidth() + ';',
            cells: buf.join('')
        });
    },

    refreshSummary : function() {
        var g = this.grid, ds = g.store,
            cs = this.view.getColumnData(),
            cm = this.cm,
            rs = ds.getRange(),
            data = this.calculate(rs, cm),
            buf = this.renderSummary({data: data}, cs, cm);

        if (!this.view.summaryWrap) {
            this.view.summaryWrap = Ext.DomHelper.insertAfter(this.view.scroller, {
                tag: 'div',
                cls: 'x-grid3-gridsummary-row-inner'
            }, true);
        }
        this.view.summary = this.view.summaryWrap.update(buf).first();
    },

    toggleSummary : function(visible) { // true to display summary row
        var el = this.grid.getGridEl();

        if (el) {
            if (visible === undefined) {
                visible = el.hasClass('x-grid-hide-gridsummary');
            }
            el[visible ? 'removeClass' : 'addClass']('x-grid-hide-gridsummary');

            this.view.layout(); // readjust gridview height
        }
    },

    getSummaryNode : function() {
        return this.view.summary
    }
});
Ext.reg('gridsummary', Ext.ux.grid.GridSummary);

/*
 * all Calculation methods are called on each Record in the Store
 * with the following 5 parameters:
 *
 * v - cell value
 * record - reference to the current Record
 * colName - column name (i.e. the ColumnModel's dataIndex)
 * data - the cumulative data for the current column + summaryType up to the current Record
 * rowIdx - current row index
 */
Ext.ux.grid.GridSummary.Calculations = {
    sum : function(v, record, colName, data, rowIdx) {
        return data[colName] + Ext.num(v, 0);
    },

    count : function(v, record, colName, data, rowIdx) {
        return rowIdx + 1;
    },

    max : function(v, record, colName, data, rowIdx) {
        return Math.max(Ext.num(v, 0), data[colName]);
    },

    min : function(v, record, colName, data, rowIdx) {
        return Math.min(Ext.num(v, 0), data[colName]);
    },

    average : function(v, record, colName, data, rowIdx) {
        var t = data[colName] + Ext.num(v, 0), count = record.store.getCount();
        return rowIdx == count - 1 ? (t / count) : t;
    }
};/**
 * @class Ext.ux.grid.CellActions
 * @extends Ext.util.Observable
 *
 * CellActions plugin for Ext grid
 *
 * CellActions plugin causes that column model recognizes the config property cellAcions
 * that is the array of configuration objects for that column. The documentationi follows.
 *
 * THE FOLLOWING CONFIG OPTIONS ARE FOR COLUMN MODEL COLUMN, NOT FOR CellActions ITSELF.
 *
 * @cfg {Array} cellActions Mandatory. Array of action configuration objects. The following
 * configuration options of action are recognized:
 *
 * - @cfg {Function} callback Optional. Function to call if the action icon is clicked.
 *   This function is called with same signature as action event and in its original scope.
 *   If you need to call it in different scope or with another signature use 
 *   createCallback or createDelegate functions. Works for statically defined actions. Use
 *   callbacks configuration options for store bound actions.
 *
 * - @cfg {Function} cb Shortcut for callback.
 *
 * - @cfg {String} iconIndex Optional, however either iconIndex or iconCls must be
 *   configured. Field name of the field of the grid store record that contains
 *   css class of the icon to show. If configured, shown icons can vary depending
 *   of the value of this field.
 *
 * - @cfg {String} iconCls. css class of the icon to show. It is ignored if iconIndex is
 *   configured. Use this if you want static icons that are not base on the values in the record.
 *
 * - @cfg {String} qtipIndex Optional. Field name of the field of the grid store record that 
 *   contains tooltip text. If configured, the tooltip texts are taken from the store.
 *
 * - @cfg {String} tooltip Optional. Tooltip text to use as icon tooltip. It is ignored if 
 *   qtipIndex is configured. Use this if you want static tooltips that are not taken from the store.
 *
 * - @cfg {String} qtip Synonym for tooltip
 *
 * - @cfg {String} style Optional. Style to apply to action icon container.
 *
 * The following css is required:
 *
 * .ux-cell-value {
 * 	position:relative;
 * 	zoom:1;
 * }
 * .ux-cell-actions {
 * 	position:absolute;
 * 	right:0;
 * 	top:-2px;
 * }
 * .ux-cell-actions-left {
 * 	left:0;
 * 	top:-2px;
 * }
 * .ux-cell-action {
 * 	width:16px;
 * 	height:16px;
 * 	float:left;
 * 	cursor:pointer;
 * 	margin: 0 0 0 4px;
 * }
 * .ux-cell-actions-left .ux-cell-action {
 * 	margin: 0 4px 0 0;
 * }
 * @author    Ing. Jozef Sakáloš
 * @date      22. March 2008
 * @version   1.0
 * @revision  $Id: Ext.ux.grid.CellActions.js 589 2009-02-21 23:30:18Z jozo $
 *
 * @license Ext.ux.grid.CellActions is licensed under the terms of
 * the Open Source LGPL 3.0 license.  Commercial use is permitted to the extent
 * that the code/component(s) do NOT become part of another Open Source or Commercially
 * licensed development library or toolkit without explicit permission.
 * 
 * <p>License details: <a href="http://www.gnu.org/licenses/lgpl.html"
 * target="_blank">http://www.gnu.org/licenses/lgpl.html</a></p>
 *
 * @forum     30411
 * @demo      http://cellactions.extjs.eu
 * @download  
 * <ul>
 * <li><a href="http://cellactions.extjs.eu/cellactions.tar.bz2">cellactions.tar.bz2</a></li>
 * <li><a href="http://cellactions.extjs.eu/cellactions.tar.gz">cellactions.tar.gz</a></li>
 * <li><a href="http://cellactions.extjs.eu/cellactions.zip">cellactions.zip</a></li>
 * </ul>
 *
 * @donate
 * <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
 * <input type="hidden" name="cmd" value="_s-xclick">
 * <input type="hidden" name="hosted_button_id" value="3430419">
 * <input type="image" src="https://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" 
 * border="0" name="submit" alt="PayPal - The safer, easier way to pay online.">
 * <img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1">
 * </form>
 */

Ext.ns('Ext.ux.grid');

// constructor and cellActions documentation
// {{{
/**
 * Creates new CellActions
 * @constructor
 * @param {Object} config A config object
 */
Ext.ux.grid.CellActions = function(config) {
	Ext.apply(this, config);

	this.addEvents(
		/**
		 * @event action
		 * Fires when user clicks a cell action
		 * @param {Ext.grid.GridPanel} grid
		 * @param {Ext.data.Record} record Record containing data of clicked cell
		 * @param {String} action Action clicked (equals iconCls);
		 * @param {Mixed} value Value of the clicke cell
		 * @param {String} dataIndex as specified in column model
		 * @param {Number} rowIndex Index of row clicked
		 * @param {Number} colIndex Incex of col clicked
		 */
		'action'
		/**
		 * @event beforeaction
		 * Fires when user clicks a cell action but before action event is fired. Return false to cancel the action;
		 * @param {Ext.grid.GridPanel} grid
		 * @param {Ext.data.Record} record Record containing data of clicked cell
		 * @param {String} action Action clicked (equals iconCls);
		 * @param {Mixed} value Value of the clicke cell
		 * @param {String} dataIndex as specified in column model
		 * @param {Number} rowIndex Index of row clicked
		 * @param {Number} colIndex Incex of col clicked
		 */
		,'beforeaction'
	);
	// call parent
	Ext.ux.grid.CellActions.superclass.constructor.call(this);

}; // eo constructor
// }}}

Ext.extend(Ext.ux.grid.CellActions, Ext.util.Observable, {

	/**
	 * @cfg {String} actionEvent Event to trigger actions, e.g. click, dblclick, mouseover (defaults to 'click')
	 */
	 actionEvent:'click'

	/**
	 * @cfg {Number} actionWidth Width of action icon in pixels. Has effect only if align:'left'
	 */
	,actionWidth:20

	/**
	 * @cfg {String} align Set to 'left' to put action icons before the cell text. (defaults to undefined, meaning right)
	 */

	/**
	 * @private
	 * @cfg {String} tpl Template for cell with actions
	 */
	,tpl:'<div class="ux-cell-value" style="padding-left:{padding}px">'
			+'<tpl if="\'left\'!==align">{value}</tpl>'
		 	+'<div class="ux-cell-actions<tpl if="\'left\'===align"> ux-cell-actions-left</tpl>" style="width:{width}px">'
				+'<tpl for="actions"><div class="ux-cell-action {cls}" qtip="{qtip}" style="{style}">&#160;</div></tpl>'
			+'</div>'
			+'<tpl if="\'left\'===align">{value}</tpl>'
		+'<div>'
		
	/**
	 * Called at the end of processActions. Override this if you need it.
	 * @param {Object} c Column model configuration object
	 * @param {Object} data See this.processActions method for details
	 */
	,userProcessing:Ext.emptyFn

	// {{{
	/**
	 * Init function
	 * @param {Ext.grid.GridPanel} grid Grid this plugin is in
	 */
	,init:function(grid) {
		this.grid = grid;
//		grid.on({scope:this, render:this.onRenderGrid});
		grid.afterRender = grid.afterRender.createSequence(this.onRenderGrid, this);

		var cm = this.grid.getColumnModel();
		Ext.each(cm.config, function(c, idx) {
			if('object' === typeof c.cellActions) {
				c.origRenderer = cm.getRenderer(idx);
				c.renderer = this.renderActions.createDelegate(this);
			}
		}, this);


	} // eo function init
	// }}}
	// {{{
	/**
	 * grid render event handler, install actionEvent handler on view.mainBody
	 * @private
	 */
	,onRenderGrid:function() {

		// install click event handler on view mainBody
		this.view = this.grid.getView();
		var cfg = {scope:this};
		cfg[this.actionEvent] = this.onClick;
		this.view.mainBody.on(cfg);

	} // eo function onRender
	// }}}
	// {{{
	/**
	 * Returns data to apply to template. Override this if needed
	 * @param {Mixed} value 
	 * @param {Object} cell object to set some attributes of the grid cell
	 * @param {Ext.data.Record} record from which the data is extracted
	 * @param {Number} row row index
	 * @param {Number} col col index
	 * @param {Ext.data.Store} store object from which the record is extracted
	 * @returns {Object} data to apply to template
	 */
	,getData:function(value, cell, record, row, col, store) {
		return record.data || {};
	}
	// }}}
	// {{{
	/**
	 * replaces (but calls) the original renderer from column model
	 * @private
	 * @param {Mixed} value 
	 * @param {Object} cell object to set some attributes of the grid cell
	 * @param {Ext.data.Record} record from which the data is extracted
	 * @param {Number} row row index
	 * @param {Number} col col index
	 * @param {Ext.data.Store} store object from which the record is extracted
	 * @returns {String} markup of cell content
	 */
	,renderActions:function(value, cell, record, row, col, store) {

		// get column config from column model
		var c = this.grid.getColumnModel().config[col];

		// get output of the original renderer
		var val = c.origRenderer(value, cell, record, row, col, store);

		// get actions template if we need but don't have one
		if(c.cellActions && !c.actionsTpl) {
			c.actionsTpl = this.processActions(c);
			c.actionsTpl.compile();
		}
		// return original renderer output if we don't have actions
		else if(!c.cellActions) {
			return val;
		}

		// get and return final markup
		var data = this.getData.apply(this, arguments);
		data.value = val;
		return c.actionsTpl.apply(data);

	} // eo function renderActions
	// }}}
	// {{{
	/**
	 * processes the actions configs from column model column, saves callbacks and creates template
	 * @param {Object} c column model config of one column
	 * @private
	 */
	,processActions:function(c) {

		// callbacks holder
		this.callbacks = this.callbacks || {};

		// data for intermediate template
		var data = {
			 align:this.align || 'right'
			,width:this.actionWidth * c.cellActions.length
			,padding:'left' === this.align ? this.actionWidth * c.cellActions.length : 0
			,value:'{value}'
			,actions:[]
		};

		// cellActions loop
		Ext.each(c.cellActions, function(a, i) {

			// save callback
			if(a.iconCls && 'function' === typeof (a.callback || a.cb)) {
				this.callbacks[a.iconCls] = a.callback || a.cb;
			}

			// data for intermediate xtemplate action
			var o = {
				 cls:a.iconIndex ? '{' + a.iconIndex + '}' : (a.iconCls ? a.iconCls : '')
				,qtip:a.qtipIndex ? '{' + a.qtipIndex + '}' : (a.tooltip || a.qtip ? a.tooltip || a.qtip : '')
				,style:a.style ? a.style : ''
			};
			data.actions.push(o);

		}, this); // eo cellActions loop

		this.userProcessing(c, data);

		// get and return final template
		var xt = new Ext.XTemplate(this.tpl);
		return new Ext.Template(xt.apply(data));

	} // eo function processActions
	// }}}
	// {{{
	/**
	 * Grid body actionEvent event handler
	 * @private
	 */
	,onClick:function(e, target) {

		// collect all variables for callback and/or events
		var t = e.getTarget('div.ux-cell-action');
		var row = e.getTarget('.x-grid3-row');
		var col = this.view.findCellIndex(target.parentNode.parentNode);
		var c = this.grid.getColumnModel().config[col];
		var record, dataIndex, value, action;
		if(t) {
			record = this.grid.store.getAt(row.rowIndex);
			dataIndex = c.dataIndex;
			value = record.get(dataIndex);
			action = t.className.replace(/ux-cell-action /, '');
		}

		// check if we've collected all necessary variables
		if(false !== row && false !== col && record && dataIndex && action) {

			// call callback if any
			if(this.callbacks && 'function' === typeof this.callbacks[action]) {
				this.callbacks[action](this.grid, record, action, value, dataIndex, row.rowIndex, col);
			}

			// fire events
			if(true !== this.eventsSuspended && false === this.fireEvent('beforeaction', this.grid, record, action, value, dataIndex, row.rowIndex, col)) {
				return;
			}
			else if(true !== this.eventsSuspended) {
				this.fireEvent('action', this.grid, record, action, value, dataIndex, row.rowIndex, col);
			}

		}
	} // eo function onClick
	// }}}

});

// register xtype
Ext.reg('cellactions', Ext.ux.grid.CellActions);

// eof
;/**
 * 动态加载节点的树（可以替换SimpleTree使用）
 * 
 * --------------------------------------------------------------
 * 消息：
 * 用户选中了某个节点
 * 
 * 消息名：     			
 * divo.nodeSelect<树器件Id>   
 * 
 * 消息内容：
 * {int} sender 本组件的id值
 * {Ext.tree.TreeNode} node 当前选中的节点对象
 * --------------------------------------------------------------
 */
divo.tree.SmartTree = Ext.extend(Ext.tree.TreePanel, {
	baseUrl : null,  //必须定义
	tbarVisible : true,
	initComponent : function() {
		Ext.apply(this, {
			animate : true,
			containerScroll : true,
			rootVisible : true,
			root : this.createRootNode(),
			tbar : this.tbarVisible?this.getTbar():undefined,
			autoScroll : true,
			loader : new Ext.tree.TreeLoader({
				requestMethod : 'GET',
				clearOnLoad: true,
				dataUrl : this.getChildrenUrl(),
				nodeConfigFn : this.nodeConfigFn.createDelegate(this), //参见 ExtOverride.js
				listeners : {
					"load" : {
						fn : this.onLoad,
						scope : this
					},
					"loadexception" : {
						fn : this.onLoadException,
						scope : this
					}
				}
			})
		})

		divo.tree.SmartTree.superclass.initComponent.call(this)
	},
	render : function() {
		divo.tree.SmartTree.superclass.render.apply(this, arguments);
		
		this.getSelectionModel().on('selectionchange', this.onNodeSelected, this, true)
	},	
	getTbar : function() {
		return	new Ext.Toolbar({
			items: ['->', {
				icon : divo.iconCollapseAll2,
				cls : 'x-btn-icon',
				tooltip : '全部收缩',
				handler : this.onCollapseAll,
				scope : this
			}]
		})
	},
	nodeConfigFn : function(data) {
		var nodeData = {
			leaf : data.is_leaf,
			id : data.id,
			text : data.name,
			codeLevel : data.code_level,
			code : data.tree_code,
			parentId : data.parent_id,
			draggable : false
		}
		return this.nodeConfigFnExtra(nodeData,data)
	},
	//模板方法
	nodeConfigFnExtra : function(nodeData,data) {
		return nodeData
	},
	//模板方法
	onLoad : function() {
		//不能写成 Ext.emptyFn ！
	},
	onLoadException : function(loader, node, response) {
		divo.error(response.responseText)
	},
	onCollapseAll : function() {
		this.root.collapse(true)
	},
	onNodeSelected : function(sm, node) {
		if (!node) return
		
		this.currentNodeId = node.id
		this.currentNode = node
		
		this.publish("divo.nodeSelect"+this.id,{sender:this.id,node:node})
	},
	getChildrenUrl : function() {
		return this.baseUrl+'/children'
	},	
	getRootUrl : function() {
		return this.baseUrl+'/root'
	},	
	createRootNode : function() {
		var root
		Ext.Ajax.request({
			scope : this,
			url : this.getRootUrl(),
			async : false,
			method : 'GET',
			success : function(response, options) {
				var resp = Ext.decode(response.responseText)
				if (!resp.success) {
					this.say(resp.errors.reason)
					return
				}
				root = resp.data
			},
			failure : function(response, options) {
				this.alert(response.responseText)
			}
		})
		if (!root) return null
		
		var node = this.nodeConfigFn(root)
			
		Ext.apply(node,{
			draggable : false,
			expanded : true
		})
		return new Ext.tree.AsyncTreeNode(node)
	}

})
// EOP

;//Thanks: http://www.sencha.com/forum/showthread.php?27269-2.x-ComboBox-Tree/page3
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

Ext.reg("divo.tree.treecombobox", divo.tree.TreeComboBox);  ;/**
 * 只读的动态加载树
 * 
 * --------------------------------------------------------------
 * 消息：
 * 用户选中了某个节点
 * 
 * 消息名：     			
 * divo.nodeSelect<树器件Id>   
 * 
 * 消息内容：
 * {int} sender 本组件的id值
 * {Ext.tree.TreeNode} node 当前选中的节点对象
 * --------------------------------------------------------------
 */
divo.tree.SimpleTree = Ext.extend(Ext.tree.TreePanel, {
	url : null,
	nodeConfigFn : null,
	treeName : null,
	rootId : 1,
	tbarVisible : true,
	allowMaint : true,
	initComponent : function() {
		Ext.apply(this, {
			animate : true,
			containerScroll : true,
			rootVisible : true,
			root : this.createRootNode(),
			tbar : this.tbarVisible?this.getTbar():undefined,
			autoScroll : true,
			loader : new Ext.tree.TreeLoader({
				requestMethod : 'GET',
				dataUrl : this.url,
				nodeConfigFn : this.nodeConfigFn.createDelegate(this),
				listeners : {
					"loadexception" : {
						fn : this.onLoadException,
						scope : this
					}
				}
			})
		})

		divo.tree.SimpleTree.superclass.initComponent.call(this)
	},
	render : function() {
		divo.tree.SimpleTree.superclass.render.apply(this, arguments);
		
		this.getSelectionModel().on('selectionchange', this.onNodeSelected, this, true)
		this.loader.on("load", this.onLoad,this)
	},	
	getTbar : function() {
		return	new Ext.Toolbar({
			cls: 'go-paging-tb',
			items: ['->', {
				icon : divo.iconCollapseAll2,
				cls : 'x-btn-icon',
				tooltip : '全部收缩',
				handler : this.onCollapseAll,
				scope : this
			}]
		})
	},
	// 处理加载异常
	onLoadException : function(loader, node, response) {
		divo.showError(response.responseText)
	},
	onCollapseAll : function() {
		this.root.collapse(true)
	},
	onNodeSelected : function(sm, node) {
		if (!node) return
		this.currentNodeId = node.id
		this.currentNode = node
		
		this.publish("divo.nodeSelect"+this.id,{sender:this.id,node:node})
	},
	onLoad : function(o, node, response) {
		if (this.currentNodeId) {
			var currentNode = node.findChild("id", this.currentNodeId)
			if (currentNode) {
				currentNode.ensureVisible() // 自动滚动到该节点，并展开
				currentNode.expand()
				this.getSelectionModel().select(currentNode)
			} // 光标定位
		}
	},
	createRootNode : function() {
		var root
		Ext.Ajax.request({
			scope : this,
			url : this.rootUrl,
			async : false,
			method : 'GET',
			success : function(response, options) {
				var resp = Ext.decode(response.responseText)
				if (!resp.success) {
					this.say(resp.errors.reason)
					return
				}
				root = resp.data
			},
			failure : function(response, options) {
				this.alert(response.responseText)
			}
		})
		if (!root) return null
		
		if (this.nodeConfigFn)
			var node = this.nodeConfigFn(root)
			
		Ext.apply(node,{
			draggable : false,
			expanded : false
		})
		return new Ext.tree.AsyncTreeNode(node)
	}

})
// EOP

;/**
 * 可以动态新建、修改和删除的树，还能拖动和调整节点顺序
 */
divo.tree.DynamicTree = Ext.extend(divo.tree.SimpleTree, {
	readOnly : false,
	initComponent : function() {
		Ext.apply(this, {
			//ddAppendOnly : true,  会造成网格拖动到树无效！
			url : this.baseUrl+'/children',
			rootUrl : this.baseUrl+'/root',
			nodeConfigFn : this.createMyNode,
			autoScroll : true,
			enableDD : !this.readOnly || this.canUpdate()
		})	

		this.subscribe("divo.win.TreeOrderChanged",	this.onTreeOrderChanged, this)
		this.on('beforedestroy', function() {
			this.unsubscribe()
		}, this)

		
		divo.tree.DynamicTree.superclass.initComponent.call(this)
	},
	onTreeOrderChanged : function(subj, msg, data) {
		if (msg.sender == this.treeSortWinId) {
			if (msg.node.reload)
				msg.node.reload()
		}
	},
	onRender : function() {
		divo.tree.DynamicTree.superclass.onRender.apply(this, arguments);
		
		if(this.readOnly || !this.canCreate()) return
		
		this.on("contextmenu", this.onShowContext, this)
		this.on('beforemovenode', this.onMoveNode, this)
		this.createTreeEditor()
	},	
	getTbar : function() {
		return	new Ext.Toolbar({
			items: [{
				text : '新建',
				tooltip : '新建' + this.treeName,
				icon : divo.iconAdd,
				cls : 'x-btn-text-icon',
				hidden : this.readOnly || !this.canCreate(),
				handler : function() {
					var selectedNode = this.getSelectNode()
					if (!selectedNode) {
						return
					}
					this.onAdd(selectedNode)
				},
				scope : this
			},'->', {
				icon : divo.iconCollapseAll2,
				cls : 'x-btn-icon',
				tooltip : '全部收缩',
				handler : this.onCollapseAll,
				scope : this
			}]
		})
	},
	onShowContext : function(node, e) {
		if (this.readOnly) return
		
		this.createContextMenu()

		if (this.ctxNode) {
			this.ctxNode.ui.removeClass('x-node-ctx')
		}
		if (node) {
			this.ctxNode = node
			this.ctxNode.ui.addClass('x-node-ctx')
		}

		this.ctx.showAt(e.getXY())
	},
	createContextMenu : function() {
		if (this.ctx)
			return

		this.ctx = new Ext.menu.Menu({
			items : [{
				text : '修改',
				icon : divo.iconEdit,
				scope : this,
				hidden : !this.canUpdate(),
				handler : function() {
					var selectedNode = this.getSelectNode()
					if (!selectedNode) {
						return
					}
					this.onUpdate(selectedNode)
				}
			}, {
				text : '删除',
				icon : divo.iconDelete,
				scope : this,
				hidden : !this.canDelete(),
				handler : function() {
					var selectedNode = this.getSelectNode()
					if (!selectedNode) {
						return
					}
					this.onDelete(selectedNode)
				}
			}, '-', {
				text : '调整显示顺序',
				icon : divo.iconUrl + "/component.gif",
				scope : this,
				hidden : !this.canUpdate(),
				handler : function() {
					var selectedNode = this.validateOnChangeDisplayOrder()
					if (selectedNode)
						this.onChangeDisplayOrder(selectedNode)
				}
			}]
		});
		this.ctx.on('hide', this.onContextHide, this);
	},
	//子类可重写
	validateOnChangeDisplayOrder : function() {
		var selectedNode = this.getSelectNode()
		if (!selectedNode) {
			return null
		}
		if (!selectedNode.firstChild) {
			this.say("该节点无下级节点")
			return null
		}
		return selectedNode
	},
	hasSelection : function() {
		var selectedNode = this.getSelectionModel().getSelectedNode()
		if (!selectedNode) {
			this.say('请先选择' + this.treeName + '。')
			return false
		}
		return true
	},
	getSelectNode : function() {
		var selectedNode
		if (this.ctxNode) {
			selectedNode = this.ctxNode
			this.ctxNode.select()
		} else {
			if (!this.hasSelection()) {
				return null
			} else {
				selectedNode = this.getSelectionModel().getSelectedNode()
			}
		}
		return selectedNode
	},
	onContextHide : function() {
		if (this.ctxNode) {
			this.ctxNode.ui.removeClass('x-node-ctx')
			this.ctxNode = null
		}
	},
	onMoveNode : function(tree, node, oldParent, newParent, index) {
		var allowMove = true

		// prevent other events while processing this one
		Ext.util.Observable.capture(tree, function() {
			return false
		})

		allowMove = this.onChangeNodeParent(node,oldParent,newParent)

		// restore normal event handling
		Ext.util.Observable.releaseCapture(tree)

		return allowMove
	},
	createTreeEditor : function() {
		this.treeEditor = new Ext.tree.TreeEditor(this, {
			allowBlank : false,
			blankText : '请输入'+this.treeName+'名称',
			selectOnFocus : true
		})

		this.un('beforeclick', this.treeEditor.beforeNodeClick, this.treeEditor) //不要doubleclick效果
		this.treeEditor.on("complete", this.onNodeEdited, this, true)
	},
	onNodeEdited : function(o, newText, oldText) {
		var node = o.editNode
		var parentId = node.parentNode.attributes.id
		if (this.adding) {
			var result = this.save(null,newText,parentId) 
			if (result) {
				node.id = result.id
				node.attributes.id = result.id
				node.attributes.code = result.code
			}
		} else {
			var result = this.save(node.attributes.id,newText,parentId) 
			if (!result) 
				node.setText(oldText) 
		}
		this.editing = false
		this.adding = false
	},
	save : function(nodeId,nodeText,parentId) {
		this.getEl().mask('','x-mask-loading')
		var item = {name:nodeText,
					parent_id:parentId}
		var result = null			
		Ext.Ajax.request({
			scope : this,
			url : this.baseUrl+(nodeId?"/"+nodeId:""),
			method : !this.adding?'PUT':'POST',
			jsonData : item,
			async : false,
			success : function(response, options) {
				this.getEl().unmask()
				var resp = Ext.decode(response.responseText)
				result = resp
			},
			failure : function(response, options) {
				this.getEl().unmask()
			    this.alert(response.responseText)
			}
		})
		if (!result) {
			this.say("[" + newText + "]保存失败")
		} else {
		    if (!result.success) {
				this.say(result.errors.name)
				result = null
		    }	
		}	
		return result
	},
	//public
	clearSelectedNode : function() {
		this.getSelectionModel().clearSelections()
	},
	createMyNode : function(data) {
		var nodeData = {
			leaf : data.is_leaf,
			id : data.id,
			text : data.name,
			codeLevel : data.code_level,
			code : data.tree_code,
			parentId : data.parent_id,
			draggable : data.parent_id > 0
		}
		return this.createMyNodeAddon(nodeData,data)
	},
	//模板方法
	createMyNodeAddon : function(nodeData,data) {
		return nodeData
	},
	//若节点数据不同，子类可重写
	onAdd : function(parentNode) {
		var node = new Ext.tree.TreeNode(this.createMyNode({
			is_leaf : true,
			id : '99999999',
			name : this.treeName,
			code_level : parentNode.attributes.codeLevel+1,
			tree_code : '99999999',
			parent_id : parentNode.attributes.id		      	
		}));
		this.adding = true
		
		parentNode.appendChild(node)
		parentNode.expand()
		node.select()
		parentNode.lastChild.ensureVisible()
		this.treeEditor.triggerEdit(node)
	},
	//子类可重写
	onUpdate : function(node) {
		if (node.isRoot) {
			this.say("根节点不允许修改")
			return
		}
		this.treeEditor.triggerEdit(node)	
	},
	onDelete : function(node) {
		if (node.isRoot) {
			this.say('根节点不允许删除。')
			return
		}
		if (node.firstChild) {
			this.say('还有子节点，不允许删除。')
			return
		}
		if (!this.otherDeleteValidate(node)) {
			return
		}
		this.currentNode = node
		Ext.MessageBox.confirm('确认', '要删除吗？', this.deleteConfirm
				.createDelegate(this))
	},
	deleteConfirm : function(btn) {
		if (btn !== 'yes')
			return

		var ok = true
		var node = this.currentNode
		Ext.Ajax.request({
			scope : this,
			url : this.baseUrl+"/"+node.id,
			async : false,
			method : 'DELETE',
			success : function(response, options) {
				var resp = Ext.decode(response.responseText)
				if (!resp.success) {
					ok = false
					this.say(resp.errors.reason)
				}
			},
			failure : function(response, options) {
				this.alert(response.responseText)
				ok = false
			}
		});
		if (ok)
			node.parentNode.removeChild(node)
	},
	onChangeNodeParent : function(node, oldParentNode, newParentNode) {
		if (!this.otherDragValidate(node)) {
			return false //返回值为false，表示不允许拖动
		}
		if (oldParentNode.id==newParentNode.id) {
			this.say("此拖动操作无效")
		    return false 
		}
		    
		Ext.Ajax.request({
			scope : this,
			url : this.baseUrl + "/"+node.id + "/parent",
			async : false,
			method : 'PUT',
			jsonData : {
				newParentId : newParentNode.id
			},
			success : function(response, options) {
				var resp = Ext.decode(response.responseText)
				if (resp.success) {
					this.say('拖动操作成功')
				}
			},
			failure : function(response, options) {
				this.alert(response.responseText)
			}
		})
		return true
	},
	onChangeDisplayOrder : function(node) {
		this.treeSortWinId = this.myId('sort-win')
		var win = new divo.win.TreeSortWindow({
			id : this.treeSortWinId,
			parentNode : node,
			baseUrl : this.baseUrl
		})
		win.show()
	},
	//由子类实现或重写
	otherDeleteValidate : function(node) {
		return true
	},
	otherDragValidate : function(node) {
		return true
	}

})
// EOP

;/**
 * 上传图片(或Flash文件)文件夹树维护
 * 
 * --------------------------------------------------------------
 * 消息：
 * 图片上传成功
 * 
 * 消息名：     			
 * divo.tree.ImageUploaded
 * 
 * 消息内容：
 * {int} sender 当前组件Id
 * {int} fileId 上传图片记录Id (可选)
 * {String} catalogCode 当前文件夹节点编号
 * --------------------------------------------------------------
 */
divo.tree.ImageCatalogTree = Ext.extend(divo.tree.DynamicTree, {
	allowMaxWidth : null,
	allowMaxHeight : null,
	allowMaxFileSize : null,
	thumbWidth : 0,   //采用底图中贴缩小后图片的方法
	thumbHeight : 0,
	baseWidth : 0,
	baseHeight : 0,
	isFlash : false,
	initComponent : function() {
		Ext.apply(this, {
			baseUrl : '/imagecatalogs/'+this.getUserId(),
			treeName : '文件夹'
		})

		divo.tree.ImageCatalogTree.superclass.initComponent.call(this)	
	},
	afterRender : function() {
		divo.tree.ImageCatalogTree.superclass.afterRender.apply(this, arguments);
		var f = function() {
			this.expandAll()
			this.root.select()
			//this.onUploadImage(this.root)
		}
		f.defer(100,this)
	},	
	//重写
	getTbar : function() {
		return [{
			text : '上传'+(this.isFlash?'Flash文件':'图片'),
			tooltip : '上传'+(this.isFlash?'Flash文件':'图片')+'到当前文件夹',
			icon :  divo.iconUrl + 'block-image.gif',
			cls : 'x-btn-text-icon',
			handler : function() {
				var selectedNode = this.getSelectNode()
				if (!selectedNode) {
					return
				}
				this.onUploadImage(selectedNode)
			},
			scope : this
		},{
			text : '批量上传',
			tooltip : '将多个'+(this.isFlash?'Flash文件':'图片')+'同时上传到当前文件夹',
			icon :  divo.iconUrl + 'arrow_up.png',
			cls : 'x-btn-text-icon',
			handler : function() {
				var selectedNode = this.getSelectNode()
				if (!selectedNode) {
					return
				}
				this.onUploadMultiImage(selectedNode)
			},
			scope : this
		},'->', {	
			tooltip : '新建下级文件夹',
			icon : divo.iconAdd,
			cls : 'x-btn-icon',
			handler : function() {
				var selectedNode = this.getSelectNode()
				if (!selectedNode) {
					return
				}
				this.onAdd(selectedNode)
			},
			scope : this
		}, {
			icon : divo.iconCollapseAll2,
			cls : 'x-btn-icon',
			tooltip : '全部收缩',
			handler : this.onCollapseAll,
			scope : this
		}]
	},
	onUploadImage  : function(node) {
		var win = new Ext.ux.UploadDialog.Dialog({
				url : "/uploadedimages/"+this.getUserId()+"/"+node.attributes.code+"/"+this.getImageLimitStr(),
				upload_autostart : true,
				allow_close_on_upload : false,
				permitted_extensions : this.isFlash?["swf","SWF"]:["gif", "jpg", "png","GIF","JPG","PNG"],
				closeAction : 'destroy'
			})
		win.on('uploadsuccess', this.onUploadSuccess, this)
		win.show()
	},
	onUploadSuccess : function(o, fileName, resp) {
		this.publish("divo.tree.ImageUploaded",{
			sender:this.id,
			fileId: resp.fileId,
			catalogCode : resp.catalogCode
		})
	},
	otherDeleteValidate : function(node) {
		if (this.hasItems(node)) {
			this.say('已经在此文件夹中保存了图片，不允许删除。')
			return false
		}
		return true
	},
	otherDragValidate : function(node) {
		if (this.hasItems(node)) {
			this.say('已经在此文件夹中保存了图片，不能再移动。')
			return false
		}
		return true
	},
	hasItems : function(node) {
		var ok = true
		var count = 0
		Ext.Ajax.request({
			scope : this,
			url : "/uploadedimages/"+this.getUserId()+"/"+node.attributes.code,
			async : false,
			method : 'GET',
			success : function(response, options) {
				var resp = Ext.decode(response.responseText)
				count = resp.totalCount
			},
			failure : function(response, options) {
				this.alert(response.responseText)
				ok = false
			}
		})
		return ok && count > 0
	},
	//上传多个文件
	onUploadMultiImage : function(node) {
		this.currentCatalogCode = node.attributes.code
		var dlg = new Ext.ux.SwfUploadPanel({
			  //title: 'Dialog Sample'
			  width: 500
			, height: 300
			, border: false
            , upload_url: "/uploadedimages/"+this.getUserId()+"/"+this.currentCatalogCode+"/multi/"+this.getImageLimitStr()
			, post_params: { id: 123}
			, file_types: this.isFlash?'*.swf':'*.jpg;*.jpeg;*.gif;*.png;'
			, file_types_description: (this.isFlash?'Flash文件':'图片文件')
			, single_file_select: false // Set to true if you only want to select one file from the FileDialog.
			, confirm_delete: false // This will prompt for removing files from queue.
			, remove_completed: true // Remove file from grid after uploaded.
		}); // End Dialog
		dlg.on('fileUploadComplete', this.onUploadMultiSuccess, this)
		var win = new Ext.Window({
			  title: '批量上传文件'
			, width: 514
			, modal : true
			, height: 330
			, resizable: false
			, items: [ dlg ]
		}); 
		win.show();
	},
	onUploadMultiSuccess : function(panel, file, response) {
		this.publish("divo.tree.ImageUploaded",{
			sender: this.id,
			catalogCode : this.currentCatalogCode
		})
	},
	getImageLimitStr : function() {
		var allow_max_width = this.allowMaxWidth || 0
		var allow_max_height = this.allowMaxHeight || 0
		var allow_max_file_size = this.allowMaxFileSize || 300  //KB
		var thumb_width = this.thumbWidth || 0
		var thumb_height = this.thumbHeight || 0
		var base_width = this.baseWidth || 0
		var base_height = this.baseHeight || 0
		var imageLimitStr = allow_max_width+"/"+allow_max_height+"/"+allow_max_file_size+"/"+
		                    thumb_width+"/"+thumb_height+"/"+base_width+"/"+base_height
		return imageLimitStr                    
	}
})

Ext.reg("divo.tree.ImageCatalogTree", divo.tree.ImageCatalogTree);
// EOP

;//Thanks: https://extjs.com/forum/showthread.php?t=32365
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
;/**
 * This namespace should be in another file but I dicided to put it here for consistancy.
 */
Ext.namespace('Ext.ux.Utils');

/**
 * This class implements event queue behaviour.
 *
 * @class Ext.ux.Utils.EventQueue
 * @param function  handler  Event handler.
 * @param object    scope    Handler scope.
 */
Ext.ux.Utils.EventQueue = function(handler, scope)
{
  if (!handler) {
    throw 'Handler is required.';
  }
  this.handler = handler;
  this.scope = scope || window;
  this.queue = [];
  this.is_processing = false;
  
  /**
   * Posts event into the queue.
   * 
   * @access public
   * @param mixed event Event identificator.
   * @param mixed data  Event data.
   */
  this.postEvent = function(event, data)
  {
    data = data || null;
    this.queue.push({event: event, data: data});
    if (!this.is_processing) {
      this.process();
    }
  }
  
  this.flushEventQueue = function()
  {
    this.queue = [];
  },
  
  /**
   * @access private
   */
  this.process = function()
  {
    while (this.queue.length > 0) {
      this.is_processing = true;
      var event_data = this.queue.shift();
      this.handler.call(this.scope, event_data.event, event_data.data);
    }
    this.is_processing = false;
  }
}

/**
 * This class implements Mili's finite state automata behaviour.
 *  
 *  Transition / output table format:
 *  {
 *    'state_1' : {
 *      'event_1' : [
 *        {
 *          p|predicate: function,    // Transition predicate, optional, default to true.
 *                                    // If array then conjunction will be applyed to the operands.
 *                                    // Predicate signature is (data, event, this).
 *          a|action: function|array, // Transition action, optional, default to Ext.emptyFn.
 *                                    // If array then methods will be called sequentially.
 *                                    // Action signature is (data, event, this).
 *          s|state: 'state_x',       // New state - transition destination, optional, default to 
 *                                    // current state.
 *          scope: object             // Predicate and action scope, optional, default to 
 *                                    // trans_table_scope or window.
 *        }
 *      ]
 *    },
 *
 *    'state_2' : {
 *      ...
 *    }
 *    ...
 *  }
 *
 *  @param  mixed initial_state Initial state.
 *  @param  object trans_table Transition / output table.
 *  @param  trans_table_scope Transition / output table's methods scope.
 */
Ext.ux.Utils.FSA = function(initial_state, trans_table, trans_table_scope)
{
  this.current_state = initial_state;
  this.trans_table = trans_table || {};
  this.trans_table_scope = trans_table_scope || window;
  Ext.ux.Utils.FSA.superclass.constructor.call(this, this.processEvent, this);
}

Ext.extend(Ext.ux.Utils.FSA, Ext.ux.Utils.EventQueue, {

  current_state : null,
  trans_table : null,  
  trans_table_scope : null,
  
  /**
   * Returns current state
   * 
   * @access public
   * @return mixed Current state.
   */
  state : function()
  {
    return this.current_state;
  },
  
  /**
   * @access public
   */
  processEvent : function(event, data)
  {
    var transitions = this.currentStateEventTransitions(event);
    if (!transitions) {
      throw "State '" + this.current_state + "' has no transition for event '" + event + "'.";
    }
    for (var i = 0, len = transitions.length; i < len; i++) {
      var transition = transitions[i];

      var predicate = transition.predicate || transition.p || true;
      var action = transition.action || transition.a || Ext.emptyFn;
      var new_state = transition.state || transition.s || this.current_state;
      var scope = transition.scope || this.trans_table_scope;
      
      if (this.computePredicate(predicate, scope, data, event)) {
        this.callAction(action, scope, data, event);
        this.current_state = new_state; 
        return;
      }
    }
    
    throw "State '" + this.current_state + "' has no transition for event '" + event + "' in current context";
  },
  
  /**
   * @access private
   */
  currentStateEventTransitions : function(event)
  {
    return this.trans_table[this.current_state] ? 
      this.trans_table[this.current_state][event] || false
      :
      false;
  },
  
  /**
   * @access private
   */
  computePredicate : function(predicate, scope, data, event)
  {
    var result = false; 
    
    switch (Ext.type(predicate)) {
     case 'function':
       result = predicate.call(scope, data, event, this);
       break;
     case 'array':
       result = true;
       for (var i = 0, len = predicate.length; result && (i < len); i++) {
         if (Ext.type(predicate[i]) == 'function') {
           result = predicate[i].call(scope, data, event, this);
         }
         else {
           throw [
             'Predicate: ',
             predicate[i],
             ' is not callable in "',
             this.current_state,
             '" state for event "',
             event
           ].join('');
         }
       }
       break;
     case 'boolean':
       result = predicate;
       break;
     default:
       throw [
         'Predicate: ',
         predicate,
         ' is not callable in "',
         this.current_state,
         '" state for event "',
         event
       ].join('');
    }
    return result;
  },
  
  /**
   * @access private
   */
  callAction : function(action, scope, data, event)
  {
    switch (Ext.type(action)) {
       case 'array':
       for (var i = 0, len = action.length; i < len; i++) {
         if (Ext.type(action[i]) == 'function') {
           action[i].call(scope, data, event, this);
         }
         else {
           throw [
             'Action: ',
             action[i],
             ' is not callable in "',
             this.current_state,
             '" state for event "',
             event
           ].join('');
         }
       }
         break;
     case 'function':
       action.call(scope, data, event, this);
       break;
     default:
       throw [
         'Action: ',
         action,
         ' is not callable in "',
         this.current_state,
         '" state for event "',
         event
       ].join('');
    }
  }
});

// ---------------------------------------------------------------------------------------------- //

/**
 * Ext.ux.UploadDialog namespace.
 */
Ext.namespace('Ext.ux.UploadDialog');

/**
 * File upload browse button.
 *
 * @class Ext.ux.UploadDialog.BrowseButton
 */ 
Ext.ux.UploadDialog.BrowseButton = Ext.extend(Ext.Button, 
{
  input_name : 'file',
  
  input_file : null,
  
  original_handler : null,
  
  original_scope : null,
  
  /**
   * @access private
   */
  initComponent : function()
  {
    Ext.ux.UploadDialog.BrowseButton.superclass.initComponent.call(this);
    this.original_handler = this.handler || null;
    this.original_scope = this.scope || window;
    this.handler = null;
    this.scope = null;
  },
  
  /**
   * @access private
   */
  onRender : function(ct, position)
  {
    Ext.ux.UploadDialog.BrowseButton.superclass.onRender.call(this, ct, position);
    this.createInputFile();
  },
  
  /**
   * @access private
   */
  createInputFile : function()
  {
    var button_container = this.el.child('.x-btn-center');
    button_container.position('relative');
    this.input_file = Ext.DomHelper.append(
      button_container, 
      {
        tag: 'input',
        type: 'file',
        size: 1,
        name: this.input_name || Ext.id(this.el),
        style: 'position: absolute; display: block; border: none; cursor: pointer'
      },
      true
    );
    
    var button_box = button_container.getBox();
    this.input_file.setStyle('font-size', (button_box.width * 0.5) + 'px');

    var input_box = this.input_file.getBox();
    var adj = {x: 3, y: 3}
    if (Ext.isIE) {
      adj = {x: 0, y: 3}
    }
    
    this.input_file.setLeft(button_box.width - input_box.width + adj.x + 'px');
    this.input_file.setTop(button_box.height - input_box.height + adj.y + 'px');
    this.input_file.setOpacity(0.0);
        
    if (this.handleMouseEvents) {
      this.input_file.on('mouseover', this.onMouseOver, this);
        this.input_file.on('mousedown', this.onMouseDown, this);
    }
    
    if(this.tooltip){
      if(typeof this.tooltip == 'object'){
        Ext.QuickTips.register(Ext.apply({target: this.input_file}, this.tooltip));
      } 
      else {
        this.input_file.dom[this.tooltipType] = this.tooltip;
        }
      }
    
    this.input_file.on('change', this.onInputFileChange, this);
    this.input_file.on('click', function(e) { e.stopPropagation(); }); 
  },
  
  /**
   * @access public
   */
  detachInputFile : function(no_create)
  {
    var result = this.input_file;
    
    no_create = no_create || false;
    
    if (typeof this.tooltip == 'object') {
      Ext.QuickTips.unregister(this.input_file);
    }
    else {
      this.input_file.dom[this.tooltipType] = null;
    }
    this.input_file.removeAllListeners();
    this.input_file = null;
    
    if (!no_create) {
      this.createInputFile();
    }
    return result;
  },
  
  /**
   * @access public
   */
  getInputFile : function()
  {
    return this.input_file;
  },
  
  /**
   * @access public
   */
  disable : function()
  {
    Ext.ux.UploadDialog.BrowseButton.superclass.disable.call(this);  
    this.input_file.dom.disabled = true;
  },
  
  /**
   * @access public
   */
  enable : function()
  {
    Ext.ux.UploadDialog.BrowseButton.superclass.enable.call(this);
    this.input_file.dom.disabled = false;
  },
  
  /**
   * @access public
   */
  destroy : function()
  {
    var input_file = this.detachInputFile(true);
    input_file.remove();
    input_file = null;
    Ext.ux.UploadDialog.BrowseButton.superclass.destroy.call(this);      
  },
  
  /**
   * @access private
   */
  onInputFileChange : function()
  {
    if (this.original_handler) {
      this.original_handler.call(this.original_scope, this);
    }
  }  
});

/**
 * Toolbar file upload browse button.
 *
 * @class Ext.ux.UploadDialog.TBBrowseButton
 */
Ext.ux.UploadDialog.TBBrowseButton = Ext.extend(Ext.ux.UploadDialog.BrowseButton, 
{
  hideParent : true,

  onDestroy : function()
  {
    Ext.ux.UploadDialog.TBBrowseButton.superclass.onDestroy.call(this);
    if(this.container) {
      this.container.remove();
      }
  }
});

/**
 * Record type for dialogs grid.
 *
 * @class Ext.ux.UploadDialog.FileRecord 
 */
Ext.ux.UploadDialog.FileRecord = Ext.data.Record.create([
  {name: 'filename'},
  {name: 'state', type: 'int'},
  {name: 'note'},
  {name: 'input_element'}
]);

Ext.ux.UploadDialog.FileRecord.STATE_QUEUE = 0;
Ext.ux.UploadDialog.FileRecord.STATE_FINISHED = 1;
Ext.ux.UploadDialog.FileRecord.STATE_FAILED = 2;
Ext.ux.UploadDialog.FileRecord.STATE_PROCESSING = 3;

/**
 * Dialog class.
 *
 * @class Ext.ux.UploadDialog.Dialog
 */
Ext.ux.UploadDialog.Dialog = function(config)
{
  var default_config = {
    border: false,
    width: 450,
    height: 300,
    minWidth: 450,
    minHeight: 300,
    modal : true,
    plain: true,
    constrainHeader: true,
    draggable: true,
    closable: true,
    maximizable: false,
    minimizable: false,
    resizable: true,
    autoDestroy: true,
    closeAction: 'hide',
    title: this.i18n.title,
    cls: 'ext-ux-uploaddialog-dialog',
    // --------
    url: '',
    base_params: {},
    permitted_extensions: [],
    reset_on_hide: true,
    allow_close_on_upload: false,
    upload_autostart: false,
    post_var_name: 'file'
  }
  config = Ext.applyIf(config || {}, default_config);
  config.layout = 'absolute';
  
  Ext.ux.UploadDialog.Dialog.superclass.constructor.call(this, config);
}

Ext.extend(Ext.ux.UploadDialog.Dialog, Ext.Window, {

  fsa : null,
  
  state_tpl : null,
  
  form : null,
  
  grid_panel : null,
  
  progress_bar : null,
  
  is_uploading : false,
  
  initial_queued_count : 0,
  
  upload_frame : null,
  
  /**
   * @access private
   */
  //--------------------------------------------------------------------------------------------- //
  initComponent : function()
  {
    Ext.ux.UploadDialog.Dialog.superclass.initComponent.call(this);
    
    // Setting automata protocol
    var tt = {
      // --------------
      'created' : {
      // --------------
        'window-render' : [
          {
            action: [this.createForm, this.createProgressBar, this.createGrid],
            state: 'rendering'
          }
        ],
        'destroy' : [
          {
            action: this.flushEventQueue,
            state: 'destroyed'
          }
        ]
      },
      // --------------
      'rendering' : {
      // --------------
        'grid-render' : [
          {
            action: [this.fillToolbar, this.updateToolbar],
            state: 'ready'
          }
        ],
        'destroy' : [
          {
            action: this.flushEventQueue,
            state: 'destroyed'
          }
        ]
      },
      // --------------
      'ready' : {
      // --------------
        'file-selected' : [
          {
            predicate: [this.fireFileTestEvent, this.isPermittedFile],
            action: this.addFileToUploadQueue,
            state: 'adding-file'
          },
          {
            // If file is not permitted then do nothing.
          }
        ],
        'grid-selection-change' : [
          {
            action: this.updateToolbar
          }
        ],
        'remove-files' : [
          {
            action: [this.removeFiles, this.fireFileRemoveEvent]
          }
        ],
        'reset-queue' : [
          {
            action: [this.resetQueue, this.fireResetQueueEvent]
          }
        ],
        'start-upload' : [
          {
            predicate: this.hasUnuploadedFiles,
            action: [
              this.setUploadingFlag, this.saveInitialQueuedCount, this.updateToolbar, 
              this.updateProgressBar, this.prepareNextUploadTask, this.fireUploadStartEvent
            ],
            state: 'uploading'
          },
          {
            // Has nothing to upload, do nothing.
          }
        ],
        'stop-upload' : [
          {
            // We are not uploading, do nothing. Can be posted by user only at this state. 
          }
        ],
        'hide' : [
          {
            predicate: [this.isNotEmptyQueue, this.getResetOnHide],
            action: [this.resetQueue, this.fireResetQueueEvent]
          },
          {
            // Do nothing
          }
        ],
        'destroy' : [
          {
            action: this.flushEventQueue,
            state: 'destroyed'
          }
        ]
      },
      // --------------
      'adding-file' : {
      // --------------
        'file-added' : [
          {
            predicate: this.isUploading,
            action: [this.incInitialQueuedCount, this.updateProgressBar, this.fireFileAddEvent],
            state: 'uploading' 
          },
          {
            predicate: this.getUploadAutostart,
            action: [this.startUpload, this.fireFileAddEvent],
            state: 'ready'
          },
          {
            action: [this.updateToolbar, this.fireFileAddEvent],
            state: 'ready'
          }
        ]
      },
      // --------------
      'uploading' : {
      // --------------
        'file-selected' : [
          {
            predicate: [this.fireFileTestEvent, this.isPermittedFile],
            action: this.addFileToUploadQueue,
            state: 'adding-file'
          },
          {
            // If file is not permitted then do nothing.
          }
        ],
        'grid-selection-change' : [
          {
            // Do nothing.
          }
        ],
        'start-upload' : [
          {
            // Can be posted only by user in this state. 
          }
        ],
        'stop-upload' : [
          {
            predicate: this.hasUnuploadedFiles,
            action: [
              this.resetUploadingFlag, this.abortUpload, this.updateToolbar, 
              this.updateProgressBar, this.fireUploadStopEvent
            ],
            state: 'ready'
          },
          {
            action: [
              this.resetUploadingFlag, this.abortUpload, this.updateToolbar, 
              this.updateProgressBar, this.fireUploadStopEvent, this.fireUploadCompleteEvent
            ],
            state: 'ready'
          }
        ],
        'file-upload-start' : [
          {
            action: [this.uploadFile, this.findUploadFrame, this.fireFileUploadStartEvent]
          }
        ],
        'file-upload-success' : [
          {
            predicate: this.hasUnuploadedFiles,
            action: [
              this.resetUploadFrame, this.updateRecordState, this.updateProgressBar, 
              this.prepareNextUploadTask, this.fireUploadSuccessEvent
            ]
          },
          {
            action: [
              this.resetUploadFrame, this.resetUploadingFlag, this.updateRecordState, 
              this.updateToolbar, this.updateProgressBar, this.fireUploadSuccessEvent, 
              this.fireUploadCompleteEvent
            ],
            state: 'ready'
          }
        ],
        'file-upload-error' : [
          {
            predicate: this.hasUnuploadedFiles,
            action: [
              this.resetUploadFrame, this.updateRecordState, this.updateProgressBar, 
              this.prepareNextUploadTask, this.fireUploadErrorEvent
            ]
          },
          {
            action: [
              this.resetUploadFrame, this.resetUploadingFlag, this.updateRecordState, 
              this.updateToolbar, this.updateProgressBar, this.fireUploadErrorEvent, 
              this.fireUploadCompleteEvent
            ],
            state: 'ready'
          }
        ],
        'file-upload-failed' : [
          {
            predicate: this.hasUnuploadedFiles,
            action: [
              this.resetUploadFrame, this.updateRecordState, this.updateProgressBar, 
              this.prepareNextUploadTask, this.fireUploadFailedEvent
            ]
          },
          {
            action: [
              this.resetUploadFrame, this.resetUploadingFlag, this.updateRecordState, 
              this.updateToolbar, this.updateProgressBar, this.fireUploadFailedEvent, 
              this.fireUploadCompleteEvent
            ],
            state: 'ready'
          }
        ],
        'hide' : [
          {
            predicate: this.getResetOnHide,
            action: [this.stopUpload, this.repostHide]
          },
          {
            // Do nothing.
          }
        ],
        'destroy' : [
          {
            predicate: this.hasUnuploadedFiles,
            action: [
              this.resetUploadingFlag, this.abortUpload,
              this.fireUploadStopEvent, this.flushEventQueue
            ],
            state: 'destroyed'
          },
          {
            action: [
              this.resetUploadingFlag, this.abortUpload,
              this.fireUploadStopEvent, this.fireUploadCompleteEvent, this.flushEventQueue
            ], 
            state: 'destroyed'
          }
        ]
      },
      // --------------
      'destroyed' : {
      // --------------
      }
    }
    this.fsa = new Ext.ux.Utils.FSA('created', tt, this);
    
    // Registering dialog events.
    this.addEvents({
      'filetest': true,
      'fileadd' : true,
      'fileremove' : true,
      'resetqueue' : true,
      'uploadsuccess' : true,
      'uploaderror' : true,
      'uploadfailed' : true,
      'uploadstart' : true,
      'uploadstop' : true,
      'uploadcomplete' : true,
      'fileuploadstart' : true
    });
    
    // Attaching to window events.
    this.on('render', this.onWindowRender, this);
    this.on('beforehide', this.onWindowBeforeHide, this);
    this.on('hide', this.onWindowHide, this);
    this.on('destroy', this.onWindowDestroy, this);
    
    // Compiling state template.
    this.state_tpl = new Ext.Template(
      "<div class='ext-ux-uploaddialog-state ext-ux-uploaddialog-state-{state}'>&#160;</div>"
    ).compile();
  },
  
  createForm : function()
  {
    this.form = Ext.DomHelper.append(this.body, {
      tag: 'form',
      method: 'post',
      action: this.url,
      style: 'position: absolute; left: -100px; top: -100px; width: 100px; height: 100px'
    });
  },
  
  createProgressBar : function()
  {
    this.progress_bar = this.add(
      new Ext.ProgressBar({
        x: 0,
        y: 0,
        anchor: '0',
        value: 0.0,
        text: this.i18n.progress_waiting_text
      })
    );
  },
  
  createGrid : function()
  {
    var store = new Ext.data.Store({
      proxy: new Ext.data.MemoryProxy([]),
      reader: new Ext.data.JsonReader({}, Ext.ux.UploadDialog.FileRecord),
      sortInfo: {field: 'state', direction: 'DESC'},
      pruneModifiedRecords: true
    });
    
    var cm = new Ext.grid.ColumnModel([
      {
        header: this.i18n.state_col_title,
        width: this.i18n.state_col_width,
        resizable: false,
        dataIndex: 'state',
        sortable: true,
        renderer: this.renderStateCell.createDelegate(this)
      },
      {
        header: this.i18n.filename_col_title,
        width: this.i18n.filename_col_width,
        dataIndex: 'filename',
        sortable: true,
        renderer: this.renderFilenameCell.createDelegate(this)
      },
      {
        header: this.i18n.note_col_title,
        width: this.i18n.note_col_width, 
        dataIndex: 'note',
        sortable: true,
        renderer: this.renderNoteCell.createDelegate(this)
      }
    ]);
  
      this.grid_panel = new Ext.grid.GridPanel({
      ds: store,
      cm: cm,
    
      x: 0,
      y: 22,
      anchor: '0 -22',
      border: true,
      
        viewConfig: {
        autoFill: true,
          forceFit: true
        },
      
      bbar : new Ext.Toolbar()
    });
    this.grid_panel.on('render', this.onGridRender, this);
    
    this.add(this.grid_panel);
    
    this.grid_panel.getSelectionModel().on('selectionchange', this.onGridSelectionChange, this);
  },
  
  fillToolbar : function()
  {
    var tb = this.grid_panel.getBottomToolbar();
    tb.x_buttons = {}
    
    tb.x_buttons.add = tb.addItem(new Ext.ux.UploadDialog.TBBrowseButton({
      input_name: this.post_var_name,
      text: this.i18n.add_btn_text,
      tooltip: this.i18n.add_btn_tip,
      iconCls: 'ext-ux-uploaddialog-addbtn',
      handler: this.onAddButtonFileSelected,
      scope: this
    }));
    
    tb.x_buttons.remove = tb.addButton({
      text: this.i18n.remove_btn_text,
      tooltip: this.i18n.remove_btn_tip,
      iconCls: 'ext-ux-uploaddialog-removebtn',
      handler: this.onRemoveButtonClick,
      scope: this
    });
    
    tb.x_buttons.reset = tb.addButton({
      text: this.i18n.reset_btn_text,
      tooltip: this.i18n.reset_btn_tip,
      iconCls: 'ext-ux-uploaddialog-resetbtn',
      handler: this.onResetButtonClick,
      scope: this
    });
    
    tb.add('-');
    
    tb.x_buttons.upload = tb.addButton({
      text: this.i18n.upload_btn_start_text,
      tooltip: this.i18n.upload_btn_start_tip,
      iconCls: 'ext-ux-uploaddialog-uploadstartbtn',
      handler: this.onUploadButtonClick,
      scope: this
    });
    
    tb.add('-');
    
    tb.x_buttons.indicator = tb.addItem(
      new Ext.Toolbar.Item(
        Ext.DomHelper.append(tb.getEl(), {
          tag: 'div',
          cls: 'ext-ux-uploaddialog-indicator-stoped',
          html: '&#160'
        })
      )
    );
    
    tb.add('->');
    
    tb.x_buttons.close = tb.addButton({
      text: this.i18n.close_btn_text,
      tooltip: this.i18n.close_btn_tip,
      handler: this.onCloseButtonClick,
      scope: this
    });
  },
  
  renderStateCell : function(data, cell, record, row_index, column_index, store)
  {
    return this.state_tpl.apply({state: data});
  },
  
  renderFilenameCell : function(data, cell, record, row_index, column_index, store)
  {
    var view = this.grid_panel.getView();
    var f = function() {
      try {
        Ext.fly(
          view.getCell(row_index, column_index)
        ).child('.x-grid3-cell-inner').dom['qtip'] = data;
      }
      catch (e)
      {}
    }
    f.defer(1000);
    return data;
  },
  
  renderNoteCell : function(data, cell, record, row_index, column_index, store)
  {
    var view = this.grid_panel.getView();
    var f = function() {
      try {
        Ext.fly(
          view.getCell(row_index, column_index)
        ).child('.x-grid3-cell-inner').dom['qtip'] = data;
      }
      catch (e)
      {}
      }
    f.defer(1000);
    return data;
  },
  
  getFileExtension : function(filename)
  {
    var result = null;
    var parts = filename.split('.');
    if (parts.length > 1) {
      result = parts.pop();
    }
    return result;
  },
  
  isPermittedFileType : function(filename)
  {
    var result = true;
    if (this.permitted_extensions.length > 0) {
      result = this.permitted_extensions.indexOf(this.getFileExtension(filename)) != -1;
    }
    return result;
  },

  isPermittedFile : function(browse_btn)
  {
    var result = false;
    var filename = browse_btn.getInputFile().dom.value;
    
    if (this.isPermittedFileType(filename)) {
      result = true;
    }
    else {
      Ext.Msg.alert(
        this.i18n.error_msgbox_title, 
        String.format(
          this.i18n.err_file_type_not_permitted,
          filename,
          this.permitted_extensions.join(this.i18n.permitted_extensions_join_str)
        )
      );
      result = false;
    }
    
    return result;
  },
  
  fireFileTestEvent : function(browse_btn)
  {
    return this.fireEvent('filetest', this, browse_btn.getInputFile().dom.value) !== false;
  },
  
  addFileToUploadQueue : function(browse_btn)
  {
    var input_file = browse_btn.detachInputFile();
    
    input_file.appendTo(this.form);
    input_file.setStyle('width', '100px');
    input_file.dom.disabled = true;
    
    var store = this.grid_panel.getStore();
    store.add(
      new Ext.ux.UploadDialog.FileRecord({
          state: Ext.ux.UploadDialog.FileRecord.STATE_QUEUE,
          filename: input_file.dom.value,
          note: this.i18n.note_queued_to_upload,
          input_element: input_file
        })
      );
    this.fsa.postEvent('file-added', input_file.dom.value);
  },
  
  fireFileAddEvent : function(filename)
  {
    this.fireEvent('fileadd', this, filename);
  },
  
  updateProgressBar : function()
  {
    if (this.is_uploading) {
      var queued = this.getQueuedCount(true);
      var value = 1 - queued / this.initial_queued_count;
      this.progress_bar.updateProgress(
        value,
        String.format(
          this.i18n.progress_uploading_text, 
          this.initial_queued_count - queued,
          this.initial_queued_count
        )
      );
    }
    else {
      this.progress_bar.updateProgress(0, this.i18n.progress_waiting_text);
    }
  },
  
  updateToolbar : function()
  {
    var tb = this.grid_panel.getBottomToolbar();
    if (this.is_uploading) {
      tb.x_buttons.remove.disable();
      tb.x_buttons.reset.disable();
      tb.x_buttons.upload.enable();
      if (!this.getAllowCloseOnUpload()) {
        tb.x_buttons.close.disable();
      }
      Ext.fly(tb.x_buttons.indicator.getEl()).replaceClass(
        'ext-ux-uploaddialog-indicator-stoped',
        'ext-ux-uploaddialog-indicator-processing'
      );
      tb.x_buttons.upload.setIconClass('ext-ux-uploaddialog-uploadstopbtn');
      tb.x_buttons.upload.setText(this.i18n.upload_btn_stop_text);
      tb.x_buttons.upload.getEl()
        .child(tb.x_buttons.upload.buttonSelector)
        .dom[tb.x_buttons.upload.tooltipType] = this.i18n.upload_btn_stop_tip;
    }
    else {
      tb.x_buttons.remove.enable();
      tb.x_buttons.reset.enable();
      tb.x_buttons.close.enable();
      Ext.fly(tb.x_buttons.indicator.getEl()).replaceClass(
        'ext-ux-uploaddialog-indicator-processing',
        'ext-ux-uploaddialog-indicator-stoped'
      );
      tb.x_buttons.upload.setIconClass('ext-ux-uploaddialog-uploadstartbtn');
      tb.x_buttons.upload.setText(this.i18n.upload_btn_start_text);
      tb.x_buttons.upload.getEl()
        .child(tb.x_buttons.upload.buttonSelector)
        .dom[tb.x_buttons.upload.tooltipType] = this.i18n.upload_btn_start_tip;
      
      if (this.getQueuedCount() > 0) {
        tb.x_buttons.upload.enable();
      }
      else {
        tb.x_buttons.upload.disable();      
      }
      
      if (this.grid_panel.getSelectionModel().hasSelection()) {
        tb.x_buttons.remove.enable();
      }
      else {
        tb.x_buttons.remove.disable();
      }
      
      if (this.grid_panel.getStore().getCount() > 0) {
        tb.x_buttons.reset.enable();
      }
      else {
        tb.x_buttons.reset.disable();
      }
    }
  },
  
  saveInitialQueuedCount : function()
  {
    this.initial_queued_count = this.getQueuedCount();
  },
  
  incInitialQueuedCount : function()
  {
    this.initial_queued_count++;
  },
  
  setUploadingFlag : function()
  {
    this.is_uploading = true;
  }, 
  
  resetUploadingFlag : function()
  {
    this.is_uploading = false;
  },

  prepareNextUploadTask : function()
  {
    // Searching for first unuploaded file.
    var store = this.grid_panel.getStore();
    var record = null;
    
    store.each(function(r) {
      if (!record && r.get('state') == Ext.ux.UploadDialog.FileRecord.STATE_QUEUE) {
        record = r;
      }
      else {
        r.get('input_element').dom.disabled = true;
      }
    });
    
    record.get('input_element').dom.disabled = false;
    record.set('state', Ext.ux.UploadDialog.FileRecord.STATE_PROCESSING);
    record.set('note', this.i18n.note_processing);
    record.commit();
    
    this.fsa.postEvent('file-upload-start', record);
  },
   
  fireUploadStartEvent : function()
  {
    this.fireEvent('uploadstart', this);
  },
  
  removeFiles : function(file_records)
  {
    var store = this.grid_panel.getStore();
    for (var i = 0, len = file_records.length; i < len; i++) {
      var r = file_records[i];
      r.get('input_element').remove();
      store.remove(r);
    }
  },
  
  fireFileRemoveEvent : function(file_records)
  {
    for (var i = 0, len = file_records.length; i < len; i++) {
      this.fireEvent('fileremove', this, file_records[i].get('filename'));
    }
  },
  
  resetQueue : function()
  {
    var store = this.grid_panel.getStore();
    store.each(
      function(r) {
        r.get('input_element').remove();
      }
    );
    store.removeAll();
  },
  
  fireResetQueueEvent : function()
  {
    this.fireEvent('resetqueue', this);
  },
  
  uploadFile : function(record)
  {
    Ext.Ajax.request({
      url : this.url,
      params : this.base_params || this.baseParams || this.params,
      method : 'POST',
      form : this.form,
      isUpload : true,
      success : this.onAjaxSuccess,
      failure : this.onAjaxFailure,
      scope : this,
      record: record
    });
  },
   
  fireFileUploadStartEvent : function(record)
  {
    this.fireEvent('fileuploadstart', this, record.get('filename'));
  },
  
  updateRecordState : function(data)
  {
    if ('success' in data.response && data.response.success) {
      data.record.set('state', Ext.ux.UploadDialog.FileRecord.STATE_FINISHED);
      data.record.set(
        'note', this.i18n.note_upload_success
      );
    }
    else {
      data.record.set('state', Ext.ux.UploadDialog.FileRecord.STATE_FAILED);
      data.record.set(
        'note', data.response.message || data.response.error || this.i18n.note_upload_error
      );
    }
    
    data.record.commit();
  },
  
  fireUploadSuccessEvent : function(data)
  {
    this.fireEvent('uploadsuccess', this, data.record.get('filename'), data.response);
  },
  
  fireUploadErrorEvent : function(data)
  {
    this.fireEvent('uploaderror', this, data.record.get('filename'), data.response);
  },
  
  fireUploadFailedEvent : function(data)
  {
    this.fireEvent('uploadfailed', this, data.record.get('filename'));
  },
  
  fireUploadCompleteEvent : function()
  {
    this.fireEvent('uploadcomplete', this);
  },
  
  findUploadFrame : function() 
  {
    this.upload_frame = Ext.getBody().child('iframe.x-hidden:last');
  },
  
  resetUploadFrame : function()
  {
    this.upload_frame = null;
  },
  
  removeUploadFrame : function()
  {
    if (this.upload_frame) {
      this.upload_frame.removeAllListeners();
      this.upload_frame.dom.src = 'about:blank';
      this.upload_frame.remove();
    }
    this.upload_frame = null;
  },
  
  abortUpload : function()
  {
    this.removeUploadFrame();
    
    var store = this.grid_panel.getStore();
    var record = null;
    store.each(function(r) {
      if (r.get('state') == Ext.ux.UploadDialog.FileRecord.STATE_PROCESSING) {
        record = r;
        return false;
      }
    });
    
    record.set('state', Ext.ux.UploadDialog.FileRecord.STATE_FAILED);
    record.set('note', this.i18n.note_aborted);
    record.commit();
  },
  
  fireUploadStopEvent : function()
  {
    this.fireEvent('uploadstop', this);
  },
  
  repostHide : function()
  {
    this.fsa.postEvent('hide');
  },
  
  flushEventQueue : function()
  {
    this.fsa.flushEventQueue();
  },
  
  /**
   * @access private
   */
  // -------------------------------------------------------------------------------------------- //
  onWindowRender : function()
  {
    this.fsa.postEvent('window-render');
  },
  
  onWindowBeforeHide : function()
  {
    return this.isUploading() ? this.getAllowCloseOnUpload() : true;
  },
  
  onWindowHide : function()
  {
    this.fsa.postEvent('hide');
  },
  
  onWindowDestroy : function()
  {
    this.fsa.postEvent('destroy');
  },
  
  onGridRender : function()
  {
    this.fsa.postEvent('grid-render');
  },
  
  onGridSelectionChange : function()
  {
    this.fsa.postEvent('grid-selection-change');
  },
  
  onAddButtonFileSelected : function(btn)
  {
    this.fsa.postEvent('file-selected', btn);
  },
  
  onUploadButtonClick : function()
  {
    if (this.is_uploading) {
      this.fsa.postEvent('stop-upload');
    }
    else {
      this.fsa.postEvent('start-upload');
    }
  },
  
  onRemoveButtonClick : function()
  {
    var selections = this.grid_panel.getSelectionModel().getSelections();
    this.fsa.postEvent('remove-files', selections);
  },
  
  onResetButtonClick : function()
  {
    this.fsa.postEvent('reset-queue');
  },
  
  onCloseButtonClick : function()
  {
    this[this.closeAction].call(this);
  },
  
  onAjaxSuccess : function(response, options)
  {
    var json_response = {
      'success' : false,
      'error' : this.i18n.note_upload_error
    }
    try { 
        var rt = response.responseText;
        var filter = rt.match(/^<[^>]+>((?:.|\n)*)<\/[^>]+>$/);
        if (filter) {
            rt = filter[1];
        }
        json_response = Ext.util.JSON.decode(rt); 
    } 
    catch (e) {}
    
    var data = {
      record: options.record,
      response: json_response
    }
    
    if ('success' in json_response) {
      this.fsa.postEvent('file-upload-success', data);
    }
    else {
      this.fsa.postEvent('file-upload-error', data);
    }
  },
  
  onAjaxFailure : function(response, options)
  {
    var data = {
      record : options.record,
      response : {
        'success' : false,
        'error' : this.i18n.note_upload_failed
      }
    }

    this.fsa.postEvent('file-upload-failed', data);
  },
  
  /**
   * @access public
   */
  // -------------------------------------------------------------------------------------------- //
  startUpload : function()
  {
    this.fsa.postEvent('start-upload');
  },
  
  stopUpload : function()
  {
    this.fsa.postEvent('stop-upload');
  },
  
  getUrl : function()
  {
    return this.url;
  },
  
  setUrl : function(url)
  {
    this.url = url;
  },
  
  getBaseParams : function()
  {
    return this.base_params;
  },
  
  setBaseParams : function(params)
  {
    this.base_params = params;
  },
  
  getUploadAutostart : function()
  {
    return this.upload_autostart;
  },
  
  setUploadAutostart : function(value)
  {
    this.upload_autostart = value;
  },
  
  getAllowCloseOnUpload : function()
  {
    return this.allow_close_on_upload;
  },
  
  setAllowCloseOnUpload : function(value)
  {
    this.allow_close_on_upload = value;
  },
  
  getResetOnHide : function()
  {
    return this.reset_on_hide;
  },
  
  setResetOnHide : function(value)
  {
    this.reset_on_hide = value;
  },
  
  getPermittedExtensions : function()
  {
    return this.permitted_extensions;
  },
  
  setPermittedExtensions : function(value)
  {
    this.permitted_extensions = value;
  },
  
  isUploading : function()
  {
    return this.is_uploading;
  },
  
  isNotEmptyQueue : function()
  {
    return this.grid_panel.getStore().getCount() > 0;
  },
  
  getQueuedCount : function(count_processing)
  {
    var count = 0;
    var store = this.grid_panel.getStore();
    store.each(function(r) {
      if (r.get('state') == Ext.ux.UploadDialog.FileRecord.STATE_QUEUE) {
        count++;
      }
      if (count_processing && r.get('state') == Ext.ux.UploadDialog.FileRecord.STATE_PROCESSING) {
        count++;
      }
    });
    return count;
  },
  
  hasUnuploadedFiles : function()
  {
    return this.getQueuedCount() > 0;
  }
});

// ---------------------------------------------------------------------------------------------- //

var p = Ext.ux.UploadDialog.Dialog.prototype;
p.i18n = {
  title: '文件上传',
  state_col_title: '状态',
  state_col_width: 70,
  filename_col_title: '文件名',
  filename_col_width: 230,  
  note_col_title: '备注',
  note_col_width: 150,
  add_btn_text: '添加',
  add_btn_tip: '添加文件到上传队列.',
  remove_btn_text: '删除',
  remove_btn_tip: '从上传队列中删除文件.',
  reset_btn_text: '重置',
  reset_btn_tip: '重置队列.',
  upload_btn_start_text: '上传',
  upload_btn_stop_text: '放弃',
  upload_btn_start_tip: '上传队列中的文件到服务器.',
  upload_btn_stop_tip: '停止上传.',
  close_btn_text: '关闭',
  close_btn_tip: '关闭此窗口.',
  progress_waiting_text: '(空闲)',
  progress_uploading_text: '正在上传: 已经完成 {0} / {1} .',
  error_msgbox_title: '错误',
  permitted_extensions_join_str: ',',
  err_file_type_not_permitted: '所选文件的扩展名无效.<br/>请选择下列扩展名的文件: {1}',
  note_queued_to_upload: '上传排队中',
  note_processing: '正在上传...',
  note_upload_failed: '服务器故障.',
  note_upload_success: '上传成功.',
  note_upload_error: '上传失败.',
  note_aborted: '被用户放弃.'
};/**
 * 上传图片(或Flash文件)选择窗口
 */
divo.win.ImageChooserWindow = Ext.extend(Ext.Window, {
	allowMaxWidth : null,
	allowMaxHeight : null,
	allowMaxFileSize : null,
	thumbWidth : null,
	thumbHeight : null,
	baseWidth : 0,
	baseHeight : 0,
	isFlash : false,
	initComponent : function() {
		//只能取固定值，才能和css配合好
		this.imagePanelId = 'divo-uploaded-image-panel' 
		
		Ext.apply(this,{
			title : '选择'+(this.isFlash?'Flash文件':'图片'),
			stateful : true,
			stateId : 'divo-image-chooser-win',
			modal : true,
			closable : true,
			maximizable : false,
			minimizable : false,
			cancelAction : "destroy",  //只能取值destroy，否则会有imagePanelId不唯一的情况
			closeAction : "destroy",
			buttons : [{
				text : "选择"+(this.isFlash?'Flash文件':'图片'),
				handler : this.onSave,
				scope : this
			}, {
				text : "删除"+(this.isFlash?'Flash文件':'图片'),
				handler : this.onDelete,
				scope : this
			},{
				text : "关闭",
				handler : this.onCancel,
				scope : this
			}],
			layout : "tdgi_border",
			items : [{
				region : 'west',
				title : '文件夹',
				stateful : true,
				stateId : this.myId('tree'),
				collapsible : true,
				width : 250,
				collapsedTitle : true,
				split : true,
				layout : 'fit',
				items : [{
				   id : this.myId('tree'),
				   xtype : "divo.tree.ImageCatalogTree",
				   allowMaxWidth : this.allowMaxWidth,
				   allowMaxHeight : this.allowMaxHeight,
				   allowMaxFileSize : this.allowMaxFileSize,
				   thumbWidth : this.thumbWidth,
				   thumbHeight : this.thumbHeight,
				   baseWidth : this.baseWidth,
				   baseHeight : this.baseHeight,
				   isFlash : this.isFlash
				}]
			}, {
				region : 'center',
				layout : 'fit',
				autoScroll : true,
				items : [{
					id : this.imagePanelId,
					border: true,
					xtype : 'divo.panel.UploadedImagePanel',
				    allowMaxWidth : this.allowMaxWidth,
				    allowMaxHeight : this.allowMaxHeight,
				    isFlash : this.isFlash
				}]
			}]
		})

		this.subscribe("divo.panel.SelectImage",this.onSelectImage,this)
		this.subscribe("divo.nodeSelect"+this.myId('tree'),this.onImageCatalogSelected,this)
		this.subscribe("divo.tree.ImageUploaded",this.onImageUploaded,this)		
		this.on('beforedestroy',function() {
		      this.unsubscribe()
		},this)
		
		divo.win.ImageChooserWindow.superclass.initComponent.call(this);
	},
	onImageCatalogSelected : function(subj, msg, data) {
		var p = Ext.getCmp(this.imagePanelId)
		p.showList(msg.node.attributes.code)
	},
	onImageUploaded : function(subj, msg, data) {
		if (msg.sender==this.myId('tree')) {
			var p = Ext.getCmp(this.imagePanelId)
			p.showList(msg.catalogCode,msg.fileId)
		}
	},
	onSelectImage : function(subj, msg, data) {
		if (msg.sender==this.imagePanelId) {
			this.selectNode(msg.node)
		}
	},
	onDelete : function() {
		var p = Ext.getCmp(this.imagePanelId)
		p.deleteImage()
	},
	onSave : function() {
		this.selectNode()
	},
	selectNode : function(selectedNode) {
		var p = Ext.getCmp(this.imagePanelId)
		if (!selectedNode)
			var node = p.getCurrentNode()
		else 
		    var node = selectedNode
		    
		if (node) {
			this.callback(this.imageSrcEl,node)
			this.close()
		}
	},
	//public
	showWindow: function(imageSrcEl, callback) {
		this.imageSrcEl = imageSrcEl
		this.callback = callback
		this.show()
	}
})
// EOP

;/**
 * 树节点排序窗口
 * 
 * --------------------------------------------------------------
 * 消息：
 * 节点排序成功
 * 
 * 消息名：     			
 * divo.win.TreeOrderChanged 
 * 
 * 消息内容：
 * {int} sender 当前组件Id
 * {Ext.tree.TreeNode} node 当前节点对象(被排序节点的父节点）
 * --------------------------------------------------------------
*/
divo.win.TreeSortWindow = Ext.extend(Ext.Window, {
	cancelAction : "destroy",  //还可以取值：hide
	closeAction : "destroy",
	parentNode : null,
	baseUrl : null,
	initComponent : function() {
		Ext.apply(this,{
			title : '排序',
			width : 540,	
			autoHeight : true,
			layout : "form",
			modal : true,
			closable : true,
			maximizable : false,
			minimizable : false,
			buttons : [{
				text : "确定",
				handler : this.onSave,
				scope : this
			}, {
				text : "取消",
				handler : this.onCancel,
				scope : this
			}],
			items : this.getSortForm()
		});
		
		divo.win.TreeSortWindow.superclass.initComponent.call(this);
	},
	//子类可重写
	getSortForm : function() {
		return {
			xtype : "divo.form.TreeSortForm",
			parentNode : this.parentNode,
			baseUrl : this.baseUrl
		}
	},
	onSave : function() {
		this.items.itemAt(0).save(this.onSaveSucccess.createDelegate(this))
	},
	onSaveSucccess : function() {
		this.publish("divo.win.TreeOrderChanged",{
			sender:this.id, 
			node:this.parentNode
		})
		this.close()
	}
});
// EOP

;/**
 * 查看PDF窗口
 */
divo.win.PdfShowWindow = Ext.extend(Ext.Window, {
	cancelAction : "destroy",  
	closeAction : "destroy",
	url : null,
	title : null,
	initComponent : function() {
		
		Ext.apply(this,{
			stateful : true,
			stateId : 'check-pdf-showWin',
			width : 850,
			height : 520,
			modal : true,
			closable : true,
			maximizable : true,
			minimizable : false,
			layout : "fit",
			items : {
				xtype : "mediapanel",
				mediaCfg:{
				   mediaType:'PDFFRAME',
		           url: this.url+"?auth="+Ext.Ajax.defaultHeaders.Authorization+"&_dc="+new Date().getTime(),
		           controls:true,
		           start:true
	        }}
		})
		
		divo.win.PdfShowWindow.superclass.initComponent.call(this);
	}
})
// EOP

;/**
 * 异常信息显示窗口
 */
divo.win.ExceptionDialog = Ext.extend(Ext.Window, {
	errorMsg : "",
    width: 650,
    xtype: 'panel',
    layout: 'fit',
    plain: true,
	cancelAction : "destroy",  
	closeAction : "destroy",
    autoScroll: true,
    modal : false,
    initComponent: function() {
    	var isDebug = this.getAppContext().isDebug
    	this.height = isDebug?600:400
    	var msgHeight = isDebug?400:200
        this.title = '非正常结束';
        this.items = new Ext.FormPanel({
                bodyStyle: 'padding:5px;',
                buttonAlign: 'right',
                labelAlign: 'top',
                autoScroll: false,
                buttons: [{
                    text: '发送报告',
                    scope: this,
                    handler: this.onSendReport
                },{
                    text: '关闭',
                    scope: this,
                    handler: function() {
                        this.close();
                    }
                }],
                items: [{
                    xtype: 'panel',
                    border: false,
                    html: '<div>' + 
                              '<p>有错误发生，程序非正常终止。最后的动作可能没有正确执行。</p>' +
                              '<p>请协助改进本软件，在下面填写关于在哪里有什么错误发生的简短描述。</p>' + 
                          '</div>'
                }, {
                    id: 'divo-exceptiondialog-description',
                    height: 60,
                    xtype: 'textarea',
                    hideLabel : true,
                    name: 'description',
                    anchor: '95%'
                }, {
                    xtype: 'iframepanel',
                    collapsible: true,
                    collapsed: !isDebug,
                    title: '显示细节',
                    height : msgHeight,
					autoScroll : false,
					html : this.errorMsg
                }]
        });
        
        divo.win.ExceptionDialog.superclass.initComponent.call(this);
    },
    onSendReport: function() {
    	var descrip = Ext.getCmp('divo-exceptiondialog-description').getValue()
    	if (!descrip) {
    		this.say("请先输入有关异常的描述信息。")
    		return
    	}
    	Ext.MessageBox.wait("正在发送...", '请稍候');
    	var item = {
    		userName : this.getAppContext().user.name,
    		userFullName : this.getAppContext().user.fullName,
    		descrip : descrip
    	}
    	var f = function(item) {
    		Ext.Ajax.request({
    			scope : this,
    			url : "/exception/report",
    			async : true,		
    			method : 'POST',
    			jsonData : item, 
    			success : function(response, options) {
			    	Ext.MessageBox.hide();
			    	this.say("报告发送完毕。")
    			},
    			failure : function(response, options) {
			    	Ext.MessageBox.hide();
			    	this.say("报告发送失败。")
    			}
    		})
    	}
    	f.defer(100,this,[item])
    }
});
//EOP
;/**
 * Thanks: http://extjs.com/forum/showthread.php?t=20662
 */
Ext.ux.MaximizeTool = function() {
	this.init = function(ct) {
		var maximizeTool = {
			id : 'maximize',
			handler : handleMaximize,
			scope : ct,
			qtip : '最大化'
		};
		ct.tools = ct.tools || [];
		var newTools = ct.tools.slice();
		ct.tools = newTools;
		for (var i = 0, len = ct.tools.length;i < len; i++) {
			if (ct.tools[i].id == 'maximize') {
				return;
			}
		} //避免重复添加
		var hasAdded = false
		for (var i = 0, len = ct.tools.length;i < len; i++) {
			if (ct.tools[i].id == 'close') {
				ct.tools[ct.tools.length] = ct.tools[i]
				ct.tools[i] = maximizeTool
				hasAdded = true
				break
			} //让close在最后
		}
		if (!hasAdded)
		    ct.tools[ct.tools.length] = maximizeTool //放在最后
	}

	function handleMaximize(event, toolEl, panel) {
		panel.originalOwnerCt = panel.ownerCt;
		panel.originalPosition = panel.ownerCt.items.indexOf(panel);
		panel.originalSize = panel.getSize();

		if (!toolEl.window) {
			var defaultConfig = {
				id : (panel.getId() + '-MAX'),
				width : (Ext.getBody().getSize().width - 100),
				height : (Ext.getBody().getSize().height - 100),
				resizable : true,
				draggable : true,
				closable : true,
				closeAction : 'hide',
				hideBorders : true,
				plain : true,
				layout : 'fit',
				autoScroll : false,
				border : false,
				bodyBorder : false,
				frame : true,
				pinned : true,
				bodyStyle : 'background-color: #ffffff;'
			};
			toolEl.window = new Ext.Window(defaultConfig);
			toolEl.window.on('hide', handleMinimize, panel);
		}
		if (!panel.dummyComponent) {
			var dummyCompConfig = {
				title : panel.title,
				width : panel.getSize().width,
				height : panel.getSize().height,
				html : '&nbsp;'
			};
			panel.dummyComponent = new Ext.Panel(dummyCompConfig);
		}

		toolEl.window.add(panel);
		//if (panel.tools['toggle'])
		//	panel.tools['toggle'].setVisible(false);
		if (panel.tools['close'])
			panel.tools['close'].setVisible(false);
		panel.tools['maximize'].setVisible(false);

		panel.originalOwnerCt.insert(panel.originalPosition,
				panel.dummyComponent);
		panel.originalOwnerCt.doLayout();
		panel.dummyComponent.setSize(panel.originalSize);
		panel.dummyComponent.setVisible(true);
		//panel.dummyComponent.getEl().mask('已被最大化');
		toolEl.window.show(this);
	};

	function handleMinimize(window) {
		//this.dummyComponent.getEl().unmask();
		this.dummyComponent.setVisible(false);
		this.originalOwnerCt.insert(this.originalPosition, this);
		this.originalOwnerCt.doLayout();
		this.setSize(this.originalSize);
		this.tools['maximize'].setVisible(true);
		//if (this.tools['toggle'])
		//	this.tools['toggle'].setVisible(true);
		if (this.tools['close'])
			this.tools['close'].setVisible(true);
	}

};

// EOP
;/**
 * 门户类
 * 
 * Thanks: http://www.dnexlookup.com/
 */
Ext.ux.Portal = Ext.extend(Ext.Panel, {
	layout : 'column',
	//autoScroll : true,
	cls : 'x-portal',
	defaultType : 'portalcolumn',
	portlets : {},
	portalViewId : null,
	initComponent : function() {
		Ext.ux.Portal.superclass.initComponent.call(this)
		this.addEvents({
			validatedrop : true,
			beforedragover : true,
			dragover : true,
			beforedrop : true,
			drop : true,
			portletchanged : true
		})
	},
	initEvents : function() {
		Ext.ux.Portal.superclass.initEvents.call(this)
		this.dd = new Ext.ux.Portal.DropZone(this, this.dropConfig)
	},
	addPortlet : function(pInfo, pTools, portletDefinition, colAt) {
		var config = {
			autoCreate : true,
			tools : pTools,
			title : pInfo.text,
			height : pInfo.height,
			autoScroll : pInfo.autoScroll
		}
		if (portletDefinition.hbuttons) {
		    if (portletDefinition.maximizable || portletDefinition.maximizable==undefined)
			    Ext.apply(config,{
				   plugins : [new Ext.ux.MaximizeTool(),new Ext.ux.plugins.HeaderButtons()],
				   hbuttons: portletDefinition.hbuttons
			    })
			else    
			    Ext.apply(config,{
				   plugins : new Ext.ux.plugins.HeaderButtons(),
				   hbuttons: portletDefinition.hbuttons
			    })
		} else {
		    if (portletDefinition.maximizable || portletDefinition.maximizable==undefined)
			    Ext.apply(config,{
				   plugins : new Ext.ux.MaximizeTool()
			    })
		}				    
		if (portletDefinition.xtype) {
			var xtypeConfig = {
				id : portletDefinition.id,
				xtype : portletDefinition.xtype
			}
			if (portletDefinition.config) {
				Ext.apply(xtypeConfig,portletDefinition.config)
			}
			Ext.apply(config, {
				layout : 'fit',
				items : [xtypeConfig]
			})
		} else {
			var url = portletDefinition.url
			if (url.startsWith("/"))
			    url = url + (url.indexOf('?')>0?"&":"?")+"auth="+Ext.Ajax.defaultHeaders.Authorization
			var xtypeConfig = {
				id : portletDefinition.id,
				xtype : 'iframepanel',
				defaultSrc : url
			}
			if (portletDefinition.config) {
				Ext.apply(xtypeConfig,portletDefinition.config)
			}
			Ext.apply(config, {
				layout : 'fit',
				items : [xtypeConfig]
			})
		}
		
		var p = new Ext.ux.Portlet(config)
		p.pInfo = pInfo
		this.portlets[pInfo.id] = p

		var col = this.items.itemAt(0) // 第1列
		if (colAt != undefined) {
			col = this.items.itemAt(colAt)
			if (col.columnWidth == 0.01) {
				col = this.items.itemAt(0)
			}
		}
		//col.add(p)
		col.insert(0,p)
		p.pClmn = col
		
		return p
	},
	removePortlet : function(id) {
		var p = this.portlets[id]
		if (p) {
			p.pClmn.remove(p, true)
			delete this.portlets[id]
		}
	},
	removeAllPortlets : function() {
		for (var i = 0; i < this.items.length; i++) {
			var c = this.items.itemAt(i)
			if (c.items)
				for (var j = c.items.length - 1; j >= 0; j--) {
					c.remove(c.items.itemAt(j), true)
				}
		}
		this.portlets = {}
	},
	getAllPortlets : function() {
		var retVal = []
		for (var i = 0; i < this.items.length; i++) {
			var c = this.items.itemAt(i)
			if (c.items)
				for (var j = c.items.length - 1; j >= 0; j--) {
					retVal.push(c.items.itemAt(j))
				}
		}
		return retVal
	},
	getPortlet : function(id) {
		return this.portlets[id]
	},
	setColNum : function(colNum) {
		var cs = this.items
		var colWidth = 0.25
		if (colNum == 1) {
			colWidth = 0.97
		} else if (colNum == 2) {
			colWidth = 0.49
		} else if (colNum == 3) {
			colWidth = 0.33
		}

		for (var i = 0; i < colNum; i++) {
			this.items.itemAt(i).columnWidth = colWidth
		}
		for (var i = colNum; i < this.items.length; i++) {
			this.items.itemAt(i).columnWidth = 0.01
		}
	},
	// 恢复门户状态
	restorePortlets : function(colNumChanged) {
		var result, pConfig
		if (colNumChanged == undefined) {
			divo.restoreProfile(function(retValue) {
				result = retValue
			}, divo.getUserId(), this.portalViewId + '-layout')
			if (result) {
				var s = new Ext.state.Provider()
				pConfig = s.decodeValue(result.msgValue)
			} // 获取布局内容
		} // 改变列数时不用记忆的布局

		var portlets = this.portalState.getVisiblePortlets()
		if (!portlets) {
			return
		}	

		this.removeAllPortlets()
		this.setColNum(this.portalState.getColNum())
		var ps = []
		for (var i = 0; i < portlets.length && i < 9; i++) {
			var p = portlets[i]
			if (p && p.id) {
				ps.push(p)
			}
		}
		ps = this.showPortlets(ps, pConfig)
		this.doLayout()
		//this.portalState.restoreCollapseState(ps)
	},
	// 按指定布局显示多个Portlet
	showPortlets : function(pInfos, pConfig) {
		var ps = []
		if (pConfig) {
			for (var c = 0; c < this.columnCount; c++) {
				for (var s = 0; s < pConfig[c].length; s++) {
					var p = pConfig[c][s]
					if (!p)
						continue
					for (var i = 0; i < pInfos.length; i++) {
						if (pInfos[i].id == p.id) {
							var col = this.items.itemAt(c)
							if (col.columnWidth == 0.01)
								ps.push(this.showPortlet(pInfos[i], 0))
							else
								ps.push(this.showPortlet(pInfos[i], c))
						}
					}
				} // 某列中所有portlet循环
			} // 列循环
		} else {
			for (var i = 0; i < pInfos.length; i++) {
				ps.push(this.showPortlet(pInfos[i], 0))
			} // 调整列数后
		}

		return ps
	},
	// 显示单个Portlet
	showPortlet : function(pInfo,colAt) {
		var pd = this.getPortletDefinition(pInfo.id)
		if (!pd) return  //程序变动后，记忆的定义可能已经改变
		
		var me = this
		var pTools = []
		if (pd.closable!=false && (pd.closable==undefined || pd.closable)) {
	    	pTools = [{
				id : 'close',
				handler : function(e, target, panel) {
					panel.ownerCt.remove(panel, true)
					me.fireEvent("portletchanged",panel.pInfo.id,false)
					me.portalState.save()
				}
			}]
		}	
		var h = this.portalState.getHeight(pInfo.id)
		var p = this.addPortlet({
			id : pInfo.id,
			text : pInfo.text,
			autoScroll : pd.autoScroll==true,
			height : h || 200
		}, pTools, pd, colAt)
		
		this.fireEvent("portletchanged",pInfo.id,true)

		p.on("resize", function() {
			this.portalState.save()
		},this)

		return p
	},
	getPortletDefinition : function(id) {
		for (var i = 0; i < this.portletDefinitions.length; i++) {
			if (this.portletDefinitions[i].id == id)
				return this.portletDefinitions[i]
		}
	},
	setPortletDefinition : function(defs) {
		this.portletDefinitions = defs
	},
	setPortalState : function(ps) {
		this.portalState = ps
	},
	setPortalViewId : function(id) {
		this.portalViewId = id
	}

})

Ext.reg('portal', Ext.ux.Portal)
// EOP
;/**
 * 定义 portalcolumn 布局
 */
Ext.ux.PortalColumn = Ext.extend(Ext.Container, {
	layout : 'anchor',
	autoEl : 'div',
	defaultType : 'portlet',
	cls : 'x-portal-column'
});
Ext.reg('portalcolumn', Ext.ux.PortalColumn);
;/**
 * 门户拖动支持类
 */
Ext.ux.Portal.DropZone = function(portal, cfg) {
	this.portal = portal;
	Ext.dd.ScrollManager.register(portal.body);
	Ext.ux.Portal.DropZone.superclass.constructor.call(this, portal.bwrap.dom,
			cfg);
	portal.body.ddScrollConfig = this.ddScrollConfig;
};

Ext.extend(Ext.ux.Portal.DropZone, Ext.dd.DropTarget, {
	ddScrollConfig : {
		vthresh : 50,
		hthresh : -1,
		animate : true,
		increment : 200
	},

	createEvent : function(dd, e, data, col, c, pos) {
		return {
			portal : this.portal,
			panel : data.panel,
			columnIndex : col,
			column : c,
			position : pos,
			data : data,
			source : dd,
			rawEvent : e,
			status : this.dropAllowed
		};
	},

	notifyOver : function(dd, e, data) {
		var xy = e.getXY(), portal = this.portal, px = dd.proxy;

		// case column widths
		if (!this.grid) {
			this.grid = this.getGrid();
		}

		// handle case scroll where scrollbars appear during drag
		var cw = portal.body.dom.clientWidth;
		if (!this.lastCW) {
			this.lastCW = cw;
		} else if (this.lastCW != cw) {
			this.lastCW = cw;
			portal.doLayout();
			this.grid = this.getGrid();
		}

		// determine column
		var col = 0, xs = this.grid.columnX, cmatch = false;
		for (var len = xs.length; col < len; col++) {
			if (xy[0] < (xs[col].x + xs[col].w)) {
				cmatch = true;
				break;
			}
		}
		// no match, fix last index
		if (!cmatch) {
			col--;
		}

		// find insert position
		var p, match = false, pos = 0, c = portal.items.itemAt(col), items = c.items.items;

		for (var len = items.length; pos < len; pos++) {
			p = items[pos];
			var h = p.el.getHeight();
			if (h !== 0 && (p.el.getY() + (h / 2)) > xy[1]) {
				match = true;
				break;
			}
		}

		var overEvent = this.createEvent(dd, e, data, col, c, match && p
				? pos
				: c.items.getCount());

		if (portal.fireEvent('validatedrop', overEvent) !== false
				&& portal.fireEvent('beforedragover', overEvent) !== false) {

			// make sure proxy width is fluid
			px.getProxy().setWidth('auto');

			if (p) {
				px.moveProxy(p.el.dom.parentNode, match ? p.el.dom : null);
			} else {
				px.moveProxy(c.el.dom, null);
			}

			this.lastPos = {
				c : c,
				col : col,
				p : match && p ? pos : false
			};
			this.scrollPos = portal.body.getScroll();

			portal.fireEvent('dragover', overEvent);

			return overEvent.status;;
		} else {
			return overEvent.status;
		}

	},

	notifyOut : function() {
		delete this.grid;
	},

	notifyDrop : function(dd, e, data) {
		delete this.grid;
		if (!this.lastPos) {
			return;
		}
		var c = this.lastPos.c, col = this.lastPos.col, pos = this.lastPos.p;

		var dropEvent = this.createEvent(dd, e, data, col, c, pos !== false
				? pos
				: c.items.getCount());

		if (this.portal.fireEvent('validatedrop', dropEvent) !== false
				&& this.portal.fireEvent('beforedrop', dropEvent) !== false) {

			dd.proxy.getProxy().remove();
			dd.panel.el.dom.parentNode.removeChild(dd.panel.el.dom);
			if (pos !== false) {
				c.insert(pos, dd.panel);
			} else {
				c.add(dd.panel);
			}

			c.doLayout();

			this.portal.fireEvent('drop', dropEvent);

			// scroll position is lost on drop, fix it
			var st = this.scrollPos.top;
			if (st) {
				var d = this.portal.body.dom;
				setTimeout(function() {
					d.scrollTop = st;
				}, 10);
			}

		}
		delete this.lastPos;
	},

	// internal cache of body and column coords
	getGrid : function() {
		var box = this.portal.bwrap.getBox();
		box.columnX = [];
		this.portal.items.each(function(c) {
			box.columnX.push({
				x : c.el.getX(),
				w : c.el.getWidth()
			});
		});
		return box;
	}
});
;/**
 * 定义 portlet 面板类型
 * 
 * Thanks: http://extjs.com/forum/showthread.php?t=18593
 */
Ext.ux.Portlet = Ext.extend(Ext.Panel, {
	anchor : '100%',
	frame : true,
	//autoScroll : true,
	hideMode : 'visibility',
	collapsible : true,
	draggable : true,
	cls : 'x-portlet',
	hideCollapseTool : false, 

	onRender : function(ct, position) {
		Ext.ux.Portlet.superclass.onRender.call(this, ct, position)

		this.resizer = new Ext.Resizable(this.el, {
			animate : true,
			duration : .6,
			easing : 'backIn',
			handles : 's',
			minHeight : this.minHeight || 100,
			pinned : false
		})
		this.resizer.on("resize", this.onResizer, this)
	},
	onResizer : function(oResizable, iWidth, iHeight, e) {
		this.setHeight(iHeight)
	},
	onCollapse : function(doAnim, animArg) {
		var o = {
			userId : this.getUserId(),
			msgCode : this.pInfo.id + '-collapsed',
			msgValue : 'Y'
		}
		divo.saveProfileAsync(o)

		this.el.setHeight("") // remove height set by resizer
		Ext.ux.Portlet.superclass.onCollapse.call(this, doAnim, animArg)
	},
	onExpand : function(doAnim, animArg) {
		var o = {
			userId : this.getUserId(),
			msgCode : this.pInfo.id + '-collapsed',
			msgValue : 'N'
		}
		divo.saveProfileAsync(o)

		Ext.ux.Portlet.superclass.onExpand.call(this, doAnim, animArg)
	},
	getConfig : function() {
		return {
			id : this.pInfo.id
		}
	}

})
Ext.reg('portlet', Ext.ux.Portlet)
//EOP
;// Thanks: http://extjs.com/forum/showthread.php?t=25042
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
;/**
 * 门户状态管理
 */
Ext.ux.PortalState = function() {
	// -------------------- private 属性 ------------------
	var s = new divo.StateProvider({stateOn:true})
	var sm = s
	var stateId, portal, portalId,portalViewId
	var canSave = true

	// -------------------- private 方法 ------------------
	// 状态保存
	function saveState() {
		if (!canSave) return
		
		// 记忆布局
		var config
		try {
			config = portal.getConfig()
		} catch (e) {
			config = null
		} // 最大化时出错，避免保存
		if (!config)
			return

		divo.saveProfileAsync({
			userId : divo.getUserId(),
			msgCode : portalViewId + '-layout',
			msgValue : s.encodeValue(config)
		})

		// 记忆打开的portlet
		var portletInfos = [];
		var portlets = [];
		var colNum = portal.items.length;
		var rowIndex = 0;
		while (true) {
			var bFound = false;
			for (var i = 0; i < colNum; i++) {
				var p = portal.items.itemAt(i).items.itemAt(rowIndex);
				if (p && p.pInfo && p.pInfo.id) {
					portletInfos.push(p.pInfo)
					portlets.push(p);
					bFound = true;
				}
			}
			if (!bFound) {
				break;
			}
			rowIndex++;
		}

		if (portletInfos.length > 0)
			sm.set(stateId, portletInfos);

		// 记忆高度
		for (var i = 0; i < portlets.length; i++) {
			if (portlets[i].lastSize) {
				var h = portlets[i].lastSize.height;
				var sid = portletInfos[i].id+'-h'
				if (h)
					sm.set(sid, h);
			}
		}
	}

	// 获取保存的门户列数
	function getColNum() {
		var result
		divo.restoreProfile(function(retValue) {
			result = retValue;
		}, divo.getUserId(), portalViewId + '-column-num')

		if (result && result.msgValue)
			return parseInt(result.msgValue)
		else
			return 1
	}

	// 记忆门户列数
	function saveColNum(colNum) {
		divo.saveProfileAsync({
			userId : divo.getUserId(),
			msgCode : portalViewId + '-column-num',
			msgValue : colNum
		})
	}

	// -------------------- public 方法 ------------------
	return {
		/**
		 * 初始化
		 */
		init : function(_portalId,_portalViewId) {
			portalId = _portalId
			stateId = _portalViewId+"-state"
			portalViewId = _portalViewId
			portal = Ext.getCmp(portalId)
		},
		/**
		 * 保存门户状态
		 */
		save : function() {
			saveState()
		},
		/**
		 * 取得可见的门户
		 */
		getVisiblePortlets : function() {
			return sm.get(stateId);
		},
		/**
		 * 取得保存的高度
		 */
		getHeight : function(portletId) {
			return sm.get(portletId+'-h')
		},
		/**
		 * 获取保存的门户列数
		 */
		getColNum : function() {
			return getColNum()
		},
		/**
		 * 记忆门户列数
		 */
		saveColNum : function(colNum) {
			saveColNum(colNum)
		},
		/**
		 * 恢复门户的收缩状态
		 */
		restoreCollapseState : function(ps) {
			var result
			for (var i = 0; i < ps.length; i++) {
				if (ps[i]) {
					divo.restoreProfile(function(retValue) {
						result = retValue
					}, divo.getUserId(), ps[i].pInfo.id + '-collapsed')
					if (result && result.msgValue == 'Y') {
						ps[i].collapse()
					}
				}
			}
		},
		/**
		 * 可以暂时禁止保存状态
		 */
		setCanSave : function(s) {
			canSave = s
		}

	}
}
// EOP

;/**
 * 门户管理器
 * 
 * config:
 * {String} portalId 门户标识
 * {String} portalViewId 门户状态标识，如果没有定义，则等于门户标识
 * {Array} portletDefinitions 门户小窗口定义数组
 * {Boolean} barAlignLeft 真表示左对齐（默认为假，表示右对齐）
 * {Boolean} barContentMenuVisible 真表示显示内容选择下拉菜单（默认为假）
 * {Boolean} showPromptWhenInit 真表示初始化时提示正在加载（默认为真）
 */
Ext.ux.PortalManager = function(config) {
	var hasTbar = false
	var canSaveState = false
	
	var portalViewId = config.portalViewId==undefined?config.portalId:config.portalViewId
	var portalId = config.portalId
	var portletDefinitions = config.portletDefinitions
	var barContentMenuVisible = config.barContentMenuVisible==undefined?false:config.barContentMenuVisible
	var showPromptWhenInit = config.showPromptWhenInit==undefined?true:config.showPromptWhenInit
	
	// ----------------- 私有属性 ----------------------
	var colNumCombo, portletMenu
	var portalState, portal
	var msg

	// ----------------- 私有方法 ----------------------
	// 在portletDefinitions中添加前缀
	function adjustPortletDefinitions() {
		for (var i = 0; i < portletDefinitions.length; i++) {
			portletDefinitions[i].id = portalViewId + '-' + portletDefinitions[i].id
			portletDefinitions[i].closable = hasTbar
		}
	}

	// 创建门户管理用工具条控件
	function createToolbar() {
		var tb = []
		
		if (!barContentMenuVisible)
			for (var i = 0; i < portletDefinitions.length; i++) {
				tb.push({
					text : '<span>'+portletDefinitions[i].text+'</span>',
					icon : portletDefinitions[i].icon,
					cls : 'x-btn-text-icon',
					handler : onShowPortlet
				})
			}
		
		if (!config.barAlignLeft)
			tb.push('->')

		portletMenu = new Ext.ux.ColumnMenu({
        	columnHeight: 100,
        	columnWidth: 148,
			id : portalId + 'menu',
			items : getPortletMenuItems()
		})
		tb.push({
			text : '<span>内容选择...</span>',
			menu : portletMenu,
			hidden : !barContentMenuVisible
		})
		tb.push({
			text : '<span>栏目数</span>'
		})

		colNumCombo = new Ext.form.ComboBox({
			store : [[1, '1'], [2, '2'], [3, '3'], [4, '4']],
			typeAhead : true,
			width : 40,
			triggerAction : 'all',
			editable : false,
			selectOnFocus : true
		})

		tb.push(colNumCombo)
		return tb
	}

	// 生成内容菜单项
	function getPortletMenuItems() {
		var items = []
		for (var i = 0; i < portletDefinitions.length; i++) {
			items.push({
				text : portletDefinitions[i].text,
				hideOnClick:false,
				checked : false,
				checkHandler : onItemCheck
			})
		}
		return items
	}

	// 选择内容菜单项时
	function onItemCheck(item, checked) {
		var portletId = getPortletId(item.text)
		if (!checked) {
			portal.removePortlet(portletId);
			portal.doLayout();
		} else {
			var p = portal.showPortlet({
				text : item.text,
				id : portletId,
				checked : true
			});
			portal.doLayout();
			//portalState.restoreCollapseState([p]);
		}
		portalState.save()
		
		onRefresh(msg)   //刚显示就要刷新
	}
	
	//点击工具条上的按钮时（直接显示portlet，并最大化)
	function onShowPortlet(btn,e) {
		showPortletAndGoTop(btn.text.replace('<span>','').replace('</span>',''))
		onRefresh(msg)   //刚显示就要刷新
	}

	// 门户窗口关闭时, 设置相应的菜单项复选框状态
	function onPortletChanged(portletId, checked, suppressEvent) {
		if (suppressEvent==undefined)
		    suppressEvent = true
		var index = getItemIndex(portletId)
		if (index && portletMenu && portletMenu.items.itemAt(index))
			portletMenu.items.itemAt(index).setChecked(checked, suppressEvent)
	}

	// 栏目数改变时
	function onColNumChanged(o) {
		var colNum = o.getValue()
		if (colNum != portalState.getColNum()) {
			Ext.getBody().mask('','x-mask-loading')
			var f = function() {
				portalState.saveColNum(colNum)
				portal.restorePortlets(true)
				Ext.getBody().unmask()
				onRefresh(msg)   //刚显示就要刷新
			}
			f.defer(100,this)
		}
	}

	//通过名称获取id
	function getPortletId(text) {
		for (var i = 0; i < portletDefinitions.length; i++) {
			if (portletDefinitions[i].text == text)
				return portletDefinitions[i].id
		}
	}

	//通过id获取名称
	function getPortletText(id) {
		for (var i = 0; i < portletDefinitions.length; i++) {
			if (portletDefinitions[i].id == id)
				return portletDefinitions[i].text
		}
	}
	
	//通过id获得索引号
	function getItemIndex(id) {
		for (var i = 0; i < portletDefinitions.length; i++) {
			if (portletDefinitions[i].id == id)
				return [i]
		}
	}

	//刷新门户窗口内容
	function onRefresh(_msg) {
		if (!portal) return
		if (!_msg) return
		
		msg = _msg
		var portlets = portal.getAllPortlets()
        for (var i = 0; i < portlets.length; i++) {
        	var p = portlets[i]
        	if (p.items) {
        		var o = p.items.items[0]
        	    if (o.showList)
        	        o.showList(msg.id,msg)
        	    else if (o.showContent)
        	        o.showContent(msg.id,msg)
        	}
        }
	}

	//驱动门户窗口做某种操作
	function onCustomAction(_msg) {
		if (!_msg) return
		
		msg = _msg
		var portlets = portal.getAllPortlets()
        for (var i = 0; i < portlets.length; i++) {
        	var p = portlets[i]
        	if (p.items) {
        		var o = p.items.items[0]
        	    if (o.doCustomAction)
        	        o.doCustomAction(msg)
        	}
        }
	}
	
	//将预定义门户视图状态变成当前用户的初始门户状态
	function setDefaultPortalState() {
		Ext.Ajax.request({
			scope : this,
			url : "/portalviews/"+portalViewId+"/"+divo.getUserId(),
			async : false,
			method : 'PUT',
			jsonData : {aa:1}
		});
	}
	
	//显示portlet并可立即最大化
	function showAndMaximizePortlet(title) {
		Ext.getBody().mask('','x-mask-loading')
		var portletId = getPortletId(title)
		onPortletChanged(portletId,true,false)
		
		var f = function() {
			var portlet = Ext.getCmp(portletId)
			if (portlet) {
				var tool = portlet.ownerCt.tools['maximize']
				var listeners = Ext.lib.Event.getListeners(tool.dom)
				for (var i = 0; i < listeners.length; ++i) {
					if (listeners[i].type=='click') {
						listeners[i].fn(null,tool.dom,portlet)
					}
				}
			}
			Ext.getBody().unmask()			
		}
		f.defer(500,this)
	}
	
	//将portlet显示在左上角位置
	function showPortletAndGoTop(title) {
		Ext.getBody().mask('','x-mask-loading')
		var portletId = getPortletId(title)
		
		var f = function() {
			var portlet = Ext.getCmp(portletId)
			if (portlet) {
				var tool = portlet.ownerCt.tools['close']
				if (tool) {
					var listeners = Ext.lib.Event.getListeners(tool.dom)
					for (var i = 0; i < listeners.length; ++i) {
						if (listeners[i].type=='click') {
							listeners[i].fn(null,tool.dom,portlet)
						}
					}
				}
			} //先关闭
			onPortletChanged(portletId,true,false)
			Ext.getBody().unmask()			
		}
		f.defer(500,this)
	}
	
	// -------------------- public方法 -----------------------
	return {
		/**
		 * 初始化
		 */
		init : function() {
			var canSaveState = hasTbar
			
			if (showPromptWhenInit)
				divo.say("正在加载，请稍候...")
				
			var f = function() {
				portalState = new Ext.ux.PortalState()
				portalState.init(portalId,portalViewId)
	
				var v = portalState.getColNum()
				if (colNumCombo) {
					colNumCombo.on("select",onColNumChanged,this)
					colNumCombo.setValue(v)
				}
				
				adjustPortletDefinitions()
				
				portal = Ext.getCmp(portalId)
				portal.setPortletDefinition(portletDefinitions)
				portal.setPortalState(portalState)
				portal.setPortalViewId(portalViewId)
	
				portal.on('portletchanged', onPortletChanged, this)
				
				portalState.setCanSave(false)
				setDefaultPortalState()
				portal.restorePortlets()
				portalState.setCanSave(canSaveState)
			}
			f.defer(showPromptWhenInit?1000:100,this)
		},
		getTbar : function() {
			hasTbar = true
			return new Ext.Toolbar({
				cls: 'go-paging-tb',
				items: createToolbar()
			})
		},
		onRefresh : function(msg) {
			onRefresh(msg)
		},
		onCustomAction : function(msg) {
			onCustomAction(msg)
		},
		saveState : function() {
			portalState.save()
		},
		/**
		 * 显示指定标题的门户小窗口并将其最大化
		 * TODO: 非弹出窗口最大化，改变tab后会消失，暂时只将portlet显示再左上角位置
		 * {String} title 通过该标题找到要显示的portlet
		 */
		showPortlet : function(title) {
			showPortletAndGoTop(title)
		}
	}
}
// EOP

;/**
 * 按需加载JS文件
 * Thanks: http://www.qudee.com/as_bb51d59a62b8ef9ce5cf54053bee94f2.html
 */
divo.utils.JsLoader = function() {
	
	this.load = function(url,fireOnSuccess) {
		// 获取所有的<script>标记
		var ss = document.getElementsByTagName("script");
		// 判断指定的文件是否已经包含，如果已包含则触发onsuccess事件并返回
		for (i = 0;i < ss.length; i++) {
			if (ss[i].src && ss[i].src.indexOf(url) != -1) {
				if (fireOnSuccess)
				    setTimeout(this.onSuccess,500)
				return;
			}
		}
		// 创建script结点,并将其属性设为外联JavaScript文件
		s = document.createElement("script");
		s.type = "text/javascript";
		s.src = url;
		// 获取head结点，并将<script>插入到其中
		var head = document.getElementsByTagName("head")[0];
		head.appendChild(s);

		// 获取自身的引用
		var self = this;
		// 对于IE浏览器，使用readystatechange事件判断是否载入成功
		// 对于其他浏览器，使用onload事件判断载入是否成功
		// s.onload=s.onreadystatechange=function(){
		s.onload = s.onreadystatechange = function() {
			// 在此函数中this指针指的是s结点对象，而不是JsLoader实例,
			// 所以必须用self来调用onsuccess事件，下同。
			if (this.readyState && this.readyState == "loading")
				return;
		    if (fireOnSuccess) {
			    setTimeout(self.onSuccess,500); //js加载后执行函数体需要时间
		    }    
		}
		s.onerror = function() {
			head.removeChild(s);
			self.onFailure(url);
		}
	};
	// 定义载入成功事件
	this.onSuccess = function() {
		
	};
	// 定义失败事件
	this.onFailure = function(url) {
        alert(url+"载入失败！");
	};
}
// EOP
;/**
 * Base64 encode / decode http://www.webtoolkit.info/
 */
divo.utils.base64 = function() {
	// private property
	var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

	// private method for UTF-8 encoding
	var _utf8_encode = function(string) {
		string = string.replace(/\r\n/g, "\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}

		return utftext;
	};

	// private method for UTF-8 decoding
	var _utf8_decode = function(utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while (i < utftext.length) {
			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if ((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i + 1);
				string += String.fromCharCode(((c & 31) << 6)
						| (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i + 1);
				c3 = utftext.charCodeAt(i + 2);
				string += String.fromCharCode(((c & 15) << 12)
						| ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}

		return string;
	};

	return {
		// public method for encoding
		encode : function(input) {
			if (!input) input = ""
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;

			input = _utf8_encode(input);

			while (i < input.length) {
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);

				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;

				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}

				output = output + _keyStr.charAt(enc1)
						+ _keyStr.charAt(enc2) + _keyStr.charAt(enc3)
						+ _keyStr.charAt(enc4);
			}

			return output;
		},

		// public method for decoding
		decode : function(input) {
			if (!input) input = ""
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;

			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

			while (i < input.length) {
				enc1 = _keyStr.indexOf(input.charAt(i++));
				enc2 = _keyStr.indexOf(input.charAt(i++));
				enc3 = _keyStr.indexOf(input.charAt(i++));
				enc4 = _keyStr.indexOf(input.charAt(i++));

				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;

				output = output + String.fromCharCode(chr1);

				if (enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}
			}

			output = _utf8_decode(output);

			return output;
		}
	}
}()
//EOP

;/**
 * 检测并提示大写状态 
 * Thanks: http://17thdegree.com/wp/capslock.html
 */
divo.utils.CapsLock = function() {
	return {
		init : function() {
			var id = Ext.id();
			this.alertBox = Ext.DomHelper.append(document.body, {
				tag : 'div',
				style : 'width:10em',
				children : [{
					tag : 'div',
					style : 'text-align: center; background-color: black;color: white;',
					html : '现在是字母大写状态',
					id : id
				}]
			}, true);
			Ext.fly(id).boxWrap();
			this.alertBox.hide();

			var pwds = Ext.query("INPUT[type='password']");
			for (var i = 0;i < pwds.length; i++) {
				Ext.get(pwds[i].id)
						.on(
								'keypress',
								this.keypress.createDelegate(this, pwds[i],
										true), this);
			}
		},
		keypress : function(e, el) {
			var charCode = e.getCharCode();
			if ((e.shiftKey && charCode >= 97 && charCode <= 122)
					|| (!e.shiftKey && charCode >= 65 && charCode <= 90)) {
				this.showWarning(el);
			} else {
				this.hideWarning();
			}
		},
		showWarning : function(el) {
			var x = Ext.fly(el).getX();
			var width = Ext.fly(el).getWidth();
			var y = Ext.fly(el).getY();

			this.alertBox.setXY([x + width + 100, y]);
			this.alertBox.show();
		},
		hideWarning : function() {
			this.alertBox.hide();
		}
	}
	
}()
//EOP
	;/**
 * @singleton 
 * @class Ext.ux.util
 *
 * Contains utilities that do not fit elsewhere
 *
 * @author     Ing. Jozef Sakáloš
 * @copyright  (c) 2009, Ing. Jozef Sakáloš
 * @version    1.0
 * @date       30. January 2009
 * @revision   $Id: Ext.ux.util.js 620 2009-03-09 12:41:44Z jozo $
 *
 * @license
 * Ext.ux.util.js is licensed under the terms of
 * the Open Source LGPL 3.0 license.  Commercial use is permitted to the extent
 * that the code/component(s) do NOT become part of another Open Source or Commercially
 * licensed development library or toolkit without explicit permission.
 *
 * <p>License details: <a href="http://www.gnu.org/licenses/lgpl.html"
 * target="_blank">http://www.gnu.org/licenses/lgpl.html</a></p>
 *
 * @donate
 * <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
 * <input type="hidden" name="cmd" value="_s-xclick">
 * <input type="hidden" name="hosted_button_id" value="3430419">
 * <input type="image" src="https://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" 
 * border="0" name="submit" alt="PayPal - The safer, easier way to pay online.">
 * <img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1">
 * </form>
 */

Ext.ns('Ext.ux.util');

// {{{
/**
 * @param {String} s
 * @return {String} MD5 sum
 * Calculates MD5 sum of the argument
 * @forum   28460
 * @author  <a href="http://extjs.com/forum/member.php?u=13648">wm003</a>
 * @version 1.0
 * @date    20. March 2008
 *
 */
Ext.ux.util.MD5 = function(s) {
    var hexcase = 0;
    var chrsz = 8;

    function safe_add(x, y){
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }
    function bit_rol(num, cnt){
        return (num << cnt) | (num >>> (32 - cnt));
    }
    function md5_cmn(q, a, b, x, s, t){
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
    }
    function md5_ff(a, b, c, d, x, s, t){
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    function md5_gg(a, b, c, d, x, s, t){
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    function md5_hh(a, b, c, d, x, s, t){
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function md5_ii(a, b, c, d, x, s, t){
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    function core_md5(x, len){
        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;
        var a =  1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d =  271733878;
        for(var i = 0; i < x.length; i += 16){
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;
            a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
            d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
            b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
            d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
            c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
            d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
            d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);
            a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
            d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
            c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
            b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
            a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
            d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
            c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
            d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
            c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
            a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
            d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
            c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
            b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);
            a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
            d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
            b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
            d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
            c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
            d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
            c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
            a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
            d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
            b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);
            a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
            d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
            c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
            d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
            d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
            a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
            d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
            b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);
            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return [a, b, c, d];
    }
    function str2binl(str){
        var bin = [];
        var mask = (1 << chrsz) - 1;
        for(var i = 0; i < str.length * chrsz; i += chrsz) {
            bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
        }
        return bin;
    }
    function binl2hex(binarray){
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for(var i = 0; i < binarray.length * 4; i++) {
            str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) + hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
        }
        return str;
    }
    return binl2hex(core_md5(str2binl(s), s.length * chrsz));
};  
// }}}
// {{{
/**
 * Clone Function
 * @param {Object/Array} o Object or array to clone
 * @return {Object/Array} Deep clone of an object or an array
 * @author Ing. Jozef Sakáloš
 */
Ext.ux.util.clone = function(o) {
	if(!o || 'object' !== typeof o) {
		return o;
	}
	if('function' === typeof o.clone) {
		return o.clone();
	}
	var c = '[object Array]' === Object.prototype.toString.call(o) ? [] : {};
	var p, v;
	for(p in o) {
		if(o.hasOwnProperty(p)) {
			v = o[p];
			if(v && 'object' === typeof v) {
				c[p] = Ext.ux.util.clone(v);
			}
			else {
				c[p] = v;
			}
		}
	}
	return c;
}; // eo function clone
// }}}
// {{{
/**
 * Copies the source object properties with names that match target object properties to the target. 
 * Undefined properties of the source object are ignored even if names match.
 * This way it is possible to create a target object with defaults, apply source to it not overwriting 
 * target defaults with <code>undefined</code> values of source.
 * @param {Object} t The target object
 * @param {Object} s (optional) The source object. Equals to scope in which the function runs if omitted. That 
 * allows to set this function as method of any object and then call it in the scope of that object. E.g.:
 * <pre>
 * var p = new Ext.Panel({
 * &nbsp;	 prop1:11
 * &nbsp;	,prop2:22
 * &nbsp;	,<b>applyMatching:Ext.ux.util.applyMatching</b>
 * &nbsp;	// ...
 * });
 * var t = p.applyMatching({prop1:0, prop2:0, prop3:33});
 * </pre>
 * The resulting object:
 * <pre>
 * t = {prop1:11, prop2:22, prop3:33};
 * </pre>
 * @return {Object} Original passed target object with properties updated from source
 */
Ext.ux.util.applyMatching = function(t, s) {
	var s = s || this;
	for(var p in t) {
		if(t.hasOwnProperty(p) && undefined !== s[p]) {
			t[p] = s[p];
		}
	}
	return t;
}; // eo function applyMatching
// }}}

// conditional override
// {{{
/**
 * Same as {@link Ext#override} but overrides only if method does not exist in the target class
 * @member Ext
 * @param {Object} origclass
 * @param {Object} overrides
 */
Ext.overrideIf = 'function' === typeof Ext.overrideIf ? Ext.overrideIf : function(origclass, overrides) {
	if(overrides) {
		var p = origclass.prototype;
		for(var method in overrides) {
			if(!p[method]) {
				p[method] = overrides[method];
			}
		}
	}
};
// }}}

// RegExp
// {{{
/**
 * @class RegExp
 */
if('function' !== typeof RegExp.escape) {
	/**
	 * Escapes regular expression
	 * @param {String} s
	 * @return {String} The escaped string
	 * @static
	 */
	RegExp.escape = function(s) {
		if('string' !== typeof s) {
			return s;
		}
		return s.replace(/([.*+?\^=!:${}()|\[\]\/\\])/g, '\\$1');
	};
}
Ext.overrideIf(RegExp, {

	/**
	 * Clones RegExp object
	 * @return {RegExp} Clone of this RegExp
	 */
	 clone:function() {
		return new RegExp(this);
	} // eo function clone
});
// }}}

// Array
// {{{
Ext.overrideIf(Array, {
	// {{{
	/**
	 * One dimensional copy. Use {@link Ext.ux.util#clone Ext.ux.util.clone} to deeply clone an Array.
	 * @member Array
	 * @return {Array} New Array that is copy of this
	 */
	 copy:function() {
		var a = [];
		for(var i = 0, l = this.length; i < l; i++) {
			a.push(this[i]);
		}
		return a;
	} // eo function copy
	// }}}
	// {{{
	/**
	 * Not used anyway as Ext has its own indexOf
	 * @member Array
	 * @return {Integer} Index of v or -1 if not found
	 * @param {Mixed} v Value to find indexOf
	 * @param {Integer} b Starting index
	 */
	,indexOf:function(v, b) {
		for(var i = +b || 0, l = this.length; i < l; i++) {
			if(this[i] === v) { 
				return i; 
			}
		}
		return -1;
	} // eo function indexOf
	// }}}
	// {{{
	/**
	 * Returns intersection of this Array and passed arguments
	 * @member Array
	 * @return {Array} Intersection of this and passed arguments
	 * @param {Mixed} arg1 (optional)
	 * @param {Mixed} arg2 (optional)
	 * @param {Mixed} etc. (optional)
	 */
	,intersect:function() {
		if(!arguments.length) {
			return [];
		}
		var a1 = this, a2, a;
		for(var k = 0, ac = arguments.length; k < ac; k++) {
			a = [];
			a2 = arguments[k] || [];
			for(var i = 0, l = a1.length; i < l; i++) {
				if(-1 < a2.indexOf(a1[i])) {
					a.push(a1[i]);
				}
			}
			a1 = a;
		}
		return a.unique();
	} // eo function intesect
	// }}}
	// {{{
	/**
	 * Returns last index of passed argument
	 * @member Array
	 * @return {Integer} Index of v or -1 if not found
	 * @param {Mixed} v Value to find indexOf
	 * @param {Integer} b Starting index
	 */
	,lastIndexOf:function(v, b) {
		b = +b || 0;
		var i = this.length; 
		while(i-- > b) {
			if(this[i] === v) { 
				return i; 
			}
		}
		return -1;
	} // eof function lastIndexOf
	// }}}
	// {{{
	/**
	 * @member Array
	 * @return {Array} New Array that is union of this and passed arguments
	 * @param {Mixed} arg1 (optional)
	 * @param {Mixed} arg2 (optional)
	 * @param {Mixed} etc. (optional)
	 */
	,union:function() {
		var a = this.copy(), a1;
		for(var k = 0, ac = arguments.length; k < ac; k++) {
			a1 = arguments[k] || [];
			for(var i = 0, l = a1.length; i < l; i++) {
				a.push(a1[i]);
			}
		}
		return a.unique();
	} // eo function union
	// }}}
	// {{{
	/**
	 * Removes duplicates from array
	 * @member Array
	 * @return {Array} New Array with duplicates removed
	 */
	,unique:function() {
		var a = [], i, l = this.length;
		for(i = 0; i < l; i++) {
			if(a.indexOf(this[i]) < 0) { 
				a.push(this[i]); 
			}
		}
		return a;
	} // eo function unique
	// }}}

});
// }}}

// eof
;/* --------- 扩展 JavaScript String 类 ------------- */
String.prototype.ltrim = function() {
	return this.replace(/(^\s*)/g, "");
}
String.prototype.rtrim = function() {
	return this.replace(/(\s*$)/g, "");
}
String.prototype.trim = function() {
	var re = /^\s+|\s+$/g;
	return function() {
		return this.replace(re, "");
	};
}();
String.prototype.ellipse = function(maxLength){
    if(this.length > maxLength){
        return this.substr(0, maxLength-3) + '...';
    }
    return this;
};

/**
 * String.pad(length: Integer, [substring: String = " "], [type: Integer = 0]):
 * String type: 0 = left, 1 = right and 2 = both sides
 */
String.prototype.pad = function(l, s, t) {
	return s || (s = " "), (l -= this.length) > 0 ? (s = new Array(Math.ceil(l
			/ s.length)
			+ 1).join(s)).substr(0, t = !t ? l : t == 1 ? 0 : Math.ceil(l / 2))
			+ this + s.substr(0, l - t) : this;
} // Thanks: http://snippets.dzone.com/posts/show/900

String.prototype.startsWith = function(s) {
	return this.indexOf(s) == 0;
}
String.prototype.endsWith = function(str) {
	return (this.match(str + "$") == str)
}
//Thanks: http://www.moon-soft.com/doc/38917.htm
String.prototype.getHzLength = function(){
	var arr = this.match(/[^\x00-\xff]/ig)
	return this.length+(arr==null?0:arr.length)
}
//Thanks: http://topic.csdn.net/t/20020419/14/660320.html
String.prototype.brkLine = function(charlen) {

	s = ""
	l = 0;
	p = 0;
	for (i = 0; i < this.length; i++) {
		a = this.charAt(i);
		s += a;
		if (p != 0) {
			if (a == ">")
				p = 0;
		} else {
			if (a != "<") {

				if (!/^[\x00-\xff]/.test(a))
					l++;
				l++;

				if (l >= charlen) {
					s += "<br />";
					l = 0;
				}
			} else if (this.substr(i, 4).toLowerCase() == "<br />") {
				s += "br>";
				i += 4;
				l = 0;
			} else
				p = 1;

		}
	}
	return s;
};
String.prototype.ellipse = function(maxLength,showDots){
    if(this.getHzLength() > maxLength){
		var s = this.brkLine(maxLength)
		return s.split('<br />')[0]+(showDots==undefined?'...':'')
    }
    return this;
};

//EOP
; /* global Ext */

 /*
    ext-basex 3.0
  ************************************************************************************

    Ext.lib.Ajax enhancements:
     - adds EventManager Support to Ext.lib.Ajax (if Ext.util.Observable is present in the stack)
     - adds Synchronous Ajax Support ( options.async =false )
     - Permits IE7 to Access Local File Systems using IE's older ActiveX interface
       via the forceActiveX property
     - Pluggable Form encoder (encodeURIComponent is still the default encoder)
     - Corrects the Content-Type Headers for posting JSON (application/json)
       and XML (text/xml) data payloads and sets only one value (per RFC)
     - Adds fullStatus:{ isLocal, proxied, isOK, isError, isTimeout, isAbort, error, status, statusText}
       object to the existing Response Object.
     - Adds standard HTTP Auth support to every request (XHR userId, password config options)
     - options.method prevails over any method derived by the lib.Ajax stack (DELETE, PUT, HEAD etc).
     - Adds named-Priority-Queuing for Ajax Requests
     - adds Script=Tag support for foreign-domains (proxied:true) with configurable callbacks.

  ************************************************************************************
  * Author: Doug Hendricks. doug[always-At]theactivegroup.com
  * Copyright 2007-2008, Active Group, Inc.  All rights reserved.
  ************************************************************************************

  License: ext-basex is licensed under the terms of : GNU Open Source GPL 3.0 license:

  Commercial use is prohibited without contacting licensing[at]theactivegroup.com.

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see < http://www.gnu.org/licenses/gpl.html>.

  * Donations are welcomed: http://donate.theactivegroup.com

  */


(function(){
var A = Ext.lib.Ajax;


A.Queue = function(config){

     config = config ? (config.name? config : {name:config}) :{} ;
     Ext.apply(this,config,
     {
        name     : 'q-default'
       ,priority : 5
       ,FIFO     : true //false implies LIFO
       ,callback : null //optional callback when queue is emptied
       ,scope    : null //scope of callback
       ,suspended: false
       ,progressive : false //if true, one queue item is dispatched per poll interval
      });
      this.requests = [];
      this.pending = false;
      //assert/resolve to 0-9
      this.priority = this.priority>9 ? 9 : (this.priority<0?0:this.priority );

};

Ext.extend(A.Queue, Object ,{

     add      : function(req){

        var permit = A.events? A.fireEvent('beforequeue', this, req) : true;
        if(permit !== false){
            this.requests.push(req);
            this.pending = true;
            A.pendingRequests++;
            if(this.manager){
               this.manager.start();
            }
        }
     }
    ,suspended : false
    ,activeRequest : null
    ,next     : function(){
        var req = this.requests[this.FIFO?'shift':'pop']();
        this.pending = !!this.requests.length;
        return req;
        }

    ,clear    : function(){
        this.requests.length = 0;
        this.pending = false;
        if(A.events){A.fireEvent('queueempty', this)};
        }
     // suspend/resume from dispatch control
    ,suspend  : function(){this.suspended = true;}
    ,resume   : function(){this.suspended = false;}
    ,requestNext : function(){
       var req;
       this.activeRequest = null;
       if(!this.suspended && (req = this.next())){
           A.pendingRequests--;
           this.activeRequest = req.active ? A.request.apply(A,req) : null;
           if(this.requests.length==0){

               //queue emptied callback
               if(this.callback)
                 {this.callback.call(this.scope||null,this);}
               this.clear();
           }

       }
       return this.activeRequest;
    }
 });


A.QueueManager = function(config){

    Ext.apply(this, config||{},
    {  quantas      : 10, //adjustable milliseconds deferred dispatch value
      priorityQueues: [[],[],[],[],[],[],[],[],[],[]], //iterable array (0-9) of prioritized queues:
       queues       :{}
    });
};


Ext.extend(A.QueueManager, Object,{

     getQueue     : function(name){ return this.queues[name]; }

    ,createQueue  : function(config){
        if(!config){return null;}

        var q = new A.Queue(config);
        q.manager = this;
        this.queues[q.name] = q;

        var pqa = this.priorityQueues[q.priority];
        if(pqa && pqa.indexOf(q.name)==-1){pqa.push(q.name);}

        return q;
     }
     //Remove a Queue by passed name or Queue Object reference
    ,removeQueue  : function(q){
        if(q && (q = this.getQueue(q.name||q) )){
            q.suspend();
            q.clear();  //purge any pending requests
            this.priorityQueues[q.priority].remove(q);
            delete this.queues[q.name];
        }
    }
    ,start   :function(){
        if(!this.started){
         this.started = true;
         this.dispatch();
        }
    }

    ,suspendAll : function(){
        forEach(this.queues, function(Q){ Q.suspend(); });
    }
    ,resumeAll : function(){
        forEach(this.queues, function(Q){ Q.resume(); });
        this.start();
    }


   /* Default Dispatch mode: progressive
    * false to exhaust a priority queue until empty during dispatch (sequential)
    * true to dispatch a single request from each priority queue until all queues exhausted.
    * This option may be set on the Queue itself as well.
    */
    ,progressive : false

    ,stop    :function(){ this.started = false; }

    /* main Request dispatch loop.  This keeps the maximum allowed number of requests
     * going at any one time (based on defined queue priority and dispatch mode (see progressive).
     */
    ,dispatch   : function(){
        var qm = this, qmq = qm.queues;
        var disp = function(qName){
             var q = qmq[qName];
             if(q && !q.suspended){
                 while(q.pending && !q.suspended && A.pendingRequests && A.activeRequests < A.maxConcurrentRequests){
                    q.requestNext();
                    if(q.progressive || qm.progressive){ break;} //progressive, take the first one off each queue only
                 }
                 //keep going?
                 return !!A.pendingRequests ? (A.activeRequests < A.maxConcurrentRequests) :false;
             }
        };

        Ext.each(this.priorityQueues ,function(queues){
            //queues == array of queue names
            if(!A.pendingRequests ){return false;}
            return Ext.each(queues||[],disp,this) === undefined?true:false;
        }, this);

        !!A.pendingRequests ? this.dispatch.defer(this.quantas,this): this.stop();

     }
});



Ext.apply( A ,
{

  queueManager      : new A.QueueManager(),

  //If true (or queue config object) ALL requests are queued
  queueAll          : false,

  //the Current number of active Ajax requests.
  activeRequests    : 0,

  //the Current number of pending Queued requests.
  pendingRequests   : 0,

  //Specify the maximum allowed during concurrent Queued browser (XHR) requests
  maxConcurrentRequests : 10,

  /* set True as needed, to coerce IE to use older ActiveX interface */
  forceActiveX      :false,

  /* Global default may be toggled at any time */
  async       :true,

  createXhrObject:function(transactionId)
        {
            var obj={  status:{isError:false}
                     , tId:transactionId}, http;
            try
            {
              if(Ext.isIE7 && !!this.forceActiveX){throw("IE7forceActiveX");}
              obj.conn= new XMLHttpRequest();
            }
            catch(eo)
            {
                for (var i = 0; i < this.activeX.length; ++i) {
                    try
                    {
                        obj.conn= new ActiveXObject(this.activeX[i]);

                        break;
                    }
                    catch(e) {
                    }
                }
            }
            finally
            {
                obj.status.isError = typeof(obj.conn) == 'undefined';
            }
            return obj;

        }

        /* Replaceable Form encoder */
    ,encoder : encodeURIComponent

    ,serializeForm : function(form) {
                if(typeof form == 'string') {
                    form = (document.getElementById(form) || document.forms[form]);
                }

                var el, name, val, disabled, data = '', hasSubmit = false;
                for (var i = 0; i < form.elements.length; i++) {
                    el = form.elements[i];
                    disabled = form.elements[i].disabled;
                    name = form.elements[i].name;
                    val = form.elements[i].value;

                    if (!disabled && name){
                        switch (el.type)
                                {
                            case 'select-one':
                            case 'select-multiple':
                                for (var j = 0; j < el.options.length; j++) {
                                    if (el.options[j].selected) {
                                        if (Ext.isIE) {
                                            data += this.encoder(name) + '=' + this.encoder(el.options[j].attributes['value'].specified ? el.options[j].value : el.options[j].text) + '&';
                                        }
                                        else {
                                            data += this.encoder(name) + '=' + this.encoder(el.options[j].hasAttribute('value') ? el.options[j].value : el.options[j].text) + '&';
                                        }
                                    }
                                }
                                break;
                            case 'radio':
                            case 'checkbox':
                                if (el.checked) {
                                    data += this.encoder(name) + '=' + this.encoder(val) + '&';
                                }
                                break;
                            case 'file':

                            case undefined:

                            case 'reset':

                            case 'button':

                                break;
                            case 'submit':
                                if(hasSubmit === false) {
                                    data += this.encoder(name) + '=' + this.encoder(val) + '&';
                                    hasSubmit = true;
                                }
                                break;
                            default:
                                data += this.encoder(name) + '=' + this.encoder(val) + '&';
                                break;
                        }
                    }
                }
                data = data.substr(0, data.length - 1);
                return data;
    }
    ,getHttpStatus: function(reqObj){

            var statObj = {
                     status:0
                    ,statusText :''
                    ,isError    :false
                    ,isLocal    :false
                    ,isOK       :false
                    ,error      :null
                    ,isAbort    :false
                    ,isTimeout  :false};

            try {
                if(!reqObj){throw('noobj');}
                statObj.status = reqObj.status;
                statObj.readyState = reqObj.readyState;
                statObj.isLocal = (!reqObj.status && location.protocol == "file:") ||
                          ( Ext.isSafari && reqObj.status === undefined);

                statObj.isOK = (
                    statObj.isLocal ||
                      (statObj.status == 304 || statObj.status == 1223 ||
                      (statObj.status > 199 && statObj.status < 300) )
                    );

                statObj.statusText = reqObj.statusText || '';
               } catch(e){} //status may not avail/valid yet (or called too early).

            return statObj;

     }
    ,handleTransactionResponse:function(o, callback, isAbort){

        callback = callback || {};
        var responseObject=null;
        this.activeRequests--;

        if(!o.status.isError){
            o.status = this.getHttpStatus(o.conn);
            /* create and enhance the response with proper status and XMLDOM if necessary */
            responseObject = this.createResponseObject(o, callback.argument, isAbort);
        }

        if(o.status.isError){
         /* checked again in case exception was raised - ActiveX was disabled during XML-DOM creation?
          * And mixin everything the XHR object had to offer as well
          */
           responseObject = Ext.apply({},responseObject||{},this.createExceptionObject(o.tId, callback.argument, (isAbort ? isAbort : false)));

        }

        responseObject.options = o.options;
        responseObject.fullStatus = o.status;

        if(!this.events || this.fireEvent('status:'+o.status.status ,o.status.status, o, responseObject, callback, isAbort) !== false){

             if (o.status.isOK && !o.status.isError) {
                if(!this.events || this.fireEvent('response',o, responseObject, callback, isAbort) !== false){
                    if (callback.success) {
                        callback.success.call(callback.scope||null,responseObject);
                    }
                }
             } else {
                  if(!this.events || this.fireEvent('exception',o ,responseObject, callback, isAbort) !== false){
                    if (callback.failure) {
                        callback.failure.call(callback.scope||null,responseObject);
                    }
                  }
             }
        }

        if(o.options.async){
            this.releaseObject(o);
            responseObject = null;
        }else{
            this.releaseObject(o);
            return responseObject;
        }

    },

    createResponseObject:function(o, callbackArg, isAbort){
        var obj = {responseXML   :null,
                   responseText  :'',
                   responseStream : null,
                   getResponseHeader : {},
                   getAllResponseHeaders : ''
                   };

        var headerObj = {},headerStr='';

        if(isAbort !== true){
            try{  //to catch bad encoding problems here
                obj.responseText = o.conn.responseText;
                obj.responseStream = o.conn.responseStream||null;
            }catch(e){
                o.status.isError = true;
                o.status.error = e;
            }

            try{
                obj.responseXML = o.conn.responseXML || null;
            } catch(ex){}

            try{
                headerStr = o.conn.getAllResponseHeaders()||'';
            } catch(ex1){}

            if((o.status.isLocal || o.proxied) && typeof obj.responseText == 'string' ){

               o.status.isOK = !o.status.isError && ((o.status.status = (!!obj.responseText.length)?200:404) == 200);

               if(o.status.isOK && (!obj.responseXML || (obj.responseXML && obj.responseXML.childNodes.length === 0))){

                    var xdoc=null;
                    try{   //ActiveX may be disabled
                        if(window.ActiveXObject){
                            xdoc=new ActiveXObject("MSXML2.DOMDocument.3.0");
                            xdoc.async=false;

                            xdoc.loadXML(obj.responseText);
                        }else{
                            var domParser=null;
                            try{  //Opera 9 will fail parsing non-XML content, so trap here.
                                domParser = new DOMParser();
                                xdoc = domParser.parseFromString(obj.responseText, 'application\/xml');
                            }catch(exP){}
                            finally{domParser = null;}
                        }
                    } catch(exd){
                        o.status.isError = true;
                        o.status.error = exd;
                    }
                    obj.responseXML = xdoc;
                }
                if(obj.responseXML){
                    var parseBad =  (obj.responseXML.documentElement && obj.responseXML.documentElement.nodeName == 'parsererror') ||
                                (obj.responseXML.parseError || 0) !== 0 ||
                                obj.responseXML.childNodes.length === 0;
                    if(!parseBad){
                        headerStr = 'Content-Type: ' + (obj.responseXML.contentType || 'text\/xml') + '\n' + headerStr ;
                    }
                }
            }
        } //isAbort?

        var header = headerStr.split('\n');
        for (var i = 0; i < header.length; i++) {
            var delimitPos = header[i].indexOf(':');
            if (delimitPos != -1) {
                headerObj[header[i].substring(0, delimitPos)] = header[i].substring(delimitPos + 2);
            }
        }
        o.status.proxied    = !!o.proxied;

        Ext.apply(obj,{
           tId                  : o.tId,
           status               : o.status.status,
           statusText           : o.status.statusText,
           getResponseHeader    : headerObj,
           getAllResponseHeaders: headerStr,
           fullStatus           : o.status
        });

        if (typeof callbackArg != 'undefined') {
            obj.argument = callbackArg;
        }

        return obj;
    },
    setDefaultPostHeader:function(contentType){
        this.defaultPostHeader = contentType;
    },

    setDefaultXhrHeader:function(bool){
        this.useDefaultXhrHeader = bool||false;
    },

    request : function(method, uri, cb, data, options) {

        options = Ext.apply({
               async    :this.async || false,
               headers  :false,
               userId   :null,
               password :null,
               xmlData  :null,
               jsonData :null,
               queue    :null,
               proxied  :false
               }, options||{});

        if(!this.events || this.fireEvent('request', method, uri, cb, data, options) !== false){

               //Named priority queues
               if((options.queue || (options.queue = this.queueAll||null))  && !options.queued){
                   var q = options.queue, qname = q.name || 'default', qm=this.queueManager;
                   q = qm.getQueue(qname) || qm.createQueue(q);
                   options.queue  = q;
                   options.queued = true;

                   var req= [method, uri, cb, data, options];
                   req.active=true;
                   q.add(req);

                   return { tId:this.transactionId++
                        ,queued: true
                        ,request:req
                        ,options:options
                        };
               }

               var hs = options.headers;
               if(hs){
                    for(var h in hs){
                        if(hs.hasOwnProperty(h)){
                            this.initHeader(h, hs[h], false);
                        }
                    }
               }
               var cType = this.headers['Content-Type']||null;
               //remove to ensure only ONE is passed later.(per RFC)
               delete this.headers['Content-Type'];
               if(options.xmlData){
                    cType || (cType = 'text/xml');
                    method = 'POST';
                    data = options.xmlData;
               } else if(options.jsonData){
                    cType || (cType = 'application/json');
                    method = 'POST';
                    data = typeof options.jsonData == 'object' ? Ext.encode(options.jsonData) : options.jsonData;
               }
               if(data){
                    cType || (cType = this.useDefaultHeader?this.defaultPostHeader:null );
                    if(cType){this.initHeader('Content-Type', cType , false );}
               }

                //options.method prevails over any derived method.
               return this.makeRequest(options.method || method, uri, cb, data, options);
        }
        return null;

    }
    ,getConnectionObject:function(uri, options)
        {
            var o,f,e=Ext.emptyFn;
            var tId = this.transactionId;

            try
            {
              if(f = options.proxied){ /*scriptTag Support */

                o = { tId: tId,
                      status  : {},
                      proxied : true,
                      conn: {
                          el            : null,
                          send          : function(){
                                var doc= (f.target||window).document, head = doc.getElementsByTagName("head")[0];
                                if(head && this.el){head.appendChild(this.el);}
                          },
                          abort             : function(){this.readyState = 0;},
                          setRequestHeader  : e,
                          getAllResponseHeaders: e,
                          onreadystatechange: null,
                          readyState        : 0,
                          status            : 0,
                          responseText      : null,
                          responseXML       : null
                       },
                       debug   : f.debug,
                       cbName  : f.callbackName  || 'basexCallback' + tId,
                       cbParam : f.callbackParam || null
                    };

                window[o.cbName] = o.cb = function(content,request){
                     this.responseText = !!content?content:null;

                     this.readyState = 4;
                     this.status     = !!content?200:404;

                     if(typeof this.onreadystatechange == 'function')
                        {this.onreadystatechange();}

                     if(!request.debug){
                         Ext.removeNode(this.el);
                         this.el = null;
                     }

                     window[request.cbName] = undefined;
                     try{delete window[request.cbName];}catch(ex){}


                }.createDelegate(o.conn,[o],true);

                o.conn.open = function(){
                   this.el= domNode(f.tag || 'script'
                                     ,{type :"text/javascript"
                                      , src :o.cbParam?uri + (uri.indexOf("?") != -1 ? "&" : "?") + String.format("{0}={1}", o.cbParam , o.cbName):uri
                                      }
                                     , null
                                     , f.target
                                     , true);

                   };

                o.conn.readyState = 1; //show CallInProgress
                if(typeof o.conn.onreadystatechange == 'function')
                    {o.conn.onreadystatechange();}

                options.async = true;  //force timeout support

              }else{
                o = this.createXhrObject(tId);
              }
              if (o) {
                   this.transactionId++;
              }
            }
            catch(ex3) {
            }
            finally
            {
                return o;
            }
    }
    ,makeRequest:function(method, uri, callback, postData, options){

        var o = this.getConnectionObject(uri ,options);

        if (!o || o.status.isError) {
                return Ext.apply(o,this.handleTransactionResponse(o, callback));
        } else {

                o.options = options;
                try{
                    o.conn.open(method.toUpperCase(), uri, options.async, options.userId, options.password);
                    o.conn.onreadystatechange=this.onReadyState ?
                           this.onReadyState.createDelegate(this,[o],0):Ext.emptyFn;
                } catch(ex){
                    o.status.isError = true;
                    o.status.error = ex;
                    return Ext.apply(o,this.handleTransactionResponse(o, callback));
                }
                this.activeRequests++;
                if (this.useDefaultXhrHeader) {
                    if (!this.defaultHeaders['X-Requested-With']) {
                    this.initHeader('X-Requested-With', this.defaultXhrHeader, true);
                    }
                }

                if (this.hasDefaultHeaders || this.hasHeaders) {
                    this.setHeader(o);
                }

                if(o.options.async){ //Timers for syncro calls won't work here, as it's a blocking call
                    this.handleReadyState(o, callback);
                }

                try{
                  if(!this.events || this.fireEvent('beforesend', o, method, uri, callback, postData, options) !== false){
                       o.conn.send(postData || null);
                  }
                } catch(exr){
                    o.status.isError = true;
                    o.status.error = exr;

                    return Ext.apply(o,this.handleTransactionResponse(o, callback));
                    }

                return options.async?o:Ext.apply(o,this.handleTransactionResponse(o, callback));
            }
    }

   ,abort:function(o, callback, isTimeout){

            if(o && o.queued && o.request){
                o.request.active = o.queued = false;
                if(this.events){
                    this.fireEvent('abort', o, callback);
                }
            }
            else if (o && this.isCallInProgress(o)) {
                o.conn.abort();
                window.clearInterval(this.poll[o.tId]);
                delete this.poll[o.tId];
                if (isTimeout) {
                    delete this.timeout[o.tId];
                }

                o.status.isAbort = !(o.status.isTimeout = isTimeout||false);
                if(this.events){
                    this.fireEvent(isTimeout?'timeout':'abort', o, callback);
                }

                this.handleTransactionResponse(o, callback, true);

                return true;
            }
            else {
                return false;
            }
    }

    ,clearAuthenticationCache:function(url) {

       try{

         if (Ext.isIE) {
           // IE clear HTTP Authentication, (but ALL realms though)
           document.execCommand("ClearAuthenticationCache");
         }
         else {
           // create an xmlhttp object
           var xmlhttp;
           if( xmlhttp = new XMLHttpRequest()){
               // prepare invalid credentials
               xmlhttp.open("GET", url || '/@@' , true, "logout", "logout");
               // send the request to the server
               xmlhttp.send("");
               // abort the request
               xmlhttp.abort.defer(100,xmlhttp);
           }
         }
       } catch(e) {        // There was an error

       }
     }

});
 /* private --
 <script and link> tag support
 */
 var domNode = function(tag, attributes, callback, context, deferred){
        attributes = Ext.apply({},attributes||{});
        context || (context = window);

        var node = null, doc= context.document, head = doc.getElementsByTagName("head")[0];

        if(doc && head && (node = doc.createElement(tag))){
            for(var attrib in attributes){
                  if(attributes.hasOwnProperty(attrib) && attrib in node){
                      node.setAttribute(attrib, attributes[attrib]);
                  }
            }

            if(callback){
                var cb = (callback.success||callback).createDelegate(callback.scope||null,[callback],0);
                if(Ext.isIE){
                     node.onreadystatechange = function(){
                          if(/loaded|complete|4/i.test(String(this.readyState))){
                                 cb();
                          }
                      }.createDelegate(node);
                }else if(Ext.isSafari3 && tag == 'script'){
                    //has DOM2 support
                    node.addEventListener("load", cb );
                }else if(Ext.isSafari) {
                    cb.defer(50);
                }else{
                    /* Gecko/Safari has no event support for link tag
                       so just defer the callback 50ms (optimistic)
                    */
                    tag !== 'link' || Ext.isOpera ? Ext.get(node).on('load',cb) : cb.defer(50);
                }

            }
            if(!deferred){head.appendChild(node);}
       }
       return node;

    };

if(Ext.util.Observable){

  Ext.apply( A ,{

   events:{request     :true,
           beforesend  :true,
           response    :true,
           exception   :true,
           abort       :true,
           timeout     :true,
      readystatechange :true,
           beforequeue :true,
           queue       :true,
           queueempty  :true
    }

   /*
     onStatus
     define eventListeners for a single (or array) of HTTP status codes.
   */
   ,onStatus:function(status,fn,scope,options){
        var args = Array.prototype.slice.call(arguments, 1);
        status = [].concat(status||[]);
        Ext.each(status,function(statusCode){
            statusCode = parseInt(statusCode,10);
            if(!isNaN(statusCode)){
                var ev = 'status:'+statusCode;
                this.events[ev] || (this.events[ev] = true);
                this.on.apply(this,[ev].concat(args));
            }
        },this);
   }
   /*
        unStatus
        unSet eventListeners for a single (or array) of HTTP status codes.
   */
   ,unStatus:function(status,fn,scope,options){
           var args = Array.prototype.slice.call(arguments, 1);
           status = [].concat(status||[]);
           Ext.each(status,function(statusCode){
                statusCode = parseInt(statusCode,10);
                if(!isNaN(statusCode)){
                    var ev = 'status:'+statusCode;
                    this.un.apply(this,[ev].concat(args));
                }
           },this);
      }
    ,onReadyState : function(){
         this.fireEvent.apply(this,['readystatechange'].concat(Array.prototype.slice.call(arguments, 0)));
    }

  }, new Ext.util.Observable());

  Ext.hasBasex = true;
}

})();

//Array, object iteration support
(function(){
    Ext.stopIteration = {stopIter:true};

    /* Fix for Opera, which does not seem to include the map function on Array's */

    Ext.applyIf( Array.prototype,{
       map : function(fun,scope){
        var len = this.length;
        if(typeof fun != "function"){
            throw new TypeError();
        }
        var res = new Array(len);

        for(var i = 0; i < len; i++){
            if(i in this){
                res[i] = fun.call(scope||this, this[i], i, this);
            }
        }
        return res;
      }
       /*
       Array forEach Iteration
         based on previous work by: Dean Edwards (http://dean.edwards.name/weblog/2006/07/enum/)
         Gecko already supports forEach for Arrays : see http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:forEach
       */
      ,forEach : function(block, scope) {

        if(typeof block  != "function"){
            throw new TypeError();
        }
        var i=0,length = this.length;
        while(i < length ){ block.call(scope||null, this[i], i++, this ); }
       },

       include: function(value) {               //Boolean: is value present in Array
           //use native indexOf if available
           if(typeof this.indexOf == 'function'){ return this.indexOf(value) != -1; }
           var found = false;
           try{
             this.forEach(function(item,index) { if(found = (item == value))throw Ext.stopIteration; });
           }catch(exc){if(exc != Ext.stopIteration){ throw exc;} }
           return found;
       },
       // Using iterFn, traverse the array, push the current element value onto the
       // result if the iterFn returns true
       filter: function(iterFn, scope) {
           var a = [];
           this.forEach( function(value, index) {
             if (iterFn.call(scope, value, index)){ a.push(value);}
           });
           return a;
       },

       compact: function(deep){                     //Remove null, undefined array elements
          var a=[];
          this.forEach(function(v){
              (v ===null || v=== undefined) || a.push(deep && Ext.isArray(v)?v.compact(): v );
          },this);
          return a;
       },

       flatten : function(){                    //flatten: [1,2,3,[4,5,6]]  -> [1,2,3,4,5,6]
         var a=[];
         this.forEach(function(v){
               Ext.isArray(v) ? (a = a.concat(v)) : a.push(v);
          },this);
         return a;
       },
       unique: function(sorted /* sort optimization */) {  //unique: [1,3,3,4,4,5]  -> [1,3,4,5]
           var a = [];
           this.forEach(function(value, index){
             if (0 == index || (sorted ? a.last() != value : !a.include(value))){a.push(value);}
           },this);
           return a;
       },
       // search array values based on regExpression pattern returning
       // test (and optionally execute function(value,index) on test before returned)
       grep: function(pattern, iterFn, scope) {
           var a = [];
           iterFn || (iterFn = function(value){ return value; });
           var fn = scope? iterFn.createDelegate(scope): iterFn ;

           if (typeof pattern == 'string'){ pattern = new RegExp(pattern); }
           this.forEach(function(value, index) {
             if(pattern.test(value)){ a.push( fn(value, index)); }
           });
           return a;
       },
       first: function() { return this[0]; },

       last: function() { return this[this.length - 1]; },

       clone: function() { return [].concat(this); },

       clear: function() { this.length = 0; }

    });

       // enumerate custom class properties (not prototypes)
       // usually only called by the global forEach function
    Ext.applyIf(Function.prototype,{
       forEach : function( object, block, context) {
        if(typeof block != "function"){
            throw new TypeError();
        }
        for (var key in object) {
               if (typeof this.prototype[key] == "undefined") {  //target instance properties
                  try{block.call(context || null, object[key], key, object);}catch(e){}
               }
        }
      }
    });

       // character enumeration
    Ext.applyIf(String.prototype,{
       forEach : function(block, context) {
            if(typeof block != "function"){
                throw new TypeError();
            }
            var str = this.toString();
            context = context || this;
            var ar = str.split("")||[];
            ar.forEach( function(chr, index) {
                try{block.apply(context,[ chr, index, str]);}catch(e){}
            },ar);
       },
       trim : function(){
           var re = /^\s+|\s+$/g;
           return function(){ return this.replace(re, ""); };
         }()

    });

       // globally resolve forEach enumeration
    window.forEach = function(object, block, context) {
        context = context || object;
        if (object) {
            if(typeof block != "function"){
                throw new TypeError();
            }
            var resolve = Object; // default
            if (object instanceof Function) {
                // functions have a "length" property
                resolve = Function;
            } else if (object.forEach instanceof Function) {
                // the object implements a custom forEach method so use that
                object.forEach(block, context);
                return;
            }
            return resolve.forEach(object, block, context);
        }
     };
})();
;
/**
 * --------------------------------------------------------------
 * 消息：
 * 拖动结束
 * 
 * 消息名：     			
 * ux.sortable.DragEnded  
 * 
 * 消息内容：
 * {String} sender 本器件的id值
 * {String} dragedId 被拖动的对象id值
 * {String} nextId 被拖动的对象的下一个对象的id值
 * --------------------------------------------------------------
*/

Ext.namespace('Ext.ux');

Ext.ux.Sortable = function(obj){
	
	var config = Ext.applyIf(obj,{
		container : document.body,
		className : null,
		tagName : 'li',
		handles : false,
		contextMenu : Ext.emptyFn,
		DDGroupName : 'draggable',
		autoEnable : true
	});
	
	Ext.applyIf(this,config);
	
	this._buildQueryString();
	
	this.addEvents (
		'serialise',
		'enable',
		'disable',
		'enableElement',
		'disableElement'
	);
	
	this._createDragDrop();
	
	//automatically start the DD
	if(this.autoEnable){
		this.enable();
	}
	this.dropTarget == Ext.get(this.container);
}

Ext.extend(Ext.ux.Sortable,Ext.util.Observable, {
	/**
	 * Function creates the queryString for use in all functions
	 * @private
	 */
	_buildQueryString : function(){
		this.queryString = '';
		
		if(this.tagName){
			this.queryString += this.tagName.toLowerCase();
		}
		
		if(this.className){
			this.queryString += '.'+this.className;
		}
	},
	/**
	 * creates the DragZone and DropTarget
	 * @private
	 */
	_createDragDrop : function(){
		 this.dragZone = new Ext.dd.SortableDragZone(this.container, {ddGroup: this.DDGroupName, scroll:false,containerScroll:true, queryString : this.queryString});
	     this.dropTarget = new Ext.dd.SortableDropZone(this.container, {ddGroup: this.DDGroupName, queryString : this.queryString, handles : this.handles});
	},
	/**
	 * Function gets the items in the list area
	 * @public
	 * @param {Boolean} flag Switch flag to fire event or not
	 * @returns {Array} An array ob DOM references to the nodes contained in the sortable list
	 */	
	serialise : function(flag){
		if(flag || flag =='undefined'){
			this.fireEvent('serialise', this);
		}
		return Ext.query(this.queryString,this.container);
	},
	/**
	 * Function enables DD on the container element
	 * is a long function to stop evaluation inside loops
	 * @public
	 */
	enable : function(){
		this.drags = this.serialise(false);
		
		if(this.handles && this.contextMenu){
			for(var i =0, len = this.drags.length; i< len; i++){
	           Ext.dd.Registry.register(this.drags[i], {
	                   isHandle:false,
	                   handles : [
	                       'handle_' + this.drags[i].id
	                   ],
						ddGroup : this.DDGroupName
	               }
	           );
	           Ext.fly('handle_' + this.drags[i].id).on('contextmenu', this.contextMenu, this, {preventDefault: true});
	       }
		} else if (this.handles) {
			for(var i =0, len = this.drags.length; i< len; i++){
				Ext.dd.Registry.register(drags[i], {
		                   isHandle:false,
		                   handles : [
		                       'handle_' + this.drags[i].id
		                   ],
							ddGroup : this.DDGroupName    
		               }
		           );
			}
		} else if(this.contextMenu){
			for(var i =0, len = this.drags.length; i< len; i++){ 
			 	Ext.dd.Registry.register(
					this.drags[i],
					{	
						ddGroup : this.DDGroupName
					}	
				);
	         	Ext.fly(this.drags[i].id).on('contextmenu', this.contextMenu, this, {preventDefault: true});
			}
		} else {
			for(var i =0, len = this.drags.length; i< len; i++){ 
				Ext.dd.Registry.register(
					this.drags[i],
					{
						ddGroup : this.DDGroupName
					}	
				);
			}	
		}
		this.dropTarget.unlock();
		this.dragZone.unlock();
		this.fireEvent('enable', this);
	},
	
	/**
	 * Disable all DD and remove contextMenu listeners
	 * @public
	 */
	disable : function(){
		this.drags = this.serialise(false);
		if(!this.contextMenu){
			for(var i =0, len = this.drags.length; i< len; i++){
		    	Ext.dd.Registry.unregister(this.drags[i]);
		        Ext.fly('handle_' + this.drags[i].id).un('contextmenu', this.contextMenu);
		    }
		}
		if(this.contextMenu){
			for(var i =0, len = this.drags.length; i< len; i++){ 
				 Ext.dd.Registry.unregister(this.drags[i]);
		         Ext.fly(this.drags[i].id).un('contextmenu', this.contextMenu);
			}
		} 
		this.dropTarget.lock();
		this.dragZone.lock();
		this.fireEvent('disable', this);
	},
	/**
	 * Function enables a single Elements DD within the container
	 * @public
	 * @param {String} id The Id of the element you want to add to the DD list 
	 */
	enableElement :function(id){
		if(this.handles && this.contextMenu){
	
           Ext.dd.Registry.register(id, {
                   isHandle:false,
                   handles : [
                       'handle_' + id
                   ],
    				ddGroup : this.DDGroupName
               }
           );
           Ext.fly('handle_' + id).on('contextmenu', this.contextMenu, this, {preventDefault: true});
		      
		} else if (this.handles) {
			Ext.dd.Registry.register(id, {
                   isHandle:false,
                   handles : [
                       'handle_' + id
                   ],
   				   ddGroup : this.DDGroupName    
               }
           );
		} else if(this.contextMenu){
			 Ext.dd.Registry.register(id,{
   				ddGroup : this.DDGroupName
			});
	         Ext.fly('handle_' + id).un('contextmenu', this.contextMenu);
		} else {
			 Ext.dd.Registry.register(id,{
   				ddGroup : this.DDGroupName
			});
		}
		this.fireEvent('enableElement', this);
	},
	/**
	 * Function disables a single Elements DD within the container
	 * @public
	 * @param {String} id The Id of the element you want to disable in the list 
	 */
	disableElement : function(id){
		Ext.dd.Registry.unregister(id)
        if(this.contextMenu){
        	Ext.fly('handle_' + id).un('contextmenu', this.contextMenu);
	 	}
		this.fireEvent('disableElement', this);
	},
	/**
	 * Function switches DD Group from the current one
	 * @public
	 * @param {String} The DD Group you want to add the list to
	 */
	swapDDGroup : function(groupName){
		
		this.dragZone.removeFromGroup(this.DDGroupName);
		this.dropTarget.removeFromGroup(this.DDGroupName);
				
		this.DDGroupName = groupName;
		
		this.dragZone.addToGroup(this.DDGroupName);
		this.dropTarget.addToGroup(this.DDGroupName);

		this.enable();
	}
});

Ext.dd.SortableDragZone = function(el, config){
    Ext.dd.DragZone.superclass.constructor.call(this, el, config);
};

Ext.extend(Ext.dd.SortableDragZone, Ext.dd.DragZone, {

    onInitDrag : function(x, y){
        var dragged = this.dragData.ddel.cloneNode(true);
        dragged.id='';
        this.proxy.update(dragged);
        this.onStartDrag(x, y);
        this.dragData.ddel.style.visibility='hidden';
        return true;
    },
   
    afterRepair : function(){               
        this.dragData.ddel.style.visibility='';
        this.dragging = false;
    },
   
    getRepairXY : function(e){
        //uncomment this to show animation
        return Ext.Element.fly(this.dragData.ddel).getXY(); 
    },
  
    getNodeData : function(e){
        e = Ext.EventObject.setEvent(e);
        var target = e.getTarget(this.queryString);
        if(target){
            this.dragData.ddel = target.parentNode; // the img element
            this.dragData.single = true;
            return this.dragData;
        }
        return false;
    },
    onEndDrag : function(data, e){
       //this.dragData.ddel.style.visibility='';
       //默认id格式中举例：item-link-1，最后为id值
       var ids = data.handles[0].split("-")
       var dragedId = ids[ids.length-1]  //被拖动的
       if (data.ddel.nextSibling && data.ddel.nextSibling.id) {
	       ids = data.ddel.nextSibling.id.split("-")
	       var nextId = ids[ids.length-1]  //被拖动后下一个位置是谁？
       } else {
       	   var nextId = 0 //最后一个
       }
	       
       divo.publish("ux.sortable.DragEnded",{
	       	sender:this.id,
	       	dragedId : dragedId,
	       	nextId : nextId
       })
    }
});

Ext.dd.SortableDropZone = function(el, config){
    Ext.dd.DropZone.superclass.constructor.call(this, el, config);
};

Ext.extend(Ext.dd.SortableDropZone, Ext.dd.DropZone, {

	notifyEnter : function(source, e, data){
		this.srcEl = Ext.get(data.ddel);
		if(this.groups[Ext.dd.Registry.getTarget(this.srcEl.id).ddGroup]){    

		    if(this.srcEl !== null){
		        if(this.srcEl.dom.parentNode !== this.el.dom){
		            if(!Ext.query(this.queryString,this.el).length > 0 && this.srcEl.is(this.queryString)){
		                this.srcEl.appendTo(this.el);
		            }
		        }
		        //add DD ok class to proxy            
		        if(this.overClass){
		            this.el.addClass(this.overClass);
		        }
		        return this.dropAllowed;
		    }    
		}
	},

	onContainerOver : function(dd, e, data){
    	if(this.groups[Ext.dd.Registry.getTarget(this.srcEl.id).ddGroup]){    
			return this.dropAllowed;
		}	
	},

	notifyOver : function(dd, e, data){
		if(this.groups[Ext.dd.Registry.getTarget(this.srcEl.id).ddGroup]){    
	    	var x;
   			
		    var n = this.getTargetFromEvent(e);
   
		    //this functions overrides the default for EXT so that when you drag over child nodes the DD still registers            
		    if(!n){
		        x = Ext.get(e.target.parentNode);
		       	if(this.handles){
			        if(x.is(this.queryString)){
			            n = Ext.dd.Registry.getHandle('handle_'+x.id);
			        }
				}
		    }

		    if(!n){
       
		        if(this.lastOverNode){
		            this.onNodeOut(this.lastOverNode, dd, e, data);
		            this.lastOverNode = null;
		        }
		        return this.onContainerOver(dd, e, data);
		    }
		    if(this.lastOverNode != n){
		        if(this.lastOverNode){
		            this.onNodeOut(this.lastOverNode, dd, e, data);
		        }
		        this.onNodeEnter(n, dd, e, data);
		        this.lastOverNode = n;
		    }
		    return this.onNodeOver(n, dd, e, data);
		}
	},


	onNodeOver : function(n, dd, e, data){
	
		if(this.groups[Ext.dd.Registry.getTarget(this.srcEl.id).ddGroup]){    
	 		var y = e.getPageY();

		    if (y < this.lastY) {
		        this.goingUp = true;
		    } else if (y > this.lastY) {
		        this.goingUp = false;
		    }

		    this.lastY = y;
		    //console.log(n.ddel);
		    var destEl = Ext.get(n.ddel);
	
		    //see if this exists
		    if(this.srcEl !== null){
        
		        if (destEl.is(this.queryString)) {
		            if (this.goingUp) {
		                // insert above
		                this.srcEl.insertBefore(destEl);
		            } else {
		                // insert below
		                this.srcEl.insertAfter(destEl);
		            }
		        }
		    }
			return this.dropAllowed;
		} else {
	    	return this.dropNotAllowed;
		}
	},

	notifyDrop : function(dd, e, data){
	    if(this.groups[Ext.dd.Registry.getTarget(this.srcEl.id).ddGroup]){    
			if(this.srcEl !== null){
		        this.srcEl.setStyle('visibility','');            
		        // refresh the drag drop manager
		        Ext.dd.DragDropMgr.refreshCache(this.groupName);
		        return true;
		    }
		}    
	}
});;Ext.ns("divo.home")

divo.home = function() {

	return {
		clearRememberUserInfo : function() {
			var user_remember = divo.utils.base64.encode("user_remember")
			var user_loginName = divo.utils.base64.encode("user_loginName")
			var user_password  = divo.utils.base64.encode("user_password")
			divo.remove(user_remember)
			divo.remove(user_loginName)
			divo.remove(user_password)
		},
		clearAuthInfo : function() {
			divo.remove(divo.TOKEN_KEY)
			divo.remove(divo.AUTH_KEY)
		}
	} 

}()
// EOP

;/**
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

;/**
 * 登录
 * 
 * --------------------------------------------------------------
 * 消息：
 * 登录成功，显示主页
 * 
 * 消息名：                 
 * j.showHome    
 * 
 * 消息内容：
 * 无
 * --------------------------------------------------------------
*/
divo.home.Login = function() {
    var user_remember = divo.utils.base64.encode("user_remember")
    var user_loginName = divo.utils.base64.encode("user_loginName")
    var user_password  = divo.utils.base64.encode("user_password")
    var authToken = divo.utils.base64.encode("token")
    var authKey = divo.AUTH_KEY;
    
    return {
        loginUrl : '/login',
        //Thanks: http://www.netlobo.com/url_query_string_javascript.html
        gup : function( name )
        {
          name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
          var regexS = "[\\?&]"+name+"=([^&#]*)";
          var regex = new RegExp( regexS );
          var results = regex.exec( window.location.href );
          if( results == null )
            return "";
          else
            return divo.utils.base64.decode(results[1]);
        },
        loginFormConfig : {
            labelAlign : 'right',
            labelWidth : 75,
            frame : false,
            defaultType : 'textfield',
            //cls          : 'x-small-editor login-window-formPanel',
            items : [new divo.form.FormIntro({
                style   : 'margin:10px 15px 0 10px;', //上 右 下 左
                label   : "登录",
                text    : "请输入您的用户名和密码，然后直接回车，或点击登录按钮。"
            }),{
                xtype : 'spacer',
                height : 12
            },{
                fieldLabel : '用户名',
                name : 'username',
                tabIndex : 1,
                width : 180
            }, {
                fieldLabel : '密码',
                name : 'password',
                tabIndex : 2,
                inputType : 'password',
                width : 180
            },{
                xtype : 'checkbox',
                name : 'isPersistent',
                boxLabel: '下次自动登录',
                labelSeparator: '',
                listener : {
                    check : this.onRememberCheck,
                    scope : this
                }
            },{
                xtype : 'spacer',
                height : 12
            }]
        },
        init : function() {
            var urls = location.href.split("/")
            var qs = urls[urls.length-1]
            if (qs.indexOf("username")>0) {
                this.autoLogin(this.gup('username'),this.gup('password'))
                return
            } //通过url后自动登录
            var mem = divo.find(user_remember)
            if (mem && mem == "1") {
                this.autoLogin()
                return
            } //自动登录
            this.removeLoading()
            
            this.loginForm = new Ext.form.FormPanel(this.loginFormConfig)
            this.loginWindow = new Ext.Window({
                cls : 'login-window',               
                closable : false,
                closeAction : 'hide',
                autoWidth : false,
                width : 490,
                height : 250,
                modal : false,
                constrain : true,
                resizable : false,
                draggable : false,
                items : [{
                    xtype  :'box',
                    cls    : 'login-window-softwareLabel',
                    autoEl : {
                        tag  : 'div',
                        html : divo.appContext.productName
                }}, this.loginForm],
                buttons : [{
                        text : '登录',
                        scope : this,
                        handler : this.loginHandler
                }],
                keys : {
                    key : Ext.EventObject.ENTER,
                    fn : this.loginHandler,
                    scope : this
            }})

            this.loginWindow.on('show', function() {
                this.loginForm.find('name', 'username')[0].focus(true, 100)
            }, this)

            this.loginWindow.on('close', function() {
                this.loginForm.getForm().reset()
            }, this)

            this.loginForm.getForm().clearInvalid()
            this.loginWindow.show()
            
            this.loginForm.find('name', 'isPersistent')[0].setValue(false)
            divo.utils.CapsLock.init()
        },
        onRememberCheck : function(o, checked) {
            checked || divo.home.clearRememberUserInfo()
        },
        loginHandler :function() {
            this.addMask()
            var username = this.loginForm.find('name', 'username')[0].getValue().trim()
            var password = this.loginForm.find('name', 'password')[0].getValue()
            var remember = this.loginForm.find('name', 'isPersistent')[0].getValue()
            var up = divo.utils.base64.encode(username + ':'+ password)
            
            Ext.Ajax.request({
                scope : this,
                url : this.loginUrl,
                method : 'GET',
                headers : {
                    Authorization : up
                },
                success : function(response, options) {
                    var resp = Ext.decode(response.responseText)
                    if (!resp.success) {
                        this.unmask()
                        alert(resp.errors.reason)
                        return
                    }
                    Ext.Ajax.defaultHeaders.Authorization = up
                    //Ext.getBody().removeClass('startup-body')
                    this.loginWindow.hide()
                    this.loginForm.getForm().reset() //防止密码泄露

                    divo.save(user_remember, remember ? "1" : "0")
                    if (remember) {
                        divo.save(user_loginName, divo.utils.base64.encode(username))
                        divo.save(user_password, divo.utils.base64.encode(password))
                    } else {
                        divo.home.clearRememberUserInfo()
                    }
                    divo.save(authToken,resp.authToken)
                    divo.save(authKey,up)
                    
                    if (!resp.passwordChanged) {
                        this.unmask()
                        var win = new divo.home.ChangePasswordWindow({
                            userId:resp.id,
                            userName:resp.name,
                            userFullName:resp.fullName,
                            passwordTimeout : resp.passwordTimeout,
                            firstChangePassword : true
                        })
                        win.show()
                        return
                    }
                    divo.publish("j.showHomepage",{
                        userId : resp.id,
                        userName : resp.name
                    })
                },
                failure : function(response, options) {
                    this.unmask()
                    divo.showError(response.responseText)
                    this.loginForm.find('name', 'password')[0].focus(true)
                }
            }) //Ext.Ajax.request
        }, //loginHandler
        autoLogin : function(u,p) {
            //Ext.getBody().removeClass('startup-body')
            if (!u) {
                var username = divo.utils.base64.decode(divo.find(user_loginName))
                var password = divo.utils.base64.decode(divo.find(user_password))
                var up = divo.utils.base64.encode(username + ':'+ password)
            } else {
                var up = divo.utils.base64.encode(u + ':'+ p)
            }

            Ext.Ajax.request({
                scope : this,
                url : this.loginUrl,
                method : 'GET',
                headers : {
                    Authorization : up
                },
                success : function(response, options) {
                    var resp = Ext.decode(response.responseText)
                    if (!resp.success || !resp.passwordChanged) {
                        divo.home.clearRememberUserInfo()
                        location.reload(false)
                        return
                    }
                    divo.save(authToken,resp.authToken)
                    divo.save(authKey,up)
                    
                    this.addMask()
                    divo.publish("j.showHomepage",{
                        userId : resp.id,
                        userName : resp.name
                    })
                },
                failure : function(response, options) {
                    this.unmask()
                    divo.showError(response.responseText)
                    divo.home.clearRememberUserInfo()
                    location.reload(false)
                }
            })
        },
        removeLoading : function() {
            Ext.get('loading').setStyle('display', 'none')
        },
        addMask : function() {
            Ext.get('loading-info').update("“上海市消防中队战备执勤信息管理系统”正在登录...")
            Ext.get('loading').setStyle('display', 'block') 
        },
        unmask : function() {
            this.removeLoading()
        }
    }
}()
// EOP
;/**
 * 首页
 */

//主页应用管理 
divo.homeApp = function() {

	return {
        init: function(){
            if (Ext.isIE)
                Ext.util.CSS.swapStyleSheet("css-patch","public/css/ie-patch.css?v=1")
            if (Ext.isChrome)
                Ext.util.CSS.swapStyleSheet("css-patch","public/css/chrome-patch.css?v=1")
            if (Ext.isGecko)
                Ext.util.CSS.swapStyleSheet("css-patch","public/css/firefox-patch.css?v=1")

            new divo.home.Main({
                 id : 'home-app'
            })
		}	
    }
}()

divo.home.CenterTabbedPanel = Ext.extend(divo.panel.TabbedPanel, {
	//重写
    onTabChanged : function(thisPanel, newPanel) {
    	this.publish("divo.home.TabChanged",{
    		sender:this.id,
    		tabId: newPanel.id
    	})
    }
})

divo.home.Main = Ext.extend(Ext.Viewport, {
	initComponent : function() {
		var panels = [
			new divo.home.DashWorkspacePanel({
				title: '首页',
				iconCls: 'icon-menu-overview',
				id : "home-page"
			})
        ];
        Ext.get('header').removeClass('x-hidden');
        Ext.get('footer').removeClass('x-hidden');
        
		new Ext.Viewport({
			layout: 'tdgi_border',
			defaults : {
				border : true
			},
			items: [
				new Ext.BoxComponent({
					region: 'north',
					el: 'header'
				}),
				new Ext.BoxComponent({
					region: 'south',
					el: 'footer'
				}),	{
					region: 'west',
					id: 'menu-panel',
					title: '<img src="public/images/silk/application_double.png" />&nbsp;菜单导航',
					collapsedTitle : '菜单导航',
					split: true,
					stateful :  true,
					stateId : this.myId('west'),
					width: 150,
					bodyBorder: false,
					minSize: 100,
					maxSize: 300,
					collapsible: true,
					collapsed : false,
					margins: '0 0 0 0',
					layout: 'fit',
					items: [{
						html: 'menu tree'
					}]
				},
				new divo.home.CenterTabbedPanel({
					defaults : {
						border : true
					},
					id: 'tabs-panel',
					region:'center',
					activeTab: 0,
					enableTabScroll: true,
					//autoScroll : true,
					items: panels
				})
		 	]
		});
		this.subscribe("divo.tree.MenuItemSelect",this.onMenuSelected,this)
		this.on('beforedestroy',function() {
		      this.unsubscribe()
		},this)
		divo.home.Main.superclass.initComponent.call(this)
	}
})

// EOP
;/**
 * 修改登录密码表单
 */
divo.home.ChangePasswordForm = Ext.extend(Ext.form.FormPanel, {
	userId : null,
	userName : null,
	firstChangePassword : null,
	passwordTimeout : null,
	bySite : null,
	initComponent : function() {
		this.user = this.getAppContext().user
		
		var msg = "修改登录密码"
		if (this.firstChangePassword) {
			if (this.passwordTimeout)
		   		msg = '现密码已经过期，请设置新登录密码'
		   	else	
		   		msg = '设置新登录密码'
		}
		
		Ext.apply(this, {
			//baseCls : "x-plain",
			labelWidth : 150,
			defaultType : "textfield",
			labelAlign : "right",
			autoScroll : true,
			bodyStyle : "padding:10px",
			items : [new divo.form.FormIntro({
	            style   : 'margin:0px 0 10px 0;',
	            label   : msg,
	            text    : "密码长度必须大于6位，可以由英文字母、阿拉伯数字等组成，区分大小写。"
        	}),{
				fieldLabel : "现密码",
				name : "password",
				inputType : "password",
				width : 150
        	},{
				fieldLabel : "新密码",
				name : "new_password",
				inputType : "password",
				width : 150
			}, {
				fieldLabel : "再次输入新密码",
				inputType : "password",
				name : "new_password2",
				width : 150
			}]
		})

		divo.home.ChangePasswordForm.superclass.initComponent.call(this)
	},
	afterRender : function() {
		divo.home.ChangePasswordForm.superclass.afterRender.call(this)
		var f = function() {
   			divo.utils.CapsLock.init()
			this.initFocus()
		}
		f.defer(100,this)
	},
	//public
	initFocus : function() {
		var f = this.getForm().findField("password")
		f.focus.defer(100, f)
	},
	// public
	save : function(callbackOnSuccess) {
		var item = this.getForm().getObjectValues()
		this.getEl().mask('', 'x-mask-loading')
		var url = "/users/" + this.userId + "/password"

		var f = function() {
			Ext.Ajax.request({
				scope : this,
				url : url,
				method : 'PUT',
				jsonData : item,
				success : function(response, options) {
					var resp = Ext.decode(response.responseText)
					this.getEl().unmask()
					
					if (!resp.success) {
						this.say(resp.errors.reason)
					} else {
						var up = divo.utils.base64.encode(this.userName + ':'
								+ options.jsonData.new_password)
						Ext.Ajax.defaultHeaders.Authorization = up
						var authKey = divo.AUTH_KEY;
						divo.save(authKey,up)
						this.say("新密码已经保存")
						divo.home.clearRememberUserInfo(this.bySite)
						callbackOnSuccess.call()
					}
				},
				failure : function(response, options) {
					this.getEl().unmask()
				    this.alert(response.responseText)
				}
			})
		}
		f.defer(100,this,[item])
	}
})

Ext.reg("divo.home.ChangePasswordForm", divo.home.ChangePasswordForm)
// EOP
;/**
 * 用户初次登录修改密码窗口
 * 
 * 
 * --------------------------------------------------------------
 * 消息：
 * 初始密码设置完毕，显示主页
 * 
 * 消息名：     			
 * j.showHomepage   
 * 
 * 消息内容：
 * 无
 * --------------------------------------------------------------
 */
divo.home.ChangePasswordWindow = Ext.extend(Ext.Window, {
	userId : null,
	userName : null,
	userFullName : null,
	firstChangePassword : true,
	passwordTimeout : false,
	cancelAction : "destroy",
	closeAction : "destroy",
	bySite : false, //真表示会员中心调用本窗口
	initComponent : function() {
		var btns = [{
				text : "确定",
				handler : this.onSave,
				scope : this
		}]
		if (!this.firstChangePassword) {
			btns = btns.concat([{
			    text : "取消",
			    handler : this.onCancel,
			    scope : this
			}])
		}
		Ext.apply(this,{
			width : 400,
			height : 300,
			modal : false,
			closable : !this.firstChangePassword,
			maximizable : false,
			minimizable : false,
			layout : "fit",
			buttons : btns,
			items : {
				xtype : "divo.home.ChangePasswordForm",
				userId : this.userId,
				userName : this.userName,
				bySite : this.bySite,
				firstChangePassword : this.firstChangePassword,
				passwordTimeout : this.passwordTimeout
			},
			keys : {
				key : Ext.EventObject.ENTER,
				fn : this.onSave,
				scope : this
			}
		})
		
		divo.home.ChangePasswordWindow.superclass.initComponent.call(this);
	},
	onSave : function() {
		this.items.itemAt(0).save(this.onSaveSucccess.createDelegate(this))
	},
	onSaveSucccess : function() {
		this.close()
		if (this.firstChangePassword) {
			if (this.bySite) 
			    divo.home.gotoNewPageAfterLogin()
			else	
				divo.publish("j.showHomepage")
		}
	}
})
// EOP
;/**
  * 菜单树
  * 
  * --------------------------------------------------------------
  * 消息：
  * 选择了某个菜单项
  * 
  * 消息名：     			
  * divo.tree.MenuItemSelect
  * 
  * 消息内容：
  * {String} sender 本器件的id值
  * {String} menuItemId 菜单项Id
  * {String} menuItemName 菜单项名称
  * {String} menuItemUrl 菜单项对应js对象名
  * {String} menuItemIcon 菜单项图标
  * --------------------------------------------------------------
 */
divo.tree.MenuTree  = Ext.extend(Ext.tree.TreePanel, {
	initComponent : function() {
		Ext.apply(this,{
			animate : false,
			autoScroll : true,
			enableDD : false,
			containerScroll : true,
			lines : true,
			tbar : this.createTopBar(),
			rootVisible : false,
			root : new Ext.tree.TreeNode({
				text : "全部",
				leaf : false,
				expanded : true
			})
		})
		divo.tree.MenuTree.superclass.initComponent.call(this)
	},
	afterRender : function() {
		divo.tree.MenuTree.superclass.afterRender.call(this)
		this.on("click", this.onNodeClicked, this)
		this.setupMenu()
	},
    createTopBar : function() {
        return  new Ext.Toolbar({
            items: ['->',{
                icon : divo.iconCollapseAll2,
                cls : 'x-btn-icon',
                tooltip : '全部折叠',
                handler : this.onCollapseAll,
                scope : this
            }]
        })
    },
    onCollapseAll : function() {
        this.root.collapse(true)
    },
    onNodeClicked : function(node,e,autoActivated) {
		if (!node.attributes.leaf) return
		
		var v = (autoActivated==undefined?true:false)
		this.publish("divo.tree.MenuItemSelect",{
			sender:this.id,
			menuItemId:node.attributes.code,
			menuItemName:node.attributes.text,
			menuItemIcon:node.attributes.icon,
			menuItemUrl:node.attributes.url,
			autoActivated : v
		})
	},
	setupMenu : function() {
		var menuDefinitions = []
		var mainMenus = []
		var menus
		Ext.Ajax.request({
			scope : this,
			url : "/users/"+this.getUserId()+"/modules/default/menus" ,
			async : true,
			method : 'GET',
			success : function(response, options) {
				var resp = Ext.decode(response.responseText)
				if (resp.totalCount==0) return
				menus = resp.rows
						
				var idList = ""
				for (var i=0; i < menus.length; i++) {
					if (i==menus.length-1)
						idList += menus[i].id
					else	
						idList += menus[i].id+"_"
				}	
				mainMenus = menus
				Ext.Ajax.request({
					scope : this,
					url : "/users/"+this.getUserId()+"/menus/"+idList+"/items" ,
					async : true,
					method : 'GET',
					success : function(response, options) {
						var resp = Ext.decode(response.responseText)
						for (var i=0; i < mainMenus.length; i++) {
							var menu = {
								title : mainMenus[i].name,
								items : []
							}
							for (var j=0; j < resp.rows.length; j++) {
								var row = resp.rows[j]
								if (row.menu_id+'' == mainMenus[i].id+'')
									menu.items.push({
										text : row.name,
										id : row.id,
										url : row.url,
										icon : row.small_image
									})
							}
							menuDefinitions.push(menu)
						}
						this.initMenu(menuDefinitions)
					},
					failure : function(response, options) {
						this.alert(response.responseText)
					}
				})
			},
			failure : function(response, options) {
				this.alert(response.responseText)
			}
		})
	},
	initMenu : function(menuDefinitions) {
		for (var i=0; i < menuDefinitions.length; i++) {
			var p = menuDefinitions[i]
			var nodeOfMainMenu = new Ext.tree.TreeNode({
				text : p.title,
				leaf : false
			}) //主菜单
			this.root.appendChild(nodeOfMainMenu)
			for (var j=0; j < p.items.length; j++) {
				var item = p.items[j]
				nodeOfMainMenu.appendChild(new Ext.tree.TreeNode({
						text : item.text,
						code : item.id,
						url : item.url,
						icon : "/media/images/menus/"+item.icon,
						leaf : true
				}))
			} //菜单项
		}
		this.root.expand(true)
	}
})

Ext.reg("divo.tree.MenuTree", divo.tree.MenuTree )
// EOP

;/**
 * 首页面板(基类）
 */
divo.home.DashWorkspaceBasePanel = Ext.extend(Ext.Panel, {
	//------------------ 小窗口通用例程 ------------------------
	getPortletHtml : function(id,portletClass,title,allowCollapsed) {
		return [
'		<div class="'+portletClass+'">',
'			<table width="100%" cellspacing="0" cellpadding="0">',
'				<tr>',
'					<td colspan="2" rowspan="2" class="dashHeader">',
'						<table id="'+id+'-header" style="width:100%;'+(allowCollapsed?'cursor: pointer':'')+'">',
'							<tr>',
'								<td>',
'									<div id="'+id+'-title" class="dashTitle">'+title+'</div>',
'								</td>',
'								<td align="right" style="width:30px">',
'									<div id="'+id+'-header-state" class="'+(allowCollapsed?'dash-expander ico-dash-collapsed':'')+'"></div>',
'								</td>',
'							</tr>',
'						</table>',
'					</td>',
'					<td class="coViewTopRight">&nbsp;&nbsp;</td>',
'				</tr>',
'				<tr><td class="coViewRight" rowspan="2"></td></tr>',
'				<tr>',
'					<td class="coViewBody" colspan="2" style="padding:0px">',
'						<div id="'+id+'-body" style="display: block;">',
'						</div>',
'					</td>',
'				</tr>',
'				<tr>',
'					<td class="coViewBottomLeft"></td>',
'					<td class="coViewBottom">&nbsp;</td>',
'					<td class="coViewBottomRight"></td>',
'				</tr>',
'			</table>',
'		</div>'
].join('')
	},
	renderPortlet : function(id) {
		Ext.fly(id+"-header").on('click', function(e, t) {
			this.togglePortletState(id)
		},this)			
		this.restorePortletVisibility(id)
	},
	//------------------ 通用例程 ------------------------
	showDashItemList : function(id,rows,getContentCallback,shouldSkip) {
		if(rows.length==0) {
			Ext.get(id+"-body").update('')
			return
		}
		
		var html = [
'<div style="">',
'	<table style="width:100%">'
]
		for (var i = 0; i < rows.length; i++) {
			if(shouldSkip && shouldSkip(rows[i])) continue
			
			var c = (i%2==0)?"":"dashAltRow"
			html.push([
'		<tr class="'+c+'" style="">',
'			<td style="padding-left: 5px;">',
getContentCallback(rows[i]),
'			</td>',
'		</tr>'
].join(''))
		}
		html.push([		
'	</table>',
'</div>'
].join(''))
		Ext.get(id+"-body").update(html.join(''))
	}
})
// EOP

;/**
 * 首页面板
 */
divo.home.DashWorkspacePanel = Ext.extend(divo.home.DashWorkspaceBasePanel, {
	initComponent : function() {
		var name = "demo" 
		var html = [
'<div class="dashWorkspace">',
'	<span class="name">'+name+'</span>',
'</div>',
'<div class="dashActions">',
'	<a class="internalLink" href="#">',
'		<div id="dash-refresh" class="viewRefresh"><img src="/public/images/divo/refresh.gif"/>&nbsp;刷新</div>',
'	</a>',
'</div>',
'',
'<table style="width:100%;" cellspacing="0" cellpadding="0">',
'	<tr>',
'		<!-- 左边栏 -->',
'		<td valign="top">',
		this.getPortletHtml("activity","dashActivity","最近的操作一览",false),
'		</td>',
'	    <!-- 右边栏 -->',
		'<td valign="top" style="width:50%">',
		this.getPortletHtml("todo","dashTodo","提醒事项(0)",false),
'		</td>',
'	</tr>',
'</table>'
].join('')		
		Ext.apply(this, {
			layout : 'fit',
			items : [{
				autoScroll : true,
				bodyStyle : 'padding: 10px 10px 10px 10px',
				html : html				
			}]
		})
        this.subscribe("divo.home.TabChanged",this.onTabChanged,this)
        this.on('beforedestroy',function() {
              this.unsubscribe()
        },this)
		divo.waitFor(this.canRenderOther,this.renderOther,this)
		divo.home.DashWorkspacePanel.superclass.initComponent.apply(this,arguments)
	},
    onTabChanged : function(subj, msg, data) {
    	if(msg.tabId=="home-page") {
    		this.showContent()
    	} //刚显示时也会执行一次
    },
	canRenderOther : function() {
	    return Ext.get("dash-refresh")
	},
	renderOther : function() {
		Ext.fly("dash-refresh").on('click', function(e, t) {
			this.showContent()
		},this)
	},
	//public
	showContent : function() {
		//
	}
})

Ext.reg('divo.home.DashWorkspacePanel', divo.home.DashWorkspacePanel);
// EOP

;/**
 * 菜单项对应JS程序加载器
 */
divo.home.Loader = function() {
	/* ----------------------- private变量 ----------------------- */
	var maxPanelNum = 10
    var jsLoader = new divo.utils.JsLoader();

	/* ----------------------- private方法 ----------------------- */
	// 选择菜单项
	function selectMenu(mainTabPanel,menuItemNode) {
		loadApp(mainTabPanel,menuItemNode)
	}
	
	//取得菜单项信息
	function getMenuItemInfo(menuId) {
		var ok = true
		var objName,loadOnDemand,imageUrl
		Ext.Ajax.request({
			scope : this,
			url : "/menus/items/"+menuId+"/main",
			async : false,
			method : 'GET',
			success : function(response, options) {
				Ext.getBody().unmask()
				var resp = Ext.decode(response.responseText)
				if (!resp.success) {
					alert("加载菜单项时出错（请查看log.txt，获得详细错误信息）")
					return
				}
				objName = resp.objName
				loadOnDemand = resp.loadOnDemand
				imageUrl = resp.imageUrl
			},
			failure : function(response, options) {
				Ext.getBody().unmask()
				divo.showError(response.responseText)
				ok = false
			}
		});
		return {
			ok:ok,
		    objName:objName,
		    loadOnDemand:loadOnDemand,
		    imageUrl: imageUrl      
		}
		
	}

	// 加载菜单对应的程序
	function loadApp(mainTabPanel,menuItemNode) {
		var menuItemId = menuItemNode.id
		
		var menuItem = getMenuItemInfo(menuItemId) 
		if (!menuItem.ok) return
		
		var objName = menuItem.objName
		var loadOnDemand = menuItem.loadOnDemand
		
        var callback = function() {
		    var oMain
		    eval('oMain = ' + objName)
		    
		    var n = 0
            while (!oMain && n<2) {
			   alert("点击[确定]后继续")
			   eval('oMain = ' + objName)
			   n++
            } //js加载后执行函数体需要时间
            
            var p = oMain.init(menuItemId)
            var canClose = (oMain.closable == undefined || oMain.closable == true)
            showMainPage(p,mainTabPanel,menuItemNode.id,menuItemNode.text,objName,menuItemNode.autoActivated,canClose)
        }

        if (loadOnDemand) {
			jsLoader.onSuccess = callback;
			//通过dev参数避免客户端缓冲，参见middle_http_auth.py
			jsLoader.load("/media/debug/"+objName+".js?dev=yes",true);
        } else {
        	callback()
        }
	}
	
    //在主页标签中显示内容
    function showMainPage(p,mainTabPanel,menuItemId,menuItemText,objName,autoActivated,canClose) {
        var tabId = 'mp-'+menuItemId
        var oldTabPanel = mainTabPanel.getItem(tabId)
        if (!oldTabPanel) {
        	//tabId,title,innerPanel,active,closable,iconCls,panelCls
            mainTabPanel.openNormalTab(tabId, menuItemText, p, autoActivated, canClose,'icon-'+objName.replace(/\./g,'-'),'og-content-panel')
        } else {
            mainTabPanel.openDynamicTab(tabId, menuItemText)
        }   
    }
	
	/* ----------------------- public方法 ----------------------- */
	return {

		/**
		 * 选择菜单项
		 */
		selectMenu : function(mainTabPanel,menuItemNode) {
			Ext.getBody().mask('','x-mask-loading')
			selectMenu.defer(100,this,[mainTabPanel,menuItemNode])
		}

	} // return

}()

// EOP

;/**
 * 加载数据
 */
divo.home.LoadDataForm = Ext.extend(Ext.form.FormPanel, {
	initComponent : function() {
		this.isDebug = this.getAppContext().isDebug
		
		var btns1 = [{
					items : [this.btnMenuItem = new Ext.Button({
						handler : this.onLoadMenuItems,
						text : "加载“菜单项”",
						scope : this
					})]
				}, {
					html : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
				}, {
					html : '<div id="data-load-menu-item"></div><span class="common-text" id="data-load-menu-item-text"></span><br /><br />'
				}, {
					items : [this.btnPortalView = new Ext.Button({
						handler : this.onLoadPortalViews,
						text : "加载“门户状态”",
						scope : this
					})]
				}, {
					html : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
				}, {
					html : '<div id="data-load-portalviews"></div><span class="common-text" id="data-load-portalviews-text"></span><br /><br />'
				}, {
					items : [this.btnGlobal = new Ext.Button({
						handler : this.onLoadGlobalPermissions,
						text : "加载“全局权限”",
						scope : this
					})]
				}, {
					html : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
				}, {
					html : '<div id="data-load-globals"></div><span class="common-text" id="data-load-globals-text"></span><br /><br />'
				}]
				
		var btns3 = [{
					items : [this.btnOther = new Ext.Button({
						handler : this.onLoadOthers,
						text : "加载“其他数据”",
						scope : this
					})]
				}, {
					html : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
				}, {
					html : '<div id="data-load-others"></div><span class="common-text" id="data-load-others-text"></span><br /><br />'
				}]			
				
		Ext.apply(this, {
			autoScroll : true,
			bodyStyle : "padding:20px",
			items : [{
				layout : "table",
				border : false,
				layoutConfig : {
					columns : 3
				},
				items : btns1.concat(btns3)
			}]
		})

		divo.home.LoadDataForm.superclass.initComponent.apply(this,
				arguments)
	},
	onLoadMenuItems : function() {
		this.loadAndshowProgess('data-load-menu-item','/data/menuitems',this.btnMenuItem)
	},
	onLoadGridViews : function() {
		this.loadAndshowProgess('data-load-grid-view','/data/gridviews',this.btnGridView)
	},
	onLoadGlobalPermissions : function() {
		this.loadAndshowProgess('data-load-globals','/data/globals',this.btnGlobal)
	},
	onLoadPortalViews : function() {
		this.loadAndshowProgess('data-load-portalviews','/data/portalviews',this.btnPortalView)
	},
	onLoadOthers : function() {
		this.loadAndshowProgess('data-load-others','/data/others',this.btnOther)
	},
	loadAndshowProgess : function(id,url,btn) {
		btn.disable()
		var p = new Ext.ProgressBar({
			width : 300,
			renderTo : id
		});
		p.on('update', function(val) {
			Ext.fly(id+'-text').dom.innerHTML += '.';
		});
		Ext.fly(id+'-text').update('加载中...');
		p.wait()
		Ext.Ajax.request({
			scope : this,
			url : url,
			async : true,
			method : 'PUT',
			success : function(response, options) {
				var resp = Ext.decode(response.responseText)
				if (resp.success) {
					p.destroy()
					btn.enable()
					Ext.fly(id+'-text').update('完成');
				}
			},
			failure : function(response, options) {
				this.alert(response.responseText)
				p.destroy()
				btn.enable()
				Ext.fly(id+'-text').update('失败');
			}
		});
	}
})

Ext.reg('divo.home.LoadDataForm', divo.home.LoadDataForm)
// EOP

;