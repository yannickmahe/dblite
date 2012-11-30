/**
 * @constructor
 */
var ReorderColumnsPanel = function(data) {
	var store = new Ext.data.SimpleStore({
		fields: data.cols
	});
	
	store.loadData(data.rows);
	
	ReorderColumnsPanel.superclass.constructor.call(this, {
		title: Messages.getMsg('reorder_columns_header'),
		id: 'reorder_columns_grid',
		height: 350,
		store: store,
		columns: data.columns,
		columnLines: true,
		ddGroup: 'mygridDD',
		enableDragDrop: true,
		autoScroll: true,
		viewConfig : {},
		sm: new Ext.grid.RowSelectionModel({
			singleSelect:true
		}),
		listeners: {
			'render': {
						  scope: this,
						  fn: function(grid) {
					              var ddrow = new Ext.dd.DropTarget(grid.container, {
					                  ddGroup : 'mygridDD',
					                  copy: false,
					                  notifyDrop : function(dd, e, data){
					            	      Ext.getCmp('reorder_columns_window').reorderButton.enable();
					                      var ds = grid.store;
					                      var sm = grid.getSelectionModel();
					                      var rows = sm.getSelections();
					                      if(dd.getDragData(e)) {
					                    	  var cindex=dd.getDragData(e).rowIndex;
					                          if(typeof(cindex) != 'undefined') {
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

Ext.extend(ReorderColumnsPanel, Ext.grid.GridPanel, {
	reorderColumns: function(table) {
		var panel = this;
		var dataStore = Ext.getCmp('reorder_columns_grid').getStore();
		var tableColumns = dataStore.data.items;
		var reorderedColumns = new Array();
	    
		for(var i=0; i<tableColumns.length; i++) {
			var fieldData = tableColumns[i].data;
			if(fieldData.column) {
				reorderedColumns.push(fieldData);
			}
		}
		
		Server.sendCommand('reorder_table_columns', {
			     database: Explorer.selectedDatabase,
			     tablename: table,
			     reorderedColumns: Ext.encode(reorderedColumns)
			     }, function(data) {
		    	    if(data.success) {
		    	    	Explorer.selectedTable = table;
		    	    	Ext.Msg.show({
		    	    	   title:'Success',
		    	    	   msg: data.msg,
		    	    	   buttons: Ext.Msg.OK,
		    	    	   fn: panel.cancelReorder,
		    	    	   animEl: document.body,
		    	    	   icon: Ext.MessageBox.INFO
		    	    	});
		    	    }
			    	else if(!data.success) {
			    	   Dbl.Utils.showErrorMsg(data.msg, '');
				    }
			     }, function(data) {
			    	var errorMsg = data.msg ? data.msg : data;
			    	Dbl.Utils.showErrorMsg(errorMsg, '');
			     });
	},
	
	cancelConfirm: function() {
		var panel = this;
		Ext.Msg.confirm('Confirmation', 
			 Messages.getMsg('reorder_columns_cancel'),	
           	 function(btn){
   		         if(btn == 'yes'){
   		        	 panel.cancelReorder();
   		         }
   	         });
	},
	
	cancelReorder: function() {
		Ext.getCmp('reorder_columns_window').close();
    	Dblite.dataPanel.refresh(true);
	}
});

