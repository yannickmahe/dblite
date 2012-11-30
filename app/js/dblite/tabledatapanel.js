/* Functionality for viewing table data and table structure */

Dbl.TableDataPanel = function(table, columns) {
	
	this.keys = [];
	this.fields = [];
	this.models = [];
	this.keyValues = [];
	this.editedFields = [];
	this.editedFieldValues = [];
	this.newTableRow = false;
	this.shorts = [];
	this.paginator = '';
	this.previousEditedRowIndex = -1;
	this.currentEditingRowIndex = -1;

	for(var i=0;i<columns.length;i++) {
		var c = columns[i];
		this.fields.push(c.name);
		var cm = {};
		cm.header = c.name;
		cm.sortable = true;
		cm.dataIndex = c.name;
		cm.ctype = c.ctype;
		cm.field_type = c.type;
		cm.has_default = c.has_default;
		cm.default_value = c.default_value;
		cm.is_binary = c.binary;
		cm.multi_set = c.multi_set;
		this.models.push(cm);
		if(c.primary_key || c.unique_key) {
			this.keys.push(c.name);
		}
		
		if(c.auto_increment) {
			this.auto_increment_field = c.name;
		}
	}

	if(this.keys.length == 0) {
		this.keys = this.fields;
	}

	var gridDataStore = new Ext.data.SimpleStore({
		url: MAIN_URL + '/cmd.php?command=get_table_data&form=1',
		pruneModifiedRecords: true,
		baseParams: {
			table: table,
			connection_id: Server.connection_id
		},
		root: 'results',
		remoteSort: true,
		totalProperty: 'total',
		fields: this.fields,
		listeners : {
//			beforeload: function(store, options) {
//				var params = options.params;
//				params.table = table;
//				Server.sendCommand('get_table_data' , params, function(data) {
//					store.loadData(data.data);
//				});
//				return false;
//			}
		}

	});

	gridDataStore.on("load", function(store, records, options) {
		this.autoSizeColumns();
		var loadedColModel = this.getColumnModel();
		for(var i=1; i<columnModel.getColumnCount(); i++) {
			var curr_obj = columnModel.columns[i];
			if(curr_obj.is_binary && (curr_obj.field_type != 'binary' && curr_obj.field_type != 'varbinary')) {
				curr_obj.renderer = this.setTableFields;
			}
			else {
				curr_obj.renderer = this.setDefaultNullFields;
			}
		}

	}, this);

	gridDataStore.load({
		params:{start: 0, limit: 50},
		callback: function() {
			Dbl.Utils.removeLoadingIcon();
		}
	});
	var selectionModel = new Ext.grid.CheckboxSelectionModel({
        header: '',
        checkOnly: true,
		init: function(grid){
	        this.grid = grid;
	        this.initEvents();
        },
        listeners: {
            selectionchange: function(sm) {
                if (sm.getCount()) {
                	Ext.getCmp('delete_row').enable();
                } else {
                	Ext.getCmp('delete_row').disable();
                }
            },
            scope: this
        }
    });

	var gridColumns = new Array(selectionModel);
	var gridColumns = gridColumns.concat(this.models);
	var columnModel = new Ext.grid.ColumnModel({
		columns: gridColumns
	});

	if(Dbl.UserActivity.getValue('table_type') == 'table') {
		for(var i=1; i<columnModel.getColumnCount(); i++) {
			var curr_obj = columnModel.columns[i];
			if(!curr_obj.is_binary || (curr_obj.field_type == 'binary' || curr_obj.field_type == 'varbinary')) {
				curr_obj.editor = this.attachCellEditor(curr_obj);
			}
		}
	}
	

	Dbl.TableDataPanel.superclass.constructor.call(this, {
		id: 'table_data_grid',
		store: gridDataStore,
		cm: columnModel,
		sm: selectionModel,
		columnLines: true,
		viewConfig: {},
		clicksToEdit: 2,
		border: false,
		trackMouseOver: true,
		tbar: this.buildTopToolbar(),
		scroable: true,
		bbar: this.buildBottomPaginator(gridDataStore),
		listeners: {
			rowclick: this.handleRowClick,
			beforeedit: this.handleBeforeEdit,
			afteredit: this.handleAfterEdit,
			celldblclick: this.showContent,
			sortchange: function(g, info) {},
			scope: this
		}
	});
	
	if(Dbl.UserActivity.getValue('table_type') == 'table') {
		this.addListener('cellcontextmenu', this.onCellContextMenu);
	}
};

Ext.extend(Dbl.TableDataPanel, Ext.grid.EditorGridPanel, {
	resetEditParams: function() {
		this.newTableRow = false;
		this.keyValues = [];
		this.editedFields = [];
		this.editedFieldValues = [];
		this.previousEditedRowIndex = -1;
		this.currentEditingRowIndex = -1;
	},
	
	autoSizeColumns: function() {
		var textCellIndexes = new Array();
		this.colModel.suspendEvents();
		for (var i = 1; i < this.colModel.getColumnCount(); i++) {
			var type = this.models[i-1].ctype;
			if(type == "C" || type == "X") {
				this.colModel.setRenderer(i, Ext.util.Format.htmlEncode);
			}
			if(type == 'X') {
				this.shorts[i] = true;
				this.autoSizeColumn(i, 300);
			}
			else {
				this.autoSizeColumn(i);
			}
			// TODO for TEXT set a different editor
		}
		this.colModel.resumeEvents();
		this.view.refresh(true);
	},

	setTableFields: function(data, metaData, record, rowIndex, colIndex, store) {
		data = (Ext.util.Format.trim(data) == '(NULL)')? data : '(BLOB)';
		metaData.css = (data == '(NULL)')? 'non_editing_cell set_as_default_or_null' : 'non_editing_cell';
		return data;
	},
	
	setDefaultNullFields: function(data, metaData, record, rowIndex, colIndex, store) {
		metaData.css = (data == '(NULL)' || data == '(DEFAULT)')? 'set_as_default_or_null' : '';
		return data;
	},

	attachCellEditor: function(c) {
		var editor = '';
		switch(c.field_type) {
			case 'set':
			case 'enum':
				editor = Dbl.Utils.getComboBoxEditor(c.header, c.multi_set);
				break;
//			case 'date':
//				editor = Dbl.Utils.getDateFieldEditor();
//				break;
			default:
				editor = new Ext.form.TextField();
		}
		return editor;
	},

	autoSizeColumn: function(c, max) {
		var w = this.view.getHeaderCell(c).firstChild.scrollWidth;
		for (var i = 0; i < this.store.getCount(); i++) {
			var cw  = this.view.getCell(i, c).firstChild.scrollWidth;
			w = Math.max(w, cw);
			if(max && w > max) {
				w = max;
			}
		}
		if(!w) return;
		this.colModel.setColumnWidth(c, w+2);
		return w;
	},
	showContent: function(grid, rowIndex, columnIndex, event) {
		if(this.autorefresh_lap) {
			return false;
		}
		
		var record = grid.getStore().getAt(rowIndex);  // Get the Record
		var fieldName = grid.getColumnModel().getDataIndex(columnIndex); // Get field name
		var data = record.get(fieldName);
		var cur_column = grid.getColumnModel().columns[columnIndex];
		if(cur_column.is_binary && (cur_column.field_type != 'binary' && cur_column.field_type != 'varbinary')) {
			return;
		}
		if(Ext.util.Format.trim(data) == '(NULL)') {
			record.set(fieldName, '');
		}

		if(!this.shorts[columnIndex]) return;
		
		var field_obj = {row: rowIndex, record: record};
		this.getFieldKeyValues(field_obj);

		var buttons = [{
			  text : "update",
			  scope: this,
			  handler: function() {
	   				this.editedFields.push(fieldName);			
					if(Ext.getCmp('long_text').disabled) {
					  record.set(fieldName, '(NULL)');
				   		this.editedFieldValues.push('(NULL)');					  
					}
					else {
						var formObj = Ext.getCmp('long_text_edit_form').getForm();
						record.set(fieldName, formObj.getValues().long_text);
						this.editedFieldValues.push(formObj.getValues().long_text);
					}
					Ext.getCmp("text_edit_window").close();

					var toolbar = this.getTopToolbar();
					toolbar.get(0).enable();
					toolbar.get(9).show();
					toolbar.get(10).show();
				}
		  }, {
			  text : "cancel",
			  handler : function() {
				  Ext.getCmp("text_edit_window").close();
				  record.set(fieldName, Ext.util.Format.htmlEncode(data));
			  }
		  }];


		var lontexteditconfig = {
				title : "",
				id : "text_edit_window",
				width : 300,
				height : 370,
				resizable : true,
				autoScroll : true,
				layout : "fit",
				modal : true,
				plain : true,
				stateful : true,
				items : [ new LongTextEditPanel(Ext.util.Format.htmlEncode(data)) ],
				buttons: (Dbl.UserActivity.getValue('table_type') == 'table') ? buttons : []
			};

		this.win = new Ext.Window(lontexteditconfig);
		this.win.show();

//		this.win = new LongTextEditPanel();
//		this.win.show();
//		Dblite.showWindow(
//				{html: Ext.util.Format.htmlEncode(data), width: 400, height: 400, padding: 10, autoScroll: true}
//				);
		return false;
	},

	handleRowClick: function(grid, rowIndex, e) {
		if((this.currentEditingRowIndex != -1) 
				&& (rowIndex != this.currentEditingRowIndex)) {
		    		if(this.editedFields.length > 0) {
		    			this.updateTableRow();
		    		}
		}
	},
	
    handleBeforeEdit: function(e) {
		if(this.autorefresh_lap) {
			return false;
		}
		
		var curr_record = e.record;
		var curr_field = e.field;
		if(Ext.util.Format.trim(curr_record.get(curr_field)) == '(NULL)') {
			curr_record.set(curr_field, '');
		}

		this.getFieldKeyValues(e);
    },
    
    getFieldKeyValues: function(e) {
    	this.currentEditingRowIndex = e.row;
    	if(this.previousEditedRowIndex == -1) {
    		this.previousEditedRowIndex = this.currentEditingRowIndex;
    	}
    	
    	if(this.previousEditedRowIndex != this.currentEditingRowIndex) {
    		if(this.editedFields.length > 0) {
    			this.updateTableRow();
    		}
    		else {
    		   this.previousEditedRowIndex = this.currentEditingRowIndex;
    		   this.keyValues = [];
    		}
    	}
    	if(!this.keyValues.length) {
            for(var i = 0; i < this.keys.length; i++) {
            	var key = this.keys[i];
            	this.keyValues.push(e.record.data[key]);
            }
    	}
    },

    handleAfterEdit: function(e) {
    	if(e.record.newRow) {
    		this.newTableRow = e.record.data;
    	}
    	if(e.value == e.originalValue) {
    		return;
    	}
    	else {
    		if(this.editedFields.indexOf(e.field) == -1) {
        		this.editedFields.push(e.field);
        		this.editedFieldValues.push(e.value);
    		}
    		
    		var toolbar = this.getTopToolbar();
    		toolbar.get(0).enable();
    		toolbar.get(9).show();
    		toolbar.get(10).show();
    		
    	}
    },

	insertBackTicks: function(text) {
		if(!Ext.isArray(text)) {
			return "`" + text + "`";
		}

		var text_array = new Array();
		for(var i=0; i < text.length; i++) {
			text_array.push("`" + text[i] + "`");
		}

		return text_array;
	},

	insertQuotes: function(rows) {
		var row_set = new Array();

		if(Ext.isArray(rows)) {
			for(var i=0; i < rows.length; i++) {
				row_set.push("'" + this.addslashes(rows[i]) + "'");
			}
		}
		else {
			return "'" + this.addslashes(rows) + "'";
		}
		return row_set;
	},

	addslashes: function(str) {
		str = str.replace(/\\/g,'\\\\');
		str = str.replace(/\'/g,'\\\'');
		str = str.replace(/\"/g,'\\"');
		str = str.replace(/\0/g,'\\0');
		return str;
	},

	generateInsertSql: function() {
    	var col_model = this.getColumnModel();
    	var columns = col_model.columns;
    	var table_name = Dbl.UserActivity.getValue('table');
    	var database = Dbl.UserActivity.getValue('database');
    	var data = this.newTableRow;

    	var insert_sql = "INSERT INTO " + this.insertBackTicks(database) + "." + this.insertBackTicks(table_name);
    	var columns_arr = new Array();
    	var column_values = new Array();
    	for(var i = 1; i < columns.length; i++) {
    		columns_arr.push(this.insertBackTicks(columns[i].header));
    		var new_value = (data[columns[i].header] == 'undefined')? '' : data[columns[i].header];
    		if(new_value == '(NULL)' || !new_value) {
    			var temp_val = (columns[i].has_default && columns[i].default_value)? columns[i].default_value : null;
    			column_values.push(temp_val);
    		}
    		else {
	    		if(columns[i].field_type == 'bit') {
	    			//column_values.push("b" + this.insertQuotes(new_value));
	    			column_values.push("b" + new_value);
	    		}
	    		else if((columns[i].ctype == 'I' || columns[i].ctype == 'N') && columns[i].field_type != 'SET') {
	    			column_values.push(new_value);
	    		}
	    		else {
	    			//new_value = (new_value == 'CURRENT_TIMESTAMP')? new_value : this.insertQuotes(new_value);
	    			new_value = (new_value == 'CURRENT_TIMESTAMP')? new_value : new_value;
	    			column_values.push(new_value);
	    		}
    		}
    	}

    	columns_arr = columns_arr.join(", ");

    	var place_holders = [];
    	for(var j=0;j<column_values.length;j++) { place_holders.push("?");  }

    	insert_sql = insert_sql + " (" + columns_arr + ") VALUES (" + place_holders.join(", ") + ")";

    	return [insert_sql, column_values];

	},

    generateUpdateSql: function() {
    	var col_model = this.getColumnModel();
    	var columns = col_model.columns;
    	var conditional_keys = this.insertBackTicks(this.keys);
    	var conditional_values = this.insertQuotes(this.keyValues);
    	var table_name = Dbl.UserActivity.getValue('table');
    	var edit_fields = this.editedFields;
    	var edited_field_values = this.editedFieldValues;
    	var database = Dbl.UserActivity.getValue('database');
    	var update_query = this.getQueryDataString(columns, edit_fields, edited_field_values);

    	var where_condition_datas = this.generateKeyValuePairsData(conditional_keys, conditional_values);

    	var where_arr = new Array();
    	for(var i = 0; i < where_condition_datas.length; i++) {
    		where_arr[i] = where_condition_datas[i].key + " = " + where_condition_datas[i].value;
    	}

    	var update_sql = "UPDATE " + this.insertBackTicks(database) + "." + this.insertBackTicks(table_name) + " SET " + update_query[0].join(", ") + " WHERE " + where_arr.join(" AND ");
		var update_data = update_query[1];
    	return [update_sql, update_data];
    },

    generateKeyValuePairsData: function(keys, values) {
    	var key_value_arr = new Array();
    	for(var i = 0; i < keys.length; i++) {
    		var value = values[i];
    		if(value == "'(NULL)'") continue;
    		key_value_arr.push({key: keys[i], value: value});
    	}
    	return key_value_arr;
    },

    getQueryDataString: function(columns, edit_keys, edit_values) {
    	var key_value_pairs = new Array();
    	var values = [];
    	for(var i = 1; i < columns.length; i++) {
    		var field_value = '';
    		var index_name = columns[i].header;
    		var curr_index = edit_keys.indexOf(index_name);
    		if(curr_index == -1) continue;

    		var field_value = edit_values[curr_index];
			field_value = (field_value == '(NULL)')? 'NULL' : field_value;
			
			if(field_value == '(DEFAULT)') {
				field_value = (columns[i].has_default && columns[i].default_value)? columns[i].default_value : null; 
			}
			
			if(field_value != 'NULL') {
	    		if(columns[i].field_type == 'bit') {
	    			field_value = "b" + this.insertQuotes(field_value);
	    		}
	    		else if((columns[i].ctype == 'I' || columns[i].ctype == 'N') && columns[i].field_type != 'SET') {
	    			field_value = field_value;
	    		}
	    		else {
	    			//field_value = (field_value == 'CURRENT_TIMESTAMP')? field_value : this.insertQuotes(field_value);
	    			field_value = field_value;
	    		}
    		}

    		key_value_pairs.push(this.insertBackTicks(index_name) + " = ?");
    		values.push(field_value);
    	}
    	return [key_value_pairs, values];
    },

    updateTableRow: function(){
    	if(!Dbl.UserActivity.getValue('table')) {
    		Dbl.Utils.showErrorMsg("Could not be saved!", '');
    		return false;
    	}

    	var generated_sql = '';
    	var insert_or_update = '';
    	if(this.newTableRow) {
    		generated_sql = this.generateInsertSql();
    		insert_or_update = true;
    	} else {
    		generated_sql = this.generateUpdateSql();
    		insert_or_update = false;
    	}

    	var table = '`' + Dbl.UserActivity.getValue('database') + "`.`" + Dbl.UserActivity.getValue('table') + '`';
    	var requestParams = {connection_id: Server.connection_id,
    			             sql: generated_sql[0],
    			             data: generated_sql[1],
    			             insert_or_update: insert_or_update,
    			             table: table,
    			             tableKeys: Ext.encode(this.keys),
    			             keyValues: Ext.encode(this.keyValues),
    			             scope: this};

    	Server.sendCommand('update_table_data', requestParams,
    			function(data){
    				if(data.inserted && data.autoIncrValue) {
    					var field = this.auto_increment_field;
    					var record = this.store.getAt(this.previousEditedRowIndex);  
    					if(field) {
        					record.set(field, data.autoIncrValue);
    					}
    				}
    				
    				this.store.commitChanges();
    				this.resetEditParams();
    	    		if(data.success) {
    	    			var toolbar = this.getTopToolbar();
    	    			toolbar.get(0).disable();
    	    			toolbar.get(9).hide();
    	    			toolbar.get(10).hide();
    	    			this.autoSizeColumns();
    	    		}
    	    		if(!data.success) {
    	    			Dbl.Utils.showErrorMsg(data.msg);
    	    		}
    			},
    			function(data) {
//    				this.store.each(function(row){
//    					var rowindex = this.store.indexOf(row);
//    					if(row.newRow && (rowindex != this.previousEditedRowIndex)) {
//    					}
//    				});
    				var errorMsg = data.msg ? data.msg : data;
			    	Dbl.Utils.showErrorMsg(errorMsg);
    			});
    },

    // buildTopToolbar
    buildTopToolbar : function() {
    	var table_type = Dbl.UserActivity.getValue('table_type');
    	var refreshBtnGroup = this.getRefreshButtonGroup();
    	var saveBtnGroup = {
				xtype: 'buttongroup',
				disabled: true,
				items: [{
				    text:'Save',
				    tooltip: 'Save changes',
				    iconCls: 'update_table_data',
				    width: 60,
				    handler: this.saveTableRow,
				    scope: this,
	            }, {
				    text:'Cancel',
				    tooltip: 'Cancel changes',
				    iconCls: 'cancel_table_update',
				    width: 60,
				    handler: this.cancelTableModifications,
				    scope: this,
	            }]
    	};
    	var addBtnGroup = {
				xtype: 'buttongroup',
				items: [{
					text:'Add',
					tooltip: 'Add new row',
					iconCls: 'add',
					width: 60,
					handler: this.addTableRow,
					scope: this,
	            }, {
					text:'Delete',
					id: 'delete_row',
					tooltip: 'Delete selected row(s)',
					iconCls: 'remove',
					disabled: true,
					width: 60,
					handler: this.deleteConfirmation,
					scope: this,
	            }]
	
    	};
    	
    	var exportBtnGroup = {
				xtype: 'buttongroup',
				items: [{
	    			text: 'Export',
	    			id: "export_table_data",
	    			iconCls: 'copy_table',
	    			width: 60,
	    			handler: this.exportTableData,
	    			scope: this
	    		}]
    			
    	};
    	
    	
    	if(table_type == 'view') {
    		return refreshBtnGroup;
    	} else {
	       var toolbar = [saveBtnGroup, '-', addBtnGroup , '-', exportBtnGroup , '-',];
	       
	       var tbtext = {
	    		    xtype: 'buttongroup',
	    		    height: 30,
	    		    hidden: true,
	    		    items: [{
				        xtype: 'tbtext',
	    		    	cls: 'save_modification_alert',
				        text: 'Data modified but not saved',
	    		    }]
	       };
	       
	       toolbar = toolbar.concat(refreshBtnGroup);
	       toolbar.push({
				xtype: 'tbseparator',
				hidden: true,
	       });
	       toolbar.push(tbtext);
	       return toolbar;
    	}
   },

   // buildBottomPaginator
   buildBottomPaginator: function(store){
    	this.paginator = new Ext.PagingToolbar({
			id: 'table_data_paginator',
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

    // add new row
    addTableRow: function(){
    	var rowCount = this.getStore().getCount();
        var Row = this.getStore().recordType;
        var rowConfig = {};
        var colModel = this.getColumnModel();
        for(var i=1;i<colModel.columns.length; i++){
        	//if(i == 1) continue;
        	var currColumn = colModel.columns[i];
        	var field = currColumn.header;
        	var curr_val = '(NULL)';
        	if(currColumn.field_type == 'set' || currColumn.field_type == 'enum' || currColumn.field_type == 'timestamp') {
        		curr_val = (currColumn.has_default && currColumn.default_value)? currColumn.default_value : curr_val;
        	}
        	rowConfig[field] = curr_val;
        }

        var tableRow = new Row(rowConfig);
        tableRow.newRow = true;
        this.stopEditing();
        this.store.insert(rowCount, tableRow);
        this.startEditing(rowCount, 1);
    },

    // save row changes
    saveTableRow: function(){
    	this.updateTableRow();
    },

    // cofirm delete
    deleteConfirmation: function(){
	    var rows = this.getSelectionModel().getSelections();
	    if(rows.length > 0){
		     Ext.Msg.show({
		    	 title:    'Confirmation',
				 msg:      Messages.getMsg('delete_rows'),
				 buttons:  Ext.Msg.YESNO,
				 fn:       this.deleteSelectedRows.createDelegate(this),
				 animEl:   'delete_row',
				 icon:     Ext.MessageBox.QUESTION
		 	 });
	    }
	},

	generateDeleteSql: function(field_keys, field_values) {
		var cm = this.getColumnModel();
		var condition_keys = this.getQueryDataString(cm.columns, field_keys, field_values);
		var sql = "DELETE FROM " + this.insertBackTicks(Dbl.UserActivity.getValue('database')) + "." + this.insertBackTicks(Dbl.UserActivity.getValue('table')) + " WHERE " + condition_keys.join(" AND ");
		return sql;
	},
	
	generateSelectSql: function(field_keys, field_values) {
		var cm = this.getColumnModel();
		var condition_keys = this.getQueryDataString(cm.columns, field_keys, field_values);
		var sql = "SELECT count(*) FROM " + this.insertBackTicks(Dbl.UserActivity.getValue('database')) + "." + this.insertBackTicks(Dbl.UserActivity.getValue('table')) + " WHERE " + condition_keys.join(" AND ");
		return sql;
	},

	// delete rows
	deleteSelectedRows: function(btn){
		if(btn == 'yes') {
			var jsonData = this.getSelectedRows();
			var fieldObj = Ext.decode(jsonData);

			// for unsaved rows
			if(!fieldObj.length) {
            	this.deleteRows();
            	return;
            }
			
			var sqls = [];
			for(var i=0; i<fieldObj.length; i++) {
				var obj = fieldObj[i];
				var selectSQL = this.generateSelectSql(obj.keys, obj.values);
				var deleteSQL = this.generateDeleteSql(obj.keys, obj.values);
				sqls.push({selectsql: selectSQL, deletesql: deleteSQL});
			}

			Server.sendCommand('delete_table_row', {
				connection_id: Server.connection_id,
	    	   	table: Dbl.UserActivity.getValue('table'),
	    	   	database: Dbl.UserActivity.getValue('database'),
	    	   	queries: sqls, 
	    	   	scope: this},
	    	   	function(data){
                    if(data.success) {
                    	this.deleteRows();
                		this.refreshCurrentPage();
                	}
                    else if(!data.success) {
                    	Dbl.Utils.showErrorMsg(data.msg, '');
		    	    }
	    	},
	    	function(data){
		    	var errorMsg = data.msg ? data.msg : data;
		    	Dbl.Utils.showErrorMsg(errorMsg, '');
	    	});
		}
	},
	
	deleteRows: function() {
		var rows =  this.getSelectionModel().getSelections();
        var store = this.getStore();
		for(var i=0; i<rows.length; i++){
        	var row = rows[i];
			store.remove(row);
        }
		
		this.resetEditParams();

		var toolbar = this.getTopToolbar();
		toolbar.get(0).disable();
		toolbar.get(9).hide();
		toolbar.get(10).hide();

	},

	cancelTableModifications: function() {
		this.store.rejectChanges();
		this.resetEditParams();

		var toolbar = this.getTopToolbar();
		toolbar.get(0).disable();
		toolbar.get(9).hide();
		toolbar.get(10).hide();
	},
	refreshCurrentPage: function() {
   		this.paginator.doRefresh();
   		
   		if(Dbl.UserActivity.getValue('table_type') == 'table') {
   			var toolbar = this.getTopToolbar();
   			toolbar.get(0).disable();
   			toolbar.get(9).hide();
   			toolbar.get(10).hide();
   		}

   		if(this.autorefresh_lap) {
			Dbl.Utils.startTaskRunner(this.autorefresh_lap, '', '', '', 'TABLEDATA');
		}
	},
	
	// get key-value pairs of selected records
	getSelectedRows: function(){
		// get selected rows
		var rows = this.getSelectionModel().getSelections();
	    var objArr = [];

	    for(var i = 0; i < rows.length; i++) {
	    	if(rows[i].newRow) continue;

	    	var field_keys = [];
		    var field_values = [];
	    	
	    	// get key-value pair for each row
	    	if(this.keys.length) {
	    		for(var j = 0; j < this.keys.length;  j++){
	    			var key = this.keys[j];
	    			var keyValue = rows[i].get(key);
	    			field_keys[j] = key;
	    			field_values[j] = keyValue;
				}
	    	}
	    	else {
				for(var m = 0; m < this.fields.length;  m++){
					var field = this.fields[m];
					var fieldValue = rows[i].get(field);
	    			field_keys[j] = field;
	    			field_values[j] = fieldValue;
				}
		    }

	    	objArr.push({keys: field_keys, values: field_values});
	    }
		return Ext.encode(objArr);
	},

	// on add / update refresh the particular record in store
	updateDataStore: function(data){
		var dataStore = this.getStore();
		var updatedRows = dataStore.getModifiedRecords();
    	var lastUpdatedRow = updatedRows[updatedRows.length-1];
    	var rowId = lastUpdatedRow.id;
    	var index = dataStore.indexOfId(rowId);
    	var Row = dataStore.recordType;

    	if(data.inserted) {
    		var record = Ext.decode(data.row);
    	}
    	else {
        	var record = lastUpdatedRow.data;
    	}

		dataStore.removeAt(index);
    	var updatedRow = new Row(record);
    	dataStore.insert(index, updatedRow);
	},

  onCellContextMenu : function(grid, rowIndex, cellIndex, e) {
    var cur_column = grid.getColumnModel().columns[cellIndex];
	if(cur_column.is_binary && (cur_column.field_type != 'binary' && cur_column.field_type != 'varbinary')) {
		return;
	}

	e.stopEvent();	// To stop the browser default event

    if(this.menu) {
      this.menu.removeAll();
    }

	var menu_id = "grid_cell_context";
    var menu_items = [this.InsertRow(grid),
    				  this.DeleteRow(grid, rowIndex),
    				  '-',
    				  this.SetEmptyString(grid, rowIndex, cellIndex),
    				  this.SetNull(grid, rowIndex, cellIndex),
    				  this.SetDefault(grid, rowIndex, cellIndex),
    				  '-',
    				  this.SaveChanges(grid),
    				  this.CancelUpdation(grid)];

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
    //this.startEditing(rowIndex, cellIndex);	
  },

 	InsertRow: function(grid) {
		return {
			itemId: 'insert_row_context',
			text: 'Insert New Row',
			iconCls: 'add',
			disabled: grid.autorefresh_lap ? true : false,
			listeners: {
				click: function() {
					grid.addTableRow();
				}
			}
		};
	},

 	DeleteRow: function(grid, rowIndex) {
		return {
			itemId: 'delete_row_context',
			text: 'Delete Row',
			iconCls: 'remove',
			disabled: grid.autorefresh_lap ? true : false,
			listeners: {
				click: function() {
					grid.getSelectionModel().selectRow(rowIndex);
					grid.deleteConfirmation();
				}
			}
		};
	},

 	SaveChanges: function(grid) {
		
		var toolbar = Ext.getCmp('table_data_grid').getTopToolbar();
		var hasChanges = toolbar.get(0).disabled;
		
		return {
			itemId: 'save_changes_context',
			text: 'Save Changes',
			iconCls: 'update_table_data',
			disabled: (grid.autorefresh_lap || hasChanges) ? true : false,
			listeners: {
				click: function() {
					grid.saveTableRow();
				}
			}
		};
	},

 	CancelUpdation: function(grid) {
		var toolbar = Ext.getCmp('table_data_grid').getTopToolbar();
		var hasChanges = toolbar.get(0).disabled;

		return {
			itemId: 'revert_row_context',
			text: 'Cancel Changes',
			iconCls: 'cancel_table_update',
			disabled: (grid.autorefresh_lap || hasChanges) ? true : false,
			listeners: {
				click: function() {
					grid.cancelTableModifications();
				}
			}
		};
	},

 	SetEmptyString: function(grid, rowIndex, cellIndex) {
		return {
			itemId: 'set_empty_' + cellIndex,
			text: 'Set To Empty String',
			iconCls: 'empty_cell',
			disabled: grid.autorefresh_lap ? true : false,
			listeners: {
				click: function(baseItem, e) {
					grid.changeCellData("", grid, rowIndex, cellIndex);
				}
			}
		};
	},

 	SetNull: function(grid, rowIndex, cellIndex) {
		return {
			itemId: 'set_null_' + cellIndex,
			text: 'Set To NULL',
			iconCls: 'null_cell',
			disabled: grid.autorefresh_lap ? true : false,
			listeners: {
				click: function(baseItem, e) {
					grid.changeCellData("(NULL)", grid, rowIndex, cellIndex);
				}
			}
		};
	},

 	SetDefault: function(grid, rowIndex, cellIndex) {
		return {
			itemId: 'set_default_' + cellIndex,
			text: 'Set To Default',
			iconCls: 'default_value_cell',
			disabled: grid.autorefresh_lap ? true : false,
			listeners: {
				click: function(baseItem, e) {
					grid.changeCellData("(DEFAULT)", grid, rowIndex, cellIndex);
				}
			}
		};
	},

	changeCellData: function(data, grid, rowIndex, cellIndex) {
		// Change the cell data
		var record = grid.getStore().getAt(rowIndex);  // Get the Record
		var fieldName = grid.getColumnModel().getDataIndex(cellIndex); // Get field name
		record.set(fieldName, data);
		var field_obj = {row: rowIndex, record: record};
		this.getFieldKeyValues(field_obj);
   		this.editedFields.push(fieldName);
   		var data = (data == '')? "''" : data;
   		this.editedFieldValues.push(data);
   		
		var toolbar = this.getTopToolbar();
		toolbar.get(0).enable();
		toolbar.get(9).show();
		toolbar.get(10).show();

	},
	
	exportTableData: function() {
        Database.sendCommand('get_table_columns', {
			tablename: Dbl.UserActivity.getValue('table'),
        	dbname: Dbl.UserActivity.getValue('database')
        }, function(data){
        	data.curr_table = Dbl.UserActivity.getValue('table');
        	data.curr_db = Dbl.UserActivity.getValue('database');
			this.win = new Dbl.ContextMenuWindow({
				title : 'Export Table',
				id : 'export_table',
				width : 560,
				height : 240,
				onEsc: function(){},
				items: [new Dbl.ExportTableDbPanel(data)]
			});
			this.win.show();
        },
        function(data) {
			var errorMsg = data.msg ? data.msg : data;
			Dbl.Utils.showErrorMsg(errorMsg, '');
        });
	},
	
	getRefreshButtonGroup: function() {
    	var refreshBtn = {
			    text:'Refresh',
			    tooltip: 'Refresh',
			    iconCls: 'table_data_refresh',
			    iconAlign: 'left',
			    disabled: false,
			    width: 60,
			    handler: this.refreshCurrentPage,
			    scope: this
    	};

		var autoRefreshBtn = {
				text:'Auto Refresh',
				tooltip: 'Auto Refresh',
				iconCls: 'table_data_refresh',
				iconAlign: 'left',
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
		        			width: 60,
		        			handler: function() {
		        				var toolbar = Ext.getCmp('table_data_grid').getTopToolbar();
								if(Dbl.UserActivity.getValue('table_type') == 'table') {
									toolbar.get(0).disable();
									toolbar.get(2).disable();
									toolbar.get(4).disable();
									toolbar.get(9).hide();
									toolbar.get(10).hide();
								}
		        				
		        				var refreshBtns = toolbar.items.get('tabledata_refresh_btns');
		        				var form = refreshBtns.items.get(1).menu.items.get(0);
								var fields = form.getForm().getFieldValues();
								if(fields.second < 1 || fields.second > 86400) {
									return false;
								}
								
								refreshBtns.get(1).menu.hide();
								refreshBtns.disable();
								refreshBtns.nextSibling().show();
								refreshBtns.nextSibling().nextSibling().show();
				        		Ext.getCmp('table_data_grid').autorefresh_lap = fields.second;
				        		Dbl.Utils.startTaskRunner(fields.second, '', '', '', 'TABLEDATA');
			        	    }
			          }, {
		        			text: 'Cancel',
		        			tooltip: 'Cancel auto refresh',
		        			width: 60,
		        			handler: function() {
			        	  		var toolbar = Ext.getCmp('table_data_grid').getTopToolbar();
		        				var refreshBtns = toolbar.items.get('tabledata_refresh_btns');
		        				refreshBtns.get(1).menu.hide();
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
					Ext.getCmp('table_data_grid').autorefresh_lap = null;
					var toolbar = Ext.getCmp('table_data_grid').getTopToolbar();
					if(Dbl.UserActivity.getValue('table_type') == 'table') {
						toolbar.get(2).enable();
						toolbar.get(4).enable();
					}

					var refreshBtns = toolbar.get('tabledata_refresh_btns');
					refreshBtns.enable();
					refreshBtns.nextSibling().hide();
					refreshBtns.nextSibling().nextSibling().hide();
		    		Dbl.Utils.stopTaskRunner(this.updatetask, this.updaterunner, this.delayedtask);
				}
		};

		return [{
				xtype: 'buttongroup',
				id: 'tabledata_refresh_btns',
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

	}
});

