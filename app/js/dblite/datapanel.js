/* Functionality for viewing table data and table structure */

Dbl.DataPanel = function(database, table, columns) {
  Dbl.DataPanel.superclass.constructor.call(this, {
    id : 'datapanel',
    title : 'Result',
    region : 'south',
    height : parseInt(Dbl.UserSettings.datapanelHeight),
    hidden: Dbl.UserSettings.datapanelHidden,
    minSize : 200,
    maxSize : 800,
    split : true,
    activeItem : Dbl.UserActivity.getValue('datapanelActiveTab'),
    border : true,
    margins : '0 2 0 0',
    resizeTabs : true,
    minTabWidth : 115,
    enableTabScroll : true,
    items : [{
		      id : 'serverstructure',
		      title : 'Connection',
		      tabTip: 'Connection',
		      layout : 'fit',
		      listeners : {
		        activate : function() {
		          this.activate1();
		        },
		        scope : this
		      },
		      items : []
    	}, {
		      id : 'dbstructure',
		      title : 'DB Structure',
		      tabTip: 'DB Structure',
		      layout : 'fit',
		      listeners : {
		        activate : function() {
		          this.activate1();
		        },
		        scope : this
		      },
		      items : []
    	}, {
		      id : 'tablestructure',
		      title : 'Table Structure',
		      tabTip: 'Table Structure',
		      layout : 'fit',
		      listeners : {
		        activate : function() {
		          this.activate1();
		        },
		        scope : this
		      },
		      items : []
    	}, {
	          id : 'history',
		      title : 'History',
		      tabTip: 'Query execution history',
		      layout : 'fit',
		      autoScroll : true,
		      listeners : {
		          activate : function() {
		            this.activate1();
		          },
		          scope : this
    		  },
    		  items : []
    }],
    listeners: {
    	hide: this.handleAfterHide,
    	show: this.handleAfterShow,
    	scope: this
    }

  });
};

Ext.extend(Dbl.DataPanel, Ext.TabPanel, {
  selectedDatabase : '',
  selectedTable : '',
  reloadStructureData : true,
  tableDataPanel : '',
  tableStructurePanel : '',
  dbStructurePanel : '',
  serverStructurePanel : '',
  lastTableTabId : '',
  hide1 : function(tabId) {
    this.hideTabStripItem(tabId);
    this.get(tabId).hide();
  },
  unhide1 : function(tabId, activate) {
    this.unhideTabStripItem(tabId);
    this.get(tabId).hidden = false; // show seems to be firing the activate event
  },

  activate1 : function(force) {
    var tabId = this.getActiveTab().id;
    Dblite.historytab = 0;
    if (tabId == 'tablestructure') {
      this.showTableStructurePanel(force);
    }
    else if (tabId == 'dbstructure') {
      this.showDbStructurePanel(force);
    }
    else if (tabId == 'serverstructure') {
      this.showServerStructurePanel(force);
    }
    else if(tabId == 'history') {
    	Dblite.historytab = 1;
    	this.showHistoryPanel(force);
    }
    Dbl.UserActivity.dataPanel.tabChanged(tabId);
  },

  refresh : function(force) {
    if (Dbl.UserActivity.getValue('database')) {
      var cmp = Ext.getCmp('dbstructure');
      if (cmp) {
          cmp.setTitle("DB: " + Dbl.UserActivity.getValue('database'));
          Ext.fly(cmp.tabEl).child('span.x-tab-strip-text', true).qtip = 'Database: ' + Dbl.UserActivity.getValue('database');
      }
    }

    if (Dbl.UserActivity.getValue('database') && !Dbl.UserActivity.getValue('table')) {
    //  this.hide1('tablestructure');
      this.activate('dbstructure');
    } else if (Dbl.UserActivity.getValue('table')) {
      //this.unhide1('tablestructure');
      this.activate('tablestructure');
    }

    this.activate1(force);
  },

  showTableDataPanel : function(force) {
    var activeTab = this.getActiveTab();
    if (!Explorer.selectedTable) {
        return;
    }
    if (!force) {
      if (this.tableDataPanel && this.tableDataPanel.table
          && this.tableDataPanel.table == Explorer.selectedDbTable) {
    	  	return;
      }
    }
    // Dbl.Utils.showLoadMask();
    Server.sendCommand('get_table_columns', {
      table : Explorer.selectedTable,
      scope : this }, // TODO change
      function(data) {
          this.tableDataPanel = new Dbl.TableDataPanel(Explorer.selectedDbTable, data.columns);
          this.tableDataPanel.table = Explorer.selectedDbTable;
          activeTab.removeAll();
          activeTab.add(this.tableDataPanel);
          activeTab.doLayout();
      }, function(data) {
        var errorMsg = data.msg ? data.msg : data;
        Dbl.Utils.showErrorMsg(errorMsg, '');
      });
  },

  showHistoryPanel: function(force) {
	  var activeTab = this.getActiveTab();
	  var panel = '';
	  Server.sendCommand('get_history', { },
			  function(data) {
		  		panel = new HistoryPanel(data);
		  		activeTab.removeAll();
		  		activeTab.add(panel);
		  		activeTab.doLayout();
	  });
  },

  showTableStructurePanel : function(force) {
    var activeTab = this.getActiveTab();
    var dbTable = Dbl.UserActivity.getValue('database')+'.'+Dbl.UserActivity.getValue('table');
//    if (!dbTable) return;
    if (!force) {
      if (this.tableStructurePanel && this.tableStructurePanel.table
          && (this.tableStructurePanel.table == dbTable)) {
    	  return;
      }
    }
    this.tableStructurePanel = new Dbl.TableStructurePanel();

    if(Dbl.UserActivity.getValue('table_type') == 'view') {
    	this.tableStructurePanel.remove('index_info');
    	this.tableStructurePanel.remove('table_information');
    }

    this.tableStructurePanel.table = dbTable;
    if(Dbl.UserActivity.getValue('table')) {
    	var title = 'Table: ';
    	if(Dbl.UserActivity.getValue('table_type') == 'view') {
    		title = 'View: ';
    	}
    	activeTab.setTitle(title + Dbl.UserActivity.getValue('table'));
    	Ext.fly(activeTab.tabEl).child('span.x-tab-strip-text', true).qtip = activeTab.title;
    }
    activeTab.removeAll();
    activeTab.add(this.tableStructurePanel);
    activeTab.doLayout();
  },

  showServerStructurePanel : function(force) {
    var activeTab = this.getActiveTab();
    var connection = Dbl.UserActivity.getValue('connection');
   // if (!connection) return;
    if(!force) {
	    if (this.serverStructurePanel
	    		&& (this.serverStructurePanel.connection_id == connection)) {
		      			return;
	    }
    }
    this.serverStructurePanel = new Dbl.ServerStructurePanel();
    this.serverStructurePanel.connection_id = connection;
    if(connection) {
    	activeTab.setTitle("Conn: " + connection);
    	Ext.fly(activeTab.tabEl).child('span.x-tab-strip-text', true).qtip = 'Connection: ' + Dbl.UserActivity.getValue('connection');
    }
    activeTab.removeAll();
    activeTab.add(this.serverStructurePanel);
    activeTab.doLayout();
  },

  showDbStructurePanel : function(force) {
    var activeTab = this.getActiveTab();
    var database = Dbl.UserActivity.getValue('database');
//    if (!database) return;
    if (!force) {
      if (this.dbStructurePanel
    		  && this.dbStructurePanel.database
    		  	&& (this.dbStructurePanel.database == database)) {
    	  			return;
      }
    }
    var currentTabId = 0;
    this.dbStructurePanel = new Dbl.DbStructurePanel();
    this.dbStructurePanel.database = database;
    if(database) {
    	activeTab.setTitle("DB: " + database);
    	Ext.fly(activeTab.tabEl).child('span.x-tab-strip-text', true).qtip = 'Database :' + Dbl.UserActivity.getValue('database');
    }
    activeTab.removeAll();
    activeTab.add(this.dbStructurePanel);
    activeTab.doLayout();
  },

  removeTablePanelData : function() {
    var activeTab = this.getActiveTab();
    activeTab.removeAll();
    activeTab.add(new Ext.Panel({
      html : Messages.getMsg('notable_selected')
    }));
    activeTab.doLayout();
    Dbl.Utils.hideLoadMask();
  },

  addNewResultTabs : function(data) {
    // remove previous result tabs
    for ( var i = 0; i < Dblite.dataPanel.items.length; i++) {
      var item = Dblite.dataPanel.items.items[i];
      if (item.id != 'serverstructure'
    	  	&& item.id != 'dbstructure'
    	  		&& item.id != 'tablestructure'
    	  			&& item.id != 'history'
    	  				&& item.id != 'create_table_panel') {
					        Dblite.dataPanel.remove(item);
					        i--;
      }
    }

    for ( var i = 0; i < data.length; i++) {
      var index = i + 1;
      Dblite.dataPanel.add(new Dbl.ResultDataPanel(data[i], index));

      if(index == 1) {
          Ext.getCmp('result_tab_' + index).setTitle(index + '. Result', 'loading_icon');
          if(data[i].hasError || !data[i].isSelectSQL) {
        	  Ext.getCmp('result_tab_' + index).setIconClass(' ');
          }
      }
    }

    Dblite.dataPanel.activate('result_tab_1');
    Topmenu.enableExecuteButton();
  },

  addCreateTableTab: function(data) {
		var panel = new Dbl.CreateTablePanel(data);
		Dblite.dataPanel.add(panel);
		Dblite.dataPanel.activate(panel);
  },

  handleAfterShow: function(panel) {
       Dbl.UserActivity.pageLayout.showHideDatapanel();
  },

  handleAfterHide: function(panel) {
       Dbl.UserActivity.pageLayout.showHideDatapanel();
  }
});
