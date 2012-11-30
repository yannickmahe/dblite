Dbl.UserActivity = {

  explorerPanel: {
    newConnectionSelected : function(connection, database) {
		Dbl.UserActivity.setKeys([
	      { key: 'connection', value: connection },
	      { key: 'connection_db', value: database},
	      { key: 'database', value: '' },
	      { key: 'table', value: '' },
	      { key: 'table_type', value: ''}
	    ]);
    },

    newDatabaseSelected: function(database) {
      Dbl.UserActivity.setKeys([
      { key: 'database', value: database},
      { key: 'table', value: ''},
      { key: 'table_type', value: ''}]);
      Explorer.selectedDatabase = database;
      Explorer.selectedTable = '';
    },

    newTableSelected : function(table, database, type) {
      Dbl.UserActivity.setKeys([
        { key: 'database', value: database},
        { key: 'table', value: table},
        { key: 'table_type', value: type}]);
      Explorer.selectedDatabase = database;
      Explorer.selectedTable = table;
    }
  },

  editorsPanel: {
	delimiterChanged: function(delimiter) {
	  Dbl.UserActivity.setKey('sqlDelimiter', delimiter);
  	},

    tabChanged: function() {
    	if(Editor.restoring) {
    		return;
    	} else {
        	Dbl.UserActivity.setKey('editorTabList', Ext.encode(Editor.editorList));
    	}
    }
  },

  dataPanel: {
    tabChanged: function(tabId) {
      if (Explorer.restoring) {
          return;
      }

      Dbl.UserActivity.setKey('datapanelActiveTab',tabId);
    },

    serverTabChanged: function(tabId) {
      if(Explorer.restoring) {
          return;
      }
      Dbl.UserActivity.setKey('activeConnTab',tabId);
    },

    dbTabChanged: function(tabId) {
      if(Explorer.restoring) {
          return;
      }
      Dbl.UserActivity.setKey('activeDbTab',tabId);
    },

    tableTabChanged: function(tabId) {
      if(Explorer.restoring) {
          return;
      }
      Dbl.UserActivity.setKey('activeTableTab',tabId);
    },

    newSubTabSelected: function(tabId) {
      if (Explorer.restoring) {
          return;
      }

      var key;
      switch (Dbl.UserActivity.getValue('datapanelActiveTab')) {
        case 'tablestructure':
          key = 'activeTableTab';
          break;
        case 'dbstructure':
          key = 'activeDbTab';
          break;
        case 'serverstructure':
          key = 'activeConnTab';
          break;
      }
      Dbl.UserActivity.setKey(key, tabId);
    }
  },

  pageLayout: {
	resizeExplorerPanel: function() {
	  Dbl.UserActivity.setKey('explorerWidth', Explorer.explorerPanel.getWidth());
    },

    collapseExplorerPanel: function() {
  	  Dbl.UserActivity.setKey('explorerCollapsed', true);
    },

    expandExplorerPanel: function() {
   	  Dbl.UserActivity.setKey('explorerCollapsed', false);
    },

    resizeSQLBrowserPanel: function() {
  	  Dbl.UserActivity.setKey('sqlBrowserWidth', Editor.browserContainerPanel.getWidth());
    },

    collapseSQLBrowserPanel: function() {
      Dbl.UserActivity.setKey('sqlBrowserCollapsed', true);
    },

    expandSQLBrowserPanel: function() {
      Dbl.UserActivity.setKey('sqlBrowserCollapsed', false);
    },

    resizeEditorPanel : function() {
      // We actually need the height of datapanel. But the resize event is
      // triggered only for editor panel. Therefore, here we obtain the
      // datapanel's height and update it at server.
    	Dbl.UserActivity.setKey('datapanelHeight', Dblite.dataPanel.getHeight());
    },

	showHideDatapanel: function() {
		Dbl.UserActivity.setKey('datapanelHidden', Dblite.dataPanel.hidden);
	}

  },

  setKey: function(key, value, updateAtServer) {
      if(Dbl.UserActivity.keys[key] == value) return;
      if(Dbl.UserActivity.restoringMode == true) return;

      Dbl.UserActivity.keys[key] = value;
      Dbl.UserActivity.updateAtServer({key: key, value: value});
  },

  setKeys: function(pairs) {
    if(Dbl.UserActivity.restoringMode == true) {
    	return;
    }

    for(var i=0; i<pairs.length; i++) {
      var curr = pairs[i];
      Dbl.UserActivity.keys[curr.key] = curr.value;
    }

    Dbl.UserActivity.updateAtServer(pairs);
  },

  getValue: function(key) {
    return Dbl.UserActivity.keys[key];
  },

  keys: [],

  restore: function() {
    Explorer.restore();
    Editor.restore();
  },

  updateAtServer: function(activity) {
    if(typeof(activity) == 'object') {
      if(activity instanceof Array) {
          Server.sendCommand('user.update_user_activities', activity, function(data) {});
      } else {
          Server.sendCommand('user.update_user_activity', activity, function(data) {});
      }
    }
  }
};
