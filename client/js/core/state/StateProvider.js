/**
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
