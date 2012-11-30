/**
 * @constructor
 */
var TableNamePanel = function(grid) {
	var items = [{
		fieldLabel: 'Enter table name',
		name: 'tablename',
		//value: 'NewTable',
		emptyText: 'NewTable',
		allowBlank : false,
	}];

	var buttons = [{
			text: 'Create',
			id: 'get_tablename_btn',
			handler: this.getName.createCallback(grid)
		  }, {
			text: 'Cancel',
			handler: this.closeWindow
		  }];
	
	var formPanel = this;
	TableNamePanel.superclass.constructor.call(this, {
		bodyStyle : 'padding: 5px 5px 0',
		id : 'get_table_name_form',
		frame : true,
		labelWidth : 100,
		defaultType : 'textfield',
		items : items,
		buttons : buttons,
	    defaults : {
	        width : 150,
	        listeners : {
	          specialkey : function(field, e) {
	            if(e.getKey() == e.ENTER) {
	            	formPanel.getName(grid);
	            }
	          }
	       }
	   },
	});
};

Ext.extend(TableNamePanel, Ext.FormPanel, {
	closeWindow: function() {
		Ext.getCmp('get_table_name_window').close();
	},
	
	getName: function(grid) {
		var fields = Ext.getCmp('get_table_name_form').getForm().getFieldValues();
		if(fields.tablename) {
			grid.createTable(fields.tablename);
		}
	}
});

