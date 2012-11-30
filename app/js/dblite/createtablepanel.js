/**
 * @constructor
 */
Dbl.CreateTablePanel = function(data) {
	var grid = new Dbl.CreateTableGridPanel(data);
	grid.reset();
	grid.database = data.database;
	grid.table = data.table;
	grid.table_columns = data.table_columns;
	grid.key_names = data.key_names;
	grid.primary_key_columns = data.primary_key_columns;

	var add_tbar = true;
	if(!data.create_table && (Dbl.UserActivity.getValue('table_type') == 'view')) {
		add_tbar = false;
	}
	
	var ddlPanel = new Ext.Panel({
		    id: (data.create_table) ? ('preview_create_sql') : ('preview_alter_sql'),
			autoScroll: true,
			border: false,
			items: [],
			listeners: {
				beforeshow : this.activateTab.createCallback(grid, data.create_table, data.alter_table), 
				scope: this
			}
    });
	
	Dbl.CreateTablePanel.superclass.constructor.call(this, {
		id: (data.create_table) ? ('create_table_panel') : ('alter_table_panel'),
       	title: (data.create_table) ? ("Create Table") : ("Alter table '" + Dbl.UserActivity.getValue('table') + "' in " + "'" + Dbl.UserActivity.getValue('table') + "'"),
       	tabTip: "Create table in '" + Dbl.UserActivity.getValue('database') + "'",
       	layout: 'fit',
		split: true,
		border: false,
		closable: data.create_table ? true : false,
		header: data.create_table ? true : false,
		tbar: add_tbar ? this.buildTopToolbar(grid, data.create_table, data.alter_table) : '',
		items: [grid, ddlPanel],
		listeners: {
       		beforeclose: this.cancelConfirm.createCallback(data.create_table,  data.alter_table)
       	}
	});
};

Ext.extend(Dbl.CreateTablePanel, Ext.Panel, {
	activateTab: function(grid, create, alter) {
		grid.stopEditing (false);
		var sql = "";
		if(create) {
			sql = grid.getCreateSQL();
		} else if(alter) {
			sql = grid.getAlterSQL(grid.table);
		}

		var ddlPanel = {
				id: 'preview_sql_codemirror_panel',
				xtype: 'uxCodeMirrorPanel',
				parser: 'sql',
				padding: '2',
				border: false,
				autoScroll: true,
				sourceCode: sql,
		        codeMirror: {
	                height: '100%',
	                width: '100%',
	                lineNumbers: false,
	                readOnly: true
	            }
			};
		if(create) {
			var activePanel = Dblite.dataPanel.get('create_table_panel').get('preview_create_sql');
			activePanel.removeAll(); 
			activePanel.add(ddlPanel);
			activePanel.doLayout();
		} else if(alter) {
			var activePanel = Ext.getCmp('column_info').get('alter_table_panel').get('preview_alter_sql');
			activePanel.removeAll(); 
			activePanel.add(ddlPanel);
			activePanel.doLayout();
		}
	},
	
	  buildTopToolbar : function(grid, create, alter) {
	    var createBtn = {
				text:'Create',
				id: 'create_table_btn',
				tooltip: 'Create new table',
				iconCls: 'create_table',
				width: 60,
				handler: grid.validateDefinitionAndCreateTable,
				scope: grid
	    };
	    
	    var alterBtn = {
				text:'Alter',
				tooltip: 'Alter table',
				iconCls: 'alter_table_column',
				width: 60,
				handler: grid.validateDefinitionAndAlterTable,
				scope: grid
	    } ;
	    
	    var firstBtn = (create) ? createBtn : alterBtn;

	    var buttons =  [{
	    		xtype: 'buttongroup',
	    		disabled: alter ? true : false,
	    		items: [firstBtn, {
				    text:'Cancel',
				    tooltip: (create) ? 'Cancel table creation' : 'Cancel changes',
				    iconCls: 'cancel_table_create',
				    width: 60,
				    handler: this.cancelConfirm.createCallback(create, alter),
				    scope: this
		    	}]
	    	}, '-', {
	    		xtype: 'buttongroup',
	    		disabled: false,
	    		items: [{
				    text:'Add',
				    tooltip: 'Add new column',
				    iconCls: 'add_table_column',
				    width: 60,
				    handler: grid.addField,
				    scope: grid
		      },  {
					text:'Drop',
					tooltip: 'Drop selected columns(s)',
					iconCls: 'remove_table_column',
					width: 60,
					handler: grid.removeFieldConfirm,
					scope: grid
		      }]
	    	}, '-',{
	    		xtype: 'buttongroup',
	    		items: [{
					text:'Refresh',
					tooltip: 'Refresh',
					iconCls: 'refresh_table_column',
					width: 60,
					handler: this.refreshStore,
					scope: this
		      }]
	    	}, '-', {
	    	  width: 60,
	    	  disabled: true,
	    	  hidden: true
	      }, {
	    	  xtype: 'buttongroup',
	    	  items: [{
				    text:'Preview SQL',
				    tooltip: 'Preview SQL',
				    iconCls: 'preview_sql',
				    iconAlign: 'left',
				    handler: this.previewSQL.createCallback(create, alter),
				    scope: this
		      }, {
				    text:'Close Preview',
				    tooltip: 'Close SQL preview',
				    iconCls: 'cancel_preview_sql',
				    iconAlign: 'left',
				    handler: this.closePreviewSQL.createCallback(create, alter),
				    scope: this,
				    hidden: true
		      }]
	      }];
	    
	    if(create) {
	    	buttons.splice(3, 2);
	    }
	    return buttons;
	},
	
   previewSQL: function(create, alter) {
	   if(create) {
		   var panel = Dblite.dataPanel.get('create_table_panel');
	   } else if(alter) {
		   var panel = Ext.getCmp('column_info').get('alter_table_panel');
	   }

	   var btnWidth = (alter) ? 221 : 136;	   
	   var toolbar = panel.getTopToolbar();

	   if(create) {
		   toolbar.get(4).setWidth(btnWidth);
		   toolbar.get(4).show();
		   toolbar.get(2).hide();
		   toolbar.get(3).hide();
		   toolbar.get(5).get(0).hide();
		   toolbar.get(5).get(1).show();
		   panel.get('create_table_grid').hide();
		   panel.get('preview_create_sql').show();
	   } else if(alter) {
		   toolbar.get(6).setWidth(btnWidth);
		   toolbar.get(6).show();
		   toolbar.get(2).hide();
		   toolbar.get(3).hide();
		   toolbar.get(4).hide();
		   toolbar.get(5).hide();
		   toolbar.get(7).get(0).hide();
		   toolbar.get(7).get(1).show();
		   panel.get('alter_table_grid').hide();
		   panel.get('preview_alter_sql').show();
	   }
	   toolbar.doLayout();
   },
	   
   closePreviewSQL: function(create, alter) {
	   if(create) {
		   Ext.getCmp('create_table_panel').closeCreateSQLPreview();
	   } else if(alter) {
		   Ext.getCmp('alter_table_panel').closeAlterSQLPreview();
	   }
   },
   
   closeCreateSQLPreview: function() {
	   var panel = Dblite.dataPanel.get('create_table_panel');
	   panel.get('create_table_grid').show();
	   var toolbar = panel.getTopToolbar();
	   toolbar.get(2).show();
	   toolbar.get(3).show();
	   toolbar.get(4).hide();
	   toolbar.get(5).get(0).show();
	   toolbar.get(5).get(1).hide();
   },
   
   closeAlterSQLPreview: function() {
	   var panel = Ext.getCmp('column_info').get('alter_table_panel');
	   panel.get('alter_table_grid').show();
	   var toolbar = panel.getTopToolbar();
	   toolbar.get(2).show();
	   toolbar.get(3).show();
	   toolbar.get(4).show();
	   toolbar.get(5).show();
	   toolbar.get(6).hide();
	   toolbar.get(7).get(0).show();
	   toolbar.get(7).get(1).hide();
   },
   
   cancelConfirm: function(create, alter) {
       var cancelStr = create ? "quit" : "cancel";
	   Ext.Msg.confirm('Confirmation', 
		 Messages.getMsg('cancel_create_table', [cancelStr]),	   
       	 function(btn){
		         if(btn == 'yes'){
		        	 if(create) {
			        	 Dblite.dataPanel.remove('create_table_panel');
		        	 } else {
		        		 Ext.getCmp('alter_table_panel').refreshStore();
		        	 }
		         }
	         });
	   return false;
	},
	
	refreshStore: function() {
		Server.sendCommand('get_table_creation_info', {
			  parent_database: Explorer.selectedDatabase,
			  table: Explorer.selectedDatabase + '.' + Explorer.selectedTable,
			  scope: this
		    },
			function(data) {
			  if(data.success) {
				  data.create_table = false;
				  data.alter_table = true;
				  var store = Ext.getCmp('alter_table_grid').getStore();
				  store.removeAll();
				  store.loadData(data.rows);
				  Ext.getCmp('alter_table_panel').getTopToolbar().get(0).disable();
        		  Ext.getCmp('alter_table_panel').closePreviewSQL(false, true);
	        	  Ext.getCmp('alter_table_grid').reset();
			  }
	    	  else if(!data.success) {
	    		   Dbl.Utils.showErrorMsg(data.msg, '');
		      }
		    }, function(data){
				var errorMsg = data.msg ? data.msg : data;
				Dbl.Utils.showErrorMsg(errorMsg, '');
		    });
	}
});
