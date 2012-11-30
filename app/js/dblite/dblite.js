var Dblite = {
  loadMask : '',
  waitMask : '',
  dataPanel : '',
  window : '',
  viewport: '',
  rightPanel: '',

  init : function() {
    Topmenu.init();
	Explorer.init();
    Editor.init();
    Dblite.dataPanel = new Dbl.DataPanel();
    Ext.QuickTips.init();
    Dblite.createIframe();

    this.rightPanel = new Ext.Panel({
      region : 'center',
      split : true,
      margins : '0 0 0 0',
      border : false,
      layout : 'border',
      items : [ Editor.containerPanel, Dblite.dataPanel ]
    });

    this.viewport = new Ext.Viewport({
      layout : 'border',
      items : [ Topmenu.menuPanel, Explorer.explorerPanel, this.rightPanel ]
    });

    // initialize load/wait masks
    Dblite.intializeMasks();

    Dbl.UserActivity.restore();

  },

  showWindow : function(params) {
    if (Dblite.window) {
      Dblite.window.close();
    }
    Dblite.window = new Ext.Window(params);
    Dblite.window.show();
  },

  refreshServerList : function(callback) {
    Server.sendCommand('connection.get_connections', {},
    	function(data) {
    		Dblite.connectionStore.loadData(data);
    		var comboData = [];
    		for(var i=0;i<data.length;i++) {
    			comboData.push([data[i][0], data[i][4], false]);
    		}
    		comboData.push(['Add new connection', false,  true]);
    		Dblite.connectionComboStore.loadData(comboData);
    		if(callback) {
    			callback();
    		}
    	});
  },

  connectionStore : new Ext.data.SimpleStore({
    fields : [ 'connection_id', 'type', 'host', 'user', 'database', 'port', 'password', 'save_password' ]
  }),

  connectionComboStore : new Ext.data.SimpleStore({
    fields : [ 'connection_id', 'database', 'show_new_conn_window']
  }),

  databaseComboStore : new Ext.data.SimpleStore({
		    fields : [ 'database']
  }),

  intializeMasks : function() {
    if (!Dblite.loadMask) {
      Dblite.loadMask = new Ext.LoadMask(document.body, {
        msg : Messages.getMsg('load_mask')
      });
    }

    if (!Dblite.waitMask) {
      Dblite.waitMask = new Ext.LoadMask(document.body, {
        msg : Messages.getMsg('wait_mask')
      });
    }
  },

  createIframe : function() {
    Ext.DomHelper.append(document.body, {
      tag : 'iframe',
      frameBorder : 0,
      name : 'download_frame',
      id : 'download_frame',
      width : 0,
      height : 0,
      css : 'display:none;visibility:hidden;height:1px;',
      src : ''
    });
  },

  showHideDataPanel: function() {
  	if(Dblite.dataPanel.hidden) {
  		Dblite.dataPanel.show();
  	} else {
  		Dblite.dataPanel.hide();
  	}
  	Dblite.rightPanel.doLayout();
  },

  showHideEditorPanel: function() {
  	if(!Dblite.dataPanel.hidden) {
		if(Dblite.rightPanel.getHeight() > Dblite.dataPanel.getHeight()) {
			Dblite.dataPanel.setHeight(Dblite.rightPanel.getHeight());
		} else {
			Dblite.dataPanel.setHeight(Dblite.rightPanel.getHeight()-250);
		}
  	}
  	Dblite.rightPanel.doLayout();
  }
};


//Ext.onReady(Dblite.init, null,
//Ext.onReady(Dbl.UserSettings.getSettings, null,
//    {
//          delay : Ext.isGecko ? 3000 : 3000
//    });
