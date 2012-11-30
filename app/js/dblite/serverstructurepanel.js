/* Functionality for viewing table data and table structure */

Dbl.ServerStructurePanel = function() {
	Dbl.ServerStructurePanel.superclass.constructor.call(this, {
		activeItem: Dbl.UserActivity.getValue('activeConnTab'),
		cls: 'dbl-subtab',
		margins: '0 5 0 5',
		resizeTabs:true,
		minTabWidth: 115,
		tabPosition: 'top',
		border: false,
		enableTabScroll:true,
		items: [{
			id: 'db_list',
			title: 'Databases',
			layout: 'fit',
			listeners: { activate: this.activate1, scope: this },
			items: []
		}, {
			id: 'variables',
			title: 'Variables',
			layout: 'fit',
			autoScroll: true,
			listeners: { activate: this.activate1, scope: this },
			items: []
		},
		{
			id: 'statuses',
			title: 'Status',
			layout: 'fit',
			listeners: { activate: this.activate1, scope: this },
			items: []
		}, {
			id: 'processlist',
			title: 'Process List',
			layout: 'fit',
			autoScroll: true,
			listeners: { activate: this.activate1, scope: this },
			items: []
		}]
	});
};

Ext.extend(Dbl.ServerStructurePanel, Ext.TabPanel, {
	activate1: function() {
		var tabId = this.getActiveTab().id;
        Dbl.UserActivity.dataPanel.serverTabChanged(tabId);
        
        Dbl.Utils.addLoadingIcon();
        
		if(!Server.connection_id) {
			this.showMsgPanel(Messages.getMsg('noconnection_selected'));
			Dbl.Utils.removeLoadingIcon();
		}
		else if(tabId == 'db_list') {
			this.showPanel("get_server_databases");
		}
		else if(tabId == 'variables') {
			this.showPanel("get_server_variables");
		}
		else if(tabId == 'statuses') {
			this.showPanel("get_server_status");
		}
		else if(tabId == 'processlist') {
			this.showPanel("get_server_processes");
		}
	},
	showMsgPanel: function(msg) {
		var activeTab = this.getActiveTab();
		activeTab.removeAll();
		activeTab.add({padding: '10px', border: false, html: msg});
		activeTab.doLayout();
	},
	showPanel: function(command) {
		var activeTab = this.getActiveTab();

		if (activeTab.connection == Dbl.UserActivity.getValue('connection')) {
			Dbl.Utils.removeLoadingIcon();
			activeTab.doLayout();
			return;
	    }

		Database.sendCommand(command, {asView: true, refreshable: true, connectiondb: Dbl.UserActivity.getValue('connection_db')}, function(data) {
			activeTab.removeAll();
			activeTab.add(data.panel);
			activeTab.doLayout();
			activeTab.connection = Server.connection_id;
		});
	}
});
