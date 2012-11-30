Dbl.ExportTableDbPanel = function(data) {
	var arrayStore =  new Ext.data.ArrayStore({
	    fields: ['value'],
	    data: (data.data) ? data.data : data.result,
	});

	var selected_sql = (data.sql)? data.sql : '';

	Dbl.ExportTableDbPanel.superclass.constructor.call(this, {
		id : 'export_table_panel',
		region : 'center',
		xtype : 'panel',
		layout : 'fit',
		border: false,
		items : [ this.createForm(data.curr_db, data.curr_table, arrayStore, selected_sql) ]
	});
};

Ext.extend(Dbl.ExportTableDbPanel, Ext.Panel, {
	createForm: function(current_db, current_table, arrayStore, selected_sql) {
		return new Ext.FormPanel({
	        fileUpload: true,
	        frame: true,
	        labelAlign: 'top',
	        name: 'export_table_form',
	        id: 'export_table_form',
	        defaults: {
	            anchor: '100%',
	            allowBlank: false
	        },
			items:[{
				layout: 'column',
				items:[{
						columnWidth: .25,
						items: this.renderExportTableOptions()
					}, {
						columnWidth: .75,
						bodyStyle: 'padding-left: 10px;',
						layout: 'form',
						defaults: {
							anchor: '100%'
						},
						items: [{
								xtype: 'itemselector',
								name: 'table_columns',
								imagePath: '../app/images/itemselector/',
								availableLegend: "Available Columns",
								selectedLegend: "Selected Columns",
								multiselects: [{
						                width: 180,
						                height: 135,
						                displayField: 'value',
						                valueField: 'value',
						                store: new Ext.data.ArrayStore({
						            	    fields: ['value'],
						            	    data: []
						            	})
						            }, {
						                width: 180,
						                height: 135,
						                store: arrayStore,
						                displayField: 'value',
						                valueField: 'value'
						            }]
				 			}]
					}]
				}, {
					xtype: 'hidden',
					name: 'database',
					value: current_db
				}, {
					xtype: 'hidden',
					name: 'connection_id',
					value: Server.connection_id
				}, {
					xtype: 'hidden',
					name: 'selected_table',
					value: current_table
				}, {
					xtype: 'hidden',
					name: 'selected_sql',
					value: selected_sql
			}],
			
			buttons: [{
	    	  	text: 'Export',
	    	  	handler: function() {
					var formObj = Ext.getCmp('export_table_form').getForm();
					if(formObj.getValues().table_columns == '') {
						Dbl.Utils.showErrorMsg(Messages.getMsg('export_table_nocolumn'));
						return false;
					}
					formObj.getEl().dom.action = MAIN_URL + '/cmd.php?command=export.export_table_data&form=1';
					formObj.getEl().dom.method = 'POST';
					formObj.getEl().dom.target = 'download_frame';
					formObj.submit();
	      		}
	      	}, {
	      		text: 'Cancel',
	      		handler: function() {
	      			Ext.getCmp('export_table').close();
	      		},
	      		scope: this
	      	}]
		});
	},

	renderExportTableOptions : function() {
		return [{
				xtype: 'fieldset',
				title: 'Export As',
				items: [{
						xtype: 'radiogroup',
						columns: 1,
						defaults: {
							anchor: '100%'
						},
						items: [{
								name: 'export_table',
								boxLabel: 'HTML',
								inputValue: 'html',
								style: {
									marginRight: '4px'
								},
								checked: true
							}, {
								name: 'export_table',
								boxLabel: 'XML',
								inputValue: 'xml',
								style: {
									marginRight: '4px'
							    }
							}, {
								name: 'export_table',
								boxLabel: 'CSV',
								inputValue: 'csv',
								style: {
									marginRight: '4px'
								}
						}]
					}]
				}];
		}
});
