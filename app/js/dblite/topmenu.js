var Topmenu = {
   version : '_VERSION_',
   menuPanel : '',
   tbar : '',
   userControls : '',
   about_data :  '<h1>DBlite</h1>'
				+ '<p>DBlite: A web based interface to MySQL</p>'
				+ '<p>Version: 0.0.0.1</p>'
				+ '<a href="http://dblite.com" target="_blank">www.dblite.com</a>',

  init : function() {
    Topmenu.userControls = new Ext.ButtonGroup({
      xtype : 'buttongroup',
      id : 'user_controls',
      frame : false,
      items : Topmenu.getGuestControls()
    });
    Topmenu.menuPanel = this.createMenuPanel();
    Topmenu.updateUserData();
  },

  createMenuPanel: function() {
	  return new Ext.Panel({
		      region : 'north',
		      layout : 'fit',
		      border : false,
		      tbar : {
		        id : 'header_tbar',
		        style : {
		          padding : '0px'
		        },
		        items : [{
		              xtype : 'tbtext',
		              text : '',
		              cls : 'dblite_logo'
		            }, '-', {
		            	tooltip : 'About DBLite',
		            	iconCls: 'about_dblite',
		            	width: 25,
		            	handler : Topmenu.showAboutWindow
		            }, {
		            	tooltip : 'Feedback',
		            	iconCls: 'dblite_feedback',
		            	width: 25,
		            	disabled: Dblite.user ? false : true,
		            	handler :  function(btn){
		            		window.open('http://groups.google.com/group/dblite', '_newtab');
		            		//Topmenu.showFeedbackWindow
		            	}
		            }, {
		  		      xtype : 'tbseparator'
				    }, {
				    	tooltip: 'Key mappings',
		            	iconCls: 'keyboard_shortcuts',
		            	width: 25,
		            	handler : Topmenu.showKeyMappingsWindow
		            }, {
		  		      xtype : 'tbseparator'
				    }, {
		              tooltip : 'Execute query (F8)',
		              id: 'topmenu_execute_btn',
		              iconCls : 'execute_query',
		              handler : function(btn) {
				    	Topmenu.disableExecuteButton();
				    	Editor.handleExecuteQuery();
				      },
		              width : 25
		            }, {
		              tooltip : 'Save active editor (Ctrl+S)',
		              iconCls : 'query_page_save',
		              handler : Editor.saveCurrentEditor.createDelegate(Editor, [ false ]),
		              width : 25
		            }, {
		              tooltip : 'Save active editor as...',
		              iconCls : 'query_page_save_as',
		              handler : Editor.saveCurrentEditorAs.createDelegate(Editor, [ false ]),
		              width : 25
		            }, {
		              tooltip : 'Delete active editor',
		              iconCls : 'query_page_delete',
		              handler : Editor.deleteEditorConfirmation,
		              width : 25
		            }, {
		              id: 'set_delimiter_btn',
		              tooltip : 'Set delimiter for SQL execution (current value: '+ Editor.defaultSQLDelimiter +')',
		              iconCls : 'set_delimiter',
		              handler : Editor.showSQLDelimiterWindow,
		              width : 25
		            }, '->', Topmenu.userControls ]},
		      items : []
	  });
  },

  updateUserData : function(callback) {
      if(Dblite.user) {
        Topmenu.user = Dblite.user;
        Topmenu.changeUserControls(Dblite.user.user_name);
      }else if(!Dblite.guest_user) {
    	  Topmenu.showLoginWindow();
      }
  },


  getGuestControls : function() {

	return [{
		      id : 'destroy_current_session',
		      text : 'Killing Session',
		      tooltip: 'Destroy guest user session...',
		      iconCls : 'destroy_session',
		      width : 25,
		      handler : Topmenu.destroyCurrentSession,
		      scope: this,
		      hidden: (!Dblite.guest_user) ? true : false
    	}, {
    		 id: 'destroy_session_separator',
    		 xtype : 'tbseparator',
    		 hidden: (!Dblite.guest_user) ? true : false
    	}, {
		      id : 'dblite_register',
		      text : 'Register',
		      tooltip: 'User registration',
		      iconCls : 'register',
		      width : 25,
		      handler : Topmenu.showRegisterWindow,
		      scope: this
   		}, {
		      xtype : 'tbseparator'
	    }, {
		      id : 'dblite_login',
		      text : 'Login',
		      tooltip: 'User login',
		      iconCls : 'login',
		      width : 25,
		      handler : Topmenu.showLoginWindow,
		      scope: this
	    }];
  },

  getUserControls : function(username) {
    return [{
		      xtype : 'tbtext',
		      id : 'user_profile',
		      text : 'Welcome ' + username
		 }, {
		      xtype : 'tbseparator'
		 }, {
		      id : 'settings',
		      text : 'Settings',
		      iconCls : 'user_settings',
		      width: 27,
		      handler : function() {
		        this.win = Topmenu.createProfileWindow(username);
		        this.win.show();
		      }
		 }, {
		      xtype : 'tbseparator'
		 }, {
		      id : 'logout',
		      text : 'Logout',
		      iconCls : 'user_logout',
		      width: 27,
		      handler : function() {
		        Topmenu.logoutUser();
		      }
		 }];
  },

  // Change the header toolbar items
  changeUserControls : function(username) {
    Topmenu.userControls.removeAll();
    if (username) {
      Topmenu.userControls.add(Topmenu.getUserControls(username));
    } else {
      Topmenu.userControls.add(Topmenu.getGuestControls());
    }
  },

  //Shows the about window
  showAboutWindow: function() {
	 Topmenu.createAboutWindow();
  },

  /* creating a window to display 'about dblite' data
   * The data is loading as a ajax request, in case of success
   * in case of failure it will load the local data
   */
  createAboutWindow : function() {

	this.win =  new Dbl.ContextMenuWindow({
		title : 'About DBlite',
		id : 'about_window',
		width : 400,
		height : 400,
		resizable : false,
		autoScroll : true,
		layout : 'border',
		onEsc: function(){},
		modal : true,
		plain : true,
		stateful : true,
		items : [{
   		 	xtype: 'panel',
   		 	id: 'about_panel',
            region: 'center',
            frame: true,
            items: [{
		           	 xtype : 'tbtext',
			         text : '',
			         cls : 'dblite_about_logo'
	            }, {
	            	id: 'about_dblite',
	            	autoEl: {
		           	 tag: 'div',
		           	 style:'margin:10px 30px 4px 30px',
		           	 html: ''
	            	},
	            }],
            buttonAlign: 'left',
            buttons : []
   		}],
		buttons : [{
			text: 'Close',
			handler: function() {
				Ext.getCmp('about_window').close();
		    }
		}]
	  });

	var autoElem = Ext.getCmp('about_dblite');
	autoElem.autoEl.html = '<html><head></head><body>  \
		<div id="about_dblite_data">  \
			<h1>DBlite</h1> \
			<p>A light weight, fast, flexible interface to MySQL</p>  \
			<p>Current version: ' + Topmenu.version + '</p> \
			<a href="http://www.dblite.com/" target="_blank">www.dblite.com</a> \
		</div> \
	</body></html>';
	this.win.show();
	
	var script = document.createElement('script');
	script.src = '//dblite.com/about?callback=Topmenu.showAboutPage';
	document.getElementsByTagName('head')[0].appendChild(script);
 
  },

  showAboutPage: function(data) {
   Ext.fly('about_dblite').update(data.data);
 },

  // shows the Feedback window
  showFeedbackWindow: function() {
	  var form = Topmenu.createFeedbackForm();
	  this.win = new Dbl.ContextMenuWindow({
	      title : 'Feedback',
	      id : 'feedback_window',
	      width : 400,
	      height: 'auto',
	      resizable : false,
	      autoScroll : false,
	      layout : 'form',
	      modal : true,
	      plain : true,
	      stateful : true,
	      onEsc: function(){},
	      items : [form]
	  });

	  this.win.show();
  },

  // Create the feedback form
  createFeedbackForm : function() {
    var items = [
                 new Ext.form.ComboBox({
							store: new Ext.data.SimpleStore({
									fields: ['category'],
									data: [
											['Bug'],
											['Feature Request'],
											['Other']
										 ]
					        }),

							displayField: 'category',
							forceSelection: true,
							selectOnFocus: true,
							mode: 'local',
							width: 140,
							triggerAction: 'all',
							emptyText: 'Select a category',
							fieldLabel: 'Category',
							name: 'feedback_category',
							allowBlank: false
                 	}), {
		                	xtype: 'textarea',
		                	name: 'feedback_message',
		                	width: '270px',
		                	height: '100px',
		                	fieldLabel : 'Message',
		                	allowBlank: false,
		                    multiline: true
                 	}, {
			                xtype: 'fileuploadfield',
						    fieldLabel : 'File',
						    width: '278px',
						    name : 'feedback_file',
						    buttonText: 'Browse'
                 	}, {
					       fieldLabel : 'Email',
					       name : 'user_email',
					       width: '270px',
					       allowBlank : false,
					       vtype : 'email'
                 	}];

    var buttons = [{
		      id : 'feedback_form',
		      text : 'Submit',
		      handler : Topmenu.submitFeedback
	    }, {
		      text : 'Cancel',
		      handler : function() {
		        Ext.getCmp('feedback_window').close();
	    	  }
    }];

    return new Ext.FormPanel({
      bodyStyle : 'padding:5px 5px 0',
      id : 'feedback-form',
      fileUpload: true,
      frame : true,
      labelWidth : 74,
      defaultType : 'textfield',
      defaults : {
        listeners : {
          specialkey : function(field, e) {
            if (e.getKey() == e.ENTER) {
            	Topmenu.submitFeedback();
            }
          }
        }
      },
      items : items,
      buttons : buttons
    });
  },

  // Submit user feedback form
  submitFeedback : function() {
	Dbl.Utils.showWaitMask();
    Ext.getCmp('feedback-form').getForm().submit({
       clientValidation: true,
       url: 'submitfeedback.php',
       scope: this,
       success: function(fp, o) {
			Dbl.Utils.hideWaitMask();
			if(o.result.success) {
					Dbl.Utils.showInfoMsg(o.result.msg, 'feedback-form');
					o.form.reset();
				}
				else {
					Dbl.Utils.showErrorMsg(o.result.msg, 'feedback-form');
				}
		},
		failure: function(fp, o) {
			var msg = (o.failureType == 'client') ? Messages.getMsg('empty_form_fields') : 'Error while submitting form!';
			Dbl.Utils.hideWaitMask();
			Dbl.Utils.showErrorMsg(msg, 'feedback-form');
		}
   });
  },

  //Shows the key mappings window
  showKeyMappingsWindow: function() {
	  this.win = Topmenu.createKeyMappingsWindow();
	  this.win.show();
  },

  //Create a window to display keyshortcuts data
  createKeyMappingsWindow: function() {
	  	// created dummy data
	  	var shortcutData = [
								['F1', 'Application', 'Help'],
								['F3', 'Application', 'Key Maps Window'],
								['F5', 'Database Explorer', 'Refresh Database Explorer (Default)'],
								['F6', 'Table Structure', 'Manage Table Columns'],
								['F7', 'Table Structure', 'Manage Table Indexes'],
								['F8', 'SQL Editor', 'Execute Current Query (Default)'],
								[],[],
								['Ctrl+1', 'Database Explorer', 'Collapse/Expand Database Explorer'],
								['Ctrl+2', 'Result Panel', 'Show/Hide Result Panel'],
								['Ctrl+3', 'SQL Editor Panel', 'Show/Hide SQL Editor Panel'],
								['Ctrl+D', 'Database Explorer', 'Create Database'],
								['Ctrl+S', 'SQL Editor Panel', 'Save The Current SQL Editor']
	  	                    ];
	    var listView = new Ext.list.ListView({
	    	border: false,
	        store: new Ext.data.ArrayStore({
				storeId: 'myStore',
				fields: ['Shortcuts', 'Category', 'Description'],
				data: shortcutData
	        	}),

	        columns: [{
	            header: 'Shortcuts',
	            width: .15,
	            dataIndex: 'Shortcuts'
	        }, {
	            header: 'Category',
	            width: .25,
	            dataIndex: 'Category'
	        }, {
	            header: 'Description',
	            width: .60,
	            dataIndex: 'Description'
	        }]
	    });
	  var keyWindowConfig = {
			  title : 'Key Mappings for DBLite',
			  id : 'key_mappings_window',
			  width : 550,
			  height : 400,
			  layout : 'fit',
			  modal : true,
			  stateful : true,
			  autoScroll: false,
			  resizable: false,
			  onEsc: function(){},
			  items : [{
				  xtype: 'panel',
				  layout : 'fit',
				  border: false,
				  frame : false,
				  items: listView
			  }],
			  buttons : [{
				  text: 'Close',
				  handler: function() {
				  Ext.getCmp('key_mappings_window').close();
			  	}
			  }]
	  };
	  return new Ext.Window(keyWindowConfig);
  },

  // Shows the registration window
  showRegisterWindow: function() {
	var loginWin = Ext.getCmp('login_window');
    if(loginWin) { loginWin.close(); }
    this.win = Topmenu.createRegisterWindow();
    this.win.show();
  },

  // Create a window to display registration form
  createRegisterWindow : function() {
	var form = Topmenu.createRegistrationForm();
    var registerWindowConfig = {
      title : 'User Registration',
      id : 'register_window',
      width : 320,
      height : 'auto',
      resizable : false,
      autoScroll : true,
      layout : 'form',
      modal : true,
      plain : true,
      stateful : true,
      onEsc: function(){},
      items : [form]
    };

    return new Ext.Window(registerWindowConfig);
  },

  // show login window

  showLoginWindow : function() {
	  this.win = Topmenu.createLoginWindow();
      this.win.show();
  },
  // Create a window to display login form
  createLoginWindow : function() {
    var loginWindowConfig = {
		      title : 'User Login',
		      id : 'login_window',
		      width : 300,
		      height : 225,
		      resizable : false,
		      autoScroll : true,
		      layout : 'border',
		      modal : true,
		      plain : true,
		      stateful : true,
		      onEsc: function(){},
		      items : [{
				        id : 'login_form',
				        region : 'center',
				        xtype : 'panel',
				        layout : 'fit',
				        border: false,
				        items : [ Topmenu.createLoginForm() ]
				      }],
		      buttonAlign: 'left',
		      buttons : [{
		        xtype : 'panel',
		        bodyStyle : 'border: none;',
		        autoEl : {
		          html : "<a style='text-decoration: none;' href='javascript:void(0);'>Forgot Password</a>",
		          onclick : 'Topmenu.showResetPassword()'
		        }
		      }, '->', {
		        xtype: 'panel',
		        bodyStyle : 'border: none;',
		        autoEl: {
		          html: '<a style="text-decoration: none;" href="javascript:void(0);">Register</a>',
		          onclick: 'Topmenu.showRegisterWindow()'
		        }
		      } ]
    };

    return new Ext.Window(loginWindowConfig);
  },

  // Create a window to display profile form
  createProfileWindow : function(username) {
    var profileWindowConfig = {
      title: 'Settings',
      id : 'profile_window',
      width : 300,
      height : 350,
      resizable : false,
      autoScroll : true,
      layout : 'border',
      modal : true,
      plain : true,
      stateful : true,
      onEsc: function() {},
      items : [{
        id : 'profile_panel',
        region : 'center',
        xtype : 'panel',
        layout : 'fit',
        border: false,
        items : [ Topmenu.createProfilePanel() ]
      }]
    };

    return new Ext.Window(profileWindowConfig);
  },

  createResetPasswordWindow : function() {
    var resetWindowConfig = {
      title : 'Reset Password',
      id : 'reset_window',
      width : 300,
      height : 120,
      resizable : true,
      autoScroll : true,
      layout : 'border',
      modal : true,
      plain : true,
      stateful : true,
      items : [{
        id : 'reset_form',
        region : 'center',
        xtype : 'panel',
        layout : 'fit',
        border: false,
        items : [ Topmenu.resetPasswordFields() ]
      }]
    };

    Dblite.showWindow(resetWindowConfig);
  },

  showResetPassword : function() {
    Ext.getCmp('login_window').close();
    Topmenu.createResetPasswordWindow();
  },

  resetPasswordFields : function() {
    var items = [{
      fieldLabel : 'Enter email id',
      name : 'reset_email',
      allowBlank : false,
      style : {
        marginBottom : '10px'
      }
    }];

    var buttons = [{
		      text : 'Reset',
		      handler : Topmenu.resetPassword
		    }, {
		      text : 'Cancel',
		      handler : function() {
		        Ext.getCmp('reset_window').close();
		      }
            }];

    return new Ext.FormPanel({
      bodyStyle : 'padding:5px 5px 0',
      id : 'reset-form',
      frame : true,
      border: false,
      labelWidth : 100,
      defaultType : 'textfield',
      defaults : {
        width : 150,
        listeners : {
          specialkey : function(field, e) {
            if (e.getKey() == e.ENTER) {
              Topmenu.resetPassword();
            }
          }
        }
      },
      items : items,
      buttons : buttons
    });
  },

  resetPassword : function() {
    var formValues = Ext.getCmp('reset-form').getForm().getValues();
    Server.sendCommand('user.reset_user_password', {
    	reset_password : formValues.reset_email},
        function(data) {
    		if(data.success) {
                Dbl.Utils.showInfoMsg(Messages.getMsg('reset_password_success'), 'reset-form');
            } else {
                Dbl.Utils.showErrorMsg(data.msg, 'reset-form');
            }
        }, function(data) {
              var errorMsg = data.msg ? data.msg : data;
              Dbl.Utils.showErrorMsg(errorMsg, 'reset-form');
        });
  },

  // Create the login form
  createLoginForm : function() {
    var items = [{
		      fieldLabel : 'Username',
		      name : 'username',
		      ref : '../../defaultButton',
		      allowBlank : false,
		      style : {
		        marginBottom : '10px'
		      }
    		}, {
		      fieldLabel : 'Password',
		      name : 'password',
		      allowBlank : false,
		      inputType : 'password',
		      style :
		      {
		        marginBottom : '10px'
		      }
    		}, {
		      xtype : 'checkbox',
		      boxLabel : 'Remember Me',
		      name : 'remember_me',
		      inputValue : 1,
		      checked: true
		    }/*, {
		      xtype : 'panel',
		      isFormField : true,
		      style : {
		        marginTop : '10px'
		      },
		      autoEl : {
		        html : "<a href='javascript:void(0);'>Forgot password</a>",
		        onclick : 'Topmenu.showResetPassword()'
		      }
		    }*/];

    var buttons = [{
		      id : 'dblite_form_login',
		      text : 'Login',
		      handler : Topmenu.loginUser
		    }, {
		      text : 'Continue as Guest',
		      handler : Topmenu.continueGuestUser
		    }];

    return new Ext.FormPanel({
      bodyStyle : 'padding:5px 5px 0',
      id : 'login-form',
      frame : true,
      border: false,
      labelWidth : 100,
      defaultType : 'textfield',
      defaults : {
        width : 150,
        listeners : {
          specialkey : function(field, e) {
            if (e.getKey() == e.ENTER) {
              Topmenu.loginUser();
            }
          }
        }
      },
      items : items,
      buttons : buttons
    });
  },

  // Create the profile panel
  createProfilePanel : function(username) {
    return new Ext.TabPanel({
      //bodyStyle : 'padding: 0; border: none;',
      id : 'profile-form',
      border : false,
      activeTab : 0,
      //margins : '0 2 0 0',
      tabPosition : 'top',
      // items : [
      // Topmenu.changePasswordForm(),
      // Topmenu.changeEmailForm(),
      // Topmenu.changeUsernameForm()
      // ]
      items : [ Topmenu.accountDataForm() ]
    });
  },

  accountDataForm : function() {
    var items = [/*{
	         xtype: 'textfield',
	         fieldLabel: 'Username',
	         id: 'accountData_username',
	         style: 'margin-bottom: 20px',
	         value: Topmenu.user.user_name,
	         disabled: true
        }, */ {
        	 autoEl : {
             	tag : 'hr'
             }
        }, {
	          xtype : 'textfield',
	          fieldLabel : 'Email',
	          id : 'accountData_email',
	          value : Topmenu.user.email_id,
	          allowBlank : false,
	          validateOnBlur : true
        }, {
	  		  xtype: 'textfield',
	  		  fieldLabel: 'Re-type',
	  		  id: 'accountData_confEmail',
	  		  autoEl:{ tag: 'hr'},
	  	      style: 'margin-bottom: 20px',
	  	      allowBlank: false
  	  	}, {
	          xtype : 'textfield',
	          inputType : 'password',
	          fieldLabel : 'Password',
	          id : 'accountData_password',
	          emptyText : 'Password'
        }, {
	          xtype : 'textfield',
	          inputType : 'password',
	          fieldLabel : 'Re-type',
	          id : 'accountData_confPassword',
	          emptyText : 'password',
	          style : 'margin-bottom: 20px'
        }, {
	          xtype : 'textfield',
	          fieldLabel: 'Current password',
	          inputType : 'password',
	          id : 'accountData_oldPassword',
	          disabled: true,
	          allowBlank : false,
	          emptyText : 'password'
        }, {
    	    xtype: 'tbtext',
    	    text: '<b>current password</b> is required for the changes to take effect',
    	    style: 'text-align: left; margin-bottom: 10px; margin-left: 105px;'
    	}];

    var buttons = [{
		      text : 'Update',
		      id: 'accountUpdate_btn',
		      disabled: true,
		      handler : Topmenu.updateAccountData
	    	}, {
		      text : 'Cancel',
		      handler : function() {
		        Ext.getCmp('profile_window').close();
		      }
            }];

    return new Ext.FormPanel({
      id : 'accountData_form',
      title : 'Account',
      border : false,
      items : items,
      frame : true,
      defaults: {
    	width: 155
      },
      monitorValid : true, // to turn on the validation listener loop
  	  trackResetOnLoad: true, // to 'reset' the isDirty condition after loading a new record
  	  listeners: {
	  	clientvalidation: function(form){
		  	if (form.getForm().isDirty()){
		  		 Ext.getCmp('accountUpdate_btn').enable();
		  		 Ext.getCmp('accountData_oldPassword').enable();
		  	} else {
		  		 Ext.getCmp('accountUpdate_btn').disable();
		  		 Ext.getCmp('accountData_oldPassword').disable();
		  	}
	  	},
	  	delay: 0
  	  },
      buttons : buttons
    });
  },

  updateAccountData : function() {
    var params = {};
    var username = Ext.getCmp('accountData_username');
    var email = Ext.getCmp('accountData_email');
    var confEmail = Ext.getCmp('accountData_confEmail');
    var password = Ext.getCmp('accountData_password');
    var confPassword = Ext.getCmp('accountData_confPassword');
    var oldPassword = Ext.getCmp('accountData_oldPassword');

    if (!email.isDirty() && !confEmail.isDirty()
    		&& !password.isDirty() && !confPassword.isDirty()) {
        return;
    }

    if (oldPassword.getValue() == '') {
      Dbl.Utils.showErrorMsg(Messages.getMsg('current_password_required'));
      return;
    }

    if((email.isDirty() || confEmail.isDirty())
  		  && !(email.getValue() == '' && confEmail.getValue() == '')) {
  	    params.newemail = email.getValue();
  	    params.confnewemail = confEmail.getValue();
  	}

    if ((password.isDirty() || confPassword.isDirty())
        && !(password.getValue() == '' && confPassword.getValue() == '')) {
      params.newpassword = password.getValue();
      params.confnewpass = confPassword.getValue();
    }

    params.oldPassword = oldPassword.getValue();

    Server.sendCommand('user.change_userdata', params, function(data) {
      if (data.success) {
        Ext.getCmp('profile_window').close();
        Dbl.Utils.showInfoMsg(Messages.getMsg('account_update_success'));
        Topmenu.updateUserData(function() {});
        // Topmenu.init();
      } else if (!data.success) {
        Dbl.Utils.showErrorMsg(data.msg);
      }
    }, function(data) {
      var errorMsg = data.msg ? data.msg : data;
      Dbl.Utils.showErrorMsg(errorMsg);
    });
  },

  // create the change password form
  changePasswordForm : function() {
    var items = [{
      fieldLabel : 'New password',
      width : 150,
      name : 'new_pwd',
      ref : '../../defaultButton',
      allowBlank : false,
      inputType : 'password',
      style : {
        marginBottom : '10px'
      }
    }, {
      fieldLabel : 'Confirm password',
      name : 'new_repwd',
      allowBlank : false,
      inputType : 'password',
      style : {
        marginBottom : '10px'
      }
    }];

    var buttons = [{
      id : 'pwd_change',
      text : 'Change',
      handler : Topmenu.changePassword
    }, {
      text : 'Cancel',
      handler : function() {
        Ext.getCmp('profile_window').close();
      }
    }];
    return new Ext.FormPanel({
      bodyStyle : 'padding:5px 5px 0',
      title : 'Change Password',
      id : 'changepwd-form',
      defaultType : 'textfield',
      defaults : {
        width : 150,
        listeners : {
          specialkey : function(field, e) {
            if (e.getKey() == e.ENTER) {
              Topmenu.changePassword();
            }
          }
        }
      },
      items : items,
      buttons : buttons
    });
  },

  // create the change Email form
  changeEmailForm : function() {
    var items = [{
      fieldLabel : 'New email',
      name : 'new_email',
      ref : '../../defaultButton',
      allowBlank : false,
      style : {
        marginBottom : '10px'
      }
    }, {
      fieldLabel : 'Confirm email',
      name : 'new_reemail',
      allowBlank : false,
      style : {
        marginBottom : '10px'
      }
    }];

    var buttons = [{
      id : 'email_change',
      text : 'Change',
      handler : Topmenu.changeEmail
    }, {
      text : 'Cancel',
      handler : function() {
        Ext.getCmp('profile_window').close();
      }
    }];

    return new Ext.FormPanel({
      bodyStyle : 'padding:5px 5px 0',
      title : 'Change email',
      id : 'changeemail-form',
      defaultType : 'textfield',
      defaults : {
        width : 150,
        listeners : {
          specialkey : function(field, e) {
            if (e.getKey() == e.ENTER) {
              Topmenu.changeEmail();
            }
          }
        }
      },
      items : items,
      buttons : buttons
    });
  },

  // create the change Username form
  changeUsernameForm : function() {
    var items = [{
      fieldLabel : 'New username',
      name : 'new_username',
      ref : '../../defaultButton',
      allowBlank : false,
      style : {
        marginBottom : '10px'
      }
    }, {
      fieldLabel : 'Confirm username',
      name : 'new_reusername',
      allowBlank : false,
      style : {
        marginBottom : '10px'
      }
    }];

    var buttons = [{
      id : 'username_change',
      text : 'Change',
      handler : Topmenu.changeUsername
    }, {
      text : 'Cancel',
      handler : function() {
        Ext.getCmp('profile_window').close();
      }
    }];

    return new Ext.FormPanel({
      bodyStyle : 'padding:5px 5px 0',
      title : 'Change username',
      id : 'changeusername-form',
      defaultType : 'textfield',
      defaults : {
        width : 150,
        listeners : {
          specialkey : function(field, e) {
            if (e.getKey() == e.ENTER) {
              Topmenu.changeUsername();
            }
          }
        }
      },
      items : items,
      buttons : buttons
    });
  },

  // Submit the user login form
  loginUser : function() {
    var fields = Ext.getCmp('login-form').getForm().getFieldValues();
    Server.sendCommand('user.login_user', {
      username : fields.username,
      password : fields.password,
      remember_me : fields.remember_me
    }, function(data) {
    	if(data.success) {
    	      Ext.getCmp('login_window').close();
    	      window.onbeforeunload = null;
    	      window.location.reload();
    	} else {
    		Dbl.Utils.showErrorMsg(data.msg, 'login-form');
    	}

    }, function(data) {
        var errorMsg = data.msg ? data.msg : data;
        Dbl.Utils.showErrorMsg(errorMsg, 'register-form');
    });
  },
  // Create the registration form
  createRegistrationForm : function() {
    var items = [{
      fieldLabel : 'Username',
      name : 'register_username',
      allowBlank : false,
      ref : '../../defaultButton',
      style : {
        marginBottom : '10px'
      }
    }, {
      fieldLabel : 'Password',
      name : 'register_password',
      allowBlank : false,
      inputType : 'password',
      style : {
        marginBottom : '10px'
      }
    }, {
      fieldLabel : 'Re-enter password',
      name : 'register_confpass',
      allowBlank : false,
      inputType : 'password',
      style : {
        marginBottom : '10px'
      }
    }, {
      fieldLabel : 'Email',
      name : 'register_email',
      allowBlank : false,
      vtype : 'email'
    }];

    if (Dbl.UserActivity.getValue('connection')) {
      var checkbox = {
        xtype : 'checkbox',
        checked : true,
        name : 'register_saveToAccount',
        boxLabel : 'Save current details to your new account'
      };

      items.push(checkbox);
    }

    var buttons = [{
      id : 'dblite_form_register',
      text : 'Register',
      handler : Topmenu.registerUser
    }, {
      text : 'Cancel',
      handler : function() {
        Ext.getCmp('register_window').close();
      }
    }];

    return new Ext.FormPanel({
      bodyStyle : 'padding:5px 5px 0',
      id : 'register-form',
      frame : true,
      labelWidth : 120,
      defaultType : 'textfield',
      defaults : {
        width : 150,
        listeners : {
          specialkey : function(field, e) {
            if (e.getKey() == e.ENTER) {
              Topmenu.registerUser();
            }
          }
        }
      },
      items : items,
      buttons : buttons
    });
  },

  // Submit user registration form
  registerUser : function() {
    var fields = Ext.getCmp('register-form').getForm().getFieldValues();
    Server.sendCommand('user.register_user', {
      username : fields.register_username,
      password : fields.register_password,
      confpass : fields.register_confpass,
      email : fields.register_email,
      saveToAccount : fields.register_saveToAccount
    }, function(data) {
      if (data.success) {
        window.onbeforeunload = null;
        window.location.reload();
      } else if (!data.success) {
        Dbl.Utils.showErrorMsg(data.msg, 'register-form');
      }
    }, function(data) {
      var errorMsg = data.msg ? data.msg : data;
      Dbl.Utils.showErrorMsg(errorMsg, 'register-form');
    });
  },

  // Change Password functionality
  changePassword : function() {
    var fields = Ext.getCmp('changepwd-form').getForm().getFieldValues();
    Server.sendCommand('user.change_userdata', {
      newpassword : fields.new_pwd,
      confnewpass : fields.new_repwd
    }, function(data) {
      if (data.success) {
        Ext.getCmp('changepwd-form').getForm().reset();
        Ext.getCmp('profile_window').close();
        Dbl.Utils.showInfoMsg(Messages.getMsg('change_password_success'), 'changepwd-form');

      } else if (!data.success) {
        Dbl.Utils.showErrorMsg(data.msg, 'changepwd-form');
      }
    }, function(data) {
      var errorMsg = data.msg ? data.msg : data;
      Dbl.Utils.showErrorMsg(errorMsg, 'changepwd-form');
    });
  },

  // Change Email functionality
  changeEmail : function() {
    var fields = Ext.getCmp('changeemail-form').getForm().getFieldValues();
    Server.sendCommand('user.change_userdata', {
      newemail : fields.new_email,
      confnewemail : fields.new_reemail
    }, function(data) {
      if (data.success) {
        Ext.getCmp('changeemail-form').getForm().reset();
        Ext.getCmp('profile_window').close();
        Dbl.Utils.showInfoMsg(Messages.getmsg('change_email_success'), 'changeemail-form');

      } else if (!data.success) {
        Dbl.Utils.showErrorMsg(data.msg, 'changeemail-form');
      }
    }, function(data) {
      var errorMsg = data.msg ? data.msg : data;
      Dbl.Utils.showErrorMsg(errorMsg, 'changeemail-form');
    });
  },

  // Change Username functionality
  changeUsername : function() {
    var fields = Ext.getCmp('changeusername-form').getForm().getFieldValues();
    Server.sendCommand('user.change_userdata', {
      newusername : fields.new_username,
      confnewusername : fields.new_reusername
    }, function(data) {
      if (data.success) {
        Ext.getCmp('changeusername-form').getForm().reset();
        Ext.getCmp('profile_window').close();
        Topmenu.changeUserControls(data.username);
        Dbl.Utils.showInfoMsg(Messages.getMsg('change_username_success'), 'changeusername-form');

      } else if (!data.success) {
        Dbl.Utils.showErrorMsg(data.msg, 'changeusername-form');
      }
    }, function(data) {
      var errorMsg = data.msg ? data.msg : data;
      Dbl.Utils.showErrorMsg(errorMsg, 'changeusername-form');
    });
  },

  // Logout user and destroy all the corresponding sessions
  logoutUser : function() {
    Server.sendCommand('user.logout_user', {}, function(data) {
        window.location.reload();
      });
  },

  // setting session as guest user
  continueGuestUser : function() {
	  Server.sendCommand('user.continue_guest_user', {guest_user: 'guest_user'}, function(data) {
		  Dblite.guest_user = true;
		  Ext.getCmp('login_window').close();
		  if(Ext.getCmp('prompt_register_login')) {
			  Ext.getCmp('prompt_register_login').close();
		  }

		  Ext.getCmp('destroy_current_session').show();
		  Ext.getCmp('destroy_session_separator').show();
		  Topmenu.userControls.doLayout();
	  });
  },

  destroyCurrentSession: function() {
    Server.sendCommand('user.destroy_session', {}, function(data) {
        window.location.reload();
      });
  },

  enableExecuteButton: function() {
    var btn = Ext.getCmp('topmenu_execute_btn');
    btn.setIconClass('execute_query');
    btn.setTooltip('Execute query (F8)');
    btn.enable();
  },

  disableExecuteButton: function() {
	var btn = Ext.getCmp('topmenu_execute_btn');
	btn.setIconClass('loading_icon');
	btn.setTooltip('Executing...');
  	btn.disable();
  },

  showDbliteHelpWindow: function() {
	  window.open("http://dblite.com/features", "_blank");
	  return;
	  
	/*  
	Dblite.window = new Dbl.ContextMenuWindow({
		title : 'DBLite MySQL GUI',
		id : 'dblite_help_window',
		width : 500,
		height : 400,
		maximizable : true,
		resizable : true,
		layout : 'fit',
		modal : true,
		plain : true,
		stateful : true,
		items:[{
			xtype: 'panel',
			html: 'DBLite GUI help...'
		}],
		onEsc: function(){},
	});
	Dblite.window.show();
	*/
  }
};
