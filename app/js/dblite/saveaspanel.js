Dbl.SaveAsPanel = function(folders, closeTab, filename, foldername) {
	var folderCombo = this.getFolderList(folders, foldername);

	Dbl.SaveAsPanel.superclass.constructor.call(this, {
		id: 'editor_save_form',
		labelWidth: 80,
		bodyBorder: true,
		frame: true,
		defaults: {width: 200},
		defaultType: 'textfield',
		monitorValid: true,
		items : [{
			fieldLabel: 'File name',
			name: 'file_name',
			allowBlank: false,
			vtype: 'alphanum',
			value: filename
		}, folderCombo],

		buttons:[{
			text:'Save',
			formBind: true,
			handler: function(){
					Editor.editorSaveForm(false, closeTab);
				}
		}]
	}); 
};

Ext.extend(Dbl.SaveAsPanel, Ext.form.FormPanel, {
	getFolderList: function(folderlist, foldername) {
		return new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields: ['folder_name'],
				data: folderlist
			}),
			displayField: 'folder_name',
			typeAhead: true,
			forceSelection: false,
			selectOnFocus: true,
			mode: 'local',
			triggerAction: 'all',
			emptyText: 'Select a folder',
			fieldLabel: 'Folder name',
			name: 'folder_name',
			value: foldername
		});
	}
});