/**
 * @constructor
 */
Dbl.ManageIndexGridPanel = function(data) {
	data = this.createColumns(data);
	
	var store = new Ext.data.SimpleStore({
		fields: data.fields
	});
	
	store.on("load" , function(s, rs, o) {
		Dbl.Utils.removeLoadingIcon();
		for(var i=0; i<rs.length; i++) {
			var r = rs[i];
			r.originalcopy = r.copy();
		}
	});

	store.loadData(data.data);
	
	var selectionModel = new Ext.grid.CheckboxSelectionModel({
		header: '',
		checkOnly: true,
		init: function(grid){
			this.grid = grid;
			this.initEvents();
		}
	});

	var gridColumns = new Array(selectionModel);
	var gridColumns = gridColumns.concat(data.models);

	var columnModel = new Ext.grid.ColumnModel({
		defaults: {},
		columns: gridColumns
	});
	
	Dbl.ManageIndexGridPanel.superclass.constructor.call(this, {
		id: 'manage_index_grid',
		store: store,
		height: 432,
		cm: columnModel,
		sm: selectionModel,
		columnLines: true,
		clicksToEdit: 1,
		viewConfig: {},
		border: false,
		listeners: {
			viewready: this.autoSizeColumns,
			cellclick: this.handleCellClick,
			beforeedit: this.handleBeforeEdit,
			afteredit: this.handleAfterEdit,
			scope: this
		}
	});
};

Ext.extend(Dbl.ManageIndexGridPanel, Ext.grid.EditorGridPanel, {

	droppedIndexes: new Array(),
	
	reset: function() {
		this.droppedIndexes = new Array();
	},
	
	autoSizeColumns: function() {
		for (var i = 0; i < this.colModel.getColumnCount(); i++) {
			this.autoSizeColumn(i);
		}
		this.view.refresh(true);
	},
	
	autoSizeColumn: function(c) {
		var w = this.view.getHeaderCell(c).firstChild.scrollWidth;
		for (var i = 0; i < this.store.getCount(); i++) {
			var cw  = this.view.getCell(i, c).firstChild.scrollWidth;
			w = Math.max(w, cw);
		}
		if(!w) return;
		this.colModel.setColumnWidth(c, w+2);
		return w;
	},
	
	createColumns: function(data) {
		for(var i=0; i<data.fields.length; i++) {
			var key = data.fields[i];
			switch(key){
				case 'index':
					data.fields[i] = {name: key, type: 'string'};
					data.models[i].width= (data.models[i].width < 135) ? 135 : data.models[i].width;
					data.models[i].header = 'Indexes';
					data.models[i].editor = new Ext.form.TextField({ name: key });
					break;
	
				case 'columns':
					data.fields[i] = {name: key, type: 'string'};
					data.models[i].width= (data.models[i].width < 158) ? 158 : data.models[i].width;
					data.models[i].header = 'Columns';
					data.models[i].editor = new Ext.form.TextField({ name: key });
					break;
	
				case 'option':
					data.fields[i] = {name: key, type: 'string'};
					data.models[i].header = 'Option';
					data.models[i].width = 100;
					data.models[i].editor = Dbl.Utils.getComboBoxEditor(key, data.index_options);
					break;
					
				case 'add_column':
					data.fields[i] = {name: key, id: 'add_column_header'};
					data.models[i] = {
							header: 'Edit',
							id: key,
							dataIndex: key,
							width: 30,
							renderer:  this.renderIcon
					};
					data.models[i].editor = '';
				
				default:
					break;
			}
		}
		return data;
	},
	
	renderIcon: function(val, cell) {
		cell.attr = 'ext:qtip=" Edit Column(s)"';
		return '<a href="javascript:void(0);"><div class="index_add_cols">add</div></a>';
	},

	handleCellClick: function(grid, rowIndex, columnIndex, e) {
		if(columnIndex == 3) {
			grid.showAddColumnsWindow(rowIndex, e.xy);
		} else {
			grid.startEditing(rowIndex, columnIndex);
		}
	},
	
	handleBeforeEdit: function(e) {
		if(e.record.originalcopy 
				&& e.field == 'index' 
					&& e.value.toLowerCase() == 'primary') {
						return false;
		}
	},

	handleAfterEdit: function(e) {
		this.autoSizeColumns();
		
    	if(e.value == e.originalValue) {
    		return;
    	} else {
    		var toolbar = Ext.getCmp('manage_index_panel').getTopToolbar();
    		toolbar.get(0).enable();
    	}	
	},
	
	addIndex: function(){
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
        tableRow.newfield = true;
        var insertAt = (selectedFields.length > 0) ? rowIndex : rowCount;
        this.stopEditing();
        store.insert(insertAt, tableRow);
        this.startEditing(insertAt, 1);
    },
	
    removeIndexConfirm: function() {
    	var grid = this;
	    var selectedFields = grid.getSelectionModel().getSelections();
	    if(selectedFields.length > 0){
		     Ext.Msg.show({
		    	 title:    'Confirmation',
				 msg:      Messages.getMsg('delete_index_confirm'),
				 buttons:  Ext.Msg.YESNO,
				 fn:       this.removeIndex,
				 animEl:   document.body,
				 icon:     Ext.MessageBox.QUESTION,
				 scope:    grid
		 	 });
	    } else {
	    	Dbl.Utils.showErrorMsg(Messages.getMsg('delete_index_required'));
	    }
    },
    
    removeIndex: function(btn){
    	if(btn == 'yes'){
    		var selectedRows = this.getSelectionModel().getSelections();
    		for(var i=0; i<selectedRows.length; i++){
    			var row = selectedRows[i];
    			if(row.originalcopy && !row.newfield) {
       			   var index = row.originalcopy.data.index;
        		   this.droppedIndexes.push(index);
    			}
    			this.store.remove(row);
    			
        		var toolbar = Ext.getCmp('manage_index_panel').getTopToolbar();
        		toolbar.get(0).enable();
            }
		} else {
			this.getSelectionModel().clearSelections();
		}
	},
	
	getIndexSQL: function() {
		var old_primary_keys = this.primary_keys;
		var new_primary_keys = new Array();
		var add_index_defs = new Array();
		var drop_index_defs = new Array();
		var primary_key_def = '';
		var alter_definition = 'Alter table `'+ Dbl.UserActivity.getValue('database') +'`.`'+ Dbl.UserActivity.getValue('table') +'`';
		
		this.store.each(function(row){
			var data = row.data;
			
			// new index
			if(row.newfield && data.index && (data.index != 'undefined')) {
				// if primary
				var index = Ext.util.Format.trim(data.index);
				if(index && index.toLowerCase() == 'primary') {
					new_primary_keys = new_primary_keys.concat(old_primary_keys);
					if(data.columns) {
						new_primary_keys = new_primary_keys.concat(data.columns.split(','));
					} 
					else {
						new_primary_keys.push(' ');
					}
				} 
				else {
					var add_def = Ext.getCmp('manage_index_grid').getAddIndexDefinition(data);
					add_index_defs.push(add_def);
				}
			} 
			// modified index
			else if (row.originalcopy) {
				// primary index modified
				if(data.index.toLowerCase() == 'primary') {
					if(((Ext.util.Format.trim(data.columns)) != row.originalcopy.data.columns) 
							|| ((Ext.util.Format.trim(data.option)) != row.originalcopy.data.option)) {
									new_primary_keys = new_primary_keys.concat(data.columns.split(','));
					}
				} 
				else {
					if(((Ext.util.Format.trim(data.index)) != row.originalcopy.data.index)
							||((Ext.util.Format.trim(data.columns)) != row.originalcopy.data.columns) 
								|| ((Ext.util.Format.trim(data.option)) != row.originalcopy.data.option)) {
										var drop_def = Ext.getCmp('manage_index_grid').getDropIndexDefinition(row.originalcopy.data.index, false);
										drop_index_defs.push(drop_def);
										var add_def = Ext.getCmp('manage_index_grid').getAddIndexDefinition(data);
										add_index_defs.push(add_def);
					}
				}
			}
		});	

		if(new_primary_keys.length) {
			var drop_def = Ext.getCmp('manage_index_grid').getDropIndexDefinition('', true);
			drop_index_defs.push(drop_def);
		    primary_key_def = Ext.getCmp('manage_index_grid').getPrimaryKeyDefinition(new_primary_keys);
		}
		
		if(new_primary_keys.length
				|| add_index_defs.length
					|| drop_index_defs.length
						|| this.droppedIndexes.length) {
								if(this.droppedIndexes.length) {
									for(var i=0; i<this.droppedIndexes.length; i++) {
										var flag = false;
										var index = this.droppedIndexes[i].toLowerCase();
										if(index == 'primary') {
											flag = true
										}
										var drop_def = Ext.getCmp('manage_index_grid').getDropIndexDefinition(this.droppedIndexes[i], flag);
										drop_index_defs.push(drop_def);
									}
								}

								alter_definition += '\n';
								
								if(drop_index_defs.length) {
									alter_definition += drop_index_defs.join(",\n");
								}
								if(primary_key_def) {
									var comma_str = (drop_index_defs.length) ? ",\n" : "";
									alter_definition += comma_str + primary_key_def;
								}
								if(add_index_defs.length) {
									var comma_str      = (drop_index_defs.length || primary_key_def) ? ",\n" : "";
									alter_definition += comma_str + add_index_defs.join(",\n");
								}
								
								return alter_definition + ';';
			
		}
		else {
			return alter_definition + ';';
		}
	},
	
	getAddIndexDefinition: function(data) {
		var columns = new Array();
		var add_def = '';
		if(data.columns) {
			columns = columns.concat(data.columns.split(','));
		} else {
			columns.push(' ');
		}
		if(columns.length) {
			for(var i=0; i<columns.length; i++) {
				columns[i] = '`' + Ext.util.Format.trim(columns[i]) + '`';
			}
		}
		
		if(data.option && data.option.toLowerCase() == 'unique') {
			add_def += 'add UNIQUE `'+ data.index +'` ('+ columns.join(', ') +')';
		} else if(data.option && data.option.toLowerCase() == 'fulltext') {
			add_def += 'add FULLTEXT `'+ data.index +'` ('+ columns.join(', ') +')';
		} else {
			add_def += 'add INDEX `'+ data.index +'` ('+ columns.join(', ') +')';
		}
		return add_def;
	},
	
	getDropIndexDefinition: function(index, primary) {
		if(primary) {
			return  'drop PRIMARY key';
		} 
		else {
			return  'drop key `'+ index +'`';
		}
	},
	
	getPrimaryKeyDefinition: function(primary_keys) {
		var keys = new Array();
		for(var i=0; i<primary_keys.length; i++) {
			var key = '`' + primary_keys[i] + '`';
			if(keys.indexOf(key) == -1) {
				keys.push(key);
			}
		}
		return 'add PRIMARY key ('+ keys.join(', ') +')';
	},
	
	validateDefinitionAndAlter: function() {
		Dbl.Utils.showWaitMask();
		var retVal = this.validateDefinition();
		if(retVal) {
			this.alterTable();
		} else {
			Dbl.Utils.hideWaitMask();
		}
	},
	
	validateDefinition: function() {
		var dataStore =  this.getStore();
		var tableIndexes = dataStore.data.items;
		var noIndexErrMsg = Messages.getMsg('noindex_definitions');

//		if(!tableIndexes.length) {
//			Dbl.Utils.showErrorMsg(noIndexErrMsg, '');
//			return false;
//		} else {
			var isIndexDefined = false;
			for(var i=0; i<tableIndexes.length; i++) {

				var indexData = tableIndexes[i].data;
				var index = Ext.util.Format.trim(indexData.index);
				var columns = Ext.util.Format.trim(indexData.columns);

				if(!index || index == 'undefined') {
					continue;
				}
				
				if(index && columns && (columns != 'undefined')) {
					isIndexDefined = true;
				} else if(index && (!columns || columns == 'undefined')) {
					var noColsErrMsg = Messages.getMsg('nocolumns_index', [index]);
					Dbl.Utils.showErrorMsg(noColsErrMsg, '');
					return false;
				} else if(!index && columns) {
					var noIndexErrMsg = Messages.getMsg('noindex_columns', [columns]);
					Dbl.Utils.showErrorMsg(noIndexErrMsg, '');
					return false;
				}else if(!index && !columns && (i == tableIndexes.length-1) && !isIndexDefined) {
					Dbl.Utils.showErrorMsg(noIndexErrMsg, '');
					return false;
				}
			}
//		}
		return true;
	},
	
	alterTable: function() {
		var sql = this.getIndexSQL();
		Server.sendCommand('alter_table_indexes', {
		     parent_database:  Dbl.UserActivity.getValue('database'),
		     target_table:  Dbl.UserActivity.getValue('table'),
		     alter_sql: sql }, 
		     function(data) {
		    	    if(data.success) {
		    	    	Ext.getCmp('manage_index_grid').reset();
		    	    	Dbl.Utils.hideWaitMask();
		    	    	if(data.msg) {
		    	    	   	Ext.Msg.show({
		    	     	   	   title:'Success',
		    	     	   	   msg: data.msg,
		    	     	   	   buttons: Ext.Msg.OK,
		    	     	   	   fn: Ext.getCmp('manage_index_panel').refreshStore,
		    	     	   	   animEl: document.body,
		    	     	   	   icon: Ext.MessageBox.INFO
		    	     	    });
		    	    	} else {
		    	    		Ext.getCmp('manage_index_panel').refreshStore();
		    	    	}
		    	    }
			    	else if(!data.success) {
		    	    	Dbl.Utils.hideWaitMask();
			    		Dbl.Utils.showErrorMsg(data.msg, '');
			    	}
		     }, function(data) {
    	    	 Dbl.Utils.hideWaitMask();
		    	 var errorMsg = data.msg ? data.msg : data;
		    	 Dbl.Utils.showErrorMsg(errorMsg, '');
		     });
	},
	
	showAddColumnsWindow: function(rowIndex, position) {
		var isForm = new Dbl.EditIndexFormPanel(rowIndex);

		this.win = new Dbl.ContextMenuWindow({
			title: 'Edit Column(s)',
			id: 'edit_index_window',
			width : 508,
			height: 240,
			onEsc: function(){},
			x: position[0] - 485,
		    y: position[1] + 12,
			layout: 'fit',
			plain: true,
			closable: true,
			buttonAlign:'right',
			items: [isForm],
			header: false,
			resizable: true,
			buttons: [{
						text: 'Add',
						handler: isForm.getSelectedColumns.createDelegate(isForm, [rowIndex])
					}, {
						text: 'Cancel',
						handler: isForm.cancelEdit,
						scope: isForm
			}]
		});
		this.win.show();
	},
	
	changeCellData: function(columns, rowIndex) {
		var grid = Ext.getCmp('manage_index_grid');
		var record = grid.getStore().getAt(rowIndex); 
		var fieldName = grid.getColumnModel().getDataIndex(2); 
		record.set(fieldName, columns);

		Ext.getCmp('edit_index_window').close();
		var toolbar = Ext.getCmp('manage_index_panel').getTopToolbar();
		toolbar.get(0).enable();
		
		this.autoSizeColumns();
	}

});

