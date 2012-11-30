var Explorer = {
  selectedDatabase : '',
  selectedTable : '',
  selectedView: '',
  selectedColumn: '',
  selectedNodeType : '',
  explorerData : {},
  explorerPanel : '',
  explorerTreePanelObj : '',
  restoring: true,
  win : '',
  selectedDatabaseTables: new Array(),
  selectedDatabaseColumns: new Array(),

  reset : function() {
    Explorer.explorerPanel.removeAll();
    Explorer.selectedDatabase = '';
    Explorer.selectedTable = '';
    Explorer.selectedNodeType = '';
  },

  restore: function() {
    Explorer.restoring = true;
    var connection = Dbl.UserActivity.getValue('connection');
    var database = Dbl.UserActivity.getValue('database');
    var table = Dbl.UserActivity.getValue('table');
    var table_type = Dbl.UserActivity.getValue('table_type');

    if(!connection) {
      Explorer.restoring = false;
      return;
    }
    Ext.getCmp('server-connections').setValue(connection);
    // Dblite.serverChanged(connection);
    Explorer.loadExplorerData(database, table, table_type, function() {
       Explorer.restoring = false;
    });
 },

  init : function() {
    /**
     * @constructor
     *
     */

	 Explorer.win = new Dbl.ServerWindow();
	 Explorer.win.show();
	 Explorer.win.hide();

    Explorer.explorerPanel = new Ext.Panel({
      title : 'Database Explorer',
      id: 'database_explorer_panel',
      /* header: false, */
      region : 'west',
      margins : '0 0 0 2',
      width : Dbl.UserSettings.explorerWidth,
      minSize : 250,
      maxSize : 400,
      split : true,
      layout : 'fit',
      border : false,
      style : {
         borderWidth : '0px',
         borderRightWidth : '1px'
      },
      collapsible : true,
      collapsed: Dbl.UserSettings.explorerCollapsed,
      tools : [],
      tbar : {
        border : false,
        items : [ new Ext.form.ComboBox({
			          id : 'server-connections',
			          store : Dblite.connectionComboStore,
			          displayField : 'connection_id',
			          valueField : 'connection_id',
			          typeAhead : true,
			          mode : 'local',
			          triggerAction : 'all',
			          emptyText : 'Select a connection...',
			          selectOnFocus : true,
			          width : 135,
			        //  value: Dbl.UserActivity.getValue('connection'),
			          listeners: {
        					'select': function(elem, record, index) {
						          	if(record.data.show_new_conn_window === true) {
						          	    Explorer.showServerWindow(true);
						          	    return;
						          	}
        							Explorer.connectionChanged(record.data.connection_id, record.data.database);
       					 }
        			  }
		        }), {
        			id: 'explorer_loading_btn',
        			iconCls: 'explorer_loading',
        			tooltip: 'Loading database explorer...',
        			hidden: true,
        		}, '->', {
	       			 id : 'new_connection',
	    			 iconCls : 'add_server',
	    			 tooltip: 'New connection',
	    			 handler : Explorer.showServerWindow
    			}, {
			         id : 'manage_connections',
			         iconCls : 'edit_server',
			         tooltip: 'Manage connections',
			         handler : Explorer.showServerWindow
        		}]
      },
      items : [],
      listeners : {
        resize : Dbl.UserActivity.pageLayout.resizeExplorerPanel,
        collapse: Dbl.UserActivity.pageLayout.collapseExplorerPanel,
        expand: Dbl.UserActivity.pageLayout.expandExplorerPanel
      }
    });
  },

  showServerWindow : function(btn) {
	var add_new = false;
	if(btn === true) {
	    var add_new = true;
	}
	else if(btn.el.id == 'new_connection'){
	    var add_new = true;
	}
//	Explorer.win = new Dbl.ServerWindow(add_new);
	Explorer.win.show();

	var form = Ext.getCmp('server-form');
     if(add_new) {
//       var form = Ext.getCmp('server-form');
         Explorer.windowType = 'add';
  	     form.newConnection();
     } else {
    	 Explorer.windowType = 'edit';
 	     var grid = Ext.getCmp('server-connection-grid');
 	     grid.updateButtonsStatus();
	  	 grid.getSelectionModel().selectFirstRow();
	  	 grid.doLayout();
     }
  },

  connectionChanged: function(connection, database) {
	Server.sendCommand('connection.should_prompt_password',{newConnectionId: connection},function(data) {
  	  if(data.shouldPrompt === true) {
  		  Explorer.promptConnectionPassword(connection, database);
//  	    Ext.MessageBox.prompt('Password', Messages.getMsg('connection_password', [connection]), function(btn, text) {
//  	      if(btn == 'ok') {
//  	        Server.sendCommand('connection.temp_save_password',{newConnectionId: connection, password: text}, function(data) {
//  	          Explorer.proceedServerChange(connection, database);
//  	        });
//  	      }
//  	    });
  	  }
  	  else {
  		Explorer.proceedServerChange(connection, database);
  	  }
  	});
  },

  proceedServerChange: function(connection, database) {
	Ext.getCmp('server-connections').setValue(connection);
    Server.serverChanged(connection, database);
    Explorer.reset();
    Explorer.loadExplorerData();
  },

  /**
   * @constructor
   */
  explorerTreePanel : function(data) {
    Explorer.explorerTreePanel.superclass.constructor.call(this, {
      id : 'explorer_tree_panel',
      autoScroll : true,
      animate : true,
      animCollapse : true,
      rootVisible : false,
      useArrows: true,
      layout: 'fit',
      border: false,
      //containerScroll: true,

      root : new Ext.tree.AsyncTreeNode({
        text : 'explorer',
        id : 'root',
        //expanded : true,
        children : data,
        listeners: {
    	  append: this.nodeAppended,
      	  scope: this
      	}
      }),

      keys: [{
			key: Ext.EventObject.F5,
			handler: this.handleNodeRefresh,
			stopEvent: true,
			scope: this
	  }],

      selModel : new Ext.tree.DefaultSelectionModel({
          listeners : {
            selectionchange : function(model, node) {
              // this.handleClickNode(node);
            },
            scope : this
          }
        }),

      listeners: {
    	afterrender: this.handleAfterRender,
    	contextmenu: this.onContextMenu,
    	click: this.handleClickNode,
    	expandnode: this.handleExpandNode,
    	scope: this
      },

      loader : new Ext.tree.TreeLoader({
        dataUrl : ' ',
        preloadChildren : false,
        listeners : {
          beforeload : function(treeLoader, node) {
	      	if(node.ui.iconNode){
		  		node.ui.iconNode.className = 'x-tree-node-icon loading_icon';
		  	}
    	  	this.loadNodeData(node);
    	  	node.select();
            return false;
          },
          scope: this
        }
      })
    });
  },


  loadExplorerData : function(selected_db, selected_table, table_type, callback) {
	  Ext.getCmp('explorer_loading_btn').show();

	  if(selected_table) {
		Dbl.UserActivity.explorerPanel.newTableSelected(selected_table, selected_db, table_type);
	  }
	  else if(selected_db) {
		Dbl.UserActivity.explorerPanel.newDatabaseSelected(selected_db);
	  }

	  Database.sendCommand('cache_explorer_data', {
		  connectiondb: Dbl.UserActivity.getValue('connection_db'),
		  dbname: Dbl.UserActivity.getValue('database'),
		  tablename: Dbl.UserActivity.getValue('table')},
		  function() {
			  Explorer.explorerTreePanelObj = new Explorer.explorerTreePanel();
			  //Explorer.explorerTreePanelObj.table = Dbl.UserActivity.getValue('table');
			  Explorer.explorerPanel.add(Explorer.explorerTreePanelObj);
			  Explorer.explorerPanel.doLayout();

			  // scroll the node into view
		      var node = null;
		      if(selected_table) {
		        var table = 't=' + selected_db + '.' + selected_table;
		        node = Explorer.explorerTreePanelObj.getNodeById(table);
		      } else if (selected_db) {
		      	var database = 'd=' + selected_db;
		      	node = Explorer.explorerTreePanelObj.getNodeById(database);
		      	node.firstChild.expand();
				node.select();
		      }
		      if(node) {
		        Explorer.scrollNodeIntoView(node);
		      }

/*
		      // hide explorer loading icon
			  Ext.get('explorer_loading_btn').fadeOut({
				  endOpacity: 0,
				  easing: 'easeOut',
				  duration: 1,
				  remove: false,
				  useDisplay: false});
*/

			 Ext.getCmp('explorer_loading_btn').hide();
		  });

	  if(callback) {
       callback();
	  }
    },

  scrollNodeIntoView : function(node) {
    if (node) {
      if (node.nextSibling) {
        node.nextSibling.ensureVisible();
        if (node.previousSibling) {
          node.previousSibling.ensureVisible();
          node.ensureVisible();
        } else {
          node.ensureVisible();
        }
      } else {
        node.ensureVisible();
      }
    }
  },

  getDbTablesAndColumns: function() {
	Server.sendCommand('get_dbtables_columns', {},
			function(data){
		        if(data.success) {
					Explorer.selectedDatabaseTables = data.tables;
					Explorer.selectedDatabaseColumns = data.tables;
		        }
			}, function(data){
				var errorMsg = data.msg ? data.msg : data;
				Dbl.Utils.showErrorMsg(errorMsg, '');
			}
		);

  },

  promptConnectionPassword: function(connection, database) {
		Dblite.window = new Dbl.ContextMenuWindow({
			title : 'Connection Password',
			id : 'connection_password_window',
			width : 350,
			height : 120,
			resizable : false,
			layout : 'fit',
			modal : true,
			plain : true,
			stateful : true,
			frame: true,
			onEsc: function(){},
			items : [new Dbl.ConnectionPasswordPanel(connection, database)]
		});
		Dblite.window.show();
  },

  refreshDatabaseExplorer: function() {
  	Explorer.explorerTreePanelObj.handleNodeRefresh();
  },

  alterTableStructure: function() {
	Explorer.explorerTreePanelObj.manageTableColumns();
  },

  alterTableIndexes: function() {
	Explorer.explorerTreePanelObj.manageTableIndexes();
  },

  showHideDatabaseExplorer: function() {
	if(Explorer.explorerPanel.collapsed){
		Explorer.explorerPanel.expand(true);
	} else {
		Explorer.explorerPanel.collapse(true);
	}
  },

  showCreateDBPanel: function() {
  	ExplorerMenuItems.showCreateDBWindow();
  }
};

Ext.extend(Explorer.explorerTreePanel, Ext.tree.TreePanel, {

	nodeAppended: function(tree, node, child) {
		  	if(child.attributes.category == 'connection') {
		  		this.loadNodeData(child);
		  	}
		  	else if(child.attributes.category == 'table' && child.id == Dbl.UserActivity.getValue('table')) {
				Explorer.scrollNodeIntoView(child);
		  	}
    },

  	handleNodeRefresh: function() {
  		var node = this.getSelectionModel().getSelectedNode();

  		if(node.attributes.category == 'connection') {
			Explorer.explorerPanel.removeAll();
			Explorer.restore();
  		} else if(node.attributes.category == 'database') {
				Explorer.explorerPanel.removeAll();
				Explorer.loadExplorerData(node.text);
  		}
  	},

	manageTableColumns: function() {
  		var node = this.getSelectionModel().getSelectedNode();
		if(node.attributes.category == 'table') {
			Dbl.UserActivity.setKey('datapanelActiveTab', 'tablestructure');
			Dbl.UserActivity.setKey('activeTableTab', 'column_info');
			Dblite.dataPanel.refresh(true);
		}
	},

	manageTableIndexes: function() {
  		var node = this.getSelectionModel().getSelectedNode();
		if(node.attributes.category == 'table') {
			Dbl.UserActivity.setKey('datapanelActiveTab', 'tablestructure');
			Dbl.UserActivity.setKey('activeTableTab', 'index_info');
			Dblite.dataPanel.refresh(true);
		}
	},


	loadNodeData: function(node) {
    	if (node.attributes.category == 'connection') {

      		Database.sendCommand('get_server_databases', {scope: this, connectiondb: Dbl.UserActivity.getValue('connection_db')}, function(data) {
    			var databases = data.result;

    			for(var i=0;i<databases.length;i++) {
    				var  cnode = {
    						category: 'database',
    						id: 'd=' + databases[i][0],
    						text: databases[i][0],
    						cls: 'database_node',
    						category: 'database',
    						iconCls: 'database',
    						expanded: false
    				};
    				if(Dbl.UserActivity.getValue('database') ==  databases[i][0]) {
    					cnode.restoring = true;
    					cnode.expanded = true;
    				}
    				node.appendChild(cnode);
    			}
    		});

        	if(node.ui.iconNode){
        		node.ui.iconNode.className = 'x-tree-node-icon connection';
        	}
    	}
    	else if (node.attributes.category == 'database') {
    		node.appendChild(this.getDatabaseNodes(node));
        	if(node.ui.iconNode){
        		node.ui.iconNode.className = 'x-tree-node-icon database';
        	}
    	}
    	else if(node.attributes.category == 'tables') {
      		Database.sendCommand('get_db_tables', {dbname: node.parentNode.text, scope:this}, function(data) {
    			var tables = data.result;
//    			var cnodes = [];
    			for(var i=0;i<tables.length;i++) {
    				var  cnode = {
    						category: 'table',
    						id: 't=' + node.parentNode.text + '.' + tables[i][0],
    						text: tables[i][0],
    						cls: 'table_node',
    						iconCls: 'table',
    						expanded: false,
    						listeners: {
								append: this.nodeAppended,
								scope: this
							}
    				};
    				if(Dbl.UserActivity.getValue('table')  ==  tables[i][0] &&
    				   Dbl.UserActivity.getValue('database') ==  node.parentNode.text) {
    					cnode.restoring = true;
    					cnode.expanded = true;
    				}
    				node.appendChild(cnode);
    			}
            	if(node.ui.iconNode){
            		node.ui.iconNode.className = 'x-tree-node-icon table_group';
            	}
    		});
    	}
    	else if(node.attributes.category == 'views') {
    		Database.sendCommand('get_db_views', {dbname: node.parentNode.text}, function(data) {
    			var views = data.result;
    			var cnodes = [];
    			for(var i=0;i<views.length;i++) {
    				var  cnode = {
    						category: 'view',
    						id: 'v=' + node.parentNode.text + '.' + views[i][0],
    						text: views[i][0],
    						cls: 'table_node',
    						iconCls: 'database_view',
    						leaf: (Dbl.UserActivity.getValue('table') == views[i][0]) ? false : true
    				};
    				if(Dbl.UserActivity.getValue('table')  ==  views[i][0] &&
    	    				   Dbl.UserActivity.getValue('database') ==  node.parentNode.text) {
    	    					cnode.restoring = true;
    	    					cnode.expanded = true;
     				}
    				node.appendChild(cnode);
    			}

            	if(node.ui.iconNode){
            		node.ui.iconNode.className = 'x-tree-node-icon database_views';
            	}

    		});
    	}
    	else if(node.attributes.category == 'procedures') {
    		Database.sendCommand('get_db_procedures', {dbname: node.parentNode.text}, function(data) {
    			var procedures = data.result;
    			var cnodes = [];
    			for(var i=0;i<procedures.length;i++) {
    				var  cnode = {
    						category: 'procedure',
    						id: 'p=' + node.parentNode.text + '.' + procedures[i][0],
    						text: procedures[i][0],
    						cls: 'table_node',
    						iconCls: 'database_procedure',
    						leaf: true
    				};
        			node.appendChild(cnode);
    			}

            	if(node.ui.iconNode){
            		node.ui.iconNode.className = 'x-tree-node-icon stored_procedures';
            	}

    		});
    	}
    	else if(node.attributes.category == 'functions') {
    		Database.sendCommand('get_db_functions', {dbname: node.parentNode.text}, function(data) {
    			var functions = data.result;
    			for(var i=0;i<functions.length;i++) {
    				var  cnode = {
    						category: 'function',
    						id: 'f=' + node.parentNode.text + '.' + functions[i][0],
    						text: functions[i][0],
    						cls: 'table_node',
    						iconCls: 'database_function',
    						leaf: true
    				};
        			node.appendChild(cnode);
    			}

            	if(node.ui.iconNode){
            		node.ui.iconNode.className = 'x-tree-node-icon database_functions';
            	}

    		});
    	}
    	else if(node.attributes.category == 'table') {
    		Database.sendCommand('get_table_columns', {dbname: node.parentNode.parentNode.text, tablename: node.text}, function(data) {
    			var columns = data.result;
    			for(var i=0;i<columns.length;i++) {
    				var id = columns[i][0];
    				var text = columns[i][0] + ' [' + columns[i][1] + ']';
    				var  cnode = {
    						category: 'column',
    						id: 'c=' + node.parentNode.parentNode.text + '.'  + node.text + '.' + id,
    						column_name: id,
    						text: text,
    						cls: 'table_node',
    						category: 'column',
    						iconCls: (columns[i][2] == 'PRI') ? 'primary_column' : 'table_column',
    						leaf: true
    				};
    				node.appendChild(cnode);
    			}

            	if(node.ui.iconNode){
            		node.ui.iconNode.className = 'x-tree-node-icon table';
            	}

				Explorer.scrollNodeIntoView(node);
    		});
      }

      else if(node.attributes.category == 'view') {
      	if(node.ui.iconNode){
    		node.ui.iconNode.className = 'x-tree-node-icon database_view';
    	}
      }

      else {
//	    Server.sendCommand('get_explorer_data', {
//	        category : node.attributes.category,
//	        node : node.text,
//	        parent : node.parentNode.parentNode.text
//	      }, function(data) {
//	        node.appendChild(data);
//	      });
    	}
    	//node.expand();
	  },

	  getDatabaseNodes: function(node) {
		  	var tablesnode = {
    				id: node.text + '_tables',
    				category: 'tables',
    				text: 'Tables',
    				iconCls: 'table_group',
    				expanded: false,
					listeners: {
						append: this.nodeAppended,
						scope: this
					}
    			};

		  	if(Dbl.UserActivity.getValue('database') ==  node.text
		  			&& Dbl.UserActivity.getValue('table')
		  				&& Dbl.UserActivity.getValue('table_type') == 'table') {
							tablesnode.restoring = true;
							tablesnode.expanded = true;
			}

			var viewsnode = {
    				id: node.text + '_views',
    				category: 'views',
    				text: 'Views',
    				iconCls: 'database_views',
    				expanded: false,
					listeners: {
						append: this.nodeAppended,
						scope: this
					}
    		};

		  	if(Dbl.UserActivity.getValue('database') ==  node.text
		  			&& Dbl.UserActivity.getValue('table')
		  				&& Dbl.UserActivity.getValue('table_type') == 'view') {
		  					viewsnode.restoring = true;
		  					viewsnode.expanded = true;
			}

			var proceduresnode = {
    				id: node.text + '_stored_procedure',
    				category: 'procedures',
    				text: 'Stored Procs',
    				iconCls: 'stored_procedures',
    				expanded: false
    		};
			var functionsnode = {
    				id: node.text + '_functuions',
    				category: 'functions',
    				text: 'Functions',
    				iconCls: 'database_functions',
    				expanded: false
    		};

			return [tablesnode, viewsnode, proceduresnode, functionsnode];

	  },

	  handleAfterRender: function() {
  		var connection_node = new Ext.tree.TreeNode({
			id: Server.connection_id,
  		    text: Server.connection_id,
            expanded: true,
            category: 'connection',
            iconCls: 'connection',
            listeners: {
				append: this.nodeAppended,
				scope: this
			}
		});
		this.getRootNode().appendChild(connection_node);
		//connection_node.expand();
	  },

      onContextMenu : function(node, e) {
			if ((node.attributes.category != 'connection')
                && (node.attributes.category != 'database')
                && (node.attributes.category != 'tables')
                && (node.attributes.category != 'table')
                && (node.attributes.category != 'column')
                && (node.attributes.category != 'views')
                && (node.attributes.category != 'view')
                && (node.attributes.category != 'procedures')
                && (node.attributes.category != 'procedure')
                && (node.attributes.category != 'functions')
                && (node.attributes.category != 'function')) {
            		return;
            }

			node.fireEvent('click', node, e);

            if (this.menu) {
              this.menu.removeAll();
            }

            var nodeId = node.attributes.id;
            var nodeText = node.attributes.text;
            var nodeCategory = node.attributes.category;

            var menu_id = '';
            var menu_items = [];

            if (nodeCategory == 'connection') {
              menu_id = nodeCategory + '_' + nodeId + '-folder-node-ctx';
              menu_items = [
                  ExplorerMenuItems.refreshConnection(nodeId, nodeText), '-',
                  ExplorerMenuItems.createDb(nodeId, nodeText), '-',
                  ExplorerMenuItems.restoreDb(nodeId, nodeText) ];
            }

            else if (nodeCategory == 'database') {
              menu_id = nodeCategory + '_' + nodeId + '-folder-node-ctx';
              menu_items = [
                  ExplorerMenuItems.refreshDb(nodeId, nodeText),
                  '-',
                  ExplorerMenuItems.createDb(nodeId, nodeText),
                  ExplorerMenuItems.createTable(nodeId, nodeText),
                  '-',
                  ExplorerMenuItems.createView(nodeId, nodeText),
                  ExplorerMenuItems.createProcedure(nodeId, nodeText),
                  ExplorerMenuItems.createFunction(nodeId, nodeText),
                  // ExplorerMenuItems.copyDb(nodeId, nodeText),
                  '-',
                  ExplorerMenuItems.backupDb(nodeId, nodeText),
                  ExplorerMenuItems.restoreDb(nodeId, nodeText),
                  '-',
                  ExplorerMenuItems.truncateDb(nodeId, nodeText),
                  ExplorerMenuItems.emptyDb(nodeId, nodeText),
                  ExplorerMenuItems.dropDb(nodeId, nodeText)];
            }

            else if (nodeCategory == 'tables') {
                Explorer.selectedNodeType = nodeCategory;
                menu_id = nodeCategory + '_' + nodeId + '-folder-node-ctx';
                menu_items = [ExplorerMenuItems.createTable(nodeId, nodeText)];
            }

            else if (nodeCategory == 'table') {
              Explorer.selectedNodeType = nodeCategory;
              Explorer.selectedTable = nodeText;
              Explorer.selectedColumn = '';
              Explorer.selectedColumnNodeId = '';
              menu_id = nodeCategory + '_' + nodeId + '-folder-node-ctx';
              menu_items = [
                  // ExplorerMenuItems.copyTable(nodeId, nodeText),
                  // '-',
                  ExplorerMenuItems.alterTable(nodeId, nodeText),
                  ExplorerMenuItems.manageIndexes(nodeId, nodeText),
                  ExplorerMenuItems.createTable(nodeId, nodeText),
                  '-',
                  // ExplorerMenuItems.manageForeignKeys(nodeId, nodeText),
                  // '-',
                  ExplorerMenuItems.exportTable(nodeId, nodeText),
                  ExplorerMenuItems.duplicateTable(nodeId, nodeText),
                  '-',
                  ExplorerMenuItems.renameTable(nodeId, nodeText),
                  ExplorerMenuItems.truncateTable(nodeId, nodeText),
                  ExplorerMenuItems.reorderColumns(nodeId, nodeText),
                  ExplorerMenuItems.dropTable(nodeId, nodeText),
                  '-',
                  ExplorerMenuItems.viewTableData(nodeId, nodeText),
                  ExplorerMenuItems.viewAdvancedProperties(nodeId, nodeText) ];
            }

            else if (nodeCategory == 'column') {
            	Explorer.selectedColumn =  node.attributes.column_name;
                Explorer.selectedNodeType = nodeCategory;
            	Explorer.selectedColumnNodeId = nodeId;


                menu_id = nodeCategory + '_' + nodeId + '-folder-node-ctx';
                menu_items = [
                    ExplorerMenuItems.manageColumns(nodeId, nodeText),
                    ExplorerMenuItems.dropColumn(nodeId, nodeText)];
            }

            else if(nodeCategory == 'views') {
                menu_id = nodeCategory + '_' + nodeId + '-folder-node-ctx';
                menu_items = [ExplorerMenuItems.createView(nodeId, nodeText)]
            }

            else if(nodeCategory == 'view') {
            	Explorer.selectedView = nodeText;
            	Explorer.selectedViewNodeId = nodeId;

                menu_id = nodeCategory + '_' + nodeId + '-folder-node-ctx';
                menu_items = [
                    ExplorerMenuItems.createView(nodeId, nodeText),
                    //ExplorerMenuItems.alterView(nodeId, nodeText),
                    //'-',
                    //ExplorerMenuItems.renameView(nodeId, nodeText),
                    //ExplorerMenuItems.exportView(nodeId, nodeText),
                    //'-',
                    ExplorerMenuItems.dropView(nodeId, nodeText)];
            }

            else if(nodeCategory == 'procedures') {
                menu_id = nodeCategory + '_' + nodeId + '-folder-node-ctx';
                menu_items = [ExplorerMenuItems.createProcedure(nodeId, nodeText)]
            }

            else if(nodeCategory == 'procedure') {
            	Explorer.selectedProcedure = nodeText;
            	Explorer.selectedProcedureId = nodeId;

                menu_id = nodeCategory + '_' + nodeId + '-folder-node-ctx';
                menu_items = [
                    ExplorerMenuItems.createProcedure(nodeId, nodeText),
                    //ExplorerMenuItems.alterProcedure(nodeId, nodeText),
                    //'-',
                    ExplorerMenuItems.dropProcedure(nodeId, nodeText)];
            }

            else if(nodeCategory == 'functions') {
                menu_id = nodeCategory + '_' + nodeId + '-folder-node-ctx';
                menu_items = [ExplorerMenuItems.createFunction(nodeId, nodeText)]
            }

            else if(nodeCategory == 'function') {
            	Explorer.selectedFunction = nodeText;
            	Explorer.selectedFunctionId = nodeId;

                menu_id = nodeCategory + '_' + nodeId + '-folder-node-ctx';
                menu_items = [
                    ExplorerMenuItems.createFunction(nodeId, nodeText),
                    //ExplorerMenuItems.alterFunction(nodeId, nodeText),
                    //'-',
                    ExplorerMenuItems.dropFunction(nodeId, nodeText)];
            }

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

        handleExpandNode : function(node, e) {

          // do not do anything on click event of explorer node
          if (node.attributes.category == 'explorer') {
            return true;
          }
          // do not do anything on click event if the clicked node is one of the
          // parents of the selectedNode
          if (Explorer.selectedNode) {
            var parent = Explorer.selectedNode.parentNode;
            while (parent) {
              if (node.id == parent.id) {
                return true;
              }
              parent = parent.parentNode;
            }
          }

          if(node.attributes.restoring) {
        	  node.restoring = false;
          }
          else {
        	  this.handleClickNode(node, e);
          }
        },

        handleClickNode : function(node, e) {

          Explorer.selectedNode = node;
          Explorer.selectedNodeType = node.attributes.category;

          // set the selectedDatabase and selectedTable
          if (node.attributes.category == 'database') {
            Dbl.UserActivity.explorerPanel.newDatabaseSelected(node.text);
            Ext.getCmp('tablestructure').setTitle('Table Structure');
          }
          else if (node.attributes.category == 'tables') {
            Dbl.UserActivity.explorerPanel.newDatabaseSelected(node.parentNode.text);
            Ext.getCmp('tablestructure').setTitle('Table Structure');
          }
          else if (node.attributes.category == 'table') {
            Dbl.UserActivity.explorerPanel.newTableSelected(node.text, node.parentNode.parentNode.text, 'table');
          }
          else if (node.attributes.category == 'columns') {
            Dbl.UserActivity.explorerPanel.newTableSelected(node.parentNode.text, node.parentNode.parentNode.parentNode.text, 'table');
          }
          else if (node.attributes.category == 'column') {
            Dbl.UserActivity.explorerPanel.newTableSelected(node.parentNode.text, node.parentNode.parentNode.parentNode.text, 'table');
          }
          else if (node.attributes.category == 'views') {
            Dbl.UserActivity.explorerPanel.newDatabaseSelected(node.parentNode.text);
            Ext.getCmp('tablestructure').setTitle('Table Structure');
          }
          else if (node.attributes.category == 'view') {
            Dbl.UserActivity.explorerPanel.newTableSelected(node.text, node.parentNode.parentNode.text, 'view');
          }
          else if (node.attributes.category == 'procedures') {
            Dbl.UserActivity.explorerPanel.newDatabaseSelected(node.parentNode.text);
            Ext.getCmp('tablestructure').setTitle('Table Structure');
          }
          else if (node.attributes.category == 'procedure') {
        	  //TBD
          }
          else if (node.attributes.category == 'functions') {
            Dbl.UserActivity.explorerPanel.newDatabaseSelected(node.parentNode.text);
            Ext.getCmp('tablestructure').setTitle('Table Structure');
          }
          else if (node.attributes.category == 'function') {
        	  //TBD
          }

          //Explorer.selectedDbTable = Explorer.selectedDatabase + '.' + Explorer.selectedTable;
          Explorer.selectedDbTable = Dbl.UserActivity.getValue('database') + '.' + Dbl.UserActivity.getValue('table');

          if ((Explorer.selectedDatabase != Dblite.dataPanel.selectedDatabase)
              || (Explorer.selectedTable != Dblite.dataPanel.selectedTable)) {
		            if(!Explorer.restoring) {
	        	  		Dblite.dataPanel.reloadStructureData = true;
			            Dblite.dataPanel.refresh();
		            }
          }

        }
});
