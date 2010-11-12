/**
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
