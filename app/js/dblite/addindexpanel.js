/**
 * @constructor
 */
Dbl.AddIndexPanel = function(data) {
	var grid = new Dbl.AddIndexGridPanel(data);
	var form = new Dbl.AddIndexFormPanel();
	
	if(data.editMode) {
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
	
	Dbl.AddIndexPanel.superclass.constructor.call(this, {
		id: 'add_index_panel',
       	//layout: 'fit',
		split: true,
		border: false,
		header: false,
		tbar: this.buildTopToolbar(data.editMode),
		items: [form, grid]
	});
};

Ext.extend(Dbl.AddIndexPanel, Ext.Panel, {
	buildTopToolbar: function(editmode) {
		return [{
			  text: editmode ? 'submit' : 'add'
			  //id: 'delete_index',
			  //tooltip: 'Delete index(s)',
			  //iconCls: 'add_index',
			  //width: 50,
			  //handler: data.editMode?ManageIndexes.editIndex:ManageIndexes.createAndAddIndex
	     	}, {
			  text: 'cancel'
			  //id: 'delete_index',
			  //tooltip: 'Delete index(s)',
			  //iconCls: 'add_index',
			  //width: 50,
			  //handler: ManageIndexes.closeAddIndexWindow
    		}];	
	}
});
