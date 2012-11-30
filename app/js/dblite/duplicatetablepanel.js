/**
 * @constructor
 */
var DuplicateTablePanel = function(database, table) {
	var formItems = [{
			        layout:'column',
			        items:[{
			            columnWidth: 1,
			            layout: 'form',
			            items: [{
			                xtype:'textfield',
			                fieldLabel: 'Copy '+ table + ' to new table',
			                name: 'new_table',
			                value: table + '_copy',
			                anchor:'100%'
			            }]
			        }]
			    }, {
			    	xtype: 'fieldset',
			    	title: 'Copy Options',
			    	id: 'form_options_cont',
			        layout:'column',
			        //collapsible: true,
			        //collapsed: true,
			        items: [{
			            columnWidth: .5,
			            layout: 'form',
			            items: [/*{
			        		xtype: 'checkbox',
			                boxLabel: 'With all fields',
			                name: 'with_all_fields',
			                listeners:{
			                    'check': this.handleFieldSelection
			                }
			
			            }, */{
			        		xtype: 'checkbox',
			                boxLabel: 'With indexes',
			                name: 'with_indexes'
			            }, {
			        		xtype: 'checkbox',
			                boxLabel: 'With triggers',
			                name: 'with_triggers',
			                checked: true,
			                labelSeparator: ' ',
			                hidden: true
			            }]
			      	
			        }, {
			            columnWidth: .5,
			            layout: 'form',
			            items: [{
			            	xtype: 'radio',
			                boxLabel: 'Structure only',
			                name: 'structure',
			                inputValue: 'structure'
			            }, {
			            	xtype: 'radio',
			                boxLabel: 'Structure and data',
			                name: 'structure',
			                inputValue: 'structure_and_data',
			                checked: true
			            }]
			        }]
    	
			    }];
	
	DuplicateTablePanel.superclass.constructor.call(this, {
		frame: true,
		width: 333,
		id: 'duplicate_table_form',
		labelAlign: 'top',
		items: formItems
	});
};

Ext.extend(DuplicateTablePanel, Ext.FormPanel, {
	handleFieldSelection: function(checkbox, check) {
		var selectionModel = Ext.getCmp('duplicate_table_grid').getSelectionModel();
		if(check) {
			selectionModel.selectAll();
			selectionModel.lock();
		} else {
			selectionModel.unlock();
		}
	},

	validateAndDuplicateTable: function(database, table) {
		var formFields = Ext.getCmp('duplicate_table_form').getForm().getFieldValues();
		var tableFields = Ext.getCmp('duplicate_table_grid').getSelectionModel().getSelections();
		
		if(!formFields.new_table) {
			var noTableErrorMsg = Messages.getMsg('duplicate_notable_name');
			Dbl.Utils.showErrorMsg(noTableErrorMsg, '');
		} else if(!tableFields.length){
			var noFieldErrorMsg = Messages.getMsg('duplicate_nofield_selected');
			Dbl.Utils.showErrorMsg(noFieldErrorMsg, '');
		} else {
			this.duplicateTable(formFields, tableFields, database, table);
		}
	},
	
	duplicateTable: function(formFields, tableFields, database, table) {
		var panel = this;
		var fieldsToCopy = new Array();
		for(var i=0; i<tableFields.length; i++) {
			fieldsToCopy.push(tableFields[i].data.Field);
		}
		Server.sendCommand('create_duplicate_table', {
			options: Ext.encode(formFields),
			fields: Ext.encode(fieldsToCopy),
			source_db: database,
			source_table: table
		}, function(data){
			if(data.success) {
		    	Ext.Msg.show({
		    	   title:'Success',
		    	   msg: data.msg,
		    	   buttons: Ext.Msg.OK,
		    	   fn: panel.handlePostDuplicate.createCallback(data.source_db, data.source_table, data.new_table),
		    	   animEl: document.body,
		    	   icon: Ext.MessageBox.INFO
		    	});
			}
			if(!data.success) {
		    	   Dbl.Utils.showErrorMsg(data.msg, '');
			}
		}, function(data){
	    	var errorMsg = data.msg ? data.msg : data;
	    	Dbl.Utils.showErrorMsg(errorMsg, '');
		});
	},
	
	handlePostDuplicate: function(source_db, source_table, new_table) {
		Ext.getCmp('duplicate_table_window').close();
		Explorer.reset();
		Explorer.selectedNodeType = "table"; 
		Explorer.loadExplorerData(source_db, new_table, 'table');
	},
	
	closeWindow: function() {
		Ext.getCmp('duplicate_table_window').close();
	}
});

