/**
 * @constructor
 */
var LongTextEditPanel = function(data) {
	var data = Ext.util.Format.htmlDecode(data);
	var items = [{
				xtype: 'checkbox',
				boxLabel: 'Set NULL',
				name: 'set_as_null',
				checked: (data == '(NULL)')? true : false,
				listeners: {
					check: function(c, checked) {
						Ext.getCmp('long_text').disable();
						if(!checked) {
							Ext.getCmp('long_text').enable();
						}
					}
				},
				hidden: (Dbl.UserActivity.getValue('table_type') == 'table') ? false : true 
			},
	        {
				xtype:'textarea',
				id: 'long_text',
		        width: 260,
		        height: 250,
		        disabled: (data == '(NULL)')? true : false,
		        name:'long_text',
		        value: data
        	}];

	LongTextEditPanel.superclass.constructor.call(this, {
			id : 'long_text_edit_form',
			frame : true,
			layout: 'form',
			items : items,
			labelWidth: 0.1,
			border: false
	});
};

Ext.extend(LongTextEditPanel, Ext.form.FormPanel, {
});

