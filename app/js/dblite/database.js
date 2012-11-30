var Database = {
	databases: null,
	tables: [],
	columns: [],

	sendCommand: function(command, params, callback) {
		if(params.scope) {
			callback = callback.createDelegate(params.scope);
			delete params.scope;
		}
		Database[command].call(this, params, callback);
	},
	cache_explorer_data: function(params, callback) {
		var queries = ["show databases"];
		if(params.dbname) {
			if(params.dbname == "information_schema") {
				queries.push("show tables from `information_schema`");
			} else {
				queries.push("select TABLE_NAME from `information_schema`.`TABLES` where TABLE_SCHEMA = '"  + params.dbname + "' and TABLE_TYPE = 'BASE TABLE'");
			}
		} 
		
		if(params.tablename) queries.push("select COLUMN_NAME, COLUMN_TYPE, COLUMN_KEY from `information_schema`.`COLUMNS` where TABLE_SCHEMA = '" + params.dbname + "' and TABLE_NAME = '" + params.tablename + "'");
		Database.selectQueries(queries, params, function(data) {
			Database.databases = data.results[0];
			
			if(params.connectiondb) {
				var db_present = false;
				for(var i=0; i<Database.databases.length; i++){
					if(Database.databases[i][0] == params.connectiondb) {
						db_present = true;
						Database.databases = [[params.connectiondb]];
						break;
					}
				}
				
				if(!db_present) {
					Database.databases = null;
				}
			}

			if(params.dbname) {
				Database.tables[params.dbname] = data.results[1];
			}
			if(params.tablename) {
				if(!Database.columns[params.dbname]) {
					Database.columns[params.dbname] = [];
				}
				Database.columns[params.dbname][params.tablename] = data.results[2];
			}
			if(callback) callback();
		});
	},
	drop_database: function(params, callback) {
		Database.executeQuery('drop database if exists `' + params.dbname + '`', params, callback);
	},
	create_database: function(params, callback) {
		var sql = "create database `" + params.dbname + "`";
		if(params.charset) {	sql += " character set " + params.charset;	}
		if(params.collation) {		sql += " collate " + params.collation;	}
		Database.executeQuery(sql, params, callback);
	},
	get_charset_collation: function(params, callback) {
		var sqls = ["select CHARACTER_SET_NAME from `information_schema`.`CHARACTER_SETS`", "select COLLATION_NAME from `information_schema`.`COLLATIONS`"];
		Database.selectQueries(sqls, params, function(data) {
			callback({charsets: data.results[0], collations: data.results[1]});
		});
	},

	get_table_indexes: function(params, callback) {
		Database.selectQuery("select INDEX_NAME, COLUMN_NAME, IF(NON_UNIQUE>0, 0,1) as UNIQUE1, IF(STRCMP(INDEX_TYPE,'FULLTEXT'),1,0) as FULLTEXT1, SEQ_IN_INDEX  from information_schema.STATISTICS where TABLE_SCHEMA = '" + params.database + "' and TABLE_NAME = '" + params.table + "' order by INDEX_NAME, SEQ_IN_INDEX", params, callback) ;
	},
	
	get_db_tables: function(params, callback) {
		if(!params.asView && Database.tables[params.dbname]) {
			if(callback) callback({result: Database.tables[params.dbname]});
			return;
		}
		else if(params.asView) {
			params.db_tables = true;
		}
		
		if(params.dbname == 'information_schema') {
			var query = "show tables from `information_schema`";
		} else {
			var query = "select TABLE_NAME As Table_Name from `information_schema`.`TABLES` where TABLE_SCHEMA = '" + params.dbname + "' and TABLE_TYPE = 'BASE TABLE'";
		}
		
		Database.selectQuery(query, params, callback);
	},
	get_table_columns: function(params, callback) {
		if(!params.asView && Database.columns[params.dbname] && Database.columns[params.dbname][params.tablename]) {
			if(callback) callback({result: Database.columns[params.dbname][params.tablename]});
			return;
		}
		Database.selectQuery("select COLUMN_NAME, COLUMN_TYPE, COLUMN_KEY from `information_schema`.`COLUMNS` where TABLE_SCHEMA = '" + params.dbname + "' and TABLE_NAME = '" + params.tablename + "'", params, callback);
	},
	get_table_status: function(params, callback) {
		if(params.asView) {
			params.advanced_properties = true;
			params.config = {
				border: false,
				autoExpandColumn: 'values'
			};
		}

		Database.selectQuery("show table status from `" + params.database + "` like '" + params.table + "'", params, callback);
	},
	get_table_ddl: function(params, callback) {
		Database.selectQuery("show create table `" + params.database + "`.`" + params.table + "`", params, callback);
	},
	get_db_views: function(params, callback) {
		if(params.asView) {
			params.db_views = true;
		}

		Database.selectQuery("select TABLE_NAME As View_Name from `information_schema`.`TABLES` where TABLE_SCHEMA = '" + params.dbname + "' and TABLE_TYPE='VIEW'", params, callback);
	},
	get_db_procedures: function(params, callback) {
		if(params.asView) {
			params.db_procedures = true;
		}

		Database.selectQuery("select `SPECIFIC_NAME` as Procedure_Name from `INFORMATION_SCHEMA`.`ROUTINES` where `ROUTINE_SCHEMA` = '" + params.dbname + "' and ROUTINE_TYPE='PROCEDURE'", params, callback);
	},
	get_db_functions: function(params, callback) {
		if(params.asView) {
			params.db_functions = true;
		}

		Database.selectQuery("select `SPECIFIC_NAME` Function_Name from `INFORMATION_SCHEMA`.`ROUTINES` where `ROUTINE_SCHEMA` = '" + params.dbname + "' and ROUTINE_TYPE='FUNCTION'", params, callback);
	},
	get_db_full_tables: function(params, callback) {
		Database.selectQuery("show table status from `" + params.dbname + "` where engine is not NULL", params, callback);
	},
	get_server_databases: function(params, callback) {
		if(!params.asView && Database.databases) {
			if(callback) callback({result: Database.databases});
			return;
		}

		params.server_databases = true;
		Database.selectQuery("show databases", params, callback);
	},
	get_server_variables: function(params, callback) {
		if(params.asView) {
			params.server_vars = true;
			params.config = {
					border: false,
					autoExpandColumn: 'Value'
				};
		}
		Database.selectQuery("show variables", params, callback);
	},
	get_server_status: function(params, callback) {
		if(params.asView) {
			params.server_status = true;
			params.config = {
					border: false,
					autoExpandColumn: 'Value'
				};
		}
		Database.selectQuery("show status", params, callback);
	},
	get_server_processes: function(params, callback) {
		Database.selectQuery("show full processlist", params, callback);
	},
	drop_table: function(params, callback) {
		Database.executeQuery("drop table `" + params.database + "`.`" + params.table + "`", params, callback);
	},
	truncate_table: function(params, callback) {
		Database.executeQuery("truncate table `" + params.database + "`.`" + params.table + "`", params, callback);
	},
	rename_table: function(params, callback) {
		Database.executeQuery("rename table `" + params.database + "`.`" + params.table + "` to `" + params.rename + "`", params, callback);
	},
	executeQuery: function(sql, params, callback) {
		Server.sendCommand('database.execute_query', {sql: sql}, callback);
	},
	selectQuery: function(sql, params, callback) {
		if(params.asView) {
			Database.selectQueryAsView(sql, params, callback);
		}
		else {
			Server.sendCommand('database.select_query', {sql: sql}, callback);
		}
	},
	selectQueries: function(sqls, params, callback) {
		Server.sendCommand('database.select_queries', {sqls: sqls}, callback);
	},
	selectQueryAsView: function(sql, params, callback) {
		Server.sendCommand('database.select_query', {sql: sql, cols: true}, function(data) {

			if(params.server_databases && params.connectiondb) {
				for(var l=0; l<data.result.length; l++) {
					var db = data.result[l][0]
					if(db == params.connectiondb) {
						data.result = [data.result[l]];
						break;
					}
				}
			}
			
			if(params.advanced_properties) {
				data = Database.get_advanced_properties_data(data);
			}
			var fields = data.columns;
			var models = [];

			for(var i=0;i<fields.length;i++) {
				var field = fields[i];
				var header = field;

				if(params.advanced_properties) {
					header = field.substr(0,1).toUpperCase() + field.substr(1, field.length);
				} else if(params.server_vars
							|| params.server_status
								|| params.db_tables
									|| params.db_views
										|| params.db_procedures
											|| params.db_functions) {
							var hdArr = header.split('_');
							for(var j=0; j<hdArr.length; j++) {
								hdArr[j] = hdArr[j].substr(0,1).toUpperCase() + hdArr[j].substr(1, hdArr[j].length);
							}
							header = hdArr.join(' ');
				}
				var c = {
					id: field,
					header: header,
					ctype: '',
					sortable: true,
					dataIndex: field
				};
				models.push(c);
			}

			var config = params.config;
			if(!config) config  = {border: false};
			var config1 = Ext.applyIf(config, {fields: fields, models: models, data: data.result});
			var panel = new Dbl.ListViewPanel(config1);

			if(params.refreshable) {
				var parentPanel = Dbl.Utils.getAutoRefreshPanel(sql, params, callback, panel);
				if(params.autorefresh_lap) {
					parentPanel.params = params;
				}
				callback({panel: parentPanel});
				return;
			}

			callback({panel: panel});
		});

	},

	drop_view: function(params, callback) {
		Database.executeQuery('drop view `' + params.dbname + '`.`' + params.view + '`', params, callback);
	},

//	rename_view: function(params, callback) {
//		var view_def = Database.get_view_definition(params.dbname, params.oldview);
//	},

//	get_view_definition: function(db, view) {
//		Database.selectQuery("select VIEW_DEFINITION from `information_schema`.`VIEWS` where TABLE_SCHEMA = '" + db + "' and TABLE_NAME = '" + view + "'", {}, function(data){
//			var view_def = '';
//			for(var i=0; i<data.result.length; i++) {
//				var result = data.result[0];
//				view_def = result[0];
//			}
//			return view_def;
//		});
//	},

	drop_procedure: function(params, callback) {
		Database.executeQuery('drop procedure `' + params.dbname + '`.`' + params.procedurename + '`', params, callback);
	},

	drop_function: function(params, callback) {
		Database.executeQuery('drop function `' + params.dbname + '`.`' + params.functionname + '`', params, callback);
	},

	get_advanced_properties_data: function(data) {
		var properties = data.columns;
		var values = data.result[0];
		data.columns = ['properties', 'values'];
		data.result = [];
		for(var i=0; i<properties.length; i++) {
			var row = [properties[i], values[i]];
			data.result.push(row);
		}

		return data;
	}
};
