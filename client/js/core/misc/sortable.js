
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
});