ManageIndexes = {
	GridPanel : function(config) {
		config.autoExpandColumn = 'columns';
		config.viewConfig = { forceFit: true };
		ManageIndexes.GridPanel.superclass.constructor.call(this, config);
	},
	gridPanelStore : function(data) {
		var store = new Ext.data.SimpleStore( {
			fields : data.fields
		});
		store.loadData(data.data);
		return store;
	},
	gridPanelColumnModel : function(data) {
		for ( var i = 0; i < data.models.length; i++) {
			var curr = data.models[i];
			if (curr.id == 'unique' || curr.id == 'fullText') {
				curr.renderer = function(v) {
					//return '<div  class="x-grid3-check-col' + (v ? '-on' : '') + '"> </div>';
					return '<input type="checkbox" '+(v?'checked="checked"':'')+' disabled="disabled" />';
				};
			}
		}
		var cm = new Ext.grid.ColumnModel( {
			columns : data.models
		});
		return cm;
	},
	closeManageIndexesWindow : function() {
		Ext.getCmp('manage_indexes_window').close();
	},
	showDeleteIndexConfirmation : function() {
		// Get the selected row(s)
	var indexesGrid = Ext.getCmp('manage_indexes_grid');
	var selModel = indexesGrid.getSelectionModel();
	var rows = selModel.getSelections();

	// If no rows are selected, alert the user.
	if (!rows.length) {
		var msg = "Please select index(s) to delete!";
		Dbl.Utils.showErrorMsg(msg, '');
//		Ext.MessageBox.alert('No Index(es) Selected',
//				'Please select the index(es) to delete');
		return;
	}

	ManageIndexes.indexesForDeletion = [];
	for ( var i = 0; i < rows.length; i++) {
		ManageIndexes.indexesForDeletion.push(rows[i].data.indexName);
	}

	// Get confirmation from the user
	var title = 'Are you sure?';
	var message = 'Are you sure you want to delete the selected index(es)?';
	var handleConfirmation = function(btn) {
		if (btn == "yes") {
			// Send the delete index command to server

			Server.sendCommand('delete_indexes', {
				indexes : ManageIndexes.indexesForDeletion,
				table : Explorer.selectedDbTable
			}, function(data) {
//				var msg = "Index(s) deleted successfully";
				Dbl.Utils.showInfoMsg(Messages.getMsg('index_deletion_success'));
//				Ext.MessageBox.alert('Success!!',
//						'Index(es) deleted successfully');
				ManageIndexes.refreshGrid();
//					Server.sendCommand('get_min_table_indexes', {
//						parent_database : Explorer.selectedDatabase,
//						table : Explorer.selectedDbTable
//					}, function(data) {
//						var store = ManageIndexes.gridPanelStore(data);
//						var cm = ManageIndexes.gridPanelColumnModel(data);
//						Ext.getCmp('manage_indexes_grid')
//								.reconfigure(store, cm);
//
//					});
				});
		}
	};
	Ext.MessageBox.confirm(title, message, handleConfirmation);
},
indexesForDeletion : [],
refreshGrid: function()
{
	Server.sendCommand('get_min_table_indexes', {
		parent_database : Explorer.selectedDatabase,
		table : Explorer.selectedDbTable
	}, function(data) {
		var store = ManageIndexes.gridPanelStore(data);
		var cm = ManageIndexes.gridPanelColumnModel(data);
		Ext.getCmp('manage_indexes_grid').reconfigure(store, cm);

	});
},
showEditIndexWindow: function()
{
	var selectionCount = Ext.getCmp('manage_indexes_grid').getSelectionModel().getCount();
	if(!selectionCount) {
//		var msg = "Please select an index to edit!";
		Dbl.Utils.showErrorMsg(Messages.getMsg('edit_index_required'));
	} else if(selectionCount > 1) {
//		var msg = "Please select a single index to edit!";
		Dbl.Utils.showErrorMsg(Messages.getMsg('edit_index_single'));
	} else {
		Server.sendCommand('get_min_table_columns', {
			table : Explorer.selectedDbTable
		}, function(data) {
			data.editMode = true;
			ManageIndexes.addIndexWin = new ManageIndexes.AddIndexWindow(data);
			ManageIndexes.addIndexWin.show();
		});
	}
},
showAddIndexWindow : function(editMode) {
	Server.sendCommand('get_min_table_columns', {
		table : Explorer.selectedDbTable
	}, function(data) {
		ManageIndexes.addIndexWin = new ManageIndexes.AddIndexWindow(data);
		ManageIndexes.addIndexWin.show();
	});
},
AddIndexWindow : function(data) {
	var gridPanel = new ManageIndexes.AddIndexGrid(data);
	var form = new ManageIndexes.AddIndexForm();
	
	if(data.editMode)
	{
		var index = Ext.getCmp('manage_indexes_grid').getSelectionModel().getSelected().data;
		var indexName = index.indexName;
		
		var formObj = form.getForm();
		formObj.findField('add_index_form_index_name').setValue(indexName);
		formObj.findField('add_index_form_original_name').setValue(indexName);
		//form.originalIndexName = indexName;
		
		var indexType;
		if(indexName == 'PRIMARY')
			indexType = 'primary';
		else if(index.unique == true)
			indexType = 'unique';
		else if(index.fullText == true)
			indexType = 'fullText';
		else
			indexType = 'none';
		
		var cmpId = 'add_index_form_index_type_'+indexType;
		Ext.getCmp('options_group').setValue(cmpId,true);
		
		var columns = index.columns.split(',').reverse();
		
		for(var i=0; i<columns.length; i++)
		{
			var recIndex = gridPanel.getStore().find('Name',columns[i]);
			var rec = gridPanel.getStore().getAt(recIndex);
			rec.set('included', true);
			
			gridPanel.getStore().remove(rec);
			gridPanel.getStore().insert(0, rec);
		}
	}
	
	ManageIndexes.AddIndexWindow.superclass.constructor.call(this, {
		title : "Add New Index",
		id : "add_index_window",
		headerAsText : true,
		width : 350,
		resizable : false,
		modal : true,
		plain : true,
		stateful : true,
		shadow : false,
		
		onEsc : function() {
		},
		closeAction : 'destroy',
		items : [ form, gridPanel ],
		buttons : [
		{
			text: data.editMode ? 'submit' : 'add',
			handler: data.editMode?ManageIndexes.editIndex:ManageIndexes.createAndAddIndex
		},
		{
			text: 'cancel',
			handler: ManageIndexes.closeAddIndexWindow
		}]

	});
},
AddIndexGrid : function(data) {
	var includedModel = new Ext.ux.CheckColumn({
		header: ' ',
		checkOnly: true,
		dataIndex: 'included',
		width: 20});

	for(var i=0; i<data.fields.length; i++)
	{
	  if(data.fields[i] == "included") {
		data.fields[i].type = 'bool';
		data.models[i] = includedModel;
	  }
	}
	ManageIndexes.AddIndexGrid.superclass.constructor.call(this, {
		fields : data.fields,
		data : data.data,
		models : data.models,
		autoExpandColumn: 'Name',
		viewConfig: { forceFit: true },
		id : 'add_index_grid',
        height: 180,
        //width: 333,
        autoScroll: true,
        fbar: [Messages.getMsg('edit_index_footer')],
		enableDragDrop: true,
        ddGroup: 'mygridDD',
        plugins: [includedModel],
        listeners: {
			"render": {
						  scope: this,
						  fn: function(grid) {
					              var ddrow = new Ext.dd.DropTarget(grid.container, {
					                  ddGroup : 'mygridDD',
					                  copy: false,
					                  notifyDrop : function(dd, e, data){
					            	      //Ext.getCmp('reorder_columns_window').reorderButton.enable();
					                      var ds = grid.store;
					                      var sm = grid.getSelectionModel();
					                      var rows = sm.getSelections();
					                      //var rows = this.currentRowEl;
					                      if(dd.getDragData(e)) {
					                    	  var cindex=dd.getDragData(e).rowIndex;
					                          if(typeof(cindex) != "undefined") {
					                             for(i = 0; i <  rows.length; i++) {
					                            	 ds.remove(ds.getById(rows[i].id));
					                             }
					                             ds.insert(cindex,data.selections);
					                             sm.clearSelections();
					                          }
					                      }
					                  }
					              }); 
					       }
			   }
			}
	});
},
AddIndexForm: function(data) {
	var radioGroupItems = [
	{
		boxLabel: 'Unique',
		name: 'add_index_form_index_type',
		id: 'add_index_form_index_type_unique',
		inputValue: 'unique'
	},
	{
		boxLabel: 'Full Text',
		name: 'add_index_form_index_type',
		id: 'add_index_form_index_type_fullText',
		inputValue: 'fullText'
	},
	{
		boxLabel: 'Primary',
		name: 'add_index_form_index_type',
		id: 'add_index_form_index_type_primary',
		inputValue: 'primary',
		listeners: 
		{
			'check': {
				fn: function()
				{
					var form = Ext.getCmp('add_index_form').getForm().getValues(false);
					var indexName = Ext.getCmp('add_index_form_index_name');
					if(form.add_index_form_index_type == 'primary')
					{
						indexName.prevValue = form.add_index_form_index_name;
						indexName.setValue('PRIMARY');
						indexName.disable();
					}
					else
					{
						indexName.setValue(indexName.prevValue);
						indexName.enable();
					}
				}
			}
		}
	},
	{
		boxLabel: 'None',
		name: 'add_index_form_index_type',
		id: 'add_index_form_index_type_none',
		inputValue: 'none',
		checked: true
	}];
	ManageIndexes.AddIndexForm.superclass.constructor.call(this, {
		id: 'add_index_form',
		labelAlign: 'top',
		frame: true,
		bodyStyle: "padding: 5px",
		defaults: {
			anchor: '100%'
		},
		items:[
		{
    	   xtype: 'textfield',
    	   fieldLabel: 'Index Name',
    	   name: 'add_index_form_index_name',
    	   id: 'add_index_form_index_name',
    	   blankText: 'Index name is required',
    	   allowBlank: false
        },
        {
        	xtype: 'hidden',
        	name: 'add_index_form_original_name',
        	id: 'add_index_form_original_name'
        },
        {
			xtype: 'radiogroup',
			rows: 1,
			id: 'options_group',
			defaults: {
				anchor: '100%'
			},
			bodyStyle: "padding: 0px; margin: 0px",
			items: radioGroupItems,	
			fieldLabel: 'Index Options'
       }]
	});
},
editIndex: function()
{
	ManageIndexes.createAndAddIndex(true);
},
createAndAddIndex: function(editMode)
{
	var form = Ext.getCmp('add_index_form').getForm();
	if(!form.isValid())
	{
		return;
	}
	
	var values = form.getValues();
	var store = Ext.getCmp('add_index_grid').getStore();
	
	var indexes = [];
	var selectedRows = 0;
	for(var i=0; i<store.getCount(); i++)
	{
		var record = store.getAt(i);
		if(record.get('included') == true)
		{
			indexes.push(record.get('Name'));
			selectedRows++;
		}
	}

	if(selectedRows < 1)
	{
//		var msg = 'Please select at least one column';
		Dbl.Utils.showErrorMsg(Messages.getMsg('add_index_column_req'));
		//Ext.MessageBox.alert('No Columns Selected', 'Please Select atleast one column');
		return;
	}
		
	Server.sendCommand(
		'create_indexes', 
		{
			table: Explorer.selectedDbTable,
			type: values.add_index_form_index_type,
			name: values.add_index_form_index_name,
			indexes: indexes,
			originalName: values.add_index_form_original_name
		},
		function(data) {
			if(data.success) {
				ManageIndexes.refreshGrid();
				ManageIndexes.closeAddIndexWindow();
//				var msg = 'Index added successfully';
				Dbl.Utils.showInfoMsg(Messages.getMsg('index_addition_success'));
			} else if(!data.success) {
				var msg = data.msg ? data.msg : data;
				Dbl.Utils.showErrorMsg(data.msg, '');
			}
		}, function(data){
			Dbl.Utils.showErrorMsg(data.msg, '');
		});
},
closeAddIndexWindow: function() {
	Ext.getCmp('add_index_window').close();
}
};

Ext.onReady(function() {
	Ext.extend(ManageIndexes.GridPanel, Dbl.ListViewPanel, {
		hello : function(str) {

		}
	});

	Ext.extend(ManageIndexes.AddIndexWindow, Ext.Window, {

	});

	Ext.extend(ManageIndexes.AddIndexGrid, Dbl.ListViewPanel, {});
	Ext.extend(ManageIndexes.AddIndexForm, Ext.FormPanel, {});

});
