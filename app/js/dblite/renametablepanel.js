/**
 * @constructor
 */
var RenameTablePanel = function(nodeid, table) {
	var items = [{
				fieldLabel : 'New table name',
				name : 'rename',
				value: table
			 }, {
				name : 'table',
				xtype: 'hidden',
				value: table
			}, {
				name : 'nodeid',
				xtype: 'hidden',
				value: nodeid
			}];

	var buttons = [{
				  text : 'rename',
				  handler : this.renameTable
			  }, {
				  text : 'cancel',
				  handler : this.cancelRenamingTable
			  }];


	RenameTablePanel.superclass.constructor.call(this, {
			bodyStyle : 'padding: 5px 5px 0',
			id : 'rename_table_form',
			frame : true,
			labelWidth : 100,
			defaultType : 'textfield',
			defaults : { width : 150 },
			items : items,
			buttons : buttons
	});
};

Ext.extend(RenameTablePanel, Ext.form.FormPanel, {
	renameTable: function() {
		var fields = Ext.getCmp('rename_table_form').getForm().getFieldValues();
		//Server.sendCommand('rename_table', {
		Database.sendCommand('rename_table', {
			table: fields.table,
			rename: fields.rename,
			database: Explorer.selectedDatabase},
			function(data) {
				if (data.success) {
					Ext.getCmp('rename_table_window').close();
		    	    var treeNode = Explorer.explorerTreePanelObj.getNodeById(fields.nodeid);
		    	    if(treeNode) {
			    	    treeNode.setText(fields.rename);
			    	    treeNode.setId(fields.rename);
		    	    }
		    	    Explorer.selectedTable = fields.rename;
				} else if (!data.success) {
					Dbl.Utils.showErrorMsg(data.msg, '');
				}
			}, function(data) {
				var errorMsg = data.msg ? data.msg : data;
				Dbl.Utils.showErrorMsg(errorMsg, '');
			});
	},
	
	cancelRenamingTable: function() {
		Ext.getCmp('rename_table_window').close();
	}
});

