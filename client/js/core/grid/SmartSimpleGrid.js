/**
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
