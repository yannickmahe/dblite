Dbl.UserSettings = {
  explorerPosition: '',
  explorerWidth: '',
  datapanelTabPosition: '',
  datapanelHeight: '',

  getSettings: function() {
    Server.sendCommand('user.retrieve_user_activity', {},
    	function(data) {
	        Dblite.user = data.user;
	        Dblite.guest_user = data.guestUser;

	        if(Dblite.user) {
	        	data.editorTabList = Ext.encode(data.editorTabList);
	        }

	    	if(!data.explorerWidth || parseInt(data.explorerWidth) < 100) {
	            data.explorerWidth = 250;
	    	}
	    	if(!data.sqlBrowserWidth || parseInt(data.sqlBrowserWidth) < 100 || parseInt(data.sqlBrowserWidth) > 400) {
	            data.sqlBrowserWidth = 200;
	    	}
	    	if(!data.datapanelHeight || parseInt(data.datapanelHeight) < 200) {
		        data.datapanelHeight = 200;
	        }
	        Dbl.UserSettings.explorerWidth = data.explorerWidth;
	        Dbl.UserSettings.explorerCollapsed = data.explorerCollapsed;

	        Dbl.UserSettings.sqlBrowserWidth = data.sqlBrowserWidth;
	        Dbl.UserSettings.sqlBrowserCollapsed = data.sqlBrowserCollapsed;


	        Dbl.UserSettings.datapanelHeight = data.datapanelHeight;
	        Dbl.UserSettings.datapanelHidden = data.datapanelHidden;

	        Dbl.UserActivity.keys = data;
	        Editor.defaultSQLDelimiter = data.sqlDelimiter ? data.sqlDelimiter : ';';
	        Dblite.refreshServerList();

	        Server.restoring = true;
	        var connection = Dbl.UserActivity.getValue('connection');
	        var connection_db = Dbl.UserActivity.getValue('connection_db');

	        if(connection) {
		        Server.serverChanged(connection, connection_db);
	        }

	        Server.restoring = false;
	        Dblite.init();
    });
  }
};

Ext.onReady(Dbl.UserSettings.getSettings, null, {
      delay : Ext.isGecko ? 1000 : 1000
});
