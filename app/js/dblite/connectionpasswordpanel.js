/**
 * @constructor
 */
Dbl.ConnectionPasswordPanel = function(connection, database) {
	var items = [{
				  fieldLabel : 'Password for ' + connection,
				  name : 'password',
				  id: 'connpassword',
				  inputType: 'password'
			}, {
				xtype: 'hidden',
				name: 'connection',
				value: connection
			}, {
				xtype: 'hidden',
				name: 'database',
				value: database
			}];

	var buttons = [{
				  text : 'Ok',
				  handler : this.getAndSavePassword,
				  scope: this
			  }, {
				  text : 'Cancel',
				  handler : this.connectServer.createCallback(connection, database),
				  scope: this
			  }];


	Dbl.ConnectionPasswordPanel.superclass.constructor.call(this, {
			bodyStyle : 'padding: 5px 5px 0',
			id : 'connection_password_form',
			frame : true,
			border: false,
			labelWidth : 150,
			defaultType: 'textfield',
			defaults : { width : 150 },
			items : items,
			buttons : buttons
	});
};

Ext.extend(Dbl.ConnectionPasswordPanel, Ext.form.FormPanel, {
	getAndSavePassword: function() {
		var fields = Ext.getCmp('connection_password_form').getForm().getFieldValues();
		console.log(fields);
		if(fields.connection) {
			Server.sendCommand('connection.temp_save_password', {
				newConnectionId: fields.connection, 
				password: fields.password,
				scope: this}, 
				function(data) {
					this.connectServer(fields.connection, fields.database);
			});
		}
	},
	
	connectServer: function(connection, database) {
		Ext.getCmp("connection_password_window").close();
		Explorer.proceedServerChange(connection, database);
	}
});

