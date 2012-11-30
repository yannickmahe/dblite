/**
 * @constructor
 */
Dbl.AddIndexGridPanel = function(data) {
	var model = new Ext.ux.CheckColumn({
			header: ' ',
			checkOnly: true,
			dataIndex: 'included',
			width: 20
	});

	for(var i=0; i<data.fields.length; i++) {
	  if(data.fields[i] == "included") {
		data.fields[i].type = 'bool';
		data.models[i] = model;
	  }
	}
	
	Dbl.AddIndexGridPanel.superclass.constructor.call(this, {
		fields : data.fields,
		data : data.data,
		models : data.models,
		autoExpandColumn: 'Name',
		viewConfig: { forceFit: true },
		id : 'add_index_grid',
        height: 180,
        autoScroll: true,
        fbar: ['<b>Note:</b> To reorder just change the order of the rows via drag & drop'],
		enableDragDrop: true,
        ddGroup: 'mygridDD',
        plugins: [model],
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
};

Ext.onReady(function() {
	Ext.extend(Dbl.AddIndexGridPanel, Dbl.ListViewPanel, {
	});
});

