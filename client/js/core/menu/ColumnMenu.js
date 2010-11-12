/**
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
