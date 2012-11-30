/**
 * @constructor
 */
Dbl.EditIndexFormPanel = function(rowIndex) {
	var indexGrid = Ext.getCmp('manage_index_grid');
	var availableColumns = indexGrid.table_columns
	var availableColumnsStore =  new Ext.data.ArrayStore({
	    fields: ['value'],
	    data: availableColumns,
	});
	

	var selectedColumns = new Array();
	var row = indexGrid.store.getAt(rowIndex);
	var columns = row.data.columns;
	if(columns) {
		columns = columns.split(',');
		if(columns.length) {
			for(var i=0; i<columns.length; i++) {
				selectedColumns.push([columns[i]]);
			}
		}
	}
	var selectedColumnsStore =  new Ext.data.ArrayStore({
	    fields: ['value'],
	    data: selectedColumns,
	});
	
	Dbl.EditIndexFormPanel.superclass.constructor.call(this, {
	    id: 'edit_index_form',
	    border: false,
	    frame: true,
		labelAlign: 'top',
		hideLabel: true,
		defaults: {
			anchor: '100%'
		},
		items: [{
				xtype: 'itemselector',
				name: 'selected_columns',
				imagePath: '../app/images/itemselector/',
				availableLegend: "Available",
				selectedLegend: "Selected",
				multiselects: [{
	                width: 225,
	                height: 150,
	                displayField: 'value',
	                valueField: 'value',
	                store: availableColumnsStore,
	            }, {
	                width: 225,
	                height: 150,
	                displayField: 'value',
	                valueField: 'value',
	                store: selectedColumnsStore
	            }]
			}]	
	});
};

Ext.onReady(function() {
	Ext.extend(Dbl.EditIndexFormPanel, Ext.FormPanel, {
		getSelectedColumns: function(rowIndex) {
	        var isForm = Ext.getCmp('edit_index_form');
	        var indexGrid = Ext.getCmp('manage_index_grid');
			if(isForm.getForm().isValid()){
	                var columns = isForm.getForm().getValues();
	                indexGrid.changeCellData(columns.selected_columns, rowIndex);
	                
	        }
		},
		
		cancelEdit: function() {
			Ext.getCmp('edit_index_window').close();
		}
	});
});

