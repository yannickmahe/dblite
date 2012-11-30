
Dbl.ServerWindow =  function() {
	var serverGrid = new Dbl.ServerGrid();
	var serverAddForm = new Dbl.ServerAddForm();

	Dbl.ServerWindow.superclass.constructor.call(this, {
        title: 'Manage Connections',
        id: 'add-server-win',
        width: 470,
        minWidth: 470,
        height: 340,
        minHeight: 340,
        resizable: true,
        plain:true,
        modal: true,
        stateful: true,
        y: 100,
        autoScroll: true,
        closeAction: 'hide',
        defaultButton: 'conn_id',
		layout: 'border',
		buttonAlign: 'left',
		buttons: serverAddForm.getButtons(),
        items: [{
        		region: 'west',
        		title: 'Saved Connections',
        		id: 'server-grid',
        		width: 180,
        		minWidth: 180,
        		border: false,
        		split: true,
        		layout: 'fit',
        		items: [serverGrid]

        	}, {
   				region: 'center',
        		title: 'Add New Connection',
				id: 'server-panel',
        		edit: false,
        		border: false,
				layout: 'fit',
				xtype: 'panel',
				items: [serverAddForm]
		}],
			
        listeners: {
			afterrender: this.handleAfterRender,
			beforehide: this.handleBeforeHide,
			scope: this
		}
    });
};


Ext.extend (Dbl.ServerWindow, Ext.Window,{
	handleAfterRender: function() {
		Ext.getCmp('conn_id').focus(true);
	},
	
	handleBeforeHide: function() {
		return Ext.getCmp("server-form").closeServerWindow();
	}
});

