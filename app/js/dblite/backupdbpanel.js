Dbl.BackupDbPanel = function(data) {
	var arrayStore =  new Ext.data.ArrayStore({
	    fields: ['value'],
	    data: data.result,
	    sortInfo: {
	        field: 'value',
	        direction: 'ASC'
	    }
	});

	var table_status = (data.current_table)? 1 : 0;

	Dbl.BackupDbPanel.superclass.constructor.call(this, {
		id : 'backup_db',
		region : 'center',
		xtype : 'panel',
		layout : 'fit',
		items : [ this.createForm(data.curr_db, arrayStore, table_status) ]
	});
};

Ext.extend(Dbl.BackupDbPanel, Ext.Panel, {
	createForm: function(curr_db, arrayStore, table_status) {
	
	var availableTables =  new Ext.data.ArrayStore({
	    fields: ['value'],
	    data: [],
	});
	
	return new Ext.FormPanel({
			fileUpload: true,
			frame: true,
			id: 'backup_form',
			labelAlign: 'top',
			bodyStyle: "padding: 5px",
			defaults: {
				anchor: '100%'
			},
			items:[{
				layout: 'column',
				items:[{
					columnWidth: .25,
					items: this.renderBackupDbExportOptions()
					},
					{
						columnWidth: .75,
						bodyStyle: 'padding-left: 10px;',
						layout: 'form',
						labelWidth: 50,
						defaults: {
							anchor: '100%'
						},
						items: this.renderBackupDbOptions(curr_db, table_status)
					}

				]
			},
			{
				xtype: 'hidden',
				name: 'selected_db',
				value: curr_db
			},{
				xtype: 'hidden',
				name: 'connection_id',
				value: Server.connection_id
			},
			{
				xtype: 'itemselector',
				name: 'tables_lists',
				imagePath: '../app/images/itemselector/',
				bodyStyle: "padding: 0px 10px",
				availableLegend: "Available tables",
				selectedLegend: "Selected tables",
				multiselects: [{
	                width: 280,
	                height: 135,
	                store: availableTables,
   	                displayField: 'value',
   	                valueField: 'value'

				}, {
	                width: 280,
	                height: 135,
	                store: arrayStore,
	                displayField: 'value',
	                valueField: 'value'
	            }]
 			}
			],
			buttons:[{
	    	  	text: "Export",
	    	  	handler: function() {
					var formObj = Ext.getCmp('backup_form').getForm();
					if(formObj.getValues().tables_lists == '') {
						Dbl.Utils.showErrorMsg(Messages.getMsg('backupdb_notable_selected'), '');
						return false;
					}
					formObj.getEl().dom.action = MAIN_URL + '/cmd.php?command=export.export_as_sql&form=1';
					formObj.getEl().dom.method = 'POST';
					formObj.getEl().dom.target = 'download_frame';
					formObj.submit();
	      		}
	      	}/*,
	      	{
	    	  	text: "cancel",
	    	  	handler: function() {
	      			Ext.getCmp("backup_db_window").close();
	      		}
	      	}*/]
		});
	},

	renderBackupDbExportOptions : function() {
		/*{
		xtype: 'fieldset',
		title: 'Export As',
		items: [{
				xtype: 'radiogroup',
				columns: 1,
				defaults: {
					anchor: '100%'
				},
				items: [{
							name: 'export_type',
							boxLabel: 'SQL',
							inputValue: 'sql',
							style: {
								marginRight: '4px'
							},
							checked: true,
							listeners: {
								focus: function() {
									Ext.getCmp('options_group').enable();
									Ext.getCmp('export_group').enable();
									Ext.getCmp('innodb_options').enable();
								}
							}
						},
						{
							name: 'export_type',
							boxLabel: 'XML',
							inputValue: 'xml',
							style: {
								marginRight: '4px'
							},
							listeners: {
								focus: function() {
									Ext.getCmp('options_group').enable();
									Ext.getCmp('export_group').enable();
									Ext.getCmp('innodb_options').disable();
								}
							}
						}/*,
						{
							name: 'export_type',
							boxLabel: 'CSV',
							inputValue: 'csv',
							style: {
								marginRight: '4px'
							},
							listeners: {
								focus: function() {
									Ext.getCmp('options_group').disable();
									Ext.getCmp('export_group').disable();
								}
							}
						}
				]
		}]
	},*/		
		return [{
					xtype: "tbtext",
					text: "<b>Exporting as SQL</b>",
					anchor: '95%',
					style: {
		        		margin: "3px 0px 10px"
		        	}
				},
				{
					xtype: "hidden",
					name: 'export_type',
					value: "sql"
				},
				Dbl.Utils.loadExportDataOptions()

				];
	},

	renderBackupDbOptions: function(current_db, table_status) {
		var checkboxGroupItems  = this.loadCreateDbOptions(table_status);

		return [/*{
					fieldLabel: "Save as",
					name: "save_as",
					xtype: 'fileuploadfield',
				    id: 'backup_file',
					emptyText: 'Select a location'
				},*/
		        {
					xtype: "tbtext",
					text: "Selected DB: <b>" + current_db + "</b>",
					anchor: '95%',
					style: {
		        		margin: "3px 0px 10px"
		        	}
				},
				{
					xtype: 'fieldset',
					title: 'Options',
					id: 'options_set',
					bodyStyle: "padding: 0px 10px",
					items:[{
							xtype: 'checkboxgroup',
							columns: 2,
							id: 'options_group',
							defaults: {
								anchor: '100%'
							},
							items: checkboxGroupItems
							}
					]
				},
				{
					xtype: 'fieldset',
					title: 'InnoDB options',
					collapsible: true,
					collapsed: true,
					bodyStyle: "padding: 0px 10px",
					items:[{
						xtype: 'checkboxgroup',
						columns: 1,
						id: 'innodb_options',
						defaults: {
							anchor: '100%'
						},
						items: [{
									boxLabel: 'Disable Foreign key checks',
									name: 'options[]',
									inputValue: 'disable_foreign_keys'
								}/*,
						        {
									boxLabel: 'Export as a transaction',
									name: 'options[]',
									inputValue: 'transaction'
								}*/
							]
						}
					]
				}
				];
	},

	loadCreateDbOptions: function(table_status) {

		var createDbObj = {
				boxLabel: 'Add "CREATE DATABASE"',
				name: 'options[]',
				inputValue: 'create_db',
				checked: true
		};

		var dropDbObj = {
				boxLabel: 'Add "DROP DATABASE"',
				name: 'options[]',
				inputValue: 'drop_db',
				checked: true
		};

		var dropTableObj = {
				boxLabel: 'Add "DROP TABLE"',
				name: 'options[]',
				inputValue: 'drop_table',
				checked: true
		};
		var addCommObj = {
				boxLabel: 'Add "COMMENTS"',
				name: 'options[]',
				inputValue: 'add_comments',
				checked: true
		};

		var completeInstObj = {
				boxLabel: 'Complete inserts',
				name: 'options[]',
				inputValue: 'complete_insert',
				checked: true
		};
		var extInstObj = {
				boxLabel: 'Extended inserts',
				name: 'options[]',
				inputValue: 'extended_insert',
				checked: true
		};

		var addProFuncObj = {
				boxLabel: 'Add "VIEWS/EVENTS/TRIGGERS and PROCEDURE/FUNCTION ROUTINES"',
				name: 'options[]',
				inputValue: 'add_proc_func'
		};

		var autoIncrObj = {
				boxLabel: 'Add "AUTO_INCREMENT" value',
				name: 'options[]',
				inputValue: 'add_autoincr',
				checked: true
		};

		if(table_status)
			return [dropTableObj, addCommObj, completeInstObj, extInstObj, autoIncrObj];
		else
			return [createDbObj, dropDbObj, dropTableObj, addCommObj, completeInstObj, extInstObj, addProFuncObj, autoIncrObj];
	}
});
