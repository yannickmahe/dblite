/**
 * @constructor
 */
Dbl.ManageIndexPanel = function(data) {
	var grid = new Dbl.ManageIndexGridPanel(data);
	grid.reset();
	grid.primary_keys = data.primary_keys;
	grid.table_columns = data.table_columns;
	
	var panel = new Ext.Panel({
	    id: 'index_sql_panel',
		autoScroll: true,
		border: false,
		items: [],
		listeners: {
			beforeshow : this.activateTab.createCallback(grid), 
			scope: this
		}
	});

	Dbl.ManageIndexPanel.superclass.constructor.call(this, {
		id: 'manage_index_panel',
       	layout: 'fit',
		split: true,
		border: false,
		header: false,
		tbar: this.buildTopToolbar(grid),
		items: [grid, panel]
	});
};

Ext.extend(Dbl.ManageIndexPanel, Ext.Panel, {
	activateTab: function(grid, create, alter) {
		grid.stopEditing (false);
		var sql = grid.getIndexSQL();
		var codemirror = {
				id: 'index_sql_codemirror',
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
		var activePanel = Ext.getCmp('manage_index_panel').get('index_sql_panel');
			
		activePanel.removeAll(); 
		activePanel.add(codemirror);
		activePanel.doLayout();
	},	
	buildTopToolbar : function(grid) {
	    return [{
	    	xtype: 'buttongroup',
	    	disabled: true,
	    	items: [{
				text:'Apply',
				tooltip: 'Edit table indexes',
				iconCls: 'alter_table_index',
				width: 60,
				handler: grid.validateDefinitionAndAlter,
				scope: grid
		    }, {
			    text:'Cancel',
			    tooltip: 'Cancel changes',
			    iconCls: 'cancel_table_create',
			    width: 60,
			    handler: this.cancelConfirm.createCallback(),
			    scope: this
			}]
	    }, '-', {
	    	xtype: 'buttongroup',
	    	items: [{
			    text:'Add',
			    tooltip: 'Add new index',
			    iconCls: 'add_table_index',
			    width: 60,
			    handler: grid.addIndex,
			    scope: grid
			},  {
				text:'Drop',
				tooltip: 'Drop selected index(s)',
				iconCls: 'delete_table_index',
				width: 60,
				handler: grid.removeIndexConfirm,
				scope: grid
			}]
	    } , '-', {
	    	xtype: 'buttongroup',
	    	items: [{
				text:'Refresh',
				id: 'refresh_table_index',
				tooltip: 'Refresh',
				iconCls: 'refresh_table_index',
				width: 60,
				handler: this.refreshIndexes,
				scope: this
			}]
	    }, '-', {
	    	xtype: 'buttongroup',
	    	items: [{
			    text:'Preview SQL',
			    tooltip: 'Preview SQL',
			    iconCls: 'preview_sql',
			    iconAlign: 'left',
			    handler: this.previewSQL,
			    scope: this
		   }]
	   }, {
		    width: 221,
		    disabled: true,
		    hidden: true
	   }, {
	    	xtype: 'buttongroup',
	    	hidden: true,
	    	items: [{
			    text:'Close Preview',
			    tooltip: 'Close SQL preview',
			    iconCls: 'cancel_preview_sql',
			    iconAlign: 'left',
			    handler: this.cancelPreviewSQL,
			    scope: this
		  }]
	   }];
   },
   
   cancelConfirm: function() {
	   Ext.Msg.confirm('Confirmation', 
		 Messages.getMsg('cancel_create_table', ['cancel changes']),	   
       	 function(btn){
		         if(btn == 'yes'){
        		   Ext.getCmp('manage_index_panel').refreshStore();
        		   Ext.getCmp('manage_index_grid').reset();
		         }
	   });
	   return false;
	},
	
	refreshStore: function() {
		Server.sendCommand('get_min_table_indexes', {
			table:Dbl.UserActivity.getValue('database') + '.' + Dbl.UserActivity.getValue('table'),
			scope: this},
			function(data) {
			  if(data.success) {
				  var store = Ext.getCmp('manage_index_grid').getStore();
				  store.removeAll();
				  store.loadData(data.data);
				  
	    		  var toolbar = Ext.getCmp('manage_index_panel').getTopToolbar();
		    	  toolbar.get(0).disable();
				  Ext.getCmp('manage_index_panel').cancelPreviewSQL();
			  }
	    	  else if(!data.success) {
	    		   Dbl.Utils.showErrorMsg(data.msg, '');
	    	  }
		    }, function(data){
				var errorMsg = data.msg ? data.msg : data;
				Dbl.Utils.showErrorMsg(errorMsg, '');
		});
	},
	
    previewSQL: function() {
	   var toolbar = this.getTopToolbar();
	   toolbar.get(2).hide();
	   toolbar.get(3).hide();
	   toolbar.get(4).hide();
	   toolbar.get(5).hide();
	   toolbar.get(6).hide();
	   toolbar.get(7).show();
	   toolbar.get(8).show();
	   
	   this.get('manage_index_grid').hide();
	   this.get('index_sql_panel').show();
	},
	
	cancelPreviewSQL: function() {
	   var toolbar = this.getTopToolbar();
	   toolbar.get(2).show();
	   toolbar.get(3).show();
	   toolbar.get(4).show();
	   toolbar.get(5).show();
	   toolbar.get(6).show();
	   toolbar.get(7).hide();
	   toolbar.get(8).hide();
	   
	   this.get('manage_index_grid').show();
	   this.get('index_sql_panel').hide();
	},
	
	refreshIndexes: function() {
		this.refreshStore();
		Ext.getCmp('manage_index_grid').reset();
	}
});
