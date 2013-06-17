/* Functionality for viewing table data and table structure */

Dbl.ResultGridPanel = function(data, index) {
	this.gridindex = index
	this.sql = data.sql;
	this.cols = data.cols;
	this.models = data.columns;
	this.shorts = [];
	this.result_separator = data.result_separator;

	var store = new Ext.data.SimpleStore({
		url: MAIN_URL + '/cmd.php?command=get_result_data&form=1',
		baseParams: {
			sql: this.sql,
			result_separator: this.result_separator,
			database: Dbl.UserActivity.getValue('database'),
			connection_id: Dbl.UserActivity.getValue('connection')
		},
		root: 'results',
		totalProperty: 'total',
		fields: this.cols
	});

	this.store = store;

	store.load({
		params:{start: 0, limit: 50, result_separator: this.result_separator},
		callback: function() {
			Ext.getCmp('result_grid_' + index).autoSizeColumns();
			Ext.getCmp('result_tab_' + index).setIconClass(' ');
		}
	});
	
	

	var columnModel = new Ext.grid.ColumnModel({
		columns: this.models
	});
	
	Dbl.ResultGridPanel.superclass.constructor.call(this, {
		id: 'result_grid_' + index,
		store: store,
		cm: columnModel,
		columnLines: true,
		border: false,
		viewConfig : {},
		listeners: {
			viewready: this.autoSizeColumns,
			cellclick: this.showContent,
			cellcontextmenu: this.onCellContextMenu,
			afterlayout: function() {
				//Ext.getCmp('result_tab_' + this.gridindex).setIconClass(' ');
			},
			scope: this
		},
		bbar: this.buildBottomPaginator(store, index),
//		bbar: [{
//			       xtype: 'tbtext', 
//			       text: 'SQL execution completed successfully'  
//		       }, {
//			       xtype: 'tbseparator'
//		       }, {
//				   xtype: 'tbtext', 
//				   text: data.execution_time  
//		       }, {
//		    	   xtype: 'tbseparator'
//		       }, {
//				   xtype: 'tbtext', 
//				   text: data.num_records  
//		       }]
	});
};

Ext.extend(Dbl.ResultGridPanel, Ext.grid.GridPanel, {
  autoSizeColumns: function() {
	var textCellIndexes = new Array();
	this.colModel.suspendEvents();
	for (var i = 1; i < this.colModel.getColumnCount(); i++) {
		this.colModel.setRenderer(i, Ext.util.Format.htmlEncode);
		this.autoSizeColumn(i);
	}
	this.colModel.resumeEvents();
	this.view.refresh(true);
	//Ext.getCmp('result_tab_' + this.gridindex).setIconClass(' ');
  },

  autoSizeColumn: function(c) {
		var w = this.view.getHeaderCell(c).firstChild.scrollWidth;
		for (var i = 0; i < this.store.getCount(); i++) {
			var cell = this.view.getCell(i, c).firstChild;
			var cw  = cell.scrollWidth;
			w = Math.max(w, cw);
			if(w > 300) { 
				w = 300;
				this.shorts[c] = true;
			}
		}
		if(!w) return;
		this.colModel.setColumnWidth(c, w+2);
		return w;
  },
  
  showContent: function(grid, rowIndex, columnIndex, event) {
	  if(!this.shorts[columnIndex]) return;
	  var record = grid.getStore().getAt(rowIndex);  // Get the Record
      var fieldName = grid.getColumnModel().getDataIndex(columnIndex); // Get field name
      var data = record.get(fieldName);
      Dblite.showWindow({html: Ext.util.Format.htmlEncode(data), width: 400, height: 400, padding: 10, autoScroll: true});
  },	
  
  buildBottomPaginator: function(store, index){
   	this.paginator = new Ext.PagingToolbar({
   		id: 'result_data_paginator_' + index,
        pageSize: 50,
        store: store,
        displayInfo: true,
        displayMsg: 'Displaying {0} - {1} of {2}',
        emptyMsg: 'No data to display',
        width: '100%',
        style : {
   			borderWidth : '0px'
        }
    });

   	var tbar = new Ext.Toolbar({
   	    items: [this.paginator]
   	});
   	return tbar;
   },

  
  onCellContextMenu : function(grid, rowIndex, cellIndex, e) {
	  e.stopEvent();	

	  if(this.menu) {
		this.menu.removeAll();
	  }

		var menu_id = "result_cell_context";
	    var menu_items = [this.executeSQL(grid, rowIndex, cellIndex, e),
	                      this.exportResultData(grid, rowIndex, cellIndex, e),
	    				  '-',
	    				  this.showSQL(grid, rowIndex, cellIndex, e),
	    				  '-',
	    				  this.copyCellDataToClipboard(grid, rowIndex, cellIndex, e),
	    				  this.copyAllRowsToClipboard(grid, rowIndex, cellIndex, e)];

	    this.menu = new Ext.menu.Menu({
	    	id : menu_id,
	        items : menu_items,
	        defaults : {
		        scale : 'small',
		        width : '100%',
		      	iconAlign : 'left'
	   	 	}
	    });

	    this.menu.showAt(e.getXY());
	  },

	  executeSQL: function(grid, rowIndex, cellIndex, e) {
			return {
				itemId: 'execute_sql',
				text: 'Execute SQL',
				iconCls: 'execute_query',
				disabled: Ext.getCmp('result_tab_' + grid.gridindex).autorefresh_lap ? true : false,
				listeners: {
					click: function(baseItem, el) {
						var activeTab = Dblite.dataPanel.getActiveTab();
						Server.sendCommand('database.execute_queries', {
							sql: activeTab.sql,
							sqldelim: Editor.defaultSQLDelimiter,
							scope: this},
							function(data){	
								var panel = new Dbl.ResultGridPanel(data[0], grid.gridindex);
								activeTab.removeAll();
								activeTab.add(panel);
								activeTab.doLayout();
							}, function(data){
								var errorMsg = data.msg ? data.msg : data;
								DbliteUtils.showErrorMsg(errorMsg, '');
						});
					}
				}
			};
	  },


	  exportResultData: function(grid, rowIndex, cellIndex, e) {
		  return {
				itemId: 'export_result_data',
				text: 'Export Result Set',
				iconCls: 'copy_table',
				disabled: Ext.getCmp('result_tab_' + grid.gridindex).autorefresh_lap ? true : false,
				listeners: {
					click: function(baseItem, el) {
						var store = grid.getStore();
						var fieldstore = new Array();
						for(var i=0; i<store.fields.items.length; i++) {
							fieldstore[i] = new Array(store.fields.items[i].name);
						}
						var data = {};
						data.data = fieldstore;
				       	data.curr_table = '';
				       	data.sql = grid.sql;
				       	data.curr_db = Dbl.UserActivity.getValue('database');
						this.window = new Dbl.ContextMenuWindow({
							title : "Export Result Set",
							id : "export_table",
							width : 560,
							height : 240,
							onEsc: function(){},
							items: [new Dbl.ExportTableDbPanel(data)]
						});
						this.window.show();
					}
				}
			};
		},

		showSQL: function(grid, rowIndex, cellIndex, e) {
			return {
				itemId: 'show_sql',
				text: 'Show SQL',
				iconCls: 'preview_sql',
				disabled: Ext.getCmp('result_tab_' + grid.gridindex).autorefresh_lap ? true : false,
				listeners: {
					click: function(baseItem, el) {
						Ext.getCmp('show_sql_' + grid.gridindex).hide();
						Ext.getCmp('hide_sql_' + grid.gridindex).show();
						Ext.getCmp('result_tbar_' + grid.gridindex).get('result_sql_' + grid.gridindex).show();
						Ext.getCmp('result_tbar_' + grid.gridindex).doLayout();
					}
				}
			};
		},
		
		copyCellDataToClipboard: function(grid, rowIndex, cellIndex, e) {
			return {
				itemId: 'copy_cell_data',
				text: 'Copy Cell Data To Clipboard',
				iconCls: 'copy_cell_to_clipboard',
				disabled: Ext.getCmp('result_tab_' + grid.gridindex).autorefresh_lap ? true : false,
				listeners: {
					click: function(baseItem, el) {

						rowData = grid.getStore().getAt(rowIndex).data;
						
						rowDataArray = [];

						for(var property in rowData){
							rowDataArray[rowData.length] = property;
						}

						console.log(rowDataArray);

						Ext.MessageBox.show( {
							title : 'Message',
							msg : Messages.getMsg('content_copied', ['toto']),
							buttons : Ext.Msg.OK,
							animEl: document.body,
							icon : Ext.MessageBox.INFO
						});
					}
				}
			};
		},

		copyAllRowsToClipboard: function(grid, rowIndex, cellIndex, e) {
			return {
				itemId: 'copy_all_rows',
				text: 'Copy All Rows To Clipboard',
				iconCls: 'copy_rows_to_clipboard',
				disabled: Ext.getCmp('result_tab_' + grid.gridindex).autorefresh_lap ? true : false,
				listeners: {
					click: function(baseItem, el) {
						Dbl.Utils.showTBDMsg();
					}
				}
			};
		},
});
