// Utils JS file to define all common objects


Dbl.Utils = {

	showTBDMsg: function(){
		Ext.MessageBox.show( {
			title : 'Message',
			msg : Messages.getMsg('tbd_msg'),
			buttons : Ext.Msg.OK,
			animEl: document.body,
			icon : Ext.MessageBox.INFO
		});
	},
	
	showErrorMsg: function(msg, animel){
		Ext.MessageBox.show( {
			title : 'Error',
			msg : msg,
			buttons : Ext.Msg.OK,
			//animEl: (animel) ? animel : document.body,
			animEl: document.body,
			icon : Ext.MessageBox.ERROR
		});
	},
	
	showInfoMsg: function(msg, animel){
		Ext.MessageBox.show( {
			title : 'Success',
			msg : msg,
			buttons : Ext.Msg.OK,
			//animEl: (animel) ? animel : document.body,
			animEl: document.body,
			icon : Ext.MessageBox.INFO
		});
	},
	
	showLoadMask: function() {
		if(Dblite.loadMask) {
			Dblite.loadMask.show();
		}
	},
	
	hideLoadMask: function() {
		if(Dblite.loadMask) {
			Dblite.loadMask.hide();
		}
	},
	
	showWaitMask: function() {
		if(Dblite.waitMask) {
			Dblite.waitMask.show();
		}
	},
	
	hideWaitMask: function() {
		if(Dblite.waitMask) {
			Dblite.waitMask.hide();
		}
	},
	
	loadExportDataOptions: function() {
		return {
			xtype: 'fieldset',
			title: 'Export only',
			style: {
				marginTop: "11px"
			},
			items: [{
						xtype: 'radiogroup',
						id: 'export_group',
						columns: 1,
						defaults: {
							anchor: '100%'
						},
						items: [{
									name: 'export_data',
									boxLabel: 'Structure',
									inputValue: 'structure',
									style: {
										marginRight: '4px'
									}
								},
								{
									name: 'export_data',
									boxLabel: 'Data',
									inputValue: 'data',
									style: {
										marginRight: '4px'
									}
								},
								{
									name: 'export_data',
									boxLabel: 'both',
									inputValue: 'both',
									style: {
										marginRight: '4px'
									},
									checked: true
								}
						]
					}	
					]
			};
		
	},
	
	executeRow: function() {
		Topmenu.disableExecuteButton();
		var row = Ext.getCmp('history_grid').getSelectionModel().getSelected();
		var query = row.data.query;
		Editor.executeQuery(query);
	},
	
	pushDataToHistory: function(history_data) {
//		if(Ext.getCmp('history_grid')) {
//			var store = Ext.getCmp('history_grid').getStore();
//			store.insert(0, history_data);
//		}
	},

	getDateFieldEditor: function(value) {
		return new Ext.form.DateField({
			format: 'Y-m-d'
		});
	},
	
	getComboBoxEditor: function(field, values) {
		return new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields: [field],
				data: values
			}),
			displayField: field,
			typeAhead: true,
			forceSelection: true,
			selectOnFocus: true,
			mode: 'local',
			triggerAction: 'all',
			name: field
		});
	},
	
	getMultiCheckComboBoxEditor: function(field, values) {
		return [{
			xtype:'multiselectfield',
			displayField: field,
			store: values
		}];
	},
	
	getPrimaryKeyDiff: function(old_keys, new_keys) {
		var temp_keys = new Array();
		var diff_keys = new Array();

		for(var i=0; i<old_keys.length; i++) {
			temp_keys.push(old_keys[i]);
		}
		
		for(var j=0; j<new_keys.length; j++) {
			var key_col = new_keys[j];
		    var index_col = temp_keys.indexOf(key_col);
			if(index_col != -1) {
				temp_keys.splice(index_col, 1); 
			}
		    else { 
		    	temp_keys.push(key_col); 
		    }
	    }
		
	    for(var k=0; k<temp_keys.length; k++) {
	    	var diff_key = temp_keys[k];
	    	diff_keys.push(diff_key);
	    }
	    
	    return diff_keys;
	},
	
//	f1: function() {
//		var activeTab = Dblite.dataPanel.getActiveTab();
//		var tabid = activeTab.getId();
//		var index = tabid.substr(11);
//		console.log(index);
//		
//		var store =Ext.getCmp('result_grid_' + index).store;
//	    var a = [];
//	    var separator = '\t';
//	    Ext.each(store.data.items, function(item) {
//	    	var s = '';
//	    	item = item.data;
//	    	for (key in item) {
//	    		s = s + item[key] + separator;
//            }
//             s = s.substr(0, s.length - 1);
//             a.push(s);
//        });
//
//	    // for IE
//		if (window.clipboardData) {
//			window.clipboardData.setData('text', a.join('\n'));
//		}
//		// for other browsers
//		else {
//			return (a.join('\n'));
//		}
//	},
	
	getAutoRefreshPanel: function(sql, params, callback, panel) {
		var refreshBtn = {
					xtype: 'tbbutton',
					text:'Refresh',
					tooltip: 'Refresh',
					iconCls: 'refresh_info_btn',
					width: 75,
					handler: function() {
						Database.selectQueryAsView(sql, params, callback);
					}
				};
		
		var autoRefreshBtn = {
				text:'Auto Refresh',
				tooltip: 'Auto Refresh',
				iconCls: 'refresh_info_btn',
				width: 75,
				menu: {
		        	xtype: 'menu',
		        	plain: true,
		        	items: [{
		        		xtype: 'form',
		        		labelWidth: 75, 
		        		frame: true,
		        		header: false,
		        		border: false,
		        		width: 200,
		        		defaults: {width: 98},
		        		defaultType: 'textfield',
		        		items: [{
			            	//xtype: 'spinnerfield',
			            	fieldLabel: 'Interval(sec)',
			            	name: 'second',
			            	minValue: 1,
			            	maxValue: 86400,
			            	value: params.autorefresh_lap ? params.autorefresh_lap : 10
		        		}],
		        		buttons: [{
		        			text: 'Start',
		        			tooltip: 'Start auto refresh',
		        			width: 75,
		        			handler: function() {
		        				var toolbar = Dbl.Utils.getAutoRefreshToolbar();
		        				var form = toolbar.items.get(0).items.get(1).menu.items.get(0);
								var fields = form.getForm().getFieldValues();
								if(fields.second < 1 || fields.second > 86400) {
									return false;
								}
				        		toolbar.items.get(0).items.get(1).menu.hide();
				        		toolbar.items.get(0).disable();
				        		toolbar.items.get(1).show();
				        		toolbar.items.get(2).show();
				        		params.autorefresh_lap = fields.second;
				        		Dbl.Utils.startTaskRunner(fields.second, sql, params, callback, 'OTHERS');
			        	    }
			          }, {
		        			text: 'Cancel',
		        			tooltip: 'Cancel auto refresh',
		        			width: 75,
		        			handler: function() {
			        	  		var toolbar = Dbl.Utils.getAutoRefreshToolbar();
			        	  		toolbar.items.get(0).items.get(1).menu.hide();
			          		}
			          }]
		        }]
			} 
		};
		
		var stopBtn = {
                text: 'Stop',
                tooltip: 'Stop auto refresh',
                iconCls: 'stop_auto_refresh',
                handler: function() {
					params.autorefresh_lap = null;
					var toolbar = Dbl.Utils.getAutoRefreshToolbar();
					toolbar.items.get(0).enable();
					toolbar.items.get(1).hide();
	        		toolbar.items.get(2).hide();
	        		Dbl.Utils.stopTaskRunner(this.updatetask, this.updaterunner, this.delayedtask);
        		}
		};
		
		return new Ext.Panel({
	       	layout: 'fit',
			split: true,
			border: false,
			header: false,
			listeners: {
				afterrender: function() {
					Dbl.Utils.startAutoRefresh(sql, params, callback);
				},
				afterlayout: function() {
					Dbl.Utils.removeLoadingIcon();
				},
				scope: this
			},
			tbar: [{
					xtype: 'buttongroup',
					disabled: params.autorefresh_lap ? true : false,
					items: [refreshBtn, autoRefreshBtn]
				}, {
					xtype: 'tbseparator',
					hidden: !params.autorefresh_lap ? true : false,
				}, {
					xtype:'buttongroup',
					hidden: !params.autorefresh_lap ? true : false,
					items: [{
						 iconAlign: 'left',
	                	 text: params.autorefresh_lap ? 'Refresh in ' + ((params.autorefresh_lap > 9) ? params.autorefresh_lap : '0'+params.autorefresh_lap ) + ((params.autorefresh_lap == 1) ? 'second' : ' seconds') : 'Refreshing automatically',
	                	 width: 200
					}, stopBtn]
	        }],

	        items: [panel],
			sql: sql,
			params:  params,
			callback: callback
		});
	},
	
	
	
	getAutoRefreshToolbar: function() {
		var activeTab = Dbl.UserActivity.getValue('datapanelActiveTab');
		if(activeTab == 'serverstructure') {
			var activeSubTab = Dbl.UserActivity.getValue('activeConnTab');
		} else if(activeTab == 'dbstructure') {
			var activeSubTab = Dbl.UserActivity.getValue('activeDbTab');
		} else if(activeTab == 'tablestructure') {
			var activeSubTab = Dbl.UserActivity.getValue('activeTableTab');
		}
		var toolbar = Ext.getCmp(activeSubTab).items.get(0).getTopToolbar();
		
		return toolbar;
	},
	
	startTaskRunner: function(lap, sql, params, callback, type) {
		var toolbar = '';
		var statsubtn = '';
		var stopbtn = '';
		
		// get toolbar and status button
		if(type == 'TABLEDATA') {
			toolbar = Ext.getCmp('table_data_grid').getTopToolbar();
			var refreshBtns = toolbar.items.get('tabledata_refresh_btns');
			statsubtn = refreshBtns.nextSibling().nextSibling().items.get(0);
		} else if(type == 'SQLRESULT') {
			var index = params.index;
			toolbar = Ext.getCmp('result_tbar_' + index).getTopToolbar();
			var refreshBtns = toolbar.items.get('tabledata_refresh_btns_' + index);
			statsubtn = refreshBtns.nextSibling().nextSibling().items.get(0);
		}else {
			toolbar = Dbl.Utils.getAutoRefreshToolbar();
			statsubtn = toolbar.items.get(2).items.get(0);
		}
		
		// get stop button
		stopbtn = statsubtn.nextSibling();
		
		// remove loading icon
		statsubtn.setIconClass('');

		// create task
		var counter = 0;
		var task = {
		    run: function() {
				var sec = (lap-counter);
				statsubtn.setText('Refresh in '+ ((sec>9) ? sec : '0'+sec) +' second' + ((sec == 1) ? '  ' : 's'));
				counter++;
			},
		    interval: 1000 
		}
		
		// start task runner
		var runner = new Ext.util.TaskRunner();
		runner.start(task);

		// get delayed task
		if(type == 'TABLEDDL') {
			var delayedtask = new Ext.util.DelayedTask(function() {
				Ext.getCmp('table_ddl_panel').refreshDDL();
				Dbl.Utils.stopTaskRunner(task, runner, delayedtask);
				statsubtn.setText('Refreshing...');
				statsubtn.setIconClass('loading_icon');
			});
		} else if(type == 'TABLEDATA') {
			var delayedtask = new Ext.util.DelayedTask(function() {
				Ext.getCmp('table_data_grid').refreshCurrentPage();
				Dbl.Utils.stopTaskRunner(task, runner, delayedtask);
				statsubtn.setText('Refreshing...');
				//statsubtn.setIconClass('loading_icon');
			});
		} else if(type == 'SQLRESULT') {
			var delayedtask = new Ext.util.DelayedTask(function() {
				Dbl.Utils.refreshResultPage(params.index);
				Dbl.Utils.stopTaskRunner(task, runner, delayedtask);
				statsubtn.setText('Refreshing...');
				statsubtn.setIconClass('loading_icon');
			});
			
		} else {
			var delayedtask = new Ext.util.DelayedTask(function() {
				Database.selectQueryAsView(sql, params, callback);
				Dbl.Utils.stopTaskRunner(task, runner, delayedtask);
				statsubtn.setText('Refreshing...');
				statsubtn.setIconClass('loading_icon');
			});
		}
		
		// delay task for the specified time 
		delayedtask.delay(lap*1000); 
		
		stopbtn.updatetask = task;
		stopbtn.updaterunner = runner;
		stopbtn.delayedtask = delayedtask;
	},
	
	stopTaskRunner: function(task, runner, delayedtask) {
		runner.stop(task);
		delayedtask.cancel();
	},
	
	startAutoRefresh: function(sql, params, callback) {
		if(params.autorefresh_lap) {
			Dbl.Utils.startTaskRunner(params.autorefresh_lap, sql, params, callback, 'OTHERS');
		}
	},
	
	setDatapanelTabsTitle: function() {
		var servertab = Ext.getCmp('serverstructure');
		if(servertab) {
			servertab.setTitle("Conn: " + Dbl.UserActivity.getValue('connection'));
	    	Ext.fly(servertab.tabEl).child('span.x-tab-strip-text', true).qtip = 'Connection: ' + Dbl.UserActivity.getValue('connection');
		}
    	
    	var dbtab = Ext.getCmp('dbstructure');
    	if(dbtab) {
    		dbtab.setTitle('DB Structure');
        	Ext.fly(dbtab.tabEl).child('span.x-tab-strip-text', true).qtip = 'DB Structure';
    	}
    	
    	var tabletab = Ext.getCmp('tablestructure');
    	if(tabletab) {
    		tabletab.setTitle('Table Structure');
        	Ext.fly(tabletab.tabEl).child('span.x-tab-strip-text', true).qtip = 'Table Structure';
    	}

	},
	
	refreshResultPage: function(index) {
		var activeTab = Dblite.dataPanel.get('result_tab_' + index);
		Server.sendCommand('database.execute_queries', {
			sql: activeTab.sql,
			sqldelim: Editor.defaultSQLDelimiter,
			scope: this},
			function(data){	
				activeTab.removeAll();
				activeTab.add(Dbl.Utils.getResultChildPanel(data[0], index));
				activeTab.doLayout();
				Dbl.Utils.startTaskRunner(activeTab.autorefresh_lap, '', {index: index}, '', 'SQLRESULT');
			}, function(data){
				var errorMsg = data.msg ? data.msg : data;
				DbliteUtils.showErrorMsg(errorMsg, '');
			});
	},
	
	getResultChildPanel: function(result, index) {
		var panel = {};
		if(result.hasError) {
			panel = {
				border: false,
				html: result.msg,
				bodyStyle: 'padding: 5px'
			};
		} 
		else if(result.isSelectSQL) {
			panel = new Dbl.ResultGridPanel(result, index);
		}
		else if(!result.isSelectSQL) {
			panel = { 
				border: false,
				html: result.execution_status,
				bodyStyle: 'padding: 5px'
			};
		}
		return panel;	
	},
	
	getDatapanelSubTab: function() {
		var activeTab = Dbl.UserActivity.getValue('datapanelActiveTab');
		if(activeTab == 'serverstructure') {
			var activeSubTab = Dbl.UserActivity.getValue('activeConnTab');
		} else if(activeTab == 'dbstructure') {
			var activeSubTab = Dbl.UserActivity.getValue('activeDbTab');
		} else if(activeTab == 'tablestructure') {
			var activeSubTab = Dbl.UserActivity.getValue('activeTableTab');
		}
		return Ext.getCmp(activeSubTab);
	},

	addLoadingIcon: function() {
		var tab = Dbl.Utils.getDatapanelSubTab();
		try {
			if(tab.ownerCt){
				var length = tab.ownerCt.items.getCount();
				for(var i=0; i<length; i++) {
					tab.ownerCt.items.itemAt(i).setIconClass(' ');
				}
	        }
			tab.setTitle(tab.title, 'loading_icon');
		} catch(e) { }
		
	},
	
	removeLoadingIcon: function() {
		var tab = Dbl.Utils.getDatapanelSubTab();
		try {
			tab.setIconClass(' ');
		} catch(e){}
	},
	
	checkForDemoVersion: function() {
		var host = window.location.host;
		var position = host.indexOf("demo.dblite.com");
		if(position > -1) {
			return true;
		}
		return false;
	},
	
	checkForUserVersion: function() {
		var host = window.location.host;
		var position = host.indexOf("user.dblite.com");
		if(position > -1) {
			return true;
		}
		return false;
	},
	
    checkForRestrictedCommands: function(sqlstr) {
		var pattern=/(create|update|delete|drop|set|alter|insert|load|truncate|rename)\s+/gi;
		var ismatch = sqlstr.match(pattern);
		if(ismatch) {
			return true;
		}
		
		return false;
	},	
	
	showFeatureRestrictionMessage: function() {
		Ext.MessageBox.show( {
			title : 'Message',
			msg : "This feature is not available in demo version. <br /> Please <a href='http://dblite.com/download' target='_blank'>download</a> the full version or <a href='http://user.dblite.com' target='_blank'>register</a> with us.",
			buttons : Ext.Msg.OK,
			animEl: document.body,
			icon : Ext.MessageBox.INFO
		});
	},
	
	password: function(length, special) {
		  var iteration = 0;
		  var password = "";
		  var randomNumber;
		  if(special == undefined){
		      var special = false;
		  }
		  while(iteration < length){
		    randomNumber = (Math.floor((Math.random() * 100)) % 94) + 33;
		    if(!special){
		      if ((randomNumber >=33) && (randomNumber <=47)) { continue; }
		      if ((randomNumber >=58) && (randomNumber <=64)) { continue; }
		      if ((randomNumber >=91) && (randomNumber <=96)) { continue; }
		      if ((randomNumber >=123) && (randomNumber <=126)) { continue; }
		    }
		    iteration++;
		    password += String.fromCharCode(randomNumber);
		  }
		  return password;
	}

};
