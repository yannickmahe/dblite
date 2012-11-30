/**
 * @constructor
 */
Dbl.TableDDLPanel = function(ddl) {
	var panel = this.getDDLPanel(ddl);

	Dbl.TableDDLPanel.superclass.constructor.call(this, {
		id: 'table_ddl_panel',
       	layout: 'fit',
		split: true,
		border: false,
		header: false,
		tbar: this.buildTopToolbar(),
		items: [panel],
		listeners: {
			afterlayout: function() {
				Dbl.Utils.removeLoadingIcon();
			}
		}
	});
};

Ext.extend(Dbl.TableDDLPanel, Ext.Panel, {
	buildTopToolbar : function() {
		var refreshBtn = {
				xtype: 'tbbutton',
				text:'Refresh',
				id: 'refresh_ddl_btn',
				tooltip: 'Refresh',
				iconCls: 'refresh_ddl_btn',
				width: 75,
				ref: '../refreshDDLBtn',
				handler: this.refreshDDL,
				scope: this
		};

		var autoRefreshBtn = {
				text:'Auto Refresh',
				tooltip: 'Auto Refresh',
				iconCls: 'refresh_ddl_btn',
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
		        				var toolbar = Dbl.Utils.getAutoRefreshToolbar();
		        				var form = toolbar.items.get(0).items.get(1).menu.items.get(0);
								var fields = form.getForm().getFieldValues();
								if(fields.second < 1 || fields.second > 86400) {
									return false;
								}
				        		toolbar.items.get(0).items.get(1).menu.hide();
				        		toolbar.items.get(0).disable();
				        		toolbar.items.get(1).show();
				        		toolbar.items.get(2).show();
				        		Ext.getCmp('table_ddl_panel').autorefresh_lap = fields.second;
				        		Dbl.Utils.startTaskRunner(fields.second, '', '', '', 'TABLEDDL');
			        	    }
			          }, {
		        			text: 'Cancel',
		        			tooltip: 'Cancel auto refresh',
		        			width: 75,
		        			handler: function() {
		        				var toolbar = Dbl.Utils.getAutoRefreshToolbar();
				        		toolbar.items.get(0).items.get(1).menu.hide();
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
					Ext.getCmp('table_ddl_panel').autorefresh_lap = null;
					var toolbar = Dbl.Utils.getAutoRefreshToolbar();
					toolbar.items.get(0).enable();
					toolbar.items.get(1).hide();
		    		toolbar.items.get(2).hide();
		    		Dbl.Utils.stopTaskRunner(this.updatetask, this.updaterunner, this.delayedtask);
				}
		};

		
		return [{
				xtype: 'buttongroup',
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

   },
   
   refreshDDL: function() {
		Database.sendCommand('get_table_ddl', {
			table: Dbl.UserActivity.getValue('table'), 
			database: Dbl.UserActivity.getValue('database'),
			scope: this},
			function(data) {
				this.removeAll();
				var panel = this.getDDLPanel(data.result[0][1]);
				this.add(panel);
				this.doLayout();
				if(this.autorefresh_lap) {
					Dbl.Utils.startTaskRunner(this.autorefresh_lap, '', '', '', 'TABLEDDL');			
				}
		   });
   },
   
   getDDLPanel: function(ddl) {
		return {
				xtype: 'uxCodeMirrorPanel',
				parser: 'sql',
				padding: '5',
				border: false,
				autoScroll: true,
				sourceCode: ddl,
			    codeMirror: {
			        height: '100%',
			        width: '100%',
			        lineNumbers: false,
			        readOnly: true
			    }
		};
   }
   
});
