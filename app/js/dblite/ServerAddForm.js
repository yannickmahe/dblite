Ext.override(Ext.form.Field, {
	  hideItem :function(){
	    this.getEl().up('div.x-form-item').addClass('hide');
	  },
	
	  showItem: function(){
	    this.formItem.removeClass('x-hide-' + this.hideMode);
	  },
	  
	  setFieldLabel: function(text) {
	    var ct = this.el.findParent('div.x-form-item', 3, true);
	    var label = ct.first('label.x-form-item-label');
	    label.update(text);
	  }
});


Dbl.ServerAddForm = function(record) {

	this.grid = Ext.getCmp('server-connection-grid');

    // get button panel
    var topButtonPanel = this.getTopButtonPanel();
    var bottomButtonPanel = this.getBottomButtonPanel();
    var triggerField = this.createTriggerField();
    var changePassButton = this.createChangePassButton();
    var databaseComboList = this.createDatabaseComboBox();


	this.items = [{
					fieldLabel: 'Connection' ,
					name: 'connection_id',
					id: 'conn_id',
					emptyText: 'Untitled',
					allowBlank: false,
					width: '156px'
				}, 
				new Ext.form.ComboBox({
					store: new Ext.data.SimpleStore({
						fields: ['database'],
						data: [['mysql'], ['sybase']]
					}),
					value: 'mysql',
					displayField: 'database',
					typeAhead: true,
					forceSelection: true,
					selectOnFocus: true,
					mode: 'local',
					triggerAction: 'all',
					emptyText: 'Select a database type',
					//fieldLabel: 'Type',
					hidden: true,
					name: 'type',
					allowBlank: false
				}),
				{fieldLabel: 'Host',	  name: 'host', value: 'localhost',	allowBlank: false, width: '156px'},
				{fieldLabel: 'Port',	  name: 'port', value: '3306', allowBlank: false, width: '156px'},
				{fieldLabel: 'Username', name: 'user', allowBlank: false, width: '156px'},
				triggerField,
				changePassButton,
				{
					xtype: 'checkbox',
					boxLabel: 'Save Password',
					name: 'save_password',
					checked: true
				},
				databaseComboList,
				{
					xtype: 'hidden',
					name: 'actual_connection_id',
					value: record ? record.data.connection_id : ''
				},
				this.getTestButtonPanel()
	];

	Dbl.ServerAddForm.superclass.constructor.call(this, {
	    url: 'add-server.php',
		bodyStyle:'padding: 5px;',
		frame: true,
		autoWidth: true,
		id: 'server-form',
		labelWidth: 75,
		defaultType: 'textfield'
	});
};

Ext.grid.RowSelectionModel.override ({
    getSelectedIndex : function(){
        return this.grid.store.indexOf( this.selections.itemAt(0) );
    }
});

Ext.extend (Dbl.ServerAddForm, Ext.FormPanel, {

	// create combobox of database list
	createDatabaseComboBox: function() {
		var comboBox = new Ext.form.ComboBox({
		    id: 'connection_database',
			store: Dblite.databaseComboStore,
			displayField: 'database',
			typeAhead: true,
			selectOnFocus: true,
			mode: 'local',
			triggerAction: 'all',
			emptyText: 'Select a database',
			fieldLabel: 'Database',
			name: 'database',
			listeners: {
				'focus': function() {
					var params = {};
					var record = Ext.getCmp('server-connection-grid').getSelectionModel().getSelected();
					if(record && record.data.untitled) {
						var fields = Ext.getCmp('server-form').getForm().getFieldValues();
						params.connection_name = fields.connection_id;
						params.host = fields.host;
						params.port = fields.port;
						params.user = fields.user;
						params.password = fields.password;
					} else {
						params.connection_name = record.data.connection_id;
					}
					
					Dblite.databaseComboStore.loadData('');
					Server.sendCommand('connection.get_database_list', 
						params,
						function(data) {
							var combodata = new Array();
						    for(var i=0; i<data.length; i++) {
						    	combodata.push([data[i]]);
						    }
						Dblite.databaseComboStore.loadData(combodata);
					}, function() {
						Dblite.databaseComboStore.loadData('');
					});
				}
			}
	   });
		return comboBox;
	},


	createTriggerField: function() {
	    var triggerField = new Ext.form.TriggerField({
	        fieldLabel: 'Password',
	        id: 'connection_password_trigger',
	        name: 'password',
	        inputType: 'password',
	        width: 165,
	        hideParent: true,
	        hideMode: 'display',
//	        emptyText: 'Password',
	        hideTrigger: (Explorer.windowType == 'add') ? true : false,
	        disabledClass: 'editPass-disabled',
	        triggerConfig: {tag: 'img', src: 'app/images/icons/close-16.png', cls: 'x-form-trigger ' + this.triggerClass}
	      });
//	      triggerField.onTriggerClick = function()
//	      {
//	        if(this.isDisabled)
//	          this.enable();
//	        else
//	        {
//	          this.setValue('');
//	          this.disable();
//	        }
//	      };
	      triggerField.onTriggerClick = this.cancelChangePassword;
	      triggerField.on('disable',function() {
	        this.isDisabled = true;
	      });
	      triggerField.on('enable',function() {
	        this.isDisabled = false;
	      });
	      triggerField.on('render',function() {
	        this.disable();
	      });
	      return triggerField;
	},

	createChangePassButton: function() {
	  var button = {
	      id: 'connection_password_button',
	      fieldLabel: 'Password',
	      width: '164',
	      xtype: 'button',
	      text: 'Change',
	      handler: this.handleChangePassword
    };
	  return button;
	},

	handleChangePassword: function(showTrigger) {
	  var button = Ext.getCmp('connection_password_button');
	  var trigger = Ext.getCmp('connection_password_trigger');
	  Global.hideItem(button);
	  Global.showItem(trigger);
	},

	cancelChangePassword: function() {
	  	  var button = Ext.getCmp('connection_password_button');
	      var trigger = Ext.getCmp('connection_password_trigger');
	      Global.hideItem(trigger);
	      Global.showItem(button);
	},

	hideItem: function(item) {
	  item.getEl().up('div.x-form-item').addClass('hide');
	},

	testConnection: function() {
		Dbl.Utils.showWaitMask();
		var fields = Ext.getCmp('server-form').getForm().getFieldValues();
		Server.sendCommand('connection.test_server_connection', {
			type : fields.type,
			host : fields.host,
			port : fields.port,
			user : fields.user,
			password : fields.password,
			database : fields.database,
			testConnection: 1 }, 
			function(data) {
				Dbl.Utils.hideWaitMask();
				if (data.success) {
					Dbl.Utils.showInfoMsg('Connection successful', document.body);
				} else if (!data.success) {
					var msg = data.msg ? data.msg : 'Connection failed!';
				    Dbl.Utils.showErrorMsg(msg, document.body);
				}
			}, function(data) {
				Dbl.Utils.hideWaitMask();
				var msg = data.msg ? data.msg : data;
			    Dbl.Utils.showErrorMsg(msg, document.body);
			});
	},
	newConnection: function() {
	    var win =  Ext.getCmp('add-server-win');
		win.newButton.disable();
		win.connectButton.enable();
		win.saveButton.enable();
		win.delButton.enable();
		this.handleChangePassword();
		Explorer.windowType = 'add';

//		Ext.getCmp('connection_password').enable();

		// calculate the new unique number for untitled
		var count = 0;
		var grid = this.grid;
		var store = grid.store;
		store.each(function(rs) {
			if(rs.data.connection_id != null) {
				if(rs.data.connection_id.match(/Untitled/)) {
					var arr = rs.data.connection_id.split('-');
					if(arr[1] && parseInt(arr[1]) > count) { count = parseInt(arr[1]); }
				}
			}
		});
		count++;
		var params = {
				connection_id: 'Untitled-' + count,
				type: 'mysql',
				host: 'localhost',
				user: 'root',
				database: '',
				port: '3306',
				password: '',
				save_password: true,
				untitled: true
		};
		var insertAt = store.getCount();
		var tableRow = new store.recordType(params);
		store.insert(insertAt, tableRow);

		var sm = grid.getSelectionModel();
        sm.selectRow(insertAt);
        Ext.getCmp('server-panel').setTitle('Add New Connection');
        Ext.getCmp('add-server-win').focus();
        Ext.getCmp('conn_id').focus(true);
        return;
	},


	showSaveConnectionMsg: function(msg, saveText, cancelText, savecallback, cancelcallback) {
		var grid = Ext.getCmp('server-connection-grid');

		Ext.Msg.show({
            id: 'connect_message',
            title:'Save Changes?',
            msg: msg,
            buttons: Ext.Msg.YESNO,
            buttonText: Ext.MessageBox.buttonText.yes = saveText,
            buttonText: Ext.MessageBox.buttonText.no = cancelText,
            fn: function(btn) {
                 if(btn == 'yes') {
                  	var form = Ext.getCmp('server-form');
                	form.addUpdateConnection(savecallback);
                 }
                 else{
                     if(cancelcallback){
                    	 Ext.getCmp('add-server-win').newButton.enable();
                    	 cancelcallback();
                     }
                 }
           },
            animEl: 'add-server-win',
            icon: Ext.MessageBox.QUESTION
         });
	},

	connectConnection: function(e) {
		var grid = Ext.getCmp('server-connection-grid');
		var sm = grid.getSelectionModel();
        var rec = sm.getSelected();
        var form = Ext.getCmp('server-form');
		var fields = form.getForm().getFieldValues();
		if(rec.data.untitled || (rec.data.database != fields.database)) {
			 // Show a dialog using config options:
			form.showSaveConnectionMsg(Messages.getMsg('save_and_connect'), 'Save & Connect', 'Cancel', function() {
							  Explorer.connectionChanged(fields.connection_id, fields.database);
                			  Dblite.refreshServerList();
                	          Ext.getCmp('add-server-win').hide();
                        });
        }
		else {
			 var rowIndex = grid.getSelectionModel().getSelectedIndex();
			 grid.connectTo(grid, rowIndex, e);
		}
	},

	addUpdateConnection: function(callback) {
		var grid = Ext.getCmp('server-connection-grid');
		// getting current fields of form
		var form = Ext.getCmp('server-form').getForm();
		var fields = form.getFieldValues();

		// check dirty
//		var dirty = false;
//		for(i in fields) {
//			if(fields[i] != prev_fields[i]) { dirty = true; break; }
//		}
//		if(!dirty) return;

		if(!fields.connection_id || !fields.host || !fields.port || !fields.user) {
			Dbl.Utils.showErrorMsg(Messages.getMsg('empty_form_fields'), document.body);
			return false;
		}

		Dbl.Utils.showWaitMask();
		
		var params = {saved_connection_id : fields.connection_id,
		              connection_type : fields.type,
		              connection_host : fields.host,
		              connection_port : fields.port,
		              connection_user : fields.user,
		              save_password: fields.save_password ? true : false,
		              connection_database : fields.database,
		              actual_connection_id : fields.actual_connection_id};
		if(Ext.getCmp('connection_password_trigger').isVisible && fields.save_password) {
		  params.connection_password = fields.password;
		}
		
		Server.sendCommand('connection.add_edit_server_connection', 
			params,
			function(data){
				Dbl.Utils.hideWaitMask();
				Ext.getCmp('add-server-win').newButton.enable();
			    Dblite.refreshServerList(function() {
			    	grid.selectSavedRow();
			    	if(callback) callback();
			    });

			},
			function(data){
				Dbl.Utils.hideWaitMask();
				var errorMsg = data.msg ? data.msg : data;
				Dbl.Utils.showErrorMsg(errorMsg, document.body);
			});
	},


	deleteConnection: function() {
		var grid = Ext.getCmp('server-connection-grid');
		var rec = grid.getSelectionModel().getSelected();
		if(!rec) {
			return;
		}

		Dbl.Utils.showWaitMask();
		if(rec.data.untitled) {
			Ext.getCmp('server-connection-grid').store.remove(rec);
			grid.getSelectionModel().selectFirstRow();
			grid.updateButtonsStatus();
			Dbl.Utils.showInfoMsg(Messages.getMsg('connection_delete_success'), document.body);
			Ext.getCmp('add-server-win').newButton.enable();
			Dbl.Utils.hideWaitMask();
			return;
		}
		
		var fields = Ext.getCmp('server-form').getForm().getFieldValues();
		Server.sendCommand('connection.delete_server_connection', {
			connection_id : fields.connection_id},
			function(data){
			    Dblite.refreshServerList(
		    		function(data) {
		    			grid.getSelectionModel().selectFirstRow();
		    			grid.updateButtonsStatus();
		    			Dbl.Utils.hideWaitMask();
		    			Dbl.Utils.showInfoMsg(data.msg, document.body);

		    			var record = grid.getSelectionModel().getSelected();
		    			if(!record) {
		    				Ext.getCmp('server-panel').setTitle('Add New Connection');
		    				Ext.getCmp('server-connections').setValue('');
		    				Server.serverChanged('');
		    				Explorer.reset();
		    			} else {
		    				Ext.getCmp('server-connections').setValue(record.data.connection_id);
		    				Server.serverChanged(record.data.connection_id, record.data.database);
			    			Explorer.reset();
			    			Explorer.loadExplorerData();
		    			}
		    		});
			},
			function(data){
				Dbl.Utils.hideWaitMask();
				var errorMsg = data.msg ? data.msg : data;
				Dbl.Utils.showErrorMsg(errorMsg, document.body);
			});
	},

	closeServerWindow: function(btn){
		var grid = Ext.getCmp('server-connection-grid');
		var rec   = grid.getSelectionModel().getSelected();
		if(rec && rec.data.untitled) {
			Ext.getCmp('server-form').showSaveConnectionMsg(Messages.getMsg('save_connection', [rec.data.connection_id]), 'Yes', 'No', function(){
				Ext.getCmp('add-server-win').hide();
			  },
			  function(){
	            Ext.getCmp('server-connection-grid').store.remove(rec);
	            Ext.getCmp('server-form').getForm().reset();
                Ext.getCmp('server-panel').setTitle('Add New Connection');
				Ext.getCmp('add-server-win').hide();
			  }
			);
			return false;
		}
		else {
			if(!btn) {
				return;
			} else {
				Ext.getCmp('add-server-win').hide();
			}
		}
	},

	getButtons: function() {
		return [this.getTopButtonPanel(), '->', this.getBottomButtonPanel()];
	},

	getTestButtonPanel: function() {
		return new Ext.ButtonGroup({
				layout: 'hbox',
				id: 'test_btn_grp',
				width: 250,
			    items: [{
	            	text: 'Test',
	            	id: 'test_btn',
	            	ref: '../testButton',
					width: 50,
					margins: '10 0 0 195',
	            	handler: this.testConnection,
	            	scope: this
	            }],
			    frame: false
		});
	},
	getTopButtonPanel: function(){
		return [{
			id: 'new_btn',
			text: 'New',
			ref: '../newButton',
			width: 50,
			margins: '0 10 0 0',
			handler: this.newConnection,
			scope: this
		}, {
			id: 'del_btn',
			text: 'Delete',
			ref: '../delButton',
			width: 50,
			margins: '0 10 0 0',
	        handler: this.deleteConnection,
	        scope: this
		}];
	 },


	getBottomButtonPanel: function(){
		 return buttons = [{
				         	id: 'connect_btn',
			 				text: 'Connect',
			 				width: 50,
			 				ref: '../connectButton',
			 				handler: this.connectConnection
				        }, {
				        	id: 'save_btn',
				         	text: 'Save',
				         	ref: '../saveButton',
							width: 50,
							margins: '0 10 0 0',
				        	handler: function() {
				        		Ext.getCmp('server-form').addUpdateConnection(function() {
				        			Dbl.Utils.hideWaitMask();
				    				Dbl.Utils.showInfoMsg(Messages.getMsg('connection_save_success'), 'add-server-win');
				        		});
				        	}
				        }, {
		                	text: 'Close',
		                	width: 50,
		                	id: 'cancel_btn',
		                	margins: '0 0 0 0',
		                	handler: this.closeServerWindow
		                }];
	 }
});

var Global = {
  hideItem :function(item) {
      item.getEl().up('div.x-form-item').addClass('hide');
      item.isVisible = false;
  },

  showItem: function(item){
      item.getEl().up('div.x-form-item').removeClass('hide');
      item.isVisible = true;
  }
};


