var Editor = {

	restoring: true,
	browserPanel: '',
	containerPanel : '',
	tabPanel: '',
	editorPanel: '',
	editorToolbar: '',
	editorTabCounter: 0,
	editorList: '',
	defaultSQLDelimiter: ';',

	init : function() {
		this.tabPanel =  new Ext.TabPanel({
		     region: 'center',
		     split: true,
		     activeItem: 0,
		     resizeTabs: true,
		     minTabWidth: 100,
			 border: false,
			 bodyStyle: { borderRightWidth: '1px' },
			 enableTabScroll:true,
		     items: [],
		     plugins: [new Ext.ux.TabCloseMenu({editor: this}), Ext.ux.AddTabButton],
		     createTab: function() {
				 if(Dblite.guest_user) {
					 Editor.promptToLogin();
				 } else {
					Editor.addEditor('');
				 }
			 },
		     listeners: {
			 	tabchange: this.handleEditorChange,
			 	scope: this
		     }
		});

		this.browserContainerPanel = new Ext.Panel({
			title: 'SQL Browser',
			id: 'sql_browser_panel',
			region: 'east',
			layout: 'fit',
		    width : Dbl.UserSettings.sqlBrowserWidth,
			minWidth: 200,
			maxWidth: 400,
			border: false,
			bodyStyle: { borderLeftWidth: '1px' },
			collapsible: true,
			collapsed: Dbl.UserSettings.sqlBrowserCollapsed,
			split: true,
			items: [],
		    listeners : {
		        resize : Dbl.UserActivity.pageLayout.resizeSQLBrowserPanel,
		        collapse: Dbl.UserActivity.pageLayout.collapseSQLBrowserPanel,
		        expand: Dbl.UserActivity.pageLayout.expandSQLBrowserPanel
		      }
		});

		this.containerPanel = new Ext.Panel({
			header: false,
			collapsible: true,
			region: 'center',
			margins: '0 2 0 0',
			layout: 'border',
			border: true,
			bodyStyle: { borderTopWidth: '0px' },
			items : [
				this.tabPanel,
				this.browserContainerPanel
			],
			listeners: {
			  resize: Dbl.UserActivity.pageLayout.resizeEditorPanel
			}
		});

		this.refreshBrowserPanel();
	    this.addEditor();
	},

	refreshBrowserPanel: function() {
		Server.sendCommand('editor.get_saved_queries', {scope: this},
			function(data) {
				Editor.browserContainerPanel.removeAll();
				Editor.browserPanel = new Dbl.SQLBrowserPanel(data);
				Editor.browserPanel.attachNodeEditor(Editor.browserPanel);
				Editor.browserContainerPanel.add(Editor.browserPanel);
				Editor.browserContainerPanel.doLayout();
			}
		);
	},

    addEditor: function(content) {
	    var index = ++Editor.editorTabCounter;
		Editor.addEditorPanel(index, content);
		var panel = Editor.tabPanel.findById('editor_' + index);
  		panel.saved = false;
     	panel.foldername = '';
     	panel.filename = '';
   		Editor.tabPanel.activate(panel);
   		panel.doLayout();
   },

   addEditorPanel: function(index, content) {
	   this.editorPanel = {
		    title: 'SQL<sup>*</sup>',
		    tabTip: 'SQL<sup>*</sup>',
		    id: 'editor_'+index,
   			xtype: 'uxCodeMirrorPanel',
   			parser: 'sql',
   			layout: 'fit',
   			closable: true,
   			closeAction: 'destroy',
   			sourceCode: content,
   			keys: [{
   				key: 'e',
   				alt: true,
   				handler: function() {
   					Editor.handleExecuteQuery();
   				}
   			}],
   			codeMirror: {
	  	   			height: '100%',
	  	   			width: '100%',
	  	   			clickHandler: function() { Ext.menu.MenuMgr.hideAll(); },
	  	   			saveFunction: function() { Editor.saveCurrentEditor(); },
	  	   			onChange: function() { Editor.handleEditareaChange(index); },
	  	   			executeFunction: function() {
		  	   			Topmenu.disableExecuteButton();
		  	   			Editor.handleExecuteQuery();
	  	   			},
	  		},
  	   		listeners: {
	  			beforeclose: Editor.handleBeforeEditorClose,
	  			removed: Editor.handleAfterEditorRemoved,
	  			scope: this
	  		}
	   };

	   Editor.tabPanel.add(this.editorPanel);
	   Editor.tabPanel.doLayout();
   },


	restore: function() {
		var editorTabList = Ext.decode(Dbl.UserActivity.keys['editorTabList']);
        var isInstance = editorTabList instanceof Array;

        if(!isInstance) {
			Editor.restoring = false;
			return;
		}
		else if(!editorTabList.length) {
			Editor.restoring = false;
			return;
		} else {
			Server.sendCommand('user.get_queryfiles_content', {
				editors:Dbl.UserActivity.keys['editorTabList']},
				function(data) {
					if(data.editors.length) {
						Editor.restoreSqlEditors(data.editors);
					}
				}, function(data){
					Editor.restoring = false;
					var errorMsg = data.msg ? data.msg : data;
					Dbl.Utils.showErrorMsg(errorMsg, '');
				}
			);
		}
	},

	getCurrentSql: function(editor) {
		var sqlDelimiter = Editor.defaultSQLDelimiter;
		var cursor = editor.cursorPosition();
		var cursorLine = cursor.line;

		var lineContent = editor.lineContent(cursor.line);
		var beforeText = lineContent.substring(0, cursor.character);
		var afterText = lineContent.substring(cursor.character);

		var currentLine = cursorLine;
		if(beforeText.indexOf(sqlDelimiter) >= 0) {
			beforeText = beforeText.substring(beforeText.lastIndexOf(sqlDelimiter));
		}
		else {
			do {
				currentLine = editor.prevLine(currentLine);
				if(currentLine) {
					lineContent = editor.lineContent(currentLine);
					if(lineContent) {
						if(lineContent.indexOf(sqlDelimiter) != -1) {
							lineContent = lineContent.substring(lineContent.lastIndexOf(sqlDelimiter));
							beforeText = lineContent + beforeText;
							break;
						}
						else {
							beforeText = lineContent + beforeText;
						}
					}
				}
			}while(currentLine);
		}

		currentLine = cursorLine;
		if(afterText.indexOf(sqlDelimiter) >= 0) {
			afterText = afterText.substring(0, afterText.indexOf(sqlDelimiter));
		}
		else {
			do {
				currentLine = editor.nextLine(currentLine);
				if(currentLine) {
					lineContent = editor.lineContent(currentLine);

					if(lineContent) {
						if(lineContent.indexOf(sqlDelimiter) != -1) {
							lineContent = lineContent.substring(0,lineContent.indexOf(sqlDelimiter));
							afterText = afterText + lineContent;
							break;
						}
						else {
							afterText = afterText + lineContent;
						}
					}
				}
			} while(currentLine);
		}
		return beforeText + afterText;
	},

    handleExecuteQuery: function() {
		var activeEditor = Editor.tabPanel.getActiveTab();
		var selection = activeEditor.getSelection();
		if(selection == ''){
			var editor = activeEditor.codeMirrorEditor;
			sql = Editor.getCurrentSql(editor);
	    }
	    else {
           sql = selection;
	    }

	    if((sql == '') || (sql == Editor.defaultSQLDelimiter)) {
	       	 var data = {
				hasError: true,
				msg: "No query(s)were executed. Please enter a query in the SQL editor or place the cursor inside a query.",
				sql: ""
	    	 };
	   		 Dblite.dataPanel.addNewResultTabs([data]);
	    } else {
		    Editor.executeQuery(sql);
	    }
   },

   executeQuery: function(sql) {
	   	Editor.deleteResultFiles();
		Server.sendCommand('database.execute_queries', {
			sql: sql,
			sqldelim: Editor.defaultSQLDelimiter },
			function(data) {
				Dblite.dataPanel.addNewResultTabs(data);
				var editorType = Editor.tabPanel.getActiveTab().editortype;
				if((editorType == 'view_editor')
						|| (editorType == 'procedure_editor')
							|| (editorType == 'function_editor')) {
									Explorer.explorerPanel.removeAll();
					    		    Explorer.loadExplorerData(Dbl.UserActivity.getValue('database'), Dbl.UserActivity.getValue('table'), 'table');
				}
			}, function(data){
				var errorMsg = data.msg ? data.msg : data;
				Dbl.Utils.showErrorMsg(errorMsg, '');
			}
		);
   },

   restoreEditor: function(content, file, folder) {
	    var index = ++Editor.editorTabCounter;
		Editor.addEditorPanel(index, content);
		var panel = Editor.tabPanel.findById('editor_' + index);
  		panel.saved = true;
     	panel.foldername = folder;
     	panel.filename = file;
     	panel.setTitle(file);
     	Ext.fly(panel.tabEl).child('span.x-tab-strip-text', true).qtip = file;
     	Editor.tabPanel.activate(panel);
   		panel.doLayout();
   },

   saveCurrentEditor: function(closeTab) {
/*
	   // check for restricted commands in demo version
	   	var ismatched = Dbl.Utils.checkForRestrictedCommands(sql);
	   	if(ismatched) {
				Dbl.Utils.showFeatureRestrictionMessage();
				return false;
	   	}
*/	    
	   
		var activeTab = this.tabPanel.getActiveTab();
        var filename = activeTab.filename;
        var foldername = activeTab.foldername;
		if(!filename) {
        	this.saveCurrentEditorAs(closeTab);
        }
		else {
            var editorContent = activeTab.getValue();
            Server.sendCommand('editor.save_sql_editor', {
			       sql: editorContent,
			       folder_name: foldername,
			       file_name: filename,
			       replace: 'REPLACE'},
			       function(data){
			    	   if(data.success) {
						   activeTab.setTitle(filename);
					       Ext.fly(activeTab.tabEl).child('span.x-tab-strip-text', true).qtip = filename;
						   activeTab.saved = true;
						   if(closeTab) {
							 Editor.tabPanel.remove(activeTab);
						   }
			    	   }
			       });
        }
   },

   saveCurrentEditorAs: function(closeTab) {
/*
	   // check for restricted commands in demo version
	   	var ismatched = Dbl.Utils.checkForRestrictedCommands(sql);
	   	if(ismatched) {
				Dbl.Utils.showFeatureRestrictionMessage();
				return false;
	   	}
*/
	   
/*
   		if(this.browserContainerPanel.collapsed) {
   			this.browserContainerPanel.expand();
   		}
*/
		var activeTab = this.tabPanel.getActiveTab();
        var filename = activeTab.filename;
        var foldername = activeTab.foldername;
        //if(filename) { filename = filename.replace(/\.sql/, ''); }
        var nodes = this.browserPanel.getRootNode().childNodes[0].childNodes;
        var folders = [];
        for(var i=0;i<nodes.length;i++) {
        	var node = nodes[i];
        	if(!node.leaf) {
        		folders.push([node.text]);
        	}
        }
	   var panel = new Dbl.SaveAsPanel(folders, closeTab, filename, foldername);
	   var saveWindow = new Ext.Window({
			   id: 'editor_save_window',
			   title:'Save As',
			   width: 320,
			   closable: true,
			   draggable: true,
			   resizable: false,
			   plain: true,
			   border: true,
			   stateful: true,
			   bodyBorder: true,
			   modal: true,
			   closeAction: 'destroy',
			   stateful: true,
			   items:[panel]
	   });
	   saveWindow.show();
   },

   editorSaveForm: function(replaceFlag, closeTab) {
		var activeEditor = Editor.tabPanel.getActiveTab();
        var editorContent = activeEditor.getValue();
		var fields = Ext.getCmp('editor_save_form').getForm().getFieldValues();

		Server.sendCommand('editor.save_sql_editor', {
			    sql: editorContent,
			    replace: replaceFlag ? 'REPLACE' : '',
			    file_name: fields.file_name,
			    folder_name: fields.folder_name,
			    scope: this },
				function(data) {
			    	if(data.success) {
						Ext.getCmp('editor_save_window').destroy();
						var filename = data.filename;
						var foldername = data.foldername;
						activeEditor.setTitle(filename);
				        Ext.fly(activeEditor.tabEl).child('span.x-tab-strip-text', true).qtip = filename;
						activeEditor.foldername = foldername;
						activeEditor.filename = filename;
						activeEditor.saved = true;

						// remove query editor
						if(closeTab) {
							Editor.tabPanel.remove(activeEditor);
						}

						// refresh SQL browser
						Editor.refreshBrowserPanel();

						// add to editor list content
						Editor.handleEditorChange();
			    	}
			    	else if(!data.success) {
			    		 if(data.duplicate) {
		            		var confMsg = data.msg + Messages.getMsg('replace_editor_content');
		            		Ext.Msg.confirm('Confirmation', confMsg, function(btn, text){
		            		    if (btn == 'yes'){
		            		    	Editor.editorSaveForm(true, closeTab);
		            		    }
		            		    else if (btn == 'no') {
		            				Ext.getCmp('editor_save_window').destroy();
		            		    }
		            		});
			    		 }
			    	}
			    });
   },

   handleBeforeEditorClose: function(panel) {
	   if(Dblite.guest_user) {
		   Editor.promptToLogin();
		   return false;
	   }

	    var editorContent = panel.getValue();
		if(!panel.saved && editorContent) {
	      Ext.Msg.confirm('Confirmation',
	    	  Messages.getMsg('close_editor'),
	          function(btn){
		          if(btn == 'yes') {
		              Editor.saveCurrentEditor(true);
		          }
		          if(btn == 'no') {
		        	  Editor.tabPanel.remove(panel);
		          }
	      });
	      return false;
		}
   },

   handleAfterEditorRemoved: function(panel) {
	   if(!Editor.restoring && !Editor.tabPanel.items.length){
			Editor.editorTabCounter = 0;
			Editor.addEditor();
			Editor.browserPanel.getSelectionModel().clearSelections();
		}
	   Editor.handleEditorChange();
   },

   handleEditareaChange: function(index) {
	   var editorType = Editor.tabPanel.getActiveTab().editortype;
		if((editorType == 'view_editor')
				|| (editorType == 'procedure_editor')
					|| (editorType == 'function_editor')) {
						return;
		}


 	   var editedTab = Editor.tabPanel.findById('editor_' + index);
 	   var tabTitle= editedTab.title;
 	   if(editedTab.saved) {
 		  //tabTitle = tabTitle + '<sub>*</sub>';
 		  //editedTab.setTitle(tabTitle);
		  //Ext.fly(editedTab.tabEl).child('span.x-tab-strip-text', true).qtip = tabTitle;
		 
 		   // auto saving editor
 		   this.saveCurrentEditor(false);
 	   }
 	   editedTab.saved = false;
   },

   promptBeforeLeave: function(prompt) {
	   Editor.deleteResultFiles();
	   
	   if(!Editor.tabPanel.items.length) {
		   return;
	   }

       for(var i=0; i<Editor.tabPanel.items.length; i++) {
    	   var editor = Editor.tabPanel.items.items[i];
    	   
    	   if(!editor.saved) {
    		   var editorContent = editor.getValue();
    		   if(!editorContent) {
    			   continue;
    		   }
    		   
    		   return Messages.getMsg('prompt_before_leave');

    		   /*    		   
    		   var random_str = Dbl.Utils.password(3);
    		   Server.sendCommand('editor.save_sql_editor', {
    			    sql: editorContent,
    			    replace: '',
    			    file_name: 'Untitled_'+random_str+ i,
    			    folder_name: '',
    			    scope: this },
    				function(data) {
    			    	if(data.success) {
    				        editor.saved = true;
    			    		editor.setTitle(data.filename);
    				        editor.foldername = data.foldername;
    				        editor.filename = data.filename;
    				        Editor.tabPanel.activate(editor);
    				        Editor.handleEditorChange();
    				        Editor.tabPanel.remove(editor);
    			    	}
    			    	else if(!data.success) {
    			    		console.log(data);
    			    	}
    			    });
    		    */    		   
    		}
       }
	   
	   // return Messages.getMsg('prompt_before_leave');
       // http://code.google.com/p/chromium/issues/detail?id=36559
   },

   handleEditorChange: function(tabPanel, panel) {

	    if(!Editor.tabPanel.items.length)return;

		var activeTab = Editor.tabPanel.getActiveTab();
		activeTab.setHeight(activeTab.getHeight() + 1);
		Editor.editorList = [];

		for(var i=0; i<Editor.tabPanel.items.length; i++) {
    		var editor = Editor.tabPanel.items.items[i];
    		if(editor.saved) {
        		var editorId = editor.id;
        		var obj = {	sqlfile:   editor.filename,
	        				sqlfolder: editor.foldername,
	        				isactive:  (activeTab.id == editorId) ? true : false
	        		     };
        		Editor.editorList.push(obj);
    		}
        }

		Dbl.UserActivity.editorsPanel.tabChanged();

		if(Editor.browserPanel) {
		    var nodeid = (activeTab.foldername) ? ('file=' + activeTab.foldername + '.' + activeTab.filename) : ('file=' + activeTab.filename);
			var node = Editor.browserPanel.getNodeById(nodeid);
			if(node) {
				//node.fireEvent('click', node);
				Editor.browserPanel.getSelectionModel().select(node);
			}
		}
	},

	restoreSqlEditors: function(editors) {
		Editor.tabPanel.removeAll();
		var activeEditor = '';
		for(var i=0; i<editors.length; i++){
			var editor = editors[i];
	    	var content = (!editor.content || (editor.content == 'null')) ? '' : editor.content;
			Editor.restoreEditor(content, editor.sqlfile, editor.sqlfolder);
	    	if(editor.isactive) {
	    		var activeEditor = Editor.tabPanel.getActiveTab();
	    	}
		}
		Editor.restoring = false;
		if(activeEditor) {
		    Editor.tabPanel.activate(activeEditor);
		    var nodeid = (activeEditor.foldername) ? ('file=' + activeEditor.foldername + '.' + activeEditor.filename) : ('file=' + activeEditor.filename);
		    var node = Editor.browserPanel.getNodeById(nodeid);
			if(node) {
				node.select();
			}
		}
	},

	deleteEditorConfirmation: function() {
		var activeTab = Editor.tabPanel.getActiveTab();
        var filename = activeTab.filename;
        var foldername = activeTab.foldername;
        var editor = this;
	    if(filename && Editor.tabPanel.items.length) {
	      Ext.Msg.confirm('Confirmation',
	    	 Messages.getMsg('delete_editor', ['editor']),
	    	 function(btn) {
	          if(btn == 'yes'){
	        	  var nodeid = (foldername) ? ('file=' + foldername + '.' + filename) : ('file=' + filename);
	              Editor.deleteQueryEditor(activeTab, filename, foldername, nodeid);
	          }
	      	});
	    }
	},

	deleteQueryEditor: function(editor, file, folder, nodeid) {
		Server.sendCommand('editor.delete_query_editor', {
			file: file,
			folder: folder},
			function(data) {
				if(data.success) {
					// remove the current editor
					if(editor) {
					   Editor.tabPanel.remove(editor);
					   if(editor.id != Editor.tabPanel.getActiveTab().id){
						   Editor.handleEditorChange();
					   }
					}

                    // remove all the opened editor of this folder
					var files = data.files;
					if(files){
					   for(var i=0; i<files.length; i++){
						   var file = files[i];
						   for(var j=0; j<Editor.tabPanel.items.length; j++) {
							   var editorTab = Editor.tabPanel.items.items[j];
					    	   if((editorTab.foldername == folder) && (editorTab.filename == file)) {
					    		   Editor.tabPanel.remove(editorTab);
					    		}
					        }
					   }
					   Editor.handleEditorChange();
					}

					// get the node & remove from query tree
					var treeNode = Editor.browserPanel.getNodeById(nodeid);
					treeNode.remove();
				}
		});
	},

	browseSavedEditor: function() {
		if(this.browserPanel.isVisible()) {
			return;
		}
		else {
			this.browserPanel.show();
			this.browserPanel.expand(true);
		}
	},

	showSQLDelimiterWindow: function() {
		Dblite.window = new Dbl.ContextMenuWindow({
			title : 'Set Delimiter',
			id : 'sql_dlimiter_window',
			width : 350,
			height : 120,
			resizable : false,
			layout : 'fit',
			modal : true,
			plain : true,
			stateful : true,
			onEsc: function(){},
			items : [ new Dbl.SQLDelimiterPanel()]
		});
		Dblite.window.show();
	},


	promptToLogin: function() {
		this.win = new Dbl.ContextMenuWindow({
		      title : 'Hi Guest...',
		      id : 'prompt_user_login',
		      width : 300,
		      height : 150,
		      resizable : false,
		      layout : 'border',
		      modal : true,
		      plain : true,
		      stateful : true,
		      onEsc: function() {},
		      items : [{
			        region : 'center',
			        layout : 'fit',
			        html: 'You must be logged in to do that.',
			        frame: true,
			        border: false,
			        padding: 5,
			        buttons : [{
			        	text: 'Login',
			        	handler: function() {
			    		  Ext.getCmp("prompt_user_login").close();
				      	  Topmenu.showLoginWindow();
				        }
			        }, {
			        	xtype: 'tbtext',
			        	text: 'or'
			        }, {
			        	text: 'Register',
			        	handler: function() {
			    		  Ext.getCmp("prompt_user_login").close();
			    		  Topmenu.showRegisterWindow();
			        	}
			        }, /*{
	    		        xtype : 'panel',
	    		        bodyStyle : 'border: none;',
	    		        autoEl : {
	    		          html : "<a style='text-decoration: none;' href='javascript:void(0);'>Login</a>",
	    		          onclick : 'Topmenu.showLoginWindow()'
	    		        }
			        }, {
	    		        xtype: 'panel',
	    		        bodyStyle : 'border: none;',
	    		        autoEl: {
	    		          html: '<a style="text-decoration: none;" href="javascript:void(0);">Register</a>',
	    		          onclick: 'Topmenu.showRegisterWindow()'
	    		        }
	    		   }*/]
		      }]
		});

		this.win.show();
	},

	deleteResultFiles: function(filename) {
		Server.sendCommand('server.delete_result_files', {
			file: filename },
			function(data) {
			}, function(data){
			}
		);
	},

	executeCurrentQuery: function() {
		Topmenu.disableExecuteButton();
		Editor.handleExecuteQuery();
	},

	saveSQLEditor: function() {
		this.saveCurrentEditor(false);
	}
};
