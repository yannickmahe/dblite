/**
 * @constructor
 */
Dbl.SQLDelimiterPanel = function() {
	var items = [{
				  fieldLabel : 'SQL statement delimiter',
				  name : 'sqldelimiter',
				  id: 'sqldelimiter',
				  allowBlank: false,
				  xtype: 'textfield',
				  value: Editor.defaultSQLDelimiter
				 }];

	var buttons = [{
				  text : 'Set',
				  handler : this.getDelimiter,
				  scope: this
			  }, {
				  text : 'Cancel',
				  handler : this.cancelSetDelimiter,
				  scope: this
			  }];


	Dbl.SQLDelimiterPanel.superclass.constructor.call(this, {
			bodyStyle : 'padding: 5px 5px 0',
			id : 'set_delimiter_form',
			frame : true,
			border: false,
			labelWidth : 150,
			defaults : { width : 150 },
			items : items,
			buttons : buttons
	});
};

Ext.extend(Dbl.SQLDelimiterPanel, Ext.form.FormPanel, {
	getDelimiter: function() {
		var fields = Ext.getCmp('set_delimiter_form').getForm().getFieldValues();
		if(fields.sqldelimiter) {
			Editor.defaultSQLDelimiter = fields.sqldelimiter;
			Dbl.UserActivity.editorsPanel.delimiterChanged(fields.sqldelimiter);
	     	this.cancelSetDelimiter();
		}
	},
	
	cancelSetDelimiter: function() {
		Ext.getCmp("sql_dlimiter_window").close();
	}
});

