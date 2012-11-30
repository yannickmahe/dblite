/**
 * @constructor
 */
Dbl.CreateProcedurePanel = function(actionType) {
	var items = [{
				fieldLabel : 'New procedure name',
				name : 'procedurename',
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
				  handler : this.getProcedureName,
				  scope: this
			  }, {
				  text : 'cancel',
				  handler : this.cancelCreateProcedure,
				  scope: this
			  }];


	Dbl.CreateProcedurePanel.superclass.constructor.call(this, {
			bodyStyle : 'padding: 5px 5px 0',
			id : 'create_procedure_form',
			frame : true,
			labelWidth : 150,
			defaults : { width : 150 },
			items : items,
			buttons : buttons
	});
};

Ext.extend(Dbl.CreateProcedurePanel, Ext.form.FormPanel, {
	getProcedureName: function() {
		var fields = Ext.getCmp('create_procedure_form').getForm().getFieldValues();
		var procedure_name = fields.procedurename;
		var current_db = fields.database;
		if(procedure_name && current_db) {
				var procedure_sql = this.getProcedureSQL(procedure_name, current_db);
		    	this.addCreateProcedureEditor(procedure_name, procedure_sql);
		}
	},
	
	getProcedureSQL: function(procedure_name, current_db) {
		var drop_proc = "DROP PROCEDURE IF EXISTS `"+ current_db +"`.`" + procedure_name + "`" + Editor.defaultSQLDelimiter + "\n\n ";
		var create_proc = "CREATE PROCEDURE `" + current_db + "`.`" + procedure_name +  "`() \n" +
		                  "/*LANGUAGE SQL \n | [NOT] DETERMINISTIC \n | { CONTAINS SQL | NO SQL | READS SQL DATA | MODIFIES SQL DATA }\n | SQL SECURITY { DEFINER | INVOKER } \n | COMMENT 'string'*/ \n BEGIN\n\n END" + Editor.defaultSQLDelimiter + "\n\n";
		return drop_proc + create_proc;
	},
	
	addCreateProcedureEditor: function(procedure_name, procedure_sql) {
		Editor.browserPanel.selectedQueryFolder = '';
		Editor.browserPanel.selectedQueryFile = '';
		Editor.addEditor(procedure_sql);
		var editor = Editor.tabPanel.getActiveTab();
		editor.editortype = 'procedure_editor';
    	this.cancelCreateProcedure();
	},
	
	cancelCreateProcedure: function() {
		Ext.getCmp("create_procedure_window").close();
	}

});

