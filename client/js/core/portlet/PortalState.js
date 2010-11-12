/**
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

