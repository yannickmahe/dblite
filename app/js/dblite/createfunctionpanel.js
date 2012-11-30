/**
 * @constructor
 */
Dbl.CreateFunctionPanel = function(actionType) {
	var items = [{
					fieldLabel : 'New function name',
					name : 'functionname',
					allowBlank: false,
					xtype: 'textfield',
					vtype: 'alphanum'
				 }, {
					name : 'database',
					xtype: 'hidden',
					value: Explorer.selectedDatabase
				}];

	var buttons = [{
				  text : 'create',
				  handler : this.getFunctionName,
				  scope: this
			  }, {
				  text : 'cancel',
				  handler : this.cancelCreateFunction,
				  scope: this
			  }];


	Dbl.CreateFunctionPanel.superclass.constructor.call(this, {
			bodyStyle : 'padding: 5px 5px 0',
			id : 'create_function_form',
			frame : true,
			labelWidth : 120,
			defaults : { width : 150 },
			items : items,
			buttons : buttons
	});
};

Ext.extend(Dbl.CreateFunctionPanel, Ext.form.FormPanel, {
	getFunctionName: function() {
		var fields = Ext.getCmp('create_function_form').getForm().getFieldValues();
		var function_name = fields.functionname;
		var current_db = fields.database;
		if(function_name && current_db) {
			var function_sql = this.getFunctionSQL(function_name, current_db);
		    this.addCreateFunctionEditor(function_name, function_sql);
		}
	},
	
	getFunctionSQL: function(function_name, current_db) {
		var drop_function = "DROP FUNCTION IF EXISTS `" + current_db + "`.`" + function_name + "`" + Editor.defaultSQLDelimiter + "\n\n";
	    var create_function = "CREATE FUNCTION `" + current_db + "`.`" + function_name + "`() \n" +
	    						"RETURNS type \n" +
	    						"/*LANGUAGE SQL \n" + "| [NOT] DETERMINISTIC \n" + "| { CONTAINS SQL | NO SQL | READS SQL DATA | MODIFIES SQL DATA } \n" + "| SQL SECURITY { DEFINER | INVOKER } \n" + "| COMMENT 'string'*/ \n";
	    var beg_end = "BEGIN\n\nEND" + Editor.defaultSQLDelimiter + "\n\n";
		
		return drop_function + create_function + beg_end;
	},
	
	addCreateFunctionEditor: function(function_name, function_sql) {
		Editor.browserPanel.selectedQueryFolder = '';
		Editor.browserPanel.selectedQueryFile = '';
		Editor.addEditor(function_sql);
		var editor = Editor.tabPanel.getActiveTab();
		editor.editortype = 'function_editor';
    	this.cancelCreateFunction();
	},
	
	cancelCreateFunction: function() {
		Ext.getCmp("create_function_window").close();
	}

});

