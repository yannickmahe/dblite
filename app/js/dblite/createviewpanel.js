/**
 * @constructor
 */
Dbl.CreateViewPanel = function(actionType) {
	var items = [{
				fieldLabel : "New view name",
				name : "viewname",
				allowBlank: false,
				xtype: 'textfield',
				vtype: 'alphanum',
				emptyText: (actionType == 'RENAME') ? Explorer.selectedView : ''
					
			 }, {
				name : "database",
				xtype: 'hidden',
				value: Explorer.selectedDatabase
			}];

	var buttons = [{
				  text : (actionType == 'CREATE') ? "create" : 'rename',
				  handler : this.getViewName.createDelegate(this, [actionType])
			  }, {
				  text : "cancel",
				  handler : this.cancelCreateView,
				  scope: this
			  }];


	Dbl.CreateViewPanel.superclass.constructor.call(this, {
			bodyStyle : 'padding: 5px 5px 0',
			id : 'create_view_form',
			frame : true,
			labelWidth : 100,
			defaults : { width : 150 },
			items : items,
			buttons : buttons
	});
};

Ext.extend(Dbl.CreateViewPanel, Ext.form.FormPanel, {
	getViewName: function(actionType) {
		var fields = Ext.getCmp('create_view_form').getForm().getFieldValues();
		var view_name = fields.viewname;
		var current_db = fields.database;
		if(view_name && current_db) {
			if(actionType == 'CREATE') {
				var view_sql = this.getViewSQL(view_name, current_db);
		    	this.addCreateViewEditor(view_name, view_sql);
			} else if(actionType == 'RENAME') {
				this.renameView(view_name, current_db);
			}
		}

	},
	
	getViewSQL: function(view_name, current_db) {
		var drop_view = "DROP VIEW IF EXISTS `" + current_db + "`.`" + view_name + "`;";
		var create_view = "CREATE \n" +
						    '/*[ALGORITHM = {UNDEFINED | MERGE | TEMPTABLE}] \n [DEFINER = { user | CURRENT_USER }] \n [SQL SECURITY { DEFINER | INVOKER }]*/ \n' + 
							"VIEW `" + current_db + "`.`" + view_name + "`  \n" +
							"AS " + "(SELECT * FROM ...); \n";
		
		return drop_view + '\n\n' + create_view;
	},
	
	addCreateViewEditor: function(view_name, view_sql) {
		Editor.browserPanel.selectedQueryFolder = '';
		Editor.browserPanel.selectedQueryFile = '';
		Editor.addEditor(view_sql, true);
		var editor = Editor.tabPanel.getActiveTab();
		editor.editortype = 'view_editor';
    	this.cancelCreateView();
	},
	
	renameView: function(view_name, current_db) {
    	 Database.sendCommand('rename_view', {dbname: current_db, newview: view_name, oldview: Explorer.selectedView}, function(data) {
 	    	this.cancelCreateView();
    	    var treeNode = Explorer.explorerTreePanelObj.getNodeById(Explorer.selectedViewNodeId);
    	    treeNode.setText(view_name);
    	    Explorer.selectedView = view_name;
    	 });
	},
	
	cancelCreateView: function() {
		Ext.getCmp("create_view_window").close();
	}

});

