var Server = {

	connection_id : '',
	connection_database: '',
	command_count: 1,
	commands: {},
	responseXhr: null,

	serverChanged: function(connection_id, connection_db) {
		Server.responseXhr = null;
		Server.connection_id = connection_id;
		Server.connection_database = connection_db;

		if(!Server.restoring) {
		  Dbl.UserActivity.explorerPanel.newConnectionSelected(connection_id, connection_db);
		}
		if(!connection_id || connection_id.length <= 0) {
			return;
		}
//		var cmp = Ext.getCmp('serverstructure');
//		if(cmp) cmp.setTitle("Conn: " + connection_id);
		Dbl.Utils.setDatapanelTabsTitle();
        if(Dblite.dataPanel) Dblite.dataPanel.refresh(true);
	},
	sendCommand : function(command, params, success, error) {
		var command_id = Server.command_count++;
		Server.commands[command_id] = {command: command, success: success, error: error, params: params};
		if(0) {
			$.post("command.php", {id: command_id, command: command, params: $.param(params)});
			Server.receiveResponse();
		}else {
			var conn = new Ext.data.Connection();
			if(Dbl.UserActivity.getValue('database') && !params.testConnection && !params.noautodb) {
				params.database = Dbl.UserActivity.getValue('database');
			}
			params.connection_id = (params.connection_id)? params.connection_id : Server.connection_id;
			var scope = this;
			if(params.scope) {
				scope = params.scope;
				delete params.scope;
			}
			var params = {connection_id: Server.connection_id, id: command_id, command: command, params: Ext.encode(params)};

			conn.request({
				url: MAIN_URL + '/cmd.php',
				method: 'POST',
				params: params,
				scope: scope,
				success: Server.handleResponseData});
			//$.post("command2.php", {connection_id: Server.connection_id, id: command_id, command: command, params: $.param(params)}, Server.handleResponseData);
		}
	},

	handleResponseData: function(xhr, options) {
		var data = xhr.responseText;
		var obj = JSON && JSON.parse(data) || $.parseJSON(data)
		var command = Server.commands[obj.id];
		if(command.success && obj.data.success) {
			if(Dblite.historytab) {
				Dbl.Utils.pushDataToHistory(obj.data.history_data);
			}
			if(options.scope) {
				var a = command.success.createDelegate(options.scope);
				a(obj.data.data);
			}
			else {
				command.success(obj.data.data);
			}
		}
		else if(command.error) {
			if(options.scope) {
				var a = command.error.createDelegate(options.scope);
				a(obj.data.msg);
			}
			else {
				command.error(obj.data.msg);
			}
		}
		else {
			//alert(obj.data.msg);
			Dbl.Utils.showErrorMsg(obj.data.msg, '');
		}
	},
	receiveResponse : function() {
		if(Server.responseXhr) return; // the response is still active
		$.ajax({
			method: 'post',
			cache : false,
			url: "response.php",
			data: {connection_id :  Server.connection_id},
			beforeSend: function(xhr) {
				xhr.onreadystatechange = function() {
					var response = xhr.responseText;
					if (xhr.readyState == 3 ) {
						var point = response.lastIndexOf('--++--') + 6;
						var data = response.substring(point);
						Server.handleResponseData(data);
					}
					if (xhr.readyState == 4) {
						Server.responseXhr = null;
						Server.receiveResponse();
						return;
					}
				};
				Server.responseXhr = xhr;
			}
		});
	}
};
//Server.receiveResponse();
