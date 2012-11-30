/**
 * @constructor
 */
Dbl.CreateTableGridPanel = function(data) {
	this.gridColumns = data.column_names
	data = this.createColumns(data);
	
	var store = new Ext.data.SimpleStore({
		fields: data.fields
	});

	store.on("load", function(store, records, options) {
		Dbl.Utils.removeLoadingIcon();
	}, this);

	
	store.loadData(data.rows);

	var selectionModel = new Ext.grid.CheckboxSelectionModel({
		header: '',
		checkOnly: true,
		init: function(grid){
			this.grid = grid;
			this.initEvents();
		}, 
		listeners: {
			rowdeselect: this.handleRowDeselect
		}
	});

	var gridColumns = new Array(selectionModel);
	var gridColumns = gridColumns.concat(data.columns);

	var columnModel = new Ext.grid.ColumnModel({
		defaults: {},
		columns: gridColumns
	});

	if(Dbl.UserActivity.getValue('table_type') == 'view') {
		for(var i=1; i<columnModel.getColumnCount(); i++) {
			var curr_obj = columnModel.columns[i];
			curr_obj.editor = '';
		}
	}
	
	Dbl.CreateTableGridPanel.superclass.constructor.call(this, {
		id: (data.create_table) ? ('create_table_grid') : ('alter_table_grid'),
		alter_table: (data.alter_table) ? true : false,
		store: store,
		height: 432,
		cm: columnModel,
		sm: selectionModel,
		columnLines: true,
		clicksToEdit: 1,
		viewConfig: {},
		trackMouseOver: true,
		border: false,
		plugins: [this.primaryKeyColumn, this.notNullColumn, this.unsignedColumn, this.autoIncrColumn, this.zerofillColumn],
		listeners: {
			viewready: this.autoSizeColumns,
			afterrender: this.selectTableColumn,
			beforeedit: this.handleBeforeEdit,
			afteredit: this.handleAfterEdit,
			scope: this
		}
	});
};

Ext.extend(Dbl.CreateTableGridPanel, Ext.grid.EditorGridPanel, {
	
	gridColumns:       new Array(),
	changedFieldsOld:  new Array(),
	changedFieldsNew:  new Array(),
	modifiedFields:    new Array(),
	deletedFields:     new Array(),
	addedFields:       new Array(),
	
	autoSizeColumns: function() {
		for (var i = 1; i < this.colModel.getColumnCount(); i++) {
			this.autoSizeColumn(i);
		}
		this.view.refresh(true);
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
		this.colModel.setColumnWidth(c, w);
		return w;
	},
   
	getComboBoxEditor: function(field, values) {
		return new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields: [field],
				data: values
			}),
			displayField: field,
			typeAhead: true,
			forceSelection: true,
			selectOnFocus: true,
			mode: 'local',
			triggerAction: 'all',
			name: field
		});
	},
	
	createColumns: function(data) {
		this.primaryKeyColumn = new Ext.ux.CheckColumn({
			header: 'Primary Key',
			dataIndex: 'primary_key',
			width: 70
		});
		this.notNullColumn = new Ext.ux.CheckColumn({
			header: 'Not Null',
			dataIndex: 'not_null',
			width: 70
		});
		this.unsignedColumn = new Ext.ux.CheckColumn({
			header: 'Unsigned',
			dataIndex: 'unsigned',
			width: 70
		});
		this.autoIncrColumn = new Ext.ux.CheckColumn({
			header: 'Auto Incr',
			dataIndex: 'auto_incr',
			width: 70
		});
		this.zerofillColumn = new Ext.ux.CheckColumn({
			header: 'Zerofill',
			dataIndex: 'zerofill',
			width: 70
		});

		data.fields = new Array();
		data.columns = new Array();

		for(var i=0; i<data.column_names.length; i++) {
			var key = data.column_names[i];
			switch(key){
				case 'field_name':
					data.fields[i] = {name: key, type: 'string'};
					data.columns[i] = {
							header: 'Field name',
							id: key,
							dataIndex: key,
							editor: new Ext.form.TextField({ name: key })
					};
					break;
	
				case 'datatype':
					data.fields[i] = {name: key, type: 'string'};
					data.columns[i] = {
							header: 'Datatype',
							id: key,
							dataIndex: key,
							editor: Dbl.Utils.getComboBoxEditor(key, data.datatypes)
					};
					break;
	
				case 'length':
					data.fields[i] = {name: key, type: 'string'};
					data.columns[i] = {
							header: 'Length',
							id: key,
							dataIndex: key,
							editor: new Ext.form.TextField({ name: key })
					};
					break;
	
				case 'default_value':
					data.fields[i] = {name: key, type: 'string'};
					data.columns[i] = {
							header: 'Default',
							id: key,
							dataIndex: key,
							editor: new Ext.form.TextField({ name: key })
					};
					break;
	
				case 'primary_key':
					data.fields[i] = {name: key, type: 'bool'};
					data.columns[i] = this.primaryKeyColumn;
					break;
	
				case 'not_null':
					data.fields[i] = {name: key, type: 'bool'};
					data.columns[i] = this.notNullColumn;
					break;
	
				case 'unsigned':
					data.fields[i] = {name: key, type: 'bool'};
					data.columns[i] =this.unsignedColumn;
					break;
	
				case 'auto_incr':
					data.fields[i] = {name: key, type: 'bool'};
					data.columns[i] = this.autoIncrColumn;
					break;
	
				case 'zerofill':
					data.fields[i] = {name: key, type: 'bool'};
					data.columns[i] = this.zerofillColumn;
					break;
	
//				case 'charset':
//					data.fields[i] = {name: key, type: 'string'};
//					data.columns[i] = {
//						header: 'Charset',
//						id: key,
//						dataIndex: key,
//						width: 100,
//						editor: Dbl.Utils.getComboBoxEditor(key, data.charsets)
//					};
//					break;
	
				case 'collation':
					data.fields[i] = {name: key, type: 'string'};
					data.columns[i] = {
							header: 'Collation',
							id: key,
							dataIndex: key,
							editor: Dbl.Utils.getComboBoxEditor(key, data.collations)
					};
					break;
	
				case 'comment':
					data.fields[i] = {name: key, type: 'string'};
					data.columns[i] = {
							header: 'Comment',
							id: key,
							dataIndex: key,
							editor: new Ext.form.TextField({ name: key })
					};
					break;
	
				default:
					break;
			}
		}
		return data;

	},
	
	checkForEdit: function(datatype, fileld) {
		switch(datatype) {
			case 'int':
			case 'smallint':
			case 'mediumint':
			case 'bigint':
			case 'float':
			case 'double':
				var uneditableFields = new Array('charset', 'collation');
				break;
	
			case 'bool':
			case 'boolean':
				var uneditableFields = new Array('length', 'unsigned', 'auto_incr', 'charset', 'collation');
				break;
	
			case 'date':
			case 'datetime':
			case 'time':
			case 'timestamp':
				var uneditableFields = new Array('length', 'unsigned', 'auto_incr', 'zerofill', 'charset', 'collation');
				break;
	
			case 'varbinary':
			case 'year':
			case 'bit':
				var uneditableFields = new Array('unsigned', 'auto_incr', 'zerofill', 'charset', 'collation');
				break;
	
			case 'blob':
				var uneditableFields = new Array('primary_key', 'unsigned', 'auto_incr', 'zerofill', 'charset', 'collation');
				break;
	
			case 'tinyblob':
			case 'mediumblob':
			case 'longblob':
				var uneditableFields = new Array('length', 'primary_key', 'unsigned', 'auto_incr', 'zerofill', 'charset', 'collation');
				break;
	
			case 'binary':
			case 'decimal':
				var uneditableFields = new Array('auto_incr', 'charset', 'collation');
				break;
	
			case 'char':
			case 'varchar':
			case 'enum':
			case 'set':
				var uneditableFields = new Array('unsigned', 'auto_incr', 'zerofill');
				break;
	
			case 'text':
				var uneditableFields = new Array('primary_key', 'unsigned', 'auto_incr', 'zerofill');
				break;
	
			case 'tinytext':
			case 'mediumtext':
			case 'longtext':
				var uneditableFields = new Array('length', 'primary_key', 'unsigned', 'auto_incr', 'zerofill');
				break;
	
			case 'numeric':
				var uneditableFields = new Array('unsigned', 'auto_incr', 'charset', 'collation');
				break;
	
			case 'real':
				var uneditableFields = new Array('unsigned', 'charset', 'collation');
				break;
	
			default:
				var uneditableFields = new Array();
		}
		
		var index = uneditableFields.indexOf(fileld);
		return ret = (index == -1) ? true : false;

	},
	
	handleBeforeEdit: function(e) {
		if(e.field != 'field_name') {
			if(!e.record.data.field_name) {
				return false;
			} else if(e.field != 'datatype'){
				var isEditable = this.checkForEdit(e.record.data.datatype, e.field);
				if(!isEditable) {
					return false;
				}
			}
		}
	},

	handleAfterEdit: function(e) {
		this.autoSizeColumns();

		if(e.value == e.originalValue) {
    		return;
    	} else {

    		if(this.alter_table) {
    			Ext.getCmp('alter_table_panel').getTopToolbar().get(0).enable();
    		}   		
    	
	    	if(e.field == "field_name") {
	    		var old_col_name = e.originalValue;
	    		var new_col_name = e.value;
	    		if(!old_col_name || !new_col_name) return;
	    		
	    		if(this.changedFieldsNew.length) {
	    			for(var i=0; i<this.changedFieldsNew.length; i++) {
	    				var old_to_new = this.changedFieldsNew[i];
	    				if(old_to_new.new_col == old_col_name) {
	    					this.changedFieldsNew[i].new_col = new_col_name;
	    					return;
	    				}
	    			}
	    		}
	    		
	    		if(this.changedFieldsOld.indexOf(old_col_name) == -1) {
	    			var old_to_new = {old_col:old_col_name, new_col: new_col_name};
	    			this.changedFieldsOld.push(old_col_name);
	        		this.changedFieldsNew.push(old_to_new);
	            }
	    	} 
	    	else {
	            if(this.modifiedFields.indexOf(e.record.data.field_name) == -1) {
	            	if(this.changedFieldsOld.indexOf(e.record.data.field_name) == -1) {
	            		this.modifiedFields.push(e.record.data.field_name);
	            	}
	            }
	    	}
    	}	
	},
	
	addField: function(){
		var store = this.store;
        var selectedFields = this.getSelectionModel().getSelections();
        var rowIndex = "";
        if(selectedFields.length > 0){
			var row = selectedFields[0];
			var index = store.indexOf(row);
			if(index != -1) {
				rowIndex = index;
			}
        }
		var rowCount = store.getCount();
        var tableRow = new store.recordType({});
        tableRow.new_field = true;
        var insertAt = (selectedFields.length > 0) ? rowIndex : rowCount;
        this.stopEditing();
        store.insert(insertAt, tableRow);
        this.startEditing(insertAt, 1);
    },
	
    removeFieldConfirm: function() {
    	var grid = this;
	    var selectedFields = grid.getSelectionModel().getSelections();

	    if(this.store.getCount() == selectedFields.length) {
	    	Dbl.Utils.showErrorMsg(Messages.getMsg('table_field_required'));
    		return;
    	}
	    if(selectedFields.length > 0){
		     Ext.Msg.show({
		    	 title:    'Confirmation',
				 msg:      Messages.getMsg('drop_columns'),
				 buttons:  Ext.Msg.YESNO,
				 fn:       this.removeField,
				 animEl:   'delete_row',
				 icon:     Ext.MessageBox.QUESTION,
				 scope:    grid
		 	 });
	    } else {
	    	Dbl.Utils.showErrorMsg(Messages.getMsg('nocolumn_selected'));
	    }
    },
    
	removeField: function(btn){
    	if(btn == 'yes'){
    		var selectedFields = this.getSelectionModel().getSelections();
    		for(var i=0; i<selectedFields.length; i++){
    			var field_name = selectedFields[i].data.field_name;
    			this.deletedFields.push(field_name);
    			this.store.remove(selectedFields[i]);
    			Ext.getCmp('alter_table_panel').getTopToolbar().get(0).enable();
            }
		} else {
			this.getSelectionModel().clearSelections();
		}
	},
	
	dropColumnConfirm: function(column) {
    	var grid = this;
	    var selectedFields = grid.getSelectionModel().getSelections();

	    var colname = Explorer.selectedColumn ? Explorer.selectedColumn : column;
	    if(this.store.getCount() == selectedFields.length) {
	    	Dbl.Utils.showErrorMsg(Messages.getMsg('table_field_required'));
	    	return;
    	}

	    if(selectedFields.length > 0){
		     Ext.Msg.show({
		    	 title:    'Confirmation',
				 msg:      Messages.getMsg('drop_column', [colname, Explorer.selectedTable]),
				 buttons:  Ext.Msg.YESNO,
				 fn:       this.dropColumn,
				 animEl:   'delete_row',
				 icon:     Ext.MessageBox.QUESTION,
				 scope:    grid
		 	 });
	    } else {
	    	Dbl.Utils.showErrorMsg(Messages.getMsg('nofield_selected'));
	    }

	},
	
	dropColumn: function(btn) {
    	if(btn == 'yes') {
    		var selectedFields = this.getSelectionModel().getSelections();
    		for(var i=0; i<selectedFields.length; i++){
    			var field_name = selectedFields[i].data.field_name;
    			this.deletedFields.push(field_name);
    			this.store.remove(selectedFields[i]);
    			var retVal = this.validateDefinition();
    			if(retVal) { this.alterTable(true); }
            }
		} else {
			this.getSelectionModel().clearSelections();
    	    Explorer.selectedColumn = '';
   	    	Explorer.selectedColumnNodeId = '';
		}
	},
	
	validateDefinitionAndCreateTable: function() {
		var retVal = this.validateDefinition();
		if(retVal) {
			this.showTableNameWindow();
		}
	},
	
	validateDefinition: function() {
		var dataStore =  this.getStore();
		var tableFields = dataStore.data.items;
		var noFieldsErrorMsg = Messages.getMsg('nofield_definitions');

		if(!tableFields.length) {
			Dbl.Utils.showErrorMsg(noFieldsErrorMsg, '');
			return false;
		} else {
			var isTableDefined = false;
			for(var i=0; i<tableFields.length; i++) {
				var fieldData = tableFields[i].data;
				
				if(fieldData.field_name && fieldData.datatype) {
					isTableDefined = true;
				} else if(fieldData.field_name && !fieldData.datatype) {
					var noDataTypeErrorMsg = Messages.getMsg('nofield_datatype', [fieldData.field_name]);
					Dbl.Utils.showErrorMsg(noDataTypeErrorMsg, '');
					return false;
				} else if(!fieldData.field_name 
							&& !fieldData.datatype 
								&& (i==tableFields.length-1)
									&& !isTableDefined) {
					Dbl.Utils.showErrorMsg(noFieldsErrorMsg, '');
					return false;
				}
			}
		}
		return true;
	},
	
	showTableNameWindow: function() {
		  var window = new Dbl.ContextMenuWindow({
				title : "Create New Table",
				id : "get_table_name_window",
				width : 300,
				height : 120,
				resizable : false,
				layout : "border",
				modal : true,
				plain : true,
				stateful : true,
				items : [ {
					id : 'get_table_name_panel',
					region : 'center',
					xtype : 'panel',
					layout : 'fit',
					border: false,
					items : [ new TableNamePanel(this) ]
				} ]
			});
		  window.show();
	},
	
	createTable: function(tablename) {
		var panel = this;
		var table_ddl = this.getCreateSQL(tablename);	
		
		Server.sendCommand('create_table',
				{database: Explorer.selectedDatabase,
			     tablename: tablename,
			     table_ddl: table_ddl
			     }, function(data) {
		    	    if(data.success) {
		    	    	Explorer.selectedTable = tablename;
		     		    Explorer.explorerPanel.removeAll();
		    		    Explorer.loadExplorerData(Explorer.selectedDatabase, Explorer.selectedTable, 'table');

		    		    Explorer.selectedNodeType = "table";
		    			Explorer.selectedTable = tablename;
		    			Dblite.dataPanel.activate('create_table_panel');
		    			
		    			Ext.getCmp('get_table_name_window').close();
		    	    	Ext.Msg.show({
		    	    	   title:'Success',
		    	    	   msg: data.msg,
		    	    	   buttons: Ext.Msg.OK,
		    	    	   fn: panel.createMoreTableConfirm.createCallback(panel),
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
	
	getCreateSQL: function(tablename) {
		var dataStore =  this.getStore();
		var fieldObjects = new Array();
		var fieldDefinitions = new Array();
		var primaryKeys = new Array();
		var table_ddl = "";
        
		for(var i=0, l=dataStore.data.items.length; i<l; i++) {
			var fieldData = dataStore.data.items[i].data;
			if(fieldData.field_name || fieldData.datatype) {
				fieldObjects.push(fieldData)
			}
		}
		
		if(!fieldObjects.length) {
			table_ddl = "CREATE TABLE `NewTable`;"
		} else {
			for(var i=0; i<fieldObjects.length; i++){
				var fieldObj = fieldObjects[i];
				var definition = "";
				if(fieldObj.field_name) { 
					definition  += " `" + fieldObj.field_name + "` "; 
				} else { 
					definition  += " `` ";
				}
				if(fieldObj.datatype)   { definition  += " " + fieldObj.datatype; }
				if(fieldObj.length)     { definition  += "(" + fieldObj.length+ ")"; }
				if(fieldObj.unsigned)   { definition  += " UNSIGNED "; }
				if(fieldObj.zerofill)   { definition  += " ZEROFILL "; }
				if(fieldObj.collation && (fieldObj.collation != "[default]")) { 
					definition += " COLLATE " + fieldObj.collation; 
				}
				if(fieldObj.primary_key || fieldObj.not_null) { 
					definition += " NOT NULL "; 
				} else {
					definition += " NULL "; 
				}

				if(fieldObj.default_value) {
					var default_value = fieldObj.default_value;
					fieldObj.default_value = default_value.replace(/[\']{1}/gi, "");
					var pattern = /\s/g;
					if(pattern.test(fieldObj.default_value) || fieldObj.datatype.toLowerCase() == "enum") {
						fieldObj.default_value = "'" + fieldObj.default_value + "'";
					}
					definition += " DEFAULT " +  fieldObj.default_value ;
				}

				if(fieldObj.auto_incr) { definition += " AUTO_INCREMENT "; }
				if(fieldObj.comment) { definition += " COMMENT '" + fieldObj.comment+ "' "; }

				fieldDefinitions.push(definition);
				if(fieldObj.primary_key) { 
					primaryKeys.push("`" + fieldObj.field_name + "`");
				}
			}
			
			if(primaryKeys.length) {
				var primary_key_str = primaryKeys.join(", ");
				var primary_key_def = " PRIMARY KEY (" + primary_key_str +  ")";
				fieldDefinitions.push(primary_key_def);
			}

			var field_definition_str = fieldDefinitions.join(",\n") ;
			var table_name = (tablename) ? ("`" + tablename + "`") : ("`NewTable`");  
			var table_ddl = "CREATE TABLE "+ table_name +" (\n" + field_definition_str + "\n);";
		}
		
		return table_ddl;
	},
	
	createMoreTableConfirm: function(panel) {
	     Ext.Msg.show({
	    	 title:    'Confirmation',
			 msg:      'Do you want to add more tables?',
			 buttons:  Ext.Msg.YESNO,
			 fn:       panel.createMoreTable,
			 animEl:   document.body,
			 icon:     Ext.MessageBox.QUESTION,
			 scope:    panel
	 	 });
	},
	
	createMoreTable: function(btn) {
		if(btn == 'yes') {
			Dblite.dataPanel.activate('create_table_panel');
			var activeTab = Dblite.dataPanel.getActiveTab();
			activeTab.get('create_table_grid').getStore().removeAll();
			for(var i=0; i<10; i++) {
				this.addField();
			}
			activeTab.get('preview_create_sql').hide();
			activeTab.get('create_table_grid').show();
			activeTab.closePreviewSQL(true, false);
			activeTab.doLayout();

		} else if(btn == 'no') {

			Dblite.dataPanel.remove('create_table_panel');
			var selectedNodeType = "table";
			var selectedDatabase = Explorer.selectedDatabase
			var selectedTable = Explorer.selectedTable;
			
		    Explorer.explorerPanel.removeAll();
		    Explorer.loadExplorerData(selectedDatabase, selectedTable, 'table');
		    
		    Explorer.selectedNodeType = "table";
			Explorer.getDbTablesAndColumns();
		}
	},
	
	validateDefinitionAndAlterTable: function() {
		var retVal = this.validateDefinition();
		if(retVal) {
			this.alterTable(false);
		}
	},
	
	alterTable: function(dropcolumn) {
		var sql = this.getAlterSQL(this.table);
		
		Server.sendCommand('alter_table', {
			     parent_database: this.database,
			     target_table: this.table  ,
			     alter_sql: sql
			     }, function(data) {
			    	    if(data.success) {
			    	    	Explorer.getDbTablesAndColumns();
			    	    	var grid = Ext.getCmp('alter_table_grid');
			    	    	grid.reset();

			    	    	grid.primary_key_columns =  new Array();
			    	    	grid.store.each(function(row) {
			    				if(row.data.primary_key) {
			    					grid.primary_key_columns.push(row.data.field_name);
			    				}
			    			});

			    	    	if(data.msg) {
			    	    	   	Ext.Msg.show({
			    	     	   	   title:'Success',
			    	     	   	   msg: data.msg,
			    	     	   	   buttons: Ext.Msg.OK,
			    	     	   	   fn:   Ext.getCmp('alter_table_panel').refreshStore,
			    	     	   	   animEl: document.body,
			    	     	   	   icon: Ext.MessageBox.INFO
			    	     	    });
			    	    	   	
			    	    	   	if(dropcolumn) {
				 	   	    	    var columnNode = Explorer.explorerTreePanelObj.getNodeById(Explorer.selectedColumnNodeId);
				 	   	    	    columnNode.remove();
				 	   	    	    Explorer.selectedColumn = '';
					 	   	    	Explorer.selectedColumnNodeId = '';

			    	    	   	} else {
					     		    Explorer.explorerPanel.removeAll();
					    		    Explorer.loadExplorerData(Explorer.selectedDatabase, Explorer.selectedTable, 'table');
			    	    	   	}
			    	    	
			    	    	   	// reloading table structure panel forcefully
			    	    	   	Dblite.dataPanel.showTableStructurePanel(true);
			    	    	
			    	    	} else {
			    	    		Ext.getCmp('alter_table_panel').refreshStore();
			    	    	}
			    	    }
				    	else if(!data.success) {
				    		Dbl.Utils.showErrorMsg(data.msg, '');
				    	}
			     }, function(data) {
			    	 var errorMsg = data.msg ? data.msg : data;
			    	 Dbl.Utils.showErrorMsg(errorMsg, '');
			     });
	},
	
	getAlterSQL: function(table) {
		var grid = this;
		var dataStore =  grid.getStore();
		var tableDefinition = dataStore.data.items;
		var tableFields = new Array();

		for(var i=0; i<tableDefinition.length; i++) {
			var row = tableDefinition[i];
			if(row.data.field_name) {
				tableFields.push(row.data);
				if(row.new_field) {
					if(this.addedFields.indexOf(row.data.field_name) == -1) {
						this.addedFields.push(row.data.field_name);
					}
				}
			}
		}
		var actualModifiedFields = this.getActualModifiedFields(this.modifiedFields, this.changedFieldsNew, this.deletedFields, this.addedFields);
		var actualChangedFields  = this.getActualChangedFields(this.changedFieldsNew, this.deletedFields, this.addedFields);
		var actualDeletedFields  = this.getActualDeletedFields(this.changedFieldsNew, this.deletedFields, this.table_columns);
		
		// if no alterations
		if(!this.addedFields.length
			&& !actualModifiedFields.length
				&& !actualChangedFields.length
					&& !actualDeletedFields.length) {
	
			return "ALTER TABLE `" + Explorer.selectedDatabase + "`.`" + Explorer.selectedTable + "`;";
		} else {
			return this.createAlterSQL(table, tableFields, this.addedFields, actualChangedFields, actualModifiedFields, actualDeletedFields);
		}
	},
	 
	reset: function() {
		this.gridColumns =       new Array();
		this.changedFieldsOld =  new Array();
		this.changedFieldsNew =  new Array();
		this.modifiedFields =    new Array();
		this.deletedFields =     new Array();
		this.addedFields =       new Array();
	},
	
	getActualModifiedFields: function(modifiedFields, changedFieldsNew, deletedFields, addedFields) {

		// remove change fields from modified ones
		if(changedFieldsNew.length) {
			for(var i=0; i<changedFieldsNew.length ; i++) {
				var field = changedFieldsNew[i];
				var old_col_index = modifiedFields.indexOf(field.old_col);
				if(old_col_index != -1) {
					modifiedFields.splice(old_col_index, 1);
				}
				var new_col_index = modifiedFields.indexOf(field.new_col);
				if(new_col_index != -1) {
					modifiedFields.splice(new_col_index, 1);
				}
			}
		}

		// remove deleted fields from modified ones
		if(deletedFields.length) {
			for(var i=0; i<deletedFields.length ; i++) { 
				var field = deletedFields[i];
				var index = modifiedFields.indexOf(field);
				if(index != -1) {
					modifiedFields.splice(index, 1);
				}
			}
		}

		// remove added fields from modified ones
		if(this.addedFields.length) {
			for(var i=0; i<addedFields.length ; i++) { 
				var field = addedFields[i];
				var index = modifiedFields.indexOf(field);
				if(index != -1) {
					modifiedFields.splice(index, 1);
				}
			}
		}

		return modifiedFields;
	},
	
	getActualChangedFields: function(changedFieldsNew, deletedFields, addedFields) {
		
		// remove deleted / added fields from changed ones
		if(changedFieldsNew.length) {
			for(var i=0; i<changedFieldsNew.length; i++) {
				var field = changedFieldsNew[i];
				if((deletedFields.indexOf(field.old_col) != -1) || (addedFields.indexOf(field.old_col) != -1)){
					changedFieldsNew.splice(i, 1);
				}
				if((deletedFields.indexOf(field.new_col) != -1) || (addedFields.indexOf(field.new_col) != -1)){
					changedFieldsNew.splice(i, 1);
				}
			}
		}
		return changedFieldsNew;
	},
	
	getActualDeletedFields: function(changedFieldsNew, deletedFields, tableColumns) {
		
		if(changedFieldsNew.length) {
			for(var i=0; i<changedFieldsNew.length; i++) {
				var field = changedFieldsNew[i];
				var index = deletedFields.indexOf(field.new_col);
				if(index != -1) {
					deletedFields[index] = field.old_col;
				}
			}
		}

		if(deletedFields.length) {
			for(var i=0; i<deletedFields.length; i++) {
				var table_column = deletedFields[i];
				if(tableColumns.indexOf(table_column) == -1) {
					deletedFields.splice(i, 1);
				}
			}
		}
		return deletedFields;
	},
	
	createAlterSQL: function(table, fields, addedFields, changedFields, modifiedFields, droppedFields) {
		
		var table_fields = new Array();
		var primary_keys = new Array();
		var primary_key_columns = new Array();
		var drop_primary_key = "";
		var add_primary_key = "";
		var dropped_col_defs = "";
		var added_col_defs = new Array();
		var modified_col_defs = new Array();
		var changed_col_defs = new Array();
		
		for(var i=0; i<fields.length; i++) {
			var field = fields[i];
			table_fields[field.field_name] = field;
			if(field.primary_key) {
				primary_keys.push("`" + field.field_name + "`");
				primary_key_columns.push(field.field_name);
			}
		}
		
		var drop_pkey = false;

		if(this.primary_key_columns.length != primary_keys.length) {
			drop_pkey = true;
		} else {
			var key_diff = Dbl.Utils.getPrimaryKeyDiff(this.primary_key_columns, primary_key_columns);
			if(key_diff.length) {
				drop_pkey = true;
			}
		}

		// get drop / add key definitions
		if(drop_pkey && this.primary_key_columns.length) {
			drop_primary_key = " DROP PRIMARY KEY";
		}
		
		if(drop_pkey && primary_keys.length) {
			add_primary_key  = " ADD PRIMARY KEY (" + primary_keys.join(", ") + ")";
		}

		// get drop column definitions
		if(droppedFields.length){
			dropped_col_defs = this.getDroppedColumnDefinitions(droppedFields);
		}

		
		// get add / change / modify column definitions
		for (var key in table_fields) {
			// check if added field
			if(addedFields.length && (addedFields.indexOf(key) != -1)) {
				added_col_defs.push(this.getColumnDefinition('ADD', key, table_fields));
			}
			
			// check if modified field
			else if(modifiedFields.length && (modifiedFields.indexOf(key) != -1)) {
				modified_col_defs.push(this.getColumnDefinition('MODIFY', key, table_fields));
			}
			
			// check if changed field
			else {
				for(var i=0; i<changedFields.length; i++) {
					var column = changedFields[i];
					if(key == column.new_col) {
						changed_col_defs.push(this.getColumnDefinition('CHANGE', key, table_fields, column.old_col));
					}
				}
			}
		}

		// create alter table sql
		var alter_table_ddl = " ALTER TABLE `" + Explorer.selectedDatabase + "`.`" + Explorer.selectedTable + "` \n";
		if(dropped_col_defs.length) {
			alter_table_ddl   += dropped_col_defs.join(",\n");
		}
		if(added_col_defs.length) {
			var comma_str      = (dropped_col_defs.length) ? ",\n" : "";
			alter_table_ddl   += comma_str + added_col_defs.join(",\n");
		}
		if(changed_col_defs.length) {
			var comma_str      = (dropped_col_defs.length || added_col_defs.length) ? ",\n" : "";
			alter_table_ddl   += comma_str + changed_col_defs.join(",\n");
		}
		if(modified_col_defs.length) {
			var comma_str      = (dropped_col_defs.length || added_col_defs.length || changed_col_defs.length) ? ",\n" : "";
			alter_table_ddl   += comma_str + modified_col_defs.join(",\n");
		}
		if(drop_pkey && this.primary_key_columns.length) {
			var comma_str      = (dropped_col_defs.length || added_col_defs.length || changed_col_defs.length || modified_col_defs.length) ? ",\n" : "";
			alter_table_ddl   += comma_str + drop_primary_key;
		}
		if(drop_pkey && primary_keys.length) {
			var comma_str      = (dropped_col_defs.length || added_col_defs.length || changed_col_defs.length || modified_col_defs.length || drop_pkey) ? ",\n" : "";
			alter_table_ddl   += comma_str + add_primary_key;
		}

		return alter_table_ddl;

	},
	
	getDroppedColumnDefinitions: function(fields) {
		var definitions = new Array();
		for(var i=0; i<fields.length; i++) {
			definitions.push(" DROP COLUMN `" + fields[i] + "`");
		}
		return definitions;
	},
	
	getColumnDefinition: function(type, field_name, fields, old_field_name) {
		var field = fields[field_name];
		var definition = " ";
		if(field.datatype)   { definition += field.datatype; }
		if(field.length)     { definition += "(" + field.length + ")"; }
		if(field.unsigned)   { definition += " UNSIGNED"; }
		if(field.zerofill)   { definition += " ZEROFILL"; }
		if(field.collation && (field.collation != "[default]")) { definition += " COLLATE " + field.collation; }
		if(field.primary_key || field.not_null) { definition += " NOT NULL"; }
		if(field.default_value) {
			 var default_value = field.default_value;
			 field.default_value = default_value.replace(/[\']{1}/gi, "");
			 var pattern = /\s/g;
			 if(pattern.test(field.default_value) || field.datatype.toLowerCase() == "enum") {
					field.default_value = "'" + field.default_value + "'";
			 }
			definition += " DEFAULT " +  field.default_value ;
		}
		if(field.auto_incr) { definition += " AUTO_INCREMENT"; }
		if(field.comment)   { definition += " COMMENT '" + field.comment + "'"; }


		// get field position
		var field_position = " ";
		if((type == 'ADD') || (type == 'CHANGE')) {
			var field_names = new Array();
			for (var key in fields) {
				field_names.push(key);
			}
			var index = field_names.indexOf(field_name);

			if(index != -1) {
				if(index > 0) {
					var prev_field_name = field_names[index-1];
					field_position += " AFTER `" + prev_field_name + "`";
				}
				else {
					field_position += " FIRST";
				}
			}
		}

		// get full definition
		if(type == 'ADD') {
			definition = " ADD COLUMN `" + field_name + "` " + definition + field_position;
		}
		else if(type == 'MODIFY') {
			definition = " MODIFY COLUMN `" + field_name + "` " + definition;
		}
		else if(type == 'CHANGE') {
			definition = " CHANGE COLUMN `" + old_field_name + "` `" + field_name + "` " +  definition + field_position;
		}

		return definition;
	},
	
	selectTableColumn: function(column) {
		if(!Explorer.selectedColumn) return;
		var store = this.store;
    	var sm  = this.getSelectionModel();
    	sm.clearSelections();
		var record = null;
    	store.each(function(row){
			if((row.data.field_name == Explorer.selectedColumn)
					|| (row.data.field_name == column)) {
				record = row;
			}
		});
		if(record) {
        	sm.selectRecords([record])
		}
	},
	
	handleRowDeselect: function(sm, rowIndex, record) {
		if(record.data.field_name == Explorer.selectedColumn) {
			Explorer.selectedColumn = '';
			Explorer.selectedColumnNodeId = '';
		}
	},
	
	dropTableColumn: function(column) {
		Ext.getCmp('alter_table_panel').closeAlterSQLPreview();
    	Ext.getCmp('alter_table_grid').selectTableColumn(column);
    	Ext.getCmp('alter_table_grid').dropColumnConfirm(column);
	}
});

