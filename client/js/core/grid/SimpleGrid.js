/**
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
