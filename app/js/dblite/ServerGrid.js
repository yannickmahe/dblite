
Dbl.ServerGrid = function() {
	var grid = this;
	this.store = Dblite.connectionStore;
	this.columns = [
		        { header: 'Connection', id: 'connection_id', sortable: true},
		        { header: 'Type', hidden: true},
		        { header: 'Host', hidden: true},
		        { header: 'User', hidden: true},
		        { header: 'Database',hidden: true},
		        { header: 'Port', hidden: true},
		        { header: 'Password', hidden: true},
		        { header: 'savePassword', hidden: true}
		     ];
	this.sm = new Ext.grid.RowSelectionModel({
	                singleSelect: true,
	                listeners: {
						beforerowselect: function(sm, row, keep, record) {
							var currentRecord = grid.getSelectionModel().getSelected();
							if(currentRecord && currentRecord.data.untitled) {
								Ext.getCmp('server-form').showSaveConnectionMsg(
									Messages.getMsg('save_connection', [currentRecord.data.connection_id]), 
									'Save', 'Cancel', 
									function(){
										Dbl.Utils.showInfoMsg(Messages.getMsg('connection_save_success'), 'add-server-win');
									},
									function(){
						                grid.store.remove(currentRecord);
						                Ext.getCmp('server-form').getForm().reset();
						                Ext.getCmp('server-panel').setTitle('Add New Connection');
						                grid.getSelectionModel().selectRow(row);
									}
								);
								return false;
							}
						},
	                    rowselect: function(sm, row, record) {
							Ext.getCmp('server-panel').setTitle('Edit Connection');
	                        Ext.getCmp('server-panel').removeAll();
	                        Ext.getCmp('server-panel').add(new Dbl.ServerAddForm(record, 'edit'));
	                        Ext.getCmp('server-panel').doLayout();
	                        Ext.getCmp('server-form').getForm().loadRecord(record);
	                        Ext.getCmp('server-connection-grid').updateButtonsStatus();

	                        if(Explorer.windowType == 'add') {
	                        	Ext.getCmp('server-form').handleChangePassword();
	                        }
	                        else {
	                        	Ext.getCmp('server-form').cancelChangePassword();
	                        }
	                    }
	                }
    });
	
	Dbl.ServerGrid.superclass.constructor.call(this, {
		id: 'server-connection-grid',
		autoExpandColumn: 'connection_id',
		viewConfig : {scrollOffset: 2},
		listeners: {
			rowdblclick: this.handleRowDobleClick,
			scope: this
		}
	});
};


Ext.extend (Dbl.ServerGrid, Ext.grid.GridPanel, {
	handleRowDobleClick: function(grid, rowIndex, e) {
		this.connectTo();
	},
	
	connectTo: function() {
		if(this.isUnsavedRecord()) {
			return false;
		}

		var record = this.getSelectionModel().getSelected();
		console.log(record.data);
		Explorer.connectionChanged(record.data.connection_id, record.data.database);
		Ext.getCmp("add-server-win").hide();
		
		Ext.getCmp("server-panel").setTitle("Add New Connection");
		Ext.getCmp("server-form").getForm().reset();
		Dblite.refreshServerList();
	},

	isUnsavedRecord: function() {
		var record = this.getSelectionModel().getSelected();
		if(!record){
			return false;
		}
		
		if(record.data.untitled) {
			return true;
		}
		
		return false;
	},

	// disable the buttons(connect, save, delete and test) and form, if there is no connection
	updateButtonsStatus: function() {
		var grid = Ext.getCmp('server-connection-grid');
		var form = Ext.getCmp('server-form');
		var win = Ext.getCmp('add-server-win');
		var getCount = grid.store.getCount();
		
		if(getCount < 1) {
			win.connectButton.disable();
			win.saveButton.disable();
			win.delButton.disable();
			Ext.getCmp('test_btn_grp').get('test_btn').disable();
			form.getForm().reset();
	  	    form.disable();
		}else {
			win.connectButton.enable();
			win.saveButton.enable();
			win.delButton.enable();
			Ext.getCmp('test_btn_grp').get('test_btn').enable();
			form.enable();
		  	grid.doLayout();
		}
	},

	// selecting the saved row after saving the connection
	selectSavedRow: function() {
		var form = Ext.getCmp('server-form').getForm();
		var fields = form.getFieldValues();
		var grid = Ext.getCmp('server-connection-grid');
		var store = grid.store;
		store.each(function(rs) {
			if(rs.data.connection_id == fields.connection_id) {
				grid.getSelectionModel().selectRecords([rs]);
			}
		});
	}
});

