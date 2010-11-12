/**
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
