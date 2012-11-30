/**
 * @constructor
 */

// data from get_charset_collation service
Dbl.CreateDbPanel = function(charsets, collations) {
	var items = [{
				fieldLabel: "Enter new database name",
				name: "database_name",
				allowBlank: false,
				style: {marginBottom: "15px"}
			},
			new Ext.form.ComboBox({
				store: new Ext.data.SimpleStore({
					fields: ['charset'],
					data: charsets
				}),
				displayField: 'charset',
				typeAhead: true,
				forceSelection: true,
				selectOnFocus: true,
				mode: 'local',
				triggerAction: 'all',
				fieldLabel: 'Database charset',
				name: 'charset',
				emptyText: '[Default]'
			}),
			new Ext.form.ComboBox({
				store: new Ext.data.SimpleStore({
					fields: ['collation'],
					data: collations
				}),
				displayField: 'collation',
				fieldLabel: 'Database collation',
				typeAhead: true,
				forceSelection: true,
				selectOnFocus: true,
				mode: 'local',
				triggerAction: 'all',
				name: 'collation',
				emptyText: '[Default]'
			})
		];

	var buttons = [{
		text: "create",
		handler: this.createDatabase
	}, {
		text: "cancel",
		handler: this.cancelDBCreation
	}];

    Dbl.CreateDbPanel.superclass.constructor.call(this, {
    	id: 'database-form',
    	labelWidth: 150,
    	frame: true,
    	defaultType: 'textfield',
    	defaults: {width: 150},
    	items: items,
    	buttons: buttons
	});
};

Ext.extend(Dbl.CreateDbPanel, Ext.form.FormPanel, {
	createDatabase: function() {
		var fields = Ext.getCmp('database-form').getForm().getFieldValues();
		//Server.sendCommand('create_database', {
		Database.sendCommand('create_database', {dbname: fields.database_name, charset: fields.charset, collation: fields.collation},
//			connection_id: Server.connection_id,
//		    name: fields.database_name, 
//		    charset: fields.charset, 
//		    collation: fields.collation},
			function(data) {
		    	Ext.getCmp("create_db_window").close();
		    	Explorer.explorerPanel.removeAll();
		    	Explorer.loadExplorerData(fields.database_name);
		    });
	},
	
	cancelDBCreation: function() {
		Ext.getCmp("create_db_window").close();
	}
});

