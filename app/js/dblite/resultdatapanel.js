/* Functionality for viewing result set */

Dbl.ResultDataPanel = function(result, index) {
	var tbar  = this.getTopBar(result, index);
	var panel = this.getChildPanel(result, index);
	return new Ext.Panel({
			id: 'result_tab_' + index,
			title: index +'. Result',
			result_file: result.result_separator,
			iconCls: 'tabs',
			sql: result.sql,
			layout: 'fit',
			tbar: tbar,
			closable: true,
			items: [panel],
			listeners: {
				activate: this.activate,
				beforeclose: this.handleBeforeClose,
				scope: this
			}
		});
};

Ext.extend(Dbl.ResultDataPanel, Ext.Panel, {
	activate: function(panel) {
		panel.doLayout();
	},
	
	handleBeforeClose: function(panel) {
		this.checkAndStopTaskRunner(panel);
		Editor.deleteResultFiles(panel.result_file);
	},
	
	checkAndStopTaskRunner: function(panel) {
		var index = panel.getId().substr(11);
		if(panel.autorefresh_lap) {
			var toolbar = Ext.getCmp('result_tbar_' + index).getTopToolbar();
			var stopbtn = toolbar.items.get(6).items.get(1);
			Dbl.Utils.stopTaskRunner(stopbtn.updatetask, stopbtn.updaterunner, stopbtn.delayedtask);
		}
	},

	getChildPanel: function(result, index) {
		var panel = {};
		if(result.hasError) {
			panel = {
				border: false,
				html: result.msg,
				bodyStyle: 'padding: 5px'
			};
		} 
		else if(result.isSelectSQL) {
			panel = new Dbl.ResultGridPanel(result, index);
		}
		else if(!result.isSelectSQL) {
			panel = { 
				border: false,
				html: result.execution_status,
				bodyStyle: 'padding: 5px'
			};
		}
	
		return panel;	
	},
	
	createToolbar: function(data, index) {
    	var refreshBtnGroup = this.getRefreshButtonGroup(data, index);
		var buttons =  [{
						xtype: 'buttongroup',
						disabled: data.hasError ? true : false,
						items: [{
							text: 'Export',
							id: "export_" + index,
							tooltip: 'Export result set',
							iconCls: 'copy_table',
							width: 75,
							disabled: (!data.isSelectSQL) ? true : false,
							handler: this.exportData.createDelegate(this)
						}]

					}, '-', {
						xtype: 'buttongroup',
						disabled: false,
						items: [{
					    	text: 'Show SQL',
					    	id: 'show_sql_' + index,
					    	tooltip: 'Show SQL',
					    	iconCls: 'preview_sql',
					    	width: 90,
					    	handler: this.showSQL.createCallback(index)
					    }, {
					    	text: 'Hide SQL',
					    	id: 'hide_sql_' + index,
					    	tooltip: 'Hide SQL',
					    	iconCls: 'cancel_preview_sql',
					    	width: 90,
					    	hidden: true,
					    	handler: this.hideSQL.createCallback(index)
					    }]
					}, '-'];

		return  buttons.concat(refreshBtnGroup);
	},
	
	exportData: function() {
		var activeTab = Dblite.dataPanel.getActiveTab();
		var tabid = activeTab.getId();
		var index = tabid.substr(11);
		var store = Ext.getCmp('result_grid_'+index).getStore();
		var fieldstore = new Array();
		for(var i=0; i<store.fields.items.length; i++) {
			fieldstore[i] = new Array(store.fields.items[i].name);
		}
		var data = {};
		data.data = fieldstore;
	   	data.curr_table = '';
	   	data.sql = activeTab.sql;
	   	data.curr_db = Explorer.selectedDatabase;
		this.win = new Dbl.ContextMenuWindow({
			title : "Export Result Set",
			id : "export_table",
			width : 560,
			height : 240,
			onEsc: function(){},
			items: [new Dbl.ExportTableDbPanel(data)]
		});
		this.win.show();
	},
	
	refreshCurrentPage: function() {
		var activeTab = Dblite.dataPanel.getActiveTab();
		var index = activeTab.getId();
		index = index.substr(11);
		Server.sendCommand('database.execute_queries', {
			sql: activeTab.sql,
			sqldelim: Editor.defaultSQLDelimiter,
			scope: this},
			function(data){	
				activeTab.removeAll();
				activeTab.add(this.getChildPanel(data[0], index));
				activeTab.doLayout();
			}, function(data){
				var errorMsg = data.msg ? data.msg : data;
				DbliteUtils.showErrorMsg(errorMsg, '');
			});
	},
	
	getTopBar: function(result, index) {
		var sqlPanel = {
				id: 'result_sql_' + index,
				xtype: 'uxCodeMirrorPanel',
				parser: 'sql',
				padding: '2',
				autoScroll: true,
				hidden: true,
				border: false,
				sourceCode: result.sql,
		        codeMirror: {
	                height: '25%',
	                width: '100%',
	                lineNumbers: false,
	                readOnly: true
	            }
			};
		
		return new Ext.Panel({
			    id: 'result_tbar_' + index,
				autoScroll: true,
			    border : false,
		        layout: 'fit',
		        tbar : this.createToolbar(result, index),
		        items: [sqlPanel ]
			});
	},
	
	showSQL: function(index) {
		Ext.getCmp('show_sql_' + index).hide();
		Ext.getCmp('hide_sql_' + index).show();
		Ext.getCmp('result_tbar_' + index).get('result_sql_' + index).show();
		Ext.getCmp('result_tbar_' + index).doLayout();
	}, 
	
	hideSQL: function(index) {
		Ext.getCmp('hide_sql_' + index).hide();
		Ext.getCmp('show_sql_' + index).show();
		Ext.getCmp('result_tbar_' + index).get('result_sql_' + index).hide();
		Ext.getCmp('result_tbar_' + index).doLayout();
	},
	
	getRefreshButtonGroup: function(data, index) {
    	var refreshBtn = {
			    text:'Refresh',
			    id: "refresh_table_" + index,
			    tooltip: 'Execute SQL',
			    iconCls: 'table_data_refresh',
			    width: 75,
			    handler: this.refreshCurrentPage.createDelegate(this),
    	};

		var autoRefreshBtn = {
				text:'Auto Refresh',
				tooltip: 'Auto execute SQL',
				iconCls: 'table_data_refresh',
				iconAlign: 'left',
				width: 75,
				menu: {
		        	xtype: 'menu',
		        	plain: true,
		        	items: [{
		        		xtype: 'form',
		        		labelWidth: 75, 
		        		frame: true,
		        		header: false,
		        		border: false,
		        		width: 200,
		        		defaults: {width: 98},
		        		defaultType: 'textfield',
		        		items: [{
			            	//xtype: 'spinnerfield',
			            	fieldLabel: 'Interval(sec)',
			            	name: 'second',
			            	minValue: 1,
			            	maxValue: 86400,
			            	value: 10
		        		}],
		        		buttons: [{
		        			text: 'Start',
		        			tooltip: 'Start auto refresh',
		        			width: 75,
		        			handler: function() {
		        				var toolbar = Ext.getCmp('result_tbar_' + index).getTopToolbar();
								toolbar.items.get(0).disable();
								toolbar.items.get(2).disable();
		        				
		        				var refreshBtns = toolbar.items.get('tabledata_refresh_btns_' + index);
		        				var form = refreshBtns.items.get(1).menu.items.get(0);
								var fields = form.getForm().getFieldValues();
								if(fields.second < 1 || fields.second > 86400) {
									return false;
								}
								
								refreshBtns.items.get(1).menu.hide();
								refreshBtns.disable();
								refreshBtns.nextSibling().show();
								refreshBtns.nextSibling().nextSibling().show();
				        		Ext.getCmp('result_tab_' + index).autorefresh_lap = fields.second;
				        		Dbl.Utils.startTaskRunner(fields.second, '', {index: index}, '', 'SQLRESULT');
			        	    }
			          }, {
		        			text: 'Cancel',
		        			tooltip: 'Cancel auto refresh',
		        			width: 75,
		        			handler: function() {
			        	  		var toolbar = Ext.getCmp('result_tbar_' + index).getTopToolbar();
		        				var refreshBtns = toolbar.items.get('tabledata_refresh_btns_' + index);
		        				refreshBtns.items.get(1).menu.hide();
			          		}
			          }]
		        }]
			} 
		};

		var stopBtn = {
		        text: 'Stop',
		        tooltip: 'Stop auto refresh',
		        iconCls: 'stop_auto_refresh',
		        handler: function() {
					Ext.getCmp('result_tab_' + index).autorefresh_lap = null;
					var toolbar = Ext.getCmp('result_tbar_' + index).getTopToolbar();
					toolbar.items.get(0).enable();
					toolbar.items.get(2).enable();

					var refreshBtns = toolbar.items.get('tabledata_refresh_btns_' + index);
					refreshBtns.enable();
					refreshBtns.nextSibling().hide();
					refreshBtns.nextSibling().nextSibling().hide();
		    		Dbl.Utils.stopTaskRunner(this.updatetask, this.updaterunner, this.delayedtask);
				}
		};

		return [{
				xtype: 'buttongroup',
				disabled: data.hasError ? true : false,
				id: 'tabledata_refresh_btns_' + index,
				disabled: false,
				items: [refreshBtn, autoRefreshBtn]
			}, {
				xtype: 'tbseparator',
				hidden: true,
			}, {
				xtype:'buttongroup',
				hidden: true,
				items: [{
					 iconAlign: 'left',
	            	 text: 'Refreshing automatically',
	            	 width: 200
				}, stopBtn]
	    }];

	}
	
});
