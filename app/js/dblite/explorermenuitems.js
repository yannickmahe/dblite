var ExplorerMenuItems = {

	/* Connection menu items */

	refreshConnection: function(nodeId, nodeText) {
		return {
			itemId: 'refresh_database_' + nodeId,
			text: 'Refresh Database Explorer...',
			iconCls: 'refresh_connection',
			listeners: {
				click: function(baseItem, el) {
					Explorer.explorerPanel.removeAll();
					Explorer.restore();
				}
			}
		};
	},

	createDb: function(nodeId, nodeText) {
		return {
			itemId: 'create_database_' + nodeId,
			text: 'Create Database...',
			iconCls: 'create_database',
			listeners: {
				click: function(baseItem, el) {
					ExplorerMenuItems.showCreateDBWindow();
/*
					Database.sendCommand('get_charset_collation', {}, function(data) {
						this.win = new Dbl.ContextMenuWindow({
							title : 'Create Database',
							id : 'create_db_window',
							width : 350,
							height : 200,
							items: [new Dbl.CreateDbPanel(data.charsets, data.collations)]
						});
						this.win.show();
					});
*/
				}
			}
		};
	},

	restoreDb: function(nodeId, nodeText) {
		return {
			itemId: 'restore_database_' + nodeId,
			text: 'Restore From SQL Dump...',
			iconCls: 'restore_server',
			listeners: {
				click: function(baseItem, el) {
			            var db = Dbl.UserActivity.getValue('database');
						var current_db = db ? db : 'none';
						this.win = new Dbl.ContextMenuWindow({
							title : 'Execute Query(s) from a File',
							id : 'restore_db_window',
							width : 300,
							height : 150,
							items: [new RestoreDbPanel(current_db)]
						});
						this.win.show(el);
					}
			}
		};
	},


	/* Database menu items */

	refreshDb: function(nodeId, nodeText) {
		return {
			itemId: 'refresh_database_' + nodeId,
			text: 'Refresh Database Explorer...',
			iconCls: 'refresh_database',
			listeners: {
				click: function(baseItem, el) {
   					Explorer.explorerPanel.removeAll();
   					Explorer.loadExplorerData(nodeText);
 				}
 			}
		};
	},

	createTable: function(nodeId, nodeText, node, e) {
		return {
			itemId: 'create_table_' + nodeId,
			text: 'Create Table...',
			iconCls: 'create_table',
			listeners: {
				click: function(baseItem, el) {
						Server.sendCommand('get_table_creation_info', {
							parent_database:  Dbl.UserActivity.getValue('database') },
							function(data) {
								  if(data.success) {
									  data.create_table = true;
									  data.alter_table = false;
									  Dblite.dataPanel.addCreateTableTab(data);
								  }
						    	  else if(!data.success) {
						    		   DbliteUtils.showErrorMsg(data.msg, '');
							      }
					       }, function(data) {
								var errorMsg = data.msg ? data.msg : data;
								DbliteUtils.showErrorMsg(errorMsg, '');
					       });
					}
				}
		};
	},

	createView: function(nodeId, nodeText) {
		return {
			itemId: 'create_view_' + nodeId,
			text: 'Create View...',
			iconCls: 'create_view',
			listeners: {
				click: function(baseItem, el) {
					this.win = new Dbl.ContextMenuWindow({
						title : 'Create View',
						id : 'create_view_window',
						width : 300,
						height : 120,
						resizable : false,
						layout : 'border',
						modal : true,
						plain : true,
						stateful : true,
						onEsc: function(){},
						items : [ {
							id : 'create_view',
							region : 'center',
							xtype : 'panel',
							layout : 'fit',
							items : [ new Dbl.CreateViewPanel('CREATE') ]
						} ]
					});
					this.win.show();
	         	}
			}
		};
	},

	createProcedure: function(nodeId, nodeText) {
		return {
			itemId: 'create_procedure_' + nodeId,
			text: 'Create Stored Procedure...',
			iconCls: 'create_procedure',
			listeners: {
				click: function(baseItem, el) {
					this.win = new Dbl.ContextMenuWindow({
						title : 'Create Procedure',
						id : 'create_procedure_window',
						width : 350,
						height : 120,
						resizable : false,
						layout : 'border',
						modal : true,
						plain : true,
						stateful : true,
						onEsc: function(){},
						items : [ {
							id : 'create_procedure',
							region : 'center',
							xtype : 'panel',
							layout : 'fit',
							items : [ new Dbl.CreateProcedurePanel() ]
						} ]
					});
					this.win.show();
				}
			}
		};
	},

	createFunction: function(nodeId, nodeText) {
		return {
			itemId: 'create_function_' + nodeId,
			text: 'Create Function...',
			iconCls: 'create_function',
			listeners: {
				click: function(baseItem, el) {
					this.win = new Dbl.ContextMenuWindow({
						title : 'Create Function',
						id : 'create_function_window',
						width : 320,
						height : 120,
						resizable : false,
						layout : 'border',
						modal : true,
						plain : true,
						stateful : true,
						onEsc: function(){},
						items : [ {
							id : 'create_function',
							region : 'center',
							xtype : 'panel',
							layout : 'fit',
							items : [ new Dbl.CreateFunctionPanel()]
						} ]
					});
					this.win.show();
				}
			}
		};
	},

//	copyDb: function(nodeId, nodeText) {
//	return {
//		itemId: 'copy_database_' + nodeId,
//		text: 'Copy Database To Different Host / Database...',
//		iconCls: 'copy_database',
//		listeners: {
//			click: function(baseItem, el) {
//					Dbl.Utils.showTBDMsg();
//				}
//			}
//		};
//},

	backupDb: function(nodeId, nodeText) {
		return {
			itemId: 'backup_database_' + nodeId,
			text: 'Backup Database As SQL Dump...',
			iconCls: 'backup_database',
			listeners: {
				click: function(baseItem, el) {
				        Database.sendCommand('get_db_tables',
				        	{dbname: nodeText},
				        	function(data){
					        	data.curr_db = nodeText;
								this.win = new Dbl.ContextMenuWindow({
									title : 'View dump (schema) of database',
									id : 'backup_db_window',
									width : 650,
									height : 530,
									items: [new Dbl.BackupDbPanel(data)]
								});
								this.win.show(el);
					        });
					}
				}
			};
	},

	truncateDb: function(nodeId, nodeText) {
		return {
			itemId: 'truncate_database_' + nodeId,
			text: 'Truncate Database...',
			iconCls: 'truncate_database',
			listeners: {
				click: function(baseItem, el) {
				        Ext.Msg.confirm('Confirmation',
				        		Messages.getMsg('truncate_database', [nodeText]),
				        		function(btn){
					 	         if(btn == 'yes'){
					 	        	Dbl.Utils.showWaitMask();
						 	   		Server.sendCommand('truncate_database', { database: nodeText },
							 	   		function(data){
							 	   		   Dbl.Utils.hideWaitMask();
							 	   	       if(!data.success) {
							 	   	    	   Dbl.Utils.showErrorMsg(data.msg, '');
							 	   		   }
							 	   		}, function(data){
							 	   			Dbl.Utils.hideWaitMask();
							 	   	    	var errorMsg = data.msg ? data.msg : data;
							 	   	    	Dbl.Utils.showErrorMsg(errorMsg, '');
							 	   		});
						         }
					    });
					}
				}
			};
	},

	emptyDb: function(nodeId, nodeText) {
		return{
			itemId: 'empty_database_' + nodeId,
			text: 'Empty Database...',
			iconCls: 'empty_database',
			listeners: {
				click: function(baseItem, el) {
			        Ext.Msg.confirm('Confirmation',
			        		Messages.getMsg('empty_database', [nodeText]),
				        	function(btn){
				 	         if(btn == 'yes'){
				 	    		Dbl.Utils.showWaitMask();
					 	   		Server.sendCommand('empty_database', { database: nodeText },
					 	   			function(data){
					 	   	    	   if(data.success) {
					 	   	    		   Dbl.Utils.hideWaitMask();
					 	   	    		   Explorer.explorerPanel.removeAll();
					 	   				   Explorer.loadExplorerData();
					 	   	    	   }
					 	   	    	   else if(!data.success) {
					 	   	    		   Dbl.Utils.showErrorMsg(data.msg, '');
					 	   		      }
					 	   		}, function(data){
					 	   			Dbl.Utils.hideWaitMask();
					 	   	    	var errorMsg = data.msg ? data.msg : data;
					 	   	    	Dbl.Utils.showErrorMsg(errorMsg, '');
					 	   		});
					         }
				    });
				}
			}
		};
	},

	dropDb: function(nodeId, nodeText) {
		return {
			itemId: 'delete_database_' + nodeId,
			text: 'Drop Database...',
			iconCls: 'delete_database',
			listeners: {
				click: function(baseItem, el) {
			        Ext.Msg.confirm('Confirmation',
			        		Messages.getMsg('drop_database', [nodeText]),
			            	function(btn){
				     	         if(btn == 'yes'){
				     	        	 Dbl.Utils.showWaitMask();
				     	        	 Database.sendCommand('drop_database', {dbname: nodeText}, function(data) {
				     	        		 Dbl.Utils.hideWaitMask();
					 	   	    	     Explorer.explorerTreePanelObj.getNodeById('d=' + nodeText).remove();
				     	        		 Dbl.UserActivity.explorerPanel.newConnectionSelected(Dbl.UserActivity.getValue('connection'));
				     	        		 Ext.getCmp('dbstructure').setTitle('DB Structure');

					    		         for(var i=0; i<Database.databases.length; i++) {
					    		        	 if(Database.databases[i][0] == nodeText) {
					    		        		 Database.databases.splice(i, 1);
					    					}
					    				 }

					    		         Database.tables = [];
					     	        	 Database.columns = [];
				     	        	 });
				     	         }
			        		}
			        );
				}
			}
		};
	},


	/* Table menu items */

//	copyTable: function(nodeId) {
//	return {
//		itemId: 'copy_table_' + nodeId,
//		text: 'Copy Table To Different  Host / Database...',
//		iconCls: 'copy_table',
//		listeners: {
//			click: function(baseItem, el) {
//				Dbl.Utils.showTBDMsg();
//				}
//			}
//     };
//},

	alterTable: function(nodeId, nodeText) {
		return {
			itemId: 'alter_table_' + nodeId,
			text: 'Alter Table / Manage Columns...',
			iconCls: 'alter_table',
			listeners: {
				click: function(baseItem, el) {
					Dbl.UserActivity.setKey('datapanelActiveTab', 'tablestructure');
					Dbl.UserActivity.setKey('activeTableTab', 'column_info');
					Dblite.dataPanel.refresh(true);
	             }
			}
         };
	},

	manageIndexes: function(nodeId, nodeText) {
		return {
			itemId: 'manage_index_new_' + nodeId,
			text: 'Manage Indexes...',
			iconCls: 'manage_index',
			listeners: {
				click: function(baseItem, el) {
					Dbl.UserActivity.setKey('datapanelActiveTab', 'tablestructure');
					Dbl.UserActivity.setKey('activeTableTab', 'index_info');
					Dblite.dataPanel.refresh(true);
				}
			}
      };
	},

//	manageForeignKeys: function(nodeId) {
//	return {
//		itemId: 'relationship_foreignkey_' + nodeId,
//		text: 'Relationships / Foreign Keys...',
//		iconCls: 'relationship_foreignkey',
//		listeners: {
//			click: function(baseItem, el) {
//	 			Dbl.Utils.showTBDMsg();
//				}
//			}
//	};
//},

	exportTable: function(nodeId, nodeText) {
		return {
    	 	itemId: 'export_as_' + nodeId,
    	 	text: 'Export As...',
    	 	iconCls: 'copy_table',
    	 	menu: {
    	 		items: [
	    	 		        this.exportTableAs(nodeId, nodeText),
	    	 		        this.exportTableData(nodeId, nodeText)
    	 		       ]
     		}
		};
	},

	exportTableAs: function(nodeId, nodeText) {
		return {
 			itemId: 'export_as_dump_' + nodeId,
 			text: 'Export Table As SQL Dump...',
 			iconCls: 'backup_database',
    	 	listeners: {
    	 		click: function(baseItem, el) {
					data = { result: [[nodeText]]};
		        	data.curr_db = Dbl.UserActivity.getValue('database');
		        	data.current_table = nodeText;
					this.win = new Dbl.ContextMenuWindow({
						title : 'View dump (schema) of database',
						id : 'backup_db_window',
						width : 650,
						height : 530,
						items: [new Dbl.BackupDbPanel(data)]
					});
					this.win.show(el);
     			}
 			}
 		};
	},

	exportTableData: function(nodeId, nodeText) {
		return {
 			itemId: 'export_table_' + nodeId,
 			text: 'Export Table Data...',
 			iconCls: 'copy_table',
    	 	listeners: {
    	 		click: function(baseItem, el) {
				        Database.sendCommand('get_table_columns', {
							tablename: nodeText,
				        	dbname: Dbl.UserActivity.getValue('database')
				        }, function(data){
				        	data.curr_table = nodeText;
				        	data.curr_db = Dbl.UserActivity.getValue('database');
							this.win = new Dbl.ContextMenuWindow({
								title : 'Export Table',
								id : 'export_table',
								width : 560,
								height : 240,
								onEsc: function(){},
								items: [new Dbl.ExportTableDbPanel(data)]
							});
							this.win.show(el);
				        },
				        function(data) {
						var errorMsg = data.msg ? data.msg : data;
						Dbl.Utils.showErrorMsg(errorMsg, '');
				        });
     			}
 			}
 		};
	},

	duplicateTable: function(nodeId, nodeText) {
		return {
			itemId: 'duplicate_structure_data_' + nodeId,
			text: 'Duplicate Table Structure / Data...',
			iconCls: 'duplicate_structure_data',
			listeners: {
				click: function(baseItem, el) {
					Server.sendCommand('get_duplicate_table_info', {
						database: Dbl.UserActivity.getValue('database'),
						table: nodeText },
						function(data) {
							var formPanel = new DuplicateTablePanel(data.database, data.table);
							var gridPanel = new SelectableListViewPanel({
													fields: data.fields,
													data: data.data,
													models: data.models,
													autoExpandColumn: 'Field',
													id: 'duplicate_table_grid',
										            height: 180,
										            width: 333,
										            autoScroll: true
											});
							this.win = new Dbl.ContextMenuWindow({
													title: 'Duplicate Table',
													id: 'duplicate_table_window',
													headerAsText: true,
													width: 350,
													height: 407,
													layout: '',
													resizable: false,
													modal: true,
													plain: true,
													stateful: true,
													shadow: false,
													onEsc: function(){},
													closeAction: 'destroy',
													items: [formPanel, gridPanel],
										            buttons: [{
												    			text: 'Copy',
												    			handler: function () { formPanel.validateAndDuplicateTable(data.database, data.table); }
												             }, {
										            			text: 'Cancel',
										            			handler: function() { formPanel.closeWindow(); }
										            		}]
										});
							this.win.show();
					    });
				}
			}
		};
	},

	renameTable: function(nodeId, nodeText) {
		return {
			itemId: 'rename_table_' + nodeId,
			text: 'Rename Table...',
			iconCls: 'rename_table',
			listeners: {
				click: function(baseItem, el) {
					this.win = new Dbl.ContextMenuWindow({
						title : 'Rename Table',
						id : 'rename_table_window',
						width : 300,
						height : 120,
						resizable : false,
						layout : 'border',
						modal : true,
						plain : true,
						stateful : true,
						items : [ {
							id : 'rename_table',
							region : 'center',
							xtype : 'panel',
							border: false,
							layout : 'fit',
							items : [ new RenameTablePanel(nodeId, nodeText) ]
						} ]
					});
					this.win.show();
				}
			}
		};
	},

	truncateTable: function(nodeId, nodeText) {
		return {
			itemId: 'truncate_table_' + nodeId,
			text: 'Truncate Table...',
			iconCls: 'truncate_table',
			listeners: {
				click: function(baseItem, el) {
			        Ext.Msg.confirm('Confirmation',
			        		Messages.getMsg('truncate_table', [nodeText]),
			        		function(btn){
				 	         if(btn == 'yes'){
				 	    		Dbl.Utils.showWaitMask();
					 	   		Database.sendCommand('truncate_table', {
					 	   			table: nodeText,
					 	   			database: Dbl.UserActivity.getValue('database')
					 	   		}, function(data) {
					 	   			Dbl.Utils.hideWaitMask();
					 	   	    	if(data.success) {
					 	   	    	   Dblite.dataPanel.refresh(true);
					 	   	    	}
					 	   	    	else if(!data.success) {
					 	   	    	   Dbl.Utils.showErrorMsg(data.msg, '');
					 	   		    }
					 	   		}, function(data){
					 	   			Dbl.Utils.hideWaitMask();
					 	   	    	var errorMsg = data.msg ? data.msg : data;
					 	   	    	Dbl.Utils.showErrorMsg(errorMsg, '');
					 	   		});
					         }
				    });
				}
			}
		};
	},

	dropTable: function(nodeId, nodeText) {
		return {
			itemId: 'drop_table_' + nodeId,
			text: 'Drop Table...',
			iconCls: 'drop_table',
			listeners: {
				click: function(baseItem, el) {
			        Ext.Msg.confirm('Confirmation',
			        		Messages.getMsg('drop_table', [nodeText]),
			        		function(btn){
				 	         if(btn == 'yes'){
				 	    		Dbl.Utils.showWaitMask();
				 	    		Database.sendCommand('drop_table', {
					 	   			table: nodeText,
					 	   			database: Dbl.UserActivity.getValue('database')
					 	   		}, function(data) {
					 	   	    	    if(data.success) {
					 	   	    	       Dbl.Utils.hideWaitMask();
				     	        		   Database.tables = [];
					     	        	   Database.columns = [];
					 	   	    	       Explorer.getDbTablesAndColumns();
					 	   	    	       Dbl.UserActivity.explorerPanel.newDatabaseSelected(Dbl.UserActivity.getValue('database'));
					 	   	    	       var tablenode = Explorer.explorerTreePanelObj.getNodeById(nodeId);
					 	   	    	       var parentNode = Explorer.explorerTreePanelObj.getNodeById(Dbl.UserActivity.getValue('database') + "_tables");
					 	   	    	       tablenode.remove();
					 	   	    	       parentNode.fireEvent("click", parentNode);
					 	   	    	   }
					 	   	    	   else if(!data.success) {
					 	   	    		   Dbl.Utils.showErrorMsg(data.msg, '');
					 	   		      }
					 	   		});
					         }
				    });
				}
			}
		};
	},

	reorderColumns: function(nodeId, nodeText) {
		return {
			itemId: 'reorder_columns_' + nodeId,
			text: 'Reorder Columns...',
			iconCls: 'reorder_columns',
			listeners: {
				click: function(baseItem, el) {
					Server.sendCommand('get_table_columns_info', { table: nodeText  },
						function(data) {
						    var panel = new ReorderColumnsPanel(data);
							this.win = new Dbl.ContextMenuWindow({
								title: "Reorder Columns of '" + data.table + "'",
								id: 'reorder_columns_window',
								headerAsText: true,
								width: 310,
								height: 416,
								resizable: false,
								modal: true,
								plain: true,
								stateful: true,
								closable: false,
								onEsc: function(){},
								closeAction: 'destroy',
								items: [ panel ],
					            buttons: [{
						                	text:'reorder',
						                	id: 'reorder_rows',
											ref: '../reorderButton',
											disabled: true,
						                	handler: function() { panel.reorderColumns(data.table); }
					            		}, {
					            			text: 'cancel',
					            			handler: function() { panel.cancelConfirm(); }
					            		}]
							});
							this.win.show();
					    });
					}
				}
		};
	},

	viewTableData: function(nodeId, nodeText) {
		return {
			itemId: 'view_tabledata_' + nodeId,
			text: 'View Data...',
			iconCls: 'view_table_data',
			listeners: {
				click: function(baseItem, el) {
					Dbl.UserActivity.setKey('datapanelActiveTab', 'tablestructure');
					Dbl.UserActivity.setKey('activeTableTab', 'table_data');
					Dblite.dataPanel.refresh(true);
					}
				}
		};
	},

	viewAdvancedProperties: function(nodeId, nodeText) {
		return {
			itemId: 'view_advanced_properties_' + nodeId,
			text: 'View Advanced Properties...',
			iconCls: 'view_table_properties',
			listeners: {
				click: function(baseItem, el) {
					Dbl.UserActivity.setKey('datapanelActiveTab', 'tablestructure');
					Dbl.UserActivity.setKey('activeTableTab', 'table_information');
					Dblite.dataPanel.refresh(true);
				}
			}
		};
	},



	/* Column menu items */

	manageColumns: function(nodeId, nodeText) {
		return {
			itemId: 'manage_column_' + nodeId,
			text: 'Manage Columns...',
			iconCls: 'alter_table',
			listeners: {
				click: function(baseItem, el) {

			        if((Dbl.UserActivity.getValue('datapanelActiveTab') == 'tablestructure')
			        		&& (Dbl.UserActivity.getValue('activeTableTab') == 'column_info')) {
			        			Ext.getCmp('alter_table_panel').closeAlterSQLPreview();
					        	Ext.getCmp('alter_table_grid').selectTableColumn();
			        } else {
						Dbl.UserActivity.setKey('datapanelActiveTab', 'tablestructure');
						Dbl.UserActivity.setKey('activeTableTab', 'column_info');
						Dblite.dataPanel.refresh(true);
			        }
	             }
			}
         };
	},

	dropColumn: function(nodeId, nodeText) {
		return {
			itemId: 'drop_column_' + nodeId,
			text: 'Drop Column...',
			iconCls: 'drop_column',
			listeners: {
				click: function(baseItem, el) {
			        if((Dbl.UserActivity.getValue('datapanelActiveTab') == 'tablestructure')
			        		&&(Dbl.UserActivity.getValue('activeTableTab') == 'column_info')) {
			        			Ext.getCmp('alter_table_grid').dropTableColumn(Explorer.selectedColumn);
			        } else {
						Dbl.UserActivity.setKey('datapanelActiveTab', 'tablestructure');
						Dbl.UserActivity.setKey('activeTableTab', 'column_info');
						Dblite.dataPanel.refresh(true);
						if(Ext.getCmp('alter_table_grid')) {
			        		Ext.getCmp('alter_table_grid').dropTableColumn();
			        	}
			        }
	         	}
			}
         };
	},


	/* View menu items */

//	alterView: function(nodeId, nodeText) {
//	return {
//		itemId: 'alter_view_' + nodeId,
//		text: 'Alter View...',
//		iconCls: 'alter_view',
//		listeners: {
//			click: function(baseItem, el) {
//				Dbl.Utils.showTBDMsg();
//         	}
//		}
//	};
//},

//	renameView: function(nodeId, nodeText) {
//	return {
//		itemId: 'rename_view_' + nodeId,
//		text: 'Rename View...',
//		iconCls: 'rename_view',
//		listeners: {
//			click: function(baseItem, el) {
//				this.win = new Dbl.ContextMenuWindow({
//					title : 'Rename View',
//					id : 'create_view_window',
//					width : 300,
//					height : 120,
//					resizable : false,
//					layout : 'border',
//					modal : true,
//					plain : true,
//					stateful : true,
//					onEsc: function(){},
//					items : [ {
//						id : 'rename_view',
//						region : 'center',
//						xtype : 'panel',
//						layout : 'fit',
//						items : [ new Dbl.CreateViewPanel('RENAME') ]
//					} ]
//				});
//				this.win.show();
//         	}
//		}
//	};
//},


//	exportView: function(nodeId, nodeText) {
//	return {
//		itemId: 'export_view_' + nodeId,
//		text: 'Export View...',
//		iconCls: 'export_view',
//		listeners: {
//			click: function(baseItem, el) {
//				Dbl.Utils.showTBDMsg();
//         	}
//		}
//	};
//},

	dropView: function(nodeId, nodeText) {
		return {
			itemId: 'drop_view_' + nodeId,
			text: 'Drop View...',
			iconCls: 'drop_view',
			listeners: {
				click: function(baseItem, el) {
			        Ext.Msg.confirm('Confirmation',
			        		Messages.getMsg('drop_view', [nodeText]),
			            	function(btn){
				     	         if(btn == 'yes'){
				     	        	 Database.sendCommand('drop_view', {
			     	        		    dbname: Dbl.UserActivity.getValue('database'),
				     	        		view: nodeText},
				     	        		function(data) {
					     	            	Explorer.selectedView = '';
					     	            	Explorer.selectedViewNodeId = '';
					     	            	var viewnode = Explorer.explorerTreePanelObj.getNodeById(nodeId);
					     	            	viewnode.remove();
				     	        		});
				     	         }
			        		}
			        	);
	         	}
			}
		};
	},



	/* Procedure menu items */

//	alterProcedure: function(nodeId, nodeText) {
//	return {
//		itemId: 'alter_procedure_' + nodeId,
//		text: 'Alter Stored Procedure...',
//		iconCls: 'alter_procedure',
//		listeners: {
//			click: function(baseItem, el) {
//				Dbl.Utils.showTBDMsg();
//         	}
//		}
//	};
//},

	dropProcedure: function(nodeId, nodeText) {
		return {
			itemId: 'drop_procedure_' + nodeId,
			text: 'Drop Stored Procedure...',
			iconCls: 'drop_procedure',
			listeners: {
				click: function(baseItem, el) {
			        Ext.Msg.confirm('Confirmation',
			        		Messages.getMsg('drop_procedure', [nodeText]),
			            	function(btn){
				     	         if(btn == 'yes') {
				     	        	 Database.sendCommand('drop_procedure', {
				     	        		dbname: Dbl.UserActivity.getValue('database'),
				     	        		procedurename: nodeText},
				     	        		function(data) {
					     	            	Explorer.selectedProcedure = '';
					     	            	Explorer.selectedProcedureNodeId = '';
					     	            	var treeNode = Explorer.explorerTreePanelObj.getNodeById(nodeId);
						 	   	    	    treeNode.remove();
				     	        		});
				     	         }
			        		}
			        	);
	         	}
			}
		};
	},



	/* Function menu items */

//	alterFunction: function(nodeId, nodeText) {
//	return {
//		itemId: 'alter_function_' + nodeId,
//		text: 'Alter Function...',
//		iconCls: 'alter_function',
//		listeners: {
//			click: function(baseItem, el) {
//				Dbl.Utils.showTBDMsg();
//         	}
//		}
//	};
//},

	dropFunction: function(nodeId, nodeText) {
		return {
			itemId: 'drop_function_' + nodeId,
			text: 'Drop Function...',
			iconCls: 'drop_function',
			listeners: {
				click: function(baseItem, el) {
			        Ext.Msg.confirm('Confirmation',
			        		Messages.getMsg('drop_function', [nodeText]),
			            	function(btn){
				     	         if(btn == 'yes'){
				     	        	 Database.sendCommand('drop_function', {
				     	        		 dbname: Dbl.UserActivity.getValue('database'),
				     	        		 functionname: nodeText},
				     	        		 function(data) {
					     	            	Explorer.selectedFunction = '';
					     	            	Explorer.selectedFunctionNodeId = '';
					     	            	var treeNode = Explorer.explorerTreePanelObj.getNodeById(nodeId);
						 	   	    	    treeNode.remove();
				     	        		 });
				     	         }
			        		}
			        	);
	         	}
			}
		};
	},

	showCreateDBWindow: function() {
		Database.sendCommand('get_charset_collation', {}, function(data) {
			this.win = new Dbl.ContextMenuWindow({
				title : 'Create Database',
				id : 'create_db_window',
				width : 350,
				height : 200,
				items: [new Dbl.CreateDbPanel(data.charsets, data.collations)]
			});
			this.win.show();
		});

	}
};

