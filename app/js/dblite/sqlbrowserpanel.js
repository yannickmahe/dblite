Dbl.SQLBrowserPanel = function(data) {
	Dbl.SQLBrowserPanel.superclass.constructor.call(this, {
		autoScroll: true,
		animate: true,
		animCollapse: true,
		rootVisible: false,
		useArrows: true,
		border: false,
		root: new Ext.tree.AsyncTreeNode({
		 	id: 'root',
		 	expanded : true,
		 	children : data
		}),
		
		keys: [{
				key: Ext.EventObject.DELETE,
				handler: this.handleNodeDeletion,
				stopEvent: true,
				scope: this
			}, {
				key: Ext.EventObject.F2,
				handler: this.handleNodeRename,
				stopEvent: true,
				scope: this
		}],
			
		loader: new Ext.tree.TreeLoader({
				dataUrl: ' ',
				preloadChildren: true,
				listeners: {
					beforeload: function(treeLoader, node) {
				        this.baseParams.category = node.attributes.category;
				        this.baseParams.parent = node.parentNode.attributes.text;
				        Server.sendCommand('editor.get_saved_queries', {
			        		category: node.attributes.category, 
			        		node: node.text,
			        		parent:  node.parentNode.attributes.text},
			        		function(data) {
			        			node.appendChild(data);
			        			return false;
							}, function(data) {
								var errorMsg = data.msg ? data.msg : data;
								Dbl.Utils.showErrorMsg(errorMsg, '');
							}); 
				    }
				}
		 }),
		 
		 listeners: {
			click: this.onClick,
			contextmenu: this.onClick,
			contextmenu: this.onContextMenu,
			scope: this
		 }
	});
};



Ext.extend (Dbl.SQLBrowserPanel, Ext.tree.TreePanel, {
	selectedQueryFolder: '',
	selectedQueryFile: '',
	selectedNodeType: '',
	queryTreePanelEditor: '',
	
	onClick : function(node, e) {
	   	this.selectedQueryFolder = node.attributes.folder_name;
	   	this.selectedQueryFile = node.attributes.file_name;
	    this.selectedNodeType = node.attributes.category;
	   	if(node.attributes.category == 'file') {
	    	this.createEditorFromSavedQuery();
	    }
	},
	
	onContextMenu: function(node, e) {
		if((node.attributes.category != 'file') 
				&& (node.attributes.category != 'folder')) {
					return;
		}

        if(this.menu) {
            this.menu.removeAll();
        }
		this.getSelectionModel().select(node);
		var nodeId = node.attributes.id;
		var menu_id = '';
		var menu_items  = [];
		
		if(node.attributes.category == 'folder') {
			menu_id = nodeId + '-folder-node-ctx';
			menu_items = [{
							itemId: 'delete_folder_' + nodeId,
							text: 'Delete Folder...',
							iconCls: 'folder_delete',
							listeners: {
								click: this.handleNodeDeletion,
								scope: this
							}
						}];
		}
		else if(node.attributes.category == 'file') {
			menu_id = nodeId + '-file-node-ctx';
			menu_items = [{
							itemId: 'rename_file_' + nodeId,
							text: 'Rename File...',
							iconCls: 'page_rename',
							listeners: {
								click: this.handleNodeRename,
								scope: this
							}
						}, '-', {
							itemId: 'delete_file_' + nodeId,
							text: 'Delete File...',
							iconCls: 'page_delete',
							listeners: {
								click: this.handleNodeDeletion,
								scope: this
							}
						}];
		}
	
		this.menu = new Ext.menu.Menu({
			id: menu_id,
			items: menu_items,
			defaults: {
				scale: 'small',
				width: '100%',
				iconAlign: 'left'
			}
		});
	
		this.menu.showAt(e.getXY());
	},
	
	handleNodeDeletion: function() {
		var node = this.getSelectionModel().getSelectedNode();
		var panel = this;
		Ext.MessageBox.confirm('Confirmation', 
			Messages.getMsg('delete_editor', [node.attributes.category]), 
			function(btn) {
			if(btn == 'yes') {
				if(node.attributes.category == 'folder') {
					panel.handleFolderDeletion(node);
				}
				if(node.attributes.category == 'file') {
					panel.handleFileDeletion(node);
				}
			}
		});
	},
	
	handleFolderDeletion: function(node) {
		node = (!node)? this.getSelectionModel().getSelectedNode() : node;
		var nodeId = node.attributes.id;
		var folder = node.attributes.folder_name;

		// Delete file & close editor
		Editor.deleteQueryEditor('', '', folder, nodeId);
	},
	
	handleFileDeletion: function(node) {
		node = (!node) ? this.getSelectionModel().getSelectedNode() : node;
		var nodeId = node.attributes.id;
		var folder = node.attributes.folder_name;
		var file   = node.attributes.file_name;
		var openedTab = '';

       	// Check if this file is already opened
    	for(var i=0; i<Editor.tabPanel.items.length; i++) {
    		var editorTab = Editor.tabPanel.items.items[i];
    		if((editorTab.foldername == folder) && (editorTab.filename == file)) {
    			openedTab = editorTab;
    		}
        }

		// Delete file & close editor
    	Editor.deleteQueryEditor(openedTab, file, folder, nodeId);
	},
	
	handleNodeRename: function() {
		var node = this.getSelectionModel().getSelectedNode();
		if(node.attributes.category == 'file') {
			this.renameFile(node);
		}
	},
	
	renameFile: function(node) {
		this.queryTreePanelEditor.editNode = node;
		this.queryTreePanelEditor.startEdit(node.ui.textNode);
	},
	
	createEditorFromSavedQuery: function() {
		// check editors if this file is already opened
    	for(var i=0; i<Editor.tabPanel.items.length; i++) {
    		var editor = Editor.tabPanel.items.items[i];
    		if((editor.foldername == this.selectedQueryFolder)
    			&& (editor.filename == this.selectedQueryFile)) {
    			Editor.tabPanel.activate(editor);
    		    return;
    		}
        }
    	
    	// create editor from this file
    	Server.sendCommand('editor.get_query_file_content', {
   			   category: 'file',
   			   folder: this.selectedQueryFolder,
   			   file: this.selectedQueryFile,
   			   scope: this},
   		       function(data){
   		    	   if(data.success) {
                       var content = data.content;
                       if(!content) content = '';
   		    		   Editor.restoreEditor(data.content, this.selectedQueryFile, this.selectedQueryFolder);
   		    	   }
   		    	   else if(!data.success) {
   		    		   	Dbl.Utils.showErrorMsg(data.msg, '');
   		    	   }
   		       }, function(data){
			    	var errorMsg = data.msg ? data.msg : data;
			    	Dbl.Utils.showErrorMsg(errorMsg, '');
   		       });
	},
	
	attachNodeEditor: function(TreePanel) {
		TreePanel.queryTreePanelEditor = new Ext.tree.TreeEditor(
				Editor.browserPanel, {}, {
					allowBlank:false,
					blankText:'File name is required',
					selectOnFocus:true,
					ignoreNoChange: true,
					cancelOnEsc: false,
					completeOnEnter: true,
					listeners: {
						beforecomplete: this.handleAfterEdit,
						scope: this
					}
				});
	}, 
	
	handleAfterEdit: function(editor, newName, oldName) {
		if(newName.length < 1) {
			return false;
		}
		
		var folder = editor.editNode.attributes.folder_name;
		Server.sendCommand('editor.rename_query_file', {
			folder: folder, 
			oldFilename: oldName, 
			newFilename: newName,
			scope: this},
			function(data) {
				var activeEditor = Editor.tabPanel.getActiveTab();
				activeEditor.filename = newName;
				activeEditor.setTitle(newName);
				editor.editNode.attributes.file_name = newName;
				Ext.fly(activeEditor.tabEl).child('span.x-tab-strip-text', true).qtip = newName;
				
				var nodeId = (editor.editNode.attributes.folder_name) ? ('file=' + editor.editNode.attributes.folder_name + '.' + nodeId) :  ('file=' + newName);
				editor.editNode.id = nodeId;

				Editor.handleEditorChange();
			});
	}
});
	
