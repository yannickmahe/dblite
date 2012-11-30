/* Functionality for viewing table data and table structure */

Dbl.TableStructurePanel = function() {
	Dbl.TableStructurePanel.superclass.constructor.call(this, {
		activeItem: Dbl.UserActivity.getValue('activeTableTab'),
		cls: 'dbl-subtab',
		resizeTabs:true,
		border: false,
		minTabWidth: 125,
		tabPosition: 'top',
		enableTabScroll:true,
		items: [{
			id: 'table_data',
			title: (Dbl.UserActivity.getValue('table_type') == 'view') ? 'View data': 'Table data',
			layout: 'fit',
			listeners: { activate: this.activate1, scope: this },
			items: []
		}, {
			id: 'column_info',
			title: 'Columns',
			layout: 'fit',
			listeners: { activate: this.activate1, scope: this },
			items: []
		}, {
			id: 'index_info',
			title: 'Indexes',
			layout: 'fit',
			autoScroll: true,
			listeners: { activate: this.activate1, scope: this },
			items: []
		}, {
			id: 'table_ddl',
			title: 'DDL',
			layout: 'fit',
			autoScroll: true,
			listeners: { activate: this.activate1, scope: this },
			items: []
		}, {
			id: 'table_information',
			title: 'Information',
			layout: 'fit',
			autoScroll: true,
			listeners: { activate: this.activate1, scope: this },
			items: []
	   }]
	});
};

Ext.extend(Dbl.TableStructurePanel, Ext.TabPanel, {
	lastTabId: 'column_info',
	activate1: function() {
	
		var activeTab = this.getActiveTab();
		var tabId = activeTab.id;
		Dbl.UserActivity.dataPanel.tableTabChanged(tabId);
		
		Dbl.Utils.addLoadingIcon();
		
		if(!Server.connection_id) {
			this.showMsgPanel(Messages.getMsg('noconnection_selected'));
			Dbl.Utils.removeLoadingIcon();
		}
		else if(!Dbl.UserActivity.getValue('table')) {
			this.showMsgPanel(Messages.getMsg('notable_selected'));
			Dbl.Utils.removeLoadingIcon();
		}
		else if(tabId == 'table_data') {
			this.showPanel(activeTab, 'get_table_columns');
		}
		else if(tabId == 'column_info') {
			this.showPanel(activeTab, 'get_table_creation_info');
		}
		else if(tabId == 'index_info') {
			this.showPanel(activeTab, 'get_min_table_indexes');
		}
		else if(tabId == 'table_ddl') {
			this.showInfoPanel('get_table_ddl', false, true);
		}
		else if(tabId == 'table_information') {
			this.showInfoPanel('get_table_status', true, true);
		}
	},

	
	showMsgPanel: function(msg) {
		var activeTab = this.getActiveTab();
		activeTab.removeAll();
		activeTab.add({padding: '10px', border: false, html: msg});
		activeTab.doLayout();
	},
	
	showInfoPanel: function(command, asView, refreshable) {
		var dbTable = Dbl.UserActivity.getValue('database')+'.'+Dbl.UserActivity.getValue('table');
	  	var activeTab = this.getActiveTab();
	  	if(activeTab.table == dbTable) {
			activeTab.doLayout();
			Dbl.Utils.removeLoadingIcon();
			return;
		}
		
		Database.sendCommand(command, {
			table: Dbl.UserActivity.getValue('table'), 
			database: Dbl.UserActivity.getValue('database'),
			asView: asView,
			refreshable: refreshable},
			function(data) {
				activeTab.removeAll();
				activeTab.table = dbTable;
				this.lastTabId = activeTab.id;
				var panel = data.panel;
				if(activeTab.id == "table_ddl") {
					panel = new Dbl.TableDDLPanel(data.result[0][1]);
				}
//				else if(activeTab.id == "table_information") {
//					panel = new Dbl.TableInformationPanel(data.panel);
//				}
				activeTab.add(panel);
				activeTab.doLayout();
			}
		);
	},

	showPanel: function(activeTab, command) {
	  var dbTable = '`' + Dbl.UserActivity.getValue('database')+'`.`'+Dbl.UserActivity.getValue('table') + '`';
	  if(activeTab.table == dbTable) {
			activeTab.doLayout();
			Dbl.Utils.removeLoadingIcon();
			return;
		}
		Server.sendCommand(command, 
				{table: dbTable, scope: this},
				function(data) {
				  var dbTable = '`' + Dbl.UserActivity.getValue('database')+'`.`'+Dbl.UserActivity.getValue('table') + '`';
					activeTab.removeAll();
					var panel = "";
					if(activeTab.id == "table_data") {
						panel = new Dbl.TableDataPanel(dbTable, data.columns);
					}
					else if(activeTab.id == "column_info") {
						data.create_table = false;
						data.alter_table = true;
						panel = new Dbl.CreateTablePanel(data);
					}
					else if(activeTab.id == "index_info") {
						panel = new Dbl.ManageIndexPanel(data);
					}
					else {
						panel = new Dbl.ListViewPanel({data: data.data, fields: data.fields, models: data.models, border: false});
					}
					activeTab.table = dbTable;
					this.lastTabId = activeTab.id;
					activeTab.add(panel);
					activeTab.doLayout();
				}
		);
	}
});
