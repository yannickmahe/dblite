/* Functionality for viewing table data and table structure */

Dbl.DbStructurePanel = function() {
	Dbl.DbStructurePanel.superclass.constructor.call(this, {
		activeItem: Dbl.UserActivity.getValue('activeDbTab'),
		cls: 'dbl-subtab',
		margins: '0 5 0 5',
		resizeTabs: true,
		minTabWidth: 125,
		border: false,
		tabPosition: 'top',
		enableTabScroll:true,
		items: [{
			id: 'table_list',
			title: 'Table List',
			layout: 'fit',
			listeners: { activate: this.activate1, scope: this },
			items: []
		}, {
			id: 'table_full_list',
			title: 'Table Information',
			layout: 'fit',
			autoScroll: true,
			listeners: { activate: this.activate1, scope: this },
			items: []
		}, {
			id: 'view_list',
			title: 'View List',
			layout: 'fit',
			autoScroll: true,
			listeners: { activate: this.activate1, scope: this },
			items: []
		}, {
			id: 'procedure_list',
			title: 'Procedure List',
			layout: 'fit',
			autoScroll: true,
			listeners: { activate: this.activate1, scope: this },
			items: []
		}, {
			id: 'function_list',
			title: 'Function List',
			layout: 'fit',
			autoScroll: true,
			listeners: { activate: this.activate1, scope: this },
			items: []
		}]
	});
};

Ext.extend(Dbl.DbStructurePanel, Ext.TabPanel, {
	
	activate1: function() {
		var tabId = this.getActiveTab().id;
		Dbl.UserActivity.dataPanel.dbTabChanged(tabId);
		
		Dbl.Utils.addLoadingIcon();
		
		if(!Server.connection_id) {
			this.showMsgPanel(Messages.getMsg('noconnection_selected'));
			Dbl.Utils.removeLoadingIcon();
		}
		else if(!Dbl.UserActivity.getValue('database')) {
			this.showMsgPanel(Messages.getMsg('nodatabase_selected'));
			Dbl.Utils.removeLoadingIcon();
		}
		else if(tabId == 'table_list') {
			this.showPanel();
			Dbl.Settings.lastDbTabId = tabId;
		}
		else if(tabId == 'table_full_list') {
			this.showPanel();
			Dbl.Settings.lastDbTabId = tabId;
		} 
		else if(tabId == 'view_list') {
			this.showPanel();
			Dbl.Settings.lastDbTabId = tabId;
		} 
		else if(tabId == 'procedure_list') {
			this.showPanel();
			Dbl.Settings.lastDbTabId = tabId;
		} 
		else if(tabId == 'function_list') {
			this.showPanel();
			Dbl.Settings.lastDbTabId = tabId;
		} 
	},
	showMsgPanel: function(msg) {
		var activeTab = this.getActiveTab();
		activeTab.removeAll();
		activeTab.add({padding: '10px', border: false, html: msg});
		activeTab.doLayout();
	},

	showPanel: function() {
		var activeTab = this.getActiveTab();
		var database = Dbl.UserActivity.getValue('database');
		if(!database) {
			Dbl.Utils.removeLoadingIcon();
			return;
		}
		if(activeTab.database == database) {
			activeTab.doLayout();
			Dbl.Utils.removeLoadingIcon();
			return;
			
		} 
		
		var command = "get_db_tables"; 
		if(activeTab.id == "table_list") {
			command = "get_db_tables";
		}
		if(activeTab.id == "table_full_list") {
			command = "get_db_full_tables";
		}
		if(activeTab.id == "view_list") {
			command = "get_db_views";
		}
		if(activeTab.id == "procedure_list") {
			command = "get_db_procedures";
		}
		if(activeTab.id == "function_list") {
			command = "get_db_functions";
		}
		Database.sendCommand(command, {dbname: database, asView: true, refreshable: true}, function(data) {
			activeTab.database = database;
			activeTab.removeAll();
			activeTab.add(data.panel);
			activeTab.doLayout();
		});
	}
});